import { Link } from 'react-router-dom'
import { workforceJoinFee } from '../../domain/paymentConfig'
import { PageSection } from '../../shared/ui/PageSection'

export function JoinWorkforcePage() {
  return (
    <PageSection
      title="Join the Workforce"
      description="A one-time payment unlocks access to paid surveys and earnings."
    >
      <dl className="key-values">
        <div>
          <dt>Category</dt>
          <dd>{workforceJoinFee.category}</dd>
        </div>
        <div>
          <dt>One-time fee</dt>
          <dd>${workforceJoinFee.priceUsd.toFixed(2)}</dd>
        </div>
        <div>
          <dt>Details</dt>
          <dd>{workforceJoinFee.description}</dd>
        </div>
      </dl>
      <p className="note">
        Pricing and category are controlled in admin settings and should come from backend API.
      </p>
      <div className="actions">
        <button className="button" type="button">
          Pay and join workforce
        </button>
        <Link className="button secondary" to="/admin/payment-settings">
          View admin settings
        </Link>
      </div>
    </PageSection>
  )
}
