import { useState } from 'react'
import { Check } from 'lucide-react'
import { propertyTypes, PropertyTypeOption } from '../constants/propertyTypes'
import { cn } from '@/lib/utils'

interface PropertyTypeFilterProps {
  selectedType?: string
  onChange: (type: string) => void
  className?: string
  layout?: 'grid' | 'list'
  showDescription?: boolean
}

export default function PropertyTypeFilter({
  selectedType,
  onChange,
  className,
  layout = 'grid',
  showDescription = false
}: PropertyTypeFilterProps) {
  const [hoveredType, setHoveredType] = useState<string | null>(null)

  const handleTypeSelect = (type: PropertyTypeOption) => {
    onChange(type.value)
  }

  const gridSize = layout === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'

  return (
    <div className={cn('space-y-4', className)}>
      <h4 className="text-sm font-medium text-gray-900">Property Type</h4>

      <div className={`${gridSize} gap-3`}>
        {propertyTypes.map((type) => {
          const Icon = type.icon
          const isSelected = selectedType === type.value
          const isHovered = hoveredType === type.value

          return (
            <button
              key={type.value}
              onClick={() => handleTypeSelect(type)}
              onMouseEnter={() => setHoveredType(type.value)}
              onMouseLeave={() => setHoveredType(null)}
              className={cn(
                'relative flex items-start space-x-3 rounded-lg border p-3 text-left transition-all duration-200',
                layout === 'list' ? 'flex-row items-center space-x-4' : 'flex-col items-start space-y-2',
                isSelected
                  ? 'border-primary-500 bg-primary-50 shadow-sm'
                  : isHovered
                  ? 'border-gray-300 bg-gray-50 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              )}
            >
              {/* Icon */}
              <div className={cn(
                'flex-shrink-0 rounded-lg border',
                type.color,
                isSelected ? 'ring-2 ring-primary-500' : '',
                layout === 'list' ? 'p-2' : 'p-3'
              )}>
                <Icon className={cn(
                  'h-5 w-5',
                  layout === 'list' ? 'size-5' : 'size-5'
                )} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className={cn(
                    'font-medium',
                    isSelected ? 'text-primary-900' : 'text-gray-900'
                  )}>
                    {type.label}
                  </span>
                  {isSelected && (
                    <Check className="h-4 w-4 text-primary-600" />
                  )}
                </div>

                {showDescription && (
                  <p className={cn(
                    'text-xs mt-1',
                    isSelected ? 'text-primary-700' : 'text-gray-600'
                  )}>
                    {type.description}
                  </p>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Selected Type Display */}
      {selectedType && (
        <div className="mt-4 rounded-md bg-primary-50 p-3">
          <p className="text-sm text-primary-700">
            Selected: <span className="font-semibold">
              {propertyTypes.find(t => t.value === selectedType)?.label}
            </span>
          </p>
        </div>
      )}

      {/* Clear Selection */}
      {selectedType && (
        <button
          onClick={() => onChange('')}
          className="text-sm text-primary-600 hover:text-primary-700 transition-colors"
        >
          Clear selection
        </button>
      )}
    </div>
  )
}