import { propertyTypes, PropertyTypeOption } from '../constants/propertyTypes'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

interface PropertyTypeFilterProps {
  selectedType?: string
  onChange: (type: string) => void
  className?: string
}

export default function PropertyTypeFilter({
  selectedType,
  onChange,
  className
}: PropertyTypeFilterProps) {
  const handleTypeSelect = (type: PropertyTypeOption) => {
    // Toggle selection: if already selected, deselect it
    if (selectedType === type.value) {
      onChange('')
    } else {
      onChange(type.value)
    }
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-900">Property Type</h4>
        {selectedType && (
          <button
            onClick={() => onChange('')}
            className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 transition-colors"
          >
            <X className="h-3 w-3" />
            Clear
          </button>
        )}
      </div>

      {/* Wrapped Pills - All visible, no scrolling */}
      <div className="flex flex-wrap gap-2">
        {propertyTypes.map((type) => {
          const Icon = type.icon
          const isSelected = selectedType === type.value

          return (
            <button
              key={type.value}
              onClick={() => handleTypeSelect(type)}
              className={cn(
                'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200',
                'border whitespace-nowrap',
                isSelected
                  ? 'bg-primary-600 text-white border-primary-600 shadow-md'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span>{type.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}