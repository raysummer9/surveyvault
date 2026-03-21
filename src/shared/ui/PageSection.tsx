import type { ReactNode } from 'react'
import { HiOutlineMenu } from 'react-icons/hi'
import { AppSidebarLayout, useSidebar } from './AppSidebarLayout'

interface PageSectionProps {
  title: string
  description: string
  /** Shown next to the page title (e.g. membership tier badge) */
  headerExtra?: ReactNode
  children?: ReactNode
}

export function PageSectionHeader({ title }: { title: string }) {
  const { openMobileSidebar } = useSidebar()
  return (
    <header className="dashboard-mobile-header">
      <button
        type="button"
        className="profile-mobile-menu-btn"
        onClick={openMobileSidebar}
        aria-label="Open dashboard menu"
      >
        <HiOutlineMenu />
      </button>
      <span>{title}</span>
    </header>
  )
}

export function PageSection({ title, description, headerExtra, children }: PageSectionProps) {
  return (
    <AppSidebarLayout>
      <PageSectionHeader title={title} />
      <section className="page">
        <header className="page-header">
          <div className="page-header-title-row">
            <h2>{title}</h2>
            {headerExtra}
          </div>
          <p>{description}</p>
        </header>
        <div className="panel">{children}</div>
      </section>
    </AppSidebarLayout>
  )
}
