import { useEffect, useMemo, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
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

type StepStatus = 'completed' | 'active' | 'locked'

type SetupStep = {
  id: string
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
    path: '/dashboard/onboarding',
  },
  {
    id: 'id',
    title: 'ID Verification',
    description: 'Upload a valid government-issued ID to verify your identity.',
    path: '/dashboard/onboarding',
  },
  {
    id: 'address',
    title: 'Address Verification',
    description: 'Confirm your residential address for payment processing.',
    path: '/dashboard/onboarding',
  },
]

const navItems = ['Onboarding', 'Dashboard', 'Surveys', 'Earnings']

export function OnboardingPage() {
  const navigate = useNavigate()
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  const completionPercent = 0
  const activeIndex = 0
  const workforceUnlocked = false

  const statuses = useMemo(
    () =>
      setupSteps.map((_, index) => {
        if (index === activeIndex) return 'active'
        return 'locked'
      }),
    [activeIndex],
  )

  const handleStepAction = (step: SetupStep, status: StepStatus) => {
    if (status === 'locked') return
    if (status === 'active') {
      navigate(step.path)
    }
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

        <div className="onboarding-member">
          <IoPersonCircleOutline />
          <div>
            <p>New Member</p>
            <small>Setup Pending</small>
          </div>
        </div>
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

              return (
                <article key={step.id} className={isLocked ? 'onboarding-step locked' : 'onboarding-step'}>
                  <div
                    className={isActive ? 'step-icon active' : 'step-icon locked'}
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
                      <span className="status-badge pending">{isActive ? 'Required' : 'Pending'}</span>
                    </p>
                    <p className="step-desc">{step.description}</p>
                  </div>
                  <button
                    type="button"
                    className={isActive ? 'step-action' : 'step-action disabled'}
                    disabled={!isActive}
                    onClick={() => handleStepAction(step, status)}
                  >
                    {isActive ? (
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
