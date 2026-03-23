import { assertSupabaseConfigured } from '../lib/supabase'

/** Same allowlist as route guards — extra filter if an admin row is missing from DB `admin_users`. */
const envAdminEmailSet = new Set(
  (import.meta.env.VITE_ADMIN_EMAILS ?? '')
    .split(',')
    .map((e: string) => e.trim().toLowerCase())
    .filter(Boolean),
)

export type AdminMemberDirectoryRow = {
  id: string
  email: string | null
  first_name: string | null
  last_name: string | null
  onboarding_status: string
  workforce_approved: boolean | null
  workforce_joined: boolean | null
  workforce_payment_confirmed: boolean | null
  account_suspended: boolean
  suspended_at: string | null
  suspended_reason: string | null
  created_at: string
  completed_surveys: number
  /** Sum of rewards from every completed survey (all payout statuses). */
  total_earned_cents: number
  withdrawable_cents: number
  /** Withdrawal requests awaiting admin review. */
  pending_payout_cents: number
  /** Withdrawal requests approved by admin. */
  total_payout_cents: number
  /** Highest verified workforce membership tier (payment category), if any. */
  membership_tier_id: string | null
  membership_tier_slug: string | null
  membership_tier_name: string | null
  membership_tier_badge: string | null
  total_count: number
}

export async function adminListMemberDirectory(options: {
  limit?: number
  offset?: number
  search?: string
}): Promise<AdminMemberDirectoryRow[]> {
  const client = assertSupabaseConfigured()
  const { data, error } = await client.rpc('admin_list_member_directory', {
    p_limit: options.limit ?? 50,
    p_offset: options.offset ?? 0,
    p_search: options.search?.trim() || null,
  })
  if (error) throw error
  const rows = (data ?? []) as Record<string, unknown>[]
  const mapped = rows.map((r) => ({
    id: String(r.id),
    email: (r.email as string | null) ?? null,
    first_name: (r.first_name as string | null) ?? null,
    last_name: (r.last_name as string | null) ?? null,
    onboarding_status: String(r.onboarding_status ?? ''),
    workforce_approved: r.workforce_approved as boolean | null,
    workforce_joined: r.workforce_joined as boolean | null,
    workforce_payment_confirmed: r.workforce_payment_confirmed as boolean | null,
    account_suspended: Boolean(r.account_suspended),
    suspended_at: (r.suspended_at as string | null) ?? null,
    suspended_reason: (r.suspended_reason as string | null) ?? null,
    created_at: String(r.created_at ?? ''),
    completed_surveys: Number(r.completed_surveys ?? 0),
    total_earned_cents: Number(r.total_earned_cents ?? r.lifetime_paid_cents ?? 0),
    withdrawable_cents: Number(r.withdrawable_cents ?? 0),
    pending_payout_cents: Number(r.pending_payout_cents ?? r.pending_withdrawal_cents ?? 0),
    total_payout_cents: Number(r.total_payout_cents ?? 0),
    membership_tier_id: (r.membership_tier_id as string | null) ?? null,
    membership_tier_slug: (r.membership_tier_slug as string | null) ?? null,
    membership_tier_name: (r.membership_tier_name as string | null) ?? null,
    membership_tier_badge: (r.membership_tier_badge as string | null) ?? null,
    total_count: Number(r.total_count ?? 0),
  }))
  return mapped.filter((row) => {
    const e = row.email?.trim().toLowerCase()
    if (!e) return true
    return !envAdminEmailSet.has(e)
  })
}

export async function adminSetUserSuspended(
  userId: string,
  suspended: boolean,
  reason: string | null,
): Promise<void> {
  const client = assertSupabaseConfigured()
  const { error } = await client
    .from('user_profiles')
    .update({
      account_suspended: suspended,
      suspended_reason: suspended ? reason?.trim() || null : null,
    })
    .eq('id', userId)
  if (error) throw error
}
