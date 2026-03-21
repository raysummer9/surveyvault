/** Member support inbox (dashboard & help). */
export const SUPPORT_EMAIL = 'taskpulse182@gmail.com' as const

export function supportMailto(subject?: string): string {
  const base = `mailto:${SUPPORT_EMAIL}`
  if (!subject?.trim()) return base
  return `${base}?subject=${encodeURIComponent(subject.trim())}`
}
