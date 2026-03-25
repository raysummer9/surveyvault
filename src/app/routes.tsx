import { Navigate, Outlet, createBrowserRouter } from 'react-router-dom'
import { AppLayout } from './ui/AppLayout'
import { AdminLayout } from '../shared/ui/AdminLayout'
import { AdminLoginPage } from '../features/admin/AdminLoginPage'
import { AdminOnboardingReviewPage } from '../features/admin/AdminOnboardingReviewPage'
import { AdminPaymentDepositAddressesPage } from '../features/admin/AdminPaymentDepositAddressesPage'
import { AdminPaymentSettingsLayout } from '../features/admin/AdminPaymentSettingsLayout'
import { AdminPaymentSettingsPage } from '../features/admin/AdminPaymentSettingsPage'
import { AdminSurveysPage } from '../features/admin/AdminSurveysPage'
import { AdminWorkforceApprovalPage } from '../features/admin/AdminWorkforceApprovalPage'
import { AdminWithdrawalsPage } from '../features/admin/AdminWithdrawalsPage'
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
  RequireJoinWorkforceEligible,
  RequirePaymentFlowAccess,
  RequireUpgradeMembership,
  RequireWorkforcePaymentPending,
} from '../features/auth/routeGuards'
import { ForgotPasswordPage } from '../features/public/ForgotPasswordPage'
import { OpenProjectsPage } from '../features/public/OpenProjectsPage'
import { ResetPasswordPage } from '../features/public/ResetPasswordPage'
import { SignInPage } from '../features/public/SignInPage'
import { RegisterPage } from '../features/public/RegisterPage'
import { WhatToExpectPage } from '../features/public/WhatToExpectPage'
import { SurveysPage } from '../features/surveys/SurveysPage'
import { SurveyTakePage } from '../features/surveys/SurveyTakePage'
import { WithdrawalPage } from '../features/withdrawals/WithdrawalPage'
import { JoinWorkforcePage } from '../features/workforce/JoinWorkforcePage'
import { PaymentPage } from '../features/workforce/PaymentPage'
import { UpgradeMembershipPage } from '../features/workforce/UpgradeMembershipPage'
import { WorkforcePendingReviewPage } from '../features/workforce/WorkforcePendingReviewPage'
import { SupportPage } from '../features/support/SupportPage'
import { AdminUsersPage } from '../features/admin/AdminUsersPage'
import { AdminUserDetailPage } from '../features/admin/AdminUserDetailPage'
import { AdminSettingsPage } from '../features/admin/AdminSettingsPage'
import { AdminTermsPage } from '../features/admin/AdminTermsPage'
import { TermsPage } from '../features/public/TermsPage'
import { PrivacyPage } from '../features/public/PrivacyPage'

export const appRouter = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <NotFoundPage />,
    children: [
      { index: true, element: <LandingPage /> },
      {
        path: 'dashboard',
        element: (
          <RequireAuth>
            <PostLoginRedirect />
          </RequireAuth>
        ),
      },
      { path: 'open-projects', element: <OpenProjectsPage /> },
      { path: 'what-to-expect', element: <WhatToExpectPage /> },
      { path: 'terms', element: <TermsPage /> },
      { path: 'privacy', element: <PrivacyPage /> },
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
      { path: 'workforce/payment', element: <Navigate to="/dashboard/workforce/payment" replace /> },
      { path: 'workforce/upgrade', element: <Navigate to="/dashboard/workforce/upgrade" replace /> },
      { path: 'support', element: <Navigate to="/dashboard/support" replace /> },
      {
        path: 'dashboard/surveys',
        element: (
          <RequireAuth>
            <RequireOnboardingComplete>
              <RequireWorkforceApproval>
                <SurveysPage />
              </RequireWorkforceApproval>
            </RequireOnboardingComplete>
          </RequireAuth>
        ),
      },
      {
        path: 'dashboard/surveys/:surveyId/take',
        element: (
          <RequireAuth>
            <RequireOnboardingComplete>
              <RequireWorkforceApproval>
                <SurveyTakePage />
              </RequireWorkforceApproval>
            </RequireOnboardingComplete>
          </RequireAuth>
        ),
      },
      {
        path: 'dashboard/workforce/join',
        element: (
          <RequireAuth>
            <RequireJoinWorkforceEligible>
              <JoinWorkforcePage />
            </RequireJoinWorkforceEligible>
          </RequireAuth>
        ),
      },
      {
        path: 'dashboard/workforce/payment',
        element: (
          <RequireAuth>
            <RequirePaymentFlowAccess>
              <PaymentPage />
            </RequirePaymentFlowAccess>
          </RequireAuth>
        ),
      },
      {
        path: 'dashboard/workforce/upgrade',
        element: (
          <RequireAuth>
            <RequireOnboardingComplete>
              <RequireUpgradeMembership>
                <UpgradeMembershipPage />
              </RequireUpgradeMembership>
            </RequireOnboardingComplete>
          </RequireAuth>
        ),
      },
      {
        path: 'dashboard/workforce/pending-review',
        element: (
          <RequireAuth>
            <RequirePaymentFlowAccess>
              <RequireWorkforcePaymentPending>
                <WorkforcePendingReviewPage />
              </RequireWorkforcePaymentPending>
            </RequirePaymentFlowAccess>
          </RequireAuth>
        ),
      },
      {
        path: 'dashboard/earnings',
        element: (
          <RequireAuth>
            <RequireOnboardingComplete>
              <RequireWorkforceApproval>
                <DashboardPage />
              </RequireWorkforceApproval>
            </RequireOnboardingComplete>
          </RequireAuth>
        ),
      },
      {
        path: 'dashboard/withdrawals',
        element: (
          <RequireAuth>
            <RequireOnboardingComplete>
              <RequireWorkforceApproval>
                <WithdrawalPage />
              </RequireWorkforceApproval>
            </RequireOnboardingComplete>
          </RequireAuth>
        ),
      },
      {
        path: 'dashboard/support',
        element: (
          <RequireAuth>
            <SupportPage />
          </RequireAuth>
        ),
      },
      {
        path: 'admin',
        element: <Outlet />,
        children: [
          {
            path: 'login',
            element: <AdminLoginPage />,
          },
          {
            path: '',
            element: (
              <RequireAuth redirectTo="/admin/login">
                <RequireAdmin>
                  <AdminLayout />
                </RequireAdmin>
              </RequireAuth>
            ),
            children: [
              { index: true, element: <Navigate to="/admin/onboarding-review" replace /> },
              { path: 'onboarding-review', element: <AdminOnboardingReviewPage /> },
              { path: 'workforce-approval', element: <AdminWorkforceApprovalPage /> },
              {
                path: 'payment-settings',
                element: <AdminPaymentSettingsLayout />,
                children: [
                  { index: true, element: <AdminPaymentSettingsPage /> },
                  { path: 'deposit-addresses', element: <AdminPaymentDepositAddressesPage /> },
                ],
              },
              { path: 'surveys', element: <AdminSurveysPage /> },
              { path: 'withdrawals', element: <AdminWithdrawalsPage /> },
              { path: 'users/:userId', element: <AdminUserDetailPage /> },
              { path: 'users', element: <AdminUsersPage /> },
              { path: 'settings', element: <AdminSettingsPage /> },
              { path: 'terms', element: <AdminTermsPage /> },
            ],
          },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
