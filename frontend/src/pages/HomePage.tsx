import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, MapPin, Users, Bed } from 'lucide-react'
import PropertyCard from '../components/ui/PropertyCard'
import Button from '../components/ui/Button'
import { PropertyListSkeleton } from '../components/ui/Skeleton'
import { usePropertyStore } from '../stores/propertyStore'

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showLocationDropdown, setShowLocationDropdown] = useState(false)
  const [showTypeDropdown, setShowTypeDropdown] = useState(false)
  const [showPriceDropdown, setShowPriceDropdown] = useState(false)
  const [selectedArea, setSelectedArea] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [priceRange, setPriceRange] = useState('')
  const navigate = useNavigate()
  const { properties, isLoading: isLoadingProperties, searchProperties } = usePropertyStore()

  useEffect(() => {
    searchProperties({ limit: 6 })
  }, [])

  const handleFilterSearch = () => {
    const params = new URLSearchParams()
    if (selectedArea) params.append('area', selectedArea)
    if (selectedType) params.append('propertyType', selectedType)
    if (priceRange) params.append('priceRange', priceRange)
    navigate(`/properties?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Airbnb-Style Filter Bar */}
      <div className="border-b border-gray-200 bg-white py-6 shadow-sm sticky top-16 z-40">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {/* Desktop Filter Bar */}
          <div className="relative hidden md:flex items-center justify-center">
            <div className="flex items-center rounded-full border border-gray-300 shadow-sm hover:shadow-md transition-shadow">
              {/* Where - Location Filter */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowLocationDropdown(!showLocationDropdown)
                    setShowTypeDropdown(false)
                    setShowPriceDropdown(false)
                  }}
                  className="px-6 py-3 rounded-l-full hover:bg-gray-50 transition-colors border-r border-gray-200"
                >
                  <div className="text-left">
                    <div className="text-xs font-semibold text-gray-900">Where</div>
                    <input
                      type="text"
                      value={selectedArea}
                      onChange={(e) => setSelectedArea(e.target.value)}
                      placeholder="Search locations"
                      className="text-sm text-gray-700 placeholder-gray-400 bg-transparent border-none focus:outline-none w-32"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </button>
                {showLocationDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <button
                      onClick={() => {
                        setSelectedArea('Dhanmondi')
                        setShowLocationDropdown(false)
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm"
                    >
                      Dhanmondi
                    </button>
                    <button
                      onClick={() => {
                        setSelectedArea('Gulshan')
                        setShowLocationDropdown(false)
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm"
                    >
                      Gulshan
                    </button>
                    <button
                      onClick={() => {
                        setSelectedArea('Uttara')
                        setShowLocationDropdown(false)
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm"
                    >
                      Uttara
                    </button>
                    <button
                      onClick={() => {
                        setSelectedArea('Banani')
                        setShowLocationDropdown(false)
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm"
                    >
                      Banani
                    </button>
                    <button
                      onClick={() => {
                        setSelectedArea('Mirpur')
                        setShowLocationDropdown(false)
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm"
                    >
                      Mirpur
                    </button>
                  </div>
                )}
              </div>

              {/* Property Type Filter */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowTypeDropdown(!showTypeDropdown)
                    setShowLocationDropdown(false)
                    setShowPriceDropdown(false)
                  }}
                  className="px-6 py-3 hover:bg-gray-50 transition-colors border-r border-gray-200"
                >
                  <div className="text-left">
                    <div className="text-xs font-semibold text-gray-900">Type</div>
                    <div className="text-sm text-gray-500">
                      {selectedType || 'Any type'}
                    </div>
                  </div>
                </button>
                {showTypeDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <button
                      onClick={() => {
                        setSelectedType('FAMILY')
                        setShowTypeDropdown(false)
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm"
                    >
                      Family
                    </button>
                    <button
                      onClick={() => {
                        setSelectedType('BACHELOR')
                        setShowTypeDropdown(false)
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm"
                    >
                      Bachelor
                    </button>
                    <button
                      onClick={() => {
                        setSelectedType('OFFICE')
                        setShowTypeDropdown(false)
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm"
                    >
                      Office
                    </button>
                    <button
                      onClick={() => {
                        setSelectedType('SUBLET')
                        setShowTypeDropdown(false)
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm"
                    >
                      Sublet
                    </button>
                  </div>
                )}
              </div>

              {/* Price Range Filter */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowPriceDropdown(!showPriceDropdown)
                    setShowLocationDropdown(false)
                    setShowTypeDropdown(false)
                  }}
                  className="px-6 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="text-left">
                    <div className="text-xs font-semibold text-gray-900">Price</div>
                    <div className="text-sm text-gray-500">
                      {priceRange || 'Any price'}
                    </div>
                  </div>
                </button>
                {showPriceDropdown && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <button
                      onClick={() => {
                        setPriceRange('0-15000')
                        setShowPriceDropdown(false)
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm"
                    >
                      Under 15,000 BDT
                    </button>
                    <button
                      onClick={() => {
                        setPriceRange('15000-30000')
                        setShowPriceDropdown(false)
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm"
                    >
                      15,000 - 30,000 BDT
                    </button>
                    <button
                      onClick={() => {
                        setPriceRange('30000-50000')
                        setShowPriceDropdown(false)
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm"
                    >
                      30,000 - 50,000 BDT
                    </button>
                    <button
                      onClick={() => {
                        setPriceRange('50000+')
                        setShowPriceDropdown(false)
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm"
                    >
                      50,000+ BDT
                    </button>
                  </div>
                )}
              </div>

              {/* Search Button */}
              <button
                onClick={handleFilterSearch}
                className="px-4 py-3 rounded-r-full bg-primary-600 hover:bg-primary-700 transition-colors"
              >
                <Search className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>

          {/* Mobile Filter Bar - Compact Buttons */}
          <div className="flex md:hidden items-center gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => navigate('/properties')}
              className="flex items-center gap-2 whitespace-nowrap rounded-full border border-gray-300 px-4 py-2 text-sm font-medium hover:border-gray-900 transition-colors"
            >
              <Search className="h-4 w-4" />
              Search
            </button>
            <button
              onClick={() => navigate('/properties?area=Dhanmondi')}
              className="whitespace-nowrap rounded-full border border-gray-300 px-4 py-2 text-sm hover:border-gray-900 transition-colors"
            >
              <MapPin className="mr-1 inline h-3 w-3" />
              Dhanmondi
            </button>
            <button
              onClick={() => navigate('/properties?area=Gulshan')}
              className="whitespace-nowrap rounded-full border border-gray-300 px-4 py-2 text-sm hover:border-gray-900 transition-colors"
            >
              <MapPin className="mr-1 inline h-3 w-3" />
              Gulshan
            </button>
            <button
              onClick={() => navigate('/properties?propertyType=FAMILY')}
              className="whitespace-nowrap rounded-full border border-gray-300 px-4 py-2 text-sm hover:border-gray-900 transition-colors"
            >
              <Bed className="mr-1 inline h-3 w-3" />
              Family
            </button>
            <button
              onClick={() => navigate('/properties?propertyType=BACHELOR')}
              className="whitespace-nowrap rounded-full border border-gray-300 px-4 py-2 text-sm hover:border-gray-900 transition-colors"
            >
              <Users className="mr-1 inline h-3 w-3" />
              Bachelor
            </button>
          </div>
        </div>
      </div>

      {/* Featured Properties */}
      <div className="py-12 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="mb-2 text-3xl font-bold text-gray-900">Featured Properties</h2>
              <p className="text-gray-600">Discover the most popular properties in Dhaka</p>
            </div>
            <Button variant="secondary" onClick={() => navigate('/properties')}>View All Properties</Button>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {isLoadingProperties ? (
              <PropertyListSkeleton />
            ) : properties.length > 0 ? (
              properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-gray-600">
                No properties available at the moment
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900">Why BDFlatHub?</h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="p-4 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
                <svg
                  className="h-8 w-8 text-primary-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900">Verified Properties</h3>
              <p className="text-gray-600">
                All properties are verified by our team to ensure authenticity
              </p>
            </div>

            <div className="p-4 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary-100">
                <svg
                  className="h-8 w-8 text-secondary-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900">Fast & Responsive</h3>
              <p className="text-gray-600">Lightning-fast search optimized for all devices</p>
            </div>

            <div className="p-4 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
                <svg
                  className="h-8 w-8 text-primary-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900">Secure Platform</h3>
              <p className="text-gray-600">
                Your data and transactions are protected with enterprise security
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-600 py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-4 text-3xl font-bold text-white">Ready to Find Your Perfect Home?</h2>
          <p className="mb-8 text-xl text-primary-100">
            Join thousands of satisfied users who found their dream home through BDFlatHub
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              variant="primary"
              className="bg-white text-primary-600 hover:bg-gray-100"
              onClick={() => navigate('/register')}
            >
              Get Started
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="border-2 border-white bg-transparent text-white hover:bg-white hover:text-primary-600"
              onClick={() => navigate('/properties')}
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage
