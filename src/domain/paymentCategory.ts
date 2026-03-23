import { assertSupabaseConfigured } from '../lib/supabase'

export type TierButtonColor = 'grey' | 'orange' | 'blue'

export interface MembershipTier {
  id: string
  slug: string | null
  name: string
  btcAmount: string
  usdAmount: number
  payoutLimit: string
  features: { text: string; included: boolean }[]
  badge?: string
  buttonColor: TierButtonColor
  sortOrder: number
  isActive: boolean
}

export type PaymentCategoryDbRow = {
  id: string
  slug: string | null
  name: string
  btc_amount: string
  usd_amount: number | string
  payout_limit: string
  features: unknown
  badge: string | null
  button_color: string
  sort_order: number
  is_active: boolean
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isUuidString(value: string): boolean {
  return UUID_RE.test(value)
}

function normalizeButtonColor(value: string): TierButtonColor {
  if (value === 'orange' || value === 'blue') return value
  return 'grey'
}

function parseFeatures(raw: unknown): { text: string; included: boolean }[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const o = item as Record<string, unknown>
      const text = typeof o.text === 'string' ? o.text : ''
      const included = Boolean(o.included)
      if (!text.trim()) return null
      return { text: text.trim(), included }
    })
    .filter((x): x is { text: string; included: boolean } => x != null)
}

export function dbRowToTier(row: PaymentCategoryDbRow): MembershipTier {
  const usd =
    typeof row.usd_amount === 'string' ? parseFloat(row.usd_amount) : Number(row.usd_amount)
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    btcAmount: row.btc_amount,
    usdAmount: Number.isFinite(usd) ? usd : 0,
    payoutLimit: row.payout_limit,
    features: parseFeatures(row.features),
    badge: row.badge ?? undefined,
    buttonColor: normalizeButtonColor(row.button_color),
    sortOrder: row.sort_order,
    isActive: row.is_active,
  }
}

export async function fetchActivePaymentCategories(): Promise<MembershipTier[]> {
  const client = assertSupabaseConfigured()
  const { data, error } = await client
    .from('payment_categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) throw error
  return (data as PaymentCategoryDbRow[]).map(dbRowToTier)
}

/** Matches `workforce_payments.tier_id` to a payment category (same rules as `member_max_tier_sort` in SQL). */
function tierMatchesPaymentRow(tierId: string, pc: MembershipTier): boolean {
  const t = tierId.trim()
  if (pc.id === t) return true
  if (pc.slug && pc.slug.toLowerCase() === t.toLowerCase()) return true
  return false
}

/**
 * Highest membership tier the user has unlocked via verified workforce payments (Silver / Gold / Platinum).
 * Returns null if none verified or no matching active plan.
 */
/** Tiers with a higher `sort_order` than the member’s current verified tier (for upgrade UI). */
export function getTiersAbove(
  current: MembershipTier | null,
  allTiers: MembershipTier[],
): MembershipTier[] {
  if (!current) return [...allTiers]
  return allTiers.filter((t) => t.sortOrder > current.sortOrder)
}

/**
 * Build a {@link MembershipTier} for badge display from admin directory RPC columns.
 * Returns null when the member has no verified workforce tier.
 */
export function membershipTierFromDirectoryFields(row: {
  membership_tier_id: string | null
  membership_tier_slug: string | null
  membership_tier_name: string | null
  membership_tier_badge: string | null
}): MembershipTier | null {
  if (!row.membership_tier_id?.trim()) return null
  return {
    id: row.membership_tier_id,
    slug: row.membership_tier_slug,
    name: (row.membership_tier_name ?? 'Member').trim() || 'Member',
    btcAmount: '',
    usdAmount: 0,
    payoutLimit: '',
    features: [],
    badge: row.membership_tier_badge?.trim() || undefined,
    buttonColor: 'grey',
    sortOrder: 0,
    isActive: true,
  }
}

export async function fetchMemberVerifiedMembershipTier(userId: string): Promise<MembershipTier | null> {
  const client = assertSupabaseConfigured()
  const { data: payments, error } = await client
    .from('workforce_payments')
    .select('tier_id')
    .eq('user_id', userId)
    .eq('status', 'verified')

  if (error) throw error
  if (!payments?.length) return null

  const tiers = await fetchActivePaymentCategories()
  let best: MembershipTier | null = null
  for (const row of payments) {
    const tierId = String((row as { tier_id: string }).tier_id)
    const matched = tiers.find((pc) => tierMatchesPaymentRow(tierId, pc))
    if (matched && (!best || matched.sortOrder > best.sortOrder)) {
      best = matched
    }
  }
  return best
}

export async function fetchAllPaymentCategoriesAdmin(): Promise<MembershipTier[]> {
  const client = assertSupabaseConfigured()
  const { data, error } = await client
    .from('payment_categories')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) throw error
  return (data as PaymentCategoryDbRow[]).map(dbRowToTier)
}

/** Resolve tier for payment URL: `?tier=<uuid>` or legacy `?tier=<slug>`. */
export async function fetchPaymentCategoryByTierParam(
  tierParam: string,
): Promise<MembershipTier | null> {
  const client = assertSupabaseConfigured()
  const trimmed = tierParam.trim()
  if (!trimmed) return null

  if (isUuidString(trimmed)) {
    const { data, error } = await client
      .from('payment_categories')
      .select('*')
      .eq('id', trimmed)
      .eq('is_active', true)
      .maybeSingle()
    if (error) throw error
    if (!data) return null
    return dbRowToTier(data as PaymentCategoryDbRow)
  }

  const { data, error } = await client
    .from('payment_categories')
    .select('*')
    .eq('slug', trimmed)
    .eq('is_active', true)
    .maybeSingle()
  if (error) throw error
  if (!data) return null
  return dbRowToTier(data as PaymentCategoryDbRow)
}

export type PaymentCategoryInsert = {
  slug: string | null
  name: string
  btc_amount: string
  usd_amount: number
  payout_limit: string
  features: { text: string; included: boolean }[]
  badge: string | null
  button_color: TierButtonColor
  sort_order: number
  is_active: boolean
}

export async function insertPaymentCategory(row: PaymentCategoryInsert): Promise<MembershipTier> {
  const client = assertSupabaseConfigured()
  const { data, error } = await client
    .from('payment_categories')
    .insert({
      slug: row.slug || null,
      name: row.name.trim(),
      btc_amount: row.btc_amount.trim(),
      usd_amount: row.usd_amount,
      payout_limit: row.payout_limit.trim(),
      features: row.features,
      badge: row.badge?.trim() || null,
      button_color: row.button_color,
      sort_order: row.sort_order,
      is_active: row.is_active,
    })
    .select('*')
    .single()
  if (error) throw error
  return dbRowToTier(data as PaymentCategoryDbRow)
}

export async function updatePaymentCategory(
  id: string,
  patch: Partial<PaymentCategoryInsert>,
): Promise<MembershipTier> {
  const client = assertSupabaseConfigured()
  const payload: Record<string, unknown> = {}
  if (patch.slug !== undefined) payload.slug = patch.slug || null
  if (patch.name !== undefined) payload.name = patch.name.trim()
  if (patch.btc_amount !== undefined) payload.btc_amount = patch.btc_amount.trim()
  if (patch.usd_amount !== undefined) payload.usd_amount = patch.usd_amount
  if (patch.payout_limit !== undefined) payload.payout_limit = patch.payout_limit.trim()
  if (patch.features !== undefined) payload.features = patch.features
  if (patch.badge !== undefined) payload.badge = patch.badge?.trim() || null
  if (patch.button_color !== undefined) payload.button_color = patch.button_color
  if (patch.sort_order !== undefined) payload.sort_order = patch.sort_order
  if (patch.is_active !== undefined) payload.is_active = patch.is_active

  const { data, error } = await client
    .from('payment_categories')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw error
  return dbRowToTier(data as PaymentCategoryDbRow)
}

export async function deletePaymentCategory(id: string): Promise<void> {
  const client = assertSupabaseConfigured()
  const { error } = await client.from('payment_categories').delete().eq('id', id)
  if (error) throw error
}

export function slugifyName(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40)
  return base || 'plan'
}
