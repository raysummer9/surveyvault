import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  adminCreateSurvey,
  adminDeleteSurvey,
  adminListSurveysPaginated,
  adminUpdateSurvey,
  formatCents,
} from '../../domain/surveyApi'
import type { AdminSurveyListRow, AdminSurveyUpsertInput } from '../../domain/surveyApi'
import { fetchAllPaymentCategoriesAdmin } from '../../domain/paymentCategory'
import type { MembershipTier } from '../../domain/paymentCategory'
import type { SurveyRow } from '../../domain/surveyTypes'
import { SURVEY_CATEGORIES, type SurveyCategory } from '../../domain/surveyTypes'
import { AdminPageSection } from '../../shared/ui/AdminPageSection'
import { AdminSurveyFormModal } from './AdminSurveyFormModal'

const PAGE_SIZE_OPTIONS = [7, 10, 25, 50, 100] as const

type ModalState =
  | null
  | { mode: 'create' }
  | { mode: 'edit'; survey: SurveyRow }

export function AdminSurveysPage() {
  const [rows, setRows] = useState<AdminSurveyListRow[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(7)

  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<SurveyCategory | 'all'>('all')
  const [isActiveFilter, setIsActiveFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'unassigned' | string>('all')
  const [paymentTiers, setPaymentTiers] = useState<MembershipTier[]>([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modal, setModal] = useState<ModalState>(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(searchInput.trim()), 350)
    return () => window.clearTimeout(t)
  }, [searchInput])

  /** Search debounce: go to page 1 when applied term changes (handlers reset page for other filters). */
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  useEffect(() => {
    let cancelled = false
    void fetchAllPaymentCategoriesAdmin()
      .then((tiers) => {
        if (!cancelled) setPaymentTiers(tiers)
      })
      .catch(() => {
        if (!cancelled) setPaymentTiers([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  const load = useCallback(async () => {
    setError('')
    setLoading(true)
    try {
      const result = await adminListSurveysPaginated({
        page,
        pageSize,
        search: debouncedSearch || undefined,
        surveyCategory: categoryFilter,
        isActive: isActiveFilter,
        paymentCategoryId: paymentFilter,
      })
      setRows(result.rows)
      setTotalCount(result.totalCount)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load surveys.')
      setRows([])
      setTotalCount(0)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, debouncedSearch, categoryFilter, isActiveFilter, paymentFilter])

  useEffect(() => {
    void load()
  }, [load])

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize) || 1)

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const hasActiveFilters = useMemo(() => {
    return (
      debouncedSearch.length > 0 ||
      categoryFilter !== 'all' ||
      isActiveFilter !== 'all' ||
      paymentFilter !== 'all'
    )
  }, [debouncedSearch, categoryFilter, isActiveFilter, paymentFilter])

  const rangeLabel = useMemo(() => {
    if (totalCount === 0) return '0 surveys'
    const start = (page - 1) * pageSize + 1
    const end = Math.min(page * pageSize, totalCount)
    return `Showing ${start}–${end} of ${totalCount}`
  }, [totalCount, page, pageSize])

  const clearFilters = () => {
    setPage(1)
    setSearchInput('')
    setDebouncedSearch('')
    setCategoryFilter('all')
    setIsActiveFilter('all')
    setPaymentFilter('all')
  }

  const handleSave = async (values: AdminSurveyUpsertInput) => {
    setSaving(true)
    setFormError(null)
    try {
      if (modal?.mode === 'create') {
        await adminCreateSurvey(values)
      } else if (modal?.mode === 'edit') {
        await adminUpdateSurvey(modal.survey.id, {
          title: values.title,
          description: values.description,
          reward_cents: values.reward_cents,
          estimated_minutes: values.estimated_minutes,
          questions: values.questions,
          is_active: values.is_active,
          payment_category_id: values.payment_category_id,
          survey_category: values.survey_category,
        })
      }
      setModal(null)
      await load()
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async (row: AdminSurveyListRow) => {
    const ok = window.confirm(
      `Delete "${row.title}"? This cannot be undone. All ${row.completionCount} completion record(s) for this survey will be removed.`,
    )
    if (!ok) return
    setDeletingId(row.id)
    setError('')
    try {
      await adminDeleteSurvey(row.id)
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <AdminPageSection
      title="Surveys"
      description="Create, edit, or retire surveys. Filter and page through the catalog; completions counts how many members finished each survey."
    >
      <div className="admin-surveys-toolbar">
        <button type="button" className="button" onClick={() => { setFormError(null); setModal({ mode: 'create' }) }}>
          Create survey
        </button>
      </div>

      <div className="admin-surveys-filter-bar" aria-label="Survey filters">
        <div className="admin-surveys-filter-field">
          <label htmlFor="admin-surveys-search">Search</label>
          <input
            id="admin-surveys-search"
            type="search"
            className="admin-surveys-search-input"
            placeholder="Title or slug…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            autoComplete="off"
          />
        </div>
        <div className="admin-surveys-filter-field">
          <label htmlFor="admin-surveys-category">Category</label>
          <select
            id="admin-surveys-category"
            className="admin-surveys-select"
            value={categoryFilter}
            onChange={(e) => {
              setPage(1)
              setCategoryFilter(e.target.value as SurveyCategory | 'all')
            }}
          >
            <option value="all">All categories</option>
            {SURVEY_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="admin-surveys-filter-field">
          <label htmlFor="admin-surveys-active">Status</label>
          <select
            id="admin-surveys-active"
            className="admin-surveys-select"
            value={isActiveFilter}
            onChange={(e) => {
              setPage(1)
              setIsActiveFilter(e.target.value as 'all' | 'active' | 'inactive')
            }}
          >
            <option value="all">Active &amp; inactive</option>
            <option value="active">Active only</option>
            <option value="inactive">Inactive only</option>
          </select>
        </div>
        <div className="admin-surveys-filter-field">
          <label htmlFor="admin-surveys-plan">Plan (tier)</label>
          <select
            id="admin-surveys-plan"
            className="admin-surveys-select"
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
          >
            <option value="all">All plans</option>
            <option value="unassigned">Unassigned</option>
            {paymentTiers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
        <div className="admin-surveys-filter-field admin-surveys-filter-field--page-size">
          <label htmlFor="admin-surveys-page-size">Per page</label>
          <select
            id="admin-surveys-page-size"
            className="admin-surveys-select"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value))
              setPage(1)
            }}
          >
            {PAGE_SIZE_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        {hasActiveFilters ? (
          <button type="button" className="button secondary admin-surveys-clear-filters" onClick={clearFilters}>
            Clear filters
          </button>
        ) : null}
      </div>

      {error ? <p className="field-error">{error}</p> : null}

      {loading ? (
        <p className="panel-muted">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="panel-muted">
          {hasActiveFilters
            ? 'No surveys match your filters. Try clearing filters or adjusting search.'
            : 'No surveys yet. Create one to show it to members.'}
        </p>
      ) : (
        <>
          <p className="admin-surveys-range-summary">{rangeLabel}</p>
          <div className="admin-table-wrap">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Plan</th>
                  <th>Slug</th>
                  <th>Reward</th>
                  <th>Est.</th>
                  <th>Completions</th>
                  <th>Active</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>{r.title}</td>
                    <td>{r.survey_category}</td>
                    <td>{r.paymentCategoryName ?? '—'}</td>
                    <td>
                      <code className="admin-code-slug">{r.slug}</code>
                    </td>
                    <td>{formatCents(r.reward_cents)}</td>
                    <td>{r.estimated_minutes} min</td>
                    <td>
                      <strong>{r.completionCount}</strong>
                    </td>
                    <td>{r.is_active ? 'Yes' : 'No'}</td>
                    <td>
                      <div className="admin-withdrawal-actions">
                        <button
                          type="button"
                          className="button secondary"
                          onClick={() => {
                            setFormError(null)
                            setModal({ mode: 'edit', survey: r })
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="button secondary"
                          disabled={deletingId === r.id}
                          onClick={() => void confirmDelete(r)}
                        >
                          {deletingId === r.id ? '…' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 ? (
            <nav className="admin-surveys-pagination" aria-label="Survey list pages">
              <div className="admin-surveys-pagination-actions">
                <button
                  type="button"
                  className="button secondary"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </button>
                <span className="admin-surveys-pagination-page">
                  Page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  className="button secondary"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </button>
              </div>
            </nav>
          ) : null}
        </>
      )}

      {modal ? (
        <AdminSurveyFormModal
          mode={modal.mode}
          initial={modal.mode === 'edit' ? modal.survey : null}
          saving={saving}
          error={formError}
          onClose={() => {
            if (!saving) setModal(null)
          }}
          onSave={(payload) => void handleSave(payload)}
        />
      ) : null}
    </AdminPageSection>
  )
}
