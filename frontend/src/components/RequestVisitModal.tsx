import { useState } from 'react'
import { X, Calendar, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from './ui/Button'
import { createVisitRequest, getTimeSlots } from '../api/visitApi'

interface RequestVisitModalProps {
  propertyId: string
  propertyTitle: string
  onClose: () => void
  onSuccess: () => void
}

const RequestVisitModal = ({
  propertyId,
  propertyTitle,
  onClose,
  onSuccess,
}: RequestVisitModalProps) => {
  const [formData, setFormData] = useState({
    requestedDate: '',
    requestedTime: '',
    tenantNote: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  // Generate time slots (9:00 AM - 5:30 PM, 30-min intervals)
  const timeSlots = getTimeSlots()

  // Calculate min/max dates
  const getDateRange = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const minDate = tomorrow.toISOString().split('T')[0]

    const maxDateObj = new Date()
    maxDateObj.setDate(maxDateObj.getDate() + 30)
    const maxDate = maxDateObj.toISOString().split('T')[0]

    return { minDate, maxDate }
  }

  const { minDate, maxDate } = getDateRange()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    if (name === 'tenantNote') {
      // Limit to 200 characters
      setFormData((prev) => ({
        ...prev,
        [name]: value.slice(0, 200)
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.requestedDate) {
      toast.error('Please select a date')
      return
    }

    if (!formData.requestedTime) {
      toast.error('Please select a time')
      return
    }

    try {
      setIsLoading(true)
      await createVisitRequest({
        propertyId,
        requestedDate: formData.requestedDate,
        requestedTime: formData.requestedTime,
        tenantNote: formData.tenantNote || undefined
      })

      toast.success('Visit request sent successfully! The owner will confirm soon.')
      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Error requesting visit:', error)
      const errorMsg = error?.response?.data?.error || 'Failed to send visit request'
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
          <h2 className="text-xl font-bold text-gray-900">Request Property Visit</h2>
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
          {/* Property Info */}
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-sm text-gray-600">Property</p>
            <p className="mt-1 font-semibold text-gray-900">{propertyTitle}</p>
          </div>

          {/* Date Picker */}
          <div>
            <label htmlFor="date" className="mb-2 flex items-center text-sm font-medium text-gray-700">
              <Calendar className="mr-2 h-4 w-4" />
              Preferred Date
            </label>
            <input
              id="date"
              type="date"
              name="requestedDate"
              value={formData.requestedDate}
              onChange={handleInputChange}
              min={minDate}
              max={maxDate}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-600"
              required
              disabled={isLoading}
            />
            <p className="mt-1 text-xs text-gray-500">Select a date within the next 30 days</p>
          </div>

          {/* Time Picker */}
          <div>
            <label htmlFor="time" className="mb-2 flex items-center text-sm font-medium text-gray-700">
              <Clock className="mr-2 h-4 w-4" />
              Preferred Time
            </label>
            <select
              id="time"
              name="requestedTime"
              value={formData.requestedTime}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-600"
              required
              disabled={isLoading}
            >
              <option value="">Select time</option>
              {timeSlots.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">Business hours: 9:00 AM - 5:30 PM</p>
          </div>

          {/* Optional Note */}
          <div>
            <label htmlFor="note" className="mb-2 block text-sm font-medium text-gray-700">
              Message (Optional)
            </label>
            <textarea
              id="note"
              name="tenantNote"
              value={formData.tenantNote}
              onChange={handleInputChange}
              placeholder="Any special requests or questions..."
              maxLength={200}
              rows={3}
              className="w-full resize-none rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-600"
              disabled={isLoading}
            />
            <p className="mt-1 text-xs text-gray-500">
              {formData.tenantNote.length}/200 characters
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
              disabled={isLoading || !formData.requestedDate || !formData.requestedTime}
              className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
            >
              {isLoading ? 'Sending...' : 'Send Request'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RequestVisitModal
