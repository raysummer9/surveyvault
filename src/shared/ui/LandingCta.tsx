import { FiArrowRight } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { APP_NAME } from '../../config/brand'

export function LandingCta() {
  return (
    <section className="landing-cta">
      <div className="landing-cta-card">
        <div className="landing-cta-badge">
          <span className="landing-cta-badge-dot" aria-hidden />
          50,000+ members already earning
        </div>
        <h2 className="landing-cta-title">Ready to start earning with your opinions?</h2>
        <p className="landing-cta-text">
          Join {APP_NAME} today and start earning real cash rewards. Creating an account is free — a
          small one-time fee is required to join the workforce and start earning.
        </p>
        <div className="landing-cta-actions">
          <Link className="landing-cta-btn-primary" to="/register">
            Create Free Account <FiArrowRight />
          </Link>
          <Link className="landing-cta-btn-secondary" to="/open-projects">
            Browse Surveys First
          </Link>
        </div>
        <p className="landing-cta-disclaimer">
          Free account creation · One-time workforce fee · Cancel anytime
        </p>
      </div>
    </section>
  )
}
