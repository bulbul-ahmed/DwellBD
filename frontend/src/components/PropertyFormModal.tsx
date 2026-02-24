import React, { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import Modal from './ui/Modal'
import Button from './ui/Button'
import Input from './ui/Input'
import Select from './ui/Select'
import FileUpload from './ui/FileUpload'
import * as propertyApi from '../api/propertyApi'
import { Property, PropertyData } from '../api/propertyApi'
import { submitRequest } from '../api/requestApi'
import { amenities } from '../constants/amenities'
import { AREAS, LOCATION_MAP } from '../constants/areas'

interface PropertyFormModalProps {
  isOpen: boolean
  onClose: () => void
  mode: 'create' | 'edit'
  property?: Property
  onSuccess: () => void
  propertyId?: string  // For debugging - show the ID being edited
}

interface FormData extends Omit<PropertyData, 'amenities'> {
  amenities: string[]
  gasType?: string
  tenantPreference?: string
  subArea?: string
}

const PROPERTY_TYPES = [
  { value: 'BACHELOR', label: 'Bachelor' },
  { value: 'FAMILY', label: 'Family' },
  { value: 'HOSTEL', label: 'Hostel' },
  { value: 'SUBLET', label: 'Sublet' },
  { value: 'OFFICE', label: 'Office' }
]

const LISTING_TYPES = [
  { value: 'RENT', label: 'Rent' },
  { value: 'SELL', label: 'Sell' }
]

const FURNISHED_OPTIONS = [
  { value: 'NONE', label: 'Unfurnished' },
  { value: 'PARTIAL', label: 'Partially Furnished' },
  { value: 'FULL', label: 'Fully Furnished' }
]

const GAS_TYPES = [
  { value: 'NATURAL_GAS', label: 'Natural Gas' },
  { value: 'LP_GAS', label: 'LP Gas' },
  { value: 'CYLINDER', label: 'Cylinder' }
]

const TENANT_PREFERENCES = [
  { value: 'FAMILY', label: 'Family Only' },
  { value: 'BACHELOR', label: 'Bachelor Only' },
  { value: 'OFFICE', label: 'Office Only' },
  { value: 'ANY', label: 'Any Tenant Type' }
]

export const PropertyFormModal: React.FC<PropertyFormModalProps> = ({
  isOpen,
  onClose,
  mode,
  property,
  onSuccess,
  propertyId
}) => {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    propertyType: 'FAMILY',
    listingType: 'RENT',
    address: '',
    area: '',
    subArea: '',
    city: 'Dhaka',
    bedrooms: 1,
    bathrooms: 1,
    floorNumber: undefined,
    totalFloors: undefined,
    squareFeet: 0,
    furnished: 'PARTIAL',
    rentAmount: 0,
    rentPeriod: 'MONTHLY',
    securityDeposit: undefined,
    advancePayment: undefined,
    amenities: [],
    gasType: 'NATURAL_GAS',
    tenantPreference: 'ANY'
  })

  const [files, setFiles] = useState<File[]>([])
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Initialize form when property is provided (edit mode)
  useEffect(() => {
    if (mode === 'edit' && property) {
      setFormData({
        title: property.title,
        description: property.description || '',
        propertyType: property.propertyType as FormData['propertyType'],
        listingType: property.listingType || 'RENT',
        address: property.address,
        area: property.area,
        subArea: (property as any).subArea || '',
        city: property.city || 'Dhaka',
        bedrooms: property.bedrooms || 1,
        bathrooms: property.bathrooms || 1,
        floorNumber: property.floorNumber,
        totalFloors: property.totalFloors,
        squareFeet: property.squareFeet || 0,
        furnished: property.furnished,
        rentAmount: property.rentAmount || 0,
        rentPeriod: property.rentPeriod || 'MONTHLY',
        securityDeposit: property.securityDeposit,
        advancePayment: property.advancePayment,
        amenities: property.amenities || [],
        gasType: (property as any).gasType || 'NATURAL_GAS',
        tenantPreference: (property as any).tenantPreference || 'ANY'
      })
      setExistingImages(property.images || [])
      setFiles([])
    }
  }, [mode, property, isOpen])

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleAmenityToggle = (amenityId: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter(id => id !== amenityId)
        : [...prev.amenities, amenityId]
    }))
  }

  const handleRemoveExistingImage = (url: string) => {
    setExistingImages(prev => prev.filter(img => img !== url))
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) newErrors.title = 'Title is required'
    if (!formData.area) newErrors.area = 'Area is required'
    if (!formData.subArea) newErrors.subArea = 'Block is required'
    if (!formData.address.trim()) newErrors.address = 'Address is required'
    if (formData.rentAmount <= 0) newErrors.rentAmount = 'Price must be greater than 0'
    if (formData.bedrooms! <= 0) newErrors.bedrooms = 'Bedrooms must be greater than 0'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      let propertyData: any = {
        ...formData,
        title: formData.title,
        description: formData.description,
        type: formData.propertyType,
        propertyType: undefined // Remove this field
      }

      // Transform propertyType to type for API
      delete propertyData.propertyType

      // Upload new images first if any
      let uploadedImageUrls: string[] = []
      if (files.length > 0) {
        console.log('Uploading files:', files.length)
        const uploadResponse = await propertyApi.uploadPropertyImages(files)
        uploadedImageUrls = uploadResponse.urls
        console.log('Uploaded URLs:', uploadedImageUrls)
      }

      // Merge existing images with newly uploaded ones
      const allImages = [...existingImages, ...uploadedImageUrls]
      console.log('All images to save:', allImages)

      // Add images to property data
      propertyData.images = allImages
      propertyData.coverImage = allImages.length > 0 ? allImages[0] : null

      if (mode === 'create') {
        // Create property (backend will set status to PENDING)
        const response = await propertyApi.createProperty(propertyData)

        // Submit property approval request to admin
        try {
          await submitRequest({
            requestType: 'PROPERTY_APPROVAL',
            requestData: {
              propertyId: response.property.id,
              title: propertyData.title,
              address: propertyData.address,
              area: propertyData.area,
              price: propertyData.rentAmount,
              bedrooms: propertyData.bedrooms,
              bathrooms: propertyData.bathrooms,
              propertyType: propertyData.type,
              listingType: propertyData.listingType
            },
            reason: 'New property listing submission for admin review'
          })

          toast.success('Property submitted for admin approval! You will be notified once reviewed.', {
            duration: 5000,
            icon: '📝'
          })
        } catch (requestError) {
          console.error('Failed to create approval request:', requestError)
          // Property was created successfully, just the request failed
          toast.success('Property created! Please contact admin for approval.', {
            duration: 5000
          })
        }
      } else if (mode === 'edit' && property) {
        console.log('Updating property:', property.id, propertyData)
        await propertyApi.updateProperty(property.id, propertyData)
        toast.success('Property updated successfully')
      }

      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Submit error:', error)
      console.error('Error response:', error.response)
      console.error('Error data:', error.response?.data)
      console.error('Error status:', error.response?.status)

      const message = error.response?.data?.error || error.response?.data?.message || 'Failed to save property'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      onClose()
    }
  }

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      title={
        <div className="flex items-center justify-between">
          <span>{mode === 'create' ? 'Add New Property' : 'Edit Property'}</span>
          {propertyId && <span className="ml-2 text-sm font-normal text-gray-500">(ID: {propertyId})</span>}
        </div>
      }
      size="lg"
    >
      <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-4">
        {/* Admin Approval Notice (Create Mode Only) */}
        {mode === 'create' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                ℹ
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-blue-900 mb-1">Admin Approval Required</h4>
                <p className="text-sm text-blue-800">
                  New property listings require admin approval before they become publicly visible.
                  You'll be notified once your property has been reviewed.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Section 1: Basic Information */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <h3 className="font-semibold text-gray-900">Basic Information</h3>
          <Input
            label="Property Title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            error={errors.title}
            placeholder="e.g., 2BHK Apartment in Dhanmondi"
          />
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg text-sm"
            placeholder="Property description..."
            rows={3}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Property Type"
              value={formData.propertyType}
              onChange={(value) => handleInputChange('propertyType', value)}
              options={PROPERTY_TYPES}
            />
            <Select
              label="Listing Type"
              value={formData.listingType}
              onChange={(value) => handleInputChange('listingType', value)}
              options={LISTING_TYPES}
            />
          </div>
        </div>

        {/* Section 2: Location */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <h3 className="font-semibold text-gray-900">Location</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <p className="text-sm text-gray-900 px-3 py-2 bg-gray-100 rounded-lg border border-gray-200">Dhaka</p>
          </div>
          <Select
            label="Area *"
            value={formData.area}
            onChange={(value) => {
              handleInputChange('area', value)
              handleInputChange('subArea' as any, '')
            }}
            options={[{ value: '', label: 'Select Area' }, ...AREAS.map(a => ({ value: a, label: a }))]}
          />
          <Select
            label="Block *"
            value={formData.subArea || ''}
            onChange={(value) => handleInputChange('subArea' as any, value)}
            options={[{ value: '', label: formData.area ? 'Select Block' : 'Select Area first' }, ...(LOCATION_MAP[formData.area] || []).map(b => ({ value: b, label: b }))]}
          />
          <Input
            label="Full Address"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            error={errors.address}
            placeholder="House number, road, street..."
          />
        </div>

        {/* Section 3: Property Details */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <h3 className="font-semibold text-gray-900">Property Details</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Input
              label="Bedrooms"
              type="number"
              value={formData.bedrooms}
              onChange={(e) => handleInputChange('bedrooms', parseInt(e.target.value))}
              error={errors.bedrooms}
            />
            <Input
              label="Bathrooms"
              type="number"
              value={formData.bathrooms}
              onChange={(e) => handleInputChange('bathrooms', parseInt(e.target.value))}
            />
            <Input
              label="Size (sqft)"
              type="number"
              value={formData.squareFeet}
              onChange={(e) => handleInputChange('squareFeet', parseInt(e.target.value))}
            />
            <Input
              label="Floor Number"
              type="number"
              value={formData.floorNumber || ''}
              onChange={(e) => handleInputChange('floorNumber', e.target.value ? parseInt(e.target.value) : undefined)}
            />
            <Input
              label="Total Floors"
              type="number"
              value={formData.totalFloors || ''}
              onChange={(e) => handleInputChange('totalFloors', e.target.value ? parseInt(e.target.value) : undefined)}
            />
          </div>
        </div>

        {/* Section 4: Pricing */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <h3 className="font-semibold text-gray-900">Pricing</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Price (BDT)"
              type="number"
              value={formData.rentAmount}
              onChange={(e) => handleInputChange('rentAmount', parseFloat(e.target.value))}
              error={errors.rentAmount}
            />
            <Select
              label="Period"
              value={formData.rentPeriod}
              onChange={(value) => handleInputChange('rentPeriod', value)}
              options={[
                { value: 'MONTHLY', label: 'Monthly' },
                { value: 'YEARLY', label: 'Yearly' }
              ]}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Security Deposit (Optional)"
              type="number"
              value={formData.securityDeposit || ''}
              onChange={(e) => handleInputChange('securityDeposit', e.target.value ? parseFloat(e.target.value) : undefined)}
            />
            <Input
              label="Advance Payment (Optional)"
              type="number"
              value={formData.advancePayment || ''}
              onChange={(e) => handleInputChange('advancePayment', e.target.value ? parseFloat(e.target.value) : undefined)}
            />
          </div>
        </div>

        {/* Section 5: Features */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <h3 className="font-semibold text-gray-900">Features & Utilities</h3>
          <Select
            label="Furnished Status"
            value={formData.furnished}
            onChange={(value) => handleInputChange('furnished', value)}
            options={FURNISHED_OPTIONS}
          />
          <Select
            label="Gas Connection"
            value={formData.gasType || ''}
            onChange={(value) => handleInputChange('gasType' as any, value)}
            options={[{ value: '', label: 'Not Specified' }, ...GAS_TYPES]}
          />
          <Select
            label="Tenant Preference"
            value={formData.tenantPreference || 'ANY'}
            onChange={(value) => handleInputChange('tenantPreference' as any, value)}
            options={TENANT_PREFERENCES}
          />
        </div>

        {/* Section 6: Amenities */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <h3 className="font-semibold text-gray-900">Amenities</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {amenities.map(amenity => (
              <label key={amenity.id} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.amenities.includes(amenity.id)}
                  onChange={() => handleAmenityToggle(amenity.id)}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm text-gray-700">{amenity.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Section 7: Images */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <h3 className="font-semibold text-gray-900">Images</h3>
          <FileUpload
            files={files}
            onChange={setFiles}
            maxFiles={5}
            maxSizeMB={5}
            existingImages={existingImages}
            onRemoveExisting={handleRemoveExistingImage}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end space-x-3 mt-6 border-t pt-4">
        <Button
          variant="secondary"
          onClick={handleClose}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={loading}
          leftIcon={loading ? <Loader2 className="h-4 w-4 animate-spin" /> : undefined}
        >
          {loading ? 'Saving...' : mode === 'create' ? 'Create Property' : 'Update Property'}
        </Button>
      </div>
    </Modal>
  )
}

export default PropertyFormModal
