import { useState, useCallback } from 'react'
import { MapPin, X } from 'lucide-react'
import Button from './ui/Button'
import Select from './ui/Select'
import PriceRangeFilter from './PriceRangeFilter'
import PropertyTypeFilter from './PropertyTypeFilter'
import AmenitiesFilter from './AmenitiesFilter'
import { cn } from '@/lib/utils'
import { AREAS, LOCATION_MAP } from '../constants/areas'

interface FilterPanelProps {
  onFiltersChange: (filters: any) => void
  isOpen: boolean
  onToggle: () => void
  isMobile?: boolean
}

const bedrooms = [
  { value: '1', label: '1 Bedroom' },
  { value: '2', label: '2 Bedrooms' },
  { value: '3', label: '3 Bedrooms' },
  { value: '4+', label: '4+ Bedrooms' },
]


export default function FilterPanel({ onFiltersChange, isOpen, onToggle, isMobile = false }: FilterPanelProps) {
  const [filters, setFilters] = useState({
    area: '',
    subArea: '',
    propertyType: '',
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    amenities: [] as string[],
  })

  const handleFilterChange = useCallback((key: string, value: string | string[]) => {
    setFilters(prev => {
      const updatedFilters = {
        ...prev,
        [key]: value,
      }
      onFiltersChange(updatedFilters)
      return updatedFilters
    })
  }, [onFiltersChange])

  const handlePriceRangeChange = useCallback((minPrice?: number, maxPrice?: number) => {
    setFilters(prev => {
      const updatedFilters = {
        ...prev,
        minPrice: minPrice?.toString() || '',
        maxPrice: maxPrice?.toString() || '',
      }
      onFiltersChange(updatedFilters)
      return updatedFilters
    })
  }, [onFiltersChange])

  const clearFilters = useCallback(() => {
    const clearedFilters = {
      area: '',
      subArea: '',
      propertyType: '',
      minPrice: '',
      maxPrice: '',
      bedrooms: '',
      amenities: [] as string[],
    }
    setFilters(clearedFilters)
    onFiltersChange(clearedFilters)
  }, [onFiltersChange])

  const hasActiveFilters = Object.values(filters).some(
    (value) =>
      value !== '' &&
      value !== null &&
      value !== undefined &&
      (Array.isArray(value) ? value.length > 0 : true)
  )

  if (!isOpen) return null

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      <div className={cn(
        "rounded-lg border border-gray-200 bg-white p-6 shadow-sm",
        isMobile && isOpen && "fixed inset-x-4 top-20 bottom-4 z-50 overflow-y-auto lg:relative lg:inset-auto"
      )}>
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        <div className="flex items-center space-x-3">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-primary-600 hover:text-primary-700"
            >
              Clear All
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onToggle}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Area Filter */}
        <div>
          <h4 className="mb-2 flex items-center text-sm font-medium text-gray-900">
            <MapPin className="mr-2 h-4 w-4" />
            Area
          </h4>
          <Select
            options={[{ value: '', label: 'All Areas' }, ...AREAS.map(area => ({ value: area, label: area }))]}
            value={filters.area}
            onChange={(value) => {
              handleFilterChange('area', value)
              handleFilterChange('subArea', '')
            }}
            className="w-full"
          />
        </div>

        {/* Block Filter */}
        {filters.area && (
          <div>
            <Select
              label="Block"
              options={[{ value: '', label: 'All Blocks' }, ...(LOCATION_MAP[filters.area] || []).map(b => ({ value: b, label: b }))]}
              value={filters.subArea}
              onChange={(value) => handleFilterChange('subArea', value)}
              className="w-full"
            />
          </div>
        )}

        {/* Property Type */}
        <PropertyTypeFilter
          selectedType={filters.propertyType}
          onChange={(value) => handleFilterChange('propertyType', value)}
        />

        {/* Price Range */}
        <PriceRangeFilter
          minPrice={filters.minPrice}
          maxPrice={filters.maxPrice}
          onChange={handlePriceRangeChange}
        />

        {/* Bedrooms - Compact Select */}
        <div>
          <Select
            label="Bedrooms"
            value={filters.bedrooms}
            onChange={(value) => handleFilterChange('bedrooms', value)}
            options={[
              { value: '', label: 'Any' },
              ...bedrooms
            ]}
            className="text-sm"
          />
        </div>

        {/* Amenities */}
        <AmenitiesFilter
          selectedAmenities={filters.amenities}
          onChange={(amenities) => handleFilterChange('amenities', amenities)}
          showCategories={true}
        />
      </div>
      </div>
    </>
  )
}
