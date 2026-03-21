/** Human-readable reference for support / admin (stored on workforce_payments). */
export function generateReviewReferenceId(): string {
  const year = new Date().getFullYear()
  const part = Math.random().toString(36).slice(2, 10).toUpperCase()
  return `SV-REV-${year}-${part}`
}

export type WorkforcePaymentRow = {
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
  status: 'pending' | 'verified' | 'rejected'
  admin_rejection_reason: string | null
  review_reference_id: string | null
  created_at: string
  updated_at: string
}
