/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
  /** True after profile/onboarding hydration finishes for the current user (or no session). Route guards use with `loading`. */
  profileReady: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (input: SignUpInput) => Promise<void>
  signOut: () => Promise<void>
  requestPasswordReset: (email: string) => Promise<void>
  updatePassword: (nextPassword: string) => Promise<void>
  refreshUserState: () => Promise<void>
  /** Merge into cached profile immediately (e.g. after a successful DB update) so route guards see new state before the next async refresh. */
  patchProfile: (patch: Partial<UserProfile>) => void
  /**
   * Hydration found at least one `workforce_payments` row with status `pending` for this user
   * (first-time enrollment or membership upgrade). Used by route guards when
   * `user_profiles.workforce_payment_confirmed` is stale or profile was slow to load.
   */
  pendingWorkforcePaymentRow: boolean
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
  /** False until first `loadUserState` for the current session user finishes (avoids route guards firing with null profile/onboarding). */
  const [profileReady, setProfileReady] = useState(false)
  const [pendingWorkforcePaymentRow, setPendingWorkforcePaymentRow] = useState(false)
  const lastHydratedUserIdRef = useRef<string | null>(null)
  /** Tracks last processed session user id (auth callbacks). */
  const sessionUserIdRef = useRef<string | null>(null)
  /** Serialize profile hydration so concurrent `loadUserState` calls cannot interleave (stale guards / stuck spinners). */
  const hydrationQueueRef = useRef(Promise.resolve())

  const loadUserState = useCallback(async (authUser: User | null) => {
    if (!isSupabaseConfigured || !supabase) {
      lastHydratedUserIdRef.current = null
      setProfile(null)
      setOnboarding(null)
      setPendingWorkforcePaymentRow(false)
      setLastHydrationError(null)
      setLastProfileRowCount(null)
      setLastOnboardingRowCount(null)
      setProfileReady(true)
      return
    }
    if (!authUser) {
      lastHydratedUserIdRef.current = null
      setProfile(null)
      setOnboarding(null)
      setPendingWorkforcePaymentRow(false)
      setLastHydrationError(null)
      setLastProfileRowCount(null)
      setLastOnboardingRowCount(null)
      setProfileReady(true)
      return
    }

    // Re-fetch for a different user, or first load after refresh — block guards until this run completes.
    if (lastHydratedUserIdRef.current !== authUser.id) {
      setProfileReady(false)
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

      const rawProfileRow = profileResult.data?.[0] as UserProfile | undefined
      let nextProfile = rawProfileRow ?? null
      const rawOnboarding = (onboardingResult.data?.[0] as OnboardingSubmission | undefined) ?? null
      const nextOnboarding = normalizeOnboardingSubmission(rawOnboarding)
      setLastHydrationError(
        profileResult.error?.message ??
          onboardingResult.error?.message ??
          (!nextProfile && !nextOnboarding
            ? 'No profile/onboarding rows returned for authenticated user.'
            : null),
      )

      // Source of truth: a pending workforce_payments row means enrollment step 4 (Active) even if
      // user_profiles.workforce_payment_confirmed is stale or the profile read briefly failed.
      // Do NOT use .maybeSingle() — multiple pending rows (retries) returns PGRST116 and breaks the merge.
      const { data: pendingRows, error: pendingErr } = await supabase
        .from('workforce_payments')
        .select('id')
        .eq('user_id', authUser.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)

      const pendingPay = pendingRows?.[0]
      const pendingWorkforcePaymentId =
        !pendingErr && pendingPay?.id ? String(pendingPay.id) : null

      const enrollmentAwaitingPaymentReview =
        Boolean(pendingWorkforcePaymentId) &&
        nextProfile?.workforce_approved !== true &&
        nextProfile?.workforce_joined !== true

      if (enrollmentAwaitingPaymentReview && nextProfile) {
        nextProfile = { ...nextProfile, workforce_payment_confirmed: true }
        if (!rawProfileRow?.workforce_payment_confirmed) {
          void supabase
            .from('user_profiles')
            .update({ workforce_payment_confirmed: true })
            .eq('id', authUser.id)
        }
      } else if (pendingWorkforcePaymentId && !nextProfile) {
        // Rare race: payment row exists but profile select returned empty — retry once.
        const { data: retryRows } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', authUser.id)
          .order('updated_at', { ascending: false })
          .limit(1)
        const retryRow = retryRows?.[0] as UserProfile | undefined
        if (
          retryRow &&
          retryRow.workforce_approved !== true &&
          retryRow.workforce_joined !== true
        ) {
          nextProfile = { ...retryRow, workforce_payment_confirmed: true }
          if (!retryRow.workforce_payment_confirmed) {
            void supabase
              .from('user_profiles')
              .update({ workforce_payment_confirmed: true })
              .eq('id', authUser.id)
          }
        }
      }

      // Pending enrollment (not joined yet) OR pending membership upgrade (joined + new payment row).
      const allowPendingWorkforceReview =
        Boolean(pendingWorkforcePaymentId) &&
        ((nextProfile?.workforce_approved !== true && nextProfile?.workforce_joined !== true) ||
          nextProfile?.workforce_joined === true)

      // If the pending query errored (RLS/network), don't wipe an optimistic true from patchProfile().
      setPendingWorkforcePaymentRow((prev) => {
        if (allowPendingWorkforceReview) return true
        if (pendingErr) return prev
        return false
      })

      // Keep previously loaded state if one side fails transiently; merge pending-payment enrollment.
      setProfile((prev) => {
        const base = nextProfile ?? prev ?? null
        if (!base) return null
        if (
          pendingWorkforcePaymentId &&
          base.workforce_approved !== true &&
          base.workforce_joined !== true
        ) {
          return { ...base, workforce_payment_confirmed: true }
        }
        return base
      })
      setOnboarding((prev) => nextOnboarding ?? prev ?? null)

      // Auto-heal in the background — never block hydration on these writes (slow/hanging RLS was tripping the 25s watchdog).
      const uid = authUser.id
      if (rawOnboarding && nextOnboarding) {
        const onboardingChanged =
          rawOnboarding.is_profile_complete !== nextOnboarding.is_profile_complete ||
          rawOnboarding.is_skill_complete !== nextOnboarding.is_skill_complete ||
          rawOnboarding.is_id_complete !== nextOnboarding.is_id_complete ||
          rawOnboarding.is_address_complete !== nextOnboarding.is_address_complete ||
          rawOnboarding.is_onboarding_complete !== nextOnboarding.is_onboarding_complete ||
          rawOnboarding.current_step !== nextOnboarding.current_step

        if (onboardingChanged) {
          void supabase
            .from('onboarding_submissions')
            .update({
              is_profile_complete: nextOnboarding.is_profile_complete,
              is_skill_complete: nextOnboarding.is_skill_complete,
              is_id_complete: nextOnboarding.is_id_complete,
              is_address_complete: nextOnboarding.is_address_complete,
              is_onboarding_complete: nextOnboarding.is_onboarding_complete,
              current_step: nextOnboarding.current_step,
            })
            .eq('user_id', uid)
            .then(({ error: updateOnboardingError }) => {
              if (updateOnboardingError) {
                console.error('[AuthProvider] Failed to auto-heal onboarding flags', updateOnboardingError)
              }
            })
        }
      }

      if (nextProfile && nextOnboarding?.is_onboarding_complete && nextProfile.onboarding_status === 'in_progress') {
        void supabase
          .from('user_profiles')
          .update({ onboarding_status: 'completed' })
          .eq('id', uid)
          .then(({ error: updateProfileError }) => {
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
          })
      }
      lastHydratedUserIdRef.current = authUser.id
      setProfileReady(true)
    } catch (error) {
      console.error('[AuthProvider] Failed to load user state', error)
      setLastHydrationError(error instanceof Error ? error.message : 'Unknown hydration error')
      setProfile((prev) => prev ?? null)
      setOnboarding((prev) => prev ?? null)
      setPendingWorkforcePaymentRow(false)
      setProfileReady(true)
    }
  }, [])

  const enqueueHydration = useCallback(
    async (authUser: User | null) => {
      const run = hydrationQueueRef.current.then(() => loadUserState(authUser))
      hydrationQueueRef.current = run.catch(() => undefined)
      await run
    },
    [loadUserState],
  )

  const patchProfile = useCallback(
    (patch: Partial<UserProfile>) => {
      setProfile((prev) => {
        if (prev) return { ...prev, ...patch }
        // Payment submit can run before hydration loads user_profiles; merge onto a minimal row
        // so RequireWorkforcePaymentPending sees workforce_payment_confirmed.
        if (!user?.id || patch.workforce_payment_confirmed !== true) return prev
        return {
          id: user.id,
          email: user.email ?? null,
          first_name: null,
          last_name: null,
          onboarding_status: 'approved',
          workforce_joined: false,
          workforce_approved: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...patch,
        } as UserProfile
      })
      if (patch.workforce_payment_confirmed === true) {
        setPendingWorkforcePaymentRow(true)
      }
      if (patch.workforce_payment_confirmed === false) {
        setPendingWorkforcePaymentRow(false)
      }
    },
    [user],
  )

  const refreshUserState = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) return
    try {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()
      setUser(currentUser)
      await enqueueHydration(currentUser)
    } catch (error) {
      console.error('[AuthProvider] Failed to refresh user state', error)
      setUser(null)
      setProfile(null)
      setOnboarding(null)
      setPendingWorkforcePaymentRow(false)
      lastHydratedUserIdRef.current = null
      setProfileReady(true)
    }
  }, [enqueueHydration])

  useEffect(() => {
    let cancelled = false

    const initialize = async () => {
      if (!isSupabaseConfigured || !supabase) {
        setProfileReady(true)
        setLoading(false)
        return
      }

      try {
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession()

        if (cancelled) {
          setProfileReady(true)
          setLoading(false)
          return
        }

        setSession(initialSession)
        const initialUser = initialSession?.user ?? null
        setUser(initialUser)
        sessionUserIdRef.current = initialUser?.id ?? null

        // Keep profileReady false when signed in until `loadUserState` finishes (guards must not run with null profile).
        if (!initialUser) {
          setProfileReady(true)
        }

        // Unblock the router *before* profile hydration. If Supabase reads hang, we still must not spin forever on "Loading…".
        setLoading(false)

        // Never await — GoTrue can block signInWithPassword until this bootstrap path finishes; awaiting DB work can deadlock login after HTTP 200.
        void enqueueHydration(initialUser).catch((e) =>
          console.error('[AuthProvider] Initial profile hydration failed', e),
        )
      } catch (error) {
        console.error('[AuthProvider] Initialization failed', error)
        if (!cancelled) {
          setSession(null)
          setUser(null)
          setProfile(null)
          setOnboarding(null)
          sessionUserIdRef.current = null
          lastHydratedUserIdRef.current = null
          setProfileReady(true)
          setLoading(false)
        }
      }
    }

    void initialize()

    if (!isSupabaseConfigured || !supabase) {
      return () => {
        cancelled = true
      }
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (cancelled) return

      // Keep access token in sync without re-hydrating profile (avoids duplicate loadUserState vs `initialize`).
      if (event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') {
        setSession(nextSession)
        return
      }

      const nextUser = nextSession?.user ?? null
      sessionUserIdRef.current = nextUser?.id ?? null

      // Sync React state immediately; hydrate in the background.
      // IMPORTANT: Do not `await` inside this callback — GoTrue may wait for subscribers before resolving
      // `signInWithPassword`, so awaiting Supabase REST calls here deadlocks the login button after HTTP 200.
      try {
        setSession(nextSession)
        setUser(nextUser)
        void enqueueHydration(nextUser).catch((error) => {
          console.error('[AuthProvider] Auth state change hydration failed', error)
          if (!cancelled) {
            setProfileReady(true)
          }
        })
      } catch (error) {
        console.error('[AuthProvider] Auth state change handling failed', error)
        if (!cancelled) {
          setSession(null)
          setUser(null)
          setProfile(null)
          setOnboarding(null)
          sessionUserIdRef.current = null
          lastHydratedUserIdRef.current = null
          setProfileReady(true)
        }
      }
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [enqueueHydration])

  const signIn = useCallback(
    async (email: string, password: string) => {
      const client = assertSupabaseConfigured()
      const { data, error } = await client.auth.signInWithPassword({ email, password })
      if (error) throw error
      const session = data.session
      const signedInUser = session?.user ?? null
      setProfileReady(false)
      setSession(session ?? null)
      setUser(signedInUser)
      sessionUserIdRef.current = signedInUser?.id ?? null
      void enqueueHydration(signedInUser).catch((e) =>
        console.error('[AuthProvider] Post-sign-in hydration failed', e),
      )
    },
    [enqueueHydration],
  )

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
      profileReady,
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
      patchProfile,
      pendingWorkforcePaymentRow,
    }),
    [
      session,
      user,
      profile,
      onboarding,
      loading,
      profileReady,
      lastHydrationError,
      lastProfileRowCount,
      lastOnboardingRowCount,
      signIn,
      signUp,
      signOut,
      requestPasswordReset,
      updatePassword,
      refreshUserState,
      patchProfile,
      pendingWorkforcePaymentRow,
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

