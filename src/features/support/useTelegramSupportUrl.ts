import { useEffect, useState } from 'react'
import { fetchPlatformSupportSettings, resolveTelegramSupportUrl } from '../../domain/platformSupportSettings'

/** Loads Telegram support URL from platform settings; null when unset or cleared by admin. */
export function useTelegramSupportUrl(): string | null {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    void fetchPlatformSupportSettings()
      .then((row) => {
        if (!cancelled) setUrl(resolveTelegramSupportUrl(row))
      })
      .catch(() => {
        if (!cancelled) setUrl(null)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return url
}
