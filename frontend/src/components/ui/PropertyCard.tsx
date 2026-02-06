import { useState, useEffect } from 'react'
import { Heart, MapPin, Bed, Bath, Square, Calendar } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import Button from './Button'
import LazyImage from './LazyImage'
import { useAuthStore } from '../../stores/authStore'
import { addFavorite, removeFavorite, checkIsFavorited } from '../../api/favoriteApi'

export interface Property {
  id: string
  title: string
  description?: string
  propertyType: 'BACHELOR' | 'FAMILY' | 'HOSTEL' | 'SUBLET' | 'OFFICE'
  listingType?: 'RENT' | 'SELL'
  address: string
  area: string
  rentAmount: number
  bedrooms?: number
  bathrooms?: number
  squareFeet?: number
  images?: string[]
  amenities?: string[]
  isVerified: boolean
  createdAt: string
}

interface PropertyCardProps {
  property: Property
  className?: string
}

const PropertyCard = ({ property, className = '' }: PropertyCardProps) => {
  const [isFavorited, setIsFavorited] = useState(false)
  const { user } = useAuthStore()

  useEffect(() => {
    if (user) {
      checkIsFavorited(property.id)
        .then((isFav) => setIsFavorited(isFav))
        .catch((error) => console.error('Error checking favorite status:', error))
    }
  }, [property.id, user])

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      toast.error('Please log in to add favorites')
      return
    }

    try {
      if (isFavorited) {
        await removeFavorite(property.id)
        setIsFavorited(false)
        toast.success('Removed from favorites')
      } else {
        await addFavorite(property.id)
        setIsFavorited(true)
        toast.success('Added to favorites')
      }
    } catch (error) {
      console.error('Error updating favorite:', error)
      toast.error('Failed to update favorite')
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const propertyTypeLabel = {
    BACHELOR: 'Bachelor',
    FAMILY: 'Family',
    HOSTEL: 'Hostel',
    SUBLET: 'Sublet',
    OFFICE: 'Office',
  }

  return (
    <div
      className={`overflow-hidden rounded-lg bg-white shadow-sm transition-all duration-200 hover:shadow-md ${className}`}
    >
      {/* Image */}
      <div className="relative">
        <Link to={`/properties/${property.id}`}>
          <LazyImage
            src={property.images?.[0] || '/placeholder-property.jpg'}
            alt={property.title}
            className="h-64 cursor-pointer"
            placeholderClassName="rounded-t-lg"
          />
        </Link>

        {/* Badges */}
        <div className="absolute left-3 top-3 flex space-x-2">
          {property.isVerified && (
            <span className="rounded bg-green-600 px-2 py-1 text-xs font-medium text-white">
              Verified
            </span>
          )}
          <span className="rounded bg-primary-600 px-2 py-1 text-xs font-medium text-white">
            {propertyTypeLabel[property.propertyType]}
          </span>
        </div>

        {/* Favorite Button */}
        <button
          onClick={handleFavorite}
          className="absolute right-3 top-3 rounded-full bg-white p-2 shadow-md transition-all duration-200 hover:shadow-lg"
          aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart
            className={`h-5 w-5 ${isFavorited ? 'fill-current text-red-500' : 'text-gray-400'}`}
          />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Location */}
        <div className="mb-2 flex items-center text-sm text-gray-600">
          <MapPin className="mr-1 h-4 w-4" />
          <span>{property.area}, Dhaka</span>
        </div>

        {/* Title */}
        <Link to={`/properties/${property.id}`} className="block">
          <h3 className="mb-2 line-clamp-2 font-semibold text-gray-900 transition-colors hover:text-primary-600">
            {property.title}
          </h3>
        </Link>

        {/* Description */}
        {property.description && (
          <p className="mb-3 line-clamp-2 text-sm text-gray-600">{property.description}</p>
        )}

        {/* Amenities */}
        <div className="mb-3 flex items-center space-x-4 text-sm text-gray-600">
          {property.bedrooms && (
            <div className="flex items-center">
              <Bed className="mr-1 h-4 w-4" />
              <span>{property.bedrooms}</span>
            </div>
          )}
          {property.bathrooms && (
            <div className="flex items-center">
              <Bath className="mr-1 h-4 w-4" />
              <span>{property.bathrooms}</span>
            </div>
          )}
          {property.squareFeet && (
            <div className="flex items-center">
              <Square className="mr-1 h-4 w-4" />
              <span>{property.squareFeet} sqft</span>
            </div>
          )}
        </div>

        {/* Price */}
        <div className="mb-3">
          <div className="text-lg font-semibold text-primary-600">
            {formatPrice(property.rentAmount)}
            {property.listingType === 'RENT' && (
              <span className="text-sm font-normal text-gray-600"> /month</span>
            )}
          </div>
        </div>

        {/* Date */}
        <div className="mb-3 flex items-center text-xs text-gray-500">
          <Calendar className="mr-1 h-3 w-3" />
          <span>Listed {formatDate(property.createdAt)}</span>
        </div>

        {/* CTA Button */}
        <Link to={`/properties/${property.id}`}>
          <Button size="md" className="w-full">
            View Details
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default PropertyCard
