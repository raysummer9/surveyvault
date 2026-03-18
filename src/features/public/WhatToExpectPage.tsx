import { useState } from 'react'
import {
  FiArrowRight,
  FiBarChart2,
  FiChevronDown,
  FiChevronUp,
  FiClock,
  FiCreditCard,
  FiClipboard,
  FiDollarSign,
  FiFileText,
  FiGift,
  FiGlobe,
  FiHeart,
  FiHome,
  FiLifeBuoy,
  FiRefreshCw,
  FiShield,
  FiStar,
  FiTarget,
  FiTrendingUp,
  FiUser,
  FiUserPlus,
  FiUsers,
  FiZap,
} from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { LandingCta } from '../../shared/ui/LandingCta'
import { PublicPageLayout } from '../../shared/ui/PublicPageLayout'

const stats = [
  { value: '50,000+', label: 'Active Members' },
  { value: '$2.4M+', label: 'Total Paid Out' },
  { value: '68', label: 'Live Surveys' },
  { value: '24h', label: 'Avg. Payout Time' },
] as const

const processSteps = [
  {
    step: 1,
    title: 'Create Account',
    description:
      'Create your free account in under 2 minutes. A small one-time fee is required to join the workforce and start earning.',
    icon: FiUser,
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
    badgeColor: '#3b82f6',
  },
  {
    step: 2,
    title: 'Complete Profile',
    description:
      'Fill out your demographic profile so we can match you with the most relevant and highest-paying surveys.',
    icon: FiFileText,
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
    badgeColor: '#7c3aed',
  },
  {
    step: 3,
    title: 'Take Surveys',
    description:
      'Browse available surveys, apply for ones that match your profile, and complete them at your own pace.',
    icon: FiClipboard,
    gradient: 'linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)',
    badgeColor: '#2563eb',
  },
  {
    step: 4,
    title: 'Get Paid',
    description:
      'Earnings are credited instantly upon completion. Withdraw to PayPal, bank transfer, or gift cards.',
    icon: FiDollarSign,
    gradient: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
    badgeColor: '#16a34a',
  },
] as const

const earningsFeatures = [
  {
    icon: FiZap,
    title: 'Instant Credit',
    description:
      'Earnings appear in your wallet immediately after survey completion — no delays or approval queues.',
    color: '#3b82f6',
    bg: 'rgba(59, 130, 246, 0.15)',
  },
  {
    icon: FiBarChart2,
    title: 'Bonus Multipliers',
    description:
      'Earn streak bonuses, referral rewards, and daily poll points on top of your base survey earnings.',
    color: '#8b5cf6',
    bg: 'rgba(139, 92, 246, 0.15)',
  },
  {
    icon: FiUsers,
    title: 'Referral Program',
    description:
      'Earn $2.00 for every friend you refer who completes their first survey. No limit on referrals.',
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.15)',
  },
  {
    icon: FiShield,
    title: 'Screener Protection',
    description:
      "If you're screened out of a survey after 3+ minutes, you still receive a partial compensation payment.",
    color: '#22c55e',
    bg: 'rgba(34, 197, 94, 0.15)',
  },
] as const

const platformFeatures = [
  {
    icon: FiTarget,
    title: 'Smart Survey Matching',
    description:
      'Our AI-powered matching engine connects you with surveys that fit your profile, maximizing your acceptance rate and earnings.',
    stat: '95% match accuracy',
    color: '#3b82f6',
    bg: 'rgba(59, 130, 246, 0.15)',
  },
  {
    icon: FiShield,
    title: 'Privacy Protected',
    description:
      'Your data is encrypted and never sold. We only share anonymized, aggregated insights with research clients — never personal details.',
    stat: 'GDPR & CCPA compliant',
    color: '#8b5cf6',
    bg: 'rgba(139, 92, 246, 0.15)',
  },
  {
    icon: FiClock,
    title: 'Flexible Scheduling',
    description:
      "Take surveys on your own time — morning, evening, or weekend. Most surveys stay open for 7-14 days so you're never rushed.",
    stat: 'Available 24/7',
    color: '#22c55e',
    bg: 'rgba(34, 197, 94, 0.15)',
  },
  {
    icon: FiStar,
    title: 'Loyalty & Streaks',
    description:
      'Build daily streaks to unlock multiplier bonuses. Reach Gold or Platinum status for priority access to premium, high-paying surveys.',
    stat: 'Up to 2x bonus multiplier',
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.15)',
  },
  {
    icon: FiCreditCard,
    title: 'Multiple Payout Options',
    description:
      'Cash out via PayPal, direct bank transfer, Amazon gift cards, or donate to charity. Minimum withdrawal is $500.00.',
    stat: '$500 minimum withdrawal',
    color: '#0d9488',
    bg: 'rgba(13, 148, 136, 0.15)',
  },
  {
    icon: FiLifeBuoy,
    title: '24/7 Support',
    description:
      'Our dedicated support team is available around the clock via live chat and email. Average response time under 2 hours.',
    stat: '<2hr avg. response time',
    color: '#ec4899',
    bg: 'rgba(236, 72, 153, 0.15)',
  },
] as const

const payoutMethods = [
  {
    icon: FiCreditCard,
    title: 'PayPal',
    description: 'Instant transfer to your PayPal account',
    stat: 'Instant',
    color: '#22c55e',
    iconColor: '#3b82f6',
    bg: 'rgba(59, 130, 246, 0.15)',
  },
  {
    icon: FiHome,
    title: 'Bank Transfer',
    description: 'Direct deposit to your bank account',
    stat: '1-3 business days',
    color: '#3b82f6',
    iconColor: '#1e40af',
    bg: 'rgba(30, 64, 175, 0.15)',
  },
  {
    icon: FiGift,
    title: 'Gift Cards',
    description: 'Amazon, Starbucks, and 50+ retailers',
    stat: 'Within 24 hours',
    color: '#f59e0b',
    iconColor: '#ea580c',
    bg: 'rgba(234, 88, 12, 0.15)',
  },
  {
    icon: FiHeart,
    title: 'Donate',
    description: 'Give your earnings to a charity of choice',
    stat: 'Instant',
    color: '#ec4899',
    iconColor: '#db2777',
    bg: 'rgba(219, 39, 119, 0.15)',
  },
] as const

const journeySteps = [
  {
    label: 'Day 1',
    title: 'Sign Up & Profile',
    badge: '~5 min',
    description:
      'Create your account and complete your demographic profile. The more complete your profile, the better your survey matches.',
    icon: FiUser,
    color: '#3b82f6',
  },
  {
    label: 'Day 1-2',
    title: 'First Surveys',
    badge: 'Earn $2-$8',
    description:
      'Browse your personalized survey feed. Start with shorter surveys (5-10 min) to build your profile score and unlock more opportunities.',
    icon: FiClipboard,
    color: '#8b5cf6',
  },
  {
    label: 'Day 3-5',
    title: 'Invite Friends',
    badge: '+$2 per referral',
    description:
      'Share your referral link with friends and family. Each successful referral adds $2.00 to your balance — with no cap on how many you can refer.',
    icon: FiUserPlus,
    color: '#f59e0b',
  },
  {
    label: 'Day 5-7',
    title: 'Reach $5 Threshold',
    badge: 'Ready to withdraw',
    description:
      'Most new members reach the $5 withdrawal threshold within their first week. Request your first payout and choose your preferred method.',
    icon: FiRefreshCw,
    color: '#22c55e',
  },
  {
    label: 'Week 2+',
    title: 'Scale Your Earnings',
    badge: 'Ongoing',
    description:
      "With a complete profile and growing streak, you'll unlock premium surveys and higher-paying studies. Top earners make $200-$400/month.",
    icon: FiDollarSign,
    color: '#3b82f6',
  },
] as const

const journeyFaqItems = [
  {
    question: 'Is creating an account free?',
    answer:
      'Yes. Creating a SurveyVault account is completely free. A small one-time fee is required to join the workforce and unlock paid survey opportunities. There are no monthly subscriptions or hidden charges.',
  },
  {
    question: 'How long does it take to get paid?',
    answer:
      'PayPal and gift card payouts are processed within 24 hours. Bank transfers typically take 1-3 business days. Once you reach the $500 minimum, you can request a payout anytime.',
  },
  {
    question: 'What happens if I get screened out?',
    answer:
      'If you get screened out after 3+ minutes of a survey, you still receive partial compensation. Our screener protection ensures you are never left empty-handed.',
  },
  {
    question: 'How many surveys can I take per day?',
    answer:
      'There is no daily limit. Survey availability depends on your profile and demographics. Complete your profile and check back regularly — new surveys are added daily.',
  },
  {
    question: 'Is my personal data safe?',
    answer:
      'Yes. We are GDPR and CCPA compliant. Your data is encrypted and never sold. We only share anonymized, aggregated insights with research clients — never your personal details.',
  },
] as const

export function WhatToExpectPage() {
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(null)
  return (
    <PublicPageLayout className="what-to-expect-page">
      <section className="expect-hero">
        <div className="expect-hero-bg" aria-hidden>
          <span className="expect-hero-bg-circle expect-hero-bg-circle-tl" />
          <span className="expect-hero-bg-circle expect-hero-bg-circle-br" />
        </div>
        <div className="expect-hero-inner">
          <div className="expect-hero-badge">
            <FiGlobe aria-hidden />
            How It Works
          </div>
          <h1 className="expect-hero-title">
            Everything you need to know about <span className="expect-hero-accent">SurveyVault</span>
          </h1>
          <p className="expect-hero-desc">
            From signing up to cashing out — here's a complete guide to how our platform works, how
            you earn, and how you get paid.
          </p>
          <div className="expect-hero-actions">
            <Link to="/register" className="expect-hero-btn-primary">
              Get Started Free <FiArrowRight />
            </Link>
            <Link to="/open-projects" className="expect-hero-btn-secondary">
              Browse Surveys
            </Link>
          </div>
          <div className="expect-hero-stats">
            {stats.map((stat) => (
              <div key={stat.label} className="expect-hero-stat">
                <span className="expect-hero-stat-value">{stat.value}</span>
                <span className="expect-hero-stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="expect-steps">
        <div className="expect-steps-inner">
          <div className="expect-steps-badge">
            <FiFileText aria-hidden />
            Getting Started
          </div>
          <h2 className="expect-steps-title">Start earning in 4 simple steps</h2>
          <p className="expect-steps-subtitle">
            Our streamlined onboarding gets you from sign-up to your first survey in under 5 minutes.
          </p>
          <div className="expect-steps-cards">
            <div className="expect-steps-connector" aria-hidden />
            {processSteps.map((p) => {
              const Icon = p.icon
              return (
                <div key={p.step} className="expect-steps-card">
                  <div
                    className="expect-steps-card-icon"
                    style={{ background: p.gradient }}
                  >
                    <Icon aria-hidden />
                  </div>
                  <span
                    className="expect-steps-card-badge"
                    style={{ background: p.badgeColor }}
                  >
                    {p.step}
                  </span>
                  <h3 className="expect-steps-card-title">{p.title}</h3>
                  <p className="expect-steps-card-desc">{p.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="expect-earnings">
        <div className="expect-earnings-inner">
          <div className="expect-earnings-left">
            <div className="expect-earnings-badge">
              <FiDollarSign aria-hidden />
              How Earnings Work
            </div>
            <h2 className="expect-earnings-title">
              Transparent, fair, and instant rewards
            </h2>
            <p className="expect-earnings-desc">
              Every survey on SurveyVault shows you the exact reward before you start. No hidden
              deductions, no waiting periods — your earnings are credited the moment you submit.
            </p>
            <ul className="expect-earnings-features">
              {earningsFeatures.map((f) => {
                const Icon = f.icon
                return (
                  <li key={f.title} className="expect-earnings-feature">
                    <div
                      className="expect-earnings-feature-icon"
                      style={{ background: f.bg, color: f.color }}
                    >
                      <Icon aria-hidden />
                    </div>
                    <div className="expect-earnings-feature-content">
                      <h3 className="expect-earnings-feature-title">{f.title}</h3>
                      <p className="expect-earnings-feature-desc">{f.description}</p>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
          <div className="expect-earnings-right">
            <div className="expect-earnings-card">
              <div className="expect-earnings-card-header">
                <span className="expect-earnings-card-label">This Month&apos;s Earnings</span>
                <span className="expect-earnings-card-badge">
                  <FiTrendingUp aria-hidden />
                  +18.2%
                </span>
              </div>
              <div className="expect-earnings-card-amount">$124.50</div>
              <div className="expect-earnings-card-stats">
                <div className="expect-earnings-card-stat">
                  <span className="expect-earnings-card-stat-dot expect-earnings-card-stat-dot-blue" />
                  <div className="expect-earnings-card-stat-content">
                    <span className="expect-earnings-card-stat-label">Survey Completions</span>
                    <div className="expect-earnings-card-stat-bar-wrap">
                      <div
                        className="expect-earnings-card-stat-bar expect-earnings-card-stat-bar-blue"
                        style={{ width: '80%' }}
                      />
                    </div>
                  </div>
                  <span className="expect-earnings-card-stat-value">$98.00</span>
                </div>
                <div className="expect-earnings-card-stat">
                  <span className="expect-earnings-card-stat-dot expect-earnings-card-stat-dot-purple" />
                  <div className="expect-earnings-card-stat-content">
                    <span className="expect-earnings-card-stat-label">Referral Bonuses</span>
                    <div className="expect-earnings-card-stat-bar-wrap">
                      <div
                        className="expect-earnings-card-stat-bar expect-earnings-card-stat-bar-purple"
                        style={{ width: '15%' }}
                      />
                    </div>
                  </div>
                  <span className="expect-earnings-card-stat-value">$18.00</span>
                </div>
                <div className="expect-earnings-card-stat">
                  <span className="expect-earnings-card-stat-dot expect-earnings-card-stat-dot-orange" />
                  <div className="expect-earnings-card-stat-content">
                    <span className="expect-earnings-card-stat-label">Streak & Daily Bonuses</span>
                    <div className="expect-earnings-card-stat-bar-wrap">
                      <div
                        className="expect-earnings-card-stat-bar expect-earnings-card-stat-bar-orange"
                        style={{ width: '5%' }}
                      />
                    </div>
                  </div>
                  <span className="expect-earnings-card-stat-value">$8.50</span>
                </div>
              </div>
            </div>
            <div className="expect-earnings-range">
              <div className="expect-earnings-range-card">
                <span className="expect-earnings-range-value">$0.50</span>
                <span className="expect-earnings-range-label">Min. per survey</span>
                <span className="expect-earnings-range-badge expect-earnings-range-badge-green">
                  Quick polls
                </span>
              </div>
              <div className="expect-earnings-range-card">
                <span className="expect-earnings-range-value">$15.00</span>
                <span className="expect-earnings-range-label">Max. per survey</span>
                <span className="expect-earnings-range-badge expect-earnings-range-badge-blue">
                  In-depth studies
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="expect-features">
        <div className="expect-features-inner">
          <div className="expect-features-badge">
            <FiTarget aria-hidden />
            Platform Features
          </div>
          <h2 className="expect-features-title">Why members love SurveyVault</h2>
          <p className="expect-features-subtitle">
            Built with your experience in mind — from smart matching to flexible payouts.
          </p>
          <div className="expect-features-grid">
            {platformFeatures.map((f) => {
              const Icon = f.icon
              return (
                <div key={f.title} className="expect-features-card">
                  <div
                    className="expect-features-card-icon"
                    style={{ background: f.bg, color: f.color }}
                  >
                    <Icon aria-hidden />
                  </div>
                  <h3 className="expect-features-card-title">{f.title}</h3>
                  <p className="expect-features-card-desc">{f.description}</p>
                  <div className="expect-features-card-stat">
                    <span
                      className="expect-features-card-stat-dot"
                      style={{ background: f.color }}
                    />
                    {f.stat}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="expect-payout">
        <div className="expect-payout-inner">
          <div className="expect-payout-badge">
            <FiCreditCard aria-hidden />
            Payout Methods
          </div>
          <h2 className="expect-payout-title">Choose how you get paid</h2>
          <p className="expect-payout-subtitle">
            Multiple withdrawal options to suit your preference. All payouts processed within 24
            hours.
          </p>
          <div className="expect-payout-cards">
            {payoutMethods.map((m) => {
              const Icon = m.icon
              return (
                <div key={m.title} className="expect-payout-card">
                  <div
                    className="expect-payout-card-icon"
                    style={{ background: m.bg, color: m.iconColor }}
                  >
                    <Icon aria-hidden />
                  </div>
                  <h3 className="expect-payout-card-title">{m.title}</h3>
                  <p className="expect-payout-card-desc">{m.description}</p>
                  <div className="expect-payout-card-stat">
                    <span
                      className="expect-payout-card-stat-dot"
                      style={{ background: m.color }}
                    />
                    {m.stat}
                  </div>
                </div>
              )
            })}
          </div>
          <div className="expect-payout-banner">
            <FiRefreshCw className="expect-payout-banner-icon" aria-hidden />
            <div className="expect-payout-banner-content">
              <h3 className="expect-payout-banner-title">Minimum withdrawal is $500.00</h3>
              <p className="expect-payout-banner-desc">
                Once your balance reaches $500.00, you can request a payout at any time. There are no
                fees for PayPal or gift card withdrawals. Bank transfers may incur a small
                processing fee depending on your region.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="expect-journey">
        <div className="expect-journey-inner">
          <div className="expect-journey-left">
            <h2 className="expect-journey-title">From sign-up to first payout</h2>
            <p className="expect-journey-subtitle">
              Here&apos;s a realistic timeline of what to expect in your first week on SurveyVault.
            </p>
            <div className="expect-journey-timeline">
              {journeySteps.map((step) => {
                const Icon = step.icon
                return (
                  <div key={step.label} className="expect-journey-step">
                    <div
                      className="expect-journey-step-icon"
                      style={{ background: step.color }}
                    >
                      <Icon aria-hidden />
                    </div>
                    <div className="expect-journey-step-connector" aria-hidden />
                    <div className="expect-journey-step-content">
                      <div className="expect-journey-step-header">
                        <span className="expect-journey-step-label">{step.label}</span>
                        <span className="expect-journey-step-badge">{step.badge}</span>
                      </div>
                      <h3 className="expect-journey-step-title">{step.title}</h3>
                      <p className="expect-journey-step-desc">{step.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="expect-journey-right">
            <h2 className="expect-journey-faq-title">Frequently asked questions</h2>
            <p className="expect-journey-faq-subtitle">
              Everything you need to know before getting started.
            </p>
            <div className="expect-journey-faq-list">
              {journeyFaqItems.map((item, i) => {
                const isExpanded = expandedFaqIndex === i
                return (
                  <div
                    key={i}
                    className={`expect-journey-faq-item ${isExpanded ? 'expect-journey-faq-item-expanded' : ''}`}
                  >
                    <button
                      type="button"
                      className="expect-journey-faq-question"
                      onClick={() => setExpandedFaqIndex(isExpanded ? null : i)}
                      aria-expanded={isExpanded}
                      aria-controls={`expect-journey-faq-answer-${i}`}
                      id={`expect-journey-faq-question-${i}`}
                    >
                      <span>{item.question}</span>
                      <span className="expect-journey-faq-icon" aria-hidden>
                        {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                      </span>
                    </button>
                    <div
                      id={`expect-journey-faq-answer-${i}`}
                      role="region"
                      aria-labelledby={`expect-journey-faq-question-${i}`}
                      className="expect-journey-faq-answer"
                      hidden={!isExpanded}
                    >
                      {item.answer}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <LandingCta />

      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="landing-footer-brand">
            <Link to="/" className="landing-footer-logo">
              <span className="landing-footer-logo-icon">S</span>
              <span className="landing-footer-logo-text">SurveyVault</span>
            </Link>
            <p className="landing-footer-tagline">
              The most trusted survey platform for earning real rewards. Your opinion shapes the
              future.
            </p>
            <p className="landing-footer-copyright">© 2024 SurveyVault. All rights reserved.</p>
          </div>
          <nav className="landing-footer-nav" aria-label="Platform links">
            <h3 className="landing-footer-heading">Platform</h3>
            <ul className="landing-footer-links">
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/open-projects">Open Surveys</Link>
              </li>
              <li>
                <Link to="/what-to-expect">What to Expect</Link>
              </li>
            </ul>
          </nav>
          <nav className="landing-footer-nav" aria-label="Account links">
            <h3 className="landing-footer-heading">Account</h3>
            <ul className="landing-footer-links">
              <li>
                <Link to="/sign-in">Login</Link>
              </li>
              <li>
                <Link to="/register">Register</Link>
              </li>
            </ul>
          </nav>
        </div>
        <div className="landing-footer-legal">
          <Link to="/privacy">Privacy Policy</Link>
          <span className="landing-footer-legal-sep">·</span>
          <Link to="/terms">Terms of Service</Link>
          <span className="landing-footer-legal-sep">·</span>
          <Link to="/cookies">Cookie Policy</Link>
        </div>
      </footer>
    </PublicPageLayout>
  )
}
