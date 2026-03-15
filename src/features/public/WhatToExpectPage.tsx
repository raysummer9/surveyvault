import { PublicPageLayout } from '../../shared/ui/PublicPageLayout'

const expectationPoints = [
  'Complete onboarding and identity checks.',
  'Pay one-time workforce joining fee (admin controlled).',
  'Access and complete surveys that match your profile.',
  'Receive payouts after review and approval.',
]

export function WhatToExpectPage() {
  return (
    <PublicPageLayout>
      <header className="public-page-header">
        <h1 className="public-page-title">What to expect</h1>
        <p className="public-page-desc">
          Our process for new members joining the SurveyVault workforce.
        </p>
      </header>
      <div className="public-page-panel">
        <ul className="list">
          {expectationPoints.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </div>
    </PublicPageLayout>
  )
}
