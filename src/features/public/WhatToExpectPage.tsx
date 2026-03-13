import { PageSection } from '../../shared/ui/PageSection'

const expectationPoints = [
  'Complete onboarding and identity checks.',
  'Pay one-time workforce joining fee (admin controlled).',
  'Access and complete surveys that match your profile.',
  'Receive payouts after review and approval.',
]

export function WhatToExpectPage() {
  return (
    <PageSection
      title="What to expect"
      description="Public process overview placeholder for new users."
    >
      <ul className="list">
        {expectationPoints.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
    </PageSection>
  )
}
