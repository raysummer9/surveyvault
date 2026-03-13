import { Link } from 'react-router-dom'
import { PageSection } from '../../shared/ui/PageSection'

const steps = [
  'Profile details',
  'Identity verification',
  'Tax and payout information',
  'Work eligibility checks',
]

export function OnboardingPage() {
  return (
    <PageSection
      title="Onboarding"
      description="Users must complete onboarding before they can pay the one-time join fee."
    >
      <ol className="list">
        {steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <div className="actions">
        <Link className="button" to="/workforce/join">
          Continue to one-time payment
        </Link>
      </div>
    </PageSection>
  )
}
