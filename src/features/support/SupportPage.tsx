import { useCallback, useState } from 'react'
import { FiBell, FiChevronDown, FiCopy, FiCreditCard, FiList, FiMail, FiMessageCircle } from 'react-icons/fi'
import { IoWalletOutline } from 'react-icons/io5'
import { HiOutlineMenu } from 'react-icons/hi'
import { AppSidebarLayout, useSidebar } from '../../shared/ui/AppSidebarLayout'
import { APP_NAME } from '../../config/brand'
import { SUPPORT_EMAIL, supportMailto } from '../../config/support'

const FAQ_ITEMS = [
  {
    q: 'How long do withdrawals take to process?',
    a: 'Withdrawal requests are typically reviewed within 1–3 business days. Once approved, payout timing depends on your chosen method (e.g. PayPal or bank). You’ll see status updates in your Withdrawals area.',
  },
  {
    q: 'Why is my survey status “Pending”?',
    a: 'Pending usually means your submission is being validated or the reward is in a holding period. If it stays pending longer than expected, contact support with the survey name and approximate completion time.',
  },
  {
    q: 'Can I upgrade my workforce tier later?',
    a: 'Yes. After you’re in the workforce, open **Upgrade plan** in the sidebar (or **Surveys** → **Upgrade to unlock** when a survey needs a higher tier). You’ll pay a one-time crypto fee for the higher tier; an admin verifies the payment before your new tier applies.',
  },
]

function SupportMobileHeader() {
  const { openMobileSidebar } = useSidebar()
  return (
    <header className="dashboard-mobile-header support-page-mobile-header">
      <button
        type="button"
        className="profile-mobile-menu-btn"
        onClick={openMobileSidebar}
        aria-label="Open dashboard menu"
      >
        <HiOutlineMenu />
      </button>
      <span className="support-page-mobile-title">Help &amp; Support</span>
      <span className="support-header-bell" aria-hidden="true">
        <FiBell />
      </span>
    </header>
  )
}

export function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)

  const copyEmail = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(SUPPORT_EMAIL)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      /* ignore */
    }
  }, [])

  const toggleFaq = (index: number) => {
    setOpenFaq((prev) => (prev === index ? null : index))
  }

  return (
    <AppSidebarLayout>
      <SupportMobileHeader />

      <section className="page support-page">
        <div className="support-page-shell">
          <div className="support-page-topbar">
            <h1 className="support-page-heading">Help &amp; Support</h1>
            <span className="support-header-bell" aria-hidden="true">
              <FiBell />
            </span>
          </div>

          <div className="support-hero support-hero--new">
            <div className="support-hero-icon-wrap" aria-hidden>
              <FiMessageCircle className="support-hero-bubble" />
              <span className="support-hero-qmark">?</span>
            </div>
            <h2 className="support-hero-heading">How can we help you today?</h2>
            <p className="support-hero-lead">
              Get help with surveys, withdrawals, membership, or your account. Our team is ready to assist you.
            </p>
          </div>

          <article className="support-email-panel">
            <div className="support-email-panel-left">
              <div className="support-email-panel-icon" aria-hidden>
                <FiMail />
              </div>
              <div>
                <h3 className="support-email-panel-title">Email Support</h3>
                <p className="support-email-panel-desc">
                  Send us an email and include your account email if you can — we&apos;ll get back to you as soon as
                  possible.
                </p>
              </div>
            </div>
            <div className="support-email-panel-right">
              <span className="support-email-kicker">Support email</span>
              <div className="support-email-row">
                <span className="support-email-value">{SUPPORT_EMAIL}</span>
                <button
                  type="button"
                  className="support-email-copy"
                  onClick={copyEmail}
                  aria-label={copied ? 'Copied' : 'Copy email address'}
                >
                  <FiCopy aria-hidden />
                  {copied ? <span className="support-email-copied">Copied</span> : null}
                </button>
              </div>
              <a href={supportMailto(`${APP_NAME} support`)} className="support-email-mailto">
                Tap to open your mail app
              </a>
            </div>
          </article>

          <div className="support-tips-section">
            <h3 className="support-tips-heading">
              <span className="support-tips-sparkle" aria-hidden>
                ✨
              </span>{' '}
              Tips for faster support
            </h3>
            <div className="support-tip-cards">
              <article className="support-tip-card support-tip-card--payments">
                <div className="support-tip-card-head">
                  <FiCreditCard className="support-tip-card-ico" aria-hidden />
                  <span className="support-tip-card-label">Payments</span>
                </div>
                <p className="support-tip-card-text">
                  Include your <strong>transaction reference</strong> or review ID if you&apos;re writing about crypto
                  payments.
                </p>
              </article>
              <article className="support-tip-card support-tip-card--withdrawals">
                <div className="support-tip-card-head">
                  <IoWalletOutline className="support-tip-card-ico" aria-hidden />
                  <span className="support-tip-card-label">Withdrawals</span>
                </div>
                <p className="support-tip-card-text">
                  Mention the <strong>amount</strong> and <strong>date</strong> of your request to help us locate it
                  quickly.
                </p>
              </article>
              <article className="support-tip-card support-tip-card--surveys">
                <div className="support-tip-card-head">
                  <FiList className="support-tip-card-ico" aria-hidden />
                  <span className="support-tip-card-label">Surveys</span>
                </div>
                <p className="support-tip-card-text">
                  Note the <strong>survey title</strong> or link if something didn&apos;t work as expected.
                </p>
              </article>
            </div>
          </div>

          <div className="support-faq-section">
            <h3 className="support-faq-title">Frequently Asked Questions</h3>
            <div className="support-faq-list" role="list">
              {FAQ_ITEMS.map((item, index) => {
                const open = openFaq === index
                return (
                  <div key={item.q} className="support-faq-item" role="listitem">
                    <button
                      type="button"
                      className={`support-faq-trigger ${open ? 'is-open' : ''}`}
                      onClick={() => toggleFaq(index)}
                      aria-expanded={open}
                    >
                      <span className="support-faq-q">{item.q}</span>
                      <FiChevronDown className="support-faq-chevron" aria-hidden />
                    </button>
                    {open ? (
                      <div className="support-faq-answer">
                        {item.a.split('**').map((part, i) =>
                          i % 2 === 1 ? (
                            <strong key={i}>{part}</strong>
                          ) : (
                            <span key={i}>{part}</span>
                          ),
                        )}
                      </div>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>
    </AppSidebarLayout>
  )
}
