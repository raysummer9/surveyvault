import type { ReactNode } from 'react'

interface AdminPageSectionProps {
  title: string
  /** Short intro under the title — string or custom node (e.g. links). */
  description?: ReactNode
  children?: ReactNode
}

export function AdminPageSection({ title, description, children }: AdminPageSectionProps) {
  return (
    <section className="page">
      <header className="page-header">
        <h2>{title}</h2>
        {description != null && description !== '' ? (
          typeof description === 'string' ? <p>{description}</p> : <div className="page-header-description">{description}</div>
        ) : null}
      </header>
      <div className="panel">{children}</div>
    </section>
  )
}
