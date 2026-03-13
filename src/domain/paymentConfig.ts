export type PaymentCategory = 'standard' | 'priority' | 'enterprise'

export interface WorkforceJoinFee {
  category: PaymentCategory
  priceUsd: number
  description: string
}

// Temporary client-side values; replace with API data from admin settings.
export const workforceJoinFee: WorkforceJoinFee = {
  category: 'standard',
  priceUsd: 25,
  description: 'One-time fee to unlock workforce survey access and payouts.',
}
