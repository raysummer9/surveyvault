import type { ReactNode } from 'react'
import {
  FaCar,
  FaGraduationCap,
  FaHeartbeat,
  FaLeaf,
  FaMoneyBillWave,
  FaUtensils,
} from 'react-icons/fa'
import { HiOutlineFilm, HiOutlineGlobeAlt, HiOutlineSun } from 'react-icons/hi2'
import { IoPhonePortraitOutline } from 'react-icons/io5'
import type { SurveyCategory } from '../../domain/surveyTypes'

export type SurveyCategoryStyle = {
  /** Short label for chips (e.g. Food) */
  shortLabel: string
  /** CSS background for icon tile */
  iconBg: string
  icon: ReactNode
}

const meta: Record<SurveyCategory, SurveyCategoryStyle> = {
  Technology: {
    shortLabel: 'Technology',
    iconBg: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    icon: <IoPhonePortraitOutline aria-hidden />,
  },
  Lifestyle: {
    shortLabel: 'Lifestyle',
    iconBg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    icon: <HiOutlineSun aria-hidden />,
  },
  Finance: {
    shortLabel: 'Finance',
    iconBg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    icon: <FaMoneyBillWave aria-hidden />,
  },
  Health: {
    shortLabel: 'Health',
    iconBg: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
    icon: <FaHeartbeat aria-hidden />,
  },
  'Food & Beverages': {
    shortLabel: 'Food',
    iconBg: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
    icon: <FaUtensils aria-hidden />,
  },
  Travel: {
    shortLabel: 'Travel',
    iconBg: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    icon: <HiOutlineGlobeAlt aria-hidden />,
  },
  Education: {
    shortLabel: 'Education',
    iconBg: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    icon: <FaGraduationCap aria-hidden />,
  },
  Environment: {
    shortLabel: 'Environment',
    iconBg: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    icon: <FaLeaf aria-hidden />,
  },
  Media: {
    shortLabel: 'Media',
    iconBg: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
    icon: <HiOutlineFilm aria-hidden />,
  },
  Automotive: {
    shortLabel: 'Automotive',
    iconBg: 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
    icon: <FaCar aria-hidden />,
  },
}

export function getSurveyCategoryStyle(category: SurveyCategory): SurveyCategoryStyle {
  return meta[category] ?? meta.Technology
}
