import type { ReactNode } from 'react'

interface AdminPageSectionProps {
  title: string
  description: string
  children?: ReactNode
}

export function AdminPageSection({ title, description, children }: AdminPageSectionProps) {
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
