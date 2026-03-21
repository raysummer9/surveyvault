import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiClock, FiCopy, FiRefreshCw, FiShield } from 'react-icons/fi'
import { HiOutlineMenu } from 'react-icons/hi'
import { assertSupabaseConfigured } from '../../lib/supabase'
import { fetchPaymentCategoryByTierParam, type MembershipTier } from '../../domain/paymentCategory'
import { AppSidebarLayout, useSidebar } from '../../shared/ui/AppSidebarLayout'
import { useAuth } from '../auth/AuthContext'
import { hasJoinedWorkforce } from '../auth/types'
import type { WorkforcePaymentRow } from './workforcePaymentUtils'

function PendingHeader({ isUpgrade }: { isUpgrade: boolean }) {
  const { openMobileSidebar } = useSidebar()
  return (
    <header className="dashboard-mobile-header">
      <button
        type="button"
        className="profile-mobile-menu-btn"
        onClick={openMobileSidebar}
        aria-label="Open dashboard menu"
      >
        <HiOutlineMenu />
      </button>
      <span>{isUpgrade ? 'Upgrade pending' : 'Payment Pending'}</span>
    </header>
  )
}

/** Same progression as payment/join: user has submitted for verification — step 4 (Active) is current while admin confirms. */
function PendingEnrollmentStepper() {
  const steps = [
    { id: 'verification', label: 'Verification', status: 'completed' as const },
    { id: 'plan', label: 'Choose Plan', status: 'completed' as const },
    { id: 'payment', label: 'Payment', status: 'completed' as const },
    { id: 'active', label: 'Active', status: 'active' as const },
  ]
  return (
    <div className="payment-stepper workforce-pending-enrollment-stepper" aria-label="Enrollment progress">
      {steps.map((step, i) => (
        <div
          key={step.id}
          className={`workforce-join-step ${step.status === 'completed' ? 'completed' : ''} ${step.status === 'active' ? 'active' : ''}`}
        >
          <span className="workforce-join-step-marker">
            {step.status === 'completed' ? '✓' : i + 1}
          </span>
          <span className="workforce-join-step-label">{step.label}</span>
          {i < steps.length - 1 && <span className="workforce-join-step-line" />}
        </div>
      ))}
    </div>
  )
}

const CURRENCY_LABEL: Record<string, string> = {
  btc: 'Bitcoin (BTC)',
  eth: 'Ethereum (ETH)',
  usdt: 'USDT (ERC-20)',
}

export function WorkforcePendingReviewPage() {
  const navigate = useNavigate()
  const { user, profile, refreshUserState } = useAuth()
  const isUpgradeFlow = hasJoinedWorkforce(profile)
  const [payment, setPayment] = useState<WorkforcePaymentRow | null>(null)
  const [tier, setTier] = useState<MembershipTier | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copiedTx, setCopiedTx] = useState(false)
  const [copiedRef, setCopiedRef] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    if (!user?.id) return
    setError('')
    setLoading(true)
    try {
      const client = assertSupabaseConfigured()
      const { data, error: qErr } = await client
        .from('workforce_payments')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (qErr) throw qErr
      const row = data as WorkforcePaymentRow | null
      setPayment(row)
      if (row?.tier_id) {
        const t = await fetchPaymentCategoryByTierParam(row.tier_id)
        setTier(t)
      } else {
        setTier(null)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load your submission.')
      setPayment(null)
      setTier(null)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    void load()
  }, [load])

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await refreshUserState()
      await load()
    } finally {
      setRefreshing(false)
    }
  }

  const copyText = async (text: string, which: 'tx' | 'ref') => {
    try {
      await navigator.clipboard.writeText(text)
      if (which === 'tx') {
        setCopiedTx(true)
        setTimeout(() => setCopiedTx(false), 2000)
      } else {
        setCopiedRef(true)
        setTimeout(() => setCopiedRef(false), 2000)
      }
    } catch {
      setError('Could not copy to clipboard.')
    }
  }

  const tierLabel = tier?.name ?? 'Membership'
  const btcDisplay = payment?.amount_btc ?? '—'
  const usdDisplay =
    payment?.amount_usd != null ? Number(payment.amount_usd).toLocaleString() : '—'
  const currencyKey = (payment?.currency_sent ?? 'btc').toLowerCase()
  const currencyLabel = CURRENCY_LABEL[currencyKey] ?? currencyKey.toUpperCase()
  const submittedAt = payment?.created_at
    ? new Date(payment.created_at).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : '—'
  const txDisplay = payment?.tx_hash?.trim() || '—'
  const refDisplay =
    payment?.review_reference_id?.trim() ||
    (payment?.id ? payment.id.slice(0, 8).toUpperCase() : '—')

  return (
    <AppSidebarLayout>
      <PendingHeader isUpgrade={isUpgradeFlow} />
      <div className="workforce-pending-page">
        <div className="workforce-pending-header-row">
          <button
            type="button"
            className="workforce-pending-back"
            onClick={() => window.history.back()}
            aria-label="Go back"
          >
            ←
          </button>
          <div className="workforce-pending-header-text">
            <h1 className="workforce-pending-title">
              {isUpgradeFlow ? 'Upgrade pending' : 'Payment Pending'}
            </h1>
            <div className="workforce-pending-badges">
              <span className="workforce-pending-badge plan">
                {tierLabel} — {btcDisplay} BTC
              </span>
              <span className="workforce-pending-badge status workforce-pending-pulse">Under review</span>
            </div>
          </div>
        </div>

        <PendingEnrollmentStepper />

        {loading ? (
          <p className="panel-muted workforce-pending-loading">Loading your submission…</p>
        ) : error ? (
          <div className="panel-muted">
            <p className="field-error">{error}</p>
            <button type="button" className="workforce-join-proceed" onClick={() => void load()}>
              Retry
            </button>
          </div>
        ) : !payment ? (
          <>
            <div className="workforce-pending-hero">
              <FiClock className="workforce-pending-hero-icon" aria-hidden />
              <p className="workforce-pending-hero-kicker">Awaiting admin review</p>
              <h2 className="workforce-pending-hero-title">Payment submitted!</h2>
              <ul className="workforce-pending-checklist">
                <li className="done">Transaction hash received</li>
                <li className="active">Syncing your submission…</li>
                <li>Admin review in progress</li>
              </ul>
            </div>
            <div className="panel-muted workforce-pending-sync">
              <p>We’re loading your payment record. If this persists, tap refresh.</p>
              <button type="button" className="workforce-join-proceed" onClick={() => void load()}>
                Refresh
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="workforce-pending-hero workforce-pending-hero-rich">
              <span className="workforce-pending-await-pill">Awaiting admin review</span>
              <FiClock className="workforce-pending-hero-icon" aria-hidden />
              <h2 className="workforce-pending-hero-title">Payment submitted! 🎉</h2>
              <p className="workforce-pending-hero-desc">
                {isUpgradeFlow ? (
                  <>
                    Your transaction is in our review queue. Our team will verify the payment on-chain and apply your
                    new tier—usually within 2–24 hours. You can keep using the platform with your current tier until
                    then.
                  </>
                ) : (
                  <>
                    Your transaction is in our review queue. Our team will verify the payment on-chain and approve your
                    workforce access—usually within 2–24 hours.
                  </>
                )}
              </p>
              <ul className="workforce-pending-checklist">
                <li className="done">Transaction hash received</li>
                <li className="done">Confirmation saved to your account</li>
                <li className="active workforce-pending-checklist-active-icon">
                  <FiClock className="workforce-pending-checklist-clock" aria-hidden />
                  Admin review in progress
                </li>
              </ul>
            </div>

            <div className="workforce-pending-grid">
              <div className="workforce-pending-main">
                <h3 className="workforce-pending-section-title">Status</h3>
                <ol className="workforce-pending-timeline">
                  <li className="workforce-pending-timeline-item done">
                    <span className="workforce-pending-timeline-dot" />
                    <div>
                      <strong>Payment submitted</strong>
                      <p className="workforce-pending-timeline-meta">{submittedAt}</p>
                    </div>
                  </li>
                  <li className="workforce-pending-timeline-item active">
                    <span className="workforce-pending-timeline-dot" />
                    <div>
                      <strong>Admin review</strong>
                      <p className="workforce-pending-timeline-meta">Typical time: 2–6 hours</p>
                    </div>
                  </li>
                  <li className="workforce-pending-timeline-item upcoming">
                    <span className="workforce-pending-timeline-dot" />
                    <div>
                      <strong>{isUpgradeFlow ? 'Tier applied' : 'Workforce activated'}</strong>
                      <p className="workforce-pending-timeline-meta">
                        {isUpgradeFlow ? 'Applies after admin approval' : 'Unlocks after admin approval'}
                      </p>
                    </div>
                  </li>
                </ol>

                <h3 className="workforce-pending-section-title">Submitted payment</h3>
                <div className="workforce-pending-detail-card workforce-pending-detail-highlight">
                  <span className="workforce-pending-received-badge">Received</span>
                  <div className="workforce-pending-detail-row">
                    <span>Submitted amount</span>
                    <span>
                      {btcDisplay} BTC (~${usdDisplay} USD)
                    </span>
                  </div>
                  <div className="workforce-pending-detail-row">
                    <span>Selected tier</span>
                    <span>{tierLabel}</span>
                  </div>
                  <div className="workforce-pending-detail-row">
                    <span>Submission time</span>
                    <span>{submittedAt}</span>
                  </div>
                </div>

                <h3 className="workforce-pending-section-title">Transaction details</h3>
                <div className="workforce-pending-detail-card">
                  <div className="workforce-pending-detail-row">
                    <span>Transaction hash (TXID)</span>
                    <div className="workforce-pending-copy-row">
                      <code className="workforce-pending-mono">{txDisplay}</code>
                      {payment?.tx_hash && (
                        <button
                          type="button"
                          className="payment-copy-btn"
                          onClick={() => void copyText(payment.tx_hash!, 'tx')}
                        >
                          <FiCopy aria-hidden />
                          {copiedTx ? 'Copied' : 'Copy'}
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="workforce-pending-detail-row">
                    <span>Review reference</span>
                    <div className="workforce-pending-copy-row">
                      <code className="workforce-pending-mono">{refDisplay}</code>
                      <button
                        type="button"
                        className="payment-copy-btn"
                        onClick={() =>
                          void copyText(
                            payment?.review_reference_id ?? payment?.id ?? refDisplay,
                            'ref',
                          )
                        }
                      >
                        <FiCopy aria-hidden />
                        {copiedRef ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>
                  <div className="workforce-pending-detail-row">
                    <span>Submitted (UTC)</span>
                    <span>{submittedAt}</span>
                  </div>
                </div>
              </div>

              <aside className="workforce-pending-aside">
                <div className="workforce-pending-summary-card">
                  <h4>{tierLabel} membership</h4>
                  <p className="workforce-pending-summary-sub">One-time enrollment fee</p>
                  <p className="workforce-pending-status-pill">Under review</p>
                  <dl className="workforce-pending-dl">
                    <div>
                      <dt>Amount</dt>
                      <dd>
                        {btcDisplay} BTC (~${usdDisplay} USD)
                      </dd>
                    </div>
                    <div>
                      <dt>Currency</dt>
                      <dd>{currencyLabel}</dd>
                    </div>
                    <div>
                      <dt>Network</dt>
                      <dd>
                        {currencyKey === 'btc'
                          ? 'BTC mainnet'
                          : currencyKey === 'usdt'
                            ? 'ERC-20'
                            : 'Ethereum'}
                      </dd>
                    </div>
                  </dl>
                </div>
                <div className="workforce-pending-estimate-card">
                  <p className="workforce-pending-estimate-label">Estimated review time</p>
                  <p className="workforce-pending-estimate-value">2–6 hours typical</p>
                  <div className="workforce-pending-progress" aria-hidden />
                </div>
                <div className="workforce-pending-email-card">
                  <FiShield aria-hidden />
                  <p>
                    We’ll use <strong>{profile?.email ?? 'your account email'}</strong> for status
                    updates when your access is approved.
                  </p>
                </div>
              </aside>
            </div>

            <section className="workforce-pending-next">
              <h3 className="workforce-pending-section-title">What happens next?</h3>
              <div className="workforce-pending-next-grid">
                <article className="workforce-pending-next-card">
                  <strong>Blockchain verification</strong>
                  <p>We confirm your transaction against the network using the TXID you provided.</p>
                </article>
                <article className="workforce-pending-next-card">
                  <strong>Admin approval</strong>
                  <p>A reviewer validates amount, tier, and account details match our records.</p>
                </article>
                <article className="workforce-pending-next-card">
                  <strong>Account activation</strong>
                  <p>Once approved, Dashboard, Surveys, and Earnings unlock immediately.</p>
                </article>
              </div>
            </section>

            <section className="workforce-pending-help">
              <h3 className="workforce-pending-section-title">Need help?</h3>
              <p>Contact support with your <strong>review reference</strong> and <strong>TXID</strong> so we can find your payment quickly.</p>
              <div className="workforce-pending-help-warn">
                Include your reference ID ({refDisplay}) and full transaction hash when you reach out.
              </div>
            </section>

            <div className="workforce-pending-actions">
              <button
                type="button"
                className="workforce-pending-btn primary"
                disabled
                title="Available after workforce approval"
              >
                Go to dashboard (locked)
              </button>
              <button
                type="button"
                className="workforce-pending-btn secondary"
                onClick={() =>
                  navigate(
                    `/dashboard/workforce/payment?tier=${encodeURIComponent(payment.tier_id)}`,
                  )
                }
              >
                Back to payment
              </button>
              <button
                type="button"
                className="workforce-pending-btn secondary"
                onClick={() => void handleRefresh()}
                disabled={refreshing}
              >
                <FiRefreshCw className={refreshing ? 'spin' : ''} aria-hidden />
                {refreshing ? 'Refreshing…' : 'Refresh status'}
              </button>
            </div>
          </>
        )}
      </div>
    </AppSidebarLayout>
  )
}
