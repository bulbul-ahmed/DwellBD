import { useState, useEffect, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Filter, Wifi, Car, Utensils, Tv, Grid, List } from 'lucide-react'
import PropertyCard from '../components/ui/PropertyCard'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import SearchBar from '../components/SearchBar'
import AreaFilterDropdown from '../components/AreaFilterDropdown'
import FilterPanel from '../components/FilterPanel'
import PriceRangeFilter from '../components/PriceRangeFilter'
import PropertyTypeFilter from '../components/PropertyTypeFilter'
import { searchProperties, PropertyFilters, PropertyResponse } from '../api/propertyApi'
import { useQuery } from '@tanstack/react-query'
import { useAreaFilter } from '../hooks/useAreaFilter'
import { useMediaQuery } from '../hooks/useMediaQuery'

// Search query hook
const useSearchQuery = (filters: PropertyFilters) => {
  return useQuery({
    queryKey: ['search-properties', filters],
    queryFn: () => searchProperties(filters),
    keepPreviousData: true,
    staleTime: 5000, // Cache for 5 seconds
    refetchOnWindowFocus: false,
  })
}

const { data: searchResult, isLoading, error } = useSearchQuery(filters)

const PropertyListingsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [sortBy, setSortBy] = useState('newest')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const isLargeScreen = useMediaQuery('(min-width: 1024px)')

  // Get initial filters from URL params
  const initialFilters = useMemo(() => ({
    q: searchParams.get('q') || '',
    area: searchParams.get('area') || '',
    propertyType: searchParams.get('propertyType') || '',
    minPrice: searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : undefined,
    maxPrice: searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : undefined,
    bedrooms: searchParams.get('bedrooms') ? parseInt(searchParams.get('bedrooms')!) : undefined,
    furnished: searchParams.get('furnished') as 'NONE' | 'PARTIAL' | 'FULL' | undefined,
    listingType: searchParams.get('listingType') as 'RENT' | 'SELL' | undefined,
    sortBy: (searchParams.get('sortBy') || 'createdAt') as 'createdAt' | 'rentAmount' | 'bedrooms',
    order: (searchParams.get('order') || 'desc') as 'asc' | 'desc',
    page: parseInt(searchParams.get('page') || '1'),
    limit: 20,
  }), [searchParams])

  const [filters, setFilters] = useState(initialFilters)

  // Use area filter hook
  const { selectedArea, setArea, clearArea } = useAreaFilter({
    defaultValue: initialFilters.area,
    autoSync: true
  })

  const handleSearch = (searchFilters: PropertyFilters) => {
    setFilters(prev => ({
      ...prev,
      ...searchFilters,
      page: 1,
    }))
  }

  const handleFilterChange = (key: string, value: string | string[]) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1,
    }))
  }

  const handlePriceRangeChange = (minPrice?: number, maxPrice?: number) => {
    setFilters(prev => ({
      ...prev,
      minPrice: minPrice?.toString(),
      maxPrice: maxPrice?.toString(),
      page: 1,
    }))
  }

  const handlePageChange = (page: number) => {
    setFilters(prev => ({
      ...prev,
      page,
    }))
  }

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams()
    if (filters.q) params.append('q', filters.q)
    if (filters.area) params.append('area', filters.area)
    if (filters.propertyType) params.append('propertyType', filters.propertyType)
    if (filters.minPrice) params.append('minPrice', filters.minPrice.toString())
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString())
    if (filters.bedrooms) params.append('bedrooms', filters.bedrooms.toString())
    if (filters.furnished) params.append('furnished', filters.furnished)
    if (filters.listingType) params.append('listingType', filters.listingType)
    if (filters.sortBy) params.append('sortBy', filters.sortBy)
    if (filters.order) params.append('order', filters.order)
    if (filters.page) params.append('page', filters.page.toString())

    setSearchParams(params, { replace: true })
  }, [filters, setSearchParams])

  const properties = searchResult?.properties || []
  const total = searchResult?.total || 0
  const pages = searchResult?.pages || 1

  const handleSortChange = (value: string) => {
    let newSortBy: 'createdAt' | 'rentAmount' = 'createdAt'
    let newOrder: 'asc' | 'desc' = 'desc'

    switch (value) {
      case 'price-low':
        newSortBy = 'rentAmount'
        newOrder = 'asc'
        break
      case 'price-high':
        newSortBy = 'rentAmount'
        newOrder = 'desc'
        break
      case 'newest':
      default:
        newSortBy = 'createdAt'
        newOrder = 'desc'
    }

    setSortBy(value)
    setFilters(prev => ({ ...prev, sortBy: newSortBy, order: newOrder, page: 1 }))
  }


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="sticky top-16 z-40 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4">
            {/* Enhanced Search Bar */}
            <SearchBar onSearch={handleSearch} />

            {/* Controls */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              {/* Area Filter */}
              <div className="w-full md:w-auto">
                <AreaFilterDropdown
                  value={selectedArea}
                  onChange={setArea}
                  className="w-full"
                  placeholder="Select area..."
                />
              </div>

              {/* Sort Dropdown */}
              <div className="w-full md:w-auto">
                <Select
                  value={sortBy}
                  onValueChange={handleSortChange}
                  className="w-full md:w-48"
                >
                  <Select.Trigger>
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item value="newest">Newest</Select.Item>
                    <Select.Item value="price-low">Price: Low to High</Select.Item>
                    <Select.Item value="price-high">Price: High to Low</Select.Item>
                  </Select.Content>
                </Select>
              </div>

              {/* View Mode Toggle */}
              <div className="flex overflow-hidden rounded-lg border border-gray-300">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  <Grid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Filters Sidebar */}
          <aside className="flex-shrink-0 lg:w-64">
            {/* Filter Toggle Button for Mobile */}
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex w-full items-center justify-between rounded-lg border border-gray-300 px-4 py-3 text-left"
              >
                <span className="font-medium text-gray-900">Filters</span>
                <span className="text-gray-500">{showFilters ? 'Hide' : 'Show'}</span>
              </button>
            </div>

            {/* Filter Panel */}
            {(showFilters || isLargeScreen) && (
              <div className="lg:block transition-all duration-200">
                <FilterPanel
                  isOpen={true}
                  onToggle={() => setShowFilters(!showFilters)}
                  isMobile={!isLargeScreen}
                  onFiltersChange={(newFilters) => {
                    const updatedFilters = {
                      ...filters,
                      ...newFilters,
                      page: 1,
                    }
                    setFilters(updatedFilters)
                  }}
                />
              </div>
            )}
          </aside>

          {/* Properties Grid */}
          <main className="flex-1">
            {isLoading ? (
              <div className="py-12">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="animate-pulse">
                      <div className="mb-4 h-48 bg-gray-200 rounded-lg" />
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-4 bg-gray-200 rounded w-1/2" />
                        <div className="h-4 bg-gray-200 rounded w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : error ? (
              <div className="py-12 text-center">
                <div className="mx-auto h-12 w-12 text-red-400">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading properties</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Please try again later
                </p>
              </div>
            ) : properties.length === 0 ? (
              <div className="py-12 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No properties found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try adjusting your filters or search terms
                </p>
              </div>
            ) : (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-gray-600">
                    Showing {properties.length} of {total} properties
                  </p>
                </div>

                <div
                  className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'
                      : 'space-y-6'
                  }
                >
                  {properties.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>

                {/* Pagination */}
                {pages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <div className="flex space-x-2">
                      {Array.from({ length: pages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            filters.page === page
                              ? 'bg-primary-600 text-white'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

export default PropertyListingsPage
