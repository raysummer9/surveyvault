import { type ChangeEvent, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  IoArrowBackOutline,
  IoArrowForward,
  IoCheckmarkCircle,
  IoCheckmarkCircleOutline,
  IoChevronDownOutline,
  IoCloudUploadOutline,
  IoHomeOutline,
  IoLocateOutline,
  IoShieldCheckmarkOutline,
} from 'react-icons/io5'
import { CountrySelectModal } from './CountrySelectModal'
import { useAuth } from '../auth/AuthContext'
import { saveOnboardingStep } from './onboardingApi'
import { type UploadedOnboardingFile, uploadOnboardingFile } from './onboardingStorage'
import { formatLastSavedLabel } from './onboardingTime'
import { AppSidebarLayout } from '../../shared/ui/AppSidebarLayout'
import { OnboardingTopbar } from '../../shared/ui/OnboardingTopbar'

type AddressFormValues = {
  country: string
  streetAddress: string
  apartment: string
  city: string
  stateOrProvince: string
  postalCode: string
  proofType: string
}

type AddressFormErrors = Partial<Record<keyof AddressFormValues | 'proofFile' | 'consent', string>>

const proofTypeOptions = [
  'Utility Bill (within last 3 months)',
  'Bank Statement (within last 3 months)',
  'Rental Agreement',
  'Government Correspondence',
]

export function AddressVerificationPage() {
  const navigate = useNavigate()
  const { user, onboarding, refreshUserState } = useAuth()
  const [countryModalOpen, setCountryModalOpen] = useState(false)
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [existingProofFile, setExistingProofFile] = useState<UploadedOnboardingFile | null>(null)
  const [consentChecked, setConsentChecked] = useState(false)
  const [errors, setErrors] = useState<AddressFormErrors>({})
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [completionToastOpen, setCompletionToastOpen] = useState(false)
  const [values, setValues] = useState<AddressFormValues>({
    country: '',
    streetAddress: '',
    apartment: '',
    city: '',
    stateOrProvince: '',
    postalCode: '',
    proofType: '',
  })

  const proofUploaded = Boolean(proofFile) || Boolean(existingProofFile)
  const hasSavedAddressData =
    Boolean(onboarding?.address_data && typeof onboarding?.address_data === 'object') &&
    Object.keys(onboarding?.address_data ?? {}).length > 0
  const lastSavedLabel = formatLastSavedLabel(onboarding?.updated_at)
  const canSubmit =
    Boolean(values.country.trim()) &&
    Boolean(values.streetAddress.trim()) &&
    Boolean(values.city.trim()) &&
    Boolean(values.stateOrProvince.trim()) &&
    Boolean(values.postalCode.trim()) &&
    Boolean(values.proofType.trim()) &&
    proofUploaded &&
    consentChecked
  const proofPreviewName = proofFile?.name ?? existingProofFile?.originalName ?? 'No file uploaded'
  const proofFileSize = useMemo(() => {
    if (proofFile) return `${(proofFile.size / (1024 * 1024)).toFixed(1)}MB`
    if (existingProofFile?.sizeBytes) return `${(existingProofFile.sizeBytes / (1024 * 1024)).toFixed(1)}MB`
    return '0.0MB'
  }, [proofFile, existingProofFile])

  useEffect(() => {
    if (!completionToastOpen) return
    const timer = window.setTimeout(() => {
      setCompletionToastOpen(false)
      navigate('/dashboard/onboarding')
    }, 2600)
    return () => window.clearTimeout(timer)
  }, [completionToastOpen, navigate])

  useEffect(() => {
    const addressData = onboarding?.address_data
    const addressRecord = addressData && typeof addressData === 'object' ? addressData : null
    if (!addressRecord) return

    const readString = (key: keyof AddressFormValues) => {
      const value = addressRecord[key]
      return typeof value === 'string' ? value : ''
    }

    setValues((prev) => ({
      country: prev.country.trim() ? prev.country : readString('country'),
      streetAddress: prev.streetAddress.trim() ? prev.streetAddress : readString('streetAddress'),
      apartment: prev.apartment.trim() ? prev.apartment : readString('apartment'),
      city: prev.city.trim() ? prev.city : readString('city'),
      stateOrProvince: prev.stateOrProvince.trim() ? prev.stateOrProvince : readString('stateOrProvince'),
      postalCode: prev.postalCode.trim() ? prev.postalCode : readString('postalCode'),
      proofType: prev.proofType.trim() ? prev.proofType : readString('proofType'),
    }))

    const savedConsent = addressRecord.consentChecked
    if (typeof savedConsent === 'boolean') {
      setConsentChecked((prev) => (prev ? prev : savedConsent))
    }

    const savedProof = addressRecord.proofFile
    if (
      savedProof &&
      typeof savedProof === 'object' &&
      'path' in savedProof &&
      typeof savedProof.path === 'string'
    ) {
      setExistingProofFile(savedProof as UploadedOnboardingFile)
    }
  }, [onboarding?.address_data])

  const setFieldValue = <T extends keyof AddressFormValues>(field: T, value: AddressFormValues[T]) => {
    setValues((previous) => ({ ...previous, [field]: value }))
    setErrors((previous) => ({ ...previous, [field]: undefined }))
  }

  const handleProofFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0]
    if (!nextFile) return

    const maxProofSizeInBytes = 10 * 1024 * 1024
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png']
    if (!allowedTypes.includes(nextFile.type)) {
      setSubmitError('Proof of address must be a PDF, JPG, or PNG file.')
      event.target.value = ''
      return
    }
    if (nextFile.size > maxProofSizeInBytes) {
      setSubmitError('Proof of address file must be 10MB or smaller.')
      event.target.value = ''
      return
    }

    setSubmitError('')
    setProofFile(nextFile)
    setErrors((previous) => ({ ...previous, proofFile: undefined }))
  }

  const validateAddressStep = () => {
    const nextErrors: AddressFormErrors = {}
    if (!values.country.trim()) nextErrors.country = 'Country is required.'
    if (!values.streetAddress.trim()) nextErrors.streetAddress = 'Street address is required.'
    if (!values.city.trim()) nextErrors.city = 'City is required.'
    if (!values.stateOrProvince.trim()) nextErrors.stateOrProvince = 'State/Province is required.'
    if (!values.postalCode.trim()) nextErrors.postalCode = 'Postal code is required.'
    if (!values.proofType.trim()) nextErrors.proofType = 'Select a proof document type.'
    if (!proofFile) nextErrors.proofFile = 'Upload one proof of address document.'
    if (!consentChecked) nextErrors.consent = 'You must confirm this information is accurate.'

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async () => {
    setSubmitError('')
    if (!validateAddressStep()) return
    if (!user) {
      setSubmitError('You must be signed in to continue.')
      return
    }
    setSubmitting(true)
    try {
      const uploadedProofFile = proofFile
        ? await uploadOnboardingFile({
            userId: user.id,
            step: 'address',
            fileKey: 'proof-of-address',
            file: proofFile,
          })
        : existingProofFile

      await saveOnboardingStep(user.id, 'address', {
        ...values,
        proofFile: uploadedProofFile,
        consentChecked,
      })
      await refreshUserState()
      setCompletionToastOpen(true)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to save address verification.'
      setSubmitError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
    <AppSidebarLayout>
      <OnboardingTopbar
        title="Address Verification"
        subtitle="Step 4 of 4 — Address Check"
        chips={
          <>
            <span className="profile-chip step">
              <IoCheckmarkCircleOutline />
              Step 4 of 4
            </span>
            <span className="profile-chip progress">Final Step</span>
          </>
        }
      />
      <div className="onboarding-content profile-content">
          <article className="profile-progress-card">
            <div className="profile-progress-head">
              <span>Account Verification Progress</span>
              <strong>75% Done</strong>
            </div>
            <p className="profile-progress-desc">Complete this final step to unlock your dashboard and workforce access</p>
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
              <div className="profile-stepper-item complete">
                <span>
                  <IoCheckmarkCircle />
                </span>
                <small>ID Verify</small>
              </div>
              <div className="profile-stepper-item active">
                <span>4</span>
                <small>Address</small>
              </div>
            </div>
          </article>

          <article className="profile-form-card address-verification-card">
            <header className="profile-card-header address-card-header">
              <div className="bio-data-icon skill-icon">
                <IoLocateOutline />
              </div>
              <div>
                <h3>Address Verification</h3>
                <p>Enter your residential details and upload one valid proof of address</p>
              </div>
            </header>
            {hasSavedAddressData && (
              <p className="onboarding-saved-hint">
                Saved from previous submission. Your address details were restored.
                {lastSavedLabel ? ` ${lastSavedLabel}.` : ''}
              </p>
            )}

            <form
              className="profile-form address-form"
              onSubmit={(event) => {
                event.preventDefault()
                handleSubmit()
              }}
              noValidate
            >
              <div className="address-grid">
                <div>
                  <label htmlFor="address-country">
                    Country of Residence <span className="required-asterisk">*</span>
                  </label>
                  <button
                    type="button"
                    id="address-country"
                    className={errors.country ? 'input-wrap select-trigger input-wrap-error' : 'input-wrap select-trigger'}
                    onClick={() => setCountryModalOpen(true)}
                  >
                    <span className="input-icon">
                      <IoLocateOutline />
                    </span>
                    <input value={values.country} placeholder="Select country" readOnly />
                  </button>
                  {errors.country && <small className="form-error">{errors.country}</small>}
                </div>

                <div>
                  <label htmlFor="address-postal">
                    Postal Code <span className="required-asterisk">*</span>
                  </label>
                  <div className={errors.postalCode ? 'input-wrap input-wrap-error' : 'input-wrap'}>
                    <input
                      id="address-postal"
                      type="text"
                      value={values.postalCode}
                      onChange={(event) => setFieldValue('postalCode', event.target.value)}
                      placeholder="Enter postal code"
                    />
                  </div>
                  {errors.postalCode && <small className="form-error">{errors.postalCode}</small>}
                </div>

                <div className="address-grid-span-two">
                  <label htmlFor="address-line1">
                    Street Address <span className="required-asterisk">*</span>
                  </label>
                  <div className={errors.streetAddress ? 'input-wrap input-wrap-error' : 'input-wrap'}>
                    <input
                      id="address-line1"
                      type="text"
                      value={values.streetAddress}
                      onChange={(event) => setFieldValue('streetAddress', event.target.value)}
                      placeholder="House number, street name"
                    />
                  </div>
                  {errors.streetAddress && <small className="form-error">{errors.streetAddress}</small>}
                </div>

                <div className="address-grid-span-two">
                  <label htmlFor="address-line2">Apartment / Unit (optional)</label>
                  <div className="input-wrap">
                    <input
                      id="address-line2"
                      type="text"
                      value={values.apartment}
                      onChange={(event) => setFieldValue('apartment', event.target.value)}
                      placeholder="Apartment, suite, floor"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="address-city">
                    City <span className="required-asterisk">*</span>
                  </label>
                  <div className={errors.city ? 'input-wrap input-wrap-error' : 'input-wrap'}>
                    <input
                      id="address-city"
                      type="text"
                      value={values.city}
                      onChange={(event) => setFieldValue('city', event.target.value)}
                      placeholder="Enter city"
                    />
                  </div>
                  {errors.city && <small className="form-error">{errors.city}</small>}
                </div>

                <div>
                  <label htmlFor="address-state">
                    State / Province <span className="required-asterisk">*</span>
                  </label>
                  <div className={errors.stateOrProvince ? 'input-wrap input-wrap-error' : 'input-wrap'}>
                    <input
                      id="address-state"
                      type="text"
                      value={values.stateOrProvince}
                      onChange={(event) => setFieldValue('stateOrProvince', event.target.value)}
                      placeholder="Enter state or province"
                    />
                  </div>
                  {errors.stateOrProvince && <small className="form-error">{errors.stateOrProvince}</small>}
                </div>
              </div>

              <div className="address-upload-card">
                <p className="address-upload-title">
                  Proof of Address <span className="required-asterisk">*</span>
                </p>

                <div>
                  <label htmlFor="proof-type-select">
                    Document Type <span className="required-asterisk">*</span>
                  </label>
                  <div className={errors.proofType ? 'input-wrap address-select-wrap input-wrap-error' : 'input-wrap address-select-wrap'}>
                    <span className="input-icon">
                      <IoHomeOutline />
                    </span>
                    <select
                      id="proof-type-select"
                      className="address-select"
                      value={values.proofType}
                      onChange={(event) => setFieldValue('proofType', event.target.value)}
                    >
                      <option value="">Select proof type</option>
                      {proofTypeOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <span className="address-select-caret" aria-hidden="true">
                      <IoChevronDownOutline />
                    </span>
                  </div>
                  {errors.proofType && <small className="form-error">{errors.proofType}</small>}
                </div>

                <label className={errors.proofFile ? 'address-upload-dropzone input-wrap-error' : 'address-upload-dropzone'} htmlFor="address-proof-upload">
                  <IoCloudUploadOutline />
                  <p>{proofUploaded ? 'Proof document uploaded' : 'Click to upload or drag and drop'}</p>
                  <small>PDF, JPG, PNG - Max 10MB - Issued within the last 3 months</small>
                  <span className="id-upload-file-name">{proofPreviewName}</span>
                  <span className="address-upload-size">{proofFileSize}</span>
                  <input
                    id="address-proof-upload"
                    className="file-input-hidden"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleProofFileChange}
                  />
                </label>
                {errors.proofFile && <small className="form-error">{errors.proofFile}</small>}
              </div>

              <label className={errors.consent ? 'address-confirm-box input-wrap-error' : 'address-confirm-box'}>
                <input
                  type="checkbox"
                  checked={consentChecked}
                  onChange={(event) => {
                    setConsentChecked(event.target.checked)
                    setErrors((previous) => ({ ...previous, consent: undefined }))
                  }}
                />
                <span>
                  <strong>I confirm this address information is accurate</strong>
                  <small>
                    I understand that inaccurate address details may delay verification and payout processing.
                  </small>
                </span>
              </label>
              {errors.consent && <small className="form-error">{errors.consent}</small>}

              <div className="profile-footer-actions address-footer-actions">
                <button type="button" className="profile-secondary-action" onClick={() => navigate('/dashboard/onboarding/id-verification')}>
                  <IoArrowBackOutline /> Back
                </button>
                <p className="profile-next-step">Final step before unlocking your dashboard</p>
                <button
                  type="submit"
                  className={canSubmit && !submitting && !completionToastOpen ? 'step-action' : 'step-action disabled'}
                  disabled={!canSubmit || submitting || completionToastOpen}
                >
                  {submitting ? 'Submitting...' : 'Complete Verification'} <IoArrowForward />
                </button>
              </div>
              {submitError && <p className="field-error">{submitError}</p>}
            </form>
          </article>

          <div className="privacy-notice skill-note">
            <IoShieldCheckmarkOutline />
            <p>
              <strong>Address data is secured</strong>
              <span className="privacy-note-copy">
                Your address details and proof document are encrypted and used only for compliance and payment verification.
              </span>
            </p>
          </div>
        </div>
    </AppSidebarLayout>

      <CountrySelectModal
        isOpen={countryModalOpen}
        title="Select Country of Residence"
        selectedCountry={values.country}
        onClose={() => setCountryModalOpen(false)}
        onSelect={(country) => {
          setFieldValue('country', country)
          setCountryModalOpen(false)
        }}
      />

      {completionToastOpen && (
        <div className="logout-toast-overlay">
          <div className="logout-toast onboarding-complete-toast">
            <h4>Onboarding Submitted</h4>
            <p>
              Your onboarding has been submitted successfully. Once accepted, you can join our
              workforce and start taking paid opportunities.
            </p>
            <div className="logout-toast-actions">
              <button
                type="button"
                className="logout-toast-confirm"
                onClick={() => {
                  setCompletionToastOpen(false)
                  navigate('/dashboard/onboarding')
                }}
              >
                Go to Onboarding
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

