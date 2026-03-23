import { Link } from 'react-router-dom'
import { FiAlertTriangle } from 'react-icons/fi'
import { APP_NAME } from '../../config/brand'
import { useAuth } from './AuthContext'

/**
 * Full-screen notice when the member account is suspended by an administrator.
 * Shown instead of any /dashboard/* experience.
 */
export function AccountSuspendedScreen() {
  const { signOut } = useAuth()

  return (
    <div className="account-suspended-screen" role="alertdialog" aria-labelledby="account-suspended-title">
      <div className="account-suspended-card">
        <div className="account-suspended-icon" aria-hidden>
          <FiAlertTriangle />
        </div>
        <h1 id="account-suspended-title">Account access restricted</h1>
        <p className="account-suspended-lead">
          Your {APP_NAME} account has been suspended for a violation of our platform policies. You no longer have access
          to the member dashboard until this matter is resolved.
        </p>
        <p className="account-suspended-hint">
          Please review our <Link to="/terms">Terms of Service</Link> and{' '}
          <Link to="/privacy">Privacy Policy</Link>. If you believe this is a mistake, contact support using the email on
          our website.
        </p>
        <div className="account-suspended-actions">
          <Link to="/terms" className="account-suspended-link-btn">
            Read policies
          </Link>
          <button type="button" className="account-suspended-signout" onClick={() => void signOut()}>
            Sign out
          </button>
        </div>
      </div>
    </div>
  )
}
