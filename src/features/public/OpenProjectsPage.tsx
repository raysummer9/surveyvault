import { Link } from 'react-router-dom'
import { PageSection } from '../../shared/ui/PageSection'

export function OpenProjectsPage() {
  return (
    <PageSection
      title="Open Projects"
      description="Public listing placeholder for currently available survey projects."
    >
      <p>
        This page will showcase available projects, reward ranges, eligibility summary, and
        expected completion time.
      </p>
      <div className="actions">
        <Link className="button" to="/register">
          Register to apply
        </Link>
      </div>
    </PageSection>
  )
}
