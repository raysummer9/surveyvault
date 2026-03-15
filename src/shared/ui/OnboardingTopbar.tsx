import type { ReactNode } from 'react'
import { HiOutlineMenu } from 'react-icons/hi'
import { useSidebar } from './AppSidebarLayout'

type OnboardingTopbarProps = {
  title: string
  subtitle?: string
  chips?: ReactNode
}

export function OnboardingTopbar({ title, subtitle, chips }: OnboardingTopbarProps) {
  const { openMobileSidebar } = useSidebar()

  return (
    <header className="onboarding-topbar profile-topbar">
      <button
        type="button"
        className="profile-mobile-menu-btn"
        onClick={openMobileSidebar}
        aria-label="Open dashboard menu"
      >
        <HiOutlineMenu />
      </button>
      <div>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {chips && <div className="profile-topbar-chips">{chips}</div>}
    </header>
  )
}
