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
        <Dialog.Panel className="w-full max-w-2xl transform rounded-lg bg-white shadow-xl transition-all">
          <div className="p-6">
            <Dialog.Title className="sr-only">Search Properties</Dialog.Title>

            {/* Search Input */}
            <div className="mb-6">
              <SearchBar />
            </div>

            {/* Quick Searches */}
            <div className="mb-6">
              <h3 className="mb-3 text-sm font-medium text-gray-900">Quick Search</h3>
              <div className="grid grid-cols-2 gap-3">
                {quickSearches.map((item, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="flex h-auto items-center justify-center space-x-2 p-3"
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
              <h3 className="mb-3 text-sm font-medium text-gray-900">Popular Areas</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  'Dhanmondi',
                  'Gulshan',
                  'Banani',
                  'Uttara',
                  'Mirpur',
                  'Mohammadpur',
                  'Pallabi',
                  'Adabor',
                  'Shyamoli',
                ].map((area) => (
                  <button
                    key={area}
                    onClick={() => setSelectedArea(area)}
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

            {/* Advanced Search Link */}
            <div className="mt-6 border-t border-gray-200 pt-4 text-center">
              <button
                onClick={onOpenChange}
                className="text-sm font-medium text-primary-600 hover:text-primary-700"
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
