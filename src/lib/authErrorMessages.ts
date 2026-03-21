/**
 * Map Supabase Auth API errors to clearer copy for sign-up / sign-in UIs.
 */
export function formatAuthErrorMessage(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  const raw = err instanceof Error ? err.message : String(err)

  if (/email rate limit exceeded|rate limit exceeded|over_email_send_rate_limit/i.test(raw)) {
    return 'Too many emails were sent from this app recently (Supabase limit). Wait 30–60 minutes and try again, or ask the project owner to configure custom SMTP or adjust Auth rate limits in the Supabase dashboard.'
  }

  if (/user already registered|already been registered|already exists/i.test(raw)) {
    return 'An account with this email already exists. Try signing in or use “Forgot password”.'
  }

  return raw.trim() || fallback
}
