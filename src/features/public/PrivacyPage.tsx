import { Link } from 'react-router-dom'
import { APP_NAME } from '../../config/brand'
import { PublicPageLayout } from '../../shared/ui/PublicPageLayout'

export function PrivacyPage() {
  return (
    <PublicPageLayout>
      <div className="legal-page">
        <h1>Privacy Policy</h1>
        <p className="legal-page-updated">Last updated: {new Date().toLocaleDateString()}</p>
        <p>
          {APP_NAME} (&quot;we&quot;) respects your privacy. This policy describes how we handle information when you use
          our website and services.
        </p>
        <h2>Information we collect</h2>
        <p>
          We collect information you provide (such as account details, onboarding documents where required, and survey
          responses) and technical data needed to operate the service (such as device and log data).
        </p>
        <h2>How we use information</h2>
        <p>
          We use data to operate the platform, verify accounts, process rewards and withdrawals, comply with law, and
          improve our services.
        </p>
        <h2>Contact</h2>
        <p>For privacy-related questions, contact us through the support channels listed on the site.</p>
        <p>
          <Link to="/">← Back to home</Link>
        </p>
      </div>
    </PublicPageLayout>
  )
}
