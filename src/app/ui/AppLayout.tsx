import { Link, NavLink, Outlet } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Home', end: true },
  { to: '/open-projects', label: 'Open Surveys' },
  { to: '/what-to-expect', label: 'What to Expect' },
]

export function AppLayout() {
  return (
    <div className="public-shell">
      <header className="public-navbar">
        <Link className="brand-link" to="/">
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
      </header>

      <main className="public-content">
        <Outlet />
      </main>
    </div>
  )
}
