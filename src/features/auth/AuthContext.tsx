/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { assertSupabaseConfigured, isSupabaseConfigured, supabase } from '../../lib/supabase'
import {
  getCompletedOnboardingSteps,
  isOnboardingComplete,
  type OnboardingSubmission,
  type UserProfile,
} from './types'

type SignUpInput = {
  email: string
  password: string
  firstName: string
  lastName: string
}

type AuthContextValue = {
  session: Session | null
  user: User | null
  profile: UserProfile | null
  onboarding: OnboardingSubmission | null
  loading: boolean
  configured: boolean
  debug: {
    lastHydrationError: string | null
    lastProfileRowCount: number | null
    lastOnboardingRowCount: number | null
  }
  signIn: (email: string, password: string) => Promise<void>
  signUp: (input: SignUpInput) => Promise<void>
  signOut: () => Promise<void>
  requestPasswordReset: (email: string) => Promise<void>
  updatePassword: (nextPassword: string) => Promise<void>
  refreshUserState: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

function normalizeOnboardingSubmission(
  submission: OnboardingSubmission | null,
): OnboardingSubmission | null {
  if (!submission) return null
  const completed = new Set(getCompletedOnboardingSteps(submission))
  const isComplete = isOnboardingComplete(submission)

  return {
    ...submission,
    is_profile_complete: submission.is_profile_complete || completed.has('profile'),
    is_skill_complete: submission.is_skill_complete || completed.has('skill'),
    is_id_complete: submission.is_id_complete || completed.has('id'),
    is_address_complete: submission.is_address_complete || completed.has('address'),
    is_onboarding_complete: submission.is_onboarding_complete || isComplete,
    current_step: isComplete ? 'completed' : submission.current_step,
  }
}

async function ensureUserRows(user: User) {
  const client = assertSupabaseConfigured()

  // Bootstrap rows only for first-time users.
  // `ignoreDuplicates` prevents existing records from being overwritten on every refresh.
  await client.from('user_profiles').upsert(
    {
      id: user.id,
      email: user.email ?? null,
      first_name: (user.user_metadata?.first_name as string | undefined) ?? null,
      last_name: (user.user_metadata?.last_name as string | undefined) ?? null,
      onboarding_status: 'in_progress',
    },
    { onConflict: 'id', ignoreDuplicates: true },
  )

  await client.from('onboarding_submissions').upsert(
    {
      user_id: user.id,
      current_step: 'profile',
    },
    { onConflict: 'user_id', ignoreDuplicates: true },
  )
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [onboarding, setOnboarding] = useState<OnboardingSubmission | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastHydrationError, setLastHydrationError] = useState<string | null>(null)
  const [lastProfileRowCount, setLastProfileRowCount] = useState<number | null>(null)
  const [lastOnboardingRowCount, setLastOnboardingRowCount] = useState<number | null>(null)

  const loadUserState = useCallback(async (authUser: User | null) => {
    if (!isSupabaseConfigured || !supabase) {
      setProfile(null)
      setOnboarding(null)
      setLastHydrationError(null)
      setLastProfileRowCount(null)
      setLastOnboardingRowCount(null)
      return
    }
    if (!authUser) {
      setProfile(null)
      setOnboarding(null)
      setLastHydrationError(null)
      setLastProfileRowCount(null)
      setLastOnboardingRowCount(null)
      return
    }

    try {
      try {
        await ensureUserRows(authUser)
      } catch (bootstrapError) {
        // Non-fatal: existing users may already have rows; continue to read current state.
        console.error('[AuthProvider] ensureUserRows failed, continuing with reads', bootstrapError)
      }

      // Use ordered + limit(1) instead of single() so hydration does not fail
      // if legacy duplicate rows exist in user environments.
      const [profileResult, onboardingResult] = await Promise.all([
        supabase
          .from('user_profiles')
          .select('*')
          .eq('id', authUser.id)
          .order('updated_at', { ascending: false })
          .limit(1),
        supabase
          .from('onboarding_submissions')
          .select('*')
          .eq('user_id', authUser.id)
          .order('updated_at', { ascending: false })
          .limit(1),
      ])

      if (profileResult.error) {
        console.error('[AuthProvider] Failed to fetch profile row', profileResult.error)
      }
      if (onboardingResult.error) {
        console.error('[AuthProvider] Failed to fetch onboarding row', onboardingResult.error)
      }
      setLastProfileRowCount(profileResult.data?.length ?? 0)
      setLastOnboardingRowCount(onboardingResult.data?.length ?? 0)

      const nextProfile = (profileResult.data?.[0] as UserProfile | undefined) ?? null
      const rawOnboarding = (onboardingResult.data?.[0] as OnboardingSubmission | undefined) ?? null
      const nextOnboarding = normalizeOnboardingSubmission(rawOnboarding)
      setLastHydrationError(
        profileResult.error?.message ??
          onboardingResult.error?.message ??
          (!nextProfile && !nextOnboarding
            ? 'No profile/onboarding rows returned for authenticated user.'
            : null),
      )

      // Keep previously loaded state if one side fails transiently.
      setProfile((prev) => nextProfile ?? prev ?? null)
      setOnboarding((prev) => nextOnboarding ?? prev ?? null)

      // Auto-heal stale completion flags/status in DB when payloads indicate completion.
      if (rawOnboarding && nextOnboarding) {
        const onboardingChanged =
          rawOnboarding.is_profile_complete !== nextOnboarding.is_profile_complete ||
          rawOnboarding.is_skill_complete !== nextOnboarding.is_skill_complete ||
          rawOnboarding.is_id_complete !== nextOnboarding.is_id_complete ||
          rawOnboarding.is_address_complete !== nextOnboarding.is_address_complete ||
          rawOnboarding.is_onboarding_complete !== nextOnboarding.is_onboarding_complete ||
          rawOnboarding.current_step !== nextOnboarding.current_step

        if (onboardingChanged) {
          const { error: updateOnboardingError } = await supabase
            .from('onboarding_submissions')
            .update({
              is_profile_complete: nextOnboarding.is_profile_complete,
              is_skill_complete: nextOnboarding.is_skill_complete,
              is_id_complete: nextOnboarding.is_id_complete,
              is_address_complete: nextOnboarding.is_address_complete,
              is_onboarding_complete: nextOnboarding.is_onboarding_complete,
              current_step: nextOnboarding.current_step,
            })
            .eq('user_id', authUser.id)

          if (updateOnboardingError) {
            console.error('[AuthProvider] Failed to auto-heal onboarding flags', updateOnboardingError)
          }
        }
      }

      if (nextProfile && nextOnboarding?.is_onboarding_complete && nextProfile.onboarding_status === 'in_progress') {
        const { error: updateProfileError } = await supabase
          .from('user_profiles')
          .update({ onboarding_status: 'completed' })
          .eq('id', authUser.id)

        if (updateProfileError) {
          console.error('[AuthProvider] Failed to auto-heal profile onboarding status', updateProfileError)
        } else {
          setProfile((prev) =>
            prev
              ? {
                  ...prev,
                  onboarding_status: 'completed',
                }
              : prev,
          )
        }
      }
    } catch (error) {
      console.error('[AuthProvider] Failed to load user state', error)
      setLastHydrationError(error instanceof Error ? error.message : 'Unknown hydration error')
      setProfile((prev) => prev ?? null)
      setOnboarding((prev) => prev ?? null)
    }
  }, [])

  const refreshUserState = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) return
    try {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()
      setUser(currentUser)
      await loadUserState(currentUser)
    } catch (error) {
      console.error('[AuthProvider] Failed to refresh user state', error)
      setUser(null)
      setProfile(null)
      setOnboarding(null)
    }
  }, [loadUserState])

  useEffect(() => {
    let mounted = true

    const initialize = async () => {
      if (!isSupabaseConfigured || !supabase) {
        if (!mounted) return
        setLoading(false)
        return
      }

      try {
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession()

        if (!mounted) return
        setSession(initialSession)
        setUser(initialSession?.user ?? null)
        setLoading(false)
        void loadUserState(initialSession?.user ?? null)
      } catch (error) {
        console.error('[AuthProvider] Initialization failed', error)
        if (mounted) {
          setSession(null)
          setUser(null)
          setProfile(null)
          setOnboarding(null)
          setLoading(false)
        }
      }
    }

    initialize()

    if (!isSupabaseConfigured || !supabase) {
      return () => {
        mounted = false
      }
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      if (!mounted) return
      try {
        setSession(nextSession)
        setUser(nextSession?.user ?? null)
        setLoading(false)
        void loadUserState(nextSession?.user ?? null)
      } catch (error) {
        console.error('[AuthProvider] Auth state change handling failed', error)
        if (mounted) {
          setSession(null)
          setUser(null)
          setProfile(null)
          setOnboarding(null)
          setLoading(false)
        }
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [loadUserState])

  const signIn = useCallback(async (email: string, password: string) => {
    const client = assertSupabaseConfigured()
    const { error } = await client.auth.signInWithPassword({ email, password })
    if (error) throw error
  }, [])

  const signUp = useCallback(async ({ email, password, firstName, lastName }: SignUpInput) => {
    const client = assertSupabaseConfigured()
    const { error } = await client.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    })
    if (error) throw error
  }, [])

  const signOut = useCallback(async () => {
    const client = assertSupabaseConfigured()
    const { error } = await client.auth.signOut()
    if (error) throw error
  }, [])

  const requestPasswordReset = useCallback(async (email: string) => {
    const client = assertSupabaseConfigured()
    const { error } = await client.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) throw error
  }, [])

  const updatePassword = useCallback(async (nextPassword: string) => {
    const client = assertSupabaseConfigured()
    const { error } = await client.auth.updateUser({ password: nextPassword })
    if (error) throw error
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user,
      profile,
      onboarding,
      loading,
      configured: isSupabaseConfigured,
      debug: {
        lastHydrationError,
        lastProfileRowCount,
        lastOnboardingRowCount,
      },
      signIn,
      signUp,
      signOut,
      requestPasswordReset,
      updatePassword,
      refreshUserState,
    }),
    [
      session,
      user,
      profile,
      onboarding,
      loading,
      lastHydrationError,
      lastProfileRowCount,
      lastOnboardingRowCount,
      signIn,
      signUp,
      signOut,
      requestPasswordReset,
      updatePassword,
      refreshUserState,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

