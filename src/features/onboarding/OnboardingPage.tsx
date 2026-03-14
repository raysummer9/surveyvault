import { useEffect, useMemo, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { HiOutlineMenu, HiOutlineX } from 'react-icons/hi'
import {
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
  isProfileMarkedOnboardingComplete,
  isWorkforceApproved,
  type OnboardingStepId,
} from '../auth/types'
import { SidebarMemberCard } from '../../shared/ui/SidebarMemberCard'

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

const navItems = ['Onboarding', 'Dashboard', 'Surveys', 'Earnings']
const verificationItems: { id: OnboardingStepId; label: string }[] = [
  { id: 'profile', label: 'Complete Profile' },
  { id: 'skill', label: 'Skill Verification' },
  { id: 'id', label: 'ID Verification' },
  { id: 'address', label: 'Address Verification' },
]

export function OnboardingPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, onboarding, profile, refreshUserState, debug } = useAuth()
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
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

  useEffect(() => {
    if (!mobileSidebarOpen) return

    document.body.style.overflow = 'hidden'
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileSidebarOpen(false)
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleEscape)
    }
  }, [mobileSidebarOpen])

  return (
    <section className="onboarding-shell">
      <aside className="onboarding-sidebar">
        <div className="onboarding-logo">
          <span className="brand-icon">S</span>
          <span>SurveyVault</span>
        </div>

        <p className="onboarding-nav-title">Account Setup</p>
        <nav className="onboarding-nav">
          {navItems.map((item, idx) => {
            const isActive = idx === 0
            return (
              <button key={item} className={isActive ? 'onboarding-nav-item active' : 'onboarding-nav-item'}>
                <span>{item}</span>
                {!isActive && <IoLockClosedOutline />}
              </button>
            )
          })}
        </nav>

        <div className="verification-steps-panel">
          <p className="verification-steps-title">Verification Steps</p>
          {verificationItems.map((item, index) => {
            const isCompleted = completedSteps.includes(item.id)
            const isActive = setupSteps[activeIndex]?.id === item.id
            return (
              <button
                key={item.id}
                className={
                  isCompleted
                    ? 'verification-step-item complete'
                    : isActive
                      ? 'verification-step-item active'
                      : 'verification-step-item'
                }
              >
                <span className="verification-step-count">{isCompleted ? '✓' : index + 1}</span>
                {item.label}
              </button>
            )
          })}
        </div>

        <SidebarMemberCard />
      </aside>

      <div className="onboarding-main">
        <header className="onboarding-topbar">
          <button
            type="button"
            className="profile-mobile-menu-btn"
            onClick={() => setMobileSidebarOpen(true)}
            aria-label="Open dashboard menu"
          >
            <HiOutlineMenu />
          </button>
          <h2>Account Verification</h2>
          <span className="onboarding-chip">Action Required</span>
        </header>

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
      </div>

      <div
        className={mobileSidebarOpen ? 'onboarding-mobile-overlay open' : 'onboarding-mobile-overlay'}
        onClick={() => setMobileSidebarOpen(false)}
        role="button"
        tabIndex={0}
        aria-label="Close onboarding menu"
      />

      <aside className={mobileSidebarOpen ? 'onboarding-mobile-sidebar open' : 'onboarding-mobile-sidebar'}>
        <div className="onboarding-mobile-sidebar-head">
          <span className="brand-text">Dashboard Menu</span>
          <button
            type="button"
            className="onboarding-mobile-close-btn"
            onClick={() => setMobileSidebarOpen(false)}
            aria-label="Close dashboard menu"
          >
            <HiOutlineX />
          </button>
        </div>

        <nav className="onboarding-mobile-nav">
          <NavLink
            to="/dashboard/onboarding"
            className={({ isActive }) => (isActive ? 'onboarding-mobile-link active' : 'onboarding-mobile-link')}
            onClick={() => setMobileSidebarOpen(false)}
          >
            Onboarding
          </NavLink>
          <NavLink
            to="/dashboard/earnings"
            className={({ isActive }) => (isActive ? 'onboarding-mobile-link active' : 'onboarding-mobile-link')}
            onClick={() => setMobileSidebarOpen(false)}
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/dashboard/surveys"
            className={({ isActive }) => (isActive ? 'onboarding-mobile-link active' : 'onboarding-mobile-link')}
            onClick={() => setMobileSidebarOpen(false)}
          >
            Surveys
          </NavLink>
          <NavLink
            to="/dashboard/earnings"
            className={({ isActive }) => (isActive ? 'onboarding-mobile-link active' : 'onboarding-mobile-link')}
            onClick={() => setMobileSidebarOpen(false)}
          >
            Earnings
          </NavLink>
        </nav>
      </aside>
    </section>
  )
}
