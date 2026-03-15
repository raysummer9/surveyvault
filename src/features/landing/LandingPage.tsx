import { Link } from 'react-router-dom'
import {
  FiArrowRight,
  FiBarChart2,
  FiCamera,
  FiClock,
  FiDollarSign,
  FiGift,
  FiHeart,
  FiMonitor,
  FiPlus,
  FiShield,
  FiShoppingBag,
  FiUsers,
  FiWind,
  FiZap,
} from 'react-icons/fi'
import { PublicPageLayout } from '../../shared/ui/PublicPageLayout'

const benefits = [
  {
    title: 'Real Cash Rewards',
    description:
      'Earn real money for every survey you complete. Withdraw via PayPal, bank transfer, or gift cards.',
    tag: 'Up to $50/survey',
    gradient: 'linear-gradient(90deg, #b91c1c 0%, #4c1d95 100%)',
    icon: FiDollarSign,
  },
  {
    title: '100% Secure & Private',
    description:
      'Your data is encrypted and never sold. We follow strict GDPR compliance to protect your privacy.',
    tag: 'GDPR Compliant',
    gradient: 'linear-gradient(90deg, #2563eb 0%, #7c3aed 100%)',
    icon: FiShield,
  },
  {
    title: 'Quick & Easy Surveys',
    description:
      'Most surveys take just 5–15 minutes. Complete them anytime, anywhere on any device.',
    tag: '5–15 min average',
    gradient: 'linear-gradient(90deg, #3b82f6 0%, #a78bfa 100%)',
    icon: FiZap,
  },
  {
    title: 'Referral Bonuses',
    description:
      'Invite friends and earn 10% of their lifetime earnings. Build your network and grow your income.',
    tag: '10% lifetime bonus',
    gradient: 'linear-gradient(90deg, #1e293b 0%, #0f172a 100%)',
    icon: FiUsers,
  },
  {
    title: 'Track Your Progress',
    description:
      'Detailed analytics dashboard to monitor earnings, streaks, and survey history in real time.',
    tag: 'Live analytics',
    gradient: 'linear-gradient(90deg, #dc2626 0%, #9a3412 100%)',
    icon: FiBarChart2,
  },
  {
    title: 'Exclusive Rewards',
    description:
      'Unlock special bonuses, gift cards, and exclusive survey opportunities as you level up your tier.',
    tag: '4 reward tiers',
    gradient: 'linear-gradient(90deg, #7c3aed 0%, #c084fc 100%)',
    icon: FiGift,
  },
] as const

const trustedBy = ['Nielsen', 'Ipsos', 'Kantar', 'GfK', 'YouGov', 'Qualtrics'] as const

const featuredSurveys = [
  {
    title: 'Tech Usage Habits 2024',
    description: 'Share your experience with technology and smart devices in daily life.',
    reward: '$3.50',
    duration: '15 min',
    category: 'Technology',
    color: '#2563eb',
    bgColor: '#dbeafe',
    icon: FiMonitor,
  },
  {
    title: 'Shopping Preferences',
    description: 'Tell us about your online and in-store shopping habits and preferences.',
    reward: '$1.25',
    duration: '5 min',
    category: 'Retail',
    color: '#7c3aed',
    bgColor: '#ede9fe',
    icon: FiShoppingBag,
  },
  {
    title: 'Health & Wellness 2024',
    description: 'Share insights on your health routines, fitness habits, and wellness goals.',
    reward: '$4.00',
    duration: '20 min',
    category: 'Health',
    color: '#ea580c',
    bgColor: '#ffedd5',
    icon: FiHeart,
  },
  {
    title: 'Environmental Attitudes',
    description: 'Your views on sustainability, climate change, and eco-friendly products.',
    reward: '$2.75',
    duration: '10 min',
    category: 'Environment',
    color: '#16a34a',
    bgColor: '#dcfce7',
    icon: FiWind,
  },
  {
    title: 'Media Consumption',
    description: 'How you consume news, entertainment, and social media content daily.',
    reward: '$1.80',
    duration: '8 min',
    category: 'Media',
    color: '#db2777',
    bgColor: '#fce7f3',
    icon: FiCamera,
  },
] as const

export function LandingPage() {
  return (
    <PublicPageLayout className="landing-page">
      <section className="landing-hero">
        <div className="landing-hero-inner">
          <div className="landing-hero-left">
            <div className="landing-hero-badge">
              <span className="landing-hero-badge-dot" aria-hidden />
              Over 50,000 active members
            </div>
            <h1 className="landing-hero-title">
              Shape the future of
              <br />
              <span className="landing-hero-accent">surveys</span>
            </h1>
            <p className="landing-hero-subtitle">
              Join thousands of people sharing their opinions and earning real rewards. Your voice
              matters — and it pays.
            </p>
            <div className="landing-hero-actions">
              <Link className="landing-cta-primary" to="/register">
                Get Started Free <FiArrowRight />
              </Link>
              <Link className="landing-cta-secondary" to="/open-projects">
                Browse Surveys
              </Link>
            </div>
            <div className="landing-hero-trust">
              <div className="landing-hero-avatars" aria-hidden>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="landing-hero-avatar" />
                ))}
              </div>
              <span className="landing-hero-stars" aria-hidden>
                ★★★★★
              </span>
              <span className="landing-hero-trust-text">Trusted by 50,000+ members</span>
            </div>
          </div>
          <div className="landing-hero-right">
            <div className="landing-hero-earnings-card">
              <div className="landing-hero-earnings-header">
                <span className="landing-hero-earnings-title">Your Earnings</span>
                <span className="landing-hero-earnings-today">+$12.50 today</span>
              </div>
              <div className="landing-hero-earnings-amount">$1,248.00</div>
              <div className="landing-hero-earnings-label">Total lifetime earnings</div>
              <div className="landing-hero-earnings-progress">
                <div className="landing-hero-earnings-progress-fill" />
              </div>
              <div className="landing-hero-earnings-stats">
                <div className="landing-hero-earnings-stat">
                  <span className="landing-hero-earnings-stat-value">248</span>
                  <span className="landing-hero-earnings-stat-label">Surveys</span>
                </div>
                <div className="landing-hero-earnings-stat">
                  <span className="landing-hero-earnings-stat-value">14</span>
                  <span className="landing-hero-earnings-stat-label">Day Streak</span>
                </div>
                <div className="landing-hero-earnings-stat landing-hero-earnings-stat-tier">
                  <span className="landing-hero-earnings-stat-value">Gold</span>
                  <span className="landing-hero-earnings-stat-label">Tier</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-trusted-by">
        <h2 className="landing-trusted-by-title">Trusted by leading research firms</h2>
        <ul className="landing-trusted-by-logos">
          {trustedBy.map((name) => (
            <li key={name} className="landing-trusted-by-logo">
              {name}
            </li>
          ))}
        </ul>
      </section>

      <section className="landing-benefits">
        <span className="landing-benefits-badge">Benefits</span>
        <h2 className="landing-benefits-title">Why join us?</h2>
        <p className="landing-benefits-subtitle">
          Everything you need to turn your opinions into meaningful income.
        </p>
        <ul className="landing-benefits-grid">
          {benefits.map((benefit) => {
            const Icon = benefit.icon
            return (
              <li
                key={benefit.title}
                className="landing-benefit-card"
                style={{ background: benefit.gradient }}
              >
                <div className="landing-benefit-icon">
                  <Icon aria-hidden />
                </div>
                <h3 className="landing-benefit-title">{benefit.title}</h3>
                <p className="landing-benefit-desc">{benefit.description}</p>
                <span className="landing-benefit-tag">
                  {benefit.tag} <FiArrowRight aria-hidden />
                </span>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="landing-featured">
        <div className="landing-featured-header">
          <div className="landing-featured-header-left">
            <span className="landing-featured-badge">LIVE NOW</span>
            <h2 className="landing-featured-title">Featured Surveys</h2>
            <p className="landing-featured-subtitle">
              High-paying surveys available right now. Join to start earning.
            </p>
          </div>
          <Link className="landing-featured-view-all" to="/open-projects">
            View All Surveys <FiArrowRight />
          </Link>
        </div>
        <div className="landing-featured-grid">
          {featuredSurveys.map((survey) => {
            const Icon = survey.icon
            return (
              <div key={survey.title} className="landing-featured-card">
                <div
                  className="landing-featured-card-icon"
                  style={{ background: survey.bgColor, color: survey.color }}
                >
                  <Icon aria-hidden />
                </div>
                <span className="landing-featured-card-reward">{survey.reward}</span>
                <h3 className="landing-featured-card-title">{survey.title}</h3>
                <p className="landing-featured-card-desc">{survey.description}</p>
                <div className="landing-featured-card-meta">
                  <span className="landing-featured-card-duration">
                    <FiClock aria-hidden /> {survey.duration}
                  </span>
                  <span
                    className="landing-featured-card-category"
                    style={{ color: survey.color, background: survey.bgColor }}
                  >
                    {survey.category}
                  </span>
                </div>
                <Link
                  to="/register"
                  className="landing-featured-card-start"
                  style={{ color: survey.color }}
                >
                  Start <FiArrowRight />
                </Link>
              </div>
            )
          })}
          <div className="landing-featured-card landing-featured-card-cta">
            <div className="landing-featured-card-cta-icon">
              <FiPlus aria-hidden />
            </div>
            <h3 className="landing-featured-card-cta-title">50+ More Surveys</h3>
            <p className="landing-featured-card-cta-desc">
              Create a free account to unlock all available surveys and start earning today.
            </p>
            <Link className="landing-featured-card-cta-btn" to="/register">
              Join Free <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      <section className="landing-cta">
        <h2 className="landing-section-title">Ready to get started?</h2>
        <p className="landing-cta-text">
          Create your free account and complete onboarding to unlock paid survey opportunities.
        </p>
        <Link className="button landing-cta-primary" to="/register">
          Get Started
        </Link>
      </section>
    </PublicPageLayout>
  )
}
