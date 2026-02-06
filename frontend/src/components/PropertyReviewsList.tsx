import React from 'react'
import { Star } from 'lucide-react'
import { formatDate, getUserDisplayName, getAvatarInitials } from '../utils/formatters'

export interface Review {
  id: string
  userId: string
  rating: number
  comment?: string
  createdAt: string
  user: {
    firstName: string
    lastName: string
    avatar?: string
  }
}

interface PropertyReviewsListProps {
  reviews: Review[]
  isLoading?: boolean
}

const PropertyReviewsList: React.FC<PropertyReviewsListProps> = ({ reviews, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse space-y-2 rounded-lg bg-gray-100 p-4">
            <div className="h-4 w-1/3 bg-gray-200" />
            <div className="h-3 w-full bg-gray-200" />
            <div className="h-3 w-2/3 bg-gray-200" />
          </div>
        ))}
      </div>
    )
  }

  if (reviews.length === 0) {
    return (
      <div className="rounded-lg bg-gray-50 p-8 text-center">
        <p className="text-gray-600">No reviews yet. Be the first to review this property!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review.id} className="rounded-lg border border-gray-200 p-4">
          {/* Review Header */}
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 font-semibold text-primary-600">
                {getAvatarInitials(review.user.firstName, review.user.lastName)}
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {getUserDisplayName({ firstName: review.user.firstName, lastName: review.user.lastName })}
                </p>
                <p className="text-sm text-gray-500">{formatDate(review.createdAt)}</p>
              </div>
            </div>

            {/* Rating Stars */}
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={16}
                  className={star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                />
              ))}
            </div>
          </div>

          {/* Review Comment */}
          {review.comment && (
            <p className="text-gray-700">{review.comment}</p>
          )}
        </div>
      ))}
    </div>
  )
}

export default PropertyReviewsList
