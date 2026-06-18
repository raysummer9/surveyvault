/** Member support inbox (dashboard & help). */
export const SUPPORT_EMAIL = 'taskpulse182@gmail.com' as const

/** Official Telegram support (Task Pluse Support) — fallback when DB settings are unavailable. */
export const DEFAULT_TELEGRAM_SUPPORT_URL = 'https://t.me/taskpluse' as const

/** @deprecated Prefer `useTelegramSupportUrl()` for the live admin-configured link. */
export const TELEGRAM_SUPPORT_URL = DEFAULT_TELEGRAM_SUPPORT_URL

export function supportMailto(subject?: string): string {
  const base = `mailto:${SUPPORT_EMAIL}`
  if (!subject?.trim()) return base
  return `${base}?subject=${encodeURIComponent(subject.trim())}`
}
