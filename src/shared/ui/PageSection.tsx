import type { ReactNode } from 'react'

interface PageSectionProps {
  title: string
  description: string
  children?: ReactNode
}

export function PageSection({ title, description, children }: PageSectionProps) {
  return (
    <section className="page">
      <header className="page-header">
        <h2>{title}</h2>
        <p>{description}</p>
      </header>
      <div className="panel">{children}</div>
    </section>
  )
}
