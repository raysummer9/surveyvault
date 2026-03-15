import { Navigate, createBrowserRouter } from 'react-router-dom'
import { AppLayout } from './ui/AppLayout'
import { AdminOnboardingReviewPage } from '../features/admin/AdminOnboardingReviewPage'
import { AdminPaymentSettingsPage } from '../features/admin/AdminPaymentSettingsPage'
import { DashboardPage } from '../features/dashboard/DashboardPage'
import { LandingPage } from '../features/landing/LandingPage'
import { CompleteProfilePage } from '../features/onboarding/CompleteProfilePage'
import { AddressVerificationPage } from '../features/onboarding/AddressVerificationPage'
import { IdVerificationPage } from '../features/onboarding/IdVerificationPage'
import { NotFoundPage } from '../features/not-found/NotFoundPage'
import { OnboardingPage } from '../features/onboarding/OnboardingPage'
import { SkillVerificationPage } from '../features/onboarding/SkillVerificationPage'
import { PostLoginRedirect } from '../features/auth/PostLoginRedirect'
import {
  RequireAuth,
  RequireAdmin,
  RequireOnboardingComplete,
  RequireOnboardingStep,
  RequireWorkforceApproval,
} from '../features/auth/routeGuards'
import { ForgotPasswordPage } from '../features/public/ForgotPasswordPage'
import { OpenProjectsPage } from '../features/public/OpenProjectsPage'
import { ResetPasswordPage } from '../features/public/ResetPasswordPage'
import { SignInPage } from '../features/public/SignInPage'
import { RegisterPage } from '../features/public/RegisterPage'
import { WhatToExpectPage } from '../features/public/WhatToExpectPage'
import { SurveysPage } from '../features/surveys/SurveysPage'
import { JoinWorkforcePage } from '../features/workforce/JoinWorkforcePage'

export const appRouter = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <NotFoundPage />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'open-projects', element: <OpenProjectsPage /> },
      { path: 'what-to-expect', element: <WhatToExpectPage /> },
      { path: 'sign-in', element: <SignInPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
      { path: 'reset-password', element: <ResetPasswordPage /> },
      {
        path: 'onboarding',
        element: (
          <RequireAuth>
            <Navigate to="/dashboard/onboarding" replace />
          </RequireAuth>
        ),
      },
      {
        path: 'dashboard/onboarding',
        element: (
          <RequireAuth>
            <OnboardingPage />
          </RequireAuth>
        ),
      },
      {
        path: 'dashboard/onboarding/profile',
        element: (
          <RequireAuth>
            <RequireOnboardingStep step="profile">
              <CompleteProfilePage />
            </RequireOnboardingStep>
          </RequireAuth>
        ),
      },
      {
        path: 'dashboard/onboarding/skills',
        element: (
          <RequireAuth>
            <RequireOnboardingStep step="skill">
              <SkillVerificationPage />
            </RequireOnboardingStep>
          </RequireAuth>
        ),
      },
      {
        path: 'dashboard/onboarding/id-verification',
        element: (
          <RequireAuth>
            <RequireOnboardingStep step="id">
              <IdVerificationPage />
            </RequireOnboardingStep>
          </RequireAuth>
        ),
      },
      {
        path: 'dashboard/onboarding/address-verification',
        element: (
          <RequireAuth>
            <RequireOnboardingStep step="address">
              <AddressVerificationPage />
            </RequireOnboardingStep>
          </RequireAuth>
        ),
      },
      { path: 'surveys', element: <Navigate to="/dashboard/surveys" replace /> },
      { path: 'workforce/join', element: <Navigate to="/dashboard/workforce/join" replace /> },
      {
        path: 'dashboard',
        element: (
          <RequireAuth>
            <PostLoginRedirect />
          </RequireAuth>
        ),
      },
      {
        path: 'dashboard/surveys',
        element: (
          <RequireAuth>
            <RequireOnboardingComplete>
              <SurveysPage />
            </RequireOnboardingComplete>
          </RequireAuth>
        ),
      },
      {
        path: 'dashboard/workforce/join',
        element: (
          <RequireAuth>
            <RequireWorkforceApproval>
              <JoinWorkforcePage />
            </RequireWorkforceApproval>
          </RequireAuth>
        ),
      },
      {
        path: 'dashboard/earnings',
        element: (
          <RequireAuth>
            <RequireOnboardingComplete>
              <DashboardPage />
            </RequireOnboardingComplete>
          </RequireAuth>
        ),
      },
      {
        path: 'admin/onboarding-review',
        element: (
          <RequireAuth>
            <RequireAdmin>
              <AdminOnboardingReviewPage />
            </RequireAdmin>
          </RequireAuth>
        ),
      },
      {
        path: 'admin/payment-settings',
        element: (
          <RequireAuth>
            <RequireAdmin>
              <AdminPaymentSettingsPage />
            </RequireAdmin>
          </RequireAuth>
        ),
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
