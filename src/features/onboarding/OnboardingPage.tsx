import { useMemo } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import {
  IoAlertCircleOutline,
  IoBriefcaseOutline,
  IoCheckmarkCircle,
  IoGiftOutline,
  IoLocateOutline,
  IoLockClosedOutline,
  IoPersonCircleOutline,
  IoRibbonOutline,
  IoRocketOutline,
  IoShieldCheckmarkOutline,
} from 'react-icons/io5'
import { HiOutlineSquares2X2 } from 'react-icons/hi2'
import { useAuth } from '../auth/AuthContext'
import {
  canAccessJoinWorkforce,
  getCompletedOnboardingSteps,
  hasJoinedWorkforce,
  isOnboardingComplete,
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
      return ['profile', 'skill', 'id', 'address'] as OnboardingStepId[]
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
  const firstName = profile?.first_name?.trim() || 'there'
  const allStepsDone = isOnboardingComplete(onboarding) || completedSteps.length === 4
  const awaitingOnboardingAdmin =
    allStepsDone && profile?.onboarding_status === 'completed' && !canAccessJoinWorkforce(profile)
  const showVerifiedComplete = canAccessJoinWorkforce(profile)

  if (hasJoinedWorkforce(profile)) {
    return <Navigate to="/dashboard/earnings" replace />
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

  if (showVerifiedComplete) {
    return (
      <AppSidebarLayout>
        <OnboardingTopbar
          title="Onboarding complete"
          chips={
            <span className="onboarding-chip onboarding-chip-success">
              <span className="onboarding-chip-dot" aria-hidden />
              All steps verified
            </span>
          }
        />
        <div className="onboarding-content onboarding-complete-page">
          <section className="onboarding-complete-hero">
            <div className="onboarding-complete-hero-visual">
              <div className="onboarding-complete-ring">
                <IoCheckmarkCircle className="onboarding-complete-ring-icon" aria-hidden />
                <span className="onboarding-complete-ring-pct">100% Complete</span>
              </div>
            </div>
            <div className="onboarding-complete-hero-copy">
              <span className="onboarding-complete-kicker">Verification complete</span>
              <h2 className="onboarding-complete-title">You&apos;re all set, {firstName}!</h2>
              <p className="onboarding-complete-desc">
                All four verification steps are done. You&apos;re eligible to join the workforce, complete your
                one-time enrollment payment, and unlock your dashboard, surveys, and earnings.
              </p>
              <div className="onboarding-complete-progress-wrap">
                <div className="onboarding-complete-progress-head">
                  <span>Progress</span>
                  <strong>100% complete</strong>
                </div>
                <div className="onboarding-complete-progress-bar">
                  <div className="onboarding-complete-progress-fill" style={{ width: '100%' }} />
                </div>
                <p className="onboarding-complete-progress-foot">All 4 of 4 steps completed successfully.</p>
              </div>
            </div>
          </section>

          <section className="onboarding-complete-steps-card">
            <h3 className="onboarding-complete-steps-title">Completed steps (4 / 4 verified)</h3>
            <ul className="onboarding-complete-steps-list">
              {[
                { title: 'Complete Profile', sub: 'Profile information submitted and verified.' },
                { title: 'Skill Verification', sub: 'Assessment completed. Expertise areas confirmed.' },
                { title: 'ID Verification', sub: 'Government-issued ID uploaded and approved.' },
                { title: 'Address Verification', sub: 'Residential address confirmed for payment processing.' },
              ].map((row) => (
                <li key={row.title} className="onboarding-complete-step-row">
                  <div>
                    <strong>{row.title}</strong>
                    <p>{row.sub}</p>
                  </div>
                  <span className="onboarding-complete-verified-badge">Verified</span>
                  <IoCheckmarkCircle className="onboarding-complete-step-check" aria-hidden />
                </li>
              ))}
            </ul>
          </section>

          <section className="onboarding-complete-unlock">
            <h3 className="onboarding-complete-unlock-title">What you&apos;ve unlocked</h3>
            <div className="onboarding-complete-unlock-grid">
              <div className="onboarding-complete-unlock-card">
                <span className="onboarding-complete-unlock-icon blue">📋</span>
                <strong>Paid surveys</strong>
                <p>Get matched to surveys that fit your profile and get paid for each one you complete.</p>
              </div>
              <div className="onboarding-complete-unlock-card">
                <span className="onboarding-complete-unlock-icon purple">🎁</span>
                <strong>Daily bonuses</strong>
                <p>Earn extra rewards for consistent activity and streaks on the platform.</p>
              </div>
              <div className="onboarding-complete-unlock-card">
                <span className="onboarding-complete-unlock-icon green">💵</span>
                <strong>Withdrawals</strong>
                <p>Cash out your balance with supported crypto and payout methods.</p>
              </div>
            </div>
          </section>

          <section className="onboarding-complete-cta-card">
            <div className="onboarding-complete-cta-icon">
              <IoBriefcaseOutline aria-hidden />
            </div>
            <div>
              <h3>Ready to join the workforce?</h3>
              <p>
                Your account is fully verified. Complete workforce enrollment to activate your dashboard and
                start earning.
              </p>
            </div>
            <div className="onboarding-complete-cta-actions">
              <button type="button" className="onboarding-complete-cta-primary" onClick={() => navigate('/dashboard/workforce/join')}>
                <IoRocketOutline aria-hidden />
                Join the workforce
              </button>
              <button
                type="button"
                className="onboarding-complete-cta-secondary"
                disabled
                title="Available after workforce enrollment"
              >
                <HiOutlineSquares2X2 aria-hidden />
                Go to dashboard (locked)
              </button>
            </div>
          </section>
        </div>
      </AppSidebarLayout>
    )
  }

  if (awaitingOnboardingAdmin) {
    return (
      <AppSidebarLayout>
        <OnboardingTopbar title="Account verification" chips={<span className="onboarding-chip">Under review</span>} />
        <div className="onboarding-content">
          <article className="onboarding-welcome-card onboarding-review-card">
            <h3>Submitted for review</h3>
            <p>
              You&apos;ve completed all verification steps. Our team is reviewing your information. You&apos;ll be
              able to join the workforce once your account is approved—usually within 24–48 hours.
            </p>
            <div className="setup-progress-head">
              <span>Setup progress</span>
              <strong>100% submitted</strong>
            </div>
            <div className="setup-progress-track">
              <div style={{ width: '100%' }} />
            </div>
          </article>
        </div>
      </AppSidebarLayout>
    )
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
              <p>
                Your previous submission was not accepted. Please review the steps below and resubmit your
                information.
              </p>
            </div>
          </div>
        )}

        <article className="onboarding-welcome-card">
          <h3>Welcome to the team! 👋</h3>
          <p>
            To maintain the quality of our research panel, we need to verify a few details before you can join the
            workforce and start earning.
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
                  className={
                    isCompleted ? 'step-icon complete' : isActive ? 'step-icon active' : 'step-icon locked'
                  }
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
          <p>Complete all verification steps above to unlock access to paid surveys, daily bonuses, and withdrawals.</p>
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
