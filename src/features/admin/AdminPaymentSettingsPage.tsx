import { workforceJoinFee } from '../../domain/paymentConfig'
import { PageSection } from '../../shared/ui/PageSection'

export function AdminPaymentSettingsPage() {
  return (
    <PageSection
      title="Admin: Workforce Payment Settings"
      description="Configure the one-time joining fee category and amount shown during onboarding."
    >
      <div className="panel-muted">
        <p>
          This screen is a frontend scaffold. In production, values should be editable from admin
          API and persisted in your database.
        </p>
      </div>
      <dl className="key-values">
        <div>
          <dt>Current category</dt>
          <dd>{workforceJoinFee.category}</dd>
        </div>
        <div>
          <dt>Current one-time fee</dt>
          <dd>${workforceJoinFee.priceUsd.toFixed(2)}</dd>
        </div>
      </dl>
      <div className="actions">
        <button className="button" type="button">
          Update settings (coming soon)
        </button>
      </div>
    </PageSection>
  )
}
