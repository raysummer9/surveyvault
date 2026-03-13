import { PageSection } from '../../shared/ui/PageSection'

export function DashboardPage() {
  return (
    <PageSection
      title="Earnings Dashboard"
      description="Track completed surveys, pending review rewards, and paid-out earnings."
    >
      <div className="stats-row">
        <article className="stat">
          <p className="stat-label">Completed surveys</p>
          <p className="stat-value">12</p>
        </article>
        <article className="stat">
          <p className="stat-label">Pending payout</p>
          <p className="stat-value">$34.70</p>
        </article>
        <article className="stat">
          <p className="stat-label">Total paid</p>
          <p className="stat-value">$140.90</p>
        </article>
      </div>
    </PageSection>
  )
}
