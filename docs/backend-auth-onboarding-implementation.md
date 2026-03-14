# Backend Buildout Plan (Supabase)

This document tracks the end-to-end backend implementation for authentication, onboarding persistence, and workforce access control.

## 1) Database and Security

- [x] Create `user_profiles` table (status + approval fields).
- [x] Create `onboarding_submissions` table (all onboarding step payloads + completion flags).
- [x] Add `updated_at` trigger function for both tables.
- [x] Add signup trigger from `auth.users` to bootstrap profile + onboarding row.
- [x] Enable RLS on both tables.
- [x] Add per-user `SELECT/INSERT/UPDATE` policies.
- [x] Add indexes for approval/status queries.

Implemented in:

- `supabase/migrations/20260314_auth_onboarding.sql`

## 2) Supabase Client + Auth Session Layer

- [x] Add Supabase JS dependency.
- [x] Add centralized Supabase client with env validation.
- [x] Add app-level `AuthProvider` with:
  - Session + user tracking
  - Profile + onboarding row loading
  - Sign up / sign in / sign out
  - Password reset request
  - Password update
  - Refresh user state helper

Implemented in:

- `src/lib/supabase.ts`
- `src/features/auth/AuthContext.tsx`
- `src/features/auth/types.ts`
- `src/App.tsx`

## 3) Route Guards (Middleware-like checks)

- [x] Add `RequireAuth` guard.
- [x] Add `RequireAdmin` guard for admin-only routes.
- [x] Add onboarding step-order guard (`RequireOnboardingStep`).
- [x] Add onboarding-complete guard (`RequireOnboardingComplete`) for core dashboard pages.
- [x] Add workforce approval guard (`RequireWorkforceApproval`) so only fully approved users can join workforce.
- [x] Wire guards into router definitions.

Implemented in:

- `src/features/auth/routeGuards.tsx`
- `src/app/routes.tsx`

## 4) Authentication Features

- [x] Register wired to Supabase sign-up.
- [x] Login wired to Supabase password auth.
- [x] Forgot password page + reset email flow.
- [x] Reset password page + update password flow.

Implemented in:

- `src/features/public/RegisterPage.tsx`
- `src/features/public/SignInPage.tsx`
- `src/features/public/ForgotPasswordPage.tsx`
- `src/features/public/ResetPasswordPage.tsx`
- `src/app/routes.tsx`

## 5) Onboarding Persistence

- [x] Add shared onboarding save API (`saveOnboardingStep`).
- [x] Add shared onboarding storage upload API (`uploadOnboardingFile`).
- [x] Save Step 1 (profile) payload to DB on continue.
- [x] Save Step 2 (skills) payload to DB on submit.
- [x] Save Step 3 (ID verification) payload to DB on submit.
- [x] Save Step 4 (address) payload to DB on submit.
- [x] Upload onboarding files (profile photo, selfie, ID docs, proof of address) to Supabase Storage and persist metadata in step payloads.
- [x] Move onboarding dashboard progress source from local storage to DB-backed auth state.

Implemented in:

- `src/features/onboarding/onboardingApi.ts`
- `src/features/onboarding/onboardingStorage.ts`
- `src/features/onboarding/CompleteProfilePage.tsx`
- `src/features/onboarding/SkillVerificationPage.tsx`
- `src/features/onboarding/IdVerificationPage.tsx`
- `src/features/onboarding/AddressVerificationPage.tsx`
- `src/features/onboarding/OnboardingPage.tsx`
- `supabase/migrations/20260314_onboarding_storage.sql`

## 6) Workforce Access Rule

Access to `/dashboard/workforce/join` now requires:

- user authenticated
- onboarding fully complete (`is_onboarding_complete = true`)
- profile approved (`onboarding_status = 'approved'`)
- workforce approved (`workforce_approved = true`)

Enforced by:

- `RequireWorkforceApproval` route guard

## 7) Admin Review Flow

- [x] Add admin onboarding review route and page (`/admin/onboarding-review`).
- [x] Implement approve/reject actions that update `user_profiles` and `onboarding_submissions`.
- [x] Add admin RLS migration with `admin_users` table + policies for cross-user review.

Implemented in:

- `src/features/admin/AdminOnboardingReviewPage.tsx`
- `src/features/auth/routeGuards.tsx`
- `src/app/routes.tsx`
- `supabase/migrations/20260314_admin_onboarding_review.sql`

## 8) Environment Setup Required

Create/update `.env` with:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_ONBOARDING_BUCKET=onboarding-documents
VITE_ADMIN_EMAILS=admin1@yourdomain.com,admin2@yourdomain.com
```

## 9) Next Recommended Backend Tasks

- [x] Add admin-only page action to approve/reject onboarding (`onboarding_status`, `workforce_approved`).
- [ ] Add audit log table for onboarding status transitions.
- [ ] Add server-side validation for file metadata (size/type) before final approval.
- [ ] Add signed URL workflow for private onboarding files in admin review tooling.
- [ ] Add E2E tests for guarded routes and onboarding progression.

