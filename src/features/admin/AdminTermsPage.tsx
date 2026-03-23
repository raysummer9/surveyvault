import { type FormEvent, useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchPublicSitePage, TERMS_SLUG, upsertSitePage } from '../../domain/sitePagesApi'
import { DEFAULT_TERMS_MARKDOWN, DEFAULT_TERMS_TITLE } from '../public/termsDefaultContent'
import { AdminPageSection } from '../../shared/ui/AdminPageSection'

export function AdminTermsPage() {
  const [title, setTitle] = useState(DEFAULT_TERMS_TITLE)
  const [body, setBody] = useState(DEFAULT_TERMS_MARKDOWN)
  const [updatedAt, setUpdatedAt] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const load = useCallback(async () => {
    setError('')
    setLoading(true)
    try {
      const row = await fetchPublicSitePage(TERMS_SLUG)
      if (row) {
        setTitle(row.title || DEFAULT_TERMS_TITLE)
        setBody(row.body_markdown || DEFAULT_TERMS_MARKDOWN)
        setUpdatedAt(row.updated_at)
      } else {
        setTitle(DEFAULT_TERMS_TITLE)
        setBody(DEFAULT_TERMS_MARKDOWN)
        setUpdatedAt(null)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load terms.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)
    try {
      await upsertSitePage(TERMS_SLUG, { title, bodyMarkdown: body })
      setSuccess('Terms saved. The public /terms page will show this content.')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminPageSection
      title="Terms of Service"
      description={
        <span>
          Edit the public Terms page (
          <Link to="/terms" target="_blank" rel="noopener noreferrer">
            open /terms
          </Link>
          ). Uses Markdown: headings with <code>##</code>, links like <code>[label](/privacy)</code>, paragraphs separated by
          blank lines.
        </span>
      }
    >
      {error ? <p className="field-error">{error}</p> : null}
      {success ? (
        <p className="dashboard-success-banner" role="status">
          {success}
        </p>
      ) : null}

      {loading ? (
        <p className="panel-muted">Loading…</p>
      ) : (
        <form className="admin-terms-form" onSubmit={handleSubmit}>
          {updatedAt ? (
            <p className="panel-muted admin-terms-updated">
              Last saved: {new Date(updatedAt).toLocaleString()}
            </p>
          ) : null}

          <label className="admin-terms-field">
            <span>Page title</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoComplete="off"
              required
            />
          </label>

          <label className="admin-terms-field">
            <span>Body (Markdown)</span>
            <textarea
              className="admin-terms-textarea"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={22}
              spellCheck
            />
          </label>

          <div className="admin-terms-actions">
            <button type="submit" className="button" disabled={saving}>
              {saving ? 'Saving…' : 'Save terms'}
            </button>
            <button type="button" className="profile-secondary-action" disabled={saving} onClick={() => void load()}>
              Reload from server
            </button>
          </div>
        </form>
      )}
    </AdminPageSection>
  )
}
