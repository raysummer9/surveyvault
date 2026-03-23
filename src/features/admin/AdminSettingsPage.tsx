import { type FormEvent, useEffect, useState } from 'react'
import { IoEyeOffOutline, IoEyeOutline, IoLockClosedOutline, IoMailOutline } from 'react-icons/io5'
import { z } from 'zod'
import { assertSupabaseConfigured } from '../../lib/supabase'
import { useAuth } from '../auth/AuthContext'
import { AdminPageSection } from '../../shared/ui/AdminPageSection'

const emailSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.'),
})

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password.'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters.'),
    confirmPassword: z.string().min(1, 'Confirm your new password.'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    path: ['confirmPassword'],
    message: "Passwords don't match.",
  })
  .refine((d) => d.currentPassword !== d.newPassword, {
    path: ['newPassword'],
    message: 'New password must be different from your current password.',
  })

export function AdminSettingsPage() {
  const { user, updateEmail, updatePassword } = useAuth()

  const [email, setEmail] = useState(() => user?.email ?? '')
  const [emailSubmitting, setEmailSubmitting] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [emailSuccess, setEmailSuccess] = useState('')

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [showPw2, setShowPw2] = useState(false)
  const [pwSubmitting, setPwSubmitting] = useState(false)
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState('')

  const currentEmail = user?.email ?? ''

  useEffect(() => {
    if (user?.email) setEmail(user.email)
  }, [user?.email])

  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setEmailError('')
    setEmailSuccess('')
    const parsed = emailSchema.safeParse({ email })
    if (!parsed.success) {
      setEmailError(parsed.error.issues[0]?.message ?? 'Invalid email')
      return
    }
    if (parsed.data.email.toLowerCase() === currentEmail.toLowerCase()) {
      setEmailError('That is already your current email.')
      return
    }
    setEmailSubmitting(true)
    try {
      await updateEmail(parsed.data.email)
      setEmailSuccess(
        'Email update requested. If your project requires confirmation, check your inbox for a link. Otherwise your address is updated.',
      )
      setEmail(parsed.data.email)
    } catch (err) {
      setEmailError(err instanceof Error ? err.message : 'Could not update email.')
    } finally {
      setEmailSubmitting(false)
    }
  }

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setPwError('')
    setPwSuccess('')
    const parsed = passwordSchema.safeParse({ currentPassword, newPassword, confirmPassword })
    if (!parsed.success) {
      const issue = parsed.error.issues[0]
      setPwError(issue?.message ?? 'Invalid password')
      return
    }
    if (!currentEmail) {
      setPwError('No email on file for this session.')
      return
    }
    setPwSubmitting(true)
    try {
      const client = assertSupabaseConfigured()
      const { error: verifyErr } = await client.auth.signInWithPassword({
        email: currentEmail,
        password: parsed.data.currentPassword,
      })
      if (verifyErr) {
        setPwError('Current password is incorrect.')
        return
      }
      await updatePassword(parsed.data.newPassword)
      setPwSuccess('Password updated.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setPwError(err instanceof Error ? err.message : 'Could not update password.')
    } finally {
      setPwSubmitting(false)
    }
  }

  return (
    <AdminPageSection
      title="Account"
      description="Update the email and password for your admin sign-in. Changes apply to this account only."
    >
      <div className="admin-settings-grid">
        <section className="admin-settings-card panel">
          <h3 className="admin-settings-card-title">Email address</h3>
          <p className="panel-muted admin-settings-hint">
            Signed in as <strong>{currentEmail || '—'}</strong>
          </p>
          <form className="auth-form admin-settings-form" onSubmit={handleEmailSubmit} noValidate>
            <label htmlFor="admin-settings-email">New email</label>
            <div className="input-wrap">
              <IoMailOutline className="input-icon" />
              <input
                id="admin-settings-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(ev) => setEmail(ev.target.value)}
                placeholder="you@example.com"
              />
            </div>
            {emailError ? <p className="field-error">{emailError}</p> : null}
            {emailSuccess ? (
              <p className="password-match success" role="status">
                {emailSuccess}
              </p>
            ) : null}
            <button type="submit" className="auth-submit" disabled={emailSubmitting}>
              {emailSubmitting ? 'Saving…' : 'Update email'}
            </button>
          </form>
        </section>

        <section className="admin-settings-card panel">
          <h3 className="admin-settings-card-title">Password</h3>
          <p className="panel-muted admin-settings-hint">
            Enter your current password, then your new password. Your current password is checked before the change is
            applied.
          </p>
          <form className="auth-form admin-settings-form" onSubmit={handlePasswordSubmit} noValidate>
            <label htmlFor="admin-settings-current-pw">Current password</label>
            <div className="input-wrap">
              <IoLockClosedOutline className="input-icon" />
              <input
                id="admin-settings-current-pw"
                type={showCurrentPw ? 'text' : 'password'}
                autoComplete="current-password"
                value={currentPassword}
                onChange={(ev) => setCurrentPassword(ev.target.value)}
                placeholder="Current password"
              />
              <button
                type="button"
                className="eye-toggle"
                onClick={() => setShowCurrentPw((s) => !s)}
                aria-label={showCurrentPw ? 'Hide password' : 'Show password'}
              >
                {showCurrentPw ? <IoEyeOffOutline className="eye-icon" /> : <IoEyeOutline className="eye-icon" />}
              </button>
            </div>
            <label htmlFor="admin-settings-new-pw">New password</label>
            <div className="input-wrap">
              <input
                id="admin-settings-new-pw"
                type={showPw ? 'text' : 'password'}
                autoComplete="new-password"
                value={newPassword}
                onChange={(ev) => setNewPassword(ev.target.value)}
                placeholder="At least 8 characters"
              />
              <button
                type="button"
                className="eye-toggle"
                onClick={() => setShowPw((s) => !s)}
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                {showPw ? <IoEyeOffOutline className="eye-icon" /> : <IoEyeOutline className="eye-icon" />}
              </button>
            </div>
            <label htmlFor="admin-settings-confirm-pw">Confirm new password</label>
            <div className="input-wrap">
              <input
                id="admin-settings-confirm-pw"
                type={showPw2 ? 'text' : 'password'}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(ev) => setConfirmPassword(ev.target.value)}
                placeholder="Repeat password"
              />
              <button
                type="button"
                className="eye-toggle"
                onClick={() => setShowPw2((s) => !s)}
                aria-label={showPw2 ? 'Hide password' : 'Show password'}
              >
                {showPw2 ? <IoEyeOffOutline className="eye-icon" /> : <IoEyeOutline className="eye-icon" />}
              </button>
            </div>
            {pwError ? <p className="field-error">{pwError}</p> : null}
            {pwSuccess ? (
              <p className="password-match success" role="status">
                {pwSuccess}
              </p>
            ) : null}
            <button type="submit" className="auth-submit" disabled={pwSubmitting}>
              {pwSubmitting ? 'Updating…' : 'Update password'}
            </button>
          </form>
        </section>
      </div>
    </AdminPageSection>
  )
}
