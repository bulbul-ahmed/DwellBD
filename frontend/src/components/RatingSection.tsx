import { useState, useEffect } from 'react'
import { Star, MessageCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from './ui/Button'
import { getUserRatingStats, getUserRatings, createRating, UserRating, UserRatingStats } from '../api/ratingApi'

interface RatingSectionProps {
  userId: string
  userName?: string
  ratingType?: 'OWNER' | 'TENANT'
  currentUserRole?: 'OWNER' | 'TENANT'
  canRate?: boolean
  bookingId?: string
  onRatingCreated?: () => void
}

export default function RatingSection({
  userId,
  userName = 'User',
  ratingType,
  currentUserRole,
  canRate = false,
  bookingId,
  onRatingCreated,
}: RatingSectionProps) {
  const [stats, setStats] = useState<UserRatingStats>({
    userId,
    averageRating: 0,
    totalRatings: 0,
  })
  const [ratings, setRatings] = useState<UserRating[]>([])
  const [showRatingForm, setShowRatingForm] = useState(false)
  const [formData, setFormData] = useState({
    rating: 5,
    review: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRatings()
  }, [userId, ratingType])

  const loadRatings = async () => {
    try {
      setLoading(true)
      const statsData = await getUserRatingStats(userId)
      setStats(statsData)

      const ratingsData = await getUserRatings(userId, {
        ratingType,
        limit: 5,
      })
      setRatings(ratingsData.ratings)
    } catch (error) {
      console.error('Error loading ratings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitRating = async () => {
    if (formData.rating < 1 || formData.rating > 5) {
      toast.error('Please select a rating between 1 and 5')
      return
    }

    if (!formData.review.trim()) {
      toast.error('Please enter a review')
      return
    }

    setIsSubmitting(true)
    try {
      await createRating({
        toUserId: userId,
        rating: formData.rating,
        review: formData.review,
        ratingType: currentUserRole || 'TENANT',
        bookingId,
      })
      toast.success('Rating submitted successfully!')
      setShowRatingForm(false)
      setFormData({ rating: 5, review: '' })
      loadRatings()
      onRatingCreated?.()
    } catch (error: any) {
      console.error('Error submitting rating:', error)
      const message = error?.response?.data?.error || 'Failed to submit rating'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return <div className="text-center py-4 text-gray-500">Loading ratings...</div>
  }

  return (
    <div className="space-y-6">
      {/* Rating Stats */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-6 border border-yellow-200">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{userName}'s Rating</h3>
            <div className="flex items-center space-x-2 mb-2">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.round(stats.averageRating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : 'No ratings'}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              {stats.totalRatings} {stats.totalRatings === 1 ? 'rating' : 'ratings'}
            </p>
          </div>
          {canRate && !showRatingForm && (
            <Button
              onClick={() => setShowRatingForm(true)}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Rate User
            </Button>
          )}
        </div>
      </div>

      {/* Rating Form */}
      {canRate && showRatingForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <h4 className="font-semibold text-gray-900">Share Your Experience</h4>

          {/* Rating Stars */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Rating</label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setFormData({ ...formData, rating: star })}
                  className="transition-colors"
                >
                  <Star
                    className={`h-8 w-8 cursor-pointer ${
                      star <= formData.rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300 hover:text-yellow-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-600">Selected: {formData.rating} star{formData.rating !== 1 ? 's' : ''}</p>
          </div>

          {/* Review Text */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Review</label>
            <textarea
              value={formData.review}
              onChange={(e) => setFormData({ ...formData, review: e.target.value })}
              placeholder="Share your experience with this user..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
            <p className="text-xs text-gray-500">
              {formData.review.length}/500 characters
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button
              variant="secondary"
              onClick={() => setShowRatingForm(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitRating}
              disabled={isSubmitting}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Rating'}
            </Button>
          </div>
        </div>
      )}

      {/* Ratings List */}
      {ratings.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">Recent Ratings</h4>
          {ratings.map((rating) => (
            <div key={rating.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-medium text-gray-900">
                    {rating.fromUser?.firstName} {rating.fromUser?.lastName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(rating.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < rating.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="text-sm font-medium ml-2">{rating.rating}</span>
                </div>
              </div>
              {rating.review && <p className="text-gray-700 text-sm">{rating.review}</p>}
            </div>
          ))}
        </div>
      )}

      {!showRatingForm && ratings.length === 0 && !canRate && (
        <div className="text-center py-6 text-gray-500">
          <p>No ratings yet</p>
        </div>
      )}
    </div>
  )
}
