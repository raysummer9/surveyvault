import { NavLink, Outlet } from 'react-router-dom'

export function AdminPaymentSettingsLayout() {
  return (
    <>
      <nav className="admin-payment-settings-subnav" aria-label="Payment settings sections">
        <NavLink
          to="/admin/payment-settings"
          end
          className={({ isActive }) =>
            isActive ? 'admin-payment-settings-tab is-active' : 'admin-payment-settings-tab'
          }
        >
          Plans &amp; tiers
        </NavLink>
        <NavLink
          to="/admin/payment-settings/deposit-addresses"
          className={({ isActive }) =>
            isActive ? 'admin-payment-settings-tab is-active' : 'admin-payment-settings-tab'
          }
        >
          Deposit addresses
        </NavLink>
      </nav>
      <Outlet />
    </>
  )
}
