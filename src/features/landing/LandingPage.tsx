import { Link } from 'react-router-dom'
import { PageSection } from '../../shared/ui/PageSection'

export function LandingPage() {
  return (
    <PageSection
      title="Survey Vault Home"
      description="Public homepage placeholder for the workforce platform."
    >
      <p>
        This will become your Figma-driven hero, trust copy, and conversion flow.
      </p>
      <div className="actions">
        <Link className="button" to="/register">
          Get started
        </Link>
        <Link className="button secondary" to="/open-projects">
          View open projects
        </Link>
      </div>
    </PageSection>
  )
}
