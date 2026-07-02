import { useEffect } from 'react'
import { TAWK_EMBED_SRC } from '../../config/tawk'

declare global {
  interface Window {
    Tawk_API?: Record<string, unknown>
    Tawk_LoadStart?: Date
  }
}

const SCRIPT_ATTR = 'data-tawk-to'

/** Loads Tawk.to widget once for the whole SPA (public pages, dashboard, admin). */
export function TawkToChat() {
  useEffect(() => {
    if (!TAWK_EMBED_SRC.trim()) return
    if (document.querySelector(`script[${SCRIPT_ATTR}]`)) return

    window.Tawk_API = window.Tawk_API || {}
    window.Tawk_LoadStart = new Date()

    const script = document.createElement('script')
    script.async = true
    script.src = TAWK_EMBED_SRC
    script.charset = 'UTF-8'
    script.setAttribute('crossorigin', '*')
    script.setAttribute(SCRIPT_ATTR, 'true')

    const firstScript = document.getElementsByTagName('script')[0]
    if (firstScript?.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript)
    } else {
      document.head.appendChild(script)
    }
  }, [])

  return null
}
