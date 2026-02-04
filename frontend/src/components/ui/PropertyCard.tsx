import { useState } from 'react'
import { Heart, MapPin, Bed, Bath, Square, Calendar } from 'lucide-react'
import { Link } from 'react-router-dom'
import Button from './Button'

export interface Property {
  id: string
  title: string
  description?: string
  propertyType: 'BACHELOR' | 'FAMILY' | 'HOSTEL'
  listingType: 'RENT' | 'SELL'
  address: string
  area: string
  rentAmount: number
  bedrooms?: number
  bathrooms?: number
  squareFeet?: number
  images: string[]
  amenities: string[]
  isVerified: boolean
  createdAt: string
}

interface PropertyCardProps {
  property: Property
  className?: string
}

const PropertyCard = ({ property, className = '' }: PropertyCardProps) => {
  const [isFavorited, setIsFavorited] = useState(false)

  const handleFavorite = () => {
    setIsFavorited(!isFavorited)
  }

  const formatPrice = (amount: number) => {
    const formatter = new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      maximumFractionDigits: 0,
    })
    return formatter.format(amount)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const propertyTypeLabel = {
    BACHELOR: 'Bachelor',
    FAMILY: 'Family',
    HOSTEL: 'Hostel',
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${className}`}>
      {/* Image */}
      <div className="relative">
        <Link to={`/properties/${property.id}`}>
          <img
            src={property.images[0] || '/placeholder-property.jpg'}
            alt={property.title}
            className="w-full h-64 object-cover cursor-pointer"
            loading="lazy"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex space-x-2">
          {property.isVerified && (
            <span className="bg-green-600 text-white text-xs font-medium px-2 py-1 rounded">
              Verified
            </span>
          )}
          <span className="bg-primary-600 text-white text-xs font-medium px-2 py-1 rounded">
            {propertyTypeLabel[property.propertyType]}
          </span>
        </div>

        {/* Favorite Button */}
        <button
          onClick={handleFavorite}
          className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-200"
          aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart
            className={`h-5 w-5 ${isFavorited ? 'text-red-500 fill-current' : 'text-gray-400'}`}
          />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Location */}
        <div className="flex items-center text-sm text-gray-600 mb-2">
          <MapPin className="h-4 w-4 mr-1" />
          <span>{property.area}, Dhaka</span>
        </div>

        {/* Title */}
        <Link to={`/properties/${property.id}`} className="block">
          <h3 className="font-semibold text-gray-900 mb-2 hover:text-primary-600 transition-colors line-clamp-2">
            {property.title}
          </h3>
        </Link>

        {/* Description */}
        {property.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {property.description}
          </p>
        )}

        {/* Amenities */}
        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
          {property.bedrooms && (
            <div className="flex items-center">
              <Bed className="h-4 w-4 mr-1" />
              <span>{property.bedrooms}</span>
            </div>
          )}
          {property.bathrooms && (
            <div className="flex items-center">
              <Bath className="h-4 w-4 mr-1" />
              <span>{property.bathrooms}</span>
            </div>
          )}
          {property.squareFeet && (
            <div className="flex items-center">
              <Square className="h-4 w-4 mr-1" />
              <span>{property.squareFeet} sqft</span>
            </div>
          )}
        </div>

        {/* Price */}
        <div className="mb-3">
          <div className="text-lg font-semibold text-primary-600">
            {formatPrice(property.rentAmount)}
            {property.listingType === 'RENT' && <span className="text-sm font-normal text-gray-600"> /month</span>}
          </div>
        </div>

        {/* Date */}
        <div className="flex items-center text-xs text-gray-500 mb-3">
          <Calendar className="h-3 w-3 mr-1" />
          <span>Listed {formatDate(property.createdAt)}</span>
        </div>

        {/* CTA Button */}
        <Button size="md" className="w-full">
          View Details
        </Button>
      </div>
    </div>
  )
}

export default PropertyCard