export type OnboardingStepId = 'profile' | 'skill' | 'id' | 'address'

type OnboardingProgress = {
  completedSteps: OnboardingStepId[]
}

const STORAGE_KEY = 'surveyvault.onboardingProgress'

const defaultProgress: OnboardingProgress = {
  completedSteps: [],
}

export function getOnboardingProgress(): OnboardingProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultProgress
    const parsed = JSON.parse(raw) as OnboardingProgress
    if (!Array.isArray(parsed.completedSteps)) return defaultProgress

    const validSteps: OnboardingStepId[] = ['profile', 'skill', 'id', 'address']
    const completedSteps = parsed.completedSteps.filter((step): step is OnboardingStepId =>
      validSteps.includes(step as OnboardingStepId),
    )

    return { completedSteps }
  } catch {
    return defaultProgress
  }
}

function saveOnboardingProgress(progress: OnboardingProgress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
}

export function markOnboardingStepCompleted(step: OnboardingStepId) {
  const progress = getOnboardingProgress()
  if (progress.completedSteps.includes(step)) return
  saveOnboardingProgress({
    completedSteps: [...progress.completedSteps, step],
  })
}

