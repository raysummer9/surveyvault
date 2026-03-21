export type OnboardingStepId = 'profile' | 'skill' | 'id' | 'address'

export type OnboardingStatus = 'in_progress' | 'completed' | 'approved' | 'rejected'

export type UserProfile = {
  id: string
  email: string | null
  first_name: string | null
  last_name: string | null
  onboarding_status: OnboardingStatus
  /** False/null until admin approves workforce; treat missing as not approved */
  workforce_approved?: boolean | null
  workforce_joined: boolean
  workforce_payment_confirmed?: boolean
  /** Set when admin rejects payment verification; cleared on new payment submit */
  workforce_payment_rejection_reason?: string | null
  created_at: string
  updated_at: string
}

export type OnboardingSubmission = {
  user_id: string
  current_step: string
  is_profile_complete: boolean
  is_skill_complete: boolean
  is_id_complete: boolean
  is_address_complete: boolean
  is_onboarding_complete: boolean
  profile_data: Record<string, unknown> | null
  skills_data: Record<string, unknown> | null
  id_verification_data: Record<string, unknown> | null
  address_data: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

function hasAnyKeys(value: Record<string, unknown> | null | undefined) {
  return Boolean(value && Object.keys(value).length > 0)
}

function hasStepData(step: OnboardingStepId, submission: OnboardingSubmission) {
  if (step === 'profile') return hasAnyKeys(submission.profile_data)

  if (step === 'skill') {
    const skillsData = submission.skills_data
    if (!hasAnyKeys(skillsData)) return false
    const answers = skillsData?.answers
    return Boolean(
      answers &&
        typeof answers === 'object' &&
        Object.keys(answers as Record<string, unknown>).length > 0,
    )
  }

  if (step === 'id') return hasAnyKeys(submission.id_verification_data)
  return hasAnyKeys(submission.address_data)
}

export function getCompletedOnboardingSteps(
  submission: OnboardingSubmission | null | undefined,
): OnboardingStepId[] {
  if (!submission) return []
  const completed: OnboardingStepId[] = []
  if (submission.is_profile_complete || hasStepData('profile', submission)) completed.push('profile')
  if (submission.is_skill_complete || hasStepData('skill', submission)) completed.push('skill')
  if (submission.is_id_complete || hasStepData('id', submission)) completed.push('id')
  if (submission.is_address_complete || hasStepData('address', submission)) completed.push('address')
  return completed
}

export function isOnboardingComplete(submission: OnboardingSubmission | null | undefined) {
  if (!submission) return false
  if (submission.is_onboarding_complete) return true
  return getCompletedOnboardingSteps(submission).length === 4
}

export function isProfileMarkedOnboardingComplete(profile: UserProfile | null | undefined) {
  if (!profile) return false
  return profile.onboarding_status === 'completed' || profile.onboarding_status === 'approved'
}

export function isOnboardingRejected(profile: UserProfile | null | undefined) {
  return profile?.onboarding_status === 'rejected'
}

export function isAdminApproved(profile: UserProfile | null | undefined) {
  return profile?.onboarding_status === 'approved' && profile?.workforce_approved === true
}

export function hasJoinedWorkforce(profile: UserProfile | null | undefined) {
  return profile?.workforce_joined === true
}

/** User has paid and is waiting for admin to approve workforce access */
export function hasPaymentConfirmedAwaitingApproval(profile: UserProfile | null | undefined) {
  return (
    Boolean(profile?.workforce_payment_confirmed) &&
    profile?.workforce_approved !== true
  )
}

/**
 * May access pending-review route / enrollment step "Active" while a payment is in review.
 * `authSeesPendingWorkforcePayment` is true when hydration loaded a `workforce_payments` row with status `pending`
 * (covers stale `workforce_payment_confirmed`, profile read races, and `.maybeSingle()` errors when multiple pendings exist).
 */
export function hasWorkforcePaymentReviewAccess(
  profile: UserProfile | null | undefined,
  authSeesPendingWorkforcePayment: boolean,
): boolean {
  /** Upgrade: already in workforce but a new tier payment is pending admin review */
  if (hasJoinedWorkforce(profile) && authSeesPendingWorkforcePayment) return true
  if (hasJoinedWorkforce(profile)) return false
  if (profile?.workforce_approved === true) return false
  if (authSeesPendingWorkforcePayment) return true
  return hasPaymentConfirmedAwaitingApproval(profile)
}

/** Admin rejected the last payment submission; user can submit again */
export function hasWorkforcePaymentRejected(profile: UserProfile | null | undefined) {
  const reason = profile?.workforce_payment_rejection_reason
  return Boolean(reason && reason.trim().length > 0)
}

/** User can access Join Workforce page: onboarding approved, not yet in workforce */
export function canAccessJoinWorkforce(profile: UserProfile | null | undefined) {
  if (!profile) return false
  if (profile.workforce_joined) return false
  return profile.onboarding_status === 'approved'
}

export function canAccessOnboardingStep(
  step: OnboardingStepId,
  submission: OnboardingSubmission | null | undefined,
): boolean {
  const completed = new Set(getCompletedOnboardingSteps(submission))
  if (step === 'profile') return true
  if (step === 'skill') return completed.has('profile')
  if (step === 'id') return completed.has('profile') && completed.has('skill')
  return completed.has('profile') && completed.has('skill') && completed.has('id')
}

export function isWorkforceApproved(
  profile: UserProfile | null | undefined,
  submission: OnboardingSubmission | null | undefined,
): boolean {
  if (!profile || !submission) return false
  return (
    isOnboardingComplete(submission) &&
    (submission.is_address_complete || hasStepData('address', submission)) &&
    profile.workforce_approved === true &&
    profile.onboarding_status === 'approved'
  )
}

