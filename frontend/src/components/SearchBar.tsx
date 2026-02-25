import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, MapPin, X, Clock, History } from 'lucide-react'
import Input from './ui/Input'
import { cn } from '@/lib/utils'
import { searchProperties, PropertyFilters, Property } from '@/api/propertyApi'
import { useQuery } from '@tanstack/react-query'
import { useSearchHistory } from '@/hooks/useSearchHistory'
import { AREAS } from '../constants/areas'

interface SearchBarProps {
  className?: string
  onSearch?: (filters: PropertyFilters) => void
}

const popularSearches = [
  '2BHK flat in Dhanmondi',
  'Bachelor room near Dhaka University',
  'Girls hostel in Gulshan',
  'Family apartment in Uttara',
  'Flat for rent in Banani',
  'Bachelor accommodation in Mirpur',
]

// Enhanced search query hook
const useInstantSearch = (query: string, area: string) => {
  return useQuery({
    queryKey: ['instant-search', query, area],
    queryFn: () => searchProperties({
      q: query,
      area,
      page: 1,
      limit: 5
    }),
    enabled: !!(query.trim() || area) && (query.trim().length >= 2 || area.length > 0),
    staleTime: 3000, // Cache for 3 seconds
    refetchOnWindowFocus: false,
  })
}

export default function SearchBar({ className, onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedArea, setSelectedArea] = useState('')
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { searchHistory, addToHistory, removeFromHistory } = useSearchHistory()

  const { data: searchResults = { properties: [] }, isLoading: isSearching } = useInstantSearch(query, selectedArea)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim() || selectedArea) {
      const searchParams = new URLSearchParams()
      if (query) searchParams.append('q', query)
      if (selectedArea) searchParams.append('area', selectedArea)

      // Add to search history
      addToHistory(query, selectedArea)

      // Call onSearch callback if provided
      if (onSearch) {
        onSearch({
          q: query,
          area: selectedArea,
          page: 1,
          limit: 20
        })
      }

      navigate(`/properties?${searchParams.toString()}`)
      setShowSuggestions(false)
      // Don't clear query when navigating, let results page handle it
    }
  }

  const handleAreaSelect = (area: string) => {
    setSelectedArea(area === selectedArea ? '' : area)
    setQuery('')
    setShowSuggestions(false)
  }

  return (
    <div className={cn('relative mx-auto w-full max-w-3xl', className)}>
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
          <Input
            type="text"
            placeholder="Search by location, property type..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (query || selectedArea) setShowSuggestions(true)
            }}
            className="pl-12 pr-10"
          />
          {(query || selectedArea) && (
            <button
              type="button"
              onClick={() => {
                setQuery('')
                setSelectedArea('')
                setShowSuggestions(false)
                if (onSearch) {
                  onSearch({ q: '', area: '', page: 1, limit: 20 })
                }
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Search Suggestions */}
        {showSuggestions && (query || selectedArea) && (
          <div
            ref={suggestionsRef}
            className="absolute top-full z-50 mt-2 max-h-96 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg"
          >
            {/* Recent Searches */}
            {searchHistory.length > 0 && (
              <div className="border-b border-gray-200 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <History className="h-4 w-4 text-gray-600" />
                    <h3 className="font-medium text-gray-900">Recent Searches</h3>
                  </div>
                </div>
                <div className="space-y-2">
                  {searchHistory.slice(0, 5).map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => {
                          setQuery(item.query)
                          setSelectedArea(item.area || '')
                          setShowSuggestions(false)
                        }}
                        className="w-full rounded px-3 py-2 text-left text-sm transition-colors hover:bg-gray-100"
                      >
                        <div className="font-medium text-gray-900">{item.query}</div>
                        {item.area && (
                          <div className="text-xs text-gray-500">in {item.area}</div>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeFromHistory(item.query, item.area)}
                        className="ml-2 p-1 text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Instant Search Results */}
            {(query.trim().length >= 2 || selectedArea) && (
              <div className="border-b border-gray-200 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">Search Results</h3>
                  {isSearching && (
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Clock className="h-4 w-4 animate-spin" />
                      <span>Searching...</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  {isSearching ? (
                    <div className="py-2 text-center text-sm text-gray-500">Loading results...</div>
                  ) : searchResults.properties.length ? (
                    searchResults.properties.slice(0, 3).map((property: Property) => (
                      <button
                        key={property.id}
                        type="button"
                        onClick={() => {
                          setQuery(property.title)
                          setShowSuggestions(false)
                        }}
                        className="w-full rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-gray-100"
                      >
                        <div className="font-medium text-gray-900">{property.title}</div>
                        <div className="text-xs text-gray-500">
                          {property.area} • {property.bedrooms} bedroom {property.propertyType.toLowerCase()} • BDT {property.rentAmount.toLocaleString()}/{property.rentPeriod?.toLowerCase()}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="py-2 text-center text-sm text-gray-500">No results found</div>
                  )}
                </div>
              </div>
            )}

            {/* Area Selector */}
            <div className="border-b border-gray-200 p-4">
              <div className="mb-3 flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-600" />
                <h3 className="font-medium text-gray-900">Select Area</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {AREAS.map((area) => (
                  <button
                    key={area}
                    onClick={() => handleAreaSelect(area)}
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-sm transition-colors',
                      selectedArea === area
                        ? 'border-primary-600 bg-primary-100 text-primary-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                    )}
                  >
                    {area}
                  </button>
                ))}
              </div>
            </div>

            {/* Popular Searches */}
            <div className="p-4">
              <h3 className="mb-3 font-medium text-gray-900">Popular Searches</h3>
              <div className="space-y-2">
                {popularSearches.map((search, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      setQuery(search)
                      setShowSuggestions(false)
                    }}
                    className="w-full rounded px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}
