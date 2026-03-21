import { assertSupabaseConfigured } from '../lib/supabase'

/** Single-row table `platform_payment_settings` — deposit addresses shown on workforce crypto payment. */
export type PlatformPaymentSettingsRow = {
  id: number
  btc_address: string
  eth_address: string
  usdt_address: string
  payment_window_minutes: number
  updated_at: string
}

/** Members and admins: load active deposit addresses and payment window length. */
export async function fetchPlatformPaymentSettings(): Promise<PlatformPaymentSettingsRow | null> {
  const client = assertSupabaseConfigured()
  const { data, error } = await client.from('platform_payment_settings').select('*').eq('id', 1).maybeSingle()

  if (error) throw error
  if (!data) return null
  return data as PlatformPaymentSettingsRow
}

export type PlatformPaymentSettingsUpdate = {
  btc_address: string
  eth_address: string
  usdt_address: string
  payment_window_minutes: number
}

/** Admin: create or replace the singleton row (id = 1). */
export async function adminUpsertPlatformPaymentSettings(input: PlatformPaymentSettingsUpdate): Promise<void> {
  const client = assertSupabaseConfigured()
  const { error } = await client.from('platform_payment_settings').upsert(
    {
      id: 1,
      btc_address: input.btc_address.trim(),
      eth_address: input.eth_address.trim(),
      usdt_address: input.usdt_address.trim(),
      payment_window_minutes: input.payment_window_minutes,
    },
    { onConflict: 'id' },
  )
  if (error) throw error
}
