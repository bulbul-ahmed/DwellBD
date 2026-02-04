import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, MapPin, Calendar, Users, Bed } from 'lucide-react'
import PropertyCard from '../components/ui/PropertyCard'
import Button from '../components/ui/Button'
import { PropertyListSkeleton } from '../components/ui/Skeleton'

// Mock data for properties
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
]

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setIsLoading(true)
      setTimeout(() => {
        setIsLoading(false)
        navigate('/properties')
      }, 500)
    }
  }

  const formatPrice = (amount: number) => {
    const formatter = new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      maximumFractionDigits: 0,
    })
    return formatter.format(amount)
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative">
        {/* Background Image */}
        <div className="h-[500px] bg-gradient-to-br from-primary-50 to-secondary-50">
          <img
            src="/hero-bg.jpg"
            alt="Property background"
            className="w-full h-full object-cover opacity-20"
          />
        </div>

        {/* Content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Find Your Perfect Home in Bangladesh
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Discover verified properties for rent and sale across Dhaka and beyond
            </p>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="w-full max-w-2xl mx-auto">
              <div className="relative bg-white rounded-lg shadow-lg p-2">
                <div className="flex items-center">
                  <div className="flex-1 px-4">
                    <input
                      type="text"
                      placeholder="Search by location, property type, or keyword..."
                      className="w-full py-3 text-gray-700 focus:outline-none disabled:opacity-50"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <Button
                    type="submit"
                    size="md"
                    className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
                    loading={isLoading}
                  >
                    <Search className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </form>

            {/* Quick Links */}
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <button className="px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <MapPin className="h-4 w-4 inline mr-2" />
                Dhanmondi
              </button>
              <button className="px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <MapPin className="h-4 w-4 inline mr-2" />
                Gulshan
              </button>
              <button className="px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <Bed className="h-4 w-4 inline mr-2" />
                2BHK Flats
              </button>
              <button className="px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <Users className="h-4 w-4 inline mr-2" />
                Bachelor Rooms
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose BDFlatHub?
            </h2>
            <p className="text-lg text-gray-600">
              We make finding your perfect home simple and secure
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Verified Properties
              </h3>
              <p className="text-gray-600">
                All properties are verified by our team to ensure authenticity
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Fast & Responsive
              </h3>
              <p className="text-gray-600">
                Lightning-fast search optimized for all devices
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Secure Platform
              </h3>
              <p className="text-gray-600">
                Your data and transactions are protected with enterprise security
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Properties */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Featured Properties
              </h2>
              <p className="text-gray-600">
                Discover the most popular properties in Dhaka
              </p>
            </div>
            <Button variant="secondary">
              View All Properties
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <PropertyListSkeleton />
            ) : (
              mockProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))
            )}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Find Your Perfect Home?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of satisfied users who found their dream home through BDFlatHub
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="primary" className="bg-white text-primary-600 hover:bg-gray-100">
              Get Started
            </Button>
            <Button size="lg" variant="secondary" className="bg-transparent text-white border-white border-2 hover:bg-white hover:text-primary-600">
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage