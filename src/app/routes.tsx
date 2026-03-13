import { Navigate, createBrowserRouter } from 'react-router-dom'
import { AppLayout } from './ui/AppLayout'
import { AdminPaymentSettingsPage } from '../features/admin/AdminPaymentSettingsPage'
import { DashboardPage } from '../features/dashboard/DashboardPage'
import { LandingPage } from '../features/landing/LandingPage'
import { CompleteProfilePage } from '../features/onboarding/CompleteProfilePage'
import { NotFoundPage } from '../features/not-found/NotFoundPage'
import { OnboardingPage } from '../features/onboarding/OnboardingPage'
import { OpenProjectsPage } from '../features/public/OpenProjectsPage'
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
      { path: 'onboarding', element: <Navigate to="/dashboard/onboarding" replace /> },
      { path: 'dashboard/onboarding', element: <OnboardingPage /> },
      { path: 'dashboard/onboarding/profile', element: <CompleteProfilePage /> },
      { path: 'surveys', element: <Navigate to="/dashboard/surveys" replace /> },
      { path: 'workforce/join', element: <Navigate to="/dashboard/workforce/join" replace /> },
      { path: 'dashboard', element: <Navigate to="/dashboard/earnings" replace /> },
      { path: 'dashboard/surveys', element: <SurveysPage /> },
      { path: 'dashboard/workforce/join', element: <JoinWorkforcePage /> },
      { path: 'dashboard/earnings', element: <DashboardPage /> },
      { path: 'admin/payment-settings', element: <AdminPaymentSettingsPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
