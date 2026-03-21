import { useState } from 'react'
import {
  FiArrowDown,
  FiArrowRight,
  FiClock,
  FiFilter,
  FiGlobe,
  FiMapPin,
  FiSearch,
} from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { PublicPageLayout } from '../../shared/ui/PublicPageLayout'

const CATEGORIES = [
  'All Surveys',
  'Technology',
  'Lifestyle',
  'Finance',
  'Health',
  'Food & Beverage',
  'Travel',
  'Education',
  'Environment',
  'Media',
  'Automotive',
] as const

const featuredSurvey = {
  title: 'Consumer Spending Habits 2024',
  description:
    'Comprehensive financial behavior study by leading research firm. 25 min · English · Global',
  reward: '$12.00',
  badges: ['High Reward', 'Limited Spots'],
} as const

const openSurveys = [
  {
    title: 'Tech Usage Habits 2024',
    description: 'Share your experience with technology and smart devices in daily life.',
    reward: '$3.50',
    duration: '15 min',
    language: 'English',
    region: 'Global',
    category: 'Technology',
    badges: [] as string[],
    spotsLeft: null as number | null,
    taken: 1243,
  },
  {
    title: 'Wellness & Mental Health Trends',
    description: 'Share insights on wellness routines and mental health awareness.',
    reward: '$2.00',
    duration: '10 min',
    language: 'EN/FR',
    region: 'US/UK',
    category: 'Lifestyle',
    badges: ['New'],
    spotsLeft: null,
    taken: 892,
  },
  {
    title: 'Investment Behavior Study',
    description: 'Financial decision-making and investment preferences research.',
    reward: '$8.50',
    duration: '30 min',
    language: 'English',
    region: 'US/CA/AU',
    category: 'Finance',
    badges: ['High Pay'],
    spotsLeft: 48,
    taken: null,
  },
  {
    title: 'Health & Wellness 2024',
    description: 'Share insights on your health routines, fitness habits, and wellness goals.',
    reward: '$4.00',
    duration: '20 min',
    language: 'English',
    region: 'US/UK/AU',
    category: 'Health',
    badges: ['Featured'],
    spotsLeft: null,
    taken: 2104,
  },
  {
    title: 'Environmental Attitudes',
    description: 'Your views on sustainability, climate change, and eco-friendly products.',
    reward: '$2.75',
    duration: '10 min',
    language: 'English',
    region: 'Global',
    category: 'Environment',
    badges: [],
    spotsLeft: null,
    taken: 567,
  },
  {
    title: 'Media Consumption',
    description: 'How you consume news, entertainment, and social media content daily.',
    reward: '$1.80',
    duration: '8 min',
    language: 'English',
    region: 'Global',
    category: 'Media',
    badges: [],
    spotsLeft: null,
    taken: 1102,
  },
  {
    title: 'Financial Services Survey',
    description: 'Share your banking habits, investment preferences, and financial goals.',
    reward: '$5.00',
    duration: '25 min',
    language: 'English',
    region: 'Global',
    category: 'Finance',
    badges: [],
    spotsLeft: null,
    taken: 445,
  },
  {
    title: 'Travel & Hospitality',
    description: 'Your travel preferences, booking habits, and destination choices.',
    reward: '$3.25',
    duration: '12 min',
    language: 'English',
    region: 'Global',
    category: 'Travel',
    badges: [],
    spotsLeft: null,
    taken: 789,
  },
  {
    title: 'Food & Dining Habits',
    description: 'Eating preferences, restaurant choices, and dietary habits.',
    reward: '$2.00',
    duration: '8 min',
    language: 'English',
    region: 'Global',
    category: 'Food & Beverage',
    badges: [],
    spotsLeft: null,
    taken: 934,
  },
] as const

const TOTAL_SURVEYS = 68
const SURVEYS_PER_PAGE = 9

export function OpenProjectsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All Surveys')
  const [visibleCount, setVisibleCount] = useState(SURVEYS_PER_PAGE)

  const filteredSurveys = openSurveys.filter((s) => {
    const matchesSearch =
      !searchQuery ||
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory =
      activeCategory === 'All Surveys' || s.category === activeCategory
    return matchesSearch && matchesCategory
  })

  const displayedSurveys = filteredSurveys.slice(0, visibleCount)
  const hasMore = visibleCount < filteredSurveys.length

  return (
    <PublicPageLayout className="open-projects-page">
      <section className="open-projects-hero">
        <div className="open-projects-hero-inner">
          <div className="open-projects-hero-top">
            <div className="open-projects-hero-left">
              <div className="open-projects-live">
                <span className="open-projects-live-dot" aria-hidden />
                Live
              </div>
              <span className="open-projects-updated">Updated 2 min ago</span>
              <h1 className="open-projects-title">Open Surveys</h1>
              <p className="open-projects-desc">
                Browse all available surveys and start earning today.{' '}
                <strong>{TOTAL_SURVEYS} surveys</strong> currently open.
              </p>
            </div>
            <div className="open-projects-hero-controls">
              <div className="open-projects-search">
                <FiSearch aria-hidden />
                <input
                  type="search"
                  placeholder="Search surveys..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search surveys"
                />
              </div>
              <button type="button" className="open-projects-filter-btn">
                <FiFilter aria-hidden />
                Sort & Filter
              </button>
            </div>
          </div>
          <div className="open-projects-categories">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`open-projects-chip ${activeCategory === cat ? 'open-projects-chip-active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="open-projects-content">
        <div className="open-projects-featured">
          <div className="open-projects-featured-badges">
            <span className="open-projects-featured-badge open-projects-featured-badge-yellow">
              High Reward
            </span>
            <span className="open-projects-featured-badge open-projects-featured-badge-blue">
              Limited Spots
            </span>
          </div>
          <h2 className="open-projects-featured-title">{featuredSurvey.title}</h2>
          <p className="open-projects-featured-desc">{featuredSurvey.description}</p>
          <div className="open-projects-featured-footer">
            <span className="open-projects-featured-reward">
              {featuredSurvey.reward} Reward
            </span>
            <Link to="/register" className="open-projects-featured-cta">
              Apply Now <FiArrowRight />
            </Link>
          </div>
        </div>

        <div className="open-projects-grid">
          {displayedSurveys.map((survey) => (
            <div key={survey.title} className="open-projects-card">
              <div className="open-projects-card-header">
                <span
                  className="open-projects-card-category"
                  style={{
                    background:
                      survey.category === 'Technology'
                        ? 'rgba(59, 130, 246, 0.2)'
                        : survey.category === 'Finance'
                          ? 'rgba(34, 197, 94, 0.2)'
                          : survey.category === 'Health'
                            ? 'rgba(234, 88, 12, 0.2)'
                            : 'rgba(148, 163, 184, 0.2)',
                    color: '#94a3b8',
                  }}
                >
                  {survey.category}
                </span>
                {survey.badges.length > 0 && (
                  <div className="open-projects-card-badges">
                    {survey.badges.map((b) => (
                      <span key={b} className="open-projects-card-badge">
                        {b}
                      </span>
                    ))}
                  </div>
                )}
                <span className="open-projects-card-reward">{survey.reward}</span>
              </div>
              <h3 className="open-projects-card-title">{survey.title}</h3>
              <p className="open-projects-card-desc">{survey.description}</p>
              <div className="open-projects-card-meta">
                <span>
                  <FiClock aria-hidden /> {survey.duration}
                </span>
                <span>
                  <FiGlobe aria-hidden /> {survey.language}
                </span>
                <span>
                  <FiMapPin aria-hidden /> {survey.region}
                </span>
              </div>
              <div className="open-projects-card-footer">
                <span className="open-projects-card-social">
                  {survey.spotsLeft != null
                    ? `Only ${survey.spotsLeft} spots left`
                    : `${(survey.taken ?? 0).toLocaleString()} taken`}
                </span>
                <Link to="/register" className="open-projects-card-apply">
                  Apply <FiArrowRight />
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="open-projects-pagination">
          <p className="open-projects-pagination-text">
            Showing {displayedSurveys.length} of {filteredSurveys.length} surveys
          </p>
          {hasMore && (
            <button
              type="button"
              className="open-projects-load-more"
              onClick={() => setVisibleCount((n) => n + SURVEYS_PER_PAGE)}
            >
              Load More Surveys <FiArrowDown />
            </button>
          )}
        </div>

        <div className="open-projects-cta-banner">
          <p className="open-projects-cta-banner-text">
            Ready to start earning? Create a free account to apply. A small one-time fee is required
            to join the workforce and start earning real rewards.
          </p>
          <div className="open-projects-cta-banner-actions">
            <Link to="/sign-in" className="open-projects-cta-banner-login">
              Login
            </Link>
            <Link to="/register" className="open-projects-cta-banner-join">
              Join Free <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="landing-footer-brand">
            <Link to="/" className="landing-footer-logo">
              <span className="landing-footer-logo-icon">S</span>
              <span className="landing-footer-logo-text">Taskpulse</span>
            </Link>
            <p className="landing-footer-tagline">
              The most trusted survey platform for earning real rewards. Your opinion shapes the
              future.
            </p>
            <p className="landing-footer-copyright">© 2024 Taskpulse. All rights reserved.</p>
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
