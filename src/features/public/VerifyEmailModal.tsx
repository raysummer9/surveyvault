import { IoMailOutline } from 'react-icons/io5'
import { APP_NAME } from '../../config/brand'

type VerifyEmailModalProps = {
  email: string
  onContinue: () => void
}

/**
 * Shown after successful registration when email verification is expected.
 */
export function VerifyEmailModal({ email, onContinue }: VerifyEmailModalProps) {
  return (
    <div className="verify-email-modal-overlay" role="presentation">
      <div
        className="verify-email-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="verify-email-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="verify-email-modal-icon" aria-hidden>
          <IoMailOutline />
        </div>
        <h2 id="verify-email-modal-title">Check your email</h2>
        <p className="verify-email-modal-lead">
          We sent a verification link to <strong className="verify-email-modal-address">{email}</strong>.
        </p>
        <p className="verify-email-modal-hint">
          Open the email and tap the link to verify your address before signing in. If you don&apos;t see it,
          check your spam or promotions folder.
        </p>
        <p className="verify-email-modal-brand">— {APP_NAME}</p>
        <button type="button" className="verify-email-modal-cta" onClick={onContinue}>
          Continue
        </button>
      </div>
    </div>
  )
}
