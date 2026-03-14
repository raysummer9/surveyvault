import { useCallback, useEffect, useMemo, useState } from 'react'
import { assertSupabaseConfigured } from '../../lib/supabase'
import type { OnboardingSubmission, UserProfile } from '../auth/types'
import { PageSection } from '../../shared/ui/PageSection'

type ReviewRow = {
  userId: string
  submission: OnboardingSubmission
  profile: UserProfile | null
}

function getDisplayName(profile: UserProfile | null, userId: string) {
  const first = profile?.first_name?.trim() || ''
  const last = profile?.last_name?.trim() || ''
  const full = `${first} ${last}`.trim()
  if (full) return full
  if (profile?.email) return profile.email
  return userId
}

export function AdminOnboardingReviewPage() {
  const [rows, setRows] = useState<ReviewRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actioningUserId, setActioningUserId] = useState('')

  const fetchRows = useCallback(async () => {
    setError('')
    setLoading(true)
    try {
      const client = assertSupabaseConfigured()

      const [submissionsResult, profilesResult] = await Promise.all([
        client.from('onboarding_submissions').select('*').order('updated_at', { ascending: false }),
        client.from('user_profiles').select('*'),
      ])

      if (submissionsResult.error) throw submissionsResult.error
      if (profilesResult.error) throw profilesResult.error

      const profileMap = new Map<string, UserProfile>()
      ;(profilesResult.data ?? []).forEach((profile) => {
        profileMap.set(profile.id, profile)
      })

      const nextRows: ReviewRow[] = (submissionsResult.data ?? []).map((submission) => ({
        userId: submission.user_id,
        submission,
        profile: profileMap.get(submission.user_id) ?? null,
      }))

      setRows(nextRows)
    } catch (fetchError) {
      const message = fetchError instanceof Error ? fetchError.message : 'Unable to load onboarding queue.'
      setError(message)
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchRows()
  }, [fetchRows])

  const handleDecision = async (userId: string, decision: 'approve' | 'reject') => {
    setError('')
    setActioningUserId(userId)
    try {
      const client = assertSupabaseConfigured()
      const approved = decision === 'approve'

      const { error: profileError } = await client
        .from('user_profiles')
        .update({
          onboarding_status: approved ? 'approved' : 'rejected',
          workforce_approved: approved,
        })
        .eq('id', userId)

      if (profileError) throw profileError

      const { error: submissionError } = await client
        .from('onboarding_submissions')
        .update({
          current_step: approved ? 'completed' : 'address',
          is_onboarding_complete: approved,
        })
        .eq('user_id', userId)

      if (submissionError) throw submissionError

      await fetchRows()
    } catch (decisionError) {
      const message = decisionError instanceof Error ? decisionError.message : 'Unable to update onboarding status.'
      setError(message)
    } finally {
      setActioningUserId('')
    }
  }

  const pendingRows = useMemo(
    () => rows.filter((row) => row.profile?.onboarding_status !== 'approved'),
    [rows],
  )

  return (
    <PageSection
      title="Admin: Onboarding Review"
      description="Review each member's submitted onboarding information and approve or reject access."
    >
      {error && <p className="field-error">{error}</p>}
      {loading ? (
        <div className="panel-muted">
          <p>Loading onboarding submissions...</p>
        </div>
      ) : pendingRows.length === 0 ? (
        <div className="panel-muted">
          <p>No onboarding submissions are waiting for review right now.</p>
        </div>
      ) : (
        <div className="admin-review-list">
          {pendingRows.map((row) => {
            const { profile, submission, userId } = row
            const reviewLocked = actioningUserId === userId
            const stepsCompleteCount = [
              submission.is_profile_complete,
              submission.is_skill_complete,
              submission.is_id_complete,
              submission.is_address_complete,
            ].filter(Boolean).length

            return (
              <article key={userId} className="admin-review-card">
                <div>
                  <p className="admin-review-name">{getDisplayName(profile, userId)}</p>
                  <p className="admin-review-meta">{profile?.email ?? 'No email available'}</p>
                  <p className="admin-review-meta">Steps complete: {stepsCompleteCount}/4</p>
                  <p className="admin-review-meta">Last update: {new Date(submission.updated_at).toLocaleString()}</p>
                </div>
                <div className="admin-review-actions">
                  <button
                    type="button"
                    className="step-action"
                    disabled={reviewLocked}
                    onClick={() => {
                      void handleDecision(userId, 'approve')
                    }}
                  >
                    {reviewLocked ? 'Saving...' : 'Approve'}
                  </button>
                  <button
                    type="button"
                    className="profile-secondary-action"
                    disabled={reviewLocked}
                    onClick={() => {
                      void handleDecision(userId, 'reject')
                    }}
                  >
                    Reject
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </PageSection>
  )
}
