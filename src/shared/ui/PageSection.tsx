import { useEffect, useState, type ReactNode } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { HiOutlineMenu, HiOutlineX } from 'react-icons/hi'
import { SidebarMemberCard } from './SidebarMemberCard'

interface PageSectionProps {
  title: string
  description: string
  children?: ReactNode
}

const dashboardNavItems = [
  { to: '/dashboard/earnings', label: 'Dashboard' },
  { to: '/dashboard/surveys', label: 'Surveys' },
  { to: '/dashboard/workforce/join', label: 'Workforce' },
  { to: '/dashboard/onboarding', label: 'Onboarding' },
  { to: '/admin/onboarding-review', label: 'Admin Reviews' },
  { to: '/admin/payment-settings', label: 'Admin Settings' },
]

export function PageSection({ title, description, children }: PageSectionProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = mobileSidebarOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileSidebarOpen])

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileSidebarOpen(false)
      }
    }

    if (mobileSidebarOpen) {
      window.addEventListener('keydown', handleEscape)
      return () => window.removeEventListener('keydown', handleEscape)
    }
  }, [mobileSidebarOpen])

  return (
    <section className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <Link className="brand-link dashboard-brand-link" to="/">
          <span className="brand-icon">S</span>
          <span className="brand-text">SurveyVault</span>
        </Link>

        <p className="dashboard-sidebar-title">Dashboard Menu</p>
        <nav className="dashboard-sidebar-nav">
          {dashboardNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive ? 'dashboard-sidebar-link active' : 'dashboard-sidebar-link'
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <SidebarMemberCard />
      </aside>

      <div className="dashboard-content-wrap">
        <header className="dashboard-mobile-header">
          <button
            type="button"
            className="dashboard-mobile-menu-btn"
            onClick={() => setMobileSidebarOpen(true)}
            aria-label="Open dashboard menu"
          >
            <HiOutlineMenu />
          </button>
          <span>{title}</span>
        </header>

        <section className="page">
          <header className="page-header">
            <h2>{title}</h2>
            <p>{description}</p>
          </header>
          <div className="panel">{children}</div>
        </section>
      </div>

      <div
        className={mobileSidebarOpen ? 'dashboard-mobile-overlay open' : 'dashboard-mobile-overlay'}
        onClick={() => setMobileSidebarOpen(false)}
        role="button"
        tabIndex={0}
        aria-label="Close dashboard menu"
      />

      <aside className={mobileSidebarOpen ? 'dashboard-mobile-sidebar open' : 'dashboard-mobile-sidebar'}>
        <div className="dashboard-mobile-sidebar-head">
          <span className="brand-text">Dashboard Menu</span>
          <button
            type="button"
            className="dashboard-mobile-close-btn"
            onClick={() => setMobileSidebarOpen(false)}
            aria-label="Close dashboard menu"
          >
            <HiOutlineX />
          </button>
        </div>

        <nav className="dashboard-mobile-sidebar-nav">
          {dashboardNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileSidebarOpen(false)}
              className={({ isActive }) =>
                isActive ? 'dashboard-mobile-link active' : 'dashboard-mobile-link'
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <SidebarMemberCard onAfterLogout={() => setMobileSidebarOpen(false)} />
      </aside>
    </section>
  )
}
