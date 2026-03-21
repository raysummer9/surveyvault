import { useCallback, useEffect, useState } from 'react'
import {
  adminApproveWithdrawal,
  adminListWithdrawalRequests,
  adminRejectWithdrawal,
} from '../../domain/withdrawalApi'
import type { AdminWithdrawalRow } from '../../domain/withdrawalApi'
import { formatCents } from '../../domain/surveyApi'
import { AdminPageSection } from '../../shared/ui/AdminPageSection'

export function AdminWithdrawalsPage() {
  const [rows, setRows] = useState<AdminWithdrawalRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [rejectId, setRejectId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const load = useCallback(async () => {
    setError('')
    setLoading(true)
    try {
      const data = await adminListWithdrawalRequests()
      setRows(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load withdrawals.')
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const approve = async (id: string) => {
    setBusyId(id)
    setError('')
    try {
      await adminApproveWithdrawal(id)
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Approve failed.')
    } finally {
      setBusyId(null)
    }
  }

  const openReject = (id: string) => {
    setRejectId(id)
    setRejectReason('')
  }

  const confirmReject = async () => {
    if (!rejectId) return
    setBusyId(rejectId)
    setError('')
    try {
      await adminRejectWithdrawal(rejectId, rejectReason || 'Rejected by admin')
      setRejectId(null)
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Reject failed.')
    } finally {
      setBusyId(null)
    }
  }

  const summarizeDetails = (r: AdminWithdrawalRow) => {
    if (r.method === 'crypto') {
      return `${r.crypto_network ?? '?'} · ${(r.crypto_wallet_address ?? '').slice(0, 12)}…`
    }
    const acct = (r.bank_account_number ?? '').replace(/\s/g, '')
    const last4 = acct.length >= 4 ? acct.slice(-4) : acct || '—'
    return `${r.bank_name ?? 'Bank'} · …${last4}`
  }

  return (
    <AdminPageSection
      title="Withdrawal requests"
      description="Approve or reject member withdrawal requests. Approved amounts reduce their withdrawable balance."
    >
      {error ? <p className="field-error">{error}</p> : null}

      {loading ? (
        <p className="panel-muted">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="panel-muted">No withdrawal requests yet.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Details</th>
                <th>Status</th>
                <th>Requested</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.member_email ?? r.user_id.slice(0, 8) + '…'}</td>
                  <td>{formatCents(r.amount_cents)}</td>
                  <td>{r.method}</td>
                  <td
                    className="admin-withdrawal-detail"
                    title={
                      r.method === 'crypto'
                        ? r.crypto_wallet_address ?? ''
                        : [r.bank_account_holder, r.bank_name, r.bank_account_number, r.bank_routing_or_iban, r.bank_country]
                            .filter(Boolean)
                            .join(' | ')
                    }
                  >
                    {summarizeDetails(r)}
                  </td>
                  <td>
                    <span
                      className={
                        r.status === 'approved'
                          ? 'admin-paid-pill'
                          : r.status === 'rejected'
                            ? 'withdrawal-status-rejected'
                            : 'admin-pending-pill'
                      }
                    >
                      {r.status}
                    </span>
                  </td>
                  <td>{new Date(r.created_at).toLocaleString()}</td>
                  <td>
                    {r.status === 'pending' ? (
                      <div className="admin-withdrawal-actions">
                        <button
                          type="button"
                          className="button"
                          disabled={busyId === r.id}
                          onClick={() => void approve(r.id)}
                        >
                          {busyId === r.id ? '…' : 'Approve'}
                        </button>
                        <button
                          type="button"
                          className="button secondary"
                          disabled={busyId === r.id}
                          onClick={() => openReject(r.id)}
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {rejectId ? (
        <div className="admin-reject-modal" role="dialog" aria-modal="true">
          <div className="admin-reject-modal-inner">
            <h3>Reject withdrawal</h3>
            <label className="withdrawal-field">
              <span>Reason (shown to member)</span>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Explain why this request was rejected"
              />
            </label>
            <div className="withdrawal-actions">
              <button type="button" className="button secondary" onClick={() => setRejectId(null)}>
                Cancel
              </button>
              <button type="button" className="button" onClick={() => void confirmReject()} disabled={!!busyId}>
                Confirm reject
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AdminPageSection>
  )
}
