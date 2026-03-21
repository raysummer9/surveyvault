import type { MembershipTier } from '../../domain/paymentCategory'

function membershipBadgeVariant(slug: string | null | undefined): 'silver' | 'gold' | 'platinum' | 'default' {
  const s = (slug ?? '').toLowerCase()
  if (s === 'silver' || s === 'gold' || s === 'platinum') return s
  return 'default'
}

type MembershipTierBadgeProps = {
  tier: MembershipTier
  /** Sidebar account card: compact, stacked below name */
  variant?: 'sidebar' | 'dashboard' | 'inline'
}

export function MembershipTierBadge({ tier, variant = 'dashboard' }: MembershipTierBadgeProps) {
  const label = (tier.badge ?? tier.name).trim() || 'Member'
  const v = membershipBadgeVariant(tier.slug)
  const className = [
    'member-account-tier-badge',
    `member-account-tier-badge--${v}`,
    variant === 'sidebar' && 'member-account-tier-badge--sidebar',
    variant === 'inline' && 'member-account-tier-badge--inline',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <span className={className} title={`Membership: ${tier.name}`}>
      {label}
    </span>
  )
}
