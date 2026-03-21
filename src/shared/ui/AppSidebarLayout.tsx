import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { FiLock } from 'react-icons/fi'
import { HiOutlineX } from 'react-icons/hi'
import { useAuth } from '../../features/auth/AuthContext'
import {
  getCompletedOnboardingSteps,
  hasJoinedWorkforce,
  hasWorkforcePaymentReviewAccess,
  canAccessJoinWorkforce,
} from '../../features/auth/types'
import { APP_NAME } from '../../config/brand'
import { SidebarMemberCard } from './SidebarMemberCard'

const SidebarContext = createContext<{ openMobileSidebar: () => void } | null>(null)
export function useSidebar() {
  const ctx = useContext(SidebarContext)
  return ctx ?? { openMobileSidebar: () => {} }
}

type AppSidebarLayoutProps = {
  children: ReactNode
}

type SetupNavItem = {
  to: string
  label: string
  /** Green completion indicator (matches design) */
  complete?: boolean
  /** Highlight as current step in flow */
  flowActive?: boolean
  showNewBadge?: boolean
}

export function AppSidebarLayout({ children }: AppSidebarLayoutProps) {
  const { profile, onboarding, pendingWorkforcePaymentRow } = useAuth()
  const location = useLocation()
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  const joinedWorkforce = hasJoinedWorkforce(profile)
  const awaitingPayReview =
    hasWorkforcePaymentReviewAccess(profile, pendingWorkforcePaymentRow) && !joinedWorkforce
  const canJoin = canAccessJoinWorkforce(profile)
  const completedSteps = useMemo(() => getCompletedOnboardingSteps(onboarding), [onboarding])
  const onboardingApproved = profile?.onboarding_status === 'approved'
  const paymentStepComplete = awaitingPayReview || joinedWorkforce
  const onPaymentOrBeyond =
    awaitingPayReview ||
    joinedWorkforce ||
    location.pathname.startsWith('/dashboard/workforce/payment') ||
    location.pathname.startsWith('/dashboard/workforce/pending-review')

  const accountSetupItems: SetupNavItem[] = useMemo(() => {
    if (joinedWorkforce) {
      return []
    }
    const items: SetupNavItem[] = [
      {
        to: '/dashboard/onboarding',
        label: 'Onboarding',
        complete:
          onboardingApproved ||
          (completedSteps.length === 4 && (profile?.onboarding_status === 'completed' || onboardingApproved)),
        flowActive:
          location.pathname.startsWith('/dashboard/onboarding') &&
          !location.pathname.includes('/workforce'),
      },
      {
        to: '/dashboard/workforce/join',
        label: 'Join Workforce',
        complete: onboardingApproved && onPaymentOrBeyond,
        showNewBadge: canJoin && !onPaymentOrBeyond,
        flowActive: location.pathname.startsWith('/dashboard/workforce/join'),
      },
      {
        to: '/dashboard/workforce/payment',
        label: 'Payment',
        complete: paymentStepComplete,
        flowActive:
          location.pathname.startsWith('/dashboard/workforce/payment') &&
          !location.pathname.includes('pending-review'),
      },
    ]
    if (awaitingPayReview) {
      items.push({
        to: '/dashboard/workforce/pending-review',
        label: 'Active',
        flowActive: location.pathname.startsWith('/dashboard/workforce/pending-review'),
      })
    }
    return items
  }, [
    joinedWorkforce,
    awaitingPayReview,
    canJoin,
    paymentStepComplete,
    onboardingApproved,
    completedSteps.length,
    profile?.onboarding_status,
    location.pathname,
    onPaymentOrBeyond,
  ])

  const mainNavItems = useMemo(() => {
    const items: {
      to: string
      label: string
      id: 'dash' | 'surveys' | 'withdrawals' | 'upgrade'
    }[] = [
      { to: '/dashboard/earnings', label: 'Dashboard', id: 'dash' },
      { to: '/dashboard/surveys', label: 'Surveys', id: 'surveys' },
      { to: '/dashboard/withdrawals', label: 'Withdrawals', id: 'withdrawals' },
    ]
    if (joinedWorkforce) {
      items.push({ to: '/dashboard/workforce/upgrade', label: 'Upgrade plan', id: 'upgrade' })
    }
    return items
  }, [joinedWorkforce])

  const isMainLocked = () => !joinedWorkforce

  const renderSetupLink = (item: SetupNavItem) => {
    return (
      <NavLink
        key={item.to + item.label}
        to={item.to}
        className={({ isActive }) =>
          [
            'account-setup-nav-item',
            isActive || item.flowActive ? 'active' : '',
            item.complete ? 'is-complete' : '',
          ]
            .filter(Boolean)
            .join(' ')
        }
      >
        <span className="account-setup-nav-label">
          {item.label}
          {item.showNewBadge && <span className="account-setup-nav-new">New</span>}
        </span>
        {item.complete && <span className="account-setup-nav-check" aria-hidden title="Completed" />}
      </NavLink>
    )
  }

  const renderMainLink = (item: (typeof mainNavItems)[number]) => {
    const locked = isMainLocked()
    if (locked) {
      return (
        <span
          key={item.id}
          className="onboarding-nav-item locked account-setup-main-item"
          aria-disabled
          title="Complete workforce enrollment to unlock"
        >
          <span>{item.label}</span>
          <FiLock className="onboarding-nav-lock" aria-hidden />
        </span>
      )
    }
    return (
      <NavLink
        key={item.id}
        to={item.to}
        className={({ isActive }) =>
          isActive ? 'onboarding-nav-item active account-setup-main-item' : 'onboarding-nav-item account-setup-main-item'
        }
      >
        <span>{item.label}</span>
      </NavLink>
    )
  }

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
          <span>{APP_NAME}</span>
        </Link>
      </div>

      {!joinedWorkforce && accountSetupItems.length > 0 && (
        <>
          <p className="account-setup-section-title">Account setup</p>
          <nav className="account-setup-nav">{accountSetupItems.map(renderSetupLink)}</nav>
        </>
      )}

      <p className="onboarding-nav-title">{joinedWorkforce ? 'Dashboard' : 'Workspace'}</p>
      <nav className="onboarding-nav">{mainNavItems.map(renderMainLink)}</nav>

      <p className="onboarding-nav-title onboarding-nav-title-help">Help</p>
      <nav className="onboarding-nav onboarding-nav-support">
        <NavLink
          to="/dashboard/support"
          className={({ isActive }) =>
            isActive
              ? 'onboarding-nav-item active account-setup-main-item'
              : 'onboarding-nav-item account-setup-main-item'
          }
        >
          <span>Support</span>
        </NavLink>
      </nav>

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
            <span className="brand-text">Menu</span>
            <button
              type="button"
              className="onboarding-mobile-close-btn"
              onClick={() => setMobileSidebarOpen(false)}
              aria-label="Close menu"
            >
              <HiOutlineX />
            </button>
          </div>
          {!joinedWorkforce && accountSetupItems.length > 0 && (
            <>
              <p className="account-setup-section-title">Account setup</p>
              <nav className="onboarding-mobile-nav account-setup-nav">
                {accountSetupItems.map((item) => (
                  <NavLink
                    key={item.to + item.label}
                    to={item.to}
                    className={({ isActive }) =>
                      [
                        'onboarding-mobile-link',
                        isActive || item.flowActive ? 'active' : '',
                        item.complete ? 'is-complete' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')
                    }
                    onClick={() => setMobileSidebarOpen(false)}
                  >
                    <span>
                      {item.label}
                      {item.showNewBadge && <span className="account-setup-nav-new">New</span>}
                    </span>
                    {item.complete && <span className="account-setup-nav-check" aria-hidden />}
                  </NavLink>
                ))}
              </nav>
            </>
          )}
          <p className="onboarding-nav-title">{joinedWorkforce ? 'Dashboard' : 'Workspace'}</p>
          <nav className="onboarding-mobile-nav">
            {mainNavItems.map((item) => {
              const locked = isMainLocked()
              if (locked) {
                return (
                  <span key={item.id} className="onboarding-mobile-link locked" aria-disabled>
                    <span>{item.label}</span>
                    <FiLock className="onboarding-nav-lock" aria-hidden />
                  </span>
                )
              }
              return (
                <NavLink
                  key={item.id}
                  to={item.to}
                  className={({ isActive }) => (isActive ? 'onboarding-mobile-link active' : 'onboarding-mobile-link')}
                  onClick={() => setMobileSidebarOpen(false)}
                >
                  {item.label}
                </NavLink>
              )
            })}
          </nav>
          <p className="onboarding-nav-title onboarding-nav-title-help">Help</p>
          <nav className="onboarding-mobile-nav">
            <NavLink
              to="/dashboard/support"
              className={({ isActive }) =>
                isActive ? 'onboarding-mobile-link active' : 'onboarding-mobile-link'
              }
              onClick={() => setMobileSidebarOpen(false)}
            >
              Support
            </NavLink>
          </nav>
          <SidebarMemberCard onAfterLogout={() => setMobileSidebarOpen(false)} />
        </aside>
      </section>
    </SidebarContext.Provider>
  )
}
