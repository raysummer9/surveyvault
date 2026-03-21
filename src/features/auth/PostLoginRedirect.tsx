import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import {
  canAccessJoinWorkforce,
  hasJoinedWorkforce,
  hasWorkforcePaymentReviewAccess,
} from './types'

/**
 * Redirects authenticated users to the appropriate dashboard route based on
 * onboarding/approval/joined state. Used as the dashboard index and after sign-in.
 */
export function PostLoginRedirect() {
  const { loading, profile, pendingWorkforcePaymentRow, profileReady } = useAuth()

  if (loading || !profileReady) {
    return <section style={{ padding: '24px' }}>Loading...</section>
  }

  if (hasWorkforcePaymentReviewAccess(profile, pendingWorkforcePaymentRow)) {
    return <Navigate to="/dashboard/workforce/pending-review" replace />
  }

  if (hasJoinedWorkforce(profile)) {
    return <Navigate to="/dashboard/earnings" replace />
  }

  /** Onboarding approved but not in workforce yet — continue enrollment at Join Workforce (then payment). */
  if (canAccessJoinWorkforce(profile)) {
    return <Navigate to="/dashboard/workforce/join" replace />
  }

  /** Still in onboarding, pending approval, rejected, etc. */
  return <Navigate to="/dashboard/onboarding" replace />
}
