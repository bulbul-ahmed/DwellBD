import { useState, useEffect } from 'react'
import { Calendar, MapPin, Clock, CheckCircle, AlertCircle, XCircle, Phone, Mail, User } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '../components/ui/Button'
import ConfirmVisitModal from '../components/ConfirmVisitModal'
import RejectVisitModal from '../components/RejectVisitModal'
import SuggestAlternativeModal from '../components/SuggestAlternativeModal'
import { getOwnerVisitRequests, markVisitCompleted, formatDate, formatTime, formatVisitStatus, getStatusColor } from '../api/visitApi'

interface VisitRequest {
  id: string
  propertyId: string
  tenantId: string
  ownerId: string
  requestedDate: string
  requestedTime: string
  confirmedDate?: string
  confirmedTime?: string
  suggestedDate?: string
  suggestedTime?: string
  tenantNote?: string
  ownerNote?: string
  rejectionReason?: string
  status: 'PENDING' | 'CONFIRMED' | 'PENDING_ALTERNATIVE' | 'REJECTED' | 'CANCELLED' | 'COMPLETED'
  createdAt: string
  updatedAt: string
  completedAt?: string
  property?: {
    id: string
    title: string
    area: string
    images: string[]
    coverImage?: string
  }
  tenant?: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone?: string
  }
}

type TabType = 'PENDING' | 'CONFIRMED' | 'HISTORY'

const OwnerVisitRequestsPage = () => {
  const [visits, setVisits] = useState<VisitRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('PENDING')
  const [selectedVisit, setSelectedVisit] = useState<VisitRequest | null>(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showSuggestModal, setShowSuggestModal] = useState(false)
  const [completingId, setCompletingId] = useState<string | null>(null)

  useEffect(() => {
    loadVisits()
  }, [])

  const loadVisits = async () => {
    try {
      setIsLoading(true)
      const visitsList = await getOwnerVisitRequests()
      setVisits(visitsList)
    } catch (error) {
      console.error('Error loading visits:', error)
      toast.error('Failed to load visit requests')
    } finally {
      setIsLoading(false)
    }
  }

  const getTabVisits = () => {
    switch (activeTab) {
      case 'PENDING':
        return visits.filter((v) => v.status === 'PENDING' || v.status === 'PENDING_ALTERNATIVE')
      case 'CONFIRMED':
        return visits.filter((v) => v.status === 'CONFIRMED')
      case 'HISTORY':
        return visits.filter((v) => v.status === 'COMPLETED' || v.status === 'REJECTED' || v.status === 'CANCELLED')
      default:
        return []
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />
      case 'CONFIRMED':
        return <CheckCircle className="h-5 w-5 text-blue-600" />
      case 'PENDING_ALTERNATIVE':
        return <AlertCircle className="h-5 w-5 text-orange-600" />
      case 'REJECTED':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'COMPLETED':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'CANCELLED':
        return <XCircle className="h-5 w-5 text-gray-600" />
      default:
        return null
    }
  }

  const handleOpenConfirmModal = (visit: VisitRequest) => {
    setSelectedVisit(visit)
    setShowConfirmModal(true)
  }

  const handleOpenRejectModal = (visit: VisitRequest) => {
    setSelectedVisit(visit)
    setShowRejectModal(true)
  }

  const handleOpenSuggestModal = (visit: VisitRequest) => {
    setSelectedVisit(visit)
    setShowSuggestModal(true)
  }

  const handleConfirmSuccess = () => {
    setShowConfirmModal(false)
    setSelectedVisit(null)
    loadVisits()
    toast.success('Visit confirmed successfully')
  }

  const handleRejectSuccess = () => {
    setShowRejectModal(false)
    setSelectedVisit(null)
    loadVisits()
    toast.success('Visit rejected')
  }

  const handleSuggestSuccess = () => {
    setShowSuggestModal(false)
    setSelectedVisit(null)
    loadVisits()
    toast.success('Alternative date suggested')
  }

  const handleMarkCompleted = async (visitId: string) => {
    if (!window.confirm('Mark this visit as completed?')) return

    try {
      setCompletingId(visitId)
      await markVisitCompleted(visitId)
      setVisits((prev) =>
        prev.map((v) => (v.id === visitId ? { ...v, status: 'COMPLETED', completedAt: new Date().toISOString() } : v))
      )
      toast.success('Visit marked as completed')
    } catch (error) {
      console.error('Error marking visit completed:', error)
      toast.error('Failed to mark visit as completed')
    } finally {
      setCompletingId(null)
    }
  }

  const tabVisits = getTabVisits()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading visit requests...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Property Visit Requests</h1>
          <p className="mt-2 text-gray-600">Manage and respond to tenant visit requests for your properties</p>
        </div>

        {/* Tabs */}
        {visits.length > 0 && (
          <div className="mb-6 border-b border-gray-200">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab('PENDING')}
                className={`border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                  activeTab === 'PENDING'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Pending ({visits.filter((v) => v.status === 'PENDING' || v.status === 'PENDING_ALTERNATIVE').length})
              </button>
              <button
                onClick={() => setActiveTab('CONFIRMED')}
                className={`border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                  activeTab === 'CONFIRMED'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Confirmed ({visits.filter((v) => v.status === 'CONFIRMED').length})
              </button>
              <button
                onClick={() => setActiveTab('HISTORY')}
                className={`border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                  activeTab === 'HISTORY'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                History ({visits.filter((v) => v.status === 'COMPLETED' || v.status === 'REJECTED' || v.status === 'CANCELLED').length})
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {tabVisits.length === 0 ? (
          <div className="rounded-lg bg-white p-12 text-center shadow">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              {visits.length === 0 ? 'No visit requests yet' : `No ${activeTab.toLowerCase()} visits`}
            </h3>
            <p className="mt-2 text-gray-600">
              {visits.length === 0
                ? 'Tenants will send visit requests when they are interested in your properties'
                : 'Visit requests in this category will appear here'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {tabVisits.map((visit) => (
              <div key={visit.id} className="rounded-lg bg-white shadow transition-shadow hover:shadow-md">
                <div className="flex flex-col gap-4 p-6 sm:flex-row">
                  {/* Property Image */}
                  <div className="flex-shrink-0">
                    <img
                      src={visit.property?.coverImage || visit.property?.images?.[0] || 'https://via.placeholder.com/200x150?text=No+Image'}
                      alt={visit.property?.title}
                      className="h-40 w-40 rounded-lg object-cover"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{visit.property?.title}</h3>
                        <div className="mt-1 flex items-center text-sm text-gray-600">
                          <MapPin className="mr-1 h-4 w-4" />
                          {visit.property?.area}
                        </div>
                      </div>
                      <div className={`flex items-center gap-2 rounded-full px-3 py-1 ${getStatusColor(visit.status)}`}>
                        {getStatusIcon(visit.status)}
                        <span className="text-sm font-medium">{formatVisitStatus(visit.status)}</span>
                      </div>
                    </div>

                    {/* Tenant Info */}
                    <div className="mt-4 rounded-lg bg-gray-50 p-4">
                      <p className="text-sm font-medium text-gray-700">Tenant Information</p>
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center text-sm text-gray-900">
                          <User className="mr-2 h-4 w-4" />
                          {visit.tenant?.firstName} {visit.tenant?.lastName}
                        </div>
                        {visit.tenant?.email && (
                          <div className="flex items-center text-sm text-gray-900">
                            <Mail className="mr-2 h-4 w-4" />
                            {visit.tenant.email}
                          </div>
                        )}
                        {visit.tenant?.phone && (
                          <div className="flex items-center text-sm text-gray-900">
                            <Phone className="mr-2 h-4 w-4" />
                            {visit.tenant.phone}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {/* Requested */}
                      <div>
                        <p className="text-xs font-medium text-gray-500">REQUESTED</p>
                        <div className="mt-1 flex items-center text-sm text-gray-900">
                          <Calendar className="mr-2 h-4 w-4" />
                          {formatDate(visit.requestedDate)}
                        </div>
                        <div className="mt-1 flex items-center text-sm text-gray-900">
                          <Clock className="mr-2 h-4 w-4" />
                          {formatTime(visit.requestedTime)}
                        </div>
                      </div>

                      {/* Confirmed */}
                      {visit.confirmedDate && (
                        <div>
                          <p className="text-xs font-medium text-gray-500">CONFIRMED</p>
                          <div className="mt-1 flex items-center text-sm text-green-600 font-medium">
                            <Calendar className="mr-2 h-4 w-4" />
                            {formatDate(visit.confirmedDate)}
                          </div>
                          <div className="mt-1 flex items-center text-sm text-green-600 font-medium">
                            <Clock className="mr-2 h-4 w-4" />
                            {formatTime(visit.confirmedTime!)}
                          </div>
                        </div>
                      )}

                      {/* Suggested */}
                      {visit.suggestedDate && (
                        <div>
                          <p className="text-xs font-medium text-gray-500">YOU SUGGESTED</p>
                          <div className="mt-1 flex items-center text-sm text-orange-600 font-medium">
                            <Calendar className="mr-2 h-4 w-4" />
                            {formatDate(visit.suggestedDate)}
                          </div>
                          <div className="mt-1 flex items-center text-sm text-orange-600 font-medium">
                            <Clock className="mr-2 h-4 w-4" />
                            {formatTime(visit.suggestedTime!)}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Notes */}
                    {(visit.tenantNote || visit.ownerNote || visit.rejectionReason) && (
                      <div className="mt-4 space-y-2 border-t border-gray-100 pt-4">
                        {visit.tenantNote && (
                          <div className="text-sm">
                            <p className="font-medium text-gray-700">Tenant Message:</p>
                            <p className="mt-1 text-gray-600">{visit.tenantNote}</p>
                          </div>
                        )}
                        {visit.ownerNote && (
                          <div className="text-sm">
                            <p className="font-medium text-gray-700">Your Message:</p>
                            <p className="mt-1 text-gray-600">{visit.ownerNote}</p>
                          </div>
                        )}
                        {visit.rejectionReason && (
                          <div className="text-sm">
                            <p className="font-medium text-red-700">Rejection Reason:</p>
                            <p className="mt-1 text-red-600">{visit.rejectionReason || 'No reason provided'}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-100 pt-4">
                      {(visit.status === 'PENDING' || visit.status === 'PENDING_ALTERNATIVE') && (
                        <>
                          <Button
                            onClick={() => handleOpenConfirmModal(visit)}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Confirm Visit
                          </Button>
                          <button
                            onClick={() => handleOpenSuggestModal(visit)}
                            className="inline-flex items-center gap-2 rounded-lg border border-orange-300 px-3 py-2 text-sm font-medium text-orange-700 transition-colors hover:bg-orange-50"
                          >
                            <Calendar className="h-4 w-4" />
                            Suggest Alternative
                          </button>
                          <button
                            onClick={() => handleOpenRejectModal(visit)}
                            className="inline-flex items-center gap-2 rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50"
                          >
                            <XCircle className="h-4 w-4" />
                            Reject
                          </button>
                        </>
                      )}

                      {visit.status === 'CONFIRMED' && new Date(visit.confirmedDate!) < new Date() && (
                        <button
                          onClick={() => handleMarkCompleted(visit.id)}
                          disabled={completingId === visit.id}
                          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                        >
                          <CheckCircle className="h-4 w-4" />
                          {completingId === visit.id ? 'Completing...' : 'Mark Completed'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedVisit && showConfirmModal && (
        <ConfirmVisitModal visit={selectedVisit} onClose={() => setShowConfirmModal(false)} onSuccess={handleConfirmSuccess} />
      )}
      {selectedVisit && showRejectModal && (
        <RejectVisitModal visit={selectedVisit} onClose={() => setShowRejectModal(false)} onSuccess={handleRejectSuccess} />
      )}
      {selectedVisit && showSuggestModal && (
        <SuggestAlternativeModal visit={selectedVisit} onClose={() => setShowSuggestModal(false)} onSuccess={handleSuggestSuccess} />
      )}
    </div>
  )
}

export default OwnerVisitRequestsPage
