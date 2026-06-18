import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { HiOutlineMenu, HiOutlineX } from 'react-icons/hi'
import { useAuth } from '../../features/auth/AuthContext'
import { APP_NAME } from '../../config/brand'

const AdminSidebarContext = createContext<{ openMobileSidebar: () => void } | null>(null)
export function useAdminSidebar() {
  const ctx = useContext(AdminSidebarContext)
  return ctx ?? { openMobileSidebar: () => {} }
}

const adminNavItems = [
  { to: '/admin/onboarding-review', label: 'Onboarding Review' },
  { to: '/admin/workforce-approval', label: 'Payment requests' },
  { to: '/admin/payment-settings', label: 'Payment Settings' },
  { to: '/admin/surveys', label: 'Surveys' },
  { to: '/admin/withdrawals', label: 'Withdrawals' },
  { to: '/admin/users', label: 'Manage users' },
  { to: '/admin/terms', label: 'Terms of Service' },
  { to: '/admin/support-settings', label: 'Support settings' },
  { to: '/admin/settings', label: 'Account' },
] as const

export function AdminLayout() {
  const location = useLocation()
  const { user, signOut } = useAuth()
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
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

  return (
    <AdminSidebarContext.Provider value={sidebarContext}>
      <section className="onboarding-shell admin-shell">
        <div className="admin-mobile-nav-toggle">
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            aria-label="Open admin menu"
          >
            <HiOutlineMenu />
          </button>
        </div>
        <aside className="onboarding-sidebar admin-sidebar">
          <div className="onboarding-logo">
            <Link to="/admin" className="onboarding-logo-link" style={{ textDecoration: 'none', color: 'inherit', display: 'inline-flex', alignItems: 'center', gap: '9px' }}>
              <span className="brand-icon">TP</span>
              <span>{APP_NAME} Admin</span>
            </Link>
          </div>
          <p className="onboarding-nav-title">Admin</p>
          <nav className="onboarding-nav">
            {adminNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => {
                  const active =
                    item.to === '/admin/payment-settings'
                      ? location.pathname.startsWith('/admin/payment-settings')
                      : item.to === '/admin/settings'
                        ? location.pathname === '/admin/settings'
                        : item.to === '/admin/terms'
                          ? location.pathname === '/admin/terms'
                          : item.to === '/admin/support-settings'
                            ? location.pathname === '/admin/support-settings'
                            : item.to === '/admin/users'
                            ? location.pathname.startsWith('/admin/users')
                            : isActive
                  return active ? 'onboarding-nav-item active' : 'onboarding-nav-item'
                }}
              >
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
          <div className="admin-sidebar-footer">
            <Link to="/admin/settings" className="admin-sidebar-account-link">
              Account settings
            </Link>
            <span className="admin-sidebar-email">{user?.email ?? 'Admin'}</span>
            <button
              type="button"
              className="admin-sidebar-logout"
              onClick={() => void signOut()}
            >
              Sign out
            </button>
          </div>
        </aside>

        <div className="onboarding-main onboarding-main-dashboard">
          <div className="onboarding-main-content">
            <Outlet />
          </div>
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
            <span className="brand-text">Admin Menu</span>
            <button
              type="button"
              className="onboarding-mobile-close-btn"
              onClick={() => setMobileSidebarOpen(false)}
              aria-label="Close menu"
            >
              <HiOutlineX />
            </button>
          </div>
          <div className="onboarding-mobile-sidebar-scroll">
            <nav className="onboarding-mobile-nav">
              {adminNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => {
                    const active =
                      item.to === '/admin/payment-settings'
                        ? location.pathname.startsWith('/admin/payment-settings')
                        : item.to === '/admin/settings'
                          ? location.pathname === '/admin/settings'
                          : item.to === '/admin/terms'
                            ? location.pathname === '/admin/terms'
                            : item.to === '/admin/support-settings'
                              ? location.pathname === '/admin/support-settings'
                              : item.to === '/admin/users'
                              ? location.pathname.startsWith('/admin/users')
                              : isActive
                    return active ? 'onboarding-mobile-link active' : 'onboarding-mobile-link'
                  }}
                  onClick={() => setMobileSidebarOpen(false)}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="onboarding-mobile-sidebar-footer">
            <div className="admin-sidebar-footer">
              <Link to="/admin/settings" className="admin-sidebar-account-link" onClick={() => setMobileSidebarOpen(false)}>
                Account settings
              </Link>
              <span className="admin-sidebar-email">{user?.email ?? 'Admin'}</span>
              <button
                type="button"
                className="admin-sidebar-logout"
                onClick={() => {
                  void signOut()
                  setMobileSidebarOpen(false)
                }}
              >
                Sign out
              </button>
            </div>
          </div>
        </aside>
      </section>
    </AdminSidebarContext.Provider>
  )
}
