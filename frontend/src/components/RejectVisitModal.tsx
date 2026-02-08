import { useState } from 'react'
import { X, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from './ui/Button'
import { rejectVisitRequest } from '../api/visitApi'

interface VisitRequest {
  id: string
}

interface RejectVisitModalProps {
  visit: VisitRequest
  onClose: () => void
  onSuccess: () => void
}

const RejectVisitModal = ({ visit, onClose, onSuccess }: RejectVisitModalProps) => {
  const [rejectionReason, setRejectionReason] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setIsLoading(true)
      await rejectVisitRequest(visit.id, rejectionReason || undefined)

      toast.success('Visit request rejected')
      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Error rejecting visit:', error)
      const errorMsg = error?.response?.data?.error || 'Failed to reject visit'
      toast.error(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-bold text-gray-900">Reject Visit Request</h2>
          <button
            onClick={onClose}
            className="text-gray-400 transition-colors hover:text-gray-600"
            disabled={isLoading}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="space-y-6 px-6 py-4">
          {/* Warning Box */}
          <div className="rounded-lg bg-red-50 p-4">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
              <p className="text-sm text-red-900">
                The tenant will be notified that their visit request has been rejected.
              </p>
            </div>
          </div>

          {/* Rejection Reason */}
          <div>
            <label htmlFor="reason" className="mb-2 block text-sm font-medium text-gray-700">
              Reason for Rejection (Optional)
            </label>
            <textarea
              id="reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value.slice(0, 500))}
              placeholder="Let the tenant know why you're rejecting their request (e.g., property already rented, maintenance scheduled)..."
              maxLength={500}
              rows={4}
              className="w-full resize-none rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-600"
              disabled={isLoading}
            />
            <p className="mt-1 text-xs text-gray-500">
              {rejectionReason.length}/500 characters
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
              disabled={isLoading}
            >
              Cancel
            </button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50"
            >
              {isLoading ? 'Rejecting...' : 'Reject Request'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RejectVisitModal
