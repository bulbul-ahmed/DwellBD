import React, { useState, useEffect } from 'react'
import { Clock, CheckCircle, XCircle, Ban, Eye, FileText } from 'lucide-react'
import Button from '../components/ui/Button'
import {
  getMyRequests,
  cancelRequest,
  RequestStatus,
  OwnerRequest,
  getRequestTypeLabel,
  getStatusColor,
  getStatusIcon,
} from '../api/requestApi'
import toast from 'react-hot-toast'

const OwnerRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<OwnerRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<RequestStatus | 'ALL'>('ALL')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedRequest, setSelectedRequest] = useState<OwnerRequest | null>(null)
  const [isCancelling, setIsCancelling] = useState(false)

  const fetchRequests = async () => {
    try {
      setIsLoading(true)
      const statusFilter = activeTab === 'ALL' ? undefined : activeTab
      const response = await getMyRequests(statusFilter, page, 10)
      setRequests(response.requests)
      setTotalPages(response.totalPages)
    } catch (error) {
      console.error('Error fetching requests:', error)
      toast.error('Failed to load requests')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [activeTab, page])

  const handleCancelRequest = async (requestId: string) => {
    if (!window.confirm('Are you sure you want to cancel this request?')) return

    setIsCancelling(true)
    try {
      await cancelRequest(requestId)
      toast.success('Request cancelled successfully')
      fetchRequests()
      if (selectedRequest?.id === requestId) {
        setSelectedRequest(null)
      }
    } catch (error: any) {
      console.error('Error cancelling request:', error)
      const errorMessage = error?.response?.data?.message || 'Failed to cancel request'
      toast.error(errorMessage)
    } finally {
      setIsCancelling(false)
    }
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
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${colorClasses[color]}`}>
        {icon} <span className="ml-1.5">{status.replace('_', ' ')}</span>
      </span>
    )
  }

  const tabs: Array<{ label: string; value: RequestStatus | 'ALL'; icon: React.ReactNode }> = [
    { label: 'All', value: 'ALL', icon: <FileText className="w-4 h-4" /> },
    { label: 'Pending', value: 'PENDING', icon: <Clock className="w-4 h-4" /> },
    { label: 'In Review', value: 'IN_REVIEW', icon: <Eye className="w-4 h-4" /> },
    { label: 'Approved', value: 'APPROVED', icon: <CheckCircle className="w-4 h-4" /> },
    { label: 'Rejected', value: 'REJECTED', icon: <XCircle className="w-4 h-4" /> },
    { label: 'Cancelled', value: 'CANCELLED', icon: <Ban className="w-4 h-4" /> },
  ]

  if (isLoading && requests.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Requests</h1>
          <p className="mt-2 text-gray-600">
            View and manage your submitted requests
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6 overflow-x-auto">
          <div className="flex border-b">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => {
                  setActiveTab(tab.value)
                  setPage(1)
                }}
                className={`
                  flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap
                  ${activeTab === tab.value
                    ? 'border-b-2 border-primary-600 text-primary-600'
                    : 'text-gray-600 hover:text-gray-900'
                  }
                `}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Requests List */}
        {requests.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No requests found
            </h3>
            <p className="text-gray-600">
              {activeTab === 'ALL'
                ? "You haven't submitted any requests yet."
                : `You don't have any ${activeTab.toLowerCase().replace('_', ' ')} requests.`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div
                key={request.id}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {getRequestTypeLabel(request.requestType)}
                      </h3>
                      {getStatusBadge(request.status)}
                    </div>
                    <p className="text-sm text-gray-600">
                      Submitted: {new Date(request.createdAt).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>

                {/* Request Details */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Reason:</p>
                  <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                    {request.reason}
                  </p>
                </div>

                {/* Reviewer Info (if reviewed) */}
                {request.reviewer && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Reviewed by: {request.reviewer.firstName} {request.reviewer.lastName}
                    </p>
                    {request.reviewedAt && (
                      <p className="text-xs text-gray-500">
                        on {new Date(request.reviewedAt).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </p>
                    )}
                  </div>
                )}

                {/* Review Notes (if approved) */}
                {request.status === 'APPROVED' && request.reviewNotes && (
                  <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-green-900 mb-1">Admin Notes:</p>
                    <p className="text-sm text-green-800">{request.reviewNotes}</p>
                  </div>
                )}

                {/* Rejection Reason */}
                {request.status === 'REJECTED' && request.rejectionReason && (
                  <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-red-900 mb-1">Rejection Reason:</p>
                    <p className="text-sm text-red-800">{request.rejectionReason}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3 pt-4 border-t">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setSelectedRequest(selectedRequest?.id === request.id ? null : request)}
                  >
                    {selectedRequest?.id === request.id ? 'Hide Details' : 'View Details'}
                  </Button>
                  {request.status === 'PENDING' && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleCancelRequest(request.id)}
                      disabled={isCancelling}
                      className="text-red-600 hover:text-red-700 border-red-200"
                    >
                      {isCancelling ? 'Cancelling...' : 'Cancel Request'}
                    </Button>
                  )}
                </div>

                {/* Expanded Details */}
                {selectedRequest?.id === request.id && (
                  <div className="mt-4 pt-4 border-t space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Request ID:</p>
                      <p className="text-xs text-gray-600 font-mono bg-gray-50 rounded px-2 py-1 inline-block">
                        {request.id}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Requested Changes:</p>
                      <pre className="text-xs text-gray-600 bg-gray-50 rounded-lg p-3 overflow-x-auto">
                        {JSON.stringify(request.requestData, null, 2)}
                      </pre>
                    </div>

                    {request.currentData && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Current Data:</p>
                        <pre className="text-xs text-gray-600 bg-gray-50 rounded-lg p-3 overflow-x-auto">
                          {JSON.stringify(request.currentData, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between bg-white rounded-lg shadow-sm p-4">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default OwnerRequestsPage
