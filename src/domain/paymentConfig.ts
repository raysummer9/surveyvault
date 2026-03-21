/**
 * Fallback crypto deposit addresses when `platform_payment_settings` is missing or not migrated.
 * Live values are loaded from the DB (`fetchPlatformPaymentSettings`) on the payment page and editable at
 * Admin → Payment settings → Deposit addresses.
 */
export const paymentAddresses: Record<string, string> = {
  btc: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
  eth: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
  usdt: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
}

/** Fallback payment window (minutes) if DB row is unavailable. */
export const PAYMENT_WINDOW_MINUTES = 45

// Membership tiers / plans: loaded from `payment_categories` via `src/domain/paymentCategory.ts`
