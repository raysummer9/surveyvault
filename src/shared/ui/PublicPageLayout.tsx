import type { ReactNode } from 'react'

interface PublicPageLayoutProps {
  children: ReactNode
  /** Optional class for the main content area */
  className?: string
}

/**
 * Simple layout for public pages - no dashboard sidebar, just content.
 * The AppLayout navbar is rendered by the parent.
 */
export function PublicPageLayout({ children, className = '' }: PublicPageLayoutProps) {
  return (
    <main className={`public-page-content ${className}`.trim()}>
      {children}
    </main>
  )
}
