import React from 'react'
import { LucideIcon } from 'lucide-react'
import { colors, typography, radius, shadows } from '../../styles/designTokens'

interface StatCardProps {
  title: string
  value: number | string
  icon: LucideIcon
  subtitle?: string
  variant: 'light' | 'sky' | 'indigo' | 'cyan'
  onClick?: () => void
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  subtitle,
  variant,
  onClick,
}) => {
  const variantStyles = colors.stats[variant]
  const isClickable = Boolean(onClick)

  return (
    <div
      onClick={onClick}
      className={`
        ${variantStyles.bg}
        ${radius.card}
        ${shadows.card}
        p-6 border ${variantStyles.border}
        ${isClickable ? 'cursor-pointer hover:scale-105 transition-all' : ''}
      `}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-3 bg-white rounded-lg ${variantStyles.icon}`}>
          <Icon className="h-6 w-6" strokeWidth={2.5} />
        </div>
      </div>
      <p className={typography.cardTitle}>{title}</p>
      <p className={`${typography.statValue} ${variantStyles.text} mt-2`}>{value}</p>
      {subtitle && (
        <p className="text-xs mt-2 text-gray-500">{subtitle}</p>
      )}
    </div>
  )
}
