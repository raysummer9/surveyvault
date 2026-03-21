import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IoCheckmarkCircleOutline, IoLogOutOutline, IoPersonOutline } from 'react-icons/io5'
import { APP_NAME } from '../../config/brand'
import { fetchMemberVerifiedMembershipTier, type MembershipTier } from '../../domain/paymentCategory'
import { useAuth } from '../../features/auth/AuthContext'
import { hasWorkforcePaymentReviewAccess } from '../../features/auth/types'
import { MembershipTierBadge } from './MembershipTierBadge'

type SidebarMemberCardProps = {
  onAfterLogout?: () => void
}

function getOnboardingStatusLabel(onboardingStatus: string | null | undefined) {
  if (onboardingStatus === 'approved') return 'Approved'
  if (onboardingStatus === 'completed') return 'Pending Approval'
  if (onboardingStatus === 'rejected') return 'Onboarding Rejected'
  return 'Onboarding In Progress'
}

export function SidebarMemberCard({ onAfterLogout }: SidebarMemberCardProps) {
  const navigate = useNavigate()
  const { user, profile, signOut, pendingWorkforcePaymentRow } = useAuth()
  const [membershipTier, setMembershipTier] = useState<MembershipTier | null>(null)
  const [confirmingLogout, setConfirmingLogout] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [logoutError, setLogoutError] = useState('')

  useEffect(() => {
    if (!user?.id) {
      setMembershipTier(null)
      return
    }
    let cancelled = false
    void (async () => {
      try {
        const tier = await fetchMemberVerifiedMembershipTier(user.id)
        if (!cancelled) setMembershipTier(tier)
      } catch {
        if (!cancelled) setMembershipTier(null)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [user?.id])

  const displayName = useMemo(() => {
    const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ').trim()
    if (fullName) return fullName
    if (user?.email) return user.email.split('@')[0] ?? 'Member'
    return 'Member'
  }, [profile?.first_name, profile?.last_name, user?.email])

  const awaitingPaymentReview = hasWorkforcePaymentReviewAccess(profile, pendingWorkforcePaymentRow)
  const onboardingStatusLabel = awaitingPaymentReview
    ? 'Payment review'
    : getOnboardingStatusLabel(profile?.onboarding_status)
  const isApproved = profile?.onboarding_status === 'approved'

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true)
    setLogoutError('')
    try {
      await signOut()
      onAfterLogout?.()
      navigate('/sign-in')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to log out right now.'
      setLogoutError(message)
      setIsLoggingOut(false)
    }
  }

  return (
    <>
      <div className={`onboarding-member ${isApproved ? 'onboarding-member-approved' : ''}`}>
        <div className="onboarding-member-main">
          {isApproved ? <IoCheckmarkCircleOutline className="onboarding-member-approved-icon" /> : <IoPersonOutline />}
          <div className="onboarding-member-text">
            <p>{displayName}</p>
            {membershipTier ? <MembershipTierBadge tier={membershipTier} variant="sidebar" /> : null}
            <small>{onboardingStatusLabel}</small>
          </div>
        </div>
        <button
          type="button"
          className="onboarding-member-logout"
          aria-label="Log out"
          onClick={() => {
            setLogoutError('')
            setConfirmingLogout(true)
          }}
        >
          <IoLogOutOutline />
        </button>
      </div>

      {confirmingLogout && (
        <div
          className="logout-toast-overlay"
          role="presentation"
          onClick={() => {
            if (isLoggingOut) return
            setConfirmingLogout(false)
          }}
        >
          <div
            className="logout-toast"
            role="alertdialog"
            aria-live="assertive"
            aria-label="Confirm logout"
            onClick={(event) => event.stopPropagation()}
          >
            <p>
              Log out from {APP_NAME}?
            </p>
            <small>Your current session will end on this device.</small>
            {logoutError && <span>{logoutError}</span>}
            <div className="logout-toast-actions">
              <button type="button" className="logout-toast-cancel" onClick={() => setConfirmingLogout(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="logout-toast-confirm"
                onClick={handleConfirmLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? 'Logging out...' : 'Yes, log out'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

