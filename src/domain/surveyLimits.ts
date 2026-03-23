/** Must match `enforce_survey_daily_limit` in migration `20260410_survey_daily_limit.sql`. */
export const DAILY_SURVEY_COMPLETION_LIMIT = 8

/** Rolling window aligned with SQL `interval '24 hours'` (client-side estimates only; DB enforces). */
export const DAILY_SURVEY_WINDOW_MS = 24 * 60 * 60 * 1000

/** Same text as RAISE EXCEPTION in DB — used for display and loose client-side detection. */
export const DAILY_SURVEY_LIMIT_ERROR_MESSAGE =
  'You can complete up to 8 surveys per 24 hours. Please try again later.'

export function isDailySurveyLimitError(message: string): boolean {
  const m = message.toLowerCase()
  return (
    m.includes('8 surveys per 24 hours') ||
    m.includes('p0001') ||
    m.includes('enforce_survey_daily_limit')
  )
}
