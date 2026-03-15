import type { ReactNode } from 'react'
import { HiOutlineMenu } from 'react-icons/hi'
import { AppSidebarLayout, useSidebar } from './AppSidebarLayout'

interface PageSectionProps {
  title: string
  description: string
  children?: ReactNode
}

function PageSectionHeader({ title }: { title: string }) {
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

export function PageSection({ title, description, children }: PageSectionProps) {
  return (
    <AppSidebarLayout>
      <PageSectionHeader title={title} />
      <section className="page">
        <header className="page-header">
          <h2>{title}</h2>
          <p>{description}</p>
        </header>
        <div className="panel">{children}</div>
      </section>
    </AppSidebarLayout>
  )
}
