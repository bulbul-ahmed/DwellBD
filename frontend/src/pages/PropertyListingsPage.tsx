import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Filter, MapPin, Wifi, Car, Utensils, Tv } from 'lucide-react'
import PropertyCard from '../components/ui/PropertyCard'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'

// Mock data
const mockProperties = [
  {
    id: '1',
    title: 'Spacious 2BHK Flat in Dhanmondi',
    description: 'Modern flat with 24/7 security, parking, and generator backup. Walking distance to shopping malls.',
    propertyType: 'FAMILY' as const,
    listingType: 'RENT' as const,
    address: 'House 12, Road 5, Dhanmondi',
    area: 'Dhanmondi',
    rentAmount: 35000,
    bedrooms: 2,
    bathrooms: 2,
    squareFeet: 1200,
    images: ['/placeholder1.jpg', '/placeholder2.jpg', '/placeholder3.jpg'],
    amenities: ['wifi', 'parking', 'generator', 'gas'],
    isVerified: true,
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    title: 'Bachelor Room Near Dhaka University',
    description: 'Clean and safe bachelor accommodation with meals included. Perfect for students.',
    propertyType: 'BACHELOR' as const,
    listingType: 'RENT' as const,
    address: 'Near Dhaka University Campus',
    area: 'Dhanmondi',
    rentAmount: 8000,
    bedrooms: 1,
    bathrooms: 1,
    squareFeet: 300,
    images: ['/placeholder4.jpg', '/placeholder5.jpg'],
    amenities: ['wifi', 'meals', 'laundry'],
    isVerified: true,
    createdAt: '2024-01-20T10:00:00Z',
  },
  {
    id: '3',
    title: 'Girls Hostel in Gulshan',
    description: 'Secure girls hostel with 24/7 security CCTV. Near shopping centers and restaurants.',
    propertyType: 'HOSTEL' as const,
    listingType: 'RENT' as const,
    address: 'Gulshan-2',
    area: 'Gulshan',
    rentAmount: 12000,
    bedrooms: 1,
    bathrooms: 1,
    squareFeet: 400,
    images: ['/placeholder6.jpg', '/placeholder7.jpg'],
    amenities: ['wifi', 'security', 'meals', 'common-room'],
    isVerified: true,
    createdAt: '2024-01-25T10:00:00Z',
  },
  {
    id: '4',
    title: 'Luxury 3BHK Apartment in Banani',
    description: 'Premium apartment with modern amenities. High floor with city view.',
    propertyType: 'FAMILY' as const,
    listingType: 'RENT' as const,
    address: 'Banani-11',
    area: 'Banani',
    rentAmount: 75000,
    bedrooms: 3,
    bathrooms: 3,
    squareFeet: 2000,
    images: ['/placeholder8.jpg', '/placeholder9.jpg', '/placeholder10.jpg'],
    amenities: ['wifi', 'parking', 'gym', 'swimming-pool'],
    isVerified: true,
    createdAt: '2024-01-30T10:00:00Z',
  },
  {
    id: '5',
    title: 'Shared Bachelor Accommodation in Uttara',
    description: 'Affordable shared rooms for working professionals. Fully furnished.',
    propertyType: 'BACHELOR' as const,
    listingType: 'RENT' as const,
    address: 'Uttara Sector-15',
    area: 'Uttara',
    rentAmount: 6000,
    bedrooms: 1,
    bathrooms: 1,
    squareFeet: 250,
    images: ['/placeholder11.jpg', '/placeholder12.jpg'],
    amenities: ['wifi', 'shared-kitchen', 'laundry'],
    isVerified: true,
    createdAt: '2024-02-01T10:00:00Z',
  },
  {
    id: '6',
    title: 'Family Flat in Mirpur',
    description: 'Spacious family flat in quiet neighborhood. Near schools and markets.',
    propertyType: 'FAMILY' as const,
    listingType: 'RENT' as const,
    address: 'Mirpur-10',
    area: 'Mirpur',
    rentAmount: 22000,
    bedrooms: 2,
    bathrooms: 2,
    squareFeet: 1000,
    images: ['/placeholder13.jpg', '/placeholder14.jpg'],
    amenities: ['wifi', 'generator', 'parking'],
    isVerified: true,
    createdAt: '2024-02-02T10:00:00Z',
  },
]

const PropertyListingsPage = () => {
  const [filters, setFilters] = useState({
    search: '',
    area: '',
    propertyType: '',
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    amenities: [] as string[],
  })
  const [sortBy, setSortBy] = useState('newest')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const handleFilterChange = (key: string, value: string | string[]) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const filteredProperties = mockProperties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                         property.description?.toLowerCase().includes(filters.search.toLowerCase())
    const matchesArea = !filters.area || property.area === filters.area
    const matchesPropertyType = !filters.propertyType || property.propertyType === filters.propertyType
    const matchesPrice = (!filters.minPrice || property.rentAmount >= parseInt(filters.minPrice)) &&
                         (!filters.maxPrice || property.rentAmount <= parseInt(filters.maxPrice))
    const matchesBedrooms = !filters.bedrooms || property.bedrooms?.toString() === filters.bedrooms
    const matchesAmenities = filters.amenities.length === 0 ||
                            filters.amenities.every(amenity => property.amenities.includes(amenity))

    return matchesSearch && matchesArea && matchesPropertyType &&
           matchesPrice && matchesBedrooms && matchesAmenities
  })

  const sortedProperties = [...filteredProperties].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.rentAmount - b.rentAmount
      case 'price-high':
        return b.rentAmount - a.rentAmount
      case 'newest':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
  })

  const areas = ['Dhanmondi', 'Gulshan', 'Banani', 'Uttara', 'Mirpur']
  const propertyTypes = [
    { value: 'BACHELOR', label: 'Bachelor' },
    { value: 'FAMILY', label: 'Family' },
    { value: 'HOSTEL', label: 'Hostel' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white shadow-sm sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search properties..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
                <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Sort Dropdown */}
            <div>
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex rounded-lg overflow-hidden border border-gray-300">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 transition-colors ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 transition-colors ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Filters</h3>
                <button
                  onClick={() => setFilters({
                    search: '',
                    area: '',
                    propertyType: '',
                    minPrice: '',
                    maxPrice: '',
                    bedrooms: '',
                    amenities: [],
                  })}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Clear all
                </button>
              </div>

              {/* Area Filter */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Area</h4>
                <div className="space-y-1">
                  {areas.map((area) => (
                    <label key={area} className="flex items-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                        checked={filters.area === area}
                        onChange={(e) => handleFilterChange('area', e.target.checked ? area : '')}
                      />
                      <span className="ml-2 text-sm text-gray-700">{area}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Property Type Filter */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Property Type</h4>
                <div className="space-y-1">
                  {propertyTypes.map((type) => (
                    <label key={type.value} className="flex items-center">
                      <input
                        type="radio"
                        name="propertyType"
                        className="border-gray-300 text-primary-600 focus:ring-primary-600"
                        checked={filters.propertyType === type.value}
                        onChange={() => handleFilterChange('propertyType', type.value)}
                      />
                      <span className="ml-2 text-sm text-gray-700">{type.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Price Range (BDT)</h4>
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
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Bedrooms</h4>
                <div className="space-y-1">
                  {['1', '2', '3', '4+'].map((beds) => (
                    <label key={beds} className="flex items-center">
                      <input
                        type="radio"
                        name="bedrooms"
                        className="border-gray-300 text-primary-600 focus:ring-primary-600"
                        checked={filters.bedrooms === beds}
                        onChange={() => handleFilterChange('bedrooms', beds)}
                      />
                      <span className="ml-2 text-sm text-gray-700">{beds}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Amenities */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Amenities</h4>
                <div className="space-y-1">
                  {[
                    { id: 'wifi', label: 'WiFi', icon: Wifi },
                    { id: 'parking', label: 'Parking', icon: Car },
                    { id: 'meals', label: 'Meals', icon: Utensils },
                    { id: 'tv', label: 'TV', icon: Tv },
                  ].map((amenity) => (
                    <label key={amenity.id} className="flex items-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                        checked={filters.amenities.includes(amenity.id)}
                        onChange={(e) => {
                          const updated = e.target.checked
                            ? [...filters.amenities, amenity.id]
                            : filters.amenities.filter(a => a !== amenity.id)
                          handleFilterChange('amenities', updated)
                        }}
                      />
                      <span className="ml-2 text-sm text-gray-700">{amenity.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Properties Grid */}
          <main className="flex-1">
            <div className="mb-4 flex justify-between items-center">
              <p className="text-gray-600">
                Showing {sortedProperties.length} properties
              </p>
            </div>

            {sortedProperties.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No properties found</h3>
                <p className="mt-1 text-sm text-gray-500">Try adjusting your filters or search terms</p>
              </div>
            ) : (
              <div className={viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-6'
              }>
                {sortedProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

export default PropertyListingsPage