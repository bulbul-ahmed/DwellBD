import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Heart, MapPin, Phone, Mail, Calendar, Share2, Star } from 'lucide-react'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

// Mock property data
const mockProperty = {
  id: '1',
  title: 'Spacious 2BHK Flat in Dhanmondi',
  description: `This modern and spacious 2BHK flat is located in the heart of Dhanmondi, one of Dhaka's most prestigious neighborhoods. The property offers a perfect blend of comfort and convenience, making it ideal for families or working professionals.

The apartment features well-appointed bedrooms with ample storage space, a modern bathroom with premium fixtures, and a spacious living area that receives plenty of natural light. The kitchen is fully equipped with all necessary appliances and has provisions for a gas connection.

The building offers 24/7 security with CCTV surveillance, ensuring the safety of residents. There is ample parking space available for residents and visitors. The property also benefits from a generator backup, ensuring uninterrupted electricity supply during load shedding.

Location is a key advantage of this property, with easy access to shopping malls, restaurants, schools, and hospitals. The area is well-connected to major transportation routes, making commuting hassle-free.`,

  propertyType: 'FAMILY' as const,
  listingType: 'RENT' as const,
  address: 'House 12, Road 5, Dhanmondi',
  area: 'Dhanmondi',
  city: 'Dhaka',
  latitude: 23.7529,
  longitude: 90.3814,
  rentAmount: 35000,
  rentPeriod: 'MONTHLY' as const,
  securityDeposit: 70000,
  advancePayment: 3,
  bedrooms: 2,
  bathrooms: 2,
  floorNumber: 3,
  totalFloors: 5,
  squareFeet: 1200,
  furnished: 'FULL' as const,
  amenities: ['wifi', 'parking', 'generator', 'gas', 'security', 'elevator', 'balcony'],
  images: [
    '/placeholder1.jpg',
    '/placeholder2.jpg',
    '/placeholder3.jpg',
    '/placeholder4.jpg',
    '/placeholder5.jpg',
  ],
  videoUrl: 'https://youtube.com/watch?v=example',
  isAvailable: true,
  availableFrom: '2024-02-01',
  isVerified: true,
  owner: {
    id: 'owner1',
    name: 'Rahim Uddin',
    phone: '+8801700123456',
    email: 'rahim@example.com',
    avatar: '/placeholder-avatar.jpg',
  },
  stats: {
    views: 234,
    favorites: 12,
    averageRating: 4.5,
  },
  createdAt: '2024-01-15T10:00:00Z',
}

const PropertyDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const [isFavorited, setIsFavorited] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)
  const [contactMessage, setContactMessage] = useState('')

  const property = mockProperty

  const handleContact = () => {
    if (!contactMessage.trim()) return
    // TODO: Implement contact functionality
    setShowContactModal(false)
    setContactMessage('')
  }

  const formatPrice = (amount: number) => {
    const formatter = new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      maximumFractionDigits: 0,
    })
    return formatter.format(amount)
  }

  const amenityLabels = {
    wifi: 'WiFi',
    parking: 'Parking',
    generator: 'Generator',
    gas: 'Gas Connection',
    security: '24/7 Security',
    elevator: 'Elevator',
    balcony: 'Balcony',
    swimmingPool: 'Swimming Pool',
    gym: 'Gym',
    laundry: 'Laundry Service',
    meals: 'Meals',
    commonRoom: 'Common Room',
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Property Header */}
      <div className="sticky top-16 z-40 border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button className="rounded-lg p-2 hover:bg-gray-100">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <h1 className="text-xl font-semibold">Property Details</h1>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsFavorited(!isFavorited)}
                className={`rounded-lg p-2 ${isFavorited ? 'bg-red-50 text-red-500' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <Heart className="h-5 w-5" />
              </button>
              <button className="rounded-lg p-2 text-gray-600 hover:bg-gray-100">
                <Share2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Property Gallery */}
          <div className="lg:col-span-2">
            {/* Main Image */}
            <div className="relative mb-4">
              <img
                src={property.images[0]}
                alt={property.title}
                className="h-[400px] w-full rounded-lg object-cover"
              />
              {property.isVerified && (
                <span className="absolute left-4 top-4 rounded bg-green-600 px-2 py-1 text-xs font-medium text-white">
                  Verified
                </span>
              )}
            </div>

            {/* Thumbnail Gallery */}
            <div className="grid grid-cols-4 gap-2">
              {property.images.slice(1, 5).map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Property image ${index + 2}`}
                  className="h-24 w-full cursor-pointer rounded-lg object-cover transition-opacity hover:opacity-80"
                />
              ))}
            </div>

            {/* Property Details */}
            <div className="mt-8 space-y-6">
              {/* Title and Price */}
              <div>
                <h2 className="mb-2 text-3xl font-bold text-gray-900">{property.title}</h2>
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-semibold text-primary-600">
                    {formatPrice(property.rentAmount)}
                  </span>
                  <span className="text-gray-600">/month</span>
                </div>
              </div>

              {/* Property Info */}
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="flex items-center space-x-2">
                  <div className="rounded-lg bg-gray-100 p-2">
                    <svg
                      className="h-5 w-5 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Type</p>
                    <p className="font-medium">Family Flat</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="rounded-lg bg-gray-100 p-2">
                    <svg
                      className="h-5 w-5 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Bedrooms</p>
                    <p className="font-medium">{property.bedrooms}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="rounded-lg bg-gray-100 p-2">
                    <svg
                      className="h-5 w-5 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Floor</p>
                    <p className="font-medium">
                      {property.floorNumber}/{property.totalFloors}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="rounded-lg bg-gray-100 p-2">
                    <svg
                      className="h-5 w-5 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 0h-4m4 0l-5-5"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Size</p>
                    <p className="font-medium">{property.squareFeet} sqft</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">Description</h3>
                <p className="leading-relaxed text-gray-600">{property.description}</p>
              </div>

              {/* Amenities */}
              <div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">Amenities</h3>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                  {property.amenities.map((amenity) => (
                    <div key={amenity} className="flex items-center space-x-2">
                      <svg
                        className="h-5 w-5 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-gray-700">
                        {amenityLabels[amenity as keyof typeof amenityLabels] || amenity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">Location</h3>
                <div className="flex items-start space-x-3">
                  <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">{property.address}</p>
                    <p className="text-gray-600">
                      {property.area}, {property.city}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Contact Card */}
            <div className="sticky top-24 rounded-lg border border-gray-200 bg-white p-6">
              {/* Owner Info */}
              <div className="mb-4 flex items-center space-x-3">
                <img
                  src={property.owner.avatar}
                  alt={property.owner.name}
                  className="h-12 w-12 rounded-full"
                />
                <div>
                  <h3 className="font-medium text-gray-900">Contact Owner</h3>
                  <p className="text-sm text-gray-600">{property.owner.name}</p>
                </div>
              </div>

              {/* Contact Options */}
              <div className="mb-6 space-y-3">
                <a
                  href={`tel:${property.owner.phone}`}
                  className="flex w-full items-center space-x-3 rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100"
                >
                  <Phone className="h-5 w-5 text-gray-600" />
                  <span className="text-gray-700">Call</span>
                </a>
                <a
                  href={`mailto:${property.owner.email}`}
                  className="flex w-full items-center space-x-3 rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100"
                >
                  <Mail className="h-5 w-5 text-gray-600" />
                  <span className="text-gray-700">Email</span>
                </a>
              </div>

              {/* Contact Button */}
              <Button
                size="lg"
                className="w-full bg-primary-600 hover:bg-primary-700"
                onClick={() => setShowContactModal(true)}
              >
                Send Message
              </Button>

              {/* Price Details */}
              <div className="mt-6 border-t border-gray-200 pt-6">
                <h4 className="mb-3 font-medium text-gray-900">Price Details</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monthly Rent</span>
                    <span className="font-medium">{formatPrice(property.rentAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Security Deposit</span>
                    <span className="font-medium">{formatPrice(property.securityDeposit)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Advance Payment</span>
                    <span className="font-medium">{property.advancePayment} months</span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="mt-6 border-t border-gray-200 pt-6">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-current text-yellow-400" />
                    <span className="text-sm font-medium">{property.stats.averageRating}</span>
                    <span className="text-sm text-gray-600">
                      ({property.stats.favorites} favorites)
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">{property.stats.views} views</div>
                </div>
              </div>

              {/* Availability */}
              <div className="mt-6 border-t border-gray-200 pt-6">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-700">
                    Available from{' '}
                    {new Date(property.availableFrom).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold">Contact Owner</h3>
            <div className="space-y-4">
              <Input label="Your Name" placeholder="Enter your name" />
              <Input label="Phone Number" placeholder="Enter your phone number" />
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Message</label>
                <textarea
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-primary-600"
                  rows={4}
                  placeholder="Write your message here..."
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                ></textarea>
              </div>
              <div className="flex space-x-3">
                <Button
                  variant="secondary"
                  onClick={() => setShowContactModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleContact}
                  className="flex-1 bg-primary-600 hover:bg-primary-700"
                >
                  Send Message
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PropertyDetailPage
