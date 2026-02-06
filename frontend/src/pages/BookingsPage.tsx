import { useState, useEffect } from 'react'
import { Calendar, MapPin, Clock, CheckCircle, AlertCircle, XCircle, Trash2, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import Button from '../components/ui/Button'
import RatingModal from '../components/RatingModal'
import { getUserBookings, cancelBooking, deleteBooking } from '../api/bookingApi'
import { checkExistingRating } from '../api/ratingApi'

interface Booking {
  id: string
  userId: string
  propertyId: string
  startDate: string
  endDate: string
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
  totalPrice: number
  createdAt: string
  updatedAt: string
  property?: {
    id: string
    title: string
    area: string
    images: string[]
    ownerId?: string
  }
}

const BookingsPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'>('ALL')
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [hasRated, setHasRated] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    loadBookings()
  }, [])

  const loadBookings = async () => {
    try {
      setIsLoading(true)
      const bookingsList = await getUserBookings()
      setBookings(bookingsList)

      // Check for existing ratings for completed bookings
      const ratingStatus: { [key: string]: boolean } = {}
      for (const booking of bookingsList) {
        if (booking.status === 'COMPLETED' && booking.property?.ownerId) {
          const existing = await checkExistingRating(booking.property.ownerId, booking.id)
          ratingStatus[booking.id] = !!existing
        }
      }
      setHasRated(ratingStatus)
    } catch (error) {
      console.error('Error loading bookings:', error)
      toast.error('Failed to load bookings')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return

    try {
      setCancellingId(bookingId)
      await cancelBooking(bookingId)
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: 'CANCELLED' } : b))
      )
      toast.success('Booking cancelled')
    } catch (error) {
      console.error('Error cancelling booking:', error)
      toast.error('Failed to cancel booking')
    } finally {
      setCancellingId(null)
    }
  }

  const handleDeleteBooking = async (bookingId: string) => {
    if (!window.confirm('Are you sure you want to delete this booking?')) return

    try {
      await deleteBooking(bookingId)
      setBookings((prev) => prev.filter((b) => b.id !== bookingId))
      toast.success('Booking deleted')
    } catch (error) {
      console.error('Error deleting booking:', error)
      toast.error('Failed to delete booking')
    }
  }

  const handleOpenRatingModal = (booking: Booking) => {
    setSelectedBooking(booking)
    setShowRatingModal(true)
  }

  const handleRatingSubmitted = () => {
    if (selectedBooking) {
      setHasRated((prev) => ({ ...prev, [selectedBooking.id]: true }))
    }
    setShowRatingModal(false)
    setSelectedBooking(null)
  }

  const getFilteredBookings = () => {
    if (filterStatus === 'ALL') return bookings
    return bookings.filter((b) => b.status === filterStatus)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'CONFIRMED':
        return <CheckCircle className="h-5 w-5 text-blue-500" />
      case 'COMPLETED':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'CANCELLED':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200'
      case 'CONFIRMED':
        return 'bg-blue-50 text-blue-800 border-blue-200'
      case 'COMPLETED':
        return 'bg-green-50 text-green-800 border-green-200'
      case 'CANCELLED':
        return 'bg-red-50 text-red-800 border-red-200'
      default:
        return 'bg-gray-50 text-gray-800 border-gray-200'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const calculateNights = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diff = end.getTime() - start.getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-primary-600 mx-auto"></div>
          <p className="text-gray-600">Loading bookings...</p>
        </div>
      </div>
    )
  }

  const filteredBookings = getFilteredBookings()
  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === 'PENDING').length,
    confirmed: bookings.filter((b) => b.status === 'CONFIRMED').length,
    completed: bookings.filter((b) => b.status === 'COMPLETED').length,
    cancelled: bookings.filter((b) => b.status === 'CANCELLED').length,
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
          <p className="mt-2 text-gray-600">Manage your property bookings and reservations</p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-5">
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="rounded-lg bg-yellow-50 p-4 shadow-sm border border-yellow-200">
            <div className="text-3xl font-bold text-yellow-800">{stats.pending}</div>
            <div className="text-sm text-yellow-700">Pending</div>
          </div>
          <div className="rounded-lg bg-blue-50 p-4 shadow-sm border border-blue-200">
            <div className="text-3xl font-bold text-blue-800">{stats.confirmed}</div>
            <div className="text-sm text-blue-700">Confirmed</div>
          </div>
          <div className="rounded-lg bg-green-50 p-4 shadow-sm border border-green-200">
            <div className="text-3xl font-bold text-green-800">{stats.completed}</div>
            <div className="text-sm text-green-700">Completed</div>
          </div>
          <div className="rounded-lg bg-red-50 p-4 shadow-sm border border-red-200">
            <div className="text-3xl font-bold text-red-800">{stats.cancelled}</div>
            <div className="text-sm text-red-700">Cancelled</div>
          </div>
        </div>

        {/* Filter */}
        {bookings.length > 0 && (
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Filter:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-primary-600"
              >
                <option value="ALL">All Bookings</option>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>
        )}

        {/* Empty State */}
        {bookings.length === 0 ? (
          <div className="rounded-lg bg-white p-12 text-center shadow-sm">
            <Calendar className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h3 className="mb-2 text-xl font-semibold text-gray-900">No bookings yet</h3>
            <p className="mb-6 text-gray-600">
              You haven't made any bookings yet. Start exploring properties and reserve your next stay!
            </p>
            <Link to="/properties">
              <Button className="bg-primary-600 hover:bg-primary-700">
                Find Properties
              </Button>
            </Link>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="rounded-lg bg-white p-8 text-center shadow-sm">
            <p className="text-gray-600">No bookings with this status</p>
          </div>
        ) : (
          /* Bookings List */
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div
                key={booking.id}
                className="rounded-lg bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  {/* Left Side - Image & Details */}
                  <div className="flex gap-4 flex-1">
                    {/* Image */}
                    <div className="h-32 w-32 flex-shrink-0 rounded-lg bg-gray-200 overflow-hidden">
                      {booking.property?.images?.[0] && (
                        <img
                          src={booking.property.images[0]}
                          alt={booking.property?.title}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      {/* Status */}
                      <div className="mb-2 flex items-center gap-2">
                        {getStatusIcon(booking.status)}
                        <span className={`rounded-full px-3 py-1 text-sm font-medium border ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>

                      {/* Property Title */}
                      {booking.property && (
                        <Link
                          to={`/properties/${booking.property.id}`}
                          className="block mb-2"
                        >
                          <h3 className="font-semibold text-gray-900 hover:text-primary-600 transition-colors line-clamp-1">
                            {booking.property.title}
                          </h3>
                        </Link>
                      )}

                      {/* Location */}
                      <div className="mb-3 flex items-center text-sm text-gray-600">
                        <MapPin className="mr-1 h-4 w-4" />
                        <span>{booking.property?.area}, Dhaka</span>
                      </div>

                      {/* Dates */}
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(booking.startDate)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(booking.endDate)}</span>
                        </div>
                        <div className="text-gray-500">
                          ({calculateNights(booking.startDate, booking.endDate)} nights)
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Side - Price & Actions */}
                  <div className="flex flex-col items-end gap-3">
                    {/* Price */}
                    <div className="text-right">
                      <div className="text-lg font-semibold text-primary-600">
                        {formatPrice(booking.totalPrice)}
                      </div>
                      <div className="text-xs text-gray-500">Total</div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      {booking.status === 'COMPLETED' && (
                        <button
                          onClick={() => handleOpenRatingModal(booking)}
                          disabled={hasRated[booking.id]}
                          className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                          style={{
                            backgroundColor: hasRated[booking.id] ? '#f3f4f6' : '#fbbf24',
                            color: hasRated[booking.id] ? '#9ca3af' : '#78350f',
                          }}
                        >
                          <Star className="h-4 w-4" />
                          {hasRated[booking.id] ? 'Rated' : 'Rate Owner'}
                        </button>
                      )}
                      {booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED' && (
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          disabled={cancellingId === booking.id}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <AlertCircle className="h-4 w-4" />
                          Cancel
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteBooking(booking.id)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Rating Modal */}
        {showRatingModal && selectedBooking && selectedBooking.property?.ownerId && (
          <RatingModal
            toUserId={selectedBooking.property.ownerId}
            bookingId={selectedBooking.id}
            ratingType="OWNER"
            recipientName={selectedBooking.property?.title || 'Property Owner'}
            onClose={() => setShowRatingModal(false)}
            onRatingSubmitted={handleRatingSubmitted}
          />
        )}
      </div>
    </div>
  )
}

export default BookingsPage
