import { Link } from 'react-router-dom'
import { PageSection } from '../../shared/ui/PageSection'

export function NotFoundPage() {
  return (
    <PageSection
      title="Page not found"
      description="The route does not exist yet in this frontend scaffold."
    >
      <div className="actions">
        <Link className="button" to="/">
          Back to home
        </Link>
      </div>
    </PageSection>
  )
}
