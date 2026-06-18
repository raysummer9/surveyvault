import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { z } from 'zod'
import {
  adminUpsertPlatformSupportSettings,
  fetchPlatformSupportSettings,
} from '../../domain/platformSupportSettings'
import { AdminPageSection } from '../../shared/ui/AdminPageSection'

const telegramUrlSchema = z.union([
  z.literal(''),
  z
    .string()
    .trim()
    .url('Enter a valid URL.')
    .refine((u) => /^https:\/\/(t\.me|telegram\.me)\//i.test(u), {
      message: 'Use a Telegram link (https://t.me/yourchannel or https://telegram.me/...).',
    }),
])

export function AdminSupportSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [telegramUrl, setTelegramUrl] = useState('')
  const [updatedAt, setUpdatedAt] = useState<string | null>(null)

  const load = useCallback(async () => {
    setError('')
    setLoading(true)
    try {
      const row = await fetchPlatformSupportSettings()
      if (row) {
        setTelegramUrl(row.telegram_url ?? '')
        setUpdatedAt(row.updated_at)
      } else {
        setTelegramUrl('')
        setUpdatedAt(null)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load support settings.')
      setTelegramUrl('')
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
      setSuccess(
        parsed.data
          ? 'Telegram link saved. Members will see it on the support page and dashboard.'
          : 'Telegram link removed. Members will no longer see the Telegram button or panel.',
      )
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
      description="Optional Telegram link for members. Leave blank to hide Telegram on the support page, dashboard button, and suspended-account screen."
    >
      {loading ? (
        <p className="panel-muted">Loading…</p>
      ) : (
        <form className="auth-form admin-settings-form admin-support-form panel" onSubmit={handleSubmit} noValidate>
          <label htmlFor="admin-support-telegram">Telegram URL (optional)</label>
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
            When set, must start with <code>https://t.me/</code> or <code>https://telegram.me/</code>. Clear the field
            and save to hide Telegram for members.
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
            {saving ? 'Saving…' : 'Save support settings'}
          </button>
        </form>
      )}
    </AdminPageSection>
  )
}
