import React, { useState } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { CheckCircle, XCircle, Eye, Mail, AlertCircle } from 'lucide-react'
import {
  OwnerRequest,
  approveRequest,
  rejectRequest,
  markRequestInReview,
  getRequestTypeLabel,
  getStatusColor,
  getStatusIcon,
} from '../../api/requestApi'
import toast from 'react-hot-toast'

interface RequestReviewModalProps {
  isOpen: boolean
  onClose: () => void
  request: OwnerRequest
  onReviewComplete: () => void
}

const RequestReviewModal: React.FC<RequestReviewModalProps> = ({
  isOpen,
  onClose,
  request,
  onReviewComplete,
}) => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [reviewNotes, setReviewNotes] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectForm, setShowRejectForm] = useState(false)

  const handleApprove = async () => {
    if (!window.confirm('Are you sure you want to approve this request? Changes will be applied immediately.')) {
      return
    }

    setIsProcessing(true)
    try {
      await approveRequest(request.id, reviewNotes.trim() || undefined)
      toast.success('Request approved successfully')
      onReviewComplete()
    } catch (error: any) {
      console.error('Error approving request:', error)
      const errorMessage = error?.response?.data?.message || 'Failed to approve request'
      toast.error(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    if (rejectionReason.trim().length < 10) {
      toast.error('Rejection reason must be at least 10 characters')
      return
    }

    if (!window.confirm('Are you sure you want to reject this request?')) {
      return
    }

    setIsProcessing(true)
    try {
      await rejectRequest(request.id, rejectionReason.trim(), reviewNotes.trim() || undefined)
      toast.success('Request rejected')
      onReviewComplete()
    } catch (error: any) {
      console.error('Error rejecting request:', error)
      const errorMessage = error?.response?.data?.message || 'Failed to reject request'
      toast.error(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleMarkInReview = async () => {
    setIsProcessing(true)
    try {
      await markRequestInReview(request.id)
      toast.success('Request marked as in review')
      onReviewComplete()
    } catch (error: any) {
      console.error('Error marking in review:', error)
      const errorMessage = error?.response?.data?.message || 'Failed to update request'
      toast.error(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  const getStatusBadge = () => {
    const color = getStatusColor(request.status)
    const icon = getStatusIcon(request.status)

    const colorClasses: Record<string, string> = {
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      green: 'bg-green-100 text-green-800 border-green-200',
      red: 'bg-red-100 text-red-800 border-red-200',
      gray: 'bg-gray-100 text-gray-800 border-gray-200',
    }

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${colorClasses[color]}`}>
        {icon} <span className="ml-1.5">{request.status.replace('_', ' ')}</span>
      </span>
    )
  }

  const renderComparison = () => {
    const { requestType, requestData, currentData } = request

    if (requestType === 'BUSINESS_INFO_CHANGE') {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Current Business Name</p>
              <p className="text-sm text-gray-900 bg-gray-50 rounded-lg p-3">
                {currentData?.businessName || 'Not set'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Requested Business Name</p>
              <p className="text-sm text-gray-900 bg-blue-50 rounded-lg p-3 border border-blue-200">
                {requestData?.businessName || 'No change'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Current Office Location</p>
              <p className="text-sm text-gray-900 bg-gray-50 rounded-lg p-3">
                {currentData?.businessLocation || 'Not set'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Requested Office Location</p>
              <p className="text-sm text-gray-900 bg-blue-50 rounded-lg p-3 border border-blue-200">
                {requestData?.businessLocation || 'No change'}
              </p>
            </div>
          </div>
        </div>
      )
    }

    if (requestType === 'SERVICE_AREA_CHANGE') {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Current Service Areas</p>
              <div className="bg-gray-50 rounded-lg p-3 min-h-[80px]">
                {currentData?.serviceAreas && currentData.serviceAreas.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {currentData.serviceAreas.map((area: string) => (
                      <span key={area} className="px-2 py-1 bg-gray-200 rounded text-xs">
                        {area}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No service areas set</p>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Requested Service Areas</p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 min-h-[80px]">
                {requestData?.serviceAreas && requestData.serviceAreas.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {requestData.serviceAreas.map((area: string) => (
                      <span key={area} className="px-2 py-1 bg-blue-200 text-blue-900 rounded text-xs">
                        {area}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No areas specified</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )
    }

    if (requestType === 'CONTACT_INFO_CHANGE') {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Current Phone</p>
              <p className="text-sm text-gray-900 bg-gray-50 rounded-lg p-3">
                {currentData?.phone || 'Not set'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Requested Phone</p>
              <p className="text-sm text-gray-900 bg-blue-50 rounded-lg p-3 border border-blue-200">
                {requestData?.phone || 'No change'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Current Email</p>
              <p className="text-sm text-gray-900 bg-gray-50 rounded-lg p-3">
                {currentData?.email || 'Not set'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Requested Email</p>
              <p className="text-sm text-gray-900 bg-blue-50 rounded-lg p-3 border border-blue-200">
                {requestData?.email || 'No change'}
              </p>
            </div>
          </div>
        </div>
      )
    }

    // Default: Show JSON comparison
    return (
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Requested Changes</p>
          <pre className="text-xs text-gray-900 bg-blue-50 border border-blue-200 rounded-lg p-3 overflow-x-auto">
            {JSON.stringify(requestData, null, 2)}
          </pre>
        </div>
        {currentData && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Current Data</p>
            <pre className="text-xs text-gray-900 bg-gray-50 rounded-lg p-3 overflow-x-auto">
              {JSON.stringify(currentData, null, 2)}
            </pre>
          </div>
        )}
      </div>
    )
  }

  const canReview = request.status === 'PENDING' || request.status === 'IN_REVIEW'

  return (
    <Modal open={isOpen} onClose={onClose} title="Review Owner Request">
      <div className="space-y-6">
        {/* Request Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {getRequestTypeLabel(request.requestType)}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Submitted {new Date(request.createdAt).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}
            </p>
          </div>
          {getStatusBadge()}
        </div>

        {/* Owner Information */}
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Owner Information</p>
          <div className="space-y-1">
            <p className="text-sm text-gray-900">
              <span className="font-medium">Name:</span> {request.user?.firstName} {request.user?.lastName}
            </p>
            <p className="text-sm text-gray-900">
              <span className="font-medium">Email:</span> {request.user?.email}
            </p>
            <p className="text-sm text-gray-900">
              <span className="font-medium">Status:</span>{' '}
              {request.user?.isVerified ? (
                <span className="text-green-600">✓ Verified</span>
              ) : (
                <span className="text-gray-600">Not verified</span>
              )}
            </p>
          </div>
        </div>

        {/* Reason */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Reason for Request</p>
          <p className="text-sm text-gray-900 bg-gray-50 rounded-lg p-3">
            {request.reason}
          </p>
        </div>

        {/* Comparison */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">Changes Comparison</p>
          {renderComparison()}
        </div>

        {/* Review Notes (Optional) */}
        {!showRejectForm && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Admin Notes (Optional)
            </label>
            <textarea
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="Add any notes about this review..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 min-h-[80px]"
              maxLength={500}
              disabled={!canReview}
            />
            <p className="text-xs text-gray-500 mt-1">{reviewNotes.length}/500 characters</p>
          </div>
        )}

        {/* Rejection Form */}
        {showRejectForm && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-900 mb-2">Rejection Reason (Required)</p>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain why this request is being rejected (minimum 10 characters)..."
                  className="w-full px-3 py-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[100px]"
                  maxLength={500}
                  autoFocus
                />
                <p className="text-xs text-red-700 mt-1">
                  {rejectionReason.length}/500 characters {rejectionReason.length < 10 && '(minimum 10 required)'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Existing Review Info (if already reviewed) */}
        {request.reviewer && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-900 mb-2">Review Information</p>
            <div className="space-y-1 text-sm text-blue-800">
              <p>
                <span className="font-medium">Reviewed by:</span> {request.reviewer.firstName} {request.reviewer.lastName}
              </p>
              {request.reviewedAt && (
                <p>
                  <span className="font-medium">Reviewed at:</span>{' '}
                  {new Date(request.reviewedAt).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </p>
              )}
              {request.reviewNotes && (
                <p>
                  <span className="font-medium">Notes:</span> {request.reviewNotes}
                </p>
              )}
              {request.rejectionReason && (
                <p>
                  <span className="font-medium">Rejection Reason:</span> {request.rejectionReason}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 pt-4 border-t">
          <div className="flex items-center gap-2">
            {canReview && !showRejectForm && (
              <a
                href={`mailto:${request.user?.email}`}
                className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
              >
                <Mail className="w-4 h-4" />
                Contact Owner
              </a>
            )}
          </div>

          <div className="flex items-center gap-3">
            {showRejectForm ? (
              <>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowRejectForm(false)
                    setRejectionReason('')
                  }}
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleReject}
                  disabled={isProcessing || rejectionReason.trim().length < 10}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isProcessing ? 'Rejecting...' : 'Confirm Rejection'}
                </Button>
              </>
            ) : (
              <>
                <Button variant="secondary" onClick={onClose} disabled={isProcessing}>
                  Close
                </Button>
                {canReview && (
                  <>
                    {request.status === 'PENDING' && (
                      <Button
                        variant="secondary"
                        onClick={handleMarkInReview}
                        disabled={isProcessing}
                        className="flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        Mark In Review
                      </Button>
                    )}
                    <Button
                      variant="secondary"
                      onClick={() => setShowRejectForm(true)}
                      disabled={isProcessing}
                      className="text-red-600 hover:text-red-700 border-red-200 flex items-center gap-1"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </Button>
                    <Button
                      onClick={handleApprove}
                      disabled={isProcessing}
                      className="bg-green-600 hover:bg-green-700 flex items-center gap-1"
                    >
                      <CheckCircle className="w-4 h-4" />
                      {isProcessing ? 'Approving...' : 'Approve'}
                    </Button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default RequestReviewModal
