import { type ChangeEvent, useEffect, useMemo, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { HiOutlineMenu, HiOutlineX } from 'react-icons/hi'
import {
  IoArrowBackOutline,
  IoArrowForward,
  IoBookOutline,
  IoCameraOutline,
  IoCardOutline,
  IoCarSportOutline,
  IoCheckmarkCircle,
  IoCheckmarkCircleOutline,
  IoCheckmarkOutline,
  IoCloudUploadOutline,
  IoDocumentTextOutline,
  IoEyeOutline,
  IoLockClosedOutline,
  IoPersonOutline,
  IoShieldCheckmarkOutline,
} from 'react-icons/io5'
import { FiSun } from 'react-icons/fi'
import { useAuth } from '../auth/AuthContext'
import { saveOnboardingStep } from './onboardingApi'
import { type UploadedOnboardingFile, uploadOnboardingFile } from './onboardingStorage'
import { formatLastSavedLabel } from './onboardingTime'
import { SidebarMemberCard } from '../../shared/ui/SidebarMemberCard'

type IdSubStep = 'selfie' | 'document' | 'review'
type DocumentType = 'passport' | 'national-id' | 'drivers-license'

const navItems = ['Onboarding', 'Dashboard', 'Surveys', 'Earnings']

const idSubSteps: { id: IdSubStep; label: string }[] = [
  { id: 'selfie', label: 'Selfie Photo' },
  { id: 'document', label: 'ID Document' },
  { id: 'review', label: 'Review' },
]

export function IdVerificationPage() {
  const navigate = useNavigate()
  const { user, onboarding, refreshUserState } = useAuth()
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [currentSubStep, setCurrentSubStep] = useState<IdSubStep>('selfie')
  const [selfieFile, setSelfieFile] = useState<File | null>(null)
  const [selectedDocumentType, setSelectedDocumentType] = useState<DocumentType>('passport')
  const [frontDocumentFile, setFrontDocumentFile] = useState<File | null>(null)
  const [backDocumentFile, setBackDocumentFile] = useState<File | null>(null)
  const [existingSelfieFile, setExistingSelfieFile] = useState<UploadedOnboardingFile | null>(null)
  const [existingFrontDocumentFile, setExistingFrontDocumentFile] = useState<UploadedOnboardingFile | null>(null)
  const [existingBackDocumentFile, setExistingBackDocumentFile] = useState<UploadedOnboardingFile | null>(null)
  const [reviewConfirmed, setReviewConfirmed] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const currentSubStepIndex = useMemo(
    () => idSubSteps.findIndex((step) => step.id === currentSubStep),
    [currentSubStep],
  )
  const hasSavedIdData = useMemo(
    () =>
      Boolean(onboarding?.id_verification_data && typeof onboarding?.id_verification_data === 'object') &&
      Object.keys(onboarding?.id_verification_data ?? {}).length > 0,
    [onboarding?.id_verification_data],
  )
  const lastSavedLabel = formatLastSavedLabel(onboarding?.updated_at)
  const backSideRequired = selectedDocumentType !== 'passport'
  const selfieUploaded = Boolean(selfieFile) || Boolean(existingSelfieFile)
  const frontDocumentUploaded = Boolean(frontDocumentFile) || Boolean(existingFrontDocumentFile)
  const backDocumentUploaded = Boolean(backDocumentFile) || Boolean(existingBackDocumentFile)
  const documentUploaded = frontDocumentUploaded && (!backSideRequired || backDocumentUploaded)
  const selfiePreviewUrl = useMemo(
    () => (selfieFile && selfieFile.type.startsWith('image/') ? URL.createObjectURL(selfieFile) : ''),
    [selfieFile],
  )
  const frontPreviewUrl = useMemo(
    () =>
      frontDocumentFile && frontDocumentFile.type.startsWith('image/')
        ? URL.createObjectURL(frontDocumentFile)
        : '',
    [frontDocumentFile],
  )
  const backPreviewUrl = useMemo(
    () =>
      backDocumentFile && backDocumentFile.type.startsWith('image/')
        ? URL.createObjectURL(backDocumentFile)
        : '',
    [backDocumentFile],
  )

  useEffect(() => {
    if (!mobileSidebarOpen) return

    document.body.style.overflow = 'hidden'
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileSidebarOpen(false)
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleEscape)
    }
  }, [mobileSidebarOpen])

  useEffect(() => {
    const idData = onboarding?.id_verification_data
    const idRecord = idData && typeof idData === 'object' ? idData : null
    if (!idRecord) return

    const parseUploadedFile = (value: unknown) => {
      if (!value || typeof value !== 'object') return null
      if (!('path' in value) || typeof value.path !== 'string') return null
      return value as UploadedOnboardingFile
    }

    const savedDocumentType = idRecord.documentType
    if (
      typeof savedDocumentType === 'string' &&
      (savedDocumentType === 'passport' ||
        savedDocumentType === 'national-id' ||
        savedDocumentType === 'drivers-license')
    ) {
      setSelectedDocumentType(savedDocumentType)
    }

    const savedReviewConfirmed = idRecord.reviewConfirmed
    if (typeof savedReviewConfirmed === 'boolean') {
      setReviewConfirmed(savedReviewConfirmed)
    }

    setExistingSelfieFile(parseUploadedFile(idRecord.selfieFile))
    setExistingFrontDocumentFile(parseUploadedFile(idRecord.frontDocumentFile))
    setExistingBackDocumentFile(parseUploadedFile(idRecord.backDocumentFile))
  }, [onboarding?.id_verification_data])

  useEffect(() => {
    return () => {
      if (selfiePreviewUrl) URL.revokeObjectURL(selfiePreviewUrl)
    }
  }, [selfiePreviewUrl])

  useEffect(() => {
    return () => {
      if (frontPreviewUrl) URL.revokeObjectURL(frontPreviewUrl)
    }
  }, [frontPreviewUrl])

  useEffect(() => {
    return () => {
      if (backPreviewUrl) URL.revokeObjectURL(backPreviewUrl)
    }
  }, [backPreviewUrl])

  const goToPreviousSubStep = () => {
    if (currentSubStep === 'selfie') {
      navigate('/dashboard/onboarding/skills')
      return
    }
    if (currentSubStep === 'document') {
      setCurrentSubStep('selfie')
      return
    }
    setCurrentSubStep('document')
  }

  const goToNextSubStep = async () => {
    setSubmitError('')
    if (currentSubStep === 'selfie') {
      if (!selfieUploaded) return
      setCurrentSubStep('document')
      return
    }

    if (currentSubStep === 'document') {
      if (!documentUploaded) return
      setCurrentSubStep('review')
      return
    }

    if (!user) {
      setSubmitError('You must be signed in to continue.')
      return
    }
    setSubmitting(true)
    try {
      const uploadedSelfie = selfieFile
        ? await uploadOnboardingFile({
            userId: user.id,
            step: 'id',
            fileKey: 'selfie',
            file: selfieFile,
          })
        : existingSelfieFile
      const uploadedFrontDocument = frontDocumentFile
        ? await uploadOnboardingFile({
            userId: user.id,
            step: 'id',
            fileKey: 'document-front',
            file: frontDocumentFile,
          })
        : existingFrontDocumentFile
      const uploadedBackDocument =
        backSideRequired && backDocumentFile
          ? await uploadOnboardingFile({
              userId: user.id,
              step: 'id',
              fileKey: 'document-back',
              file: backDocumentFile,
            })
          : backSideRequired
            ? existingBackDocumentFile
            : null

      await saveOnboardingStep(user.id, 'id', {
        selfieFile: uploadedSelfie,
        documentType: selectedDocumentType,
        frontDocumentFile: uploadedFrontDocument,
        backDocumentFile: uploadedBackDocument,
        backSideRequired,
        reviewConfirmed,
      })
      await refreshUserState()
      navigate('/dashboard/onboarding/address-verification')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to save ID verification.'
      setSubmitError(message)
    } finally {
      setSubmitting(false)
    }
  }

  const getPrimaryActionText = () => {
    if (currentSubStep === 'selfie') {
      return selfieUploaded ? 'Continue to ID Upload' : 'Upload Selfie'
    }
    if (currentSubStep === 'document') {
      return documentUploaded ? 'Continue to Review' : 'Upload Required Pages'
    }
    return 'Continue to Address Verification'
  }

  const handleSelfieFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0]
    if (!nextFile) return

    const maxSelfieSizeInBytes = 5 * 1024 * 1024
    if (!nextFile.type.startsWith('image/')) {
      setSubmitError('Selfie must be an image file (PNG, JPG, or WEBP).')
      event.target.value = ''
      return
    }
    if (nextFile.size > maxSelfieSizeInBytes) {
      setSubmitError('Selfie file must be 5MB or smaller.')
      event.target.value = ''
      return
    }

    setSubmitError('')
    setSelfieFile(nextFile)
  }

  const handleFrontFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0]
    if (!nextFile) return

    const maxDocumentSizeInBytes = 10 * 1024 * 1024
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']
    if (!allowedTypes.includes(nextFile.type)) {
      setSubmitError('Front document must be JPG, PNG, or PDF.')
      event.target.value = ''
      return
    }
    if (nextFile.size > maxDocumentSizeInBytes) {
      setSubmitError('Front document must be 10MB or smaller.')
      event.target.value = ''
      return
    }

    setSubmitError('')
    setFrontDocumentFile(nextFile)
  }

  const handleBackFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0]
    if (!nextFile) return

    const maxDocumentSizeInBytes = 10 * 1024 * 1024
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']
    if (!allowedTypes.includes(nextFile.type)) {
      setSubmitError('Back document must be JPG, PNG, or PDF.')
      event.target.value = ''
      return
    }
    if (nextFile.size > maxDocumentSizeInBytes) {
      setSubmitError('Back document must be 10MB or smaller.')
      event.target.value = ''
      return
    }

    setSubmitError('')
    setBackDocumentFile(nextFile)
  }

  const formatFileSize = (file: File | null) => {
    if (!file) return ''
    return `${(file.size / (1024 * 1024)).toFixed(1)}MB`
  }
  const documentTypeLabel =
    selectedDocumentType === 'passport'
      ? 'Passport'
      : selectedDocumentType === 'national-id'
        ? 'National ID'
        : "Driver's License"
  const requiredDocumentCount = backSideRequired ? 2 : 1
  const uploadedDocumentCount = frontDocumentUploaded ? (backSideRequired ? (backDocumentUploaded ? 2 : 1) : 1) : 0

  return (
    <section className="onboarding-shell">
      <aside className="onboarding-sidebar">
        <div className="onboarding-logo">
          <span className="brand-icon">S</span>
          <span>SurveyVault</span>
        </div>
        <p className="onboarding-nav-title">Account Setup</p>
        <nav className="onboarding-nav">
          {navItems.map((item, idx) => {
            const isActive = idx === 0
            return (
              <button key={item} className={isActive ? 'onboarding-nav-item active' : 'onboarding-nav-item'}>
                <span>{item}</span>
                {!isActive && <IoLockClosedOutline />}
              </button>
            )
          })}
        </nav>

        <div className="verification-steps-panel">
          <p className="verification-steps-title">Verification Steps</p>
          <button className="verification-step-item">
            <span className="verification-step-count">✓</span>
            Complete Profile
          </button>
          <button className="verification-step-item">
            <span className="verification-step-count">✓</span>
            Skill Verification
          </button>
          <button className="verification-step-item active">
            <span className="verification-step-count">3</span>
            ID Verification
          </button>
          <button className="verification-step-item">
            <span className="verification-step-count">4</span>
            Address Verification
          </button>
        </div>

        <SidebarMemberCard />
      </aside>

      <div className="onboarding-main">
        <header className="onboarding-topbar profile-topbar">
          <button
            type="button"
            className="profile-mobile-menu-btn"
            onClick={() => setMobileSidebarOpen(true)}
            aria-label="Open onboarding menu"
          >
            <HiOutlineMenu />
          </button>
          <div>
            <h2>ID Verification</h2>
            <p>Step 3 of 4 — Identity Check</p>
          </div>
          <div className="profile-topbar-chips">
            <span className="profile-chip step">
              <IoCheckmarkCircleOutline />
              Step 3 of 4
            </span>
            <span className="profile-chip progress">In Progress</span>
          </div>
        </header>

        <div className="onboarding-content profile-content">
          <article className="profile-progress-card">
            <div className="profile-progress-head">
              <span>Account Verification Progress</span>
              <strong>75% Done</strong>
            </div>
            <p className="profile-progress-desc">Complete all 4 steps to unlock your dashboard</p>
            <div className="profile-progress-bar">
              <div style={{ width: '75%' }} />
            </div>
            <div className="profile-stepper skill-stepper">
              <div className="profile-stepper-line" />
              <div className="profile-stepper-line active" style={{ width: '75%' }} />
              <div className="profile-stepper-item complete">
                <span>
                  <IoCheckmarkCircle />
                </span>
                <small>Profile</small>
              </div>
              <div className="profile-stepper-item complete">
                <span>
                  <IoCheckmarkCircle />
                </span>
                <small>Skills</small>
              </div>
              <div className="profile-stepper-item active">
                <span>3</span>
                <small>ID Verify</small>
              </div>
              <div className="profile-stepper-item">
                <span>4</span>
                <small>Address</small>
              </div>
            </div>
          </article>

          <article className="profile-form-card id-verification-card">
            <header className="profile-card-header id-substeps-header">
              <div className="bio-data-icon skill-icon">
                <IoDocumentTextOutline />
              </div>
              <div>
                <h3>ID Verification - Sub-steps</h3>
                <p>Complete all 3 sub-steps to verify your identity</p>
              </div>
            </header>
            {hasSavedIdData && (
              <p className="onboarding-saved-hint">
                Saved from previous submission. Uploaded details were restored.
                {lastSavedLabel ? ` ${lastSavedLabel}.` : ''}
              </p>
            )}

            <div className="id-substeps">
              {idSubSteps.map((step, index) => {
                const isActive = step.id === currentSubStep
                const isDone = index < currentSubStepIndex
                return (
                  <button
                    key={step.id}
                    type="button"
                    className={isActive ? 'id-substep-btn active' : isDone ? 'id-substep-btn done' : 'id-substep-btn'}
                    onClick={() => setCurrentSubStep(step.id)}
                  >
                    <span>{index + 1}</span>
                    {step.label}
                  </button>
                )
              })}
            </div>

            <div className="id-action-panel">
              <div className="id-action-heading">
                <span className="id-action-heading-icon">
                  {currentSubStep === 'selfie' ? (
                    <IoCameraOutline />
                  ) : currentSubStep === 'document' ? (
                    <IoDocumentTextOutline />
                  ) : (
                    <IoEyeOutline />
                  )}
                </span>
                <div>
                  <p className="id-action-title">
                    {currentSubStep === 'selfie'
                      ? 'Upload Your Selfie'
                      : currentSubStep === 'document'
                        ? 'Upload Your ID Document'
                        : 'Review & Submit'}{' '}
                    {(currentSubStep === 'document' || currentSubStep === 'review') && (
                      <span className="id-substep-pill">
                        {currentSubStep === 'document' ? 'Sub-step 2 of 3' : 'Sub-step 3 of 3'}
                      </span>
                    )}
                  </p>
                  <small className="id-action-subtitle">
                    {currentSubStep === 'selfie'
                      ? 'Upload a clear selfie with your full face visible'
                      : currentSubStep === 'document'
                        ? 'Select your document type and upload both sides'
                        : 'Confirm your uploaded documents before submitting'}
                  </small>
                </div>
              </div>

              {currentSubStep === 'selfie' ? (
                <div className="id-selfie-upload-row">
                  <div className="id-selfie-avatar-box">
                    <IoPersonOutline />
                    <button type="button" className="id-selfie-camera-badge" aria-label="Upload selfie">
                      <IoCameraOutline />
                    </button>
                  </div>
                  <label className="id-selfie-dropzone" htmlFor="selfie-upload-input">
                    <IoCloudUploadOutline />
                    <p>{selfieUploaded ? 'Selfie uploaded successfully' : 'Click to upload or drag &amp; drop'}</p>
                    <small>PNG, JPG or WEBP · Max 5MB · Min 200x200px</small>
                    {(selfieFile || existingSelfieFile) && (
                      <span className="id-upload-file-name">
                        {selfieFile?.name ?? existingSelfieFile?.originalName}
                      </span>
                    )}
                    <input
                      id="selfie-upload-input"
                      className="file-input-hidden"
                      type="file"
                      accept=".png,.jpg,.jpeg,.webp"
                      onChange={handleSelfieFileChange}
                    />
                  </label>
                </div>
              ) : currentSubStep === 'document' ? (
                <div className="id-document-panel">
                  <p className="id-doc-section-title">Select Document Type</p>
                  <div className="id-doc-type-grid">
                    <button
                      type="button"
                      className={selectedDocumentType === 'passport' ? 'id-doc-type-card active' : 'id-doc-type-card'}
                      onClick={() => setSelectedDocumentType('passport')}
                    >
                      {selectedDocumentType === 'passport' && (
                        <span className="id-doc-card-selected-badge">
                          <IoCheckmarkCircle />
                        </span>
                      )}
                      <span className="id-doc-card-icon">
                        <IoBookOutline />
                      </span>
                      <strong>Passport</strong>
                      <small>International travel document</small>
                      <div className="id-doc-card-tags">
                        <span className="id-doc-tag neutral">Front only</span>
                        <span className="id-doc-tag success">Widely accepted</span>
                      </div>
                    </button>
                    <button
                      type="button"
                      className={selectedDocumentType === 'national-id' ? 'id-doc-type-card active' : 'id-doc-type-card'}
                      onClick={() => setSelectedDocumentType('national-id')}
                    >
                      {selectedDocumentType === 'national-id' && (
                        <span className="id-doc-card-selected-badge">
                          <IoCheckmarkCircle />
                        </span>
                      )}
                      <span className="id-doc-card-icon">
                        <IoCardOutline />
                      </span>
                      <strong>National ID</strong>
                      <small>Government-issued national card</small>
                      <div className="id-doc-card-tags">
                        <span className="id-doc-tag neutral">Front &amp; Back</span>
                        <span className="id-doc-tag primary">Most common</span>
                      </div>
                    </button>
                    <button
                      type="button"
                      className={selectedDocumentType === 'drivers-license' ? 'id-doc-type-card active' : 'id-doc-type-card'}
                      onClick={() => setSelectedDocumentType('drivers-license')}
                    >
                      {selectedDocumentType === 'drivers-license' && (
                        <span className="id-doc-card-selected-badge">
                          <IoCheckmarkCircle />
                        </span>
                      )}
                      <span className="id-doc-card-icon">
                        <IoCarSportOutline />
                      </span>
                      <strong>Driver&apos;s License</strong>
                      <small>State or country-issued license</small>
                      <div className="id-doc-card-tags">
                        <span className="id-doc-tag neutral">Front &amp; Back</span>
                        <span className="id-doc-tag purple">Also accepted</span>
                      </div>
                    </button>
                  </div>

                  <p className="id-doc-section-title">Upload Document Pages</p>
                  <div className="id-doc-upload-grid">
                    <div className={frontDocumentUploaded ? 'id-doc-upload-box uploaded' : 'id-doc-upload-box'}>
                      <p>
                        <span>1</span> Front Side <strong>Required</strong>
                      </p>
                      <label className="id-doc-dropzone" htmlFor="id-front-upload-input">
                        <IoCloudUploadOutline />
                        <h4>{frontDocumentUploaded ? 'Front side uploaded' : 'Drop front side here'}</h4>
                        <small>JPG, PNG, PDF - Max 10MB</small>
                        {(frontDocumentFile || existingFrontDocumentFile) && (
                          <span className="id-upload-file-name">
                            {frontDocumentFile?.name ?? existingFrontDocumentFile?.originalName}
                          </span>
                        )}
                        {frontDocumentUploaded && <span className="id-uploaded-indicator">Uploaded</span>}
                        <input
                          id="id-front-upload-input"
                          className="file-input-hidden"
                          type="file"
                          accept=".jpg,.jpeg,.png,.pdf"
                          onChange={handleFrontFileChange}
                        />
                      </label>
                    </div>

                    <div className={backDocumentUploaded ? 'id-doc-upload-box uploaded' : 'id-doc-upload-box'}>
                      <p>
                        <span>2</span> Back Side{' '}
                        <strong>{backSideRequired ? 'Required' : 'Not required for passport'}</strong>
                      </p>
                      <label
                        className={
                          backSideRequired ? 'id-doc-dropzone' : 'id-doc-dropzone is-disabled'
                        }
                        htmlFor="id-back-upload-input"
                      >
                        <IoCloudUploadOutline />
                        <h4>
                          {backSideRequired
                            ? backDocumentUploaded
                              ? 'Back side uploaded'
                              : 'Drop back side here'
                            : 'Back side not required'}
                        </h4>
                        <small>JPG, PNG, PDF - Max 10MB</small>
                        {(backDocumentFile || existingBackDocumentFile) && (
                          <span className="id-upload-file-name">
                            {backDocumentFile?.name ?? existingBackDocumentFile?.originalName}
                          </span>
                        )}
                        {backDocumentUploaded && backSideRequired && (
                          <span className="id-uploaded-indicator">Uploaded</span>
                        )}
                        {backSideRequired && (
                          <input
                            id="id-back-upload-input"
                            className="file-input-hidden"
                            type="file"
                            accept=".jpg,.jpeg,.png,.pdf"
                            onChange={handleBackFileChange}
                          />
                        )}
                      </label>
                    </div>
                  </div>

                  <div className="id-doc-upload-progress">
                    <span>
                      {uploadedDocumentCount}/{requiredDocumentCount} required file
                      {requiredDocumentCount > 1 ? 's' : ''} uploaded
                    </span>
                    <strong>{documentUploaded ? 'Ready for review' : 'Upload all required files'}</strong>
                  </div>

                  <div className="id-doc-requirements">
                    <p>Accepted Document Requirements</p>
                    <ul>
                      <li>
                        <IoCheckmarkOutline /> Government-issued only
                      </li>
                      <li>
                        <IoCheckmarkOutline /> Not expired
                      </li>
                      <li>
                        <IoCheckmarkOutline /> All text clearly visible
                      </li>
                      <li>
                        <IoCheckmarkOutline /> No glare or shadows
                      </li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="id-document-review-panel">
                  <p className="id-doc-section-title">
                    Review &amp; Submit <span>Sub-step 3 of 3</span>
                  </p>

                  <div className="id-review-summary-strip">
                    <span>
                      <IoCheckmarkCircleOutline /> Document Type: {documentTypeLabel}
                    </span>
                    <strong>
                      {backSideRequired ? '3 uploads expected' : '2 uploads expected'}
                    </strong>
                  </div>

                  <article className="id-review-file-card">
                    <div className="id-review-file-head">
                      <p>
                        <IoCheckmarkOutline />
                        Selfie Photo
                      </p>
                      <span>Verified</span>
                    </div>
                    <div className="id-review-file-body">
                      <div className="id-review-thumb">
                        {selfiePreviewUrl ? <img src={selfiePreviewUrl} alt="Uploaded selfie preview" /> : <IoPersonOutline />}
                      </div>
                      <div>
                        <strong>{selfieFile?.name ?? existingSelfieFile?.originalName ?? 'No selfie uploaded'}</strong>
                        <small>
                          Captured · {formatFileSize(selfieFile) || '0.0MB'} · Face detected
                        </small>
                      </div>
                      <button
                        type="button"
                        className="id-review-file-link"
                        onClick={() => {
                          setSelfieFile(null)
                          setReviewConfirmed(false)
                          setCurrentSubStep('selfie')
                        }}
                      >
                        Retake
                      </button>
                    </div>
                  </article>

                  <article className="id-review-file-card">
                    <div className="id-review-file-head">
                      <p>
                        <IoCheckmarkOutline />
                        ID Front Side
                      </p>
                      <span>Uploaded</span>
                    </div>
                    <div className="id-review-file-body">
                      <div className="id-review-thumb">
                        {frontPreviewUrl ? <img src={frontPreviewUrl} alt="Uploaded ID front preview" /> : <IoDocumentTextOutline />}
                      </div>
                      <div>
                        <strong>
                          {frontDocumentFile?.name ??
                            existingFrontDocumentFile?.originalName ??
                            'No front side uploaded'}
                        </strong>
                        <small>
                          {selectedDocumentType === 'passport'
                            ? 'Passport'
                            : selectedDocumentType === 'national-id'
                              ? 'National ID'
                              : "Driver's License"}{' '}
                          · {formatFileSize(frontDocumentFile) || '0.0MB'} · Clear
                        </small>
                      </div>
                      <button
                        type="button"
                        className="id-review-file-link danger"
                        onClick={() => {
                          setFrontDocumentFile(null)
                          setReviewConfirmed(false)
                          setCurrentSubStep('document')
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </article>

                  {backSideRequired && (
                    <article className="id-review-file-card">
                      <div className="id-review-file-head">
                        <p>
                          <IoCheckmarkOutline />
                          ID Back Side
                        </p>
                        <span>Uploaded</span>
                      </div>
                      <div className="id-review-file-body">
                        <div className="id-review-thumb">
                          {backPreviewUrl ? <img src={backPreviewUrl} alt="Uploaded ID back preview" /> : <IoDocumentTextOutline />}
                        </div>
                        <div>
                          <strong>
                            {backDocumentFile?.name ??
                              existingBackDocumentFile?.originalName ??
                              'No back side uploaded'}
                          </strong>
                          <small>
                            Back side · {formatFileSize(backDocumentFile) || '0.0MB'} · Clear
                          </small>
                        </div>
                        <button
                          type="button"
                          className="id-review-file-link danger"
                          onClick={() => {
                            setBackDocumentFile(null)
                            setReviewConfirmed(false)
                            setCurrentSubStep('document')
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </article>
                  )}

                  <label className="id-review-confirm">
                    <input
                      type="checkbox"
                      checked={reviewConfirmed}
                      onChange={(event) => setReviewConfirmed(event.target.checked)}
                    />
                    <span>
                      <strong>I confirm the documents are authentic</strong>
                      <small>
                        I certify that the uploaded documents are genuine, unaltered, and belong to me.
                        I understand that submitting false documents may result in account termination.
                      </small>
                    </span>
                  </label>
                </div>
              )}

            </div>
          </article>

          <article className="profile-form-card id-tips-card">
            <header className="profile-card-header id-tips-head">
              <FiSun />
              <div>
                <h3>Tips for a Great Selfie</h3>
              </div>
            </header>

            <div className="id-tips-grid">
              <article className="id-tip">
                <h4>Good Lighting</h4>
                <p>Face a natural light source. Avoid harsh shadows or backlit environments.</p>
                <small>Natural or soft light</small>
              </article>
              <article className="id-tip">
                <h4>Face Centered</h4>
                <p>Keep your face fully visible and look directly at the camera.</p>
                <small>Eyes visible & forward</small>
              </article>
              <article className="id-tip">
                <h4>No Glasses</h4>
                <p>Remove glasses, hats, or anything covering your face for best results.</p>
                <small>Avoid obstructions</small>
              </article>
            </div>
          </article>

          <div className="privacy-notice skill-note">
            <IoShieldCheckmarkOutline />
            <p>
              <strong>Your privacy is protected</strong>
              <span className="privacy-note-copy">
                Your selfie is encrypted and used only for identity verification. It will never be shared
                with third parties.
              </span>
            </p>
          </div>

          <div className="id-footer-actions">
            <button type="button" className="profile-secondary-action" onClick={goToPreviousSubStep}>
              <IoArrowBackOutline /> Back
            </button>
            <button
              type="button"
              className={
                (currentSubStep === 'selfie' && !selfieUploaded) ||
                (currentSubStep === 'document' && !documentUploaded) ||
                (currentSubStep === 'review' && !reviewConfirmed) ||
                submitting
                  ? 'step-action disabled'
                  : 'step-action'
              }
              onClick={goToNextSubStep}
              disabled={
                (currentSubStep === 'selfie' && !selfieUploaded) ||
                (currentSubStep === 'document' && !documentUploaded) ||
                (currentSubStep === 'review' && !reviewConfirmed) ||
                submitting
              }
            >
              {submitting ? 'Saving...' : getPrimaryActionText()} <IoArrowForward />
            </button>
          </div>
          {submitError && <p className="field-error">{submitError}</p>}
        </div>
      </div>

      <div
        className={mobileSidebarOpen ? 'onboarding-mobile-overlay open' : 'onboarding-mobile-overlay'}
        onClick={() => setMobileSidebarOpen(false)}
        role="button"
        tabIndex={0}
        aria-label="Close onboarding menu"
      />

      <aside className={mobileSidebarOpen ? 'onboarding-mobile-sidebar open' : 'onboarding-mobile-sidebar'}>
        <div className="onboarding-mobile-sidebar-head">
          <span className="brand-text">Dashboard Menu</span>
          <button
            type="button"
            className="onboarding-mobile-close-btn"
            onClick={() => setMobileSidebarOpen(false)}
            aria-label="Close onboarding menu"
          >
            <HiOutlineX />
          </button>
        </div>

        <nav className="onboarding-mobile-nav">
          <NavLink
            to="/dashboard/onboarding"
            className={({ isActive }) => (isActive ? 'onboarding-mobile-link active' : 'onboarding-mobile-link')}
            onClick={() => setMobileSidebarOpen(false)}
          >
            Onboarding
          </NavLink>
          <NavLink
            to="/dashboard/earnings"
            className={({ isActive }) => (isActive ? 'onboarding-mobile-link active' : 'onboarding-mobile-link')}
            onClick={() => setMobileSidebarOpen(false)}
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/dashboard/surveys"
            className={({ isActive }) => (isActive ? 'onboarding-mobile-link active' : 'onboarding-mobile-link')}
            onClick={() => setMobileSidebarOpen(false)}
          >
            Surveys
          </NavLink>
          <NavLink
            to="/dashboard/earnings"
            className={({ isActive }) => (isActive ? 'onboarding-mobile-link active' : 'onboarding-mobile-link')}
            onClick={() => setMobileSidebarOpen(false)}
          >
            Earnings
          </NavLink>
        </nav>
      </aside>
    </section>
  )
}
