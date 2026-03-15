import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { HiOutlineX } from 'react-icons/hi'

const SidebarContext = createContext<{ openMobileSidebar: () => void } | null>(null)
export function useSidebar() {
  const ctx = useContext(SidebarContext)
  return ctx ?? { openMobileSidebar: () => {} }
}
import { useAuth } from '../../features/auth/AuthContext'
import {
  getCompletedOnboardingSteps,
  isAdminApproved,
  type OnboardingStepId,
} from '../../features/auth/types'
import { SidebarMemberCard } from './SidebarMemberCard'

const verificationItems: { id: OnboardingStepId; label: string }[] = [
  { id: 'profile', label: 'Complete Profile' },
  { id: 'skill', label: 'Skill Verification' },
  { id: 'id', label: 'ID Verification' },
  { id: 'address', label: 'Address Verification' },
]

const setupStepOrder: OnboardingStepId[] = ['profile', 'skill', 'id', 'address']

type NavItem = { to: string; label: string; adminOnly?: boolean }

const allNavItems: NavItem[] = [
  { to: '/dashboard/onboarding', label: 'Onboarding' },
  { to: '/dashboard/earnings', label: 'Dashboard' },
  { to: '/dashboard/surveys', label: 'Surveys' },
  { to: '/dashboard/workforce/join', label: 'Workforce' },
  { to: '/admin/onboarding-review', label: 'Admin Reviews', adminOnly: true },
  { to: '/admin/payment-settings', label: 'Admin Settings', adminOnly: true },
]

type AppSidebarLayoutProps = {
  children: ReactNode
}

export function AppSidebarLayout({ children }: AppSidebarLayoutProps) {
  const { profile, onboarding } = useAuth()
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  const isApproved = isAdminApproved(profile)
  const adminEmails = useMemo(
    () =>
      (import.meta.env.VITE_ADMIN_EMAILS ?? '')
        .split(',')
        .map((e: string) => e.trim().toLowerCase())
        .filter(Boolean),
    [],
  )
  const isAdmin = Boolean(profile?.email && adminEmails.includes(profile.email.toLowerCase()))

  const navItems = useMemo(() => {
    return allNavItems.filter((item) => {
      if (item.adminOnly && !isAdmin) return false
      if (isApproved && item.to === '/dashboard/onboarding') return false
      return true
    })
  }, [isApproved, isAdmin])

  const completedSteps = useMemo(() => {
    return getCompletedOnboardingSteps(onboarding)
  }, [onboarding])

  const activeStepIndex = setupStepOrder.findIndex((id) => !completedSteps.includes(id))
  const showVerificationSteps = !isApproved
  const sidebarContext = useMemo(() => ({ openMobileSidebar: () => setMobileSidebarOpen(true) }), [])

  useEffect(() => {
    document.body.style.overflow = mobileSidebarOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileSidebarOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileSidebarOpen(false)
    }
    if (mobileSidebarOpen) {
      window.addEventListener('keydown', handleEscape)
      return () => window.removeEventListener('keydown', handleEscape)
    }
  }, [mobileSidebarOpen])

  const SidebarContent = () => (
    <>
      <div className="onboarding-logo">
        <Link to="/" className="onboarding-logo-link" style={{ textDecoration: 'none', color: 'inherit', display: 'inline-flex', alignItems: 'center', gap: '9px' }}>
          <span className="brand-icon">S</span>
          <span>SurveyVault</span>
        </Link>
      </div>

      <p className="onboarding-nav-title">Account Setup</p>
      <nav className="onboarding-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              isActive ? 'onboarding-nav-item active' : 'onboarding-nav-item'
            }
          >
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {showVerificationSteps && (
        <div className="verification-steps-panel">
          <p className="verification-steps-title">Verification Steps</p>
          {verificationItems.map((item, index) => {
            const isCompleted = completedSteps.includes(item.id)
            const isActive = setupStepOrder[activeStepIndex] === item.id
            return (
              <NavLink
                key={item.id}
                to={
                  item.id === 'profile'
                    ? '/dashboard/onboarding/profile'
                    : item.id === 'skill'
                      ? '/dashboard/onboarding/skills'
                      : item.id === 'id'
                        ? '/dashboard/onboarding/id-verification'
                        : '/dashboard/onboarding/address-verification'
                }
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
              </NavLink>
            )
          })}
        </div>
      )}

      <SidebarMemberCard />
    </>
  )

  return (
    <SidebarContext.Provider value={sidebarContext}>
      <section className="onboarding-shell">
        <aside className="onboarding-sidebar">
          <SidebarContent />
        </aside>

        <div className="onboarding-main onboarding-main-dashboard">
          <div className="onboarding-main-content">{children}</div>
        </div>

      <div
        className={mobileSidebarOpen ? 'onboarding-mobile-overlay open' : 'onboarding-mobile-overlay'}
        onClick={() => setMobileSidebarOpen(false)}
        role="button"
        tabIndex={0}
        aria-label="Close menu"
      />

      <aside className={mobileSidebarOpen ? 'onboarding-mobile-sidebar open' : 'onboarding-mobile-sidebar'}>
        <div className="onboarding-mobile-sidebar-head">
          <span className="brand-text">Dashboard Menu</span>
          <button
            type="button"
            className="onboarding-mobile-close-btn"
            onClick={() => setMobileSidebarOpen(false)}
            aria-label="Close menu"
          >
            <HiOutlineX />
          </button>
        </div>
        <nav className="onboarding-mobile-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive ? 'onboarding-mobile-link active' : 'onboarding-mobile-link'
              }
              onClick={() => setMobileSidebarOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        {showVerificationSteps && (
          <div className="onboarding-mobile-verification">
            <p className="verification-steps-title">Verification Steps</p>
            {verificationItems.map((item, index) => {
              const isCompleted = completedSteps.includes(item.id)
              return (
                <NavLink
                  key={item.id}
                  to={
                    item.id === 'profile'
                      ? '/dashboard/onboarding/profile'
                      : item.id === 'skill'
                        ? '/dashboard/onboarding/skills'
                        : item.id === 'id'
                          ? '/dashboard/onboarding/id-verification'
                          : '/dashboard/onboarding/address-verification'
                  }
                  className={isCompleted ? 'verification-step-item complete' : 'verification-step-item'}
                  onClick={() => setMobileSidebarOpen(false)}
                >
                  <span className="verification-step-count">{isCompleted ? '✓' : index + 1}</span>
                  {item.label}
                </NavLink>
              )
            })}
          </div>
        )}
        <SidebarMemberCard onAfterLogout={() => setMobileSidebarOpen(false)} />
      </aside>
      </section>
    </SidebarContext.Provider>
  )
}
