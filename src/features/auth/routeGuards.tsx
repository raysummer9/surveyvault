import type { ReactElement } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import {
  canAccessOnboardingStep,
  isAdminApproved,
  isOnboardingRejected,
  isProfileMarkedOnboardingComplete,
  isOnboardingComplete,
  isWorkforceApproved,
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

export function RequireAuth({ children }: GuardProps) {
  const { loading, user, configured } = useAuth()
  if (!configured) {
    return (
      <section style={{ padding: '24px' }}>
        Supabase environment variables are missing. Set `VITE_SUPABASE_URL` and
        `VITE_SUPABASE_ANON_KEY`.
      </section>
    )
  }
  if (loading) return <section style={{ padding: '24px' }}>Loading...</section>
  if (!user) return <Navigate to="/sign-in" replace />
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
    return <Navigate to="/dashboard/onboarding" replace />
  }
  return children
}

