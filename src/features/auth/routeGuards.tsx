import type { ReactElement } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import {
  canAccessOnboardingStep,
  canAccessJoinWorkforce,
  isAdminApproved,
  isOnboardingRejected,
  isProfileMarkedOnboardingComplete,
  isOnboardingComplete,
  isWorkforceApproved,
  hasWorkforcePaymentReviewAccess,
  hasJoinedWorkforce,
  type OnboardingStepId,
} from './types'

type GuardProps = {
  children: ReactElement
}

type RequireOnboardingStepProps = GuardProps & {
  step: OnboardingStepId
}

const adminEmails = (import.meta.env.VITE_ADMIN_EMAILS ?? '')
  .split(',')
  .map((email: string) => email.trim().toLowerCase())
  .filter(Boolean)

type RequireAuthProps = GuardProps & { redirectTo?: string }

export function RequireAuth({ children, redirectTo = '/sign-in' }: RequireAuthProps) {
  const { loading, user, configured, profileReady } = useAuth()
  if (!configured) {
    return (
      <section style={{ padding: '24px' }}>
        Supabase environment variables are missing. Set `VITE_SUPABASE_URL` and
        `VITE_SUPABASE_ANON_KEY`.
      </section>
    )
  }
  if (loading) return <section style={{ padding: '24px' }}>Loading...</section>
  if (!user) return <Navigate to={redirectTo} replace />
  if (!profileReady) return <section style={{ padding: '24px' }}>Loading...</section>
  return children
}

export function RequireOnboardingStep({ children, step }: RequireOnboardingStepProps) {
  const { loading, onboarding, profile } = useAuth()
  if (loading) return <section style={{ padding: '24px' }}>Loading...</section>
  if (isAdminApproved(profile)) {
    return <Navigate to="/dashboard" replace />
  }
  if (isOnboardingRejected(profile)) {
    if (step === 'profile') return children
    return <Navigate to="/dashboard/onboarding/profile" replace />
  }
  if (isProfileMarkedOnboardingComplete(profile) || isOnboardingComplete(onboarding)) {
    return children
  }
  if (!canAccessOnboardingStep(step, onboarding)) {
    if (step === 'skill') return <Navigate to="/dashboard/onboarding/profile" replace />
    if (step === 'id') return <Navigate to="/dashboard/onboarding/skills" replace />
    return <Navigate to="/dashboard/onboarding/id-verification" replace />
  }
  return children
}

export function RequireOnboardingComplete({ children }: GuardProps) {
  const { loading, onboarding, profile } = useAuth()
  if (loading) return <section style={{ padding: '24px' }}>Loading...</section>
  if (isOnboardingRejected(profile)) {
    return <Navigate to="/dashboard/onboarding" replace />
  }
  if (!isOnboardingComplete(onboarding) && !isProfileMarkedOnboardingComplete(profile)) {
    return <Navigate to="/dashboard/onboarding" replace />
  }
  return children
}

export function RequireWorkforceApproval({ children }: GuardProps) {
  const { loading, onboarding, profile } = useAuth()
  if (loading) return <section style={{ padding: '24px' }}>Loading...</section>
  if (!isWorkforceApproved(profile, onboarding)) {
    return <Navigate to="/dashboard/onboarding" replace />
  }
  return children
}

/** First-time workforce enrollment only — joined members are redirected to upgrade. */
export function RequireJoinWorkforceEligible({ children }: GuardProps) {
  const { loading, profile } = useAuth()
  if (loading) return <section style={{ padding: '24px' }}>Loading...</section>
  if (!profile) return <Navigate to="/sign-in" replace />
  if (isOnboardingRejected(profile)) {
    return <Navigate to="/dashboard/onboarding" replace />
  }
  if (hasJoinedWorkforce(profile)) {
    return <Navigate to="/dashboard/workforce/upgrade" replace />
  }
  if (!canAccessJoinWorkforce(profile)) {
    return <Navigate to="/dashboard/onboarding" replace />
  }
  return children
}

/**
 * Join flow or upgrade payment: onboarding approved and either not yet joined (enrollment) or
 * already in the workforce (tier upgrade).
 */
export function RequirePaymentFlowAccess({ children }: GuardProps) {
  const { loading, profile } = useAuth()
  if (loading) return <section style={{ padding: '24px' }}>Loading...</section>
  if (!profile) return <Navigate to="/sign-in" replace />
  if (isOnboardingRejected(profile)) {
    return <Navigate to="/dashboard/onboarding" replace />
  }
  if (profile.onboarding_status !== 'approved') {
    return <Navigate to="/dashboard/onboarding" replace />
  }
  if (hasJoinedWorkforce(profile) || canAccessJoinWorkforce(profile)) {
    return children
  }
  return <Navigate to="/dashboard/onboarding" replace />
}

/** Member must be fully approved and already in the workforce (tier upgrade page). */
export function RequireUpgradeMembership({ children }: GuardProps) {
  const { loading, profile, onboarding } = useAuth()
  if (loading) return <section style={{ padding: '24px' }}>Loading...</section>
  if (!isWorkforceApproved(profile, onboarding)) {
    return <Navigate to="/dashboard/onboarding" replace />
  }
  if (!hasJoinedWorkforce(profile)) {
    return <Navigate to="/dashboard/workforce/join" replace />
  }
  return children
}

/** User must have submitted payment and be waiting for admin (pending-review page). */
export function RequireWorkforcePaymentPending({ children }: GuardProps) {
  const { loading, profile, pendingWorkforcePaymentRow } = useAuth()
  if (loading) return <section style={{ padding: '24px' }}>Loading...</section>
  if (hasJoinedWorkforce(profile)) {
    if (pendingWorkforcePaymentRow) return children
    return <Navigate to="/dashboard/earnings" replace />
  }
  if (!hasWorkforcePaymentReviewAccess(profile, pendingWorkforcePaymentRow)) {
    return <Navigate to="/dashboard/workforce/join" replace />
  }
  return children
}

export function RequireAdmin({ children }: GuardProps) {
  const { loading, user } = useAuth()
  if (loading) return <section style={{ padding: '24px' }}>Loading...</section>

  if (adminEmails.length === 0) {
    return (
      <section style={{ padding: '24px' }}>
        Admin route is locked. Set `VITE_ADMIN_EMAILS` with one or more comma-separated admin
        emails.
      </section>
    )
  }

  const currentEmail = user?.email?.toLowerCase() ?? ''
  if (!adminEmails.includes(currentEmail)) {
    return <Navigate to="/admin/login" replace />
  }
  return children
}

