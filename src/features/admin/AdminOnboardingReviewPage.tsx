import { useCallback, useEffect, useMemo, useState } from 'react'
import { IoChevronDownOutline, IoChevronUpOutline, IoDocumentTextOutline, IoPersonOutline } from 'react-icons/io5'
import { assertSupabaseConfigured } from '../../lib/supabase'
import { useAuth } from '../auth/AuthContext'
import { isOnboardingComplete, type OnboardingSubmission, type UserProfile } from '../auth/types'
import { getOnboardingFileSignedUrl } from '../onboarding/onboardingStorage'
import { PageSection } from '../../shared/ui/PageSection'

type ReviewRow = {
  userId: string
  submission: OnboardingSubmission
  profile: UserProfile | null
}

type FileMeta = {
  path: string
  bucket?: string
  originalName?: string
}

function getDisplayName(profile: UserProfile | null, userId: string) {
  const first = profile?.first_name?.trim() || ''
  const last = profile?.last_name?.trim() || ''
  const full = `${first} ${last}`.trim()
  if (full) return full
  if (profile?.email) return profile.email
  return userId
}

function AdminFilePreview({ file }: { file: FileMeta }) {
  const [url, setUrl] = useState<string | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!file?.path) return
    let cancelled = false
    getOnboardingFileSignedUrl(file)
      .then((signedUrl) => {
        if (!cancelled) setUrl(signedUrl)
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })
    return () => {
      cancelled = true
    }
  }, [file.path, file.bucket])

  if (error) return <span className="admin-file-error">Unable to load file</span>
  if (!url) return <span className="admin-file-loading">Loading…</span>

  const isImage = file.originalName?.match(/\.(jpg|jpeg|png|gif|webp)$/i) || file.path.match(/\.(jpg|jpeg|png|gif|webp)$/i)
  if (isImage) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="admin-file-preview-link">
        <img src={url} alt={file.originalName ?? 'Upload'} className="admin-file-preview-img" />
      </a>
    )
  }
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="admin-file-preview-link">
      {file.originalName ?? 'View file'}
    </a>
  )
}

function AdminSubmissionDetails({ submission }: { submission: OnboardingSubmission }) {
  const profileData = submission.profile_data && typeof submission.profile_data === 'object' ? submission.profile_data : {}
  const skillsData = submission.skills_data && typeof submission.skills_data === 'object' ? submission.skills_data : {}
  const idData = submission.id_verification_data && typeof submission.id_verification_data === 'object' ? submission.id_verification_data : {}
  const addressData = submission.address_data && typeof submission.address_data === 'object' ? submission.address_data : {}

  const profilePhoto = profileData.profilePhotoFile as FileMeta | undefined
  const selfieFile = idData.selfieFile as FileMeta | undefined
  const frontDoc = idData.frontDocumentFile as FileMeta | undefined
  const backDoc = idData.backDocumentFile as FileMeta | undefined
  const proofFile = addressData.proofFile as FileMeta | undefined

  const skillsAnswers = skillsData.answers as Record<string, string> | undefined

  return (
    <div className="admin-submission-details">
      <section className="admin-detail-section">
        <h4 className="admin-detail-heading">
          <IoPersonOutline /> Profile
        </h4>
        <dl className="admin-detail-dl">
          {profileData.firstName != null && <><dt>First name</dt><dd>{String(profileData.firstName)}</dd></>}
          {profileData.lastName != null && <><dt>Last name</dt><dd>{String(profileData.lastName)}</dd></>}
          {profileData.email != null && <><dt>Email</dt><dd>{String(profileData.email)}</dd></>}
          {profileData.phoneNumber != null && <><dt>Phone</dt><dd>{String(profileData.phoneNumber)}</dd></>}
          {profileData.birthDate != null && <><dt>Date of birth</dt><dd>{String(profileData.birthDate)}</dd></>}
          {profileData.age != null && <><dt>Age</dt><dd>{String(profileData.age)}</dd></>}
          {profileData.gender != null && <><dt>Gender</dt><dd>{String(profileData.gender)}</dd></>}
          {profileData.nationality != null && <><dt>Nationality</dt><dd>{String(profileData.nationality)}</dd></>}
          {profileData.country != null && <><dt>Country</dt><dd>{String(profileData.country)}</dd></>}
        </dl>
        {profilePhoto?.path && (
          <div className="admin-detail-files">
            <strong>Profile photo</strong>
            <AdminFilePreview file={profilePhoto} />
          </div>
        )}
      </section>

      <section className="admin-detail-section">
        <h4 className="admin-detail-heading">
          <IoDocumentTextOutline /> Skills assessment
        </h4>
        {skillsAnswers && Object.keys(skillsAnswers).length > 0 ? (
          <dl className="admin-detail-dl">
            {Object.entries(skillsAnswers).map(([qId, choice]) => (
              <div key={qId}>
                <dt>{qId}</dt>
                <dd>{choice}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="admin-detail-empty">No skills data</p>
        )}
      </section>

      <section className="admin-detail-section">
        <h4 className="admin-detail-heading">ID verification</h4>
        <dl className="admin-detail-dl">
          {idData.documentType != null && <><dt>Document type</dt><dd>{String(idData.documentType)}</dd></>}
        </dl>
        <div className="admin-detail-files admin-detail-files-grid">
          {selfieFile?.path && (
            <div>
              <strong>Selfie</strong>
              <AdminFilePreview file={selfieFile} />
            </div>
          )}
          {frontDoc?.path && (
            <div>
              <strong>ID front</strong>
              <AdminFilePreview file={frontDoc} />
            </div>
          )}
          {backDoc?.path && (
            <div>
              <strong>ID back</strong>
              <AdminFilePreview file={backDoc} />
            </div>
          )}
        </div>
      </section>

      <section className="admin-detail-section">
        <h4 className="admin-detail-heading">Address</h4>
        <dl className="admin-detail-dl">
          {addressData.streetAddress != null && <><dt>Street</dt><dd>{String(addressData.streetAddress)}</dd></>}
          {addressData.apartment != null && addressData.apartment !== '' && <><dt>Apartment</dt><dd>{String(addressData.apartment)}</dd></>}
          {addressData.city != null && <><dt>City</dt><dd>{String(addressData.city)}</dd></>}
          {addressData.stateOrProvince != null && <><dt>State / Province</dt><dd>{String(addressData.stateOrProvince)}</dd></>}
          {addressData.postalCode != null && <><dt>Postal code</dt><dd>{String(addressData.postalCode)}</dd></>}
          {addressData.country != null && <><dt>Country</dt><dd>{String(addressData.country)}</dd></>}
          {addressData.proofType != null && <><dt>Proof type</dt><dd>{String(addressData.proofType)}</dd></>}
        </dl>
        {proofFile?.path && (
          <div className="admin-detail-files">
            <strong>Proof of address</strong>
            <AdminFilePreview file={proofFile} />
          </div>
        )}
      </section>
    </div>
  )
}

export function AdminOnboardingReviewPage() {
  const { user } = useAuth()
  const [rows, setRows] = useState<ReviewRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actioningUserId, setActioningUserId] = useState('')
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null)

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
          current_step: approved ? 'completed' : 'profile',
          is_profile_complete: approved,
          is_skill_complete: approved,
          is_id_complete: approved,
          is_address_complete: approved,
          is_onboarding_complete: approved,
          ...(approved
            ? {}
            : {
                profile_data: {},
                skills_data: {},
                id_verification_data: {},
                address_data: {},
              }),
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
    () =>
      rows.filter((row) => {
        if (row.userId === user?.id) return false
        if (row.profile?.onboarding_status === 'approved') return false
        if (!isOnboardingComplete(row.submission)) return false
        return true
      }),
    [rows, user?.id],
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
            const isExpanded = expandedUserId === userId
            const stepsCompleteCount = [
              submission.is_profile_complete,
              submission.is_skill_complete,
              submission.is_id_complete,
              submission.is_address_complete,
            ].filter(Boolean).length

            return (
              <article key={userId} className="admin-review-card admin-review-card-expandable">
                <div className="admin-review-summary">
                  <div>
                    <p className="admin-review-name">{getDisplayName(profile, userId)}</p>
                    <p className="admin-review-meta">{profile?.email ?? 'No email available'}</p>
                    <p className="admin-review-meta">Steps complete: {stepsCompleteCount}/4</p>
                    <p className="admin-review-meta">Last update: {new Date(submission.updated_at).toLocaleString()}</p>
                  </div>
                  <div className="admin-review-actions-row">
                    <button
                      type="button"
                      className="profile-secondary-action admin-view-details-btn"
                      onClick={() => setExpandedUserId(isExpanded ? null : userId)}
                    >
                      {isExpanded ? (
                        <>
                          <IoChevronUpOutline /> Hide details
                        </>
                      ) : (
                        <>
                          <IoChevronDownOutline /> View details
                        </>
                      )}
                    </button>
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
                  </div>
                </div>
                {isExpanded && (
                  <div className="admin-review-details-wrap">
                    <AdminSubmissionDetails submission={submission} />
                  </div>
                )}
              </article>
            )
          })}
        </div>
      )}
    </PageSection>
  )
}
