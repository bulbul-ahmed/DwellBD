import { useState } from 'react'
import { MapPin, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AREAS } from '../constants/areas'

interface AreaFilterDropdownProps {
  value?: string
  onChange?: (area: string) => void
  className?: string
  placeholder?: string
  showClearButton?: boolean
}

export default function AreaFilterDropdown({
  value,
  onChange,
  className,
  placeholder = "Select area",
  showClearButton = true
}: AreaFilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredAreas = AREAS.filter(area =>
    area.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSelect = (area: string) => {
    onChange?.(area)
    setIsOpen(false)
    setSearchTerm('')
  }

  const handleClear = () => {
    onChange?.('')
    setIsOpen(false)
  }

  const handleOutsideClick = (event: MouseEvent) => {
    if (!event.target || !(event.target as Element).closest('.area-dropdown')) {
      setIsOpen(false)
    }
  }

  // Add click outside listener
  useState(() => {
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  })

  return (
    <div className={cn('relative w-full', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between rounded-lg border border-gray-300 px-3 py-2 text-left transition-colors hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <div className="flex items-center">
          <MapPin className="mr-2 h-4 w-4 text-gray-400" />
          <span className={cn(
            'text-sm',
            value ? 'text-gray-900' : 'text-gray-500'
          )}>
            {value || placeholder}
          </span>
        </div>
        <div className="flex items-center">
          {value && showClearButton && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleClear()
              }}
              className="mr-2 p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <svg
            className={`h-4 w-4 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="area-dropdown absolute top-full z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
          {/* Search input */}
          <div className="border-b border-gray-200 p-3">
            <input
              type="text"
              placeholder="Search areas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Areas list */}
          <div className="max-h-60 overflow-y-auto">
            {filteredAreas.length > 0 ? (
              filteredAreas.map((area) => (
                <button
                  key={area}
                  onClick={() => handleSelect(area)}
                  className={cn(
                    'w-full px-3 py-2 text-left text-sm transition-colors',
                    value === area
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  )}
                >
                  {area}
                </button>
              ))
            ) : (
              <div className="px-3 py-4 text-center text-sm text-gray-500">
                No areas found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}