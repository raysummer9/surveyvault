import { assertSupabaseConfigured } from '../lib/supabase'

export type SitePageRow = {
  id: string
  slug: string
  title: string
  body_markdown: string
  updated_at: string
}

export const TERMS_SLUG = 'terms' as const

export async function fetchPublicSitePage(slug: string): Promise<SitePageRow | null> {
  const client = assertSupabaseConfigured()
  const { data, error } = await client.from('site_pages').select('*').eq('slug', slug).maybeSingle()
  if (error) throw error
  return (data ?? null) as SitePageRow | null
}

export async function upsertSitePage(
  slug: string,
  input: { title: string; bodyMarkdown: string },
): Promise<void> {
  const client = assertSupabaseConfigured()
  const { error } = await client.from('site_pages').upsert(
    {
      slug,
      title: input.title.trim() || 'Untitled',
      body_markdown: input.bodyMarkdown,
    },
    { onConflict: 'slug' },
  )
  if (error) throw error
}
