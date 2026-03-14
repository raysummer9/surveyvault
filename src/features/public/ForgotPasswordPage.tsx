import { type FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { IoMailOutline } from 'react-icons/io5'
import { z } from 'zod'
import { useAuth } from '../auth/AuthContext'

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
})

export function ForgotPasswordPage() {
  const { requestPasswordReset } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    const parsed = forgotPasswordSchema.safeParse({ email })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Please enter a valid email.')
      return
    }

    setSubmitting(true)
    try {
      await requestPasswordReset(parsed.data.email)
      setSuccess('Password reset email sent. Check your inbox for the reset link.')
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'Unable to request password reset.'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="login-layout">
      <section className="login-form-wrap">
        <div className="login-card">
          <h2>Reset your password</h2>
          <p className="subtle">Enter your account email and we&apos;ll send a reset link.</p>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <label htmlFor="forgot-email">
              Email address <span className="required-asterisk">*</span>
            </label>
            <div className={error ? 'input-wrap input-wrap-error' : 'input-wrap'}>
              <IoMailOutline className="input-icon" />
              <input
                id="forgot-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(next) => {
                  setEmail(next.target.value)
                  if (error) setError('')
                }}
              />
            </div>

            {error && <p className="field-error">{error}</p>}
            {success && <p className="password-match success">{success}</p>}

            <button className="auth-submit" type="submit" disabled={submitting}>
              {submitting ? 'Sending reset link...' : 'Send reset link'}
            </button>
          </form>

          <div className="footer-links">
            <Link to="/sign-in">Back to sign in</Link>
            <Link to="/register">Create account</Link>
          </div>
        </div>
      </section>
    </section>
  )
}

