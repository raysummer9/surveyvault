import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { HiOutlineMenu, HiOutlineX } from 'react-icons/hi'
import {
  IoArrowForward,
  IoCalendarOutline,
  IoCameraOutline,
  IoCheckmarkCircleOutline,
  IoChevronDownOutline,
  IoCloudUploadOutline,
  IoFemaleOutline,
  IoFlagOutline,
  IoMailOutline,
  IoMaleOutline,
  IoPersonOutline,
  IoPhonePortraitOutline,
  IoShieldCheckmarkOutline,
  IoTransgenderOutline,
} from 'react-icons/io5'
import { z } from 'zod'

import { CountrySelectModal } from './CountrySelectModal'

type CountryField = 'nationality' | 'country'

const completeProfileSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required.'),
  lastName: z.string().trim().min(1, 'Last name is required.'),
  email: z.string().email('Please enter a valid email address.'),
  phoneNumber: z.string().trim().min(1, 'Phone number is required.'),
  birthDate: z.string().trim().min(1, 'Date of birth is required.'),
  gender: z.string().trim().min(1, 'Gender is required.'),
  nationality: z.string().trim().min(1, 'Nationality is required.'),
  country: z.string().trim().min(1, 'Country of residence is required.'),
})

function calculateAgeFromDateOfBirth(dateOfBirth: string) {
  if (!dateOfBirth) return ''

  const [yearStr, monthStr, dayStr] = dateOfBirth.split('-')
  const year = Number(yearStr)
  const month = Number(monthStr)
  const day = Number(dayStr)

  if (!year || !month || !day) return ''

  const today = new Date()
  let age = today.getFullYear() - year
  const hasHadBirthdayThisYear =
    today.getMonth() + 1 > month || (today.getMonth() + 1 === month && today.getDate() >= day)

  if (!hasHadBirthdayThisYear) {
    age -= 1
  }

  if (age < 0 || age > 120) return ''
  return String(age)
}

function formatDateForInput(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function CompleteProfilePage() {
  const navigate = useNavigate()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [gender, setGender] = useState('Male')
  const [nationality, setNationality] = useState('')
  const [country, setCountry] = useState('')
  const [countryField, setCountryField] = useState<CountryField | null>(null)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{
    firstName?: string
    lastName?: string
    email?: string
    phoneNumber?: string
    birthDate?: string
    gender?: string
    nationality?: string
    country?: string
  }>({})

  const isCountryModalOpen = countryField !== null
  const calculatedAge = calculateAgeFromDateOfBirth(birthDate)
  const maxBirthDate = formatDateForInput(new Date())

  const handleSaveContinue = () => {
    const parsed = completeProfileSchema.safeParse({
      firstName,
      lastName,
      email,
      phoneNumber,
      birthDate,
      gender,
      nationality,
      country,
    })

    if (!parsed.success) {
      const nextErrors: {
        firstName?: string
        lastName?: string
        email?: string
        phoneNumber?: string
        birthDate?: string
        gender?: string
        nationality?: string
        country?: string
      } = {}

      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0]
        if (
          field === 'firstName' ||
          field === 'lastName' ||
          field === 'email' ||
          field === 'phoneNumber' ||
          field === 'birthDate' ||
          field === 'gender' ||
          field === 'nationality' ||
          field === 'country'
        ) {
          nextErrors[field] = issue.message
        }
      })

      setFieldErrors(nextErrors)
      return
    }

    setFieldErrors({})
    navigate('/dashboard/onboarding')
  }

  const openCountryModal = (field: CountryField) => {
    setCountryField(field)
  }

  const closeCountryModal = () => {
    setCountryField(null)
  }

  const handleCountrySelect = (selectedCountry: string) => {
    if (countryField === 'nationality') {
      setNationality(selectedCountry)
      if (fieldErrors.nationality) {
        setFieldErrors((prev) => ({ ...prev, nationality: undefined }))
      }
    }
    if (countryField === 'country') {
      setCountry(selectedCountry)
      if (fieldErrors.country) {
        setFieldErrors((prev) => ({ ...prev, country: undefined }))
      }
    }
    closeCountryModal()
  }

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

  return (
    <section className="onboarding-shell">
      <aside className="onboarding-sidebar">
        <div className="onboarding-logo">
          <span className="brand-icon">S</span>
          <span>SurveyVault</span>
        </div>
        <p className="onboarding-nav-title">Account Setup</p>
        <nav className="onboarding-nav">
          <button className="onboarding-nav-item active">
            <span>Onboarding</span>
          </button>
          <button className="onboarding-nav-item">
            <span>Dashboard</span>
          </button>
          <button className="onboarding-nav-item">
            <span>Surveys</span>
          </button>
          <button className="onboarding-nav-item">
            <span>Earnings</span>
          </button>
        </nav>

        <div className="verification-steps-panel">
          <p className="verification-steps-title">Verification Steps</p>
          <button className="verification-step-item active">
            <span className="verification-step-count">1</span>
            Complete Profile
          </button>
          <button className="verification-step-item">
            <span className="verification-step-count">2</span>
            Skill Verification
          </button>
          <button className="verification-step-item">
            <span className="verification-step-count">3</span>
            ID Verification
          </button>
          <button className="verification-step-item">
            <span className="verification-step-count">4</span>
            Address Verification
          </button>
        </div>

        <div className="onboarding-member">
          <IoPersonOutline />
          <div>
            <p>New Member</p>
            <small>Setup Pending</small>
          </div>
        </div>
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
            <h2>Complete Profile</h2>
            <p>Step 1 of 4 - Bio Data</p>
          </div>
          <div className="profile-topbar-chips">
            <span className="profile-chip step">
              <IoCheckmarkCircleOutline />
              Step 1 of 4
            </span>
            <span className="profile-chip progress">In Progress</span>
          </div>
        </header>

        <div className="onboarding-content profile-content">
          <article className="profile-progress-card">
            <div className="profile-progress-head">
              <span>Account Verification Progress</span>
              <strong>25% Done</strong>
            </div>
            <p className="profile-progress-desc">Complete all 4 steps to unlock your dashboard</p>
            <div className="profile-progress-bar">
              <div />
            </div>
            <div className="profile-stepper">
              <div className="profile-stepper-line" />
              <div className="profile-stepper-line active" />
              <div className="profile-stepper-item active">
                <span>1</span>
                <small>Profile</small>
              </div>
              <div className="profile-stepper-item">
                <span>2</span>
                <small>Skills</small>
              </div>
              <div className="profile-stepper-item">
                <span>3</span>
                <small>ID Verify</small>
              </div>
              <div className="profile-stepper-item">
                <span>4</span>
                <small>Address</small>
              </div>
            </div>
          </article>

          <article className="profile-form-card">
            <header className="profile-card-header">
              <div className="bio-data-icon">
                <IoPersonOutline />
              </div>
              <div>
                <h3>Bio Data</h3>
                <p>Fill in your personal information accurately</p>
              </div>
            </header>

            <form
              className="auth-form profile-form"
              onSubmit={(event) => {
                event.preventDefault()
                handleSaveContinue()
              }}
              noValidate
            >
              <p className="profile-photo-label">
                Profile Photo <span>(Optional)</span>
              </p>
              <div className="profile-upload-row">
                <div className="profile-avatar-upload">
                  <IoPersonOutline />
                  <button type="button" className="avatar-camera-btn">
                    <IoCameraOutline />
                  </button>
                </div>
                <div className="profile-dropzone">
                  <IoCloudUploadOutline />
                  <p>Click to upload or drag &amp; drop</p>
                  <small>PNG, JPG or WEBP · Max 5MB · Min 200x200px</small>
                  <button type="button" className="profile-browse-btn">
                    Browse Files
                  </button>
                </div>
              </div>

              <p className="section-label">Personal Information</p>

              <div className="profile-grid">
                <div>
                  <label htmlFor="firstName">
                    First Name <span className="required-asterisk">*</span>
                  </label>
                  <div className={fieldErrors.firstName ? 'input-wrap input-wrap-error' : 'input-wrap'}>
                    <IoPersonOutline className="input-icon" />
                    <input
                      id="firstName"
                      value={firstName}
                      onChange={(event) => {
                        setFirstName(event.target.value)
                        if (fieldErrors.firstName) {
                          setFieldErrors((prev) => ({ ...prev, firstName: undefined }))
                        }
                      }}
                      placeholder="e.g. John"
                    />
                  </div>
                  {fieldErrors.firstName && <p className="field-error">{fieldErrors.firstName}</p>}
                </div>
                <div>
                  <label htmlFor="lastName">
                    Last Name <span className="required-asterisk">*</span>
                  </label>
                  <div className={fieldErrors.lastName ? 'input-wrap input-wrap-error' : 'input-wrap'}>
                    <IoPersonOutline className="input-icon" />
                    <input
                      id="lastName"
                      value={lastName}
                      onChange={(event) => {
                        setLastName(event.target.value)
                        if (fieldErrors.lastName) {
                          setFieldErrors((prev) => ({ ...prev, lastName: undefined }))
                        }
                      }}
                      placeholder="e.g. Doe"
                    />
                  </div>
                  {fieldErrors.lastName && <p className="field-error">{fieldErrors.lastName}</p>}
                </div>
              </div>

              <div className="profile-grid">
                <div>
                  <label htmlFor="email">
                    Email Address <span className="required-asterisk">*</span>
                  </label>
                  <div className={fieldErrors.email ? 'input-wrap input-wrap-error' : 'input-wrap'}>
                    <IoMailOutline className="input-icon" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value)
                        if (fieldErrors.email) {
                          setFieldErrors((prev) => ({ ...prev, email: undefined }))
                        }
                      }}
                      placeholder="john@example.com"
                    />
                  </div>
                  {fieldErrors.email && <p className="field-error">{fieldErrors.email}</p>}
                </div>
                <div>
                  <label htmlFor="phone">
                    Phone Number <span className="required-asterisk">*</span>
                  </label>
                  <div className={fieldErrors.phoneNumber ? 'input-wrap input-wrap-error' : 'input-wrap'}>
                    <IoPhonePortraitOutline className="input-icon" />
                    <input
                      id="phone"
                      value={phoneNumber}
                      onChange={(event) => {
                        setPhoneNumber(event.target.value)
                        if (fieldErrors.phoneNumber) {
                          setFieldErrors((prev) => ({ ...prev, phoneNumber: undefined }))
                        }
                      }}
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                  {fieldErrors.phoneNumber && <p className="field-error">{fieldErrors.phoneNumber}</p>}
                </div>
              </div>

              <div className="profile-grid">
                <div>
                  <label htmlFor="birthDate">
                    Date of Birth <span className="required-asterisk">*</span>
                  </label>
                  <div className={fieldErrors.birthDate ? 'input-wrap input-wrap-error' : 'input-wrap'}>
                    <IoCalendarOutline className="input-icon" />
                    <input
                      id="birthDate"
                      type="date"
                      value={birthDate}
                      onChange={(event) => {
                        setBirthDate(event.target.value)
                        if (fieldErrors.birthDate) {
                          setFieldErrors((prev) => ({ ...prev, birthDate: undefined }))
                        }
                      }}
                      max={maxBirthDate}
                    />
                  </div>
                  {fieldErrors.birthDate && <p className="field-error">{fieldErrors.birthDate}</p>}
                </div>
                <div>
                  <label htmlFor="age">Age (Auto-calculated)</label>
                  <div className="input-wrap">
                    <input id="age" value={calculatedAge} placeholder="Auto-filled" disabled />
                  </div>
                  <small className="age-helper-text">Calculated from your date of birth</small>
                </div>
              </div>

              <div>
                <label>
                  Gender <span className="required-asterisk">*</span>
                </label>
                <div className="gender-options">
                  {[
                    { label: 'Male', icon: IoMaleOutline },
                    { label: 'Female', icon: IoFemaleOutline },
                    { label: 'Non-binary', icon: IoTransgenderOutline },
                    { label: 'Prefer not', icon: IoPersonOutline },
                  ].map(({ label, icon: Icon }) => (
                    <button
                      key={label}
                      type="button"
                      className={gender === label ? 'gender-btn active' : 'gender-btn'}
                      onClick={() => {
                        setGender(label)
                        if (fieldErrors.gender) {
                          setFieldErrors((prev) => ({ ...prev, gender: undefined }))
                        }
                      }}
                    >
                      <Icon />
                      {label}
                    </button>
                  ))}
                </div>
                {fieldErrors.gender && <p className="field-error">{fieldErrors.gender}</p>}
              </div>

              <div className="profile-grid">
                <div>
                  <label htmlFor="nationality">
                    Nationality <span className="required-asterisk">*</span>
                  </label>
                  <div
                    className={fieldErrors.nationality ? 'input-wrap select-trigger input-wrap-error' : 'input-wrap select-trigger'}
                    onClick={() => openCountryModal('nationality')}
                    role="presentation"
                  >
                    <IoFlagOutline className="input-icon" />
                    <input
                      id="nationality"
                      value={nationality}
                      readOnly
                      placeholder="Select nationality"
                    />
                    <IoChevronDownOutline className="input-icon" />
                  </div>
                  {fieldErrors.nationality && <p className="field-error">{fieldErrors.nationality}</p>}
                </div>
                <div>
                  <label htmlFor="country">
                    Country of Residence <span className="required-asterisk">*</span>
                  </label>
                  <div
                    className={fieldErrors.country ? 'input-wrap select-trigger input-wrap-error' : 'input-wrap select-trigger'}
                    onClick={() => openCountryModal('country')}
                    role="presentation"
                  >
                    <IoFlagOutline className="input-icon" />
                    <input
                      id="country"
                      value={country}
                      readOnly
                      placeholder="Select country"
                    />
                    <IoChevronDownOutline className="input-icon" />
                  </div>
                  {fieldErrors.country && <p className="field-error">{fieldErrors.country}</p>}
                </div>
              </div>

              <small className="required-note">Required fields must be completed to proceed</small>

              <p className="section-label section-label-divider">Privacy Notice</p>
              <div className="privacy-notice">
                <IoShieldCheckmarkOutline />
                <p>
                  <strong>Your data is protected</strong>
                  <span className="privacy-note-copy">
                    Your personal information is encrypted and stored securely. We never share your data
                    with third parties without your explicit consent. See our{' '}
                    <Link to="/" className="inline-link privacy-policy-link">
                      Privacy Policy
                    </Link>
                    .
                  </span>
                </p>
              </div>

              <div className="profile-footer-actions">
                <button type="button" className="profile-secondary-action">
                  Save Draft
                </button>
                <p className="profile-next-step">Next: Skill Verification</p>
                <button type="submit" className="step-action">
                  Save & Continue <IoArrowForward />
                </button>
              </div>
            </form>
          </article>
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
          <span className="brand-text">Account Setup</span>
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
            to="/dashboard/onboarding/profile"
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

      <CountrySelectModal
        isOpen={isCountryModalOpen}
        title={countryField === 'nationality' ? 'Select Nationality' : 'Select Country of Residence'}
        selectedCountry={countryField === 'nationality' ? nationality : country}
        onClose={closeCountryModal}
        onSelect={handleCountrySelect}
      />
    </section>
  )
}
