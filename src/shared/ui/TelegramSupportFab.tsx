import { FaTelegram } from 'react-icons/fa'
import { useTelegramSupportUrl } from '../../features/support/useTelegramSupportUrl'

/** Fixed bottom-right link to Telegram support (dashboard shell). Hidden when no URL is configured. */
export function TelegramSupportFab() {
  const telegramUrl = useTelegramSupportUrl()
  if (!telegramUrl) return null

  return (
    <a
      href={telegramUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="telegram-support-fab"
      aria-label="Contact support on Telegram"
    >
      <FaTelegram aria-hidden />
    </a>
  )
}
