import React from 'react'
import { LucideIcon, ArrowRight } from 'lucide-react'

interface QuickActionCardProps {
  title: string
  icon: LucideIcon
  onClick: () => void
  variant: 'light' | 'sky' | 'indigo' | 'cyan'
}

export const QuickActionCard: React.FC<QuickActionCardProps> = ({
  title,
  icon: Icon,
  onClick,
  variant,
}) => {
  const variantClasses = {
    light: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
    sky: 'bg-sky-50 border-sky-200 hover:bg-sky-100',
    indigo: 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100',
    cyan: 'bg-cyan-50 border-cyan-200 hover:bg-cyan-100',
  }

  const iconClasses = {
    light: 'bg-blue-100 text-blue-600',
    sky: 'bg-sky-100 text-sky-600',
    indigo: 'bg-indigo-100 text-indigo-600',
    cyan: 'bg-cyan-100 text-cyan-600',
  }

  return (
    <button
      onClick={onClick}
      className={`
        group relative p-4 rounded-xl border-2 transition-all duration-300
        hover:shadow-lg hover:scale-105
        ${variantClasses[variant]}
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${iconClasses[variant]}`}>
            <Icon className="w-5 h-5" />
          </div>
          <span className="font-medium text-gray-900">{title}</span>
        </div>
        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
      </div>
    </button>
  )
}
