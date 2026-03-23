import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  adminListMemberDirectory,
  adminSetUserSuspended,
  type AdminMemberDirectoryRow,
} from '../../domain/adminUsersApi'
import { membershipTierFromDirectoryFields } from '../../domain/paymentCategory'
import { formatCents } from '../../domain/surveyApi'
import { AdminPageSection } from '../../shared/ui/AdminPageSection'
import { MembershipTierBadge } from '../../shared/ui/MembershipTierBadge'

const PAGE_SIZE = 25

function displayName(row: AdminMemberDirectoryRow) {
  const a = row.first_name?.trim() || ''
  const b = row.last_name?.trim() || ''
  const full = `${a} ${b}`.trim()
  if (full) return full
  return row.email ?? row.id.slice(0, 8)
}

function accountSummary(row: AdminMemberDirectoryRow) {
  const parts: string[] = []
  parts.push(`Onboarding: ${row.onboarding_status || '—'}`)
  if (row.workforce_joined) {
    parts.push(row.workforce_approved ? 'Workforce: active' : 'Workforce: pending approval')
  } else {
    parts.push('Workforce: not joined')
  }
  return parts.join(' · ')
}

export function AdminUsersPage() {
  const [rows, setRows] = useState<AdminMemberDirectoryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [searchDebounced, setSearchDebounced] = useState('')
  const [page, setPage] = useState(0)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [confirmSuspend, setConfirmSuspend] = useState<AdminMemberDirectoryRow | null>(null)
  const [suspendNote, setSuspendNote] = useState('')

  useEffect(() => {
    const t = window.setTimeout(() => setSearchDebounced(search.trim()), 350)
    return () => window.clearTimeout(t)
  }, [search])

  useEffect(() => {
    setPage(0)
  }, [searchDebounced])

  const load = useCallback(async () => {
    setError('')
    setLoading(true)
    try {
      const data = await adminListMemberDirectory({
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
        search: searchDebounced || undefined,
      })
      setRows(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load members.')
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [page, searchDebounced])

  useEffect(() => {
    void load()
  }, [load])

  const totalCount = rows[0]?.total_count ?? 0
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  const pageLabel = useMemo(() => {
    if (rows.length === 0) return 'No members'
    const start = page * PAGE_SIZE + 1
    const end = page * PAGE_SIZE + rows.length
    return `${start}–${end} of ${totalCount}`
  }, [rows.length, page, totalCount])

  const doSuspend = async (row: AdminMemberDirectoryRow, suspended: boolean) => {
    setBusyId(row.id)
    setError('')
    try {
      await adminSetUserSuspended(row.id, suspended, suspended ? suspendNote : null)
      setConfirmSuspend(null)
      setSuspendNote('')
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <AdminPageSection
      title="Manage users"
      description="Search members, see total earned at a glance, open full profile & KYC, or suspend access."
    >
      <div className="admin-users-toolbar">
        <label className="admin-users-search-label">
          <span className="sr-only">Search</span>
          <input
            type="search"
            className="admin-users-search-input"
            placeholder="Search by email or name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoComplete="off"
          />
        </label>
        <p className="panel-muted admin-users-count">{pageLabel}</p>
      </div>

      {error ? <p className="field-error">{error}</p> : null}

      {loading ? (
        <p className="panel-muted">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="panel-muted">No members match your search.</p>
      ) : (
        <div className="admin-table-wrap admin-users-table-wrap">
          <table className="admin-data-table admin-users-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Total earned</th>
                <th>Account</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const verifiedTier = membershipTierFromDirectoryFields(row)
                return (
                <tr key={row.id}>
                  <td>
                    <div className="admin-users-member-name-row">
                      <div className="admin-users-name">{displayName(row)}</div>
                      {verifiedTier ? <MembershipTierBadge tier={verifiedTier} variant="inline" /> : null}
                    </div>
                    <div className="admin-users-email">{row.email ?? '—'}</div>
                    {row.account_suspended ? (
                      <span className="admin-users-suspended-pill">Suspended</span>
                    ) : null}
                  </td>
                  <td>
                    <div className="admin-users-total-earned">{formatCents(row.total_earned_cents)}</div>
                    <div className="admin-users-email">{row.completed_surveys} surveys completed</div>
                  </td>
                  <td>
                    <div className="admin-users-account-summary">{accountSummary(row)}</div>
                    <div className="admin-users-email">
                      Available {formatCents(row.withdrawable_cents)} · Pending payout{' '}
                      {formatCents(row.pending_payout_cents)} · Total payout {formatCents(row.total_payout_cents)}
                    </div>
                  </td>
                  <td>
                    <div className="admin-users-actions-row">
                      <Link to={`/admin/users/${row.id}`} className="profile-secondary-action admin-users-action">
                        View user
                      </Link>
                      {row.account_suspended ? (
                        <button
                          type="button"
                          className="profile-secondary-action admin-users-action"
                          disabled={busyId === row.id}
                          onClick={() => void doSuspend(row, false)}
                        >
                          Reinstate
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="profile-secondary-action admin-users-action danger"
                          disabled={busyId === row.id}
                          onClick={() => {
                            setSuspendNote('')
                            setConfirmSuspend(row)
                          }}
                        >
                          Suspend
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {totalCount > PAGE_SIZE ? (
        <div className="admin-users-pagination">
          <button
            type="button"
            className="profile-secondary-action"
            disabled={page <= 0 || loading}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            Previous
          </button>
          <span className="panel-muted">
            Page {page + 1} / {totalPages}
          </span>
          <button
            type="button"
            className="profile-secondary-action"
            disabled={page >= totalPages - 1 || loading}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      ) : null}

      {confirmSuspend ? (
        <div className="admin-reject-modal-overlay" role="presentation" onClick={() => setConfirmSuspend(null)}>
          <div
            className="admin-reject-modal admin-users-suspend-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="suspend-user-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="suspend-user-title">Suspend {displayName(confirmSuspend)}?</h3>
            <p className="admin-reject-hint">
              They will be blocked from the dashboard and see a policy notice until reinstated.
            </p>
            <label className="admin-users-suspend-note-label">
              Internal note (optional)
              <textarea
                className="admin-reject-textarea"
                rows={3}
                value={suspendNote}
                onChange={(e) => setSuspendNote(e.target.value)}
                placeholder="Reason (visible to admins only)"
              />
            </label>
            <div className="admin-reject-actions">
              <button type="button" className="profile-secondary-action" onClick={() => setConfirmSuspend(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="profile-secondary-action danger"
                disabled={busyId === confirmSuspend.id}
                onClick={() => void doSuspend(confirmSuspend, true)}
              >
                Confirm suspend
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AdminPageSection>
  )
}
