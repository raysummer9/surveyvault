/** Member support inbox (dashboard & help). */
export const SUPPORT_EMAIL = 'taskpulse182@gmail.com' as const

/** Default Telegram URL for new databases (migration seed only). Members see nothing until admin sets a URL. */
export const DEFAULT_TELEGRAM_SUPPORT_URL = 'https://t.me/taskpluse' as const

/** @deprecated Use `useTelegramSupportUrl()` — returns null when Telegram is disabled. */
export const TELEGRAM_SUPPORT_URL = DEFAULT_TELEGRAM_SUPPORT_URL

export function supportMailto(subject?: string): string {
  const base = `mailto:${SUPPORT_EMAIL}`
  if (!subject?.trim()) return base
  return `${base}?subject=${encodeURIComponent(subject.trim())}`
}
