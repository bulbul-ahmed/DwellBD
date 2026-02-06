import React from 'react'
import { Eye, Heart, Star, MessageCircle } from 'lucide-react'

interface PropertyStatsSectionProps {
  viewCount: number
  favoriteCount: number
  averageRating: number
  reviewCount: number
}

const PropertyStatsSection: React.FC<PropertyStatsSectionProps> = ({
  viewCount,
  favoriteCount,
  averageRating,
  reviewCount,
}) => {
  return (
    <div className="grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4 md:grid-cols-4">
      {/* Views */}
      <div className="text-center">
        <Eye className="mx-auto mb-2 h-6 w-6 text-gray-600" />
        <p className="text-2xl font-bold text-gray-900">{viewCount}</p>
        <p className="text-sm text-gray-600">Views</p>
      </div>

      {/* Favorites */}
      <div className="text-center">
        <Heart className="mx-auto mb-2 h-6 w-6 text-red-500" />
        <p className="text-2xl font-bold text-gray-900">{favoriteCount}</p>
        <p className="text-sm text-gray-600">Favorites</p>
      </div>

      {/* Rating */}
      <div className="text-center">
        <Star className="mx-auto mb-2 h-6 w-6 text-yellow-500" />
        <p className="text-2xl font-bold text-gray-900">{averageRating.toFixed(1)}</p>
        <p className="text-sm text-gray-600">Rating</p>
      </div>

      {/* Reviews */}
      <div className="text-center">
        <MessageCircle className="mx-auto mb-2 h-6 w-6 text-blue-600" />
        <p className="text-2xl font-bold text-gray-900">{reviewCount}</p>
        <p className="text-sm text-gray-600">Reviews</p>
      </div>
    </div>
  )
}

export default PropertyStatsSection
