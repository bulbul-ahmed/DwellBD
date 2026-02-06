import { useState } from 'react'
import { X, Star } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from './ui/Button'
import { createRating } from '../api/ratingApi'

interface RatingModalProps {
  toUserId: string
  bookingId?: string
  ratingType: 'OWNER' | 'TENANT'
  recipientName: string
  onClose: () => void
  onRatingSubmitted: () => void
}

const RatingModal = ({
  toUserId,
  bookingId,
  ratingType,
  recipientName,
  onClose,
  onRatingSubmitted,
}: RatingModalProps) => {
  const [rating, setRating] = useState(0)
  const [review, setReview] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [hoveredRating, setHoveredRating] = useState(0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (rating === 0) {
      toast.error('Please select a rating')
      return
    }

    try {
      setIsLoading(true)
      await createRating({
        toUserId,
        rating,
        review: review.trim() || undefined,
        ratingType,
        bookingId,
      })

      toast.success('Rating submitted successfully')
      onRatingSubmitted()
    } catch (error: any) {
      console.error('Error submitting rating:', error)
      toast.error(error.response?.data?.error || 'Failed to submit rating')
    } finally {
      setIsLoading(false)
    }
  }

  const getRatingLabel = (value: number) => {
    switch (value) {
      case 1:
        return 'Poor'
      case 2:
        return 'Fair'
      case 3:
        return 'Good'
      case 4:
        return 'Very Good'
      case 5:
        return 'Excellent'
      default:
        return ''
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-bold text-gray-900">
            Rate {ratingType === 'OWNER' ? 'Owner' : 'Tenant'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="space-y-6 px-6 py-4">
          {/* Recipient Info */}
          <div className="text-center">
            <p className="text-sm text-gray-600">Rating</p>
            <p className="mt-1 text-lg font-semibold text-gray-900">
              {recipientName}
            </p>
          </div>

          {/* Star Rating */}
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`h-8 w-8 ${
                    star <= (hoveredRating || rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Rating Label */}
          {(hoveredRating || rating) > 0 && (
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700">
                {getRatingLabel(hoveredRating || rating)}
              </p>
            </div>
          )}

          {/* Review Text */}
          <div>
            <label htmlFor="review" className="block text-sm font-medium text-gray-700">
              Review (Optional)
            </label>
            <textarea
              id="review"
              value={review}
              onChange={(e) => setReview(e.target.value.slice(0, 500))}
              placeholder="Share your experience..."
              maxLength={500}
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-primary-600 resize-none"
              rows={4}
            />
            <div className="mt-1 text-xs text-gray-500">
              {review.length}/500 characters
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <Button
              type="submit"
              disabled={isLoading || rating === 0}
              className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
            >
              {isLoading ? 'Submitting...' : 'Submit Rating'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RatingModal
