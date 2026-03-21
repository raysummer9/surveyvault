import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageSection } from '../../shared/ui/PageSection'
import { useAuth } from '../auth/AuthContext'
import { formatCents } from '../../domain/surveyApi'
import {
  MIN_WITHDRAWAL_CENTS,
  createWithdrawalRequest,
  fetchMyWithdrawals,
  fetchWithdrawableBalanceCents,
  type WithdrawalMethod,
  type WithdrawalRequestRow,
} from '../../domain/withdrawalApi'

function dollarsToCents(raw: string): number | null {
  const t = raw.trim().replace(/[^0-9.]/g, '')
  if (!t) return null
  const n = Number.parseFloat(t)
  if (!Number.isFinite(n) || n <= 0) return null
  return Math.round(n * 100)
}

export function WithdrawalPage() {
  const { user } = useAuth()
  const [withdrawableCents, setWithdrawableCents] = useState(0)
  const [amountInput, setAmountInput] = useState('')
  const [method, setMethod] = useState<WithdrawalMethod>('crypto')
  const [cryptoNetwork, setCryptoNetwork] = useState('BTC')
  const [cryptoAddress, setCryptoAddress] = useState('')
  const [bankHolder, setBankHolder] = useState('')
  const [bankName, setBankName] = useState('')
  const [bankAccount, setBankAccount] = useState('')
  const [bankRouting, setBankRouting] = useState('')
  const [bankCountry, setBankCountry] = useState('')
  const [memberNote, setMemberNote] = useState('')
  const [rows, setRows] = useState<WithdrawalRequestRow[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const load = useCallback(async () => {
    if (!user?.id) return
    setError('')
    setLoading(true)
    try {
      const [bal, list] = await Promise.all([
        fetchWithdrawableBalanceCents(user.id),
        fetchMyWithdrawals(user.id),
      ])
      setWithdrawableCents(bal)
      setRows(list)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load withdrawal data.')
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    void load()
  }, [load])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) return
    setError('')
    setSuccess('')
    const cents = dollarsToCents(amountInput)
    if (cents == null) {
      setError('Enter a valid amount in USD.')
      return
    }
    if (cents < MIN_WITHDRAWAL_CENTS) {
      setError(`Minimum withdrawal is ${formatCents(MIN_WITHDRAWAL_CENTS)}.`)
      return
    }
    if (cents > withdrawableCents) {
      setError(`Amount exceeds available balance (${formatCents(withdrawableCents)}).`)
      return
    }

    if (method === 'crypto') {
      if (!cryptoAddress.trim()) {
        setError('Enter your crypto wallet address.')
        return
      }
    } else {
      if (!bankHolder.trim() || !bankName.trim() || !bankAccount.trim() || !bankRouting.trim()) {
        setError('Fill in all required bank fields (name on account, bank name, account number, routing or IBAN).')
        return
      }
    }

    setSubmitting(true)
    try {
      await createWithdrawalRequest({
        userId: user.id,
        amountCents: cents,
        method,
        cryptoNetwork: method === 'crypto' ? cryptoNetwork : undefined,
        cryptoWalletAddress: method === 'crypto' ? cryptoAddress.trim() : undefined,
        bankAccountHolder: method === 'bank' ? bankHolder.trim() : undefined,
        bankName: method === 'bank' ? bankName.trim() : undefined,
        bankAccountNumber: method === 'bank' ? bankAccount.trim() : undefined,
        bankRoutingOrIban: method === 'bank' ? bankRouting.trim() : undefined,
        bankCountry: method === 'bank' ? bankCountry.trim() || undefined : undefined,
        memberNote: memberNote.trim() || undefined,
      })
      setSuccess('Withdrawal request submitted. Our team will review it shortly.')
      setAmountInput('')
      setMemberNote('')
      await load()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Request failed.'
      setError(msg.includes('Insufficient') ? msg : msg)
    } finally {
      setSubmitting(false)
    }
  }

  const fillMax = () => {
    if (withdrawableCents <= 0) return
    setAmountInput((withdrawableCents / 100).toFixed(2))
  }

  return (
    <PageSection
      title="Withdrawals"
      description={`Request a payout when you have at least ${formatCents(MIN_WITHDRAWAL_CENTS)} in cleared earnings (survey rewards marked “paid” by admin).`}
    >
      {loading ? (
        <p className="panel-muted">Loading…</p>
      ) : (
        <>
          <div className="withdrawal-balance-card">
            <p className="withdrawal-balance-label">Available to withdraw</p>
            <p className="withdrawal-balance-value">{formatCents(withdrawableCents)}</p>
            <p className="withdrawal-balance-hint">
              Cleared earnings minus any pending or approved withdrawal requests.
            </p>
          </div>

          {withdrawableCents < MIN_WITHDRAWAL_CENTS ? (
            <div className="panel-muted withdrawal-below-min">
              You need at least {formatCents(MIN_WITHDRAWAL_CENTS)} available to request a withdrawal. Complete
              surveys, have admin mark survey payouts as paid, then return here.
            </div>
          ) : (
            <form className="withdrawal-form" onSubmit={handleSubmit}>
              <label className="withdrawal-field">
                <span>Amount (USD)</span>
                <div className="withdrawal-amount-row">
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="500.00"
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    autoComplete="off"
                  />
                  <button type="button" className="button secondary" onClick={fillMax}>
                    Max
                  </button>
                </div>
              </label>

              <fieldset className="withdrawal-method-fieldset">
                <legend>Method</legend>
                <label className="withdrawal-radio">
                  <input
                    type="radio"
                    name="method"
                    checked={method === 'crypto'}
                    onChange={() => setMethod('crypto')}
                  />
                  Cryptocurrency
                </label>
                <label className="withdrawal-radio">
                  <input
                    type="radio"
                    name="method"
                    checked={method === 'bank'}
                    onChange={() => setMethod('bank')}
                  />
                  Bank transfer
                </label>
              </fieldset>

              {method === 'crypto' ? (
                <div className="withdrawal-method-fields">
                  <label className="withdrawal-field">
                    <span>Network</span>
                    <select value={cryptoNetwork} onChange={(e) => setCryptoNetwork(e.target.value)}>
                      <option value="BTC">Bitcoin (BTC)</option>
                      <option value="ETH">Ethereum (ETH)</option>
                      <option value="USDT_ERC20">USDT (ERC-20)</option>
                    </select>
                  </label>
                  <label className="withdrawal-field">
                    <span>Wallet address</span>
                    <input
                      type="text"
                      value={cryptoAddress}
                      onChange={(e) => setCryptoAddress(e.target.value)}
                      placeholder="Your payout address"
                      autoComplete="off"
                    />
                  </label>
                </div>
              ) : (
                <div className="withdrawal-method-fields">
                  <label className="withdrawal-field">
                    <span>Name on account</span>
                    <input value={bankHolder} onChange={(e) => setBankHolder(e.target.value)} />
                  </label>
                  <label className="withdrawal-field">
                    <span>Bank name</span>
                    <input value={bankName} onChange={(e) => setBankName(e.target.value)} />
                  </label>
                  <label className="withdrawal-field">
                    <span>Account number</span>
                    <input value={bankAccount} onChange={(e) => setBankAccount(e.target.value)} />
                  </label>
                  <label className="withdrawal-field">
                    <span>Routing (US) or IBAN</span>
                    <input value={bankRouting} onChange={(e) => setBankRouting(e.target.value)} />
                  </label>
                  <label className="withdrawal-field">
                    <span>Country (optional)</span>
                    <input value={bankCountry} onChange={(e) => setBankCountry(e.target.value)} />
                  </label>
                </div>
              )}

              <label className="withdrawal-field">
                <span>Note to admin (optional)</span>
                <textarea
                  rows={2}
                  value={memberNote}
                  onChange={(e) => setMemberNote(e.target.value)}
                  placeholder="Any extra instructions"
                />
              </label>

              {error ? <p className="field-error">{error}</p> : null}
              {success ? (
                <p className="dashboard-success-banner" role="status">
                  {success}
                </p>
              ) : null}

              <button type="submit" className="button" disabled={submitting}>
                {submitting ? 'Submitting…' : 'Submit withdrawal request'}
              </button>
            </form>
          )}

          <h3 className="withdrawal-history-title">Your requests</h3>
          {rows.length === 0 ? (
            <p className="panel-muted">No withdrawal requests yet.</p>
          ) : (
            <ul className="withdrawal-history-list">
              {rows.map((r) => (
                <li key={r.id} className="withdrawal-history-item">
                  <div>
                    <strong>{formatCents(r.amount_cents)}</strong>
                    <span className="withdrawal-history-meta">
                      {' '}
                      · {r.method === 'crypto' ? 'Crypto' : 'Bank'} ·{' '}
                      {new Date(r.created_at).toLocaleString()}
                    </span>
                  </div>
                  <span
                    className={
                      r.status === 'approved'
                        ? 'admin-paid-pill'
                        : r.status === 'rejected'
                          ? 'withdrawal-status-rejected'
                          : 'admin-pending-pill'
                    }
                  >
                    {r.status}
                  </span>
                  {r.status === 'rejected' && r.admin_rejection_reason ? (
                    <p className="withdrawal-reject-reason">{r.admin_rejection_reason}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}

          <p className="survey-hint">
            <Link to="/dashboard/earnings">← Back to earnings dashboard</Link>
          </p>
        </>
      )}
    </PageSection>
  )
}
