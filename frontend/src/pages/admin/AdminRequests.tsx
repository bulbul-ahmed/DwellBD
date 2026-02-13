import React, { useState, useEffect } from 'react'
import { Eye, Clock, FileText, Filter } from 'lucide-react'
import Button from '../../components/ui/Button'
import Select from '../../components/ui/Select'
import Input from '../../components/ui/Input'
import RequestReviewModal from '../../components/admin/RequestReviewModal'
import {
  getAllRequests,
  OwnerRequest,
  RequestStatus,
  RequestType,
  getRequestTypeLabel,
  getStatusColor,
  getStatusIcon,
} from '../../api/requestApi'
import toast from 'react-hot-toast'

const AdminRequests: React.FC = () => {
  const [requests, setRequests] = useState<OwnerRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  // Filters
  const [filters, setFilters] = useState({
    status: '' as RequestStatus | '',
    requestType: '' as RequestType | '',
    search: '',
  })

  // Review modal
  const [selectedRequest, setSelectedRequest] = useState<OwnerRequest | null>(null)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)

  const fetchRequests = async () => {
    try {
      setIsLoading(true)
      const filterParams: any = {}
      if (filters.status) filterParams.status = filters.status
      if (filters.requestType) filterParams.requestType = filters.requestType

      const response = await getAllRequests(filterParams, page, 20)
      setRequests(response.requests)
      setTotalPages(response.totalPages)
      setTotal(response.total)
    } catch (error) {
      console.error('Error fetching requests:', error)
      toast.error('Failed to load requests')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [page, filters.status, filters.requestType])

  useEffect(() => {
    setPage(1) // Reset to page 1 when filters change
  }, [filters])

  const handleReviewRequest = (request: OwnerRequest) => {
    setSelectedRequest(request)
    setIsReviewModalOpen(true)
  }

  const handleReviewComplete = () => {
    fetchRequests()
    setIsReviewModalOpen(false)
    setSelectedRequest(null)
  }

  const getStatusBadge = (status: RequestStatus) => {
    const color = getStatusColor(status)
    const icon = getStatusIcon(status)

    const colorClasses: Record<string, string> = {
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      green: 'bg-green-100 text-green-800 border-green-200',
      red: 'bg-red-100 text-red-800 border-red-200',
      gray: 'bg-gray-100 text-gray-800 border-gray-200',
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClasses[color]}`}>
        {icon} <span className="ml-1">{status.replace('_', ' ')}</span>
      </span>
    )
  }

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'IN_REVIEW', label: 'In Review' },
    { value: 'APPROVED', label: 'Approved' },
    { value: 'REJECTED', label: 'Rejected' },
    { value: 'CANCELLED', label: 'Cancelled' },
  ]

  const typeOptions = [
    { value: '', label: 'All Types' },
    { value: 'BUSINESS_INFO_CHANGE', label: 'Business Info Change' },
    { value: 'SERVICE_AREA_CHANGE', label: 'Service Area Change' },
    { value: 'PROPERTY_APPROVAL', label: 'Property Approval' },
    { value: 'PROPERTY_EDIT_APPROVAL', label: 'Property Edit' },
    { value: 'VERIFICATION_REQUEST', label: 'Verification' },
    { value: 'CONTACT_INFO_CHANGE', label: 'Contact Info Change' },
  ]

  // Calculate stats
  const pendingCount = requests.filter(r => r.status === 'PENDING').length
  const inReviewCount = requests.filter(r => r.status === 'IN_REVIEW').length

  if (isLoading && requests.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Owner Requests</h1>
        <p className="text-gray-600 mt-1">Review and manage owner change requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-yellow-600" />
            <div>
              <p className="text-2xl font-bold text-yellow-900">{pendingCount}</p>
              <p className="text-sm text-yellow-700">Pending Review</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Eye className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-blue-900">{inReviewCount}</p>
              <p className="text-sm text-blue-700">In Review</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-gray-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{total}</p>
              <p className="text-sm text-gray-700">Total Requests</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Select
            label="Status"
            options={statusOptions}
            value={filters.status}
            onChange={(value) => setFilters({ ...filters, status: value as RequestStatus | '' })}
          />
          <Select
            label="Request Type"
            options={typeOptions}
            value={filters.requestType}
            onChange={(value) => setFilters({ ...filters, requestType: value as RequestType | '' })}
          />
          <Input
            label="Search Owner"
            placeholder="Search by name or email..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
      </div>

      {/* Requests Table - Desktop */}
      <div className="bg-white rounded-lg shadow overflow-hidden hidden md:block">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Owner</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Request Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Submitted</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {requests.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No requests found</p>
                </td>
              </tr>
            ) : (
              requests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {request.user?.firstName} {request.user?.lastName}
                      </p>
                      <p className="text-xs text-gray-600">{request.user?.email}</p>
                      {request.user?.isVerified && (
                        <span className="text-xs text-green-600">✓ Verified</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900">{getRequestTypeLabel(request.requestType)}</p>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(request.status)}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900">
                      {new Date(request.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                    <p className="text-xs text-gray-600">
                      {new Date(request.createdAt).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleReviewRequest(request)}
                      className="flex items-center"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Review
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Requests Cards - Mobile */}
      <div className="md:hidden space-y-4">
        {requests.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No requests found</p>
          </div>
        ) : (
          requests.map((request) => (
            <div key={request.id} className="bg-white rounded-lg shadow p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-gray-900">
                    {request.user?.firstName} {request.user?.lastName}
                  </p>
                  <p className="text-sm text-gray-600">{request.user?.email}</p>
                </div>
                {getStatusBadge(request.status)}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">
                  {getRequestTypeLabel(request.requestType)}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {new Date(request.createdAt).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleReviewRequest(request)}
                className="w-full"
              >
                Review Request
              </Button>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-lg shadow p-4">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-700">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Review Modal */}
      {selectedRequest && (
        <RequestReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          request={selectedRequest}
          onReviewComplete={handleReviewComplete}
        />
      )}
    </div>
  )
}

export default AdminRequests
