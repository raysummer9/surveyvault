import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { HiOutlineMenu, HiOutlineX } from 'react-icons/hi'

const navItems = [
  { to: '/', label: 'Home', end: true },
  { to: '/open-projects', label: 'Open Surveys' },
  { to: '/what-to-expect', label: 'What to Expect' },
]

export function AppLayout() {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isDashboardRoute = location.pathname.startsWith('/dashboard')

  const closeSidebar = () => setSidebarOpen(false)

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [sidebarOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSidebarOpen(false)
    }
    if (sidebarOpen) {
      window.addEventListener('keydown', handleEscape)
      return () => window.removeEventListener('keydown', handleEscape)
    }
  }, [sidebarOpen])

  return (
    <div className="public-shell">
      {!isDashboardRoute && (
        <>
          <header className="public-navbar">
            <Link className="brand-link" to="/" onClick={closeSidebar}>
              <span className="brand-icon">S</span>
              <span className="brand-text">SurveyVault</span>
            </Link>

            <nav className="public-nav" aria-label="Main navigation">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  className={({ isActive }) => (isActive ? 'public-nav-link active' : 'public-nav-link')}
                  to={item.to}
                  end={item.end}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="public-actions">
              <Link className="public-btn secondary" to="/sign-in">
                Login
              </Link>
              <Link className="public-btn primary" to="/register">
                Join Free
              </Link>
            </div>

            <button
              type="button"
              className="hamburger-btn"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <HiOutlineMenu />
            </button>
          </header>

          <div
            className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
            onClick={closeSidebar}
            role="button"
            tabIndex={0}
            aria-label="Close menu"
          />

          <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
              <span className="brand-text">Menu</span>
              <button
                type="button"
                className="sidebar-close"
                onClick={closeSidebar}
                aria-label="Close menu"
              >
                <HiOutlineX />
              </button>
            </div>
            <nav className="sidebar-nav">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}
                  to={item.to}
                  end={item.end}
                  onClick={closeSidebar}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <div className="sidebar-actions">
              <Link className="public-btn secondary" to="/sign-in" onClick={closeSidebar}>
                Login
              </Link>
              <Link className="public-btn primary" to="/register" onClick={closeSidebar}>
                Join Free
              </Link>
            </div>
          </aside>
        </>
      )}

      <main className={isDashboardRoute ? 'public-content no-navbar' : 'public-content'}>
        <Outlet />
      </main>
    </div>
  )
}
