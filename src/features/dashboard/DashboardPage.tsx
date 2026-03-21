import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FiBarChart2, FiClock, FiDollarSign, FiTrendingUp } from 'react-icons/fi'
import { HiOutlineMenu } from 'react-icons/hi'
import { IoWalletOutline } from 'react-icons/io5'
import { fetchMemberVerifiedMembershipTier, type MembershipTier } from '../../domain/paymentCategory'
import { AppSidebarLayout, useSidebar } from '../../shared/ui/AppSidebarLayout'
import { MembershipTierBadge } from '../../shared/ui/MembershipTierBadge'
import { useAuth } from '../auth/AuthContext'
import {
  fetchActiveSurveys,
  fetchCompletedSurveyIdsForUser,
  fetchMemberSurveyEarningsSince,
  fetchMemberSurveyStats,
  formatCents,
} from '../../domain/surveyApi'
import type { SurveyRow } from '../../domain/surveyTypes'
import {
  fetchPendingWithdrawalRequestsTotalCents,
  fetchWithdrawableBalanceCents,
  MIN_WITHDRAWAL_CENTS,
} from '../../domain/withdrawalApi'
import { getSurveyCategoryStyle } from '../surveys/surveyCategoryMeta'

export function DashboardPage() {
  const { user, profile } = useAuth()
  const { openMobileSidebar } = useSidebar()
  const location = useLocation()
  const justCompletedSurvey = Boolean(
    (location.state as { surveyCompleted?: boolean } | null)?.surveyCompleted,
  )

  const [stats, setStats] = useState({ completedCount: 0, pendingCents: 0, paidCents: 0 })
  const [withdrawableCents, setWithdrawableCents] = useState(0)
  /** Sum of withdrawal requests with status `pending` (awaiting admin), not survey reward accrual. */
  const [pendingWithdrawalCents, setPendingWithdrawalCents] = useState(0)
  const [membershipTier, setMembershipTier] = useState<MembershipTier | null>(null)
  const [thisWeekCents, setThisWeekCents] = useState(0)
  const [lastWeekCents, setLastWeekCents] = useState(0)
  const [surveys, setSurveys] = useState<SurveyRow[]>([])
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    if (!user?.id) return
    setError('')
    setLoading(true)
    const now = Date.now()
    const since7 = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString()
    const since14 = new Date(now - 14 * 24 * 60 * 60 * 1000).toISOString()
    try {
      const [s, w, pendingW, tier, earned7, earned14, list, done] = await Promise.all([
        fetchMemberSurveyStats(user.id),
        fetchWithdrawableBalanceCents(user.id),
        fetchPendingWithdrawalRequestsTotalCents(user.id),
        fetchMemberVerifiedMembershipTier(user.id),
        fetchMemberSurveyEarningsSince(user.id, since7),
        fetchMemberSurveyEarningsSince(user.id, since14),
        fetchActiveSurveys(),
        fetchCompletedSurveyIdsForUser(user.id),
      ])
      setStats(s)
      setWithdrawableCents(w)
      setPendingWithdrawalCents(pendingW)
      setMembershipTier(tier)
      setThisWeekCents(earned7)
      setLastWeekCents(Math.max(0, earned14 - earned7))
      setSurveys(list)
      setCompletedIds(done)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load earnings.')
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    void load()
  }, [load])

  const totalLifetimeCents = stats.paidCents + stats.pendingCents
  const greeting = profile?.first_name?.trim()
    ? `Welcome back, ${profile.first_name.trim()}`
    : 'Welcome back'

  const weekOverWeekDiff = thisWeekCents - lastWeekCents
  const trendLabel = useMemo(() => {
    if (lastWeekCents <= 0 && thisWeekCents <= 0) return null
    if (lastWeekCents <= 0) return `+${formatCents(thisWeekCents)} this week`
    if (weekOverWeekDiff > 0) return `+${formatCents(weekOverWeekDiff)} vs last week`
    if (weekOverWeekDiff < 0) return `${formatCents(weekOverWeekDiff)} vs last week`
    return 'Same as last week'
  }, [thisWeekCents, lastWeekCents, weekOverWeekDiff])

  const avgPerSurveyCents =
    stats.completedCount > 0 ? Math.round(totalLifetimeCents / stats.completedCount) : 0

  const previewSurveys = useMemo(() => {
    const available = surveys.filter((s) => !completedIds.has(s.id))
    return available.slice(0, 3)
  }, [surveys, completedIds])

  return (
    <AppSidebarLayout>
      <header className="dashboard-mobile-header">
        <button
          type="button"
          className="profile-mobile-menu-btn"
          onClick={openMobileSidebar}
          aria-label="Open dashboard menu"
        >
          <HiOutlineMenu />
        </button>
        <span>Earnings</span>
      </header>

      <section className="page earnings-page">
        <div className="earnings-page-inner">
          <div className="earnings-page-toolbar">
            <h1 className="earnings-page-title">Earnings</h1>
            <p className="earnings-page-subtitle">
              Track survey rewards, withdrawal requests, and available balance in one place.
            </p>
          </div>

          {justCompletedSurvey ? (
            <div className="dashboard-success-banner earnings-success-banner" role="status">
              Survey submitted — your stats below are updated.
            </div>
          ) : null}

          {error ? <p className="field-error earnings-page-error">{error}</p> : null}

          {loading ? (
            <p className="panel-muted">Loading your earnings…</p>
          ) : (
            <>
              <div className="earnings-hero">
                <div className="earnings-hero-main">
                  <div className="earnings-hero-kicker">
                    <span className="earnings-hero-greeting">{greeting}</span>
                    {membershipTier ? (
                      <MembershipTierBadge tier={membershipTier} variant="inline" />
                    ) : null}
                  </div>
                  <p className="earnings-hero-lead">
                    Your survey rewards add up — keep going to grow your balance.
                  </p>
                  <div className="earnings-hero-metrics">
                    <div className="earnings-hero-metric earnings-hero-metric--primary">
                      <span className="earnings-hero-metric-label">Total earned</span>
                      <span className="earnings-hero-metric-value">{formatCents(totalLifetimeCents)}</span>
                      <span className="earnings-hero-metric-hint">Lifetime from completed surveys</span>
                    </div>
                    <div className="earnings-hero-metric">
                      <span className="earnings-hero-metric-label">Surveys done</span>
                      <span className="earnings-hero-metric-value">{stats.completedCount}</span>
                    </div>
                    <div className="earnings-hero-metric earnings-hero-metric--pending">
                      <span className="earnings-hero-metric-label">Pending payout</span>
                      <span className="earnings-hero-metric-value">{formatCents(pendingWithdrawalCents)}</span>
                      <span className="earnings-hero-metric-hint">Requested withdrawals awaiting review</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="earnings-stat-row">
                <article className="earnings-stat-card">
                  <div className="earnings-stat-card-icon earnings-stat-card-icon--earn">
                    <FiDollarSign aria-hidden />
                  </div>
                  <p className="earnings-stat-card-label">Total earned</p>
                  <p className="earnings-stat-card-value">{formatCents(totalLifetimeCents)}</p>
                  {trendLabel ? (
                    <p className="earnings-stat-card-trend earnings-stat-card-trend--up">
                      <FiTrendingUp aria-hidden />
                      {trendLabel}
                    </p>
                  ) : (
                    <p className="earnings-stat-card-muted">Complete surveys to see weekly trends</p>
                  )}
                </article>

                <article className="earnings-stat-card">
                  <div className="earnings-stat-card-icon earnings-stat-card-icon--pending">
                    <FiClock aria-hidden />
                  </div>
                  <p className="earnings-stat-card-label">Pending payout</p>
                  <p className="earnings-stat-card-value">{formatCents(pendingWithdrawalCents)}</p>
                  <p className="earnings-stat-card-muted">
                    {pendingWithdrawalCents > 0 ? 'Withdrawal request in review' : 'No pending requests'}
                  </p>
                </article>

                <article className="earnings-stat-card">
                  <div className="earnings-stat-card-icon earnings-stat-card-icon--quality">
                    <FiBarChart2 aria-hidden />
                  </div>
                  <p className="earnings-stat-card-label">Avg. per survey</p>
                  <p className="earnings-stat-card-value">{formatCents(avgPerSurveyCents)}</p>
                  <p className="earnings-stat-card-muted">
                    {stats.completedCount > 0 ? 'Lifetime average reward' : 'Complete a survey to see'}
                  </p>
                </article>
              </div>

              <div className="earnings-split">
                <div className="earnings-split-main">
                  <div className="earnings-mini-withdraw">
                    <div>
                      <p className="earnings-mini-withdraw-label">Available to withdraw</p>
                      <p className="earnings-mini-withdraw-value">{formatCents(withdrawableCents)}</p>
                      <p className="earnings-mini-withdraw-hint">
                        Cleared survey earnings (marked paid) minus pending or approved withdrawals. Minimum{' '}
                        {formatCents(MIN_WITHDRAWAL_CENTS)}.
                      </p>
                    </div>
                    <Link to="/dashboard/withdrawals" className="earnings-withdraw-cta">
                      <IoWalletOutline aria-hidden />
                      Withdraw earnings
                    </Link>
                  </div>

                  {previewSurveys.length > 0 ? (
                    <div className="earnings-survey-preview">
                      <div className="earnings-survey-preview-head">
                        <h2 className="earnings-survey-preview-title">Earn more</h2>
                        <Link to="/dashboard/surveys" className="earnings-survey-preview-link">
                          View all surveys
                        </Link>
                      </div>
                      <ul className="surveys-card-grid earnings-survey-preview-grid">
                        {previewSurveys.map((survey) => {
                          const catStyle = getSurveyCategoryStyle(survey.survey_category)
                          return (
                            <li className="surveys-card" key={survey.id}>
                              <div className="surveys-card-head">
                                <div className="surveys-card-icon" style={{ background: catStyle.iconBg }}>
                                  {catStyle.icon}
                                </div>
                                <span className="surveys-card-badge">{catStyle.shortLabel}</span>
                              </div>
                              <h3 className="surveys-card-title">{survey.title}</h3>
                              {survey.description ? (
                                <p className="surveys-card-desc">{survey.description}</p>
                              ) : null}
                              <div className="surveys-card-footer">
                                <div className="surveys-card-meta">
                                  <div>
                                    <span className="surveys-card-meta-label">Reward</span>
                                    <span className="surveys-card-meta-value">
                                      {formatCents(survey.reward_cents)}
                                    </span>
                                  </div>
                                  <div className="surveys-card-time">
                                    <FiClock className="surveys-card-time-icon" aria-hidden />
                                    <span>~{survey.estimated_minutes} min</span>
                                  </div>
                                </div>
                                <Link
                                  className="surveys-card-cta surveys-card-cta--primary"
                                  to={`/dashboard/surveys/${survey.id}/take`}
                                >
                                  Start
                                </Link>
                              </div>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  ) : (
                    <div className="earnings-empty-surveys panel-muted">
                      <p>No open surveys right now, or you&apos;ve completed what&apos;s available.</p>
                      <Link to="/dashboard/surveys" className="button secondary">
                        Browse surveys
                      </Link>
                    </div>
                  )}
                </div>

                <aside className="earnings-overview-card" aria-labelledby="earnings-overview-heading">
                  <div className="earnings-overview-head">
                    <h2 id="earnings-overview-heading" className="earnings-overview-title">
                      Earnings overview
                    </h2>
                    <span className="earnings-overview-period">This week</span>
                  </div>
                  <p className="earnings-overview-hero">{formatCents(totalLifetimeCents)}</p>
                  <p className="earnings-overview-sub">Total lifetime survey rewards</p>

                  <ul className="earnings-overview-list">
                    <li>
                      <span>This week</span>
                      <strong>{formatCents(thisWeekCents)}</strong>
                    </li>
                    <li>
                      <span>Pending payout</span>
                      <strong className="earnings-overview-pending">{formatCents(pendingWithdrawalCents)}</strong>
                    </li>
                    <li>
                      <span>Available to withdraw</span>
                      <strong className="earnings-overview-available">{formatCents(withdrawableCents)}</strong>
                    </li>
                  </ul>

                  <Link to="/dashboard/withdrawals" className="earnings-overview-withdraw-btn">
                    <IoWalletOutline aria-hidden />
                    Withdraw earnings
                  </Link>
                </aside>
              </div>
            </>
          )}
        </div>
      </section>
    </AppSidebarLayout>
  )
}
