import { useState } from 'react'
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
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword

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

          <form className="auth-form">
            <label htmlFor="firstName">First Name</label>
            <div className="input-wrap">
              <IoPersonOutline className="input-icon" />
              <input id="firstName" type="text" placeholder="Jane" />
            </div>

            <label htmlFor="lastName">Last Name</label>
            <div className="input-wrap">
              <IoPersonOutline className="input-icon" />
              <input id="lastName" type="text" placeholder="Smith" />
            </div>

            <label htmlFor="reg-email">Email Address</label>
            <div className="input-wrap">
              <IoMailOutline className="input-icon" />
              <input id="reg-email" type="email" placeholder="you@example.com" />
            </div>

            <label htmlFor="reg-password">Password</label>
            <div className="input-wrap">
              <IoLockClosedOutline className="input-icon" />
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

            <label htmlFor="confirm-password">Confirm Password</label>
            <div className="input-wrap">
              <IoLockClosedOutline className="input-icon" />
              <input
                id="confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Repeat your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
              <input id="terms" type="checkbox" />
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
