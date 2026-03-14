import { type FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { FaFacebookF, FaLock, FaShieldAlt } from 'react-icons/fa'
import { FcGoogle } from 'react-icons/fc'
import { FiArrowRight, FiUser } from 'react-icons/fi'
import { HiOutlineLightningBolt } from 'react-icons/hi'
import { IoEyeOffOutline, IoEyeOutline, IoLockClosedOutline, IoMailOutline } from 'react-icons/io5'
import { z } from 'zod'

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
})

export function SignInPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
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
  }

  return (
    <section className="login-layout">
      <aside className="login-hero">
        <div className="login-hero-brand">
          <span className="brand-icon">S</span>
          <span>SurveyVault</span>
        </div>
        <h1>
          Welcome back.
          <br />
          <span>Your opinions</span>
          <br />
          are waiting.
        </h1>
        <p>
          Log in to access your personalized survey feed, track your earnings, and cash out your
          rewards.
        </p>

        <div className="hero-stat-list">
          <article className="hero-stat">
            <div className="hero-stat-icon balance-icon" aria-hidden />
            <div className="hero-stat-label">Your Balance</div>
            <div className="hero-stat-value">$124.50</div>
            <div className="hero-chip">+18%</div>
          </article>
          <article className="hero-stat">
            <div className="hero-stat-icon surveys-icon" aria-hidden />
            <div className="hero-stat-label">Surveys Available</div>
            <div className="hero-stat-value">12 New</div>
            <div className="hero-dot" />
          </article>
          <article className="hero-stat">
            <div className="hero-stat-icon streak-icon" aria-hidden />
            <div className="hero-stat-label">Daily Streak</div>
            <div className="hero-stat-value">7 Days 🔥</div>
          </article>
        </div>
      </aside>

      <section className="login-form-wrap">
        <div className="login-card">
          <h2>Sign in to your account</h2>
          <p className="subtle">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="create-one-link">
              Create one free <FiArrowRight />
            </Link>
          </p>

          <div className="social-row">
            <button className="social-btn" type="button">
              <FcGoogle />
              Google
            </button>
            <button className="social-btn" type="button">
              <FaFacebookF className="facebook-icon" />
              Facebook
            </button>
          </div>

          <p className="divider">or continue with email</p>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <label htmlFor="email">
              Email address <span className="required-asterisk">*</span>
            </label>
            <div className={fieldErrors.email ? 'input-wrap input-wrap-error' : 'input-wrap'}>
              <IoMailOutline className="input-icon" />
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value)
                  if (fieldErrors.email) {
                    setFieldErrors((prev) => ({ ...prev, email: undefined }))
                  }
                }}
              />
            </div>
            {fieldErrors.email && <p className="field-error">{fieldErrors.email}</p>}

            <div className="label-row">
              <label htmlFor="password">
                Password <span className="required-asterisk">*</span>
              </label>
              <Link to="/" className="small-link">
                Forgot password?
              </Link>
            </div>
            <div className={fieldErrors.password ? 'input-wrap input-wrap-error' : 'input-wrap'}>
              <IoLockClosedOutline className="input-icon" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value)
                  if (fieldErrors.password) {
                    setFieldErrors((prev) => ({ ...prev, password: undefined }))
                  }
                }}
              />
              <button
                type="button"
                className="eye-toggle"
                onClick={() => setShowPassword((p) => !p)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <IoEyeOffOutline className="eye-icon" />
                ) : (
                  <IoEyeOutline className="eye-icon" />
                )}
              </button>
            </div>
            {fieldErrors.password && <p className="field-error">{fieldErrors.password}</p>}

            <label className="checkbox-row" htmlFor="remember">
              <input id="remember" type="checkbox" />
              <span>Remember me for 30 days</span>
            </label>

            <button className="auth-submit" type="submit">
              <FiUser />
              Sign In to SurveyVault
            </button>
          </form>

          <div className="compliance-row">
            <span>
              <FaShieldAlt /> SSL Secured
            </span>
            <span>
              <FaLock /> GDPR Compliant
            </span>
            <span>
              <HiOutlineLightningBolt /> Instant Access
            </span>
          </div>

          <div className="footer-links">
            <Link to="/">Home</Link>
            <Link to="/open-projects">Open Surveys</Link>
            <Link to="/what-to-expect">What to Expect</Link>
            <Link to="/register">Register</Link>
          </div>
        </div>
      </section>
    </section>
  )
}
