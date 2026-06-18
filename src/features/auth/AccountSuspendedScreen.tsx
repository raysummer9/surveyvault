import { Link } from 'react-router-dom'
import { FaTelegram } from 'react-icons/fa'
import { FiAlertTriangle } from 'react-icons/fi'
import { APP_NAME } from '../../config/brand'
import { useTelegramSupportUrl } from '../support/useTelegramSupportUrl'
import { useAuth } from './AuthContext'

/**
 * Full-screen notice when the member account is suspended by an administrator.
 * Shown instead of any /dashboard/* experience.
 */
export function AccountSuspendedScreen() {
  const { signOut } = useAuth()
  const telegramUrl = useTelegramSupportUrl()

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
          <Link to="/privacy">Privacy Policy</Link>. If you believe this is a mistake, contact us on Telegram — we will
          review your case.
        </p>
        <div className="account-suspended-actions">
          <a
            href={telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="account-suspended-link-btn account-suspended-contact"
          >
            <FaTelegram aria-hidden className="account-suspended-contact-icon" />
            Contact support
          </a>
          <button type="button" className="account-suspended-signout" onClick={() => void signOut()}>
            Log out
          </button>
        </div>
      </div>
    </div>
  )
}
