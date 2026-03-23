import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiBell, FiClock } from 'react-icons/fi'
import { HiOutlineMenu, HiOutlineSearch } from 'react-icons/hi'
import { IoCheckmarkCircleOutline, IoFlashOutline } from 'react-icons/io5'
import { AppSidebarLayout, useSidebar } from '../../shared/ui/AppSidebarLayout'

function SurveysMobileHeader() {
  const { openMobileSidebar } = useSidebar()
  return (
    <header className="dashboard-mobile-header">
      <button
        type="button"
        className="dashboard-mobile-menu-btn"
        onClick={openMobileSidebar}
        aria-label="Open dashboard menu"
      >
        <HiOutlineMenu />
      </button>
      <span>Surveys</span>
    </header>
  )
}
import { useAuth } from '../auth/AuthContext'
import { fetchActivePaymentCategories } from '../../domain/paymentCategory'
import type { MembershipTier } from '../../domain/paymentCategory'
import {
  fetchActiveSurveys,
  fetchCompletedSurveyIdsForUser,
  fetchMemberMaxTierSort,
  fetchMemberSurveyCompletionsCountLast24h,
  formatCents,
  isSurveyEligibleForMember,
} from '../../domain/surveyApi'
import { DAILY_SURVEY_COMPLETION_LIMIT } from '../../domain/surveyLimits'
import { SURVEY_CATEGORIES, type SurveyCategory, type SurveyRow } from '../../domain/surveyTypes'
import { getSurveyCategoryStyle } from './surveyCategoryMeta'

const SURVEYS_PAGE_SIZE = 9

type TabId = 'available' | 'completed'
type CategoryFilter = 'all' | SurveyCategory
type EligibilityFilter = 'all' | 'eligible' | 'ineligible'
type SortKey = 'recommended' | 'reward_desc' | 'reward_asc' | 'time_asc' | 'time_desc' | 'title_asc'

const SORT_LABELS: Record<SortKey, string> = {
  recommended: 'Recommended',
  reward_desc: 'Reward (high to low)',
  reward_asc: 'Reward (low to high)',
  time_asc: 'Time (shortest first)',
  time_desc: 'Time (longest first)',
  title_asc: 'Title (A–Z)',
}

function sortSurveys(list: SurveyRow[], sortBy: SortKey): SurveyRow[] {
  const sorted = [...list]
  switch (sortBy) {
    case 'recommended':
      sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      break
    case 'reward_desc':
      sorted.sort((a, b) => b.reward_cents - a.reward_cents)
      break
    case 'reward_asc':
      sorted.sort((a, b) => a.reward_cents - b.reward_cents)
      break
    case 'time_asc':
      sorted.sort((a, b) => a.estimated_minutes - b.estimated_minutes)
      break
    case 'time_desc':
      sorted.sort((a, b) => b.estimated_minutes - a.estimated_minutes)
      break
    case 'title_asc':
      sorted.sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }))
      break
    default:
      break
  }
  return sorted
}

export function SurveysPage() {
  const { user } = useAuth()
  const [surveys, setSurveys] = useState<SurveyRow[]>([])
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [tab, setTab] = useState<TabId>('available')
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')
  const [eligibilityFilter, setEligibilityFilter] = useState<EligibilityFilter>('all')
  const [sortBy, setSortBy] = useState<SortKey>('recommended')
  const [page, setPage] = useState(1)
  const [memberSort, setMemberSort] = useState(-1)
  const [paymentTiers, setPaymentTiers] = useState<MembershipTier[]>([])
  /** Completions in rolling 24h (matches DB daily limit). */
  const [completionsLast24h, setCompletionsLast24h] = useState(0)

  const requiredTierSortById = useMemo(() => {
    const m = new Map<string, number>()
    for (const t of paymentTiers) m.set(t.id, t.sortOrder)
    return m
  }, [paymentTiers])

  const tierNameById = useMemo(() => {
    const m = new Map<string, string>()
    for (const t of paymentTiers) m.set(t.id, t.name)
    return m
  }, [paymentTiers])

  const isEligible = useCallback(
    (s: SurveyRow) => isSurveyEligibleForMember(memberSort, s, requiredTierSortById),
    [memberSort, requiredTierSortById],
  )

  const load = useCallback(async () => {
    if (!user?.id) return
    setError('')
    setLoading(true)
    try {
      const [list, done, ms, tiers, n24] = await Promise.all([
        fetchActiveSurveys(),
        fetchCompletedSurveyIdsForUser(user.id),
        fetchMemberMaxTierSort(user.id),
        fetchActivePaymentCategories(),
        fetchMemberSurveyCompletionsCountLast24h(user.id),
      ])
      setSurveys(list)
      setCompletedIds(done)
      setMemberSort(ms)
      setPaymentTiers(tiers)
      setCompletionsLast24h(n24)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load surveys.')
      setSurveys([])
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    setPage(1)
  }, [tab, searchQuery, categoryFilter, sortBy, eligibilityFilter])

  const availableCount = useMemo(
    () => surveys.filter((s) => !completedIds.has(s.id)).length,
    [surveys, completedIds],
  )
  const completedCount = useMemo(
    () => surveys.filter((s) => completedIds.has(s.id)).length,
    [surveys, completedIds],
  )

  const filteredSurveys = useMemo(() => {
    let list = surveys.filter((s) =>
      tab === 'available' ? !completedIds.has(s.id) : completedIds.has(s.id),
    )
    const q = searchQuery.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) || (s.description ?? '').toLowerCase().includes(q),
      )
    }
    if (categoryFilter !== 'all') {
      list = list.filter((s) => s.survey_category === categoryFilter)
    }
    return sortSurveys(list, sortBy)
  }, [surveys, completedIds, tab, searchQuery, categoryFilter, sortBy])

  const featuredSurveyId = useMemo(() => {
    if (tab !== 'available') return null
    if (searchQuery.trim() || categoryFilter !== 'all' || eligibilityFilter !== 'all') return null
    if (sortBy !== 'recommended') return null
    const firstEligible = filteredSurveys.find((s) => isEligible(s))
    return firstEligible?.id ?? null
  }, [tab, searchQuery, categoryFilter, eligibilityFilter, sortBy, filteredSurveys, isEligible])

  const totalPages = Math.max(1, Math.ceil(filteredSurveys.length / SURVEYS_PAGE_SIZE))
  const safePage = Math.min(Math.max(1, page), totalPages)

  useEffect(() => {
    if (page !== safePage) setPage(safePage)
  }, [page, safePage])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [page])

  const paginatedSurveys = useMemo(() => {
    const start = (safePage - 1) * SURVEYS_PAGE_SIZE
    return filteredSurveys.slice(start, start + SURVEYS_PAGE_SIZE)
  }, [filteredSurveys, safePage])

  const rangeStart = filteredSurveys.length === 0 ? 0 : (safePage - 1) * SURVEYS_PAGE_SIZE + 1
  const rangeEnd = Math.min(safePage * SURVEYS_PAGE_SIZE, filteredSurveys.length)

  const hasActiveFilters =
    categoryFilter !== 'all' || searchQuery.trim().length > 0 || eligibilityFilter !== 'all'

  const atDailyLimit = completionsLast24h >= DAILY_SURVEY_COMPLETION_LIMIT

  const clearAllFilters = () => {
    setSearchQuery('')
    setCategoryFilter('all')
    setEligibilityFilter('all')
    setPage(1)
  }

  return (
    <AppSidebarLayout>
      <SurveysMobileHeader />

      <section className="page surveys-page">
        <div className="surveys-page-inner">
          <div className="surveys-page-toolbar">
            <div className="surveys-page-toolbar-top">
              <h1 className="surveys-page-title">Surveys</h1>
              <div className="surveys-page-toolbar-meta">
                <div className="surveys-status-pill">
                  <span className="surveys-status-dot" aria-hidden />
                  <span>
                    {availableCount} New {availableCount === 1 ? 'Survey' : 'Surveys'} Available
                  </span>
                </div>
                <button type="button" className="surveys-bell-btn" aria-label="Notifications (demo)">
                  <FiBell />
                  <span className="surveys-bell-badge" aria-hidden />
                </button>
              </div>
            </div>
          </div>

          <div className="surveys-page-panel">
            <div className="surveys-page-toolbar-row">
              <div className="surveys-tabs" role="tablist" aria-label="Survey tabs">
                <button
                  type="button"
                  role="tab"
                  aria-selected={tab === 'available'}
                  className={`surveys-tab ${tab === 'available' ? 'is-active' : ''}`}
                  onClick={() => setTab('available')}
                >
                  <IoFlashOutline className="surveys-tab-icon" aria-hidden />
                  <span>Available</span>
                  <span className="surveys-tab-count">{availableCount}</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={tab === 'completed'}
                  className={`surveys-tab ${tab === 'completed' ? 'is-active' : ''}`}
                  onClick={() => setTab('completed')}
                >
                  <IoCheckmarkCircleOutline className="surveys-tab-icon" aria-hidden />
                  <span>Completed</span>
                  <span className="surveys-tab-count">{completedCount}</span>
                </button>
              </div>

              <div className="surveys-filters-row">
                <label className="surveys-search-wrap">
                  <span className="sr-only">Search surveys</span>
                  <HiOutlineSearch className="surveys-search-icon" aria-hidden />
                  <input
                    type="search"
                    className="surveys-search-input"
                    placeholder="Search surveys..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoComplete="off"
                  />
                </label>
                <div className="surveys-select-wrap">
                  <label htmlFor="category-filter" className="sr-only">
                    Category
                  </label>
                  <select
                    id="category-filter"
                    className="surveys-select"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value as CategoryFilter)}
                  >
                    <option value="all">All Categories</option>
                    {SURVEY_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {getSurveyCategoryStyle(c).shortLabel}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="surveys-select-wrap">
                  <label htmlFor="eligibility-filter" className="sr-only">
                    Eligibility
                  </label>
                  <select
                    id="eligibility-filter"
                    className="surveys-select"
                    value={eligibilityFilter}
                    onChange={(e) => setEligibilityFilter(e.target.value as EligibilityFilter)}
                  >
                    <option value="all">All surveys</option>
                    <option value="eligible">Eligible for me</option>
                    <option value="ineligible">Ineligible (tier)</option>
                  </select>
                </div>
                <div className="surveys-select-wrap">
                  <label htmlFor="sort-surveys" className="sr-only">
                    Sort
                  </label>
                  <select
                    id="sort-surveys"
                    className="surveys-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortKey)}
                  >
                    {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
                      <option key={k} value={k}>
                        {SORT_LABELS[k]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {hasActiveFilters ? (
              <div className="surveys-active-filters">
                <span className="surveys-active-filters-label">Active Filters:</span>
                {categoryFilter !== 'all' ? (
                  <button
                    type="button"
                    className="surveys-filter-chip"
                    onClick={() => setCategoryFilter('all')}
                  >
                    {getSurveyCategoryStyle(categoryFilter).shortLabel}
                    <span aria-hidden> ×</span>
                  </button>
                ) : null}
                {searchQuery.trim() ? (
                  <button
                    type="button"
                    className="surveys-filter-chip"
                    onClick={() => setSearchQuery('')}
                  >
                    “{searchQuery.trim().slice(0, 24)}
                    {searchQuery.trim().length > 24 ? '…' : ''}”
                    <span aria-hidden> ×</span>
                  </button>
                ) : null}
                {eligibilityFilter !== 'all' ? (
                  <button
                    type="button"
                    className="surveys-filter-chip"
                    onClick={() => setEligibilityFilter('all')}
                  >
                    {eligibilityFilter === 'eligible' ? 'Eligible only' : 'Ineligible only'}
                    <span aria-hidden> ×</span>
                  </button>
                ) : null}
                <button type="button" className="surveys-clear-filters" onClick={clearAllFilters}>
                  Clear All
                </button>
              </div>
            ) : null}
          </div>

          {!loading && !error ? (
            <div
              className={`surveys-daily-limit-banner ${atDailyLimit ? 'surveys-daily-limit-banner--at-limit' : ''}`}
              role="status"
            >
              <span className="surveys-daily-limit-banner-label">24-hour survey limit</span>
              <span className="surveys-daily-limit-banner-value">
                {completionsLast24h} / {DAILY_SURVEY_COMPLETION_LIMIT} completed
              </span>
              {atDailyLimit ? (
                <span className="surveys-daily-limit-banner-hint">
                  You&apos;ve reached today&apos;s cap — try again after older completions age out (rolling 24 hours).
                </span>
              ) : (
                <span className="surveys-daily-limit-banner-hint">
                  Resets on a rolling window (each completion expires from the count after 24 hours).
                </span>
              )}
            </div>
          ) : null}

          {loading ? (
            <p className="survey-page-panel-muted">Loading surveys…</p>
          ) : error ? (
            <div className="surveys-page-error">
              <p className="field-error">{error}</p>
              <p className="survey-page-panel-muted" style={{ marginTop: 8 }}>
                If you just deployed, run the latest Supabase migration so the <code>surveys</code> tables exist.
              </p>
              <button type="button" className="button secondary" onClick={() => void load()}>
                Retry
              </button>
            </div>
          ) : surveys.length === 0 ? (
            <p className="survey-page-panel-muted">No surveys are published yet. Check back soon.</p>
          ) : filteredSurveys.length === 0 ? (
            <p className="survey-page-panel-muted">
              No surveys match your filters. Try{' '}
              <button type="button" className="surveys-inline-link" onClick={clearAllFilters}>
                clearing filters
              </button>{' '}
              or switching tabs.
            </p>
          ) : (
            <>
              <ul className="surveys-card-grid">
                {paginatedSurveys.map((survey) => {
                  const done = completedIds.has(survey.id)
                  const eligible = isEligible(survey)
                  const catStyle = getSurveyCategoryStyle(survey.survey_category)
                  const isFeatured = survey.id === featuredSurveyId && tab === 'available'
                  const showIneligible = !done && tab === 'available' && !eligible
                  const showDailyLimit = !done && tab === 'available' && eligible && atDailyLimit
                  return (
                    <li
                      className={`surveys-card ${isFeatured ? 'surveys-card--featured' : ''} ${done ? 'surveys-card--done' : ''} ${showIneligible ? 'surveys-card--ineligible' : ''} ${showDailyLimit ? 'surveys-card--daily-limit' : ''}`}
                      key={survey.id}
                    >
                      {isFeatured ? (
                        <span className="surveys-card-ribbon" aria-hidden>
                          FEATURED
                        </span>
                      ) : null}
                      <div className="surveys-card-head">
                        <div className="surveys-card-icon" style={{ background: catStyle.iconBg }}>
                          {catStyle.icon}
                        </div>
                        <span className="surveys-card-badge">{catStyle.shortLabel}</span>
                      </div>
                      <h3 className="surveys-card-title">{survey.title}</h3>
                      {showIneligible ? (
                        <p className="surveys-card-ineligible-hint">
                          Requires {tierNameById.get(survey.payment_category_id ?? '') ?? 'higher'} plan — upgrade to
                          participate.
                        </p>
                      ) : null}
                      {survey.description ? (
                        <p className="surveys-card-desc">{survey.description}</p>
                      ) : null}
                      <div className="surveys-card-footer">
                        <div className="surveys-card-meta">
                          <div>
                            <span className="surveys-card-meta-label">Reward</span>
                            <span className="surveys-card-meta-value">{formatCents(survey.reward_cents)}</span>
                          </div>
                          <div className="surveys-card-time">
                            <FiClock className="surveys-card-time-icon" aria-hidden />
                            <span>~{survey.estimated_minutes} min</span>
                          </div>
                        </div>
                        {done || tab === 'completed' ? (
                          <span className="surveys-card-completed-pill">Completed</span>
                        ) : !eligible ? (
                          <Link
                            className="surveys-card-cta surveys-card-cta--upgrade"
                            to="/dashboard/workforce/upgrade"
                          >
                            Upgrade to unlock
                          </Link>
                        ) : showDailyLimit ? (
                          <span className="surveys-card-daily-limit-pill" title={DAILY_SURVEY_COMPLETION_LIMIT + ' surveys per 24 hours'}>
                            Daily limit reached
                          </span>
                        ) : (
                          <Link
                            className={`surveys-card-cta ${isFeatured ? 'surveys-card-cta--primary' : ''}`}
                            to={`/dashboard/surveys/${survey.id}/take`}
                          >
                            Start Survey
                          </Link>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>

              {totalPages > 1 ? (
                <nav className="surveys-pagination" aria-label="Survey pages">
                  <p className="surveys-pagination-summary">
                    Showing {rangeStart}–{rangeEnd} of {filteredSurveys.length}
                  </p>
                  <div className="surveys-pagination-actions">
                    <button
                      type="button"
                      className="button secondary surveys-pagination-btn"
                      disabled={safePage <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      Previous
                    </button>
                    <span className="surveys-pagination-page">
                      Page {safePage} of {totalPages}
                    </span>
                    <button
                      type="button"
                      className="button secondary surveys-pagination-btn"
                      disabled={safePage >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    >
                      Next
                    </button>
                  </div>
                </nav>
              ) : null}
            </>
          )}
        </div>
      </section>
    </AppSidebarLayout>
  )
}
