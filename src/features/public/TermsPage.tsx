import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchPublicSitePage, TERMS_SLUG } from '../../domain/sitePagesApi'
import { PublicPageLayout } from '../../shared/ui/PublicPageLayout'
import { DEFAULT_TERMS_MARKDOWN, DEFAULT_TERMS_TITLE } from './termsDefaultContent'
import { LegalMarkdown } from './LegalMarkdown'

export function TermsPage() {
  const [title, setTitle] = useState(DEFAULT_TERMS_TITLE)
  const [markdown, setMarkdown] = useState(DEFAULT_TERMS_MARKDOWN)
  const [updatedAt, setUpdatedAt] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const row = await fetchPublicSitePage(TERMS_SLUG)
      if (row) {
        setTitle(row.title?.trim() || DEFAULT_TERMS_TITLE)
        setMarkdown(row.body_markdown?.trim() ? row.body_markdown : DEFAULT_TERMS_MARKDOWN)
        setUpdatedAt(row.updated_at)
      } else {
        setTitle(DEFAULT_TERMS_TITLE)
        setMarkdown(DEFAULT_TERMS_MARKDOWN)
        setUpdatedAt(null)
      }
    } catch {
      setTitle(DEFAULT_TERMS_TITLE)
      setMarkdown(DEFAULT_TERMS_MARKDOWN)
      setUpdatedAt(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <PublicPageLayout>
      <div className="legal-page">
        {loading ? (
          <p className="panel-muted">Loading…</p>
        ) : (
          <>
            <h1>{title}</h1>
            <p className="legal-page-updated">
              Last updated:{' '}
              {(updatedAt ? new Date(updatedAt) : new Date()).toLocaleDateString()}
            </p>
            <LegalMarkdown markdown={markdown} className="legal-page-markdown" />
            <p>
              <Link to="/">← Back to home</Link>
            </p>
          </>
        )}
      </div>
    </PublicPageLayout>
  )
}
