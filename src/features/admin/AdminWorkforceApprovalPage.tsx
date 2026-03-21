import { useCallback, useEffect, useState } from 'react'
import { assertSupabaseConfigured } from '../../lib/supabase'
import { fetchAllPaymentCategoriesAdmin } from '../../domain/paymentCategory'
import { useAuth } from '../auth/AuthContext'
import type { UserProfile } from '../auth/types'
import { AdminPageSection } from '../../shared/ui/AdminPageSection'
import type { WorkforcePaymentRow } from '../workforce/workforcePaymentUtils'

type QueueRow = {
  payment: WorkforcePaymentRow
  profile: UserProfile | null
  tierName: string
}

function getDisplayName(profile: UserProfile | null, userId: string) {
  const first = profile?.first_name?.trim() || ''
  const last = profile?.last_name?.trim() || ''
  const full = `${first} ${last}`.trim()
  if (full) return full
  if (profile?.email) return profile.email
  return userId
}

export function AdminWorkforceApprovalPage() {
  const { user } = useAuth()
  const [rows, setRows] = useState<QueueRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actioningId, setActioningId] = useState<string | null>(null)
  const [rejectPaymentId, setRejectPaymentId] = useState<string | null>(null)
  const [rejectNote, setRejectNote] = useState('')

  const fetchRows = useCallback(async () => {
    setError('')
    setLoading(true)
    try {
      const client = assertSupabaseConfigured()

      const [paymentsResult, categories] = await Promise.all([
        client
          .from('workforce_payments')
          .select('*')
          .eq('status', 'pending')
          .order('created_at', { ascending: false }),
        fetchAllPaymentCategoriesAdmin().catch(() => []),
      ])

      if (paymentsResult.error) throw paymentsResult.error

      const payments = (paymentsResult.data ?? []) as WorkforcePaymentRow[]
      if (import.meta.env.DEV && payments.length === 0 && !paymentsResult.error) {
        console.info(
          '[AdminWorkforceApproval] 0 pending rows from API (RLS returns empty array when not allowed). ' +
            'Apply latest Supabase migrations and ensure public.admin_users has your admin email.',
        )
      }
      const tierNameMap = new Map<string, string>()
      categories.forEach((c) => {
        tierNameMap.set(c.id, c.name)
        if (c.slug) tierNameMap.set(c.slug, c.name)
      })

      const userIds = [...new Set(payments.map((p) => p.user_id))]
      if (userIds.length === 0) {
        setRows([])
        return
      }

      const { data: profilesData, error: profilesError } = await client
        .from('user_profiles')
        .select('*')
        .in('id', userIds)

      const profileMap = new Map<string, UserProfile>()
      if (profilesError) {
        console.error('[AdminWorkforceApproval] profile batch load failed', profilesError)
        setError(
          `Could not load member profiles (${profilesError.message}). Requests may still list without names/emails.`,
        )
      } else {
        ;(profilesData as UserProfile[] | null)?.forEach((p) => profileMap.set(p.id, p))
      }

      const nextRows: QueueRow[] = []
      for (const payment of payments) {
        const profile = profileMap.get(payment.user_id) ?? null
        // List every pending row. Do not skip when profile.workforce_approved is true (can desync from payment rows).
        const tierName =
          tierNameMap.get(payment.tier_id) ??
          (payment.tier_id.length > 12
            ? `Plan (${payment.tier_id.slice(0, 8)}…)`
            : `Plan (${payment.tier_id})`)
        nextRows.push({ payment, profile, tierName })
      }

      setRows(nextRows)
    } catch (fetchErr) {
      const message =
        fetchErr instanceof Error ? fetchErr.message : 'Unable to load workforce approval queue.'
      setError(message)
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchRows()
  }, [fetchRows])

  const handleApprove = async (paymentId: string, userId: string) => {
    setError('')
    setActioningId(paymentId)
    try {
      const client = assertSupabaseConfigured()

      const { error: payErr } = await client
        .from('workforce_payments')
        .update({ status: 'verified' })
        .eq('id', paymentId)
        .eq('status', 'pending')

      if (payErr) throw payErr

      const { error: profileErr } = await client
        .from('user_profiles')
        .update({
          workforce_approved: true,
          workforce_joined: true,
          workforce_payment_rejection_reason: null,
        })
        .eq('id', userId)

      if (profileErr) throw profileErr

      await fetchRows()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to approve.')
    } finally {
      setActioningId(null)
    }
  }

  const handleReject = async () => {
    if (!rejectPaymentId) return
    const note = rejectNote.trim()
    if (!note) {
      setError('Please enter a reason for the member.')
      return
    }

    const row = rows.find((r) => r.payment.id === rejectPaymentId)
    if (!row) return

    setError('')
    setActioningId(rejectPaymentId)
    try {
      const client = assertSupabaseConfigured()

      const { error: payErr } = await client
        .from('workforce_payments')
        .update({
          status: 'rejected',
          admin_rejection_reason: note,
        })
        .eq('id', rejectPaymentId)
        .eq('status', 'pending')

      if (payErr) throw payErr

      const { error: profileErr } = await client
        .from('user_profiles')
        .update({
          workforce_payment_confirmed: false,
          workforce_payment_rejection_reason: note,
        })
        .eq('id', row.payment.user_id)

      if (profileErr) throw profileErr

      setRejectPaymentId(null)
      setRejectNote('')
      await fetchRows()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reject.')
    } finally {
      setActioningId(null)
    }
  }

  const pendingRows = rows.filter((row) => row.payment.user_id !== user?.id)

  return (
    <AdminPageSection
      title="Admin: Payment requests"
      description="Verify each member’s crypto payment (TXID, tier, amount) before approving workforce access. Rejections require a note the member will see."
    >
      {error && <p className="field-error">{error}</p>}
      {loading ? (
        <div className="panel-muted">
          <p>Loading pending payment requests…</p>
        </div>
      ) : pendingRows.length === 0 ? (
        <div className="panel-muted">
          <p>No payment requests are waiting for review.</p>
        </div>
      ) : (
        <div className="admin-review-list admin-workforce-queue">
          {pendingRows.map(({ payment, profile, tierName }) => {
            const userId = payment.user_id
            const isBusy = actioningId === payment.id
            const txShort =
              payment.tx_hash && payment.tx_hash.length > 18
                ? `${payment.tx_hash.slice(0, 10)}…${payment.tx_hash.slice(-6)}`
                : payment.tx_hash ?? '—'
            const refId = payment.review_reference_id ?? payment.id.slice(0, 8).toUpperCase()

            return (
              <article key={payment.id} className="admin-review-card admin-workforce-card">
                <div className="admin-workforce-card-top">
                  <div>
                    <p className="admin-review-name">{getDisplayName(profile, userId)}</p>
                    <p className="admin-review-meta">{profile?.email ?? 'No email'}</p>
                    <p className="admin-review-meta">
                      <strong>{tierName}</strong> · {payment.amount_btc} BTC · $
                      {Number(payment.amount_usd).toLocaleString()} · {payment.currency_sent.toUpperCase()}
                    </p>
                    {!profile?.workforce_payment_confirmed && (
                      <p className="admin-workforce-profile-flag-warn" role="status">
                        Profile is not marked payment-confirmed—verify the TX on-chain before approving.
                      </p>
                    )}
                  </div>
                  <div className="admin-review-actions admin-workforce-actions">
                    <button
                      type="button"
                      className="step-action"
                      disabled={isBusy || !!rejectPaymentId}
                      onClick={() => void handleApprove(payment.id, userId)}
                    >
                      {isBusy && actioningId === payment.id ? 'Working…' : 'Approve'}
                    </button>
                    <button
                      type="button"
                      className="profile-secondary-action"
                      disabled={isBusy || !!rejectPaymentId}
                      onClick={() => {
                        setRejectPaymentId(payment.id)
                        setRejectNote('')
                        setError('')
                      }}
                    >
                      Reject
                    </button>
                  </div>
                </div>
                <dl className="admin-workforce-meta-dl">
                  <div>
                    <dt>TXID</dt>
                    <dd title={payment.tx_hash ?? undefined}>{txShort}</dd>
                  </div>
                  <div>
                    <dt>Reference</dt>
                    <dd>{refId}</dd>
                  </div>
                  <div>
                    <dt>Submitted</dt>
                    <dd>{new Date(payment.created_at).toLocaleString()}</dd>
                  </div>
                </dl>
              </article>
            )
          })}
        </div>
      )}

      {rejectPaymentId && (
        <div className="admin-reject-modal-overlay" role="presentation">
          <div
            className="admin-reject-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-reject-title"
          >
            <h3 id="admin-reject-title">Reason for rejection</h3>
            <p className="admin-reject-hint">
              This message will be shown to the member so they understand what to fix or do next.
            </p>
            <textarea
              className="admin-reject-textarea"
              rows={5}
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              placeholder="e.g. Transaction hash does not match our records. Please resubmit with the correct TXID."
              autoFocus
            />
            <div className="admin-reject-actions">
              <button
                type="button"
                className="step-action"
                disabled={!!actioningId}
                onClick={() => void handleReject()}
              >
                {actioningId === rejectPaymentId ? 'Saving…' : 'Submit rejection'}
              </button>
              <button
                type="button"
                className="profile-secondary-action"
                disabled={!!actioningId}
                onClick={() => {
                  setRejectPaymentId(null)
                  setRejectNote('')
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminPageSection>
  )
}
