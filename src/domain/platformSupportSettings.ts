import { assertSupabaseConfigured } from '../lib/supabase'

export type PlatformSupportSettingsRow = {
  id: number
  telegram_url: string
  updated_at: string
}

export async function fetchPlatformSupportSettings(): Promise<PlatformSupportSettingsRow | null> {
  const client = assertSupabaseConfigured()
  const { data, error } = await client.from('platform_support_settings').select('*').eq('id', 1).maybeSingle()
  if (error) throw error
  return (data ?? null) as PlatformSupportSettingsRow | null
}

export async function adminUpsertPlatformSupportSettings(input: { telegram_url: string }): Promise<void> {
  const client = assertSupabaseConfigured()
  const { error } = await client.from('platform_support_settings').upsert(
    {
      id: 1,
      telegram_url: input.telegram_url.trim(),
    },
    { onConflict: 'id' },
  )
  if (error) throw error
}

export function resolveTelegramSupportUrl(row: PlatformSupportSettingsRow | null | undefined): string | null {
  const url = row?.telegram_url?.trim()
  return url || null
}
