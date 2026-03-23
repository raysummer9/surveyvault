import { FaTelegram } from 'react-icons/fa'
import { TELEGRAM_SUPPORT_URL } from '../../config/support'

/** Fixed bottom-right link to Telegram support (dashboard shell). */
export function TelegramSupportFab() {
  return (
    <a
      href={TELEGRAM_SUPPORT_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="telegram-support-fab"
      aria-label="Contact support on Telegram"
    >
      <FaTelegram aria-hidden />
    </a>
  )
}
