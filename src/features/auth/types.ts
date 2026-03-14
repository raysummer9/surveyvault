export type OnboardingStepId = 'profile' | 'skill' | 'id' | 'address'

export type OnboardingStatus = 'in_progress' | 'completed' | 'approved' | 'rejected'

export type UserProfile = {
  id: string
  email: string | null
  first_name: string | null
  last_name: string | null
  onboarding_status: OnboardingStatus
  workforce_approved: boolean
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
    profile.workforce_approved &&
    profile.onboarding_status === 'approved'
  )
}

