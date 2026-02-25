import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Grid, List } from 'lucide-react'
import PropertyCard from '../components/ui/PropertyCard'
import Select from '../components/ui/Select'
import SearchBar from '../components/SearchBar'
import FilterPanel from '../components/FilterPanel'
import { searchProperties, PropertyFilters } from '../api/propertyApi'
import { useQuery } from '@tanstack/react-query'
import { useMediaQuery } from '../hooks/useMediaQuery'

const PropertyListingsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [accumulatedProperties, setAccumulatedProperties] = useState<any[]>([])
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMorePages, setHasMorePages] = useState(true)
  const observerTarget = useRef<HTMLDivElement>(null)
  const isLargeScreen = useMediaQuery('(min-width: 1024px)')

  // Get initial filters from URL params
  const initialFilters = useMemo(() => {
    const furnishedValue = searchParams.get('furnished')
    const listingTypeValue = searchParams.get('listingType')
    const initialObj: any = {
      q: searchParams.get('q') || '',
      area: searchParams.get('area') || '',
      subArea: searchParams.get('subArea') || '',
      propertyType: searchParams.get('propertyType') || '',
      minPrice: searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : undefined,
      maxPrice: searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : undefined,
      bedrooms: searchParams.get('bedrooms') ? parseInt(searchParams.get('bedrooms')!) : undefined,
      furnished: (furnishedValue === 'NONE' || furnishedValue === 'PARTIAL' || furnishedValue === 'FULL') ? furnishedValue : undefined,
      listingType: (listingTypeValue === 'RENT' || listingTypeValue === 'SELL') ? listingTypeValue : undefined,
      sortBy: (searchParams.get('sortBy') || 'createdAt') as 'createdAt' | 'rentAmount' | 'bedrooms',
      order: (searchParams.get('order') || 'desc') as 'asc' | 'desc',
      page: parseInt(searchParams.get('page') || '1'),
      limit: 20,
    }
    // Parse priceRange sent by homepage (e.g. "15000-30000" or "50000+")
    const priceRange = searchParams.get('priceRange')
    if (priceRange && !searchParams.get('minPrice')) {
      if (priceRange.endsWith('+')) {
        initialObj.minPrice = parseInt(priceRange)
      } else {
        const [min, max] = priceRange.split('-').map(Number)
        if (!isNaN(min)) initialObj.minPrice = min
        if (!isNaN(max)) initialObj.maxPrice = max
      }
    }
    return initialObj
  }, [searchParams])

  const [filters, setFilters] = useState(initialFilters)

  const sortByValue = useMemo(() => {
    if (filters.sortBy === 'rentAmount' && filters.order === 'asc') return 'price-low'
    if (filters.sortBy === 'rentAmount' && filters.order === 'desc') return 'price-high'
    return 'newest'
  }, [filters.sortBy, filters.order])

  // Search query hook
  const { data: searchResult, isLoading, error } = useQuery({
    queryKey: ['search-properties', filters],
    queryFn: () => searchProperties(filters),
    placeholderData: (previousData) => previousData,
    staleTime: 5000, // Cache for 5 seconds
    refetchOnWindowFocus: false,
  })

  const handleSearch = useCallback((searchFilters: PropertyFilters) => {
    setFilters(prev => ({
      ...prev,
      ...searchFilters,
      page: 1,
    }))
  }, [])

  const handlePageChange = useCallback((page: number) => {
    setFilters(prev => ({
      ...prev,
      page,
    }))
  }, [])

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
    if (filters.subArea) params.append('subArea', filters.subArea)
    if (filters.sortBy) params.append('sortBy', filters.sortBy)
    if (filters.order) params.append('order', filters.order)
    if (filters.page) params.append('page', filters.page.toString())

    setSearchParams(params, { replace: true })
  }, [filters, setSearchParams])

  const properties = searchResult?.properties || []
  const total = searchResult?.total || 0

  // Accumulate properties for infinite scroll
  const MAX_ACCUMULATED = 100
  useEffect(() => {
    // Reset accumulated properties when filters change (new search)
    if (filters.page === 1) {
      setAccumulatedProperties(properties)
      setHasMorePages(properties.length < total && properties.length > 0)
    } else {
      // Append new properties when loading more, keeping only the last MAX_ACCUMULATED
      setAccumulatedProperties(prev => {
        const newProps = [...prev, ...properties]
        return newProps.slice(-MAX_ACCUMULATED)
      })
      setHasMorePages(accumulatedProperties.length + properties.length < total)
    }
    setIsLoadingMore(false)
  }, [searchResult])

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMorePages && !isLoading && !isLoadingMore) {
          setIsLoadingMore(true)
          handlePageChange(filters.page + 1)
        }
      },
      { threshold: 0.1 }
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current)
      }
    }
  }, [hasMorePages, isLoading, isLoadingMore, filters.page, handlePageChange])

  const handleSortChange = useCallback((value: string) => {
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

    setFilters(prev => ({ ...prev, sortBy: newSortBy, order: newOrder, page: 1 }))
  }, [])


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
              {/* Sort Dropdown */}
              <div className="w-full md:w-auto">
                <Select
                  value={sortByValue}
                  onChange={(value) => handleSortChange(value)}
                  options={[
                    { value: 'newest', label: 'Newest' },
                    { value: 'price-low', label: 'Price: Low to High' },
                    { value: 'price-high', label: 'Price: High to Low' },
                  ]}
                  className="w-full md:w-48"
                />
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
            ) : accumulatedProperties.length === 0 ? (
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
                    Showing {accumulatedProperties.length} of {total} properties
                  </p>
                </div>

                <div
                  className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'
                      : 'space-y-6'
                  }
                >
                  {accumulatedProperties.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>

                {/* Infinite Scroll Observer Target */}
                {hasMorePages && (
                  <div ref={observerTarget} className="mt-8 flex justify-center">
                    {isLoadingMore ? (
                      <div className="text-center py-4">
                        <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-gray-300 border-t-primary-600"></div>
                        <p className="mt-2 text-gray-600">Loading more properties...</p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Scroll down to load more</p>
                    )}
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
