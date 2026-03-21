import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiLock, FiShield } from 'react-icons/fi'
import { HiOutlineMenu } from 'react-icons/hi'
import {
  fetchActivePaymentCategories,
  fetchMemberVerifiedMembershipTier,
  getTiersAbove,
  type MembershipTier,
} from '../../domain/paymentCategory'
import { AppSidebarLayout, useSidebar } from '../../shared/ui/AppSidebarLayout'
import { useAuth } from '../auth/AuthContext'
import { hasWorkforcePaymentReviewAccess } from '../auth/types'

function UpgradeHeader() {
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
      <span>Upgrade plan</span>
    </header>
  )
}

export function UpgradeMembershipPage() {
  const navigate = useNavigate()
  const { user, profile, pendingWorkforcePaymentRow } = useAuth()
  const [membershipTiers, setMembershipTiers] = useState<MembershipTier[]>([])
  const [currentTier, setCurrentTier] = useState<MembershipTier | null>(null)
  const [tiersLoading, setTiersLoading] = useState(true)
  const [tiersError, setTiersError] = useState('')
  const [selectedTierId, setSelectedTierId] = useState<string | null>(null)

  useEffect(() => {
    if (hasWorkforcePaymentReviewAccess(profile, pendingWorkforcePaymentRow)) {
      navigate('/dashboard/workforce/pending-review', { replace: true })
    }
  }, [profile, pendingWorkforcePaymentRow, navigate])

  const load = useCallback(async () => {
    if (!user?.id) return
    setTiersError('')
    setTiersLoading(true)
    try {
      const [all, verified] = await Promise.all([
        fetchActivePaymentCategories(),
        fetchMemberVerifiedMembershipTier(user.id),
      ])
      setCurrentTier(verified)
      setMembershipTiers(getTiersAbove(verified, all))
    } catch (e) {
      setTiersError(e instanceof Error ? e.message : 'Could not load payment plans.')
      setMembershipTiers([])
      setCurrentTier(null)
    } finally {
      setTiersLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    void load()
  }, [load])

  const handleSelectTier = (tierId: string) => {
    setSelectedTierId(tierId)
  }

  const handleProceedToPayment = () => {
    if (!selectedTierId) return
    navigate(`/dashboard/workforce/payment?tier=${encodeURIComponent(selectedTierId)}`)
  }

  const selectedTier = membershipTiers.find((t) => t.id === selectedTierId)

  return (
    <AppSidebarLayout>
      <UpgradeHeader />
      <div className="workforce-join-page">
        <div className="workforce-join-header">
          <Link to="/dashboard/earnings" className="workforce-upgrade-back-link">
            <FiArrowLeft aria-hidden />
            Back to dashboard
          </Link>
          <div className="workforce-join-header-top">
            <h1 className="workforce-join-title">Upgrade your membership</h1>
            <button type="button" className="workforce-join-plan-btn">
              Higher tiers
            </button>
          </div>

          <div className="workforce-join-banner">
            <span className="workforce-join-badge">Membership upgrade</span>
            <h2 className="workforce-join-heading">Unlock more surveys &amp; limits</h2>
            <p className="workforce-join-desc">
              {currentTier ? (
                <>
                  You’re on <strong>{currentTier.name}</strong>. Choose a higher tier to access
                  surveys and benefits that require it. Payment is a one-time crypto fee for the
                  upgrade — same verification process as when you joined.
                </>
              ) : (
                <>
                  Choose a higher tier to access surveys and benefits that require it. Payment is a
                  one-time crypto fee — verified by an admin like your original enrollment.
                </>
              )}
            </p>
            <div className="workforce-join-secure">
              <FiShield aria-hidden />
              Secure Payment - Crypto only
            </div>
          </div>

          <div className="workforce-join-stepper">
            {(
              [
                { id: 'current', label: 'Current plan', status: 'completed' as const },
                { id: 'upgrade', label: 'Choose upgrade', status: 'active' as const },
                { id: 'payment', label: 'Payment', status: 'upcoming' as const },
                { id: 'active', label: 'Verified', status: 'upcoming' as const },
              ] as const
            ).map((step, i, arr) => (
              <div
                key={step.id}
                className={`workforce-join-step ${step.status === 'completed' ? 'completed' : ''} ${step.status === 'active' ? 'active' : ''}`}
              >
                <span className="workforce-join-step-marker">
                  {step.status === 'completed' ? '✓' : i + 1}
                </span>
                <span className="workforce-join-step-label">{step.label}</span>
                {i < arr.length - 1 && <span className="workforce-join-step-line" />}
              </div>
            ))}
          </div>
        </div>

        {tiersLoading ? (
          <div className="panel-muted workforce-join-plans-loading">
            <p>Loading upgrade options…</p>
          </div>
        ) : tiersError ? (
          <div className="panel-muted workforce-join-plans-error">
            <p>{tiersError}</p>
            <button type="button" className="workforce-join-proceed" onClick={() => void load()}>
              Retry
            </button>
          </div>
        ) : membershipTiers.length === 0 ? (
          <div className="panel-muted workforce-join-plans-empty">
            <p>
              {currentTier
                ? `You’re already on our highest available plan (${currentTier.name}).`
                : 'No upgrade tiers are available right now. Please check back later.'}
            </p>
            <Link to="/dashboard/surveys" className="workforce-join-proceed" style={{ display: 'inline-block', marginTop: 12 }}>
              Browse surveys
            </Link>
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
                    <span className="workforce-tier-badge workforce-tier-badge-popular">{tier.badge}</span>
                  )}
                  <h3 className="workforce-tier-name">{tier.name}</h3>
                  <div className="workforce-tier-price">
                    <span className="workforce-tier-btc">{tier.btcAmount} BTC</span>
                    <span className="workforce-tier-usd">~${tier.usdAmount.toLocaleString()} USD</span>
                  </div>
                  <p className="workforce-tier-sub">One-time upgrade fee</p>
                  <ul className="workforce-tier-features">
                    {tier.features.map((f) => (
                      <li key={f.text} className={f.included ? 'included' : 'excluded'}>
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
            Upgrades use the same crypto payment flow (BTC, ETH, or USDT). An admin will verify your
            payment before your new tier applies to surveys and limits.
          </p>
        </div>

        {membershipTiers.length > 0 ? (
          <div className="workforce-join-cta">
            <h3 className="workforce-join-cta-title">Ready to upgrade?</h3>
            <p className="workforce-join-cta-status">
              {selectedTier ? `Selected: ${selectedTier.name}` : 'Select a tier above'}
            </p>
            <button
              type="button"
              className="workforce-join-proceed"
              disabled={!selectedTierId || tiersLoading || membershipTiers.length === 0}
              onClick={handleProceedToPayment}
            >
              <FiLock aria-hidden />
              Proceed to payment
            </button>
          </div>
        ) : null}
      </div>
    </AppSidebarLayout>
  )
}
