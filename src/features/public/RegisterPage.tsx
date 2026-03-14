import { type FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { FaFacebookF, FaLock, FaShieldAlt } from 'react-icons/fa'
import { FcGoogle } from 'react-icons/fc'
import { FiArrowRight } from 'react-icons/fi'
import { HiOutlineLightningBolt } from 'react-icons/hi'
import {
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoEyeOffOutline,
  IoEyeOutline,
  IoLockClosedOutline,
  IoMailOutline,
  IoPersonOutline,
} from 'react-icons/io5'
import { MdAttachMoney, MdGroups, MdOutlineDescription } from 'react-icons/md'
import { z } from 'zod'

const registerSchema = z
  .object({
    firstName: z.string().trim().min(1, 'First name is required.'),
    lastName: z.string().trim().min(1, 'Last name is required.'),
    email: z.string().email('Please enter a valid email address.'),
    password: z.string().min(8, 'Password must be at least 8 characters.'),
    confirmPassword: z.string().min(1, 'Please confirm your password.'),
    terms: z.boolean().refine((value) => value, {
      message: 'You must accept the terms and privacy policy.',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: "Passwords don't match.",
  })

const benefits = [
  {
    icon: MdAttachMoney,
    title: 'Earn Real Cash',
    desc: 'Get paid via PayPal, bank transfer, or gift cards',
    metric: '$2-$50',
    metricSub: 'per survey',
    color: 'green',
  },
  {
    icon: MdOutlineDescription,
    title: 'Matched Surveys',
    desc: 'AI-matched to your profile for higher acceptance',
    metric: '95%',
    metricSub: 'match rate',
    color: 'blue',
  },
  {
    icon: HiOutlineLightningBolt,
    title: 'Instant Payouts',
    desc: 'Withdraw earnings as soon as you hit $10',
    metric: '24hr',
    metricSub: 'processing',
    color: 'purple',
  },
  {
    icon: MdGroups,
    title: 'Referral Bonuses',
    desc: 'Earn $5 for every friend you invite',
    metric: '$5',
    metricSub: 'per referral',
    color: 'orange',
  },
]

export function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{
    firstName?: string
    lastName?: string
    email?: string
    password?: string
    confirmPassword?: string
    terms?: string
  }>({})

  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const parsed = registerSchema.safeParse({
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      terms: termsAccepted,
    })

    if (!parsed.success) {
      const nextErrors: {
        firstName?: string
        lastName?: string
        email?: string
        password?: string
        confirmPassword?: string
        terms?: string
      } = {}

      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0]
        if (
          field === 'firstName' ||
          field === 'lastName' ||
          field === 'email' ||
          field === 'password' ||
          field === 'confirmPassword' ||
          field === 'terms'
        ) {
          nextErrors[field] = issue.message
        }
      })

      setFieldErrors(nextErrors)
      return
    }

    setFieldErrors({})
  }

  return (
    <section className="login-layout register-layout">
      <aside className="login-hero register-hero">
        <div className="login-hero-brand">
          <span className="brand-icon">S</span>
          <span>SurveyVault</span>
        </div>
        <h1>
          Your voice is <span className="register-heading-accent">worth more</span> than you think.
        </h1>
        <p className="register-desc">
          Join SurveyVault and start earning real cash by sharing your opinions. It takes less than 2
          minutes to get started.
        </p>

        <div className="register-benefits">
          {benefits.map(({ icon: Icon, title, desc, metric, metricSub, color }) => (
            <article key={title} className={`register-benefit register-benefit--${color}`}>
              <div className="register-benefit-icon">
                <Icon />
              </div>
              <div className="register-benefit-content">
                <div className="register-benefit-title">{title}</div>
                <div className="register-benefit-desc">{desc}</div>
              </div>
              <div className="register-benefit-metric">
                <div className="register-benefit-highlight">{metric}</div>
                <div className="register-benefit-sub">{metricSub}</div>
              </div>
            </article>
          ))}
        </div>
      </aside>

      <section className="login-form-wrap">
        <div className="login-card">
          <h2>Create your free account</h2>
          <p className="subtle">
            Already have an account?{' '}
            <Link to="/sign-in" className="create-one-link">
              Sign in <FiArrowRight />
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

          <p className="divider">or register with email</p>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <label htmlFor="firstName">
              First Name <span className="required-asterisk">*</span>
            </label>
            <div className={fieldErrors.firstName ? 'input-wrap input-wrap-error' : 'input-wrap'}>
              <IoPersonOutline className="input-icon" />
              <input
                id="firstName"
                type="text"
                placeholder="Jane"
                value={firstName}
                onChange={(event) => {
                  setFirstName(event.target.value)
                  if (fieldErrors.firstName) {
                    setFieldErrors((prev) => ({ ...prev, firstName: undefined }))
                  }
                }}
              />
            </div>
            {fieldErrors.firstName && <p className="field-error">{fieldErrors.firstName}</p>}

            <label htmlFor="lastName">
              Last Name <span className="required-asterisk">*</span>
            </label>
            <div className={fieldErrors.lastName ? 'input-wrap input-wrap-error' : 'input-wrap'}>
              <IoPersonOutline className="input-icon" />
              <input
                id="lastName"
                type="text"
                placeholder="Smith"
                value={lastName}
                onChange={(event) => {
                  setLastName(event.target.value)
                  if (fieldErrors.lastName) {
                    setFieldErrors((prev) => ({ ...prev, lastName: undefined }))
                  }
                }}
              />
            </div>
            {fieldErrors.lastName && <p className="field-error">{fieldErrors.lastName}</p>}

            <label htmlFor="reg-email">
              Email Address <span className="required-asterisk">*</span>
            </label>
            <div className={fieldErrors.email ? 'input-wrap input-wrap-error' : 'input-wrap'}>
              <IoMailOutline className="input-icon" />
              <input
                id="reg-email"
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

            <label htmlFor="reg-password">
              Password <span className="required-asterisk">*</span>
            </label>
            <div className={fieldErrors.password ? 'input-wrap input-wrap-error' : 'input-wrap'}>
              <IoLockClosedOutline className="input-icon" />
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Min. 8 characters"
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

            <label htmlFor="confirm-password">
              Confirm Password <span className="required-asterisk">*</span>
            </label>
            <div className={fieldErrors.confirmPassword ? 'input-wrap input-wrap-error' : 'input-wrap'}>
              <IoLockClosedOutline className="input-icon" />
              <input
                id="confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Repeat your password"
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(event.target.value)
                  if (fieldErrors.confirmPassword) {
                    setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }))
                  }
                }}
              />
              <button
                type="button"
                className="eye-toggle"
                onClick={() => setShowConfirmPassword((p) => !p)}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? (
                  <IoEyeOffOutline className="eye-icon" />
                ) : (
                  <IoEyeOutline className="eye-icon" />
                )}
              </button>
            </div>
            {fieldErrors.confirmPassword && (
              <p className="field-error">{fieldErrors.confirmPassword}</p>
            )}

            {passwordsMatch && (
              <p className="password-match success" role="status">
                <IoCheckmarkCircleOutline /> Passwords match
              </p>
            )}
            {passwordsMismatch && (
              <p className="password-match error" role="alert">
                <IoCloseCircleOutline /> Passwords don&apos;t match
              </p>
            )}

            <label className="checkbox-row" htmlFor="terms">
              <input
                id="terms"
                type="checkbox"
                checked={termsAccepted}
                onChange={(event) => {
                  setTermsAccepted(event.target.checked)
                  if (fieldErrors.terms) {
                    setFieldErrors((prev) => ({ ...prev, terms: undefined }))
                  }
                }}
              />
              <span>
                I agree to the{' '}
                <Link to="/" className="inline-link">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/" className="inline-link">
                  Privacy Policy
                </Link>
                . I confirm I am 18 years or older.
              </span>
            </label>
            {fieldErrors.terms && <p className="field-error">{fieldErrors.terms}</p>}

            <button className="auth-submit" type="submit">
              Register for free
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
              <HiOutlineLightningBolt /> Free Forever
            </span>
          </div>

          <div className="footer-links">
            <Link to="/">Home</Link>
            <Link to="/open-projects">Open Surveys</Link>
            <Link to="/what-to-expect">What to Expect</Link>
            <Link to="/sign-in">Login</Link>
          </div>
        </div>
      </section>
    </section>
  )
}
