import { useCallback, useEffect, useState, type FormEvent } from 'react'
import {
  adminUpsertPlatformPaymentSettings,
  fetchPlatformPaymentSettings,
  type PlatformPaymentSettingsRow,
} from '../../domain/platformPaymentSettings'
import { PAYMENT_WINDOW_MINUTES, paymentAddresses } from '../../domain/paymentConfig'
import { AdminPageSection } from '../../shared/ui/AdminPageSection'

function defaultsFromStatic(): Pick<PlatformPaymentSettingsRow, 'btc_address' | 'eth_address' | 'usdt_address' | 'payment_window_minutes'> {
  return {
    btc_address: paymentAddresses.btc ?? '',
    eth_address: paymentAddresses.eth ?? '',
    usdt_address: paymentAddresses.usdt ?? '',
    payment_window_minutes: PAYMENT_WINDOW_MINUTES,
  }
}

export function AdminPaymentDepositAddressesPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [btc, setBtc] = useState('')
  const [eth, setEth] = useState('')
  const [usdt, setUsdt] = useState('')
  const [windowMins, setWindowMins] = useState(PAYMENT_WINDOW_MINUTES)
  const [loadedAt, setLoadedAt] = useState<string | null>(null)

  const load = useCallback(async () => {
    setError('')
    setLoading(true)
    try {
      const row = await fetchPlatformPaymentSettings()
      const d = defaultsFromStatic()
      if (row) {
        setBtc(row.btc_address)
        setEth(row.eth_address)
        setUsdt(row.usdt_address)
        setWindowMins(row.payment_window_minutes)
        setLoadedAt(row.updated_at)
      } else {
        setBtc(d.btc_address)
        setEth(d.eth_address)
        setUsdt(d.usdt_address)
        setWindowMins(d.payment_window_minutes)
        setLoadedAt(null)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load settings.')
      const d = defaultsFromStatic()
      setBtc(d.btc_address)
      setEth(d.eth_address)
      setUsdt(d.usdt_address)
      setWindowMins(d.payment_window_minutes)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!btc.trim() || !eth.trim() || !usdt.trim()) {
      setError('BTC, ETH, and USDT addresses are required.')
      return
    }
    if (!Number.isFinite(windowMins) || windowMins < 1 || windowMins > 24 * 60) {
      setError('Payment window must be between 1 and 1440 minutes.')
      return
    }
    setSaving(true)
    setError('')
    try {
      await adminUpsertPlatformPaymentSettings({
        btc_address: btc,
        eth_address: eth,
        usdt_address: usdt,
        payment_window_minutes: Math.round(windowMins),
      })
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminPageSection
      title="Deposit addresses"
      description="Addresses members send crypto to on the workforce payment page (BTC, ETH, USDT ERC-20). Changing these updates the live payment flow immediately."
    >
      {error ? <p className="field-error">{error}</p> : null}

      {loading ? (
        <p className="panel-muted">Loading…</p>
      ) : (
        <form className="admin-deposit-addresses-form" onSubmit={(e) => void handleSubmit(e)}>
          <div className="admin-deposit-addresses-grid">
            <label className="admin-payment-field">
              <span>BTC address *</span>
              <input
                value={btc}
                onChange={(e) => setBtc(e.target.value)}
                placeholder="bc1…"
                autoComplete="off"
                spellCheck={false}
              />
            </label>
            <label className="admin-payment-field">
              <span>ETH address *</span>
              <input
                value={eth}
                onChange={(e) => setEth(e.target.value)}
                placeholder="0x…"
                autoComplete="off"
                spellCheck={false}
              />
            </label>
            <label className="admin-payment-field">
              <span>USDT (ERC-20) address *</span>
              <input
                value={usdt}
                onChange={(e) => setUsdt(e.target.value)}
                placeholder="0x…"
                autoComplete="off"
                spellCheck={false}
              />
            </label>
            <label className="admin-payment-field">
              <span>Payment window (minutes) *</span>
              <input
                type="number"
                min={1}
                max={1440}
                value={windowMins}
                onChange={(e) => setWindowMins(Number(e.target.value))}
              />
              <span className="admin-deposit-addresses-hint">Countdown shown on the payment page (default 45).</span>
            </label>
          </div>

          {loadedAt ? (
            <p className="panel-muted admin-deposit-addresses-meta">Last updated: {new Date(loadedAt).toLocaleString()}</p>
          ) : null}

          <div className="admin-deposit-addresses-actions">
            <button type="submit" className="button" disabled={saving}>
              {saving ? 'Saving…' : 'Save deposit settings'}
            </button>
          </div>
        </form>
      )}
    </AdminPageSection>
  )
}
