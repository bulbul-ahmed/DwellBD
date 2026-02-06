import React from 'react'
import { MapPin, Bed, Bath, Square } from 'lucide-react'
import { formatPrice } from '../utils/formatters'

interface PropertyInfoSectionProps {
  title: string
  address: string
  area: string
  propertyType: string
  rentAmount: number
  bedrooms?: number
  bathrooms?: number
  squareFeet?: number
  furnished?: string
  description?: string
}

const PropertyInfoSection: React.FC<PropertyInfoSectionProps> = ({
  title,
  address,
  area,
  propertyType,
  rentAmount,
  bedrooms,
  bathrooms,
  squareFeet,
  furnished,
  description,
}) => {
  return (
    <div className="space-y-6">
      {/* Title and Price */}
      <div>
        <h1 className="mb-2 text-3xl font-bold text-gray-900">{title}</h1>
        <div className="mb-4 flex items-center space-x-2 text-gray-600">
          <MapPin size={18} />
          <span className="text-lg font-semibold">{area}, Dhaka</span>
        </div>
        <p className="mb-4 text-gray-600">{address}</p>
      </div>

      {/* Price and Type */}
      <div className="flex items-baseline space-x-4">
        <div>
          <p className="text-sm text-gray-600">Monthly Rent</p>
          <p className="text-3xl font-bold text-primary-600">{formatPrice(rentAmount)}</p>
        </div>
        <div className="rounded-full bg-blue-100 px-4 py-2">
          <p className="text-sm font-medium capitalize text-blue-800">{propertyType}</p>
        </div>
        {furnished && (
          <div className="rounded-full bg-gray-100 px-4 py-2">
            <p className="text-sm font-medium capitalize text-gray-800">{furnished}</p>
          </div>
        )}
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-3 gap-4 border-y border-gray-200 py-6">
        {bedrooms && (
          <div className="flex items-center space-x-2">
            <Bed className="h-5 w-5 text-gray-600" />
            <div>
              <p className="text-sm text-gray-600">Bedrooms</p>
              <p className="font-semibold text-gray-900">{bedrooms}</p>
            </div>
          </div>
        )}
        {bathrooms && (
          <div className="flex items-center space-x-2">
            <Bath className="h-5 w-5 text-gray-600" />
            <div>
              <p className="text-sm text-gray-600">Bathrooms</p>
              <p className="font-semibold text-gray-900">{bathrooms}</p>
            </div>
          </div>
        )}
        {squareFeet && (
          <div className="flex items-center space-x-2">
            <Square className="h-5 w-5 text-gray-600" />
            <div>
              <p className="text-sm text-gray-600">Size</p>
              <p className="font-semibold text-gray-900">{squareFeet} sqft</p>
            </div>
          </div>
        )}
      </div>

      {/* Description */}
      {description && (
        <div>
          <h3 className="mb-3 text-lg font-semibold text-gray-900">About This Property</h3>
          <p className="text-gray-700 leading-relaxed">{description}</p>
        </div>
      )}
    </div>
  )
}

export default PropertyInfoSection
