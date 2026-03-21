import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiLock, FiShield } from 'react-icons/fi'
import { HiOutlineMenu } from 'react-icons/hi'
import { fetchActivePaymentCategories, type MembershipTier } from '../../domain/paymentCategory'
import { AppSidebarLayout, useSidebar } from '../../shared/ui/AppSidebarLayout'
import { useAuth } from '../auth/AuthContext'
import {
  hasWorkforcePaymentReviewAccess,
  hasWorkforcePaymentRejected,
} from '../auth/types'

function JoinWorkforceHeader() {
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
      <span>Join the Workforce</span>
    </header>
  )
}

export function JoinWorkforcePage() {
  const navigate = useNavigate()
  const { profile, pendingWorkforcePaymentRow } = useAuth()
  const [membershipTiers, setMembershipTiers] = useState<MembershipTier[]>([])
  const [tiersLoading, setTiersLoading] = useState(true)
  const [tiersError, setTiersError] = useState('')
  const [selectedTierId, setSelectedTierId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const rejectionReason = profile?.workforce_payment_rejection_reason?.trim()
  const showRejectionBanner = hasWorkforcePaymentRejected(profile)

  const atActiveEnrollmentStep = hasWorkforcePaymentReviewAccess(profile, pendingWorkforcePaymentRow)
  const stepperSteps = atActiveEnrollmentStep
    ? ([
        { id: 'verification', label: 'Verification', status: 'completed' as const },
        { id: 'plan', label: 'Choose Plan', status: 'completed' as const },
        { id: 'payment', label: 'Payment', status: 'completed' as const },
        { id: 'active', label: 'Active', status: 'active' as const },
      ] as const)
    : ([
        { id: 'verification', label: 'Verification', status: 'completed' as const },
        { id: 'plan', label: 'Choose Plan', status: 'active' as const },
        { id: 'payment', label: 'Payment', status: 'upcoming' as const },
        { id: 'active', label: 'Active', status: 'upcoming' as const },
      ] as const)

  useEffect(() => {
    if (hasWorkforcePaymentReviewAccess(profile, pendingWorkforcePaymentRow)) {
      navigate('/dashboard/workforce/pending-review', { replace: true })
    }
  }, [profile, pendingWorkforcePaymentRow, navigate])

  const loadTiers = useCallback(async () => {
    setTiersError('')
    setTiersLoading(true)
    try {
      const rows = await fetchActivePaymentCategories()
      setMembershipTiers(rows)
    } catch (e) {
      setTiersError(e instanceof Error ? e.message : 'Could not load payment plans.')
      setMembershipTiers([])
    } finally {
      setTiersLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadTiers()
  }, [loadTiers])

  const handleSelectTier = (tierId: string) => {
    setSelectedTierId(tierId)
    setError('')
  }

  const handleProceedToPayment = () => {
    if (!selectedTierId) return
    navigate(`/dashboard/workforce/payment?tier=${encodeURIComponent(selectedTierId)}`)
  }

  const selectedTier = membershipTiers.find((t) => t.id === selectedTierId)

  return (
    <AppSidebarLayout>
      <JoinWorkforceHeader />
      <div className="workforce-join-page">
        {showRejectionBanner && rejectionReason && (
          <div className="workforce-rejection-banner" role="alert">
            <h2 className="workforce-rejection-title">Payment not approved</h2>
            <p className="workforce-rejection-intro">
              An admin reviewed your submission and left this message:
            </p>
            <blockquote className="workforce-rejection-note">{rejectionReason}</blockquote>
            <p className="workforce-rejection-hint">
              Choose a plan below and submit payment again when you’re ready.
            </p>
          </div>
        )}
        <div className="workforce-join-header">
          <div className="workforce-join-header-top">
            <h1 className="workforce-join-title">Join the Workforce</h1>
            <button type="button" className="workforce-join-plan-btn">
              Choose Your Plan
            </button>
          </div>

          <div className="workforce-join-banner">
            <span className="workforce-join-badge">One-Time Enrollment</span>
            <h2 className="workforce-join-heading">Select Your Membership Tier</h2>
            <p className="workforce-join-desc">
              Choose the plan that fits your goals. Each tier unlocks different survey access
              levels, payout limits, and priority matching. Payment is a one-time crypto fee — no
              recurring charges.
            </p>
            <div className="workforce-join-secure">
              <FiShield aria-hidden />
              Secure Payment - Crypto only
            </div>
          </div>

          <div className="workforce-join-stepper">
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
        </div>

        {tiersLoading ? (
          <div className="panel-muted workforce-join-plans-loading">
            <p>Loading payment plans…</p>
          </div>
        ) : tiersError ? (
          <div className="panel-muted workforce-join-plans-error">
            <p>{tiersError}</p>
            <button type="button" className="workforce-join-proceed" onClick={() => void loadTiers()}>
              Retry
            </button>
          </div>
        ) : membershipTiers.length === 0 ? (
          <div className="panel-muted workforce-join-plans-empty">
            <p>No payment plans are available yet. Please check back later or contact support.</p>
          </div>
        ) : (
          <div className="workforce-join-cards">
            {membershipTiers.map((tier) => {
              const isSelected = selectedTierId === tier.id
              return (
                <div
                  key={tier.id}
                  className={`workforce-tier-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelectTier(tier.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleSelectTier(tier.id)
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSelected}
                >
                  {tier.badge && (
                    <span className="workforce-tier-badge workforce-tier-badge-popular">
                      {tier.badge}
                    </span>
                  )}
                  <h3 className="workforce-tier-name">{tier.name}</h3>
                  <div className="workforce-tier-price">
                    <span className="workforce-tier-btc">{tier.btcAmount} BTC</span>
                    <span className="workforce-tier-usd">~${tier.usdAmount.toLocaleString()} USD</span>
                  </div>
                  <p className="workforce-tier-sub">One-time fee</p>
                  <ul className="workforce-tier-features">
                    {tier.features.map((f) => (
                      <li
                        key={f.text}
                        className={f.included ? 'included' : 'excluded'}
                      >
                        {f.included ? '✓' : '✗'} {f.text}
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    className={`workforce-tier-select workforce-tier-select-${tier.buttonColor}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSelectTier(tier.id)
                    }}
                  >
                    Select {tier.name}
                  </button>
                </div>
              )
            })}
          </div>
        )}

        <div className="workforce-join-info">
          <p>
            All plans include a one-time crypto payment (BTC, ETH, or USDT). Tiers can be upgraded
            later.
          </p>
        </div>

        <div className="workforce-join-cta">
          <h3 className="workforce-join-cta-title">Ready to proceed?</h3>
          <p className="workforce-join-cta-status">
            {selectedTier
              ? `Selected: ${selectedTier.name}`
              : 'No plan selected yet'}
          </p>
          <button
            type="button"
            className="workforce-join-proceed"
            disabled={!selectedTierId || tiersLoading || membershipTiers.length === 0}
            onClick={handleProceedToPayment}
          >
            <FiLock aria-hidden />
            Proceed to Payment
          </button>
        </div>

        {error && <p className="workforce-join-error">{error}</p>}
      </div>
    </AppSidebarLayout>
  )
}
