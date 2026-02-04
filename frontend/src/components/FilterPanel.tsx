import { useState } from 'react'
import { Filter, MapPin, Wifi, Car, Utensils, Tv, Calendar, X } from 'lucide-react'
import Button from './ui/Button'
import Input from './ui/Input'
import Select from './ui/Select'
import { cn } from '@/lib/utils'

interface FilterPanelProps {
  onFiltersChange: (filters: any) => void
  isOpen: boolean
  onToggle: () => void
}

const propertyTypes = [
  { value: 'BACHELOR', label: 'Bachelor' },
  { value: 'FAMILY', label: 'Family' },
  { value: 'HOSTEL', label: 'Hostel' },
]

const bedrooms = [
  { value: '1', label: '1 Bedroom' },
  { value: '2', label: '2 Bedrooms' },
  { value: '3', label: '3 Bedrooms' },
  { value: '4+', label: '4+ Bedrooms' },
]

const amenities = [
  { id: 'wifi', label: 'WiFi', icon: Wifi },
  { id: 'parking', label: 'Parking', icon: Car },
  { id: 'generator', label: 'Generator', icon: Calendar },
  { id: 'security', label: 'Security', icon: Filter },
  { id: 'meals', label: 'Meals', icon: Utensils },
  { id: 'tv', label: 'TV', icon: Tv },
]

export default function FilterPanel({ onFiltersChange, isOpen, onToggle }: FilterPanelProps) {
  const [filters, setFilters] = useState({
    area: '',
    propertyType: '',
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    amenities: [] as string[],
  })

  const handleFilterChange = (key: string, value: string | string[]) => {
    const updatedFilters = {
      ...filters,
      [key]: value,
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
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
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
            options={[
              { value: 'Dhanmondi', label: 'Dhanmondi' },
              { value: 'Gulshan', label: 'Gulshan' },
              { value: 'Banani', label: 'Banani' },
              { value: 'Uttara', label: 'Uttara' },
              { value: 'Mirpur', label: 'Mirpur' },
              { value: 'Mohammadpur', label: 'Mohammadpur' },
              { value: 'Pallabi', label: 'Pallabi' },
            ]}
            value={filters.area}
            onChange={(value) => handleFilterChange('area', value)}
          />
        </div>

        {/* Property Type */}
        <div>
          <h4 className="mb-2 text-sm font-medium text-gray-900">Property Type</h4>
          <div className="grid grid-cols-1 gap-2">
            {propertyTypes.map((type) => (
              <label
                key={type.value}
                className="flex cursor-pointer items-center rounded-lg border border-gray-200 p-2 transition-colors hover:bg-gray-50"
              >
                <input
                  type="radio"
                  name="propertyType"
                  className="mr-3 border-gray-300 text-primary-600 focus:ring-primary-600"
                  checked={filters.propertyType === type.value}
                  onChange={() => handleFilterChange('propertyType', type.value)}
                />
                <span className="text-sm text-gray-700">{type.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <h4 className="mb-2 text-sm font-medium text-gray-900">Price Range (BDT)</h4>
          <div className="space-y-3">
            <Input
              type="number"
              placeholder="Min"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange('minPrice', e.target.value)}
            />
            <Input
              type="number"
              placeholder="Max"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
            />
          </div>
        </div>

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
        <div>
          <h4 className="mb-2 text-sm font-medium text-gray-900">Amenities</h4>
          <div className="grid grid-cols-2 gap-2">
            {amenities.map((amenity) => {
              const Icon = amenity.icon
              return (
                <label
                  key={amenity.id}
                  className={cn(
                    'flex cursor-pointer items-center rounded-lg border p-2 transition-colors',
                    filters.amenities.includes(amenity.id)
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-gray-300 hover:bg-gray-50'
                  )}
                >
                  <input
                    type="checkbox"
                    className="mr-2 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                    checked={filters.amenities.includes(amenity.id)}
                    onChange={() => handleAmenityToggle(amenity.id)}
                  />
                  <Icon className="mr-2 h-4 w-4" />
                  <span className="text-sm">{amenity.label}</span>
                </label>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
