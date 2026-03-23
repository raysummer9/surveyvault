import { assertSupabaseConfigured } from '../lib/supabase'
import type { OnboardingSubmission, UserProfile } from '../features/auth/types'
import { fetchMemberVerifiedMembershipTier, type MembershipTier } from './paymentCategory'
import { fetchMemberMaxTierSort, fetchMemberSurveyStats } from './surveyApi'
import type { MemberSurveyStats } from './surveyTypes'
import {
  fetchApprovedWithdrawalsTotalCents,
  fetchPendingWithdrawalRequestsTotalCents,
  type WithdrawalRequestRow,
} from './withdrawalApi'

/** Same formula as `withdrawable_balance_cents` RPC, without auth.uid() restriction (for admin viewing any member). */
function computeWithdrawableCents(paidSurveyCents: number, withdrawals: WithdrawalRequestRow[]): number {
  const lockedCents = withdrawals
    .filter((w) => w.status === 'pending' || w.status === 'approved')
    .reduce((sum, w) => sum + w.amount_cents, 0)
  return Math.max(0, paidSurveyCents - lockedCents)
}

export type AdminWorkforcePaymentRow = {
  id: string
  user_id: string
  tier_id: string
  amount_btc: string
  amount_usd: number
  currency_sent: string
  tx_hash: string | null
  amount_sent: string | null
  wallet_address: string | null
  notes: string | null
  status: string
  created_at: string
  updated_at: string
}

export type AdminUserSurveyCompletionRow = {
  id: string
  survey_id: string
  survey_title: string
  survey_slug: string
  reward_cents: number
  payout_status: string
  paid_at: string | null
  created_at: string
}

export type AdminUserDetail = {
  userId: string
  profile: UserProfile
  submission: OnboardingSubmission | null
  surveyStats: MemberSurveyStats
  surveyCompletions: AdminUserSurveyCompletionRow[]
  withdrawableCents: number
  pendingWithdrawalCents: number
  totalPayoutCents: number
  withdrawals: WithdrawalRequestRow[]
  workforcePayments: AdminWorkforcePaymentRow[]
  verifiedMembershipTier: MembershipTier | null
  memberMaxTierSort: number
}

function mapProfile(raw: Record<string, unknown>): UserProfile {
  return raw as unknown as UserProfile
}

/**
 * Full member snapshot for admin: profile, onboarding/KYC, wallet, surveys, withdrawals, workforce payments.
 */
export async function fetchAdminUserDetail(userId: string): Promise<AdminUserDetail | null> {
  const client = assertSupabaseConfigured()
  const { data: profileRow, error: profileError } = await client
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (profileError) throw profileError
  if (!profileRow) return null

  const profile = mapProfile(profileRow as Record<string, unknown>)

  const [
    submissionRes,
    surveyStats,
    pendingWithdrawalCents,
    totalPayoutCents,
    withdrawalsRes,
    wpRes,
    verifiedMembershipTier,
    memberMaxTierSort,
    completionsRes,
  ] = await Promise.all([
    client.from('onboarding_submissions').select('*').eq('user_id', userId).maybeSingle(),
    fetchMemberSurveyStats(userId),
    fetchPendingWithdrawalRequestsTotalCents(userId),
    fetchApprovedWithdrawalsTotalCents(userId),
    client.from('withdrawal_requests').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(50),
    client
      .from('workforce_payments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(40),
    fetchMemberVerifiedMembershipTier(userId),
    fetchMemberMaxTierSort(userId),
    client
      .from('survey_completions')
      .select('id, survey_id, reward_cents, payout_status, paid_at, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(80),
  ])

  if (submissionRes.error) throw submissionRes.error
  if (withdrawalsRes.error) throw withdrawalsRes.error
  if (wpRes.error) throw wpRes.error
  if (completionsRes.error) throw completionsRes.error

  const submission = (submissionRes.data ?? null) as OnboardingSubmission | null

  const rawCompletions = (completionsRes.data ?? []) as {
    id: string
    survey_id: string
    reward_cents: number
    payout_status: string
    paid_at: string | null
    created_at: string
  }[]

  const surveyIds = [...new Set(rawCompletions.map((c) => c.survey_id))]
  let titleBySurveyId = new Map<string, { title: string; slug: string }>()
  if (surveyIds.length > 0) {
    const { data: surveyRows, error: surveyErr } = await client
      .from('surveys')
      .select('id, title, slug')
      .in('id', surveyIds)
    if (surveyErr) throw surveyErr
    for (const s of surveyRows ?? []) {
      const row = s as { id: string; title: string; slug: string }
      titleBySurveyId.set(row.id, { title: row.title, slug: row.slug })
    }
  }

  const surveyCompletions: AdminUserSurveyCompletionRow[] = rawCompletions.map((c) => {
    const meta = titleBySurveyId.get(c.survey_id)
    return {
      id: c.id,
      survey_id: c.survey_id,
      survey_title: meta?.title ?? 'Survey',
      survey_slug: meta?.slug ?? '',
      reward_cents: c.reward_cents,
      payout_status: c.payout_status,
      paid_at: c.paid_at,
      created_at: c.created_at,
    }
  })

  const withdrawals = (withdrawalsRes.data ?? []) as WithdrawalRequestRow[]
  const withdrawableCents = computeWithdrawableCents(surveyStats.paidCents, withdrawals)

  return {
    userId,
    profile,
    submission,
    surveyStats,
    surveyCompletions,
    withdrawableCents,
    pendingWithdrawalCents,
    totalPayoutCents,
    withdrawals,
    workforcePayments: (wpRes.data ?? []) as AdminWorkforcePaymentRow[],
    verifiedMembershipTier,
    memberMaxTierSort,
  }
}
