import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { Heart, MapPin, Phone, Mail, Calendar, Share2, Star, User } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import RatingSection from '../components/RatingSection'
import { usePropertyStore } from '../stores/propertyStore'
import { useAuthStore } from '../stores/authStore'
import { createInquiry } from '../api/inquiryApi'
import { addFavorite, removeFavorite, checkIsFavorited } from '../api/favoriteApi'
import { getPropertyReviews, getPropertyStats, Review, PropertyStats } from '../api/reviewApi'

const PropertyDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const [isFavorited, setIsFavorited] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [contactName, setContactName] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [contactMessage, setContactMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<PropertyStats>({
    viewCount: 0,
    favoriteCount: 0,
    averageRating: 0,
    reviewCount: 0,
  })
  const { currentProperty, isLoading, getProperty } = usePropertyStore()
  const { user } = useAuthStore()

  useEffect(() => {
    if (id) {
      getProperty(id)

      // Load property stats (views, favorites, average rating)
      getPropertyStats(id)
        .then((statsData) => setStats(statsData))
        .catch((error) => console.error('Error loading stats:', error))

      // Load reviews
      getPropertyReviews(id)
        .then((reviewsData) => setReviews(reviewsData))
        .catch((error) => console.error('Error loading reviews:', error))

      // Load favorite status if user is logged in
      if (user) {
        checkIsFavorited(id)
          .then((isFav) => setIsFavorited(isFav))
          .catch((error) => console.error('Error checking favorite status:', error))
      }
    }
  }, [id, getProperty, user])

  // Pre-fill name and phone if user is logged in
  useEffect(() => {
    if (user && showContactModal) {
      setContactName(user.firstName || '')
      setContactPhone(user.phone || '')
    }
  }, [user, showContactModal])

  const handleFavoriteClick = useCallback(async () => {
    if (!user) {
      toast.error('Please log in to add favorites')
      return
    }

    if (!id) {
      toast.error('Property not found')
      return
    }

    try {
      if (isFavorited) {
        await removeFavorite(id)
        setIsFavorited(false)
        toast.success('Removed from favorites')
      } else {
        await addFavorite(id)
        setIsFavorited(true)
        toast.success('Added to favorites')
      }
    } catch (error) {
      console.error('Error updating favorite:', error)
      toast.error('Failed to update favorite')
    }
  }, [user, id, isFavorited])

  const property = currentProperty

  const handleContact = useCallback(async () => {
    if (!contactMessage.trim()) {
      toast.error('Please enter a message')
      return
    }

    if (!contactName.trim()) {
      toast.error('Please enter your name')
      return
    }

    if (!contactPhone.trim()) {
      toast.error('Please enter your phone number')
      return
    }

    if (!id) {
      toast.error('Property not found')
      return
    }

    setIsSubmitting(true)
    try {
      await createInquiry({
        propertyId: id,
        name: contactName,
        phone: contactPhone,
        message: contactMessage,
      })
      toast.success('Your inquiry has been sent successfully!')
      setShowContactModal(false)
      setContactName('')
      setContactPhone('')
      setContactMessage('')
    } catch (error) {
      console.error('Error sending inquiry:', error)
      toast.error('Failed to send inquiry. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }, [contactMessage, contactName, contactPhone, id])

  const handleShare = useCallback((platform: string) => {
    if (!id || !property) {
      toast.error('Property not found')
      return
    }

    const shareUrl = `${window.location.origin}/properties/${id}`
    const title = property.title || 'Check out this property'
    const text = `${title} - ${formatPrice(property.rentAmount || 0)}`

    switch (platform) {
      case 'copy':
        navigator.clipboard.writeText(shareUrl)
        toast.success('Link copied to clipboard!')
        setShowShareModal(false)
        break

      case 'whatsapp':
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${text}\n${shareUrl}`)}`
        window.open(whatsappUrl, '_blank')
        setShowShareModal(false)
        break

      case 'email':
        const emailUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${text}\n\n${shareUrl}`)}`
        window.location.href = emailUrl
        setShowShareModal(false)
        break

      case 'facebook':
        const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
        window.open(fbUrl, '_blank')
        setShowShareModal(false)
        break

      default:
        break
    }
  }, [id, property])

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

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-primary-600"></div>
          <p className="text-gray-600">Loading property details...</p>
        </div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium text-gray-900">Property not found</p>
          <p className="text-gray-600">The property you're looking for doesn't exist.</p>
        </div>
      </div>
    )
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
                onClick={handleFavoriteClick}
                className={`rounded-lg p-2 ${isFavorited ? 'bg-red-50 text-red-500' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <Heart className={`h-5 w-5 ${isFavorited ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={() => setShowShareModal(true)}
                className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
              >
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
                src={property.images?.[0] || '/placeholder-property.jpg'}
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
              {property.images && property.images.slice(1, 5).map((image, index) => (
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
                  {(property.amenities || []).map((amenity) => (
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
                {property.owner && (
                  <>
                    <img
                      src={property.owner.avatar}
                      alt={`${property.owner.firstName} ${property.owner.lastName}`}
                      className="h-12 w-12 rounded-full"
                    />
                    <div>
                      <h3 className="font-medium text-gray-900">Contact Owner</h3>
                      <p className="text-sm text-gray-600">{property.owner.firstName} {property.owner.lastName}</p>
                    </div>
                  </>
                )}
              </div>

              {/* Contact Options */}
              <div className="mb-6 space-y-3">
                {property.owner?.phone && (
                  <a
                    href={`tel:${property.owner.phone}`}
                    className="flex w-full items-center space-x-3 rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100"
                  >
                    <Phone className="h-5 w-5 text-gray-600" />
                    <span className="text-gray-700">Call</span>
                  </a>
                )}
                {property.owner?.email && (
                  <a
                    href={`mailto:${property.owner.email}`}
                    className="flex w-full items-center space-x-3 rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100"
                  >
                    <Mail className="h-5 w-5 text-gray-600" />
                    <span className="text-gray-700">Email</span>
                  </a>
                )}
              </div>

              {/* Contact Button */}
              <Button
                size="lg"
                className="w-full bg-primary-600 hover:bg-primary-700"
                onClick={() => setShowContactModal(true)}
              >
                Send Message
              </Button>

              {/* Owner Ratings Section */}
              {property.owner && (
                <div className="mt-6 border-t border-gray-200 pt-6">
                  <RatingSection
                    userId={property.owner.id}
                    userName={`${property.owner.firstName} ${property.owner.lastName}`}
                    ratingType="OWNER"
                    currentUserRole={user?.role as 'OWNER' | 'TENANT' | undefined}
                    canRate={user?.id !== property.owner.id && user?.role === 'TENANT'}
                  />
                </div>
              )}

              {/* Price Details */}
              <div className="mt-6 border-t border-gray-200 pt-6">
                <h4 className="mb-3 font-medium text-gray-900">Price Details</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monthly Rent</span>
                    <span className="font-medium">{formatPrice(property.rentAmount || 0)}</span>
                  </div>
                  {property.securityDeposit && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Security Deposit</span>
                      <span className="font-medium">{formatPrice(property.securityDeposit)}</span>
                    </div>
                  )}
                  {property.advancePayment && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Advance Payment</span>
                      <span className="font-medium">{property.advancePayment} months</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="mt-6 border-t border-gray-200 pt-6">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-current text-yellow-400" />
                    <span className="text-sm font-medium">
                      {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : 'No rating yet'}
                    </span>
                    <span className="text-sm text-gray-600">
                      ({stats.favoriteCount} {stats.favoriteCount === 1 ? 'favorite' : 'favorites'})
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {stats.viewCount} {stats.viewCount === 1 ? 'view' : 'views'}
                  </div>
                </div>
              </div>

              {/* Availability */}
              {property.createdAt && (
                <div className="mt-6 border-t border-gray-200 pt-6">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-gray-700">
                      Listed {new Date(property.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Reviews ({stats.reviewCount})</h2>

          {reviews.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-2">No reviews yet</p>
              <p className="text-sm text-gray-400">Be the first to review this property!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {review.user?.avatar ? (
                          <img
                            src={review.user.avatar}
                            alt={review.user.firstName}
                            className="h-10 w-10 rounded-full"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <User className="h-6 w-6 text-gray-600" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {review.user?.firstName} {review.user?.lastName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="text-sm font-medium ml-2">{review.rating}</span>
                    </div>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold">Contact Owner</h3>
            <div className="space-y-4">
              <Input
                label="Your Name"
                placeholder="Enter your name"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
              />
              <Input
                label="Phone Number"
                placeholder="Enter your phone number"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
              />
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Message</label>
                <textarea
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-primary-600"
                  rows={4}
                  placeholder="Write your message here..."
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  disabled={isSubmitting}
                ></textarea>
              </div>
              <div className="flex space-x-3">
                <Button
                  variant="secondary"
                  onClick={() => setShowContactModal(false)}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleContact}
                  disabled={isSubmitting}
                  className="flex-1 bg-primary-600 hover:bg-primary-700"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-sm rounded-lg bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Share Property</h3>
            <div className="space-y-2">
              <button
                onClick={() => handleShare('copy')}
                className="w-full rounded-lg bg-gray-100 p-3 text-left hover:bg-gray-200 transition-colors"
              >
                <div className="font-medium text-gray-900">📋 Copy Link</div>
                <div className="text-sm text-gray-600">Copy link to clipboard</div>
              </button>
              <button
                onClick={() => handleShare('whatsapp')}
                className="w-full rounded-lg bg-green-50 p-3 text-left hover:bg-green-100 transition-colors"
              >
                <div className="font-medium text-gray-900">💬 WhatsApp</div>
                <div className="text-sm text-gray-600">Share on WhatsApp</div>
              </button>
              <button
                onClick={() => handleShare('email')}
                className="w-full rounded-lg bg-blue-50 p-3 text-left hover:bg-blue-100 transition-colors"
              >
                <div className="font-medium text-gray-900">📧 Email</div>
                <div className="text-sm text-gray-600">Share via email</div>
              </button>
              <button
                onClick={() => handleShare('facebook')}
                className="w-full rounded-lg bg-indigo-50 p-3 text-left hover:bg-indigo-100 transition-colors"
              >
                <div className="font-medium text-gray-900">👍 Facebook</div>
                <div className="text-sm text-gray-600">Share on Facebook</div>
              </button>
            </div>
            <Button
              onClick={() => setShowShareModal(false)}
              variant="secondary"
              className="w-full mt-4"
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default PropertyDetailPage
