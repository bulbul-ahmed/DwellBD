import { useState } from 'react'
import { Dialog } from '@headlessui/react'
import { Search, MapPin, Calendar, Users, Bed } from 'lucide-react'
import SearchBar from './SearchBar'
import Button from './ui/Button'
import { cn } from '@/lib/utils'

interface SearchModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export default function SearchModal({ isOpen, onOpenChange }: SearchModalProps) {
  const [selectedArea, setSelectedArea] = useState('')

  const quickSearches = [
    { title: 'Dhanmondi', icon: MapPin, query: 'Dhanmondi' },
    { title: '2BHK Flats', icon: Bed, query: '2BHK' },
    { title: 'Bachelor Rooms', icon: Users, query: 'Bachelor' },
    { title: 'Available Now', icon: Calendar, query: 'immediate' },
  ]

  return (
    <Dialog open={isOpen} onClose={onOpenChange} className="relative z-50">
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />

      <div className="fixed inset-0 flex items-start justify-center p-4">
        <Dialog.Panel className="w-full max-w-2xl bg-white rounded-lg shadow-xl transform transition-all">
          <div className="p-6">
            <Dialog.Title className="sr-only">Search Properties</Dialog.Title>

            {/* Search Input */}
            <div className="mb-6">
              <SearchBar />
            </div>

            {/* Quick Searches */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Search</h3>
              <div className="grid grid-cols-2 gap-3">
                {quickSearches.map((item, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="flex items-center justify-center space-x-2 h-auto p-3"
                    onClick={() => {
                      // TODO: Implement search with query
                      console.log('Search for:', item.query)
                    }}
                  >
                    <item.icon className="h-5 w-5 text-gray-600" />
                    <span className="text-sm">{item.title}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Popular Areas */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Popular Areas</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  'Dhanmondi', 'Gulshan', 'Banani', 'Uttara', 'Mirpur',
                  'Mohammadpur', 'Pallabi', 'Adabor', 'Shyamoli'
                ].map((area) => (
                  <button
                    key={area}
                    onClick={() => setSelectedArea(area)}
                    className={cn(
                      'px-3 py-1.5 text-sm rounded-full border transition-colors',
                      selectedArea === area
                        ? 'bg-primary-100 border-primary-600 text-primary-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                    )}
                  >
                    {area}
                  </button>
                ))}
              </div>
            </div>

            {/* Advanced Search Link */}
            <div className="mt-6 pt-4 border-t border-gray-200 text-center">
              <button
                onClick={onOpenChange}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Advanced Search Options →
              </button>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}