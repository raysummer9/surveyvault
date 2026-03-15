import { useMemo } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import {
  IoAlertCircleOutline,
  IoBriefcaseOutline,
  IoGiftOutline,
  IoLocateOutline,
  IoLockClosedOutline,
  IoPersonCircleOutline,
  IoRibbonOutline,
  IoShieldCheckmarkOutline,
} from 'react-icons/io5'
import { useAuth } from '../auth/AuthContext'
import {
  getCompletedOnboardingSteps,
  isAdminApproved,
  isOnboardingRejected,
  isProfileMarkedOnboardingComplete,
  isWorkforceApproved,
  type OnboardingStepId,
} from '../auth/types'
import { AppSidebarLayout } from '../../shared/ui/AppSidebarLayout'
import { OnboardingTopbar } from '../../shared/ui/OnboardingTopbar'

type StepStatus = 'completed' | 'active' | 'locked'

type SetupStep = {
  id: OnboardingStepId
  title: string
  description: string
  path: string
}

const setupSteps: SetupStep[] = [
  {
    id: 'profile',
    title: 'Complete Profile',
    description: 'Tell us about yourself so we can match you with relevant surveys.',
    path: '/dashboard/onboarding/profile',
  },
  {
    id: 'skill',
    title: 'Skill Verification',
    description: 'Take a short assessment to verify your expertise areas.',
    path: '/dashboard/onboarding/skills',
  },
  {
    id: 'id',
    title: 'ID Verification',
    description: 'Upload a valid government-issued ID to verify your identity.',
    path: '/dashboard/onboarding/id-verification',
  },
  {
    id: 'address',
    title: 'Address Verification',
    description: 'Confirm your residential address for payment processing.',
    path: '/dashboard/onboarding/address-verification',
  },
]

export function OnboardingPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, onboarding, profile, refreshUserState, debug } = useAuth()
  const completedSteps = useMemo(() => {
    const submissionCompleted = getCompletedOnboardingSteps(onboarding)
    if (submissionCompleted.length > 0) return submissionCompleted
    if (isProfileMarkedOnboardingComplete(profile)) {
      return ['profile', 'skill', 'id', 'address']
    }
    return submissionCompleted
  }, [onboarding, profile])

  const completionPercent = Math.round((completedSteps.length / setupSteps.length) * 100)
  const activeIndex = setupSteps.findIndex((step) => !completedSteps.includes(step.id))
  const workforceUnlocked = isWorkforceApproved(profile, onboarding)
  const debugEnabled = useMemo(
    () => new URLSearchParams(location.search).get('debugOnboarding') === '1',
    [location.search],
  )
  const isRejected = isOnboardingRejected(profile)
  const isApproved = isAdminApproved(profile)

  if (isApproved) {
    return <Navigate to="/dashboard" replace />
  }

  const statuses = useMemo(
    () =>
      setupSteps.map((step, index) => {
        if (completedSteps.includes(step.id)) return 'completed'
        if (index === activeIndex || (activeIndex === -1 && index === setupSteps.length - 1)) return 'active'
        return 'locked'
      }),
    [activeIndex, completedSteps],
  )

  const handleStepAction = (step: SetupStep, status: StepStatus) => {
    if (status === 'locked') return
    navigate(step.path)
  }

  return (
    <AppSidebarLayout>
      <OnboardingTopbar
        title="Account Verification"
        chips={<span className="onboarding-chip">Action Required</span>}
      />
      <div className="onboarding-content">
          {debugEnabled && (
            <article className="profile-form-card">
              <header className="profile-card-header">
                <div>
                  <h3>Onboarding Debug</h3>
                  <p>Temporary diagnostics to inspect hydrated auth + onboarding state</p>
                </div>
              </header>
              <div className="panel-muted">
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {JSON.stringify(
                    {
                      authUserId: user?.id ?? null,
                      authEmail: user?.email ?? null,
                      configuredSupabaseUrl: import.meta.env.VITE_SUPABASE_URL ?? null,
                      profileId: profile?.id ?? null,
                      profileEmail: profile?.email ?? null,
                      profileOnboardingStatus: profile?.onboarding_status ?? null,
                      onboardingUserId: onboarding?.user_id ?? null,
                      onboardingUpdatedAt: onboarding?.updated_at ?? null,
                      onboardingFlags: onboarding
                        ? {
                            is_profile_complete: onboarding.is_profile_complete,
                            is_skill_complete: onboarding.is_skill_complete,
                            is_id_complete: onboarding.is_id_complete,
                            is_address_complete: onboarding.is_address_complete,
                            is_onboarding_complete: onboarding.is_onboarding_complete,
                            current_step: onboarding.current_step,
                          }
                        : null,
                      dataKeyCounts: onboarding
                        ? {
                            profile_data: Object.keys(onboarding.profile_data ?? {}).length,
                            skills_data: Object.keys(onboarding.skills_data ?? {}).length,
                            id_verification_data: Object.keys(onboarding.id_verification_data ?? {}).length,
                            address_data: Object.keys(onboarding.address_data ?? {}).length,
                          }
                        : null,
                      derived: {
                        completedSteps,
                        completionPercent,
                        workforceUnlocked,
                      },
                      authHydrationDebug: debug,
                    },
                    null,
                    2,
                  )}
                </pre>
              </div>
              <div className="actions">
                <button
                  className="button secondary"
                  type="button"
                  onClick={() => {
                    void refreshUserState()
                  }}
                >
                  Refresh Auth State
                </button>
              </div>
            </article>
          )}

          {isRejected && (
            <div className="onboarding-rejected-banner" role="alert">
              <IoAlertCircleOutline aria-hidden />
              <div>
                <strong>Onboarding rejected</strong>
                <p>Your previous submission was not accepted. Please review the steps below and resubmit your information.</p>
              </div>
            </div>
          )}

          <article className="onboarding-welcome-card">
            <h3>Welcome to the team! 👋</h3>
            <p>
              To maintain the quality of our research panel, we need to verify a few details before
              you can join the workforce and start earning.
            </p>
            <div className="setup-progress-head">
              <span>Setup Progress</span>
              <strong>{completionPercent}% Complete</strong>
            </div>
            <div className="setup-progress-track">
              <div style={{ width: `${completionPercent}%` }} />
            </div>
            <small>Complete all 4 steps below to unlock your dashboard.</small>
          </article>

          <div className="onboarding-steps">
            {setupSteps.map((step, index) => {
              const status = statuses[index]
              const isActive = status === 'active'
              const isLocked = status === 'locked'
              const isCompleted = status === 'completed'

              return (
                <article key={step.id} className={isLocked ? 'onboarding-step locked' : 'onboarding-step'}>
                  <div
                    className={isCompleted ? 'step-icon complete' : isActive ? 'step-icon active' : 'step-icon locked'}
                  >
                    {index === 0 ? (
                      <IoPersonCircleOutline />
                    ) : index === 1 ? (
                      <IoRibbonOutline />
                    ) : index === 2 ? (
                      <IoShieldCheckmarkOutline />
                    ) : (
                      <IoLocateOutline />
                    )}
                  </div>
                  <div className="step-copy">
                    <p className="step-title">
                      {step.title}{' '}
                      <span className={isCompleted ? 'status-badge complete' : 'status-badge pending'}>
                        {isCompleted ? 'Completed' : isActive ? 'Required' : 'Pending'}
                      </span>
                    </p>
                    <p className="step-desc">{step.description}</p>
                  </div>
                  <button
                    type="button"
                    className={isCompleted ? 'step-action complete' : isActive ? 'step-action' : 'step-action disabled'}
                    disabled={isLocked}
                    onClick={() => handleStepAction(step, status)}
                  >
                    {isCompleted ? (
                      'Review'
                    ) : isActive ? (
                      'Start Now'
                    ) : (
                      <>
                        <IoLockClosedOutline />
                        Locked
                      </>
                    )}
                  </button>
                </article>
              )
            })}
          </div>

          <div className="onboarding-divider" />

          <article className={workforceUnlocked ? 'workforce-card unlocked' : 'workforce-card'}>
            <div className="workforce-icon">
              {workforceUnlocked ? <IoBriefcaseOutline /> : <IoGiftOutline />}
            </div>
            <h4>Join the Workforce</h4>
            <p>
              Complete all verification steps above to unlock access to paid surveys, daily bonuses,
              and withdrawals.
            </p>
            <button
              type="button"
              className={workforceUnlocked ? 'step-action' : 'step-action disabled'}
              disabled={!workforceUnlocked}
              onClick={() => navigate('/dashboard/workforce/join')}
            >
              {workforceUnlocked ? (
                'Continue'
              ) : (
                <>
                  <IoLockClosedOutline />
                  Locked
                </>
              )}
            </button>
          </article>
        </div>
    </AppSidebarLayout>
  )
}
