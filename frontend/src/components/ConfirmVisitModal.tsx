import { useState } from 'react'
import { X, Calendar, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from './ui/Button'
import { confirmVisitRequest, getTimeSlots } from '../api/visitApi'

interface VisitRequest {
  id: string
  propertyId: string
  requestedDate: string
  requestedTime: string
  status: 'PENDING' | 'CONFIRMED' | 'PENDING_ALTERNATIVE' | 'REJECTED' | 'CANCELLED' | 'COMPLETED'
}

interface ConfirmVisitModalProps {
  visit: VisitRequest
  onClose: () => void
  onSuccess: () => void
}

const ConfirmVisitModal = ({ visit, onClose, onSuccess }: ConfirmVisitModalProps) => {
  const [formData, setFormData] = useState({
    confirmedDate: visit.requestedDate,
    confirmedTime: visit.requestedTime,
    ownerNote: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  const timeSlots = getTimeSlots()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.confirmedDate) {
      toast.error('Please select a date')
      return
    }

    if (!formData.confirmedTime) {
      toast.error('Please select a time')
      return
    }

    try {
      setIsLoading(true)
      await confirmVisitRequest(visit.id, {
        confirmedDate: formData.confirmedDate,
        confirmedTime: formData.confirmedTime,
        ownerNote: formData.ownerNote || undefined
      })

      toast.success('Visit confirmed successfully!')
      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Error confirming visit:', error)
      const errorMsg = error?.response?.data?.error || 'Failed to confirm visit'

      // Handle double-booking error
      if (error?.response?.status === 409) {
        toast.error('This time slot is already booked. Please suggest an alternative.')
      } else {
        toast.error(errorMsg)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-bold text-gray-900">Confirm Visit</h2>
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
          {/* Date Picker */}
          <div>
            <label htmlFor="date" className="mb-2 flex items-center text-sm font-medium text-gray-700">
              <Calendar className="mr-2 h-4 w-4" />
              Confirmed Date
            </label>
            <input
              id="date"
              type="date"
              name="confirmedDate"
              value={formData.confirmedDate}
              onChange={handleInputChange}
              min={new Date().toISOString().split('T')[0]}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-600"
              required
              disabled={isLoading}
            />
            <p className="mt-1 text-xs text-gray-500">Select the confirmed visit date</p>
          </div>

          {/* Time Picker */}
          <div>
            <label htmlFor="time" className="mb-2 flex items-center text-sm font-medium text-gray-700">
              <Clock className="mr-2 h-4 w-4" />
              Confirmed Time
            </label>
            <select
              id="time"
              name="confirmedTime"
              value={formData.confirmedTime}
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
              name="ownerNote"
              value={formData.ownerNote}
              onChange={handleInputChange}
              placeholder="Any additional information for the tenant..."
              maxLength={500}
              rows={3}
              className="w-full resize-none rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-600"
              disabled={isLoading}
            />
            <p className="mt-1 text-xs text-gray-500">
              {formData.ownerNote.length}/500 characters
            </p>
          </div>

          {/* Info Box */}
          <div className="rounded-lg bg-blue-50 p-4">
            <p className="text-sm text-blue-900">
              <span className="font-medium">Note:</span> If this time slot is already booked, you'll be asked to suggest an alternative date instead.
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
              disabled={isLoading || !formData.confirmedDate || !formData.confirmedTime}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50"
            >
              {isLoading ? 'Confirming...' : 'Confirm Visit'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ConfirmVisitModal
