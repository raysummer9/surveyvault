import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { FiCopy, FiShield } from 'react-icons/fi'
import { HiOutlineMenu } from 'react-icons/hi'
import { assertSupabaseConfigured } from '../../lib/supabase'
import { paymentAddresses, PAYMENT_WINDOW_MINUTES } from '../../domain/paymentConfig'
import { fetchPlatformPaymentSettings } from '../../domain/platformPaymentSettings'
import {
  fetchMemberVerifiedMembershipTier,
  fetchPaymentCategoryByTierParam,
  type MembershipTier,
} from '../../domain/paymentCategory'
import { AppSidebarLayout, useSidebar } from '../../shared/ui/AppSidebarLayout'
import { useAuth } from '../auth/AuthContext'
import { hasJoinedWorkforce, hasWorkforcePaymentReviewAccess } from '../auth/types'
import { generateReviewReferenceId } from './workforcePaymentUtils'

const CURRENCY_TABS = [
  { id: 'btc', label: 'BTC', network: 'BTC Network' },
  { id: 'eth', label: 'ETH', network: 'Ethereum' },
  { id: 'usdt', label: 'USDT', network: 'ERC-20' },
] as const

const FAQ_ITEMS = [
  {
    q: 'What if I sent the wrong amount?',
    a: 'Contact support immediately with your transaction hash. We may be able to process a partial refund or apply the difference to your account.',
  },
  {
    q: 'How long does verification take?',
    a: 'Admin review typically takes 2–24 hours. You will receive an email once your payment has been verified and your workforce access is activated.',
  },
  {
    q: 'Can I pay with USDT or ETH instead?',
    a: 'Yes. Use the tabs above to switch to ETH or USDT. Send the equivalent amount at the current exchange rate. Ensure you use the correct network (ERC-20 for USDT).',
  },
]

function PaymentHeader({ isUpgrade }: { isUpgrade: boolean }) {
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
      <span>{isUpgrade ? 'Upgrade payment' : 'Crypto Payment'}</span>
    </header>
  )
}

export function PaymentPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, profile, patchProfile, pendingWorkforcePaymentRow } = useAuth()
  const tierParam = searchParams.get('tier')

  const [currencyTab, setCurrencyTab] = useState<'btc' | 'eth' | 'usdt'>('btc')
  const [txHash, setTxHash] = useState('')
  const [walletAddress, setWalletAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [confirmSent, setConfirmSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [expiresAt, setExpiresAt] = useState<Date | null>(null)
  const [expiryMins, setExpiryMins] = useState(PAYMENT_WINDOW_MINUTES)
  const [expirySecs, setExpirySecs] = useState(0)
  const [faqOpen, setFaqOpen] = useState<number | null>(null)
  const [tier, setTier] = useState<MembershipTier | null>(null)
  const [tierLoading, setTierLoading] = useState(true)
  const [tierLoadError, setTierLoadError] = useState('')
  /** True immediately after successful submit — stepper jumps to Active before route change (no admin approval needed). */
  const [verificationSubmitted, setVerificationSubmitted] = useState(false)

  const [depositAddresses, setDepositAddresses] = useState<Record<string, string>>(() => ({
    btc: paymentAddresses.btc,
    eth: paymentAddresses.eth,
    usdt: paymentAddresses.usdt,
  }))
  const [paymentWindowMinutes, setPaymentWindowMinutes] = useState(PAYMENT_WINDOW_MINUTES)

  useEffect(() => {
    void fetchPlatformPaymentSettings()
      .then((row) => {
        if (!row) return
        setDepositAddresses({
          btc: row.btc_address,
          eth: row.eth_address,
          usdt: row.usdt_address,
        })
        setPaymentWindowMinutes(row.payment_window_minutes)
      })
      .catch(() => {
        /* keep fallback from paymentConfig */
      })
  }, [])

  useEffect(() => {
    if (hasWorkforcePaymentReviewAccess(profile, pendingWorkforcePaymentRow)) {
      navigate('/dashboard/workforce/pending-review', { replace: true })
    }
  }, [profile, pendingWorkforcePaymentRow, navigate])

  const isUpgrade = hasJoinedWorkforce(profile)
  const plansPath = isUpgrade ? '/dashboard/workforce/upgrade' : '/dashboard/workforce/join'

  useEffect(() => {
    if (!tierParam?.trim()) {
      navigate(plansPath, { replace: true })
      return
    }

    let cancelled = false
    setTierLoading(true)
    setTierLoadError('')
    setTier(null)
    setExpiresAt(null)

    void fetchPaymentCategoryByTierParam(tierParam)
      .then((t) => {
        if (cancelled) return
        if (!t) {
          navigate(plansPath, { replace: true })
          return
        }
        setTier(t)
      })
      .catch((e) => {
        if (cancelled) return
        setTierLoadError(e instanceof Error ? e.message : 'Could not load plan.')
        setTier(null)
      })
      .finally(() => {
        if (!cancelled) setTierLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [tierParam, navigate, plansPath])

  /** Block paying for same or lower tier when upgrading (direct URL manipulation). */
  useEffect(() => {
    if (!isUpgrade || !tier || !user?.id) return
    let cancelled = false
    void fetchMemberVerifiedMembershipTier(user.id).then((verified) => {
      if (cancelled) return
      if (verified && tier.sortOrder <= verified.sortOrder) {
        navigate('/dashboard/workforce/upgrade', { replace: true })
      }
    })
    return () => {
      cancelled = true
    }
  }, [isUpgrade, tier, user?.id, navigate])

  useEffect(() => {
    if (!tier) {
      setExpiresAt(null)
      return
    }
    const end = new Date()
    end.setMinutes(end.getMinutes() + paymentWindowMinutes)
    setExpiresAt(end)
  }, [tier, paymentWindowMinutes])

  useEffect(() => {
    if (!expiresAt) return
    const tick = () => {
      const now = new Date()
      const diff = expiresAt.getTime() - now.getTime()
      if (diff <= 0) {
        setExpiryMins(0)
        setExpirySecs(0)
        return
      }
      setExpiryMins(Math.floor(diff / 60000))
      setExpirySecs(Math.floor((diff % 60000) / 1000))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [expiresAt])

  const paymentAddress = depositAddresses[currencyTab] ?? depositAddresses.btc ?? ''

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(paymentAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('Could not copy address')
    }
  }

  const handlePasteTx = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setTxHash(text)
    } catch {
      setError('Could not paste from clipboard')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id || !tier || !txHash.trim() || !confirmSent) return
    setError('')
    setSubmitting(true)
    try {
      const client = assertSupabaseConfigured()
      const { error: insertError } = await client.from('workforce_payments').insert({
        user_id: user.id,
        tier_id: tier.id,
        amount_btc: tier.btcAmount,
        amount_usd: tier.usdAmount,
        currency_sent: currencyTab,
        tx_hash: txHash.trim(),
        amount_sent: tier.btcAmount,
        wallet_address: walletAddress.trim() || null,
        notes: notes.trim() || null,
        status: 'pending',
        review_reference_id: generateReviewReferenceId(),
      })

      if (insertError) throw insertError

      const { error: profileError } = await client
        .from('user_profiles')
        .update({
          workforce_payment_confirmed: true,
          workforce_payment_rejection_reason: null,
        })
        .eq('id', user.id)

      if (profileError) throw profileError

      // Sync React state before navigate so RequireWorkforcePaymentPending sees updated flags immediately.
      patchProfile({
        workforce_payment_confirmed: true,
        workforce_payment_rejection_reason: null,
      })
      setVerificationSubmitted(true)
      // Do not call refreshUserState() here — it re-runs hydration immediately and can clear
      // pendingWorkforcePaymentRow / profile before the guard runs, bouncing you back to /join.
      navigate('/dashboard/workforce/pending-review', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to submit payment.')
    } finally {
      setSubmitting(false)
    }
  }

  if (tierLoading) {
    return (
      <AppSidebarLayout>
        <PaymentHeader isUpgrade={isUpgrade} />
        <div className="payment-page panel-muted" style={{ padding: '48px 24px' }}>
          <p>Loading payment plan…</p>
        </div>
      </AppSidebarLayout>
    )
  }

  if (tierLoadError) {
    return (
      <AppSidebarLayout>
        <PaymentHeader isUpgrade={isUpgrade} />
        <div className="payment-page panel-muted" style={{ padding: '48px 24px' }}>
          <p className="field-error">{tierLoadError}</p>
          <button type="button" className="workforce-join-proceed" onClick={() => navigate(plansPath)}>
            Back to plans
          </button>
        </div>
      </AppSidebarLayout>
    )
  }

  if (!tier) return null

  const onActiveEnrollmentStep =
    verificationSubmitted ||
    hasWorkforcePaymentReviewAccess(profile, pendingWorkforcePaymentRow)

  const stepperSteps = onActiveEnrollmentStep
    ? ([
        { id: 'verification', label: 'Verification', status: 'completed' as const },
        { id: 'plan', label: 'Choose Plan', status: 'completed' as const },
        { id: 'payment', label: 'Payment', status: 'completed' as const },
        { id: 'active', label: 'Active', status: 'active' as const },
      ] as const)
    : ([
        { id: 'verification', label: 'Verification', status: 'completed' as const },
        { id: 'plan', label: 'Choose Plan', status: 'completed' as const },
        { id: 'payment', label: 'Payment', status: 'active' as const },
        { id: 'active', label: 'Active', status: 'upcoming' as const },
      ] as const)

  return (
    <AppSidebarLayout>
      <PaymentHeader isUpgrade={isUpgrade} />
      <div className="payment-page">
        <div className="payment-header">
          <h1 className="payment-title">{isUpgrade ? 'Upgrade payment' : 'Crypto Payment'}</h1>
          <div className="payment-badges">
            <span className="payment-badge payment-badge-plan">
              {tier.name} Plan — {tier.btcAmount} BTC
            </span>
            <span className="payment-badge payment-badge-pending">Awaiting Payment</span>
          </div>
        </div>

        <div className="payment-stepper">
          {stepperSteps.map((step, i) => (
            <div
              key={step.id}
              className={`workforce-join-step ${step.status === 'completed' ? 'completed' : ''} ${step.status === 'active' ? 'active' : ''}`}
            >
              <span className="workforce-join-step-marker">
                {step.status === 'completed' ? '✓' : i + 1}
              </span>
              <span className="workforce-join-step-label">{step.label}</span>
              {i < stepperSteps.length - 1 && <span className="workforce-join-step-line" />}
            </div>
          ))}
        </div>

        <div className="payment-alert">
          <strong>Important:</strong> Send the exact amount. Send exactly {tier.btcAmount} BTC to the
          address below. Do not send from an exchange wallet — use a personal wallet only.
        </div>

        <div className="payment-grid">
          <div className="payment-address-card">
            <div className="payment-tabs">
              {CURRENCY_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={`payment-tab ${currencyTab === tab.id ? 'active' : ''}`}
                  onClick={() => setCurrencyTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="payment-amount-row">
              <span className="payment-amount">
                {tier.btcAmount} BTC ≈ ${tier.usdAmount.toLocaleString()}.00 USD
              </span>
              <span className="payment-network">{CURRENCY_TABS.find((t) => t.id === currencyTab)?.network}</span>
            </div>
            <div className="payment-address-input-wrap">
              <input
                type="text"
                readOnly
                value={paymentAddress}
                className="payment-address-input"
                aria-label="Payment address"
              />
              <button
                type="button"
                className="payment-copy-btn"
                onClick={handleCopy}
                aria-label="Copy address"
              >
                <FiCopy aria-hidden />
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="payment-qr-wrap">
              <QRCodeSVG value={paymentAddress} size={200} level="M" />
              <a href="#" className="payment-qr-download" onClick={(e) => e.preventDefault()}>
                Download QR
              </a>
            </div>
          </div>

          <div className="payment-sidebar">
            <div className="payment-window-card">
              <p className="payment-window-label">Payment window</p>
              <p className="payment-window-timer">
                {String(expiryMins).padStart(2, '0')}:{String(expirySecs).padStart(2, '0')} remaining
              </p>
            </div>
            <div className="payment-order-card">
              <h3 className="payment-order-title">Order Summary</h3>
              <p className="payment-order-detail">
                {tier.name} Membership (One-time {isUpgrade ? 'upgrade' : 'enrollment'} fee)
              </p>
              <dl className="payment-order-dl">
                <div>
                  <dt>Plan Price</dt>
                  <dd>${tier.usdAmount.toLocaleString()}.00</dd>
                </div>
                <div>
                  <dt>Network Fee</dt>
                  <dd>Included</dd>
                </div>
                <div>
                  <dt>Processing</dt>
                  <dd>Free</dd>
                </div>
              </dl>
              <p className="payment-order-total">
                Total: {tier.btcAmount} BTC (~${tier.usdAmount.toLocaleString()}.00 USD)
              </p>
            </div>
            <div className="payment-security-card">
              <FiShield aria-hidden />
              <p>This address is unique to your order. Transactions are verified by an admin within 24 hours.</p>
            </div>
          </div>
        </div>

        <section className="payment-instructions">
          <h3 className="payment-section-title">How to Complete Your Payment</h3>
          <ol className="payment-steps-list">
            <li>
              <strong>Open your crypto wallet</strong> (e.g., Trust Wallet, MetaMask).
            </li>
            <li>
              <strong>Select Send / Transfer</strong> — Choose {currencyTab.toUpperCase()} and the correct network.
            </li>
            <li>
              <strong>Enter address & amount</strong> — Paste the address and enter exactly {tier.btcAmount} {currencyTab.toUpperCase()}.
            </li>
            <li>
              <strong>Submit transaction hash below</strong> — Copy the TXID/hash for the next step.
            </li>
          </ol>
        </section>

        <form className="payment-form" onSubmit={handleSubmit}>
          <h3 className="payment-section-title">Submit Transaction for Verification</h3>
          <div className="payment-form-grid">
            <div className="payment-field">
              <label htmlFor="tx-hash">Transaction Hash / TXID</label>
              <div className="payment-field-with-btn">
                <input
                  id="tx-hash"
                  type="text"
                  value={txHash}
                  onChange={(e) => setTxHash(e.target.value)}
                  placeholder="Paste your transaction hash"
                  required
                />
                <button type="button" className="payment-paste-btn" onClick={handlePasteTx}>
                  Paste
                </button>
              </div>
            </div>
            <div className="payment-field">
              <label htmlFor="currency-sent">Currency Sent</label>
              <input
                id="currency-sent"
                type="text"
                value={CURRENCY_TABS.find((t) => t.id === currencyTab)?.label ?? 'Bitcoin (BTC)'}
                readOnly
                className="payment-readonly"
              />
            </div>
            <div className="payment-field">
              <label htmlFor="amount-sent">Amount Sent</label>
              <input
                id="amount-sent"
                type="text"
                value={`${tier.btcAmount} ${currencyTab.toUpperCase()}`}
                readOnly
                className="payment-readonly"
              />
            </div>
            <div className="payment-field payment-field-full">
              <label htmlFor="wallet-address">Your Sending Wallet Address (optional)</label>
              <input
                id="wallet-address"
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="Optional"
              />
            </div>
            <div className="payment-field payment-field-full">
              <label htmlFor="notes">Additional Notes (optional)</label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional"
                rows={3}
              />
            </div>
          </div>
          <label className="payment-checkbox-wrap">
            <input
              type="checkbox"
              checked={confirmSent}
              onChange={(e) => setConfirmSent(e.target.checked)}
              required
            />
            <span>
              I confirm that I have sent exactly {tier.btcAmount} {currencyTab.toUpperCase()} to the address above.
            </span>
          </label>
          <button
            type="submit"
            className="payment-submit-btn"
            disabled={submitting || !txHash.trim() || !confirmSent}
          >
            {submitting ? 'Submitting...' : 'Submit for Verification'}
          </button>
          <p className="payment-form-note">Admin review typically takes 2–24 hours.</p>
        </form>

        <section className="payment-faq">
          <h3 className="payment-section-title">Common Questions</h3>
          {FAQ_ITEMS.map((item, i) => (
            <div
              key={i}
              className={`payment-faq-item ${faqOpen === i ? 'open' : ''}`}
            >
              <button
                type="button"
                className="payment-faq-question"
                onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                aria-expanded={faqOpen === i}
              >
                {item.q}
              </button>
              {faqOpen === i && <p className="payment-faq-answer">{item.a}</p>}
            </div>
          ))}
        </section>

        {error && <p className="payment-error">{error}</p>}
      </div>
    </AppSidebarLayout>
  )
}
