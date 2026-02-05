import { useState } from 'react'
import { Filter, MapPin, Wifi, Car, Utensils, Tv, Calendar, X } from 'lucide-react'
import Button from './ui/Button'
import Input from './ui/Input'
import Select from './ui/Select'
import PriceRangeFilter from './PriceRangeFilter'
import PropertyTypeFilter from './PropertyTypeFilter'
import AmenitiesFilter from './AmenitiesFilter'
import { cn } from '@/lib/utils'

interface FilterPanelProps {
  onFiltersChange: (filters: any) => void
  isOpen: boolean
  onToggle: () => void
  isMobile?: boolean
}

// Areas data - matches backend schema and SearchBar component
const areas = [
  'Dhanmondi',
  'Gulshan',
  'Banani',
  'Uttara',
  'Mirpur',
  'Mohammadpur',
  'Pallabi',
  'Adabor',
  'Shyamoli',
  'Badda',
]


const bedrooms = [
  { value: '1', label: '1 Bedroom' },
  { value: '2', label: '2 Bedrooms' },
  { value: '3', label: '3 Bedrooms' },
  { value: '4+', label: '4+ Bedrooms' },
]


export default function FilterPanel({ onFiltersChange, isOpen, onToggle, isMobile = false }: FilterPanelProps) {
  const [filters, setFilters] = useState({
    area: '',
    propertyType: '',
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    amenities: [] as string[],
  })

  const handleFilterChange = (key: string, value: string | string | number[]) => {
    const updatedFilters = {
      ...filters,
      [key]: value,
    }
    setFilters(updatedFilters)
    onFiltersChange(updatedFilters)
  }

  const handlePriceRangeChange = (minPrice?: number, maxPrice?: number) => {
    const updatedFilters = {
      ...filters,
      minPrice: minPrice?.toString() || '',
      maxPrice: maxPrice?.toString() || '',
    }
    setFilters(updatedFilters)
    onFiltersChange(updatedFilters)
  }

  const handleAmenityToggle = (amenityId: string) => {
    const updatedAmenities = filters.amenities.includes(amenityId)
      ? filters.amenities.filter((id) => id !== amenityId)
      : [...filters.amenities, amenityId]

    handleFilterChange('amenities', updatedAmenities)
  }

  const clearFilters = () => {
    const clearedFilters = {
      area: '',
      propertyType: '',
      minPrice: '',
      maxPrice: '',
      bedrooms: '',
      amenities: [] as string[],
    }
    setFilters(clearedFilters)
    onFiltersChange(clearedFilters)
  }

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
            placeholder="Select area"
            options={areas.map(area => ({ value: area, label: area }))}
            value={filters.area}
            onChange={(value) => handleFilterChange('area', value)}
            className="w-full"
          />
          {filters.area && (
            <p className="mt-1 text-xs text-gray-500">
              Showing properties in {filters.area}
            </p>
          )}
        </div>

        {/* Property Type */}
        <PropertyTypeFilter
          selectedType={filters.propertyType}
          onChange={(value) => handleFilterChange('propertyType', value)}
          showDescription={true}
        />

        {/* Price Range */}
        <PriceRangeFilter
          minPrice={filters.minPrice}
          maxPrice={filters.maxPrice}
          onChange={handlePriceRangeChange}
        />

        {/* Bedrooms */}
        <div>
          <h4 className="mb-2 text-sm font-medium text-gray-900">Bedrooms</h4>
          <div className="grid grid-cols-1 gap-2">
            {bedrooms.map((beds) => (
              <label
                key={beds.value}
                className="flex cursor-pointer items-center rounded-lg border border-gray-200 p-2 transition-colors hover:bg-gray-50"
              >
                <input
                  type="radio"
                  name="bedrooms"
                  className="mr-3 border-gray-300 text-primary-600 focus:ring-primary-600"
                  checked={filters.bedrooms === beds.value}
                  onChange={() => handleFilterChange('bedrooms', beds.value)}
                />
                <span className="text-sm text-gray-700">{beds.label}</span>
              </label>
            ))}
          </div>
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
