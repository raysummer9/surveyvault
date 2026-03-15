import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { isAdminApproved, hasJoinedWorkforce } from './types'

/**
 * Redirects authenticated users to the appropriate dashboard route based on
 * onboarding/approval/joined state. Used as the dashboard index and after sign-in.
 */
export function PostLoginRedirect() {
  const { loading, user, profile } = useAuth()

  // Wait for profile to load when authenticated (loadUserState runs async after auth change)
  if (loading || (user && profile === null)) {
    return <section style={{ padding: '24px' }}>Loading...</section>
  }

  if (isAdminApproved(profile)) {
    if (hasJoinedWorkforce(profile)) {
      return <Navigate to="/dashboard/earnings" replace />
    }
    return <Navigate to="/dashboard/workforce/join" replace />
  }

  return <Navigate to="/dashboard/onboarding" replace />
}
