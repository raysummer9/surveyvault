import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { z } from 'zod'
import { DEFAULT_TELEGRAM_SUPPORT_URL } from '../../config/support'
import {
  adminUpsertPlatformSupportSettings,
  fetchPlatformSupportSettings,
} from '../../domain/platformSupportSettings'
import { AdminPageSection } from '../../shared/ui/AdminPageSection'

const telegramUrlSchema = z
  .string()
  .trim()
  .url('Enter a valid URL.')
  .refine((u) => /^https:\/\/(t\.me|telegram\.me)\//i.test(u), {
    message: 'Use a Telegram link (https://t.me/yourchannel or https://telegram.me/...).',
  })

export function AdminSupportSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [telegramUrl, setTelegramUrl] = useState<string>(DEFAULT_TELEGRAM_SUPPORT_URL)
  const [updatedAt, setUpdatedAt] = useState<string | null>(null)

  const load = useCallback(async () => {
    setError('')
    setLoading(true)
    try {
      const row = await fetchPlatformSupportSettings()
      if (row) {
        setTelegramUrl(row.telegram_url)
        setUpdatedAt(row.updated_at)
      } else {
        setTelegramUrl(DEFAULT_TELEGRAM_SUPPORT_URL)
        setUpdatedAt(null)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load support settings.')
      setTelegramUrl(DEFAULT_TELEGRAM_SUPPORT_URL)
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
    const parsed = telegramUrlSchema.safeParse(telegramUrl)
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Invalid Telegram URL.')
      return
    }
    setSaving(true)
    try {
      await adminUpsertPlatformSupportSettings({ telegram_url: parsed.data })
      setSuccess('Telegram link saved. Support page, floating button, and suspended-account screen will use it.')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminPageSection
      title="Support settings"
      description="Telegram link shown to members on the support page, dashboard floating button, and account-suspended notice."
    >
      {loading ? (
        <p className="panel-muted">Loading…</p>
      ) : (
        <form className="auth-form admin-settings-form admin-support-form panel" onSubmit={handleSubmit} noValidate>
          <label htmlFor="admin-support-telegram">Telegram URL</label>
          <input
            id="admin-support-telegram"
            type="url"
            inputMode="url"
            autoComplete="off"
            value={telegramUrl}
            onChange={(ev) => setTelegramUrl(ev.target.value)}
            placeholder="https://t.me/yourchannel"
          />
          <p className="panel-muted admin-settings-hint">
            Must start with <code>https://t.me/</code> or <code>https://telegram.me/</code>.
            {updatedAt ? (
              <>
                {' '}
                Last updated {new Date(updatedAt).toLocaleString()}.
              </>
            ) : null}
          </p>
          {error ? <p className="field-error">{error}</p> : null}
          {success ? (
            <p className="password-match success" role="status">
              {success}
            </p>
          ) : null}
          <button type="submit" className="auth-submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save Telegram link'}
          </button>
        </form>
      )}
    </AdminPageSection>
  )
}
