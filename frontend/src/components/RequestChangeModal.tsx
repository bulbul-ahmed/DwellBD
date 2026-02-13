import React, { useState, useEffect } from 'react'
import Modal from './ui/Modal'
import Button from './ui/Button'
import Input from './ui/Input'
import MultiSelect from './ui/MultiSelect'
import { X, AlertCircle } from 'lucide-react'
import { RequestType, submitRequest } from '../api/requestApi'
import { DHAKA_AREAS } from '../constants/areas'
import toast from 'react-hot-toast'

interface RequestChangeModalProps {
  isOpen: boolean
  onClose: () => void
  requestType: RequestType
  currentData?: any
  onSuccess?: () => void
}

const RequestChangeModal: React.FC<RequestChangeModalProps> = ({
  isOpen,
  onClose,
  requestType,
  currentData,
  onSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [reason, setReason] = useState('')

  // Form state based on request type
  const [businessName, setBusinessName] = useState('')
  const [businessLocation, setBusinessLocation] = useState('')
  const [serviceAreas, setServiceAreas] = useState<string[]>([])
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen && currentData) {
      if (requestType === 'BUSINESS_INFO_CHANGE') {
        setBusinessName(currentData.businessName || '')
        setBusinessLocation(currentData.businessLocation || '')
      } else if (requestType === 'SERVICE_AREA_CHANGE') {
        setServiceAreas(currentData.serviceAreas || [])
      } else if (requestType === 'CONTACT_INFO_CHANGE') {
        setPhone(currentData.phone || '')
        setEmail(currentData.email || '')
      }
    }
  }, [isOpen, currentData, requestType])

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setReason('')
      setBusinessName('')
      setBusinessLocation('')
      setServiceAreas([])
      setPhone('')
      setEmail('')
    }
  }, [isOpen])

  const handleSubmit = async () => {
    // Validate reason
    if (reason.trim().length < 10) {
      toast.error('Reason must be at least 10 characters')
      return
    }

    // Prepare request data based on type
    let requestData: any = {}
    let hasChanges = false

    if (requestType === 'BUSINESS_INFO_CHANGE') {
      if (businessName.trim() === '' && businessLocation.trim() === '') {
        toast.error('Please provide at least one field to change')
        return
      }
      requestData = {
        businessName: businessName.trim() || null,
        businessLocation: businessLocation.trim() || null,
      }
      hasChanges = true
    } else if (requestType === 'SERVICE_AREA_CHANGE') {
      if (serviceAreas.length === 0) {
        toast.error('Please select at least one service area')
        return
      }
      requestData = { serviceAreas }
      hasChanges = true
    } else if (requestType === 'CONTACT_INFO_CHANGE') {
      if (phone.trim() === '' && email.trim() === '') {
        toast.error('Please provide at least one contact detail to change')
        return
      }
      if (email.trim() !== '' && !isValidEmail(email.trim())) {
        toast.error('Please provide a valid email address')
        return
      }
      requestData = {
        phone: phone.trim() || null,
        email: email.trim() || null,
      }
      hasChanges = true
    }

    if (!hasChanges) {
      toast.error('No changes detected')
      return
    }

    setIsSubmitting(true)
    try {
      await submitRequest({
        requestType,
        requestData,
        currentData,
        reason: reason.trim(),
      })

      toast.success('Request submitted successfully')
      onClose()
      if (onSuccess) onSuccess()
    } catch (error: any) {
      console.error('Submit request error:', error)
      const errorMessage = error?.response?.data?.message || 'Failed to submit request'
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const getTitle = (): string => {
    const titles: Record<RequestType, string> = {
      BUSINESS_INFO_CHANGE: 'Request Business Information Change',
      SERVICE_AREA_CHANGE: 'Request Service Area Update',
      PROPERTY_APPROVAL: 'Submit Property for Approval',
      PROPERTY_EDIT_APPROVAL: 'Request Property Edit Approval',
      VERIFICATION_REQUEST: 'Request Business Verification',
      CONTACT_INFO_CHANGE: 'Request Contact Information Change',
    }
    return titles[requestType] || 'Submit Request'
  }

  const getDescription = (): string => {
    const descriptions: Record<RequestType, string> = {
      BUSINESS_INFO_CHANGE: 'Submit a request to update your business name or office location. An administrator will review and approve your changes.',
      SERVICE_AREA_CHANGE: 'Request to add or remove service areas. Changes will be reviewed by an administrator.',
      PROPERTY_APPROVAL: 'Submit a new property for administrator approval before it becomes active.',
      PROPERTY_EDIT_APPROVAL: 'Request approval for significant changes to an existing property.',
      VERIFICATION_REQUEST: 'Request verification of your business details.',
      CONTACT_INFO_CHANGE: 'Request to update your contact information (phone or email).',
    }
    return descriptions[requestType] || ''
  }

  return (
    <Modal open={isOpen} onClose={onClose} title={getTitle()}>
      <div className="space-y-4">
        {/* Description */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-900">{getDescription()}</p>
          </div>
        </div>

        {/* Form fields based on request type */}
        {requestType === 'BUSINESS_INFO_CHANGE' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Information
              </label>
              <div className="bg-gray-50 rounded-lg p-3 space-y-1 text-sm">
                <p><span className="font-medium">Business Name:</span> {currentData?.businessName || 'Not set'}</p>
                <p><span className="font-medium">Office Location:</span> {currentData?.businessLocation || 'Not set'}</p>
              </div>
            </div>

            <Input
              label="New Business Name"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Enter new business name"
              maxLength={100}
            />
            <p className="text-xs text-gray-500 -mt-2">{businessName.length}/100 characters</p>

            <Input
              label="New Office Location"
              value={businessLocation}
              onChange={(e) => setBusinessLocation(e.target.value)}
              placeholder="Enter new office location"
              maxLength={200}
            />
            <p className="text-xs text-gray-500 -mt-2">{businessLocation.length}/200 characters</p>
          </div>
        )}

        {requestType === 'SERVICE_AREA_CHANGE' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Service Areas
              </label>
              <div className="bg-gray-50 rounded-lg p-3">
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

            <MultiSelect
              label="New Service Areas"
              options={[...DHAKA_AREAS]}
              selected={serviceAreas}
              onChange={setServiceAreas}
              placeholder="Select service areas..."
            />
          </div>
        )}

        {requestType === 'CONTACT_INFO_CHANGE' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Contact Information
              </label>
              <div className="bg-gray-50 rounded-lg p-3 space-y-1 text-sm">
                <p><span className="font-medium">Phone:</span> {currentData?.phone || 'Not set'}</p>
                <p><span className="font-medium">Email:</span> {currentData?.email || 'Not set'}</p>
              </div>
            </div>

            <Input
              label="New Phone Number"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter new phone number"
            />

            <Input
              label="New Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter new email address"
            />
          </div>
        )}

        {/* Reason textarea (required for all types) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reason for Change <span className="text-red-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Please provide a reason for this change (minimum 10 characters)"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 min-h-[100px]"
            maxLength={500}
          />
          <p className="text-xs text-gray-500 mt-1">
            {reason.length}/500 characters {reason.length < 10 && `(minimum 10 required)`}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || reason.trim().length < 10}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default RequestChangeModal
