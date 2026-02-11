import React, { useState, useEffect } from 'react'
import { getAdminProperties, updatePropertyStatus } from '../../api/adminApi'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface Property {
  id: string
  title: string
  address: string
  area: string
  status: string
  isVerified: boolean
  rentAmount: any
  coverImage: string | null
  owner: {
    id: string
    email: string
    firstName: string
    lastName: string
    phone: string
  }
  _count: {
    inquiries: number
    favorites: number
    reviews: number
    propertyViews: number
  }
}

const PendingApprovals: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [rejectionReason, setRejectionReason] = useState('')
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)

  const formatRentAmount = (amount: any): string => {
    if (typeof amount === 'string') {
      return amount
    }
    if (typeof amount === 'number') {
      return amount.toLocaleString('en-BD')
    }
    return '0'
  }

  useEffect(() => {
    fetchPendingProperties()
  }, [])

  const fetchPendingProperties = async () => {
    try {
      setLoading(true)
      const response = await getAdminProperties(1, 100, { status: 'PENDING' })
      // Handle different API response formats
      const data = response.properties || response.data || []
      setProperties(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching pending properties:', error)
      toast.error('Failed to load pending properties')
      setProperties([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (property: Property) => {
    if (!window.confirm(`Are you sure you want to approve "${property.title}"?`)) return

    try {
      await updatePropertyStatus(property.id, {
        status: 'ACTIVE',
      })
      toast.success(`${property.title} approved successfully`)
      fetchPendingProperties()
    } catch (error) {
      console.error('Error approving property:', error)
      toast.error('Failed to approve property')
    }
  }

  const handleOpenRejectModal = (property: Property) => {
    setSelectedProperty(property)
    setRejectionReason('')
    setIsRejectModalOpen(true)
  }

  const handleReject = async () => {
    if (!selectedProperty) return

    try {
      await updatePropertyStatus(selectedProperty.id, {
        status: 'INACTIVE',
        reason: rejectionReason,
      })
      toast.success(`${selectedProperty.title} rejected`)
      setIsRejectModalOpen(false)
      fetchPendingProperties()
    } catch (error) {
      console.error('Error rejecting property:', error)
      toast.error('Failed to reject property')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Pending Approvals</h1>
        <p className="text-gray-600 mt-1">{properties.length} properties awaiting approval</p>
      </div>

      {properties.length === 0 ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
          <CheckCircle className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-lg font-medium text-blue-900">No pending properties</p>
          <p className="text-sm text-blue-700 mt-1">All properties have been reviewed</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map(property => (
            <div key={property.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
              {/* Image */}
              {property.coverImage && (
                <div className="h-48 bg-gray-200 overflow-hidden">
                  <img
                    src={property.coverImage}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Content */}
              <div className="p-4 space-y-3">
                <h3 className="font-semibold text-gray-900 line-clamp-2">{property.title}</h3>
                <p className="text-sm text-gray-600">{property.address}</p>

                {/* Owner info */}
                <div className="border-t pt-3">
                  <p className="text-xs text-gray-600">Owner</p>
                  <p className="font-medium text-sm text-gray-900">
                    {property.owner.firstName} {property.owner.lastName}
                  </p>
                  <p className="text-xs text-gray-600">{property.owner.email}</p>
                  <p className="text-xs text-gray-600">{property.owner.phone}</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t text-xs">
                  <div>
                    <p className="text-gray-600">Inquiries</p>
                    <p className="font-semibold text-gray-900">{property._count.inquiries}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Favorites</p>
                    <p className="font-semibold text-gray-900">{property._count.favorites}</p>
                  </div>
                </div>

                {/* Rent */}
                <div className="pt-2 border-t">
                  <p className="text-lg font-bold text-blue-600">
                    {formatRentAmount(property.rentAmount)} Tk
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => handleApprove(property)}
                    className="flex-1 flex items-center justify-center"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    onClick={() => handleOpenRejectModal(property)}
                    variant="secondary"
                    className="flex-1 flex items-center justify-center text-red-600"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      <Modal
        open={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Reject Property"
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-700 mb-2">
              Are you sure you want to reject{' '}
              <span className="font-semibold">{selectedProperty?.title}</span>?
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Reason for rejection (optional)
            </label>
            <textarea
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              placeholder="Explain why this property is being rejected..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={() => setIsRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleReject}
              className="bg-red-600 hover:bg-red-700"
            >
              Reject Property
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default PendingApprovals
