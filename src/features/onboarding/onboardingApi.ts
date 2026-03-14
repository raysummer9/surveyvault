import { assertSupabaseConfigured } from '../../lib/supabase'
import type { OnboardingStepId } from '../auth/types'

type OnboardingStepPayload = Record<string, unknown>

function getStepUpdate(step: OnboardingStepId, payload: OnboardingStepPayload) {
  if (step === 'profile') {
    return {
      profile_data: payload,
      is_profile_complete: true,
      current_step: 'skill',
    }
  }
  if (step === 'skill') {
    return {
      skills_data: payload,
      is_skill_complete: true,
      current_step: 'id',
    }
  }
  if (step === 'id') {
    return {
      id_verification_data: payload,
      is_id_complete: true,
      current_step: 'address',
    }
  }
  return {
    address_data: payload,
    is_address_complete: true,
    is_onboarding_complete: true,
    current_step: 'completed',
  }
}

export async function saveOnboardingStep(
  userId: string,
  step: OnboardingStepId,
  payload: OnboardingStepPayload,
) {
  const supabase = assertSupabaseConfigured()

  const updates = getStepUpdate(step, payload)

  const { error: onboardingError } = await supabase
    .from('onboarding_submissions')
    .upsert({ user_id: userId, ...updates }, { onConflict: 'user_id' })

  if (onboardingError) throw onboardingError

  const onboardingStatus = step === 'address' ? 'completed' : 'in_progress'
  const profileUpdates: Record<string, unknown> = {
    id: userId,
    onboarding_status: onboardingStatus,
  }

  if (step === 'profile') {
    profileUpdates.first_name = payload.firstName ?? null
    profileUpdates.last_name = payload.lastName ?? null
    profileUpdates.email = payload.email ?? null
  }

  const { error: profileError } = await supabase
    .from('user_profiles')
    .upsert(profileUpdates, { onConflict: 'id' })

  if (profileError) throw profileError
}

