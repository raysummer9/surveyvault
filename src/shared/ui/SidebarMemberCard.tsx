import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IoCheckmarkCircleOutline, IoLogOutOutline, IoPersonOutline } from 'react-icons/io5'
import { useAuth } from '../../features/auth/AuthContext'

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
  const { user, profile, signOut } = useAuth()
  const [confirmingLogout, setConfirmingLogout] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [logoutError, setLogoutError] = useState('')

  const displayName = useMemo(() => {
    const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ').trim()
    if (fullName) return fullName
    if (user?.email) return user.email.split('@')[0] ?? 'Member'
    return 'Member'
  }, [profile?.first_name, profile?.last_name, user?.email])

  const onboardingStatusLabel = getOnboardingStatusLabel(profile?.onboarding_status)
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
          <div>
            <p>{displayName}</p>
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
            <p>Log out from SurveyVault?</p>
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

