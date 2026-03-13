import { Link } from 'react-router-dom'
import { PageSection } from '../../shared/ui/PageSection'

export function RegisterPage() {
  return (
    <PageSection
      title="Register"
      description="Account creation placeholder for new users."
    >
      <p>
        This page will collect account details and kick off onboarding before workforce joining
        payment.
      </p>
      <div className="actions">
        <Link className="button" to="/onboarding">
          Continue to onboarding
        </Link>
      </div>
    </PageSection>
  )
}
