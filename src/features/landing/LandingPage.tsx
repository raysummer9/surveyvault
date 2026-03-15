import { useEffect, useState } from 'react'
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

const stats = [
  { value: '50K+', label: 'Active Members' },
  { value: '$2.4M', label: 'Total Paid Out' },
  { value: '1,200+', label: 'Surveys Monthly' },
  { value: '4.9★', label: 'Average Rating' },
] as const

const testimonials = [
  {
    quote:
      "I've been using SurveyVault for 6 months and have earned over $800. The surveys are relevant and the payouts are fast. Highly recommend to anyone looking for extra income.",
    name: 'Sarah Mitchell',
    tier: 'Gold Member',
    earned: '$847 earned',
    initials: 'SM',
  },
  {
    quote:
      "The platform is incredibly easy to use. I complete surveys during my lunch break and have already withdrawn $200 this month. The referral program is a great bonus too!",
    name: 'James Kowalski',
    tier: 'Platinum Member',
    earned: '$1,240 earned',
    initials: 'JK',
  },
  {
    quote:
      "As a market research professional, I appreciate the quality of surveys here. The topics are diverse and interesting. I've earned enough to cover my monthly subscriptions easily.",
    name: 'Priya Rajan',
    tier: 'Silver Member',
    earned: '$412 earned',
    initials: 'PR',
  },
  {
    quote:
      "Best survey site I've tried. No spam, no gimmicks—just straightforward surveys and real payouts. I've made $300 in my first two months.",
    name: 'Marcus Chen',
    tier: 'Silver Member',
    earned: '$312 earned',
    initials: 'MC',
  },
  {
    quote:
      "The mobile app makes it so convenient. I earn during my commute. Already hit my first $100 withdrawal and the process was seamless.",
    name: 'Emily Torres',
    tier: 'Gold Member',
    earned: '$589 earned',
    initials: 'ET',
  },
  {
    quote:
      "SurveyVault's tier system motivated me to stay consistent. Now I'm Platinum and the higher-paying surveys are worth the effort.",
    name: 'David Okonkwo',
    tier: 'Platinum Member',
    earned: '$1,890 earned',
    initials: 'DO',
  },
  {
    quote:
      "As a stay-at-home parent, this has been a game-changer. Flexible hours and legitimate earnings. So grateful I found this platform.",
    name: 'Rachel Foster',
    tier: 'Gold Member',
    earned: '$720 earned',
    initials: 'RF',
  },
  {
    quote:
      "I was skeptical at first, but the reviews were right. Fast payouts, great variety of surveys, and the support team actually responds.",
    name: 'Alex Kim',
    tier: 'Silver Member',
    earned: '$245 earned',
    initials: 'AK',
  },
  {
    quote:
      "Referred three friends and we're all earning. The 10% bonus adds up. SurveyVault has become my go-to side hustle.",
    name: 'Jordan Williams',
    tier: 'Platinum Member',
    earned: '$2,100 earned',
    initials: 'JW',
  },
] as const

const TESTIMONIALS_PER_VIEW_DESKTOP = 3
const MOBILE_BREAKPOINT = 768

export function LandingPage() {
  const [firstVisibleIndex, setFirstVisibleIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`)
    const handler = () => setIsMobile(mq.matches)
    handler()
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    const step = isMobile ? 1 : TESTIMONIALS_PER_VIEW_DESKTOP
    const maxIndex = isMobile ? testimonials.length - 1 : testimonials.length - TESTIMONIALS_PER_VIEW_DESKTOP
    const id = setInterval(() => {
      setFirstVisibleIndex((prev) => (prev >= maxIndex ? 0 : prev + step))
    }, 5000)
    return () => clearInterval(id)
  }, [isMobile])

  const dotCount = isMobile ? testimonials.length : Math.ceil(testimonials.length / TESTIMONIALS_PER_VIEW_DESKTOP)
  const activeDotIndex = isMobile ? firstVisibleIndex : Math.floor(firstVisibleIndex / TESTIMONIALS_PER_VIEW_DESKTOP)
  const goToSlide = (dotIndex: number) => {
    setFirstVisibleIndex(isMobile ? dotIndex : dotIndex * TESTIMONIALS_PER_VIEW_DESKTOP)
  }

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

      <section className="landing-stats">
        <div className="landing-stats-inner">
          {stats.map((stat) => (
            <div key={stat.label} className="landing-stat">
              <span className="landing-stat-value">{stat.value}</span>
              <span className="landing-stat-label">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-testimonials">
        <span className="landing-testimonials-badge">Testimonials</span>
        <h2 className="landing-testimonials-title">What our experts say</h2>
        <p className="landing-testimonials-subtitle">
          Real stories from real members who are earning with SurveyVault.
        </p>
        <div className="landing-testimonials-slider">
          <div
            className="landing-testimonials-track"
            style={{
              transform: `translateX(-${firstVisibleIndex * (100 / testimonials.length)}%)`,
            }}
          >
            {testimonials.map((t) => (
              <div key={t.name} className="landing-testimonial-slide">
                <div className="landing-testimonial-card">
                  <div className="landing-testimonial-stars" aria-hidden>
                    ★★★★★
                  </div>
                  <blockquote className="landing-testimonial-quote">{t.quote}</blockquote>
                  <div className="landing-testimonial-author">
                    <div className="landing-testimonial-avatar">{t.initials}</div>
                    <div className="landing-testimonial-info">
                      <span className="landing-testimonial-name">{t.name}</span>
                      <span className="landing-testimonial-meta">
                        {t.tier} · {t.earned}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="landing-testimonials-dots" role="tablist" aria-label="Testimonial slide navigation">
          {Array.from({ length: dotCount }).map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === activeDotIndex}
              aria-label={`View slide ${i + 1}`}
              className={`landing-testimonial-dot ${i === activeDotIndex ? 'landing-testimonial-dot-active' : ''}`}
              onClick={() => goToSlide(i)}
            />
          ))}
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
