import { FaTelegram } from 'react-icons/fa'
import { useTelegramSupportUrl } from '../../features/support/useTelegramSupportUrl'

/** Fixed bottom-right link to Telegram support (dashboard shell). */
export function TelegramSupportFab() {
  const telegramUrl = useTelegramSupportUrl()

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
