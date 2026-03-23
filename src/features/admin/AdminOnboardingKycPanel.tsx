import { useEffect, useState } from 'react'
import { IoDocumentTextOutline, IoPersonOutline } from 'react-icons/io5'
import { type OnboardingSubmission } from '../auth/types'
import { getOnboardingFileSignedUrl } from '../onboarding/onboardingStorage'

export type OnboardingFileMeta = {
  path: string
  bucket?: string
  originalName?: string
}

function AdminFilePreview({ file }: { file: OnboardingFileMeta }) {
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

  const isImage =
    file.originalName?.match(/\.(jpg|jpeg|png|gif|webp)$/i) || file.path.match(/\.(jpg|jpeg|png|gif|webp)$/i)
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
  const idData =
    submission.id_verification_data && typeof submission.id_verification_data === 'object'
      ? submission.id_verification_data
      : {}
  const addressData = submission.address_data && typeof submission.address_data === 'object' ? submission.address_data : {}

  const profilePhoto = profileData.profilePhotoFile as OnboardingFileMeta | undefined
  const selfieFile = idData.selfieFile as OnboardingFileMeta | undefined
  const frontDoc = idData.frontDocumentFile as OnboardingFileMeta | undefined
  const backDoc = idData.backDocumentFile as OnboardingFileMeta | undefined
  const proofFile = addressData.proofFile as OnboardingFileMeta | undefined

  const skillsAnswers = skillsData.answers as Record<string, string> | undefined

  return (
    <div className="admin-submission-details">
      <section className="admin-detail-section">
        <h4 className="admin-detail-heading">
          <IoPersonOutline /> Profile
        </h4>
        <dl className="admin-detail-dl">
          {profileData.firstName != null && (
            <>
              <dt>First name</dt>
              <dd>{String(profileData.firstName)}</dd>
            </>
          )}
          {profileData.lastName != null && (
            <>
              <dt>Last name</dt>
              <dd>{String(profileData.lastName)}</dd>
            </>
          )}
          {profileData.email != null && (
            <>
              <dt>Email</dt>
              <dd>{String(profileData.email)}</dd>
            </>
          )}
          {profileData.phoneNumber != null && (
            <>
              <dt>Phone</dt>
              <dd>{String(profileData.phoneNumber)}</dd>
            </>
          )}
          {profileData.birthDate != null && (
            <>
              <dt>Date of birth</dt>
              <dd>{String(profileData.birthDate)}</dd>
            </>
          )}
          {profileData.age != null && (
            <>
              <dt>Age</dt>
              <dd>{String(profileData.age)}</dd>
            </>
          )}
          {profileData.gender != null && (
            <>
              <dt>Gender</dt>
              <dd>{String(profileData.gender)}</dd>
            </>
          )}
          {profileData.nationality != null && (
            <>
              <dt>Nationality</dt>
              <dd>{String(profileData.nationality)}</dd>
            </>
          )}
          {profileData.country != null && (
            <>
              <dt>Country</dt>
              <dd>{String(profileData.country)}</dd>
            </>
          )}
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
          {idData.documentType != null && (
            <>
              <dt>Document type</dt>
              <dd>{String(idData.documentType)}</dd>
            </>
          )}
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
          {addressData.streetAddress != null && (
            <>
              <dt>Street</dt>
              <dd>{String(addressData.streetAddress)}</dd>
            </>
          )}
          {addressData.apartment != null && addressData.apartment !== '' && (
            <>
              <dt>Apartment</dt>
              <dd>{String(addressData.apartment)}</dd>
            </>
          )}
          {addressData.city != null && (
            <>
              <dt>City</dt>
              <dd>{String(addressData.city)}</dd>
            </>
          )}
          {addressData.stateOrProvince != null && (
            <>
              <dt>State / Province</dt>
              <dd>{String(addressData.stateOrProvince)}</dd>
            </>
          )}
          {addressData.postalCode != null && (
            <>
              <dt>Postal code</dt>
              <dd>{String(addressData.postalCode)}</dd>
            </>
          )}
          {addressData.country != null && (
            <>
              <dt>Country</dt>
              <dd>{String(addressData.country)}</dd>
            </>
          )}
          {addressData.proofType != null && (
            <>
              <dt>Proof type</dt>
              <dd>{String(addressData.proofType)}</dd>
            </>
          )}
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

/** Full onboarding / KYC payload (same content as onboarding review “view details”). */
export function AdminOnboardingKycPanel({ submission }: { submission: OnboardingSubmission | null }) {
  if (!submission) {
    return <p className="admin-detail-empty">No onboarding submission on file.</p>
  }
  return <AdminSubmissionDetails submission={submission} />
}
