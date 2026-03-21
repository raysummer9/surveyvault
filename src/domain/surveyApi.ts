import { assertSupabaseConfigured } from '../lib/supabase'
import {
  MIN_SURVEY_QUESTIONS,
  normalizeSurveyCategory,
  type MemberSurveyStats,
  type SurveyCategory,
  type SurveyQuestion,
  type SurveyRow,
} from './surveyTypes'

function parseQuestions(raw: unknown): SurveyQuestion[] {
  if (!Array.isArray(raw)) return []
  return raw as SurveyQuestion[]
}

/** Highest payment_categories.sort_order from verified workforce payments, or -1 if none. */
export async function fetchMemberMaxTierSort(userId: string): Promise<number> {
  const client = assertSupabaseConfigured()
  const { data, error } = await client.rpc('member_max_tier_sort', { p_user_id: userId })
  if (error) throw error
  if (data == null) return -1
  return typeof data === 'number' ? data : Number(data)
}

/**
 * True if the member's max tier sort is >= the survey's required tier (matches `member_can_access_survey`).
 */
export function isSurveyEligibleForMember(
  memberMaxSort: number,
  survey: SurveyRow,
  requiredTierSortByCategoryId: Map<string, number>,
): boolean {
  if (!survey.payment_category_id) return false
  const req = requiredTierSortByCategoryId.get(survey.payment_category_id)
  if (req === undefined) return false
  return memberMaxSort >= req
}

export async function fetchActiveSurveys(): Promise<SurveyRow[]> {
  const client = assertSupabaseConfigured()
  const { data, error } = await client
    .from('surveys')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data ?? []).map((row) => ({
    ...(row as SurveyRow),
    questions: parseQuestions((row as { questions: unknown }).questions),
    survey_category: normalizeSurveyCategory((row as { survey_category?: unknown }).survey_category),
  }))
}

export async function fetchSurveyById(surveyId: string): Promise<SurveyRow | null> {
  const client = assertSupabaseConfigured()
  const { data, error } = await client.from('surveys').select('*').eq('id', surveyId).maybeSingle()

  if (error) throw error
  if (!data) return null
  return {
    ...(data as SurveyRow),
    questions: parseQuestions((data as { questions: unknown }).questions),
    survey_category: normalizeSurveyCategory((data as { survey_category?: unknown }).survey_category),
  }
}

/** Survey ids the current user has already completed */
export async function fetchCompletedSurveyIdsForUser(userId: string): Promise<Set<string>> {
  const client = assertSupabaseConfigured()
  const { data, error } = await client.from('survey_completions').select('survey_id').eq('user_id', userId)

  if (error) throw error
  return new Set((data ?? []).map((r) => (r as { survey_id: string }).survey_id))
}

export async function submitSurveyCompletion(input: {
  userId: string
  surveyId: string
  rewardCents: number
  answers: Record<string, string>
}): Promise<void> {
  const client = assertSupabaseConfigured()
  const { error } = await client.from('survey_completions').insert({
    user_id: input.userId,
    survey_id: input.surveyId,
    reward_cents: input.rewardCents,
    answers: input.answers,
    payout_status: 'pending',
  })

  if (error) throw error
}

export async function fetchMemberSurveyStats(userId: string): Promise<MemberSurveyStats> {
  const client = assertSupabaseConfigured()
  const { data, error } = await client
    .from('survey_completions')
    .select('reward_cents, payout_status')
    .eq('user_id', userId)

  if (error) throw error

  let pendingCents = 0
  let paidCents = 0
  const rows = data ?? []
  for (const row of rows) {
    const r = row as { reward_cents: number; payout_status: string }
    if (r.payout_status === 'pending') pendingCents += r.reward_cents
    if (r.payout_status === 'paid') paidCents += r.reward_cents
  }

  return {
    completedCount: rows.length,
    pendingCents,
    paidCents,
  }
}

/** Sum of survey completion rewards since `sinceIso` (inclusive), all payout statuses. */
export async function fetchMemberSurveyEarningsSince(userId: string, sinceIso: string): Promise<number> {
  const client = assertSupabaseConfigured()
  const { data, error } = await client
    .from('survey_completions')
    .select('reward_cents')
    .eq('user_id', userId)
    .gte('created_at', sinceIso)

  if (error) throw error
  let sum = 0
  for (const row of data ?? []) {
    sum += (row as { reward_cents: number }).reward_cents
  }
  return sum
}

export function formatCents(cents: number): string {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(cents / 100)
}

function rowToSurveyRow(raw: unknown): SurveyRow {
  const r = raw as { questions?: unknown; payment_category_id?: string | null; survey_category?: unknown }
  return {
    ...(raw as SurveyRow),
    questions: parseQuestions(r.questions),
    payment_category_id: r.payment_category_id ?? null,
    survey_category: normalizeSurveyCategory(r.survey_category),
  }
}

/** Survey catalog row for admin with how many users completed it */
export type AdminSurveyListRow = SurveyRow & {
  completionCount: number
  paymentCategoryName: string | null
}

export type AdminSurveyListActiveFilter = 'all' | 'active' | 'inactive'

export type AdminSurveyListPaymentFilter = 'all' | 'unassigned' | string

async function fetchAdminCompletionCountsBySurveyIds(surveyIds: string[]): Promise<Map<string, number>> {
  const map = new Map<string, number>()
  for (const id of surveyIds) map.set(id, 0)
  if (surveyIds.length === 0) return map

  const client = assertSupabaseConfigured()
  const { data, error } = await client.rpc('admin_survey_completion_counts', {
    p_survey_ids: surveyIds,
  })

  if (error) {
    console.warn('[surveyApi] admin_survey_completion_counts RPC failed, using fallback:', error.message)
    const { data: rows, error: e2 } = await client
      .from('survey_completions')
      .select('survey_id')
      .in('survey_id', surveyIds)
    if (e2) throw e2
    for (const row of rows ?? []) {
      const sid = (row as { survey_id: string }).survey_id
      map.set(sid, (map.get(sid) ?? 0) + 1)
    }
    return map
  }

  for (const row of (data ?? []) as { survey_id: string; completion_count: number | string }[]) {
    map.set(row.survey_id, Number(row.completion_count))
  }
  return map
}

function escapeIlikePattern(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_')
}

export type AdminSurveyListResult = {
  rows: AdminSurveyListRow[]
  totalCount: number
}

/**
 * Paginated admin survey list with filters. Completion counts use RPC `admin_survey_completion_counts`
 * when available (see migration 20260402_admin_survey_completion_counts.sql).
 */
export async function adminListSurveysPaginated(params: {
  page: number
  pageSize: number
  search?: string
  surveyCategory?: SurveyCategory | 'all'
  isActive?: AdminSurveyListActiveFilter
  paymentCategoryId?: AdminSurveyListPaymentFilter
}): Promise<AdminSurveyListResult> {
  const client = assertSupabaseConfigured()
  const page = Math.max(1, params.page)
  const pageSize = Math.min(100, Math.max(1, params.pageSize))
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = client
    .from('surveys')
    .select('*, payment_categories ( name, slug )', { count: 'exact' })

  const cat = params.surveyCategory ?? 'all'
  if (cat !== 'all') {
    query = query.eq('survey_category', cat)
  }

  const active = params.isActive ?? 'all'
  if (active === 'active') query = query.eq('is_active', true)
  else if (active === 'inactive') query = query.eq('is_active', false)

  const pay = params.paymentCategoryId ?? 'all'
  if (pay === 'unassigned') {
    query = query.is('payment_category_id', null)
  } else if (pay !== 'all') {
    query = query.eq('payment_category_id', pay)
  }

  const term = params.search?.trim()
  if (term) {
    const p = `%${escapeIlikePattern(term)}%`
    query = query.or(`title.ilike.${p},slug.ilike.${p}`)
  }

  const { data: surveys, error, count } = await query
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) throw error

  const totalCount = count ?? 0
  const rawList = surveys ?? []
  const ids = rawList.map((raw) => String((raw as { id: string }).id))
  const counts = await fetchAdminCompletionCountsBySurveyIds(ids)

  const rows: AdminSurveyListRow[] = rawList.map((raw) => {
    const r = raw as Record<string, unknown>
    const pc = r.payment_categories as { name?: string } | null | undefined
    const { payment_categories: _pc, ...rest } = r
    const s = rowToSurveyRow(rest)
    return {
      ...s,
      completionCount: counts.get(s.id) ?? 0,
      paymentCategoryName: pc?.name ?? null,
    }
  })

  return { rows, totalCount }
}

export type AdminSurveyUpsertInput = {
  slug: string
  title: string
  description: string | null
  reward_cents: number
  estimated_minutes: number
  questions: SurveyQuestion[]
  is_active: boolean
  /** Minimum membership tier (payment category) members must be subscribed at or above */
  payment_category_id: string
  survey_category: SurveyCategory
}

function assertMinSurveyQuestions(questions: SurveyQuestion[]) {
  if (questions.length < MIN_SURVEY_QUESTIONS) {
    throw new Error(`Surveys must include at least ${MIN_SURVEY_QUESTIONS} questions (got ${questions.length}).`)
  }
}

export async function adminCreateSurvey(input: AdminSurveyUpsertInput): Promise<SurveyRow> {
  assertMinSurveyQuestions(input.questions)
  const client = assertSupabaseConfigured()
  const { data, error } = await client
    .from('surveys')
    .insert({
      slug: input.slug,
      title: input.title,
      description: input.description,
      reward_cents: input.reward_cents,
      estimated_minutes: input.estimated_minutes,
      questions: input.questions,
      is_active: input.is_active,
      payment_category_id: input.payment_category_id,
      survey_category: input.survey_category,
    })
    .select()
    .single()

  if (error) throw error
  return rowToSurveyRow(data)
}

export async function adminUpdateSurvey(id: string, input: Partial<AdminSurveyUpsertInput>): Promise<void> {
  if (input.questions !== undefined) assertMinSurveyQuestions(input.questions)
  const client = assertSupabaseConfigured()
  const patch: Record<string, unknown> = {}
  if (input.title !== undefined) patch.title = input.title
  if (input.description !== undefined) patch.description = input.description
  if (input.reward_cents !== undefined) patch.reward_cents = input.reward_cents
  if (input.estimated_minutes !== undefined) patch.estimated_minutes = input.estimated_minutes
  if (input.questions !== undefined) patch.questions = input.questions
  if (input.is_active !== undefined) patch.is_active = input.is_active
  if (input.payment_category_id !== undefined) patch.payment_category_id = input.payment_category_id
  if (input.survey_category !== undefined) patch.survey_category = input.survey_category

  const { error } = await client.from('surveys').update(patch).eq('id', id)
  if (error) throw error
}

export async function adminDeleteSurvey(id: string): Promise<void> {
  const client = assertSupabaseConfigured()
  const { error } = await client.from('surveys').delete().eq('id', id)
  if (error) throw error
}
