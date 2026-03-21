import { useCallback, useEffect, useState } from 'react'
import { AdminPageSection } from '../../shared/ui/AdminPageSection'
import {
  deletePaymentCategory,
  fetchAllPaymentCategoriesAdmin,
  insertPaymentCategory,
  slugifyName,
  updatePaymentCategory,
  type MembershipTier,
  type PaymentCategoryInsert,
  type TierButtonColor,
} from '../../domain/paymentCategory'

const BUTTON_COLORS: { value: TierButtonColor; label: string }[] = [
  { value: 'grey', label: 'Grey' },
  { value: 'orange', label: 'Orange' },
  { value: 'blue', label: 'Blue' },
]

function emptyForm(): PaymentCategoryInsert {
  return {
    slug: null,
    name: '',
    btc_amount: '',
    usd_amount: 0,
    payout_limit: '',
    features: [{ text: '', included: true }],
    badge: null,
    button_color: 'grey',
    sort_order: 0,
    is_active: true,
  }
}

function tierToForm(t: MembershipTier): PaymentCategoryInsert {
  return {
    slug: t.slug,
    name: t.name,
    btc_amount: t.btcAmount,
    usd_amount: t.usdAmount,
    payout_limit: t.payoutLimit,
    features: t.features.length > 0 ? [...t.features] : [{ text: '', included: true }],
    badge: t.badge ?? null,
    button_color: t.buttonColor,
    sort_order: t.sortOrder,
    is_active: t.isActive,
  }
}

export function AdminPaymentSettingsPage() {
  const [tiers, setTiers] = useState<MembershipTier[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | 'new' | null>(null)
  const [form, setForm] = useState<PaymentCategoryInsert>(emptyForm())
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setError('')
    setLoading(true)
    try {
      const rows = await fetchAllPaymentCategoriesAdmin()
      setTiers(rows)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load payment categories.')
      setTiers([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const openNew = () => {
    setEditingId('new')
    setForm(emptyForm())
    setError('')
  }

  const openEdit = (t: MembershipTier) => {
    setEditingId(t.id)
    setForm(tierToForm(t))
    setError('')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm(emptyForm())
    setError('')
  }

  const setFeature = (index: number, patch: Partial<{ text: string; included: boolean }>) => {
    setForm((f) => {
      const next = [...f.features]
      next[index] = { ...next[index], ...patch }
      return { ...f, features: next }
    })
  }

  const addFeatureRow = () => {
    setForm((f) => ({ ...f, features: [...f.features, { text: '', included: true }] }))
  }

  const removeFeatureRow = (index: number) => {
    setForm((f) => ({
      ...f,
      features: f.features.filter((_, i) => i !== index),
    }))
  }

  const handleSave = async () => {
    if (!form.name.trim() || !form.btc_amount.trim()) {
      setError('Name and BTC amount are required.')
      return
    }
    const features = form.features.filter((x) => x.text.trim())
    if (features.length === 0) {
      setError('Add at least one feature line with text.')
      return
    }
    const usd = Number(form.usd_amount)
    if (!Number.isFinite(usd) || usd < 0) {
      setError('USD amount must be a valid number.')
      return
    }

    let slug = form.slug?.trim() || null
    if (!slug && editingId === 'new') {
      slug = slugifyName(form.name)
    }

    const payload: PaymentCategoryInsert = {
      ...form,
      slug,
      name: form.name.trim(),
      btc_amount: form.btc_amount.trim(),
      usd_amount: usd,
      payout_limit: form.payout_limit.trim() || '—',
      features,
      badge: form.badge?.trim() || null,
    }

    setSaving(true)
    setError('')
    try {
      if (editingId === 'new') {
        await insertPaymentCategory(payload)
      } else if (editingId) {
        await updatePaymentCategory(editingId, payload)
      }
      await load()
      cancelEdit()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    setSaving(true)
    setError('')
    try {
      await deletePaymentCategory(id)
      setDeleteConfirmId(null)
      await load()
      if (editingId === id) cancelEdit()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed.')
    } finally {
      setSaving(false)
    }
  }

  const toggleActiveQuick = async (t: MembershipTier) => {
    setSaving(true)
    setError('')
    try {
      await updatePaymentCategory(t.id, { is_active: !t.isActive })
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminPageSection
      title="Admin: Payment categories"
      description="Create and manage workforce membership plans. Users see active plans on Join Workforce; payment uses the selected plan."
    >
      {error && <p className="field-error">{error}</p>}

      {loading ? (
        <p className="panel-muted">Loading payment categories…</p>
      ) : (
        <>
          <div className="admin-payment-toolbar">
            <button type="button" className="step-action" onClick={openNew} disabled={!!editingId}>
              Add category
            </button>
          </div>

          <div className="admin-payment-list">
            {tiers.map((t) => (
              <article key={t.id} className="admin-payment-row">
                <div className="admin-payment-row-main">
                  <div>
                    <strong>{t.name}</strong>
                    {!t.isActive && <span className="admin-payment-inactive-badge">Inactive</span>}
                    <p className="admin-payment-meta">
                      {t.btcAmount} BTC · ${t.usdAmount.toLocaleString()} · {t.payoutLimit}
                      {t.slug ? ` · slug: ${t.slug}` : ''}
                    </p>
                  </div>
                  <div className="admin-payment-row-actions">
                    <button
                      type="button"
                      className="profile-secondary-action"
                      onClick={() => void toggleActiveQuick(t)}
                      disabled={saving}
                    >
                      {t.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      type="button"
                      className="profile-secondary-action"
                      onClick={() => openEdit(t)}
                      disabled={editingId !== null}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="profile-secondary-action admin-payment-delete-btn"
                      onClick={() => setDeleteConfirmId(t.id)}
                      disabled={editingId !== null}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {deleteConfirmId === t.id && (
                  <div className="admin-payment-delete-confirm">
                    <p>Delete “{t.name}”? This cannot be undone.</p>
                    <div className="admin-payment-delete-actions">
                      <button
                        type="button"
                        className="step-action"
                        onClick={() => void handleDelete(t.id)}
                        disabled={saving}
                      >
                        Yes, delete
                      </button>
                      <button
                        type="button"
                        className="profile-secondary-action"
                        onClick={() => setDeleteConfirmId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </article>
            ))}
            {tiers.length === 0 && !editingId && (
              <p className="panel-muted">No categories yet. Add one to enable workforce payments.</p>
            )}
          </div>

          {editingId && (
            <div className="admin-payment-editor panel">
              <h3 className="admin-payment-editor-title">
                {editingId === 'new' ? 'New payment category' : 'Edit payment category'}
              </h3>
              <div className="admin-payment-form-grid">
                <label className="admin-payment-field">
                  <span>Name *</span>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Gold"
                  />
                </label>
                <label className="admin-payment-field">
                  <span>Slug (optional, URL / legacy id)</span>
                  <input
                    value={form.slug ?? ''}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, slug: e.target.value.trim() || null }))
                    }
                    placeholder="gold"
                  />
                </label>
                <label className="admin-payment-field">
                  <span>BTC amount *</span>
                  <input
                    value={form.btc_amount}
                    onChange={(e) => setForm((f) => ({ ...f, btc_amount: e.target.value }))}
                    placeholder="0.015"
                  />
                </label>
                <label className="admin-payment-field">
                  <span>USD amount *</span>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={Number.isFinite(form.usd_amount) ? form.usd_amount : 0}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, usd_amount: parseFloat(e.target.value) || 0 }))
                    }
                  />
                </label>
                <label className="admin-payment-field admin-payment-field-full">
                  <span>Payout limit label</span>
                  <input
                    value={form.payout_limit}
                    onChange={(e) => setForm((f) => ({ ...f, payout_limit: e.target.value }))}
                    placeholder="$2,000/month"
                  />
                </label>
                <label className="admin-payment-field admin-payment-field-full">
                  <span>Badge (e.g. Gold)</span>
                  <input
                    value={form.badge ?? ''}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, badge: e.target.value.trim() || null }))
                    }
                  />
                </label>
                <label className="admin-payment-field">
                  <span>Sort order</span>
                  <input
                    type="number"
                    value={form.sort_order}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, sort_order: parseInt(e.target.value, 10) || 0 }))
                    }
                  />
                </label>
                <label className="admin-payment-field">
                  <span>Button color</span>
                  <select
                    value={form.button_color}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        button_color: e.target.value as TierButtonColor,
                      }))
                    }
                  >
                    {BUTTON_COLORS.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="admin-payment-field admin-payment-checkbox">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                  />
                  <span>Active (visible to users)</span>
                </label>
              </div>

              <div className="admin-payment-features">
                <div className="admin-payment-features-head">
                  <span>Features</span>
                  <button type="button" className="profile-secondary-action" onClick={addFeatureRow}>
                    Add line
                  </button>
                </div>
                {form.features.map((feat, i) => (
                  <div key={i} className="admin-payment-feature-row">
                    <input
                      value={feat.text}
                      onChange={(e) => setFeature(i, { text: e.target.value })}
                      placeholder="Feature description"
                    />
                    <label className="admin-payment-feature-included">
                      <input
                        type="checkbox"
                        checked={feat.included}
                        onChange={(e) => setFeature(i, { included: e.target.checked })}
                      />
                      Included
                    </label>
                    <button
                      type="button"
                      className="profile-secondary-action"
                      onClick={() => removeFeatureRow(i)}
                      disabled={form.features.length <= 1}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <div className="admin-payment-editor-actions">
                <button
                  type="button"
                  className="step-action"
                  onClick={() => void handleSave()}
                  disabled={saving}
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
                <button
                  type="button"
                  className="profile-secondary-action"
                  onClick={cancelEdit}
                  disabled={saving}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </AdminPageSection>
  )
}
