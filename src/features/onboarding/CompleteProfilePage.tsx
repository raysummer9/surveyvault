import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  IoArrowForward,
  IoCalendarOutline,
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

  const handleSaveContinue = () => {
    navigate('/dashboard/onboarding')
  }

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
              <div className="step-icon active">
                <IoPersonOutline />
              </div>
              <div>
                <h3>Bio Data</h3>
                <p>Fill in your personal information accurately</p>
              </div>
            </header>

            <form className="auth-form profile-form" onSubmit={(e) => e.preventDefault()}>
              <div className="profile-upload-row">
                <div className="profile-avatar-upload">
                  <IoPersonOutline />
                </div>
                <div className="profile-dropzone">
                  <IoCloudUploadOutline />
                  <p>Click to upload or drag &amp; drop</p>
                  <small>PNG, JPG or WEBP | Max 5MB</small>
                  <button type="button" className="step-action disabled">
                    Browse Files
                  </button>
                </div>
              </div>

              <p className="section-label">Personal Information</p>

              <div className="profile-grid">
                <div>
                  <label htmlFor="firstName">First Name *</label>
                  <div className="input-wrap">
                    <IoPersonOutline className="input-icon" />
                    <input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="e.g. John"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="lastName">Last Name *</label>
                  <div className="input-wrap">
                    <IoPersonOutline className="input-icon" />
                    <input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="e.g. Doe"
                    />
                  </div>
                </div>
              </div>

              <div className="profile-grid">
                <div>
                  <label htmlFor="email">Email Address *</label>
                  <div className="input-wrap">
                    <IoMailOutline className="input-icon" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="phone">Phone Number *</label>
                  <div className="input-wrap">
                    <IoPhonePortraitOutline className="input-icon" />
                    <input
                      id="phone"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>
              </div>

              <div className="profile-grid">
                <div>
                  <label htmlFor="birthDate">Date of Birth *</label>
                  <div className="input-wrap">
                    <IoCalendarOutline className="input-icon" />
                    <input
                      id="birthDate"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      placeholder="dd/mm/yyyy"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="age">Age (Auto-calculated)</label>
                  <div className="input-wrap">
                    <input id="age" placeholder="Auto-filled" disabled />
                  </div>
                </div>
              </div>

              <div>
                <label>Gender *</label>
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
                      onClick={() => setGender(label)}
                    >
                      <Icon />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="profile-grid">
                <div>
                  <label htmlFor="nationality">Nationality *</label>
                  <div className="input-wrap">
                    <IoFlagOutline className="input-icon" />
                    <input
                      id="nationality"
                      value={nationality}
                      onChange={(e) => setNationality(e.target.value)}
                      placeholder="Select nationality"
                    />
                    <IoChevronDownOutline className="input-icon" />
                  </div>
                </div>
                <div>
                  <label htmlFor="country">Country of Residence *</label>
                  <div className="input-wrap">
                    <IoFlagOutline className="input-icon" />
                    <input
                      id="country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="Select country"
                    />
                    <IoChevronDownOutline className="input-icon" />
                  </div>
                </div>
              </div>

              <small className="required-note">* Required fields must be completed to proceed</small>

              <div className="privacy-notice">
                <IoShieldCheckmarkOutline />
                <p>
                  <strong>Your data is protected</strong>
                  Your personal information is encrypted and stored securely.
                </p>
              </div>

              <div className="profile-footer-actions">
                <button type="button" className="step-action disabled">
                  Save Draft
                </button>
                <button
                  type="button"
                  className="step-action"
                  onClick={handleSaveContinue}
                >
                  <IoArrowForward />
                  Save & Continue
                </button>
              </div>
            </form>
          </article>
        </div>
      </div>
    </section>
  )
}
