import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, MapPin, X } from 'lucide-react'
import Input from './ui/Input'
import Button from './ui/Button'
import { cn } from '@/lib/utils'

interface SearchBarProps {
  className?: string
}

const popularSearches = [
  '2BHK flat in Dhanmondi',
  'Bachelor room near Dhaka University',
  'Girls hostel in Gulshan',
  'Family apartment in Uttara',
  'Flat for rent in Banani',
  'Bachelor accommodation in Mirpur',
]

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

export default function SearchBar({ className }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showAreas, setShowAreas] = useState(false)
  const [selectedArea, setSelectedArea] = useState('')
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
        setShowAreas(false)
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

      navigate(`/properties?${searchParams.toString()}`)
      setShowSuggestions(false)
      setShowAreas(false)
      setQuery('')
    }
  }

  const handleAreaSelect = (area: string) => {
    setSelectedArea(area === selectedArea ? '' : area)
    setQuery('')
    setShowAreas(false)
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
            {/* Area Selector */}
            <div className="border-b border-gray-200 p-4">
              <div className="mb-3 flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-600" />
                <h3 className="font-medium text-gray-900">Select Area</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {areas.map((area) => (
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
