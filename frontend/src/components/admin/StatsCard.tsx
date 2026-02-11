import React from 'react'
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: number | string
  icon: LucideIcon
  trend?: string
  variant?: 'pink' | 'yellow' | 'purple' | 'mint' | 'blue' | 'coral'
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  variant = 'blue',
}) => {
  // Soft pastel color schemes inspired by the reference design
  const colorClasses = {
    pink: 'bg-[#FFE5E5]',
    yellow: 'bg-[#FFF4D6]',
    purple: 'bg-[#E5E0FF]',
    mint: 'bg-[#D6F5E5]',
    blue: 'bg-[#E0F2FE]',
    coral: 'bg-[#FFE4E1]',
  }

  const iconColorClasses = {
    pink: 'text-[#FF6B9D]',
    yellow: 'text-[#FFB84D]',
    purple: 'text-[#9B87F5]',
    mint: 'text-[#4ADE80]',
    blue: 'text-[#38BDF8]',
    coral: 'text-[#FF8C7A]',
  }

  return (
    <div className={`${colorClasses[variant]} rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:scale-105 border border-white/50`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className={`inline-flex items-center justify-center p-3 rounded-xl bg-white/70 mb-4 ${iconColorClasses[variant]}`}>
            <Icon className="h-6 w-6" strokeWidth={2.5} />
          </div>
          <p className="text-gray-700 text-sm font-medium mb-1">{title}</p>
          <p className="text-4xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className={`text-sm mt-2 font-medium ${iconColorClasses[variant]}`}>
              {trend}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default StatsCard
