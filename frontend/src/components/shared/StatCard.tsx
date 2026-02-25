import React from 'react'
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'
import { colors, typography, radius, shadows } from '../../styles/designTokens'

interface TrendIndicator {
  value: number
  direction: 'up' | 'down'
}

interface StatCardProps {
  title: string
  value: number | string
  icon: LucideIcon
  subtitle?: string
  variant: 'light' | 'sky' | 'indigo' | 'cyan' | 'shadcn'
  onClick?: () => void
  trend?: TrendIndicator
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  subtitle,
  variant,
  onClick,
  trend,
}) => {
  const variantStyles = colors.stats[variant]
  const isClickable = Boolean(onClick)
  const isShadcn = variant === 'shadcn'

  return (
    <div
      onClick={onClick}
      className={`
        ${variantStyles.bg}
        ${radius.card}
        ${isShadcn ? 'shadow-sm' : shadows.card}
        p-6 border ${variantStyles.border}
        ${isClickable ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}
      `}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 ${isShadcn ? 'bg-blue-50' : 'bg-white'} rounded-lg ${variantStyles.icon}`}>
          <Icon className="h-5 w-5" strokeWidth={2} />
        </div>
      </div>
      <p className={`text-sm font-medium ${isShadcn ? 'text-gray-500' : typography.cardTitle}`}>{title}</p>
      <p className={`${isShadcn ? 'text-3xl font-bold text-gray-900' : `${typography.statValue} ${variantStyles.text}`} mt-1`}>
        {value}
      </p>
      {trend && (
        <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trend.direction === 'up' ? 'text-green-600' : 'text-red-500'}`}>
          {trend.direction === 'up' ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          <span>{trend.direction === 'up' ? '+' : '-'}{trend.value}% from last month</span>
        </div>
      )}
      {subtitle && !trend && (
        <p className="text-xs mt-2 text-gray-500">{subtitle}</p>
      )}
    </div>
  )
}
