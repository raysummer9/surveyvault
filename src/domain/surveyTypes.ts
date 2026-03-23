/** Fixed catalog — must match DB check constraint on `surveys.survey_category` */
export const SURVEY_CATEGORIES = [
  'Technology',
  'Lifestyle',
  'Finance',
  'Health',
  'Food & Beverages',
  'Travel',
  'Education',
  'Environment',
  'Media',
  'Automotive',
] as const

export type SurveyCategory = (typeof SURVEY_CATEGORIES)[number]

export const DEFAULT_SURVEY_CATEGORY: SurveyCategory = 'Technology'

/** Enforced in DB (`surveys_questions_min_count`) and admin survey form */
export const MIN_SURVEY_QUESTIONS = 30

export function isSurveyCategory(value: string): value is SurveyCategory {
  return (SURVEY_CATEGORIES as readonly string[]).includes(value)
}

export function normalizeSurveyCategory(raw: unknown): SurveyCategory {
  if (typeof raw === 'string' && isSurveyCategory(raw)) return raw
  return DEFAULT_SURVEY_CATEGORY
}

export type SurveyQuestion =
  | {
      id: string
      type: 'choice'
      label: string
      options: string[]
      optional?: boolean
    }
  | {
      id: string
      type: 'text'
      label: string
      optional?: boolean
    }

export type SurveyRow = {
  id: string
  slug: string
  title: string
  description: string | null
  reward_cents: number
  estimated_minutes: number
  questions: SurveyQuestion[]
  is_active: boolean
  /** Content category (Technology, Lifestyle, …) */
  survey_category: SurveyCategory
  /** Minimum membership tier (payment category) required; higher member tiers also qualify */
  payment_category_id: string | null
  created_at: string
}

export type SurveyCompletionRow = {
  id: string
  user_id: string
  survey_id: string
  reward_cents: number
  answers: Record<string, string>
  payout_status: 'pending' | 'paid'
  paid_at: string | null
  created_at: string
}

export type MemberSurveyStats = {
  completedCount: number
  /** Survey reward still awaiting admin “mark paid” (payout_status = pending). */
  pendingCents: number
  /** Survey rewards marked paid (available toward withdrawal, subject to WD locks). */
  paidCents: number
  /** Sum of all completed survey rewards (pending + paid) — “total earned” from surveys. */
  totalEarnedCents: number
}
