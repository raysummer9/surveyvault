import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchAdminUserDetail, type AdminUserDetail } from '../../domain/adminUserDetailApi'
import { formatCents } from '../../domain/surveyApi'
import { AdminPageSection } from '../../shared/ui/AdminPageSection'
import { AdminOnboardingKycPanel } from './AdminOnboardingKycPanel'

function displayName(d: AdminUserDetail) {
  const a = d.profile.first_name?.trim() || ''
  const b = d.profile.last_name?.trim() || ''
  const full = `${a} ${b}`.trim()
  if (full) return full
  return d.profile.email ?? d.userId.slice(0, 8)
}

export function AdminUserDetailPage() {
  const { userId } = useParams<{ userId: string }>()
  const [loading, setLoading] = useState(true)
  const [detail, setDetail] = useState<AdminUserDetail | null>(null)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    if (!userId?.trim()) {
      setDetail(null)
      setLoading(false)
      return
    }
    setError('')
    setLoading(true)
    try {
      const data = await fetchAdminUserDetail(userId.trim())
      setDetail(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load member.')
      setDetail(null)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    void load()
  }, [load])

  if (loading) {
    return (
      <AdminPageSection title="Member" description="Loading…">
        <p className="panel-muted">Loading…</p>
      </AdminPageSection>
    )
  }

  if (detail === null) {
    return (
      <AdminPageSection title="Member not found" description="This id may be invalid or the profile was removed.">
        {error ? <p className="field-error">{error}</p> : <p className="panel-muted">No profile for this id.</p>}
        <p>
          <Link to="/admin/users" className="admin-sidebar-account-link">
            ← Back to manage users
          </Link>
        </p>
      </AdminPageSection>
    )
  }

  const p = detail.profile
  const wf = detail.workforcePayments

  return (
    <AdminPageSection
      title={displayName(detail)}
      description={
        <span>
          <Link to="/admin/users" className="admin-sidebar-account-link" style={{ marginRight: 12 }}>
            ← Manage users
          </Link>
          <span className="panel-muted">{p.email ?? '—'}</span>
        </span>
      }
    >
      {error ? <p className="field-error">{error}</p> : null}

      <div className="admin-user-detail-meta panel-muted">
        User ID: <code className="admin-user-detail-code">{detail.userId}</code>
        {p.account_suspended ? <span className="admin-users-suspended-pill">Suspended</span> : null}
      </div>

      {p.account_suspended ? (
        <div className="admin-user-detail-card admin-user-detail-warning">
          <h3 className="admin-settings-card-title">Account suspension</h3>
          <dl className="admin-detail-dl">
            {p.suspended_at ? (
              <>
                <dt>Suspended at</dt>
                <dd>{new Date(p.suspended_at).toLocaleString()}</dd>
              </>
            ) : null}
            {p.suspended_reason ? (
              <>
                <dt>Internal note</dt>
                <dd>{p.suspended_reason}</dd>
              </>
            ) : (
              <dd className="admin-detail-empty">No note recorded.</dd>
            )}
          </dl>
        </div>
      ) : null}

      <div className="admin-settings-grid">
        <div className="admin-user-detail-card">
          <h3 className="admin-settings-card-title">Account &amp; profile</h3>
          <dl className="admin-detail-dl">
            <dt>Onboarding</dt>
            <dd>{p.onboarding_status}</dd>
            <dt>Joined</dt>
            <dd>{new Date(p.created_at).toLocaleString()}</dd>
            <dt>Workforce joined</dt>
            <dd>{p.workforce_joined ? 'Yes' : 'No'}</dd>
            <dt>Workforce approved</dt>
            <dd>{p.workforce_approved === true ? 'Yes' : p.workforce_approved === false ? 'No' : '—'}</dd>
            <dt>Payment verified</dt>
            <dd>{p.workforce_payment_confirmed ? 'Yes' : 'No'}</dd>
            {p.workforce_payment_rejection_reason ? (
              <>
                <dt>Payment rejection</dt>
                <dd>{p.workforce_payment_rejection_reason}</dd>
              </>
            ) : null}
            <dt>Verified tier (payments)</dt>
            <dd>{detail.verifiedMembershipTier?.name ?? '—'}</dd>
            <dt>Max tier sort (surveys)</dt>
            <dd>{detail.memberMaxTierSort}</dd>
          </dl>
        </div>

        <div className="admin-user-detail-card">
          <h3 className="admin-settings-card-title">Earnings &amp; wallet</h3>
          <p className="admin-settings-hint">
            <strong>Total earned</strong> = all rewards from completed surveys. <strong>Pending payout</strong> = amount
            requested to withdraw (awaiting admin). <strong>Total payout</strong> = withdrawals approved by admin.
            <strong> Available</strong> = cleared survey rewards minus pending and approved withdrawal amounts.
          </p>
          <dl className="admin-detail-dl">
            <dt>Total earned</dt>
            <dd className="admin-user-detail-emphasis">{formatCents(detail.surveyStats.totalEarnedCents)}</dd>
            <dt>Of which cleared (survey paid)</dt>
            <dd>{formatCents(detail.surveyStats.paidCents)}</dd>
            <dt>Of which awaiting mark paid</dt>
            <dd>{formatCents(detail.surveyStats.pendingCents)}</dd>
            <dt>Surveys completed</dt>
            <dd>{detail.surveyStats.completedCount}</dd>
            <dt>Pending payout</dt>
            <dd>{formatCents(detail.pendingWithdrawalCents)}</dd>
            <dt>Total payout</dt>
            <dd>{formatCents(detail.totalPayoutCents)}</dd>
            <dt>Available to withdraw</dt>
            <dd>{formatCents(detail.withdrawableCents)}</dd>
          </dl>
        </div>
      </div>

      <div className="admin-user-detail-card">
        <h3 className="admin-settings-card-title">Onboarding &amp; KYC</h3>
        {detail.submission ? (
          <p className="admin-settings-hint panel-muted">
            Step flags: profile {detail.submission.is_profile_complete ? '✓' : '—'}, skills{' '}
            {detail.submission.is_skill_complete ? '✓' : '—'}, ID {detail.submission.is_id_complete ? '✓' : '—'}, address{' '}
            {detail.submission.is_address_complete ? '✓' : '—'} · Updated{' '}
            {new Date(detail.submission.updated_at).toLocaleString()}
          </p>
        ) : null}
        <AdminOnboardingKycPanel submission={detail.submission} />
      </div>

      <div className="admin-user-detail-card">
        <h3 className="admin-settings-card-title">Survey completions</h3>
        {detail.surveyCompletions.length === 0 ? (
          <p className="admin-detail-empty">No completions yet.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-data-table admin-user-detail-table">
              <thead>
                <tr>
                  <th>Survey</th>
                  <th>Reward</th>
                  <th>Status</th>
                  <th>Paid</th>
                  <th>Completed</th>
                </tr>
              </thead>
              <tbody>
                {detail.surveyCompletions.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div className="admin-users-name">{c.survey_title}</div>
                      <div className="admin-users-email">{c.survey_slug}</div>
                    </td>
                    <td>{formatCents(c.reward_cents)}</td>
                    <td>{c.payout_status}</td>
                    <td className="admin-users-date">{c.paid_at ? new Date(c.paid_at).toLocaleString() : '—'}</td>
                    <td className="admin-users-date">{new Date(c.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="admin-user-detail-card">
        <h3 className="admin-settings-card-title">Withdrawal requests</h3>
        {detail.withdrawals.length === 0 ? (
          <p className="admin-detail-empty">No withdrawal requests.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-data-table admin-user-detail-table">
              <thead>
                <tr>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {detail.withdrawals.map((w) => (
                  <tr key={w.id}>
                    <td>{formatCents(w.amount_cents)}</td>
                    <td>{w.method}</td>
                    <td>{w.status}</td>
                    <td className="admin-users-date">{new Date(w.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="admin-user-detail-card">
        <h3 className="admin-settings-card-title">Workforce payments</h3>
        {wf.length === 0 ? (
          <p className="admin-detail-empty">No workforce payment submissions.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-data-table admin-user-detail-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Tier</th>
                  <th>USD</th>
                  <th>TX</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {wf.map((row) => (
                  <tr key={row.id}>
                    <td>{row.status}</td>
                    <td className="admin-users-email">{row.tier_id}</td>
                    <td>{Number(row.amount_usd)}</td>
                    <td className="admin-users-email">{row.tx_hash ?? '—'}</td>
                    <td className="admin-users-date">{new Date(row.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminPageSection>
  )
}
