import React from 'react'
import { LucideIcon } from 'lucide-react'
import { typography } from '../../styles/designTokens'

interface SectionHeaderProps {
  title: string
  icon?: LucideIcon
  action?: React.ReactNode
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  icon: Icon,
  action,
}) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className={`${typography.sectionTitle} flex items-center gap-2`}>
        {Icon && <Icon className="w-5 h-5 text-blue-600" />}
        {title}
      </h2>
      {action}
    </div>
  )
}
