import { useState } from 'react'
import { X, ChevronDown, ChevronRight, Check } from 'lucide-react'
import { amenities, getAmenitiesByCategory, amenityCategories, AmenityOption } from '../constants/amenities'
import { cn } from '@/lib/utils'

interface AmenitiesFilterProps {
  selectedAmenities?: string[]
  onChange: (amenities: string[]) => void
  className?: string
  showCategories?: boolean
  maxSelection?: number
  showTopAmenities?: boolean
}

export default function AmenitiesFilter({
  selectedAmenities = [],
  onChange,
  className,
  showCategories = true,
  maxSelection = 10,
  showTopAmenities = true
}: AmenitiesFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    essential: true,
    comfort: true,
    luxury: true
  })

  const handleAmenityToggle = (amenityId: string) => {
    const updatedAmenities = selectedAmenities.includes(amenityId)
      ? selectedAmenities.filter(id => id !== amenityId)
      : [...selectedAmenities, amenityId]

    if (updatedAmenities.length <= maxSelection || updatedAmenities.length < selectedAmenities.length) {
      onChange(updatedAmenities)
    }
  }

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }))
  }

  const hasReachedMax = selectedAmenities.length >= maxSelection

  const renderAmenity = (amenity: AmenityOption) => {
    const Icon = amenity.icon
    const isSelected = selectedAmenities.includes(amenity.id)
    const isDisabled = hasReachedMax && !isSelected

    return (
      <label
        key={amenity.id}
        className={cn(
          'flex items-center space-x-3 rounded-lg border p-3 transition-all duration-200 cursor-pointer',
          isSelected
            ? 'border-primary-500 bg-primary-50 shadow-sm'
            : isDisabled
            ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
        )}
      >
        <input
          type="checkbox"
          className="sr-only"
          checked={isSelected}
          onChange={() => handleAmenityToggle(amenity.id)}
          disabled={isDisabled}
        />

        {/* Icon */}
        <div className={cn(
          'flex-shrink-0 rounded-lg border p-2',
          amenity.color,
          isSelected ? 'ring-2 ring-primary-500' : ''
        )}>
          <Icon className="h-5 w-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className={cn(
              'font-medium',
              isSelected ? 'text-primary-900' : 'text-gray-900'
            )}>
              {amenity.label}
            </span>
            {isSelected && (
              <Check className="h-4 w-4 text-primary-600" />
            )}
          </div>
          {showCategories && (
            <span className={cn(
              'text-xs',
              isSelected ? 'text-primary-600' : 'text-gray-500'
            )}>
              {amenityCategories[amenity.category as keyof typeof amenityCategories]}
            </span>
          )}
        </div>
      </label>
    )
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* Header - Clickable to expand/collapse */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-medium text-gray-900">Amenities</h4>
          {selectedAmenities.length > 0 && (
            <span className="text-xs text-gray-600 bg-primary-100 px-2 py-0.5 rounded-full">
              {selectedAmenities.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {selectedAmenities.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onChange([])
              }}
              className="rounded-md p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          )}
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </button>

      {/* Collapsed Summary */}
      {!isExpanded && selectedAmenities.length > 0 && (
        <div className="text-xs text-gray-600">
          {selectedAmenities.slice(0, 3).map(id => {
            const amenity = amenities.find(a => a.id === id)
            return amenity?.label
          }).filter(Boolean).join(', ')}
          {selectedAmenities.length > 3 && ` +${selectedAmenities.length - 3} more`}
        </div>
      )}

      {/* Expanded Content */}
      {isExpanded && (
        <>
          {/* Selection Limit Warning */}
          {hasReachedMax && (
            <div className="rounded-md bg-orange-50 p-2 text-xs text-orange-700">
              Maximum {maxSelection} amenities can be selected
            </div>
          )}

          {/* Top Amenities */}
          {showTopAmenities && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-gray-600">Popular Amenities</p>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {amenities.slice(0, 6).map(renderAmenity)}
          </div>
        </div>
      )}

      {/* Categorized Amenities */}
      {showCategories && (
        <div className="space-y-4 border-t pt-4">
          {Object.entries(amenityCategories).map(([categoryKey, categoryLabel]) => (
            <div key={categoryKey}>
              <button
                onClick={() => toggleCategory(categoryKey)}
                className="flex w-full items-center justify-between"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900">
                    {categoryLabel}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({amenities.filter(a => a.category === categoryKey).length})
                  </span>
                </div>
                {expandedCategories[categoryKey] ? (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                )}
              </button>

              {expandedCategories[categoryKey] && (
                <div className="mt-2 grid grid-cols-1 gap-2">
                  {getAmenitiesByCategory(categoryKey).map(renderAmenity)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

          {/* All Amenities (if categories not shown) */}
          {!showCategories && (
            <div className="grid grid-cols-1 gap-2">
              {amenities.map(renderAmenity)}
            </div>
          )}
        </>
      )}
    </div>
  )
}