import { assertSupabaseConfigured } from '../lib/supabase'

export type WithdrawalMethod = 'crypto' | 'bank'
export type WithdrawalStatus = 'pending' | 'approved' | 'rejected'

export type WithdrawalRequestRow = {
  id: string
  user_id: string
  amount_cents: number
  method: WithdrawalMethod
  status: WithdrawalStatus
  crypto_network: string | null
  crypto_wallet_address: string | null
  bank_account_holder: string | null
  bank_name: string | null
  bank_account_number: string | null
  bank_routing_or_iban: string | null
  bank_country: string | null
  member_note: string | null
  admin_rejection_reason: string | null
  reviewed_at: string | null
  created_at: string
  updated_at: string
}

export async function fetchWithdrawableBalanceCents(userId: string): Promise<number> {
  const client = assertSupabaseConfigured()
  const { data, error } = await client.rpc('withdrawable_balance_cents', { p_user_id: userId })
  if (error) throw error
  const n = data as number | string | null
  if (n == null) return 0
  return typeof n === 'string' ? parseInt(n, 10) : Number(n)
}

/** Sum of withdrawal request amounts still awaiting admin review (`status = pending`). “Pending payout”. */
export async function fetchPendingWithdrawalRequestsTotalCents(userId: string): Promise<number> {
  const client = assertSupabaseConfigured()
  const { data, error } = await client
    .from('withdrawal_requests')
    .select('amount_cents')
    .eq('user_id', userId)
    .eq('status', 'pending')

  if (error) throw error
  let sum = 0
  for (const row of data ?? []) {
    sum += (row as { amount_cents: number }).amount_cents
  }
  return sum
}

/** Sum of withdrawal requests approved by admin (`status = approved`). “Total payout” sent/accepted. */
export async function fetchApprovedWithdrawalsTotalCents(userId: string): Promise<number> {
  const client = assertSupabaseConfigured()
  const { data, error } = await client
    .from('withdrawal_requests')
    .select('amount_cents')
    .eq('user_id', userId)
    .eq('status', 'approved')

  if (error) throw error
  let sum = 0
  for (const row of data ?? []) {
    sum += (row as { amount_cents: number }).amount_cents
  }
  return sum
}

export type CreateWithdrawalInput = {
  userId: string
  amountCents: number
  method: WithdrawalMethod
  cryptoNetwork?: string
  cryptoWalletAddress?: string
  bankAccountHolder?: string
  bankName?: string
  bankAccountNumber?: string
  bankRoutingOrIban?: string
  bankCountry?: string
  memberNote?: string
}

export async function createWithdrawalRequest(input: CreateWithdrawalInput): Promise<void> {
  const client = assertSupabaseConfigured()
  const { error } = await client.from('withdrawal_requests').insert({
    user_id: input.userId,
    amount_cents: input.amountCents,
    method: input.method,
    crypto_network: input.method === 'crypto' ? input.cryptoNetwork ?? null : null,
    crypto_wallet_address: input.method === 'crypto' ? input.cryptoWalletAddress ?? null : null,
    bank_account_holder: input.method === 'bank' ? input.bankAccountHolder ?? null : null,
    bank_name: input.method === 'bank' ? input.bankName ?? null : null,
    bank_account_number: input.method === 'bank' ? input.bankAccountNumber ?? null : null,
    bank_routing_or_iban: input.method === 'bank' ? input.bankRoutingOrIban ?? null : null,
    bank_country: input.method === 'bank' ? input.bankCountry ?? null : null,
    member_note: input.memberNote?.trim() || null,
    status: 'pending',
  })
  if (error) throw error
}

export async function fetchMyWithdrawals(userId: string): Promise<WithdrawalRequestRow[]> {
  const client = assertSupabaseConfigured()
  const { data, error } = await client
    .from('withdrawal_requests')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as WithdrawalRequestRow[]
}

export type AdminWithdrawalRow = WithdrawalRequestRow & { member_email: string | null }

export async function adminListWithdrawalRequests(): Promise<AdminWithdrawalRow[]> {
  const client = assertSupabaseConfigured()
  const { data: rows, error } = await client
    .from('withdrawal_requests')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  const list = rows ?? []
  const userIds = [...new Set(list.map((r) => (r as { user_id: string }).user_id))]

  let emailById = new Map<string, string | null>()
  if (userIds.length > 0) {
    const { data: profiles } = await client.from('user_profiles').select('id, email').in('id', userIds)
    emailById = new Map((profiles ?? []).map((p) => [(p as { id: string }).id, (p as { email: string | null }).email]))
  }

  return list.map((r) => ({
    ...(r as WithdrawalRequestRow),
    member_email: emailById.get((r as { user_id: string }).user_id) ?? null,
  }))
}

export async function adminApproveWithdrawal(id: string): Promise<void> {
  const client = assertSupabaseConfigured()
  const { error } = await client
    .from('withdrawal_requests')
    .update({
      status: 'approved',
      reviewed_at: new Date().toISOString(),
      admin_rejection_reason: null,
    })
    .eq('id', id)

  if (error) throw error
}

export async function adminRejectWithdrawal(id: string, reason: string): Promise<void> {
  const client = assertSupabaseConfigured()
  const { error } = await client
    .from('withdrawal_requests')
    .update({
      status: 'rejected',
      reviewed_at: new Date().toISOString(),
      admin_rejection_reason: reason.trim() || 'Rejected',
    })
    .eq('id', id)

  if (error) throw error
}

export const MIN_WITHDRAWAL_CENTS = 50_000
