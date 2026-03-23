import { Link } from 'react-router-dom'
import Markdown from 'react-markdown'

type Props = {
  markdown: string
  className?: string
}

/** Renders stored markdown; internal paths use React Router. */
export function LegalMarkdown({ markdown, className }: Props) {
  return (
    <div className={className}>
      <Markdown
        components={{
          a: ({ href, children }) => {
            if (href?.startsWith('/') && !href.startsWith('//')) {
              return <Link to={href}>{children}</Link>
            }
            return (
              <a href={href} target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            )
          },
        }}
      >
        {markdown}
      </Markdown>
    </div>
  )
}
