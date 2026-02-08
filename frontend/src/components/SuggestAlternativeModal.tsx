import { useState } from 'react'
import { X, Calendar, Clock, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from './ui/Button'
import { suggestAlternativeDate, getTimeSlots } from '../api/visitApi'

interface VisitRequest {
  id: string
  requestedDate: string
  requestedTime: string
}

interface SuggestAlternativeModalProps {
  visit: VisitRequest
  onClose: () => void
  onSuccess: () => void
}

const SuggestAlternativeModal = ({ visit, onClose, onSuccess }: SuggestAlternativeModalProps) => {
  const [formData, setFormData] = useState({
    suggestedDate: '',
    suggestedTime: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  const timeSlots = getTimeSlots()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target as HTMLInputElement | HTMLSelectElement
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.suggestedDate) {
      toast.error('Please select a date')
      return
    }

    if (!formData.suggestedTime) {
      toast.error('Please select a time')
      return
    }

    try {
      setIsLoading(true)
      await suggestAlternativeDate(visit.id, {
        suggestedDate: formData.suggestedDate,
        suggestedTime: formData.suggestedTime
      })

      toast.success('Alternative date suggested!')
      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Error suggesting alternative:', error)
      const errorMsg = error?.response?.data?.error || 'Failed to suggest alternative date'
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
          <h2 className="text-xl font-bold text-gray-900">Suggest Alternative Date</h2>
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
          {/* Original Request Info */}
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-xs font-medium text-gray-500">TENANT'S REQUESTED DATE/TIME</p>
            <p className="mt-2 text-sm font-medium text-gray-900">
              {new Date(visit.requestedDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}{' '}
              at{' '}
              {(() => {
                const [hours, minutes] = visit.requestedTime.split(':')
                const hour = parseInt(hours)
                const ampm = hour >= 12 ? 'PM' : 'AM'
                const displayHour = hour % 12 || 12
                return `${displayHour}:${minutes} ${ampm}`
              })()}
            </p>
          </div>

          {/* Date Picker */}
          <div>
            <label htmlFor="date" className="mb-2 flex items-center text-sm font-medium text-gray-700">
              <Calendar className="mr-2 h-4 w-4" />
              Suggested Date
            </label>
            <input
              id="date"
              type="date"
              name="suggestedDate"
              value={formData.suggestedDate}
              onChange={handleInputChange}
              min={new Date().toISOString().split('T')[0]}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-600"
              required
              disabled={isLoading}
            />
            <p className="mt-1 text-xs text-gray-500">Select an alternative date</p>
          </div>

          {/* Time Picker */}
          <div>
            <label htmlFor="time" className="mb-2 flex items-center text-sm font-medium text-gray-700">
              <Clock className="mr-2 h-4 w-4" />
              Suggested Time
            </label>
            <select
              id="time"
              name="suggestedTime"
              value={formData.suggestedTime}
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

          {/* Info Box */}
          <div className="rounded-lg bg-blue-50 p-4">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-blue-600" />
              <p className="text-sm text-blue-900">
                The tenant will receive a notification with your suggested date and time. They can accept or decline.
              </p>
            </div>
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
              disabled={isLoading || !formData.suggestedDate || !formData.suggestedTime}
              className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:opacity-50"
            >
              {isLoading ? 'Suggesting...' : 'Suggest Alternative'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SuggestAlternativeModal
