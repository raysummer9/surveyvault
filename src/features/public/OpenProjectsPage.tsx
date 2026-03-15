import { Link } from 'react-router-dom'
import { PublicPageLayout } from '../../shared/ui/PublicPageLayout'

export function OpenProjectsPage() {
  return (
    <PublicPageLayout>
      <header className="public-page-header">
        <h1 className="public-page-title">Open Surveys</h1>
        <p className="public-page-desc">
          Currently available survey projects. Register to apply and start earning.
        </p>
      </header>
      <div className="public-page-panel">
        <p className="panel-muted">
          This page will showcase available projects, reward ranges, eligibility summary, and
          expected completion time.
        </p>
        <div className="actions">
          <Link className="button" to="/register">
            Register to apply
          </Link>
        </div>
      </div>
    </PublicPageLayout>
  )
}
