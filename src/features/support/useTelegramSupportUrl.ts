import { useEffect, useState } from 'react'
import { DEFAULT_TELEGRAM_SUPPORT_URL } from '../../config/support'
import { fetchPlatformSupportSettings, resolveTelegramSupportUrl } from '../../domain/platformSupportSettings'

/** Loads Telegram support URL from platform settings; falls back to config default. */
export function useTelegramSupportUrl(): string {
  const [url, setUrl] = useState<string>(DEFAULT_TELEGRAM_SUPPORT_URL)

  useEffect(() => {
    let cancelled = false
    void fetchPlatformSupportSettings()
      .then((row) => {
        if (!cancelled) setUrl(resolveTelegramSupportUrl(row))
      })
      .catch(() => {
        /* keep default */
      })
    return () => {
      cancelled = true
    }
  }, [])

  return url
}
