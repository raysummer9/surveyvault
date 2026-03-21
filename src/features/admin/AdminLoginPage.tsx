import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiArrowRight, FiShield } from 'react-icons/fi'
import { IoEyeOffOutline, IoEyeOutline, IoLockClosedOutline, IoMailOutline } from 'react-icons/io5'
import { z } from 'zod'
import { useAuth } from '../auth/AuthContext'

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
})

export function AdminLoginPage() {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitError('')
    const parsed = signInSchema.safeParse({ email, password })

    if (!parsed.success) {
      const nextErrors: { email?: string; password?: string } = {}
      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0]
        if (field === 'email' || field === 'password') {
          nextErrors[field] = issue.message
        }
      })
      setFieldErrors(nextErrors)
      return
    }

    setFieldErrors({})
    setSubmitting(true)
    try {
      await signIn(parsed.data.email, parsed.data.password)
      navigate('/admin')
    } catch (signInError) {
      const message = signInError instanceof Error ? signInError.message : 'Unable to sign in.'
      setSubmitError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="admin-login-layout">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <span className="brand-icon">S</span>
          <h1>Admin Login</h1>
          <p>Sign in to access the Taskpulse admin panel.</p>
        </div>

        <form className="admin-login-form" onSubmit={handleSubmit} noValidate>
          <label htmlFor="admin-email">
            Email address <span className="required-asterisk">*</span>
          </label>
          <div className={fieldErrors.email ? 'input-wrap input-wrap-error' : 'input-wrap'}>
            <IoMailOutline className="input-icon" />
            <input
              id="admin-email"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }))
              }}
            />
          </div>
          {fieldErrors.email && <p className="field-error">{fieldErrors.email}</p>}

          <label htmlFor="admin-password">
            Password <span className="required-asterisk">*</span>
          </label>
          <div className={fieldErrors.password ? 'input-wrap input-wrap-error' : 'input-wrap'}>
            <IoLockClosedOutline className="input-icon" />
            <input
              id="admin-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }))
              }}
            />
            <button
              type="button"
              className="eye-toggle"
              onClick={() => setShowPassword((p) => !p)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
            </button>
          </div>
          {fieldErrors.password && <p className="field-error">{fieldErrors.password}</p>}
          {submitError && <p className="field-error">{submitError}</p>}

          <button className="admin-login-submit" type="submit" disabled={submitting}>
            <FiShield />
            {submitting ? 'Signing in...' : 'Sign In to Admin'}
          </button>
        </form>

        <div className="admin-login-footer">
          <Link to="/sign-in" className="admin-login-link">
            User login <FiArrowRight />
          </Link>
          <Link to="/">Back to Taskpulse</Link>
        </div>
      </div>
    </section>
  )
}
