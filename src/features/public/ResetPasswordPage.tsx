import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { IoEyeOffOutline, IoEyeOutline, IoLockClosedOutline } from 'react-icons/io5'
import { z } from 'zod'
import { useAuth } from '../auth/AuthContext'

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters.'),
    confirmPassword: z.string().min(1, 'Please confirm your password.'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: "Passwords don't match.",
  })

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const { updatePassword } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    const parsed = resetPasswordSchema.safeParse({ password, confirmPassword })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Invalid password input.')
      return
    }

    setSubmitting(true)
    try {
      await updatePassword(parsed.data.password)
      navigate('/sign-in')
    } catch (resetError) {
      const message = resetError instanceof Error ? resetError.message : 'Unable to reset password.'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="login-layout">
      <section className="login-form-wrap">
        <div className="login-card">
          <h2>Choose a new password</h2>
          <p className="subtle">Set a strong password to secure your SurveyVault account.</p>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <label htmlFor="new-password">
              New password <span className="required-asterisk">*</span>
            </label>
            <div className={error ? 'input-wrap input-wrap-error' : 'input-wrap'}>
              <IoLockClosedOutline className="input-icon" />
              <input
                id="new-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Min. 8 characters"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value)
                  if (error) setError('')
                }}
              />
              <button
                type="button"
                className="eye-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <IoEyeOffOutline className="eye-icon" /> : <IoEyeOutline className="eye-icon" />}
              </button>
            </div>

            <label htmlFor="confirm-new-password">
              Confirm new password <span className="required-asterisk">*</span>
            </label>
            <div className={error ? 'input-wrap input-wrap-error' : 'input-wrap'}>
              <IoLockClosedOutline className="input-icon" />
              <input
                id="confirm-new-password"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Repeat your password"
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(event.target.value)
                  if (error) setError('')
                }}
              />
              <button
                type="button"
                className="eye-toggle"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? (
                  <IoEyeOffOutline className="eye-icon" />
                ) : (
                  <IoEyeOutline className="eye-icon" />
                )}
              </button>
            </div>

            {error && <p className="field-error">{error}</p>}

            <button className="auth-submit" type="submit" disabled={submitting}>
              {submitting ? 'Updating password...' : 'Update password'}
            </button>
          </form>

          <div className="footer-links">
            <Link to="/sign-in">Back to sign in</Link>
          </div>
        </div>
      </section>
    </section>
  )
}

