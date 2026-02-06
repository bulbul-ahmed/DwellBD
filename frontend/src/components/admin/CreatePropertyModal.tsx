import React, { useState, useEffect } from 'react'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Button from '../ui/Button'
import { getAdminUsers, createPropertyByAdmin } from '../../api/adminApi'
import { amenities } from '../../constants/amenities'
import toast from 'react-hot-toast'

interface CreatePropertyModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

interface FormData {
  ownerId: string
  title: string
  description: string
  propertyType: string
  listingType: string
  address: string
  area: string
  city: string
  bedrooms: string
  bathrooms: string
  floorNumber: string
  totalFloors: string
  squareFeet: string
  furnished: string
  rentAmount: string
  rentPeriod: string
  securityDeposit: string
  advancePayment: string
  selectedAmenities: string[]
  availableFrom: string
}

const CreatePropertyModal: React.FC<CreatePropertyModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false)
  const [owners, setOwners] = useState<Array<{ id: string; email: string; firstName: string; lastName: string }>>([])
  const [formData, setFormData] = useState<FormData>({
    ownerId: '',
    title: '',
    description: '',
    propertyType: '',
    listingType: 'RENT',
    address: '',
    area: '',
    city: 'Dhaka',
    bedrooms: '',
    bathrooms: '',
    floorNumber: '',
    totalFloors: '',
    squareFeet: '',
    furnished: '',
    rentAmount: '',
    rentPeriod: 'MONTHLY',
    securityDeposit: '',
    advancePayment: '',
    selectedAmenities: [],
    availableFrom: '',
  })

  // Fetch owners on component mount
  useEffect(() => {
    if (open) {
      fetchOwners()
    }
  }, [open])

  const fetchOwners = async () => {
    try {
      const response: any = await getAdminUsers(1, 100, { role: 'OWNER' })
      const ownersList = response.users || response.data || []
      setOwners(ownersList)
    } catch (error) {
      console.error('Error fetching owners:', error)
      toast.error('Failed to load owners')
    }
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAmenityToggle = (amenityId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedAmenities: prev.selectedAmenities.includes(amenityId)
        ? prev.selectedAmenities.filter((id) => id !== amenityId)
        : [...prev.selectedAmenities, amenityId],
    }))
  }

  const handleSubmit = async () => {
    // Validation
    if (
      !formData.ownerId ||
      !formData.title ||
      !formData.propertyType ||
      !formData.address ||
      !formData.area ||
      !formData.rentAmount
    ) {
      toast.error('Please fill all required fields')
      return
    }

    setLoading(true)
    try {
      const data: any = {
        ownerId: formData.ownerId,
        title: formData.title,
        propertyType: formData.propertyType,
        address: formData.address,
        area: formData.area,
        rentAmount: parseFloat(formData.rentAmount),
        amenities: formData.selectedAmenities,
      }

      // Add optional fields only if provided
      if (formData.description) data.description = formData.description
      if (formData.listingType) data.listingType = formData.listingType
      if (formData.city) data.city = formData.city
      if (formData.bedrooms) data.bedrooms = parseInt(formData.bedrooms)
      if (formData.bathrooms) data.bathrooms = parseInt(formData.bathrooms)
      if (formData.floorNumber) data.floorNumber = parseInt(formData.floorNumber)
      if (formData.totalFloors) data.totalFloors = parseInt(formData.totalFloors)
      if (formData.squareFeet) data.squareFeet = parseInt(formData.squareFeet)
      if (formData.furnished) data.furnished = formData.furnished
      if (formData.rentPeriod) data.rentPeriod = formData.rentPeriod
      if (formData.securityDeposit) data.securityDeposit = parseFloat(formData.securityDeposit)
      if (formData.advancePayment) data.advancePayment = parseFloat(formData.advancePayment)
      if (formData.availableFrom) data.availableFrom = formData.availableFrom

      await createPropertyByAdmin(data)
      toast.success('Property created successfully')
      onSuccess()
      onClose()
      resetForm()
    } catch (error: any) {
      console.error('Error creating property:', error)
      toast.error(error.response?.data?.message || 'Failed to create property')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      ownerId: '',
      title: '',
      description: '',
      propertyType: '',
      listingType: 'RENT',
      address: '',
      area: '',
      city: 'Dhaka',
      bedrooms: '',
      bathrooms: '',
      floorNumber: '',
      totalFloors: '',
      squareFeet: '',
      furnished: '',
      rentAmount: '',
      rentPeriod: 'MONTHLY',
      securityDeposit: '',
      advancePayment: '',
      selectedAmenities: [],
      availableFrom: '',
    })
  }

  const ownerOptions = [
    { value: '', label: 'Select Owner' },
    ...owners.map((owner) => ({
      value: owner.id,
      label: `${owner.firstName} ${owner.lastName} (${owner.email})`,
    })),
  ]

  const propertyTypeOptions = [
    { value: '', label: 'Select Type' },
    { value: 'BACHELOR', label: 'Bachelor' },
    { value: 'FAMILY', label: 'Family' },
    { value: 'HOSTEL', label: 'Hostel' },
    { value: 'SUBLET', label: 'Sublet' },
    { value: 'OFFICE', label: 'Office' },
  ]

  const listingTypeOptions = [
    { value: 'RENT', label: 'For Rent' },
    { value: 'SELL', label: 'For Sale' },
  ]

  const furnishedOptions = [
    { value: '', label: 'Not Specified' },
    { value: 'NONE', label: 'Unfurnished' },
    { value: 'PARTIAL', label: 'Partially Furnished' },
    { value: 'FULL', label: 'Fully Furnished' },
  ]

  const rentPeriodOptions = [
    { value: 'MONTHLY', label: 'Monthly' },
    { value: 'YEARLY', label: 'Yearly' },
  ]

  return (
    <Modal open={open} onClose={onClose} title="Create New Property" size="lg">
      <div className="space-y-6 max-h-[70vh] overflow-y-auto pb-4">
        {/* Section 1: Owner Selection */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Owner Information</h3>
          <Select
            label="Property Owner *"
            options={ownerOptions}
            value={formData.ownerId}
            onChange={(value) => handleInputChange('ownerId', value)}
          />
        </div>

        {/* Section 2: Basic Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input
                label="Property Title *"
                placeholder="e.g., 3BHK Family Apartment in Gulshan"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
              />
            </div>
            <Select
              label="Property Type *"
              options={propertyTypeOptions}
              value={formData.propertyType}
              onChange={(value) => handleInputChange('propertyType', value)}
            />
            <Select
              label="Listing Type"
              options={listingTypeOptions}
              value={formData.listingType}
              onChange={(value) => handleInputChange('listingType', value)}
            />
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows={3}
                placeholder="Describe the property..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Section 3: Location */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Location</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input
                label="Address *"
                placeholder="e.g., House 12, Road 5"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
              />
            </div>
            <Input
              label="Area *"
              placeholder="e.g., Gulshan, Dhanmondi"
              value={formData.area}
              onChange={(e) => handleInputChange('area', e.target.value)}
            />
            <Input
              label="City"
              placeholder="e.g., Dhaka"
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
            />
          </div>
        </div>

        {/* Section 4: Property Details */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Property Details</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Input
              type="number"
              label="Bedrooms"
              placeholder="e.g., 3"
              value={formData.bedrooms}
              onChange={(e) => handleInputChange('bedrooms', e.target.value)}
            />
            <Input
              type="number"
              label="Bathrooms"
              placeholder="e.g., 2"
              value={formData.bathrooms}
              onChange={(e) => handleInputChange('bathrooms', e.target.value)}
            />
            <Input
              type="number"
              label="Square Feet"
              placeholder="e.g., 1200"
              value={formData.squareFeet}
              onChange={(e) => handleInputChange('squareFeet', e.target.value)}
            />
            <Input
              type="number"
              label="Floor Number"
              placeholder="e.g., 5"
              value={formData.floorNumber}
              onChange={(e) => handleInputChange('floorNumber', e.target.value)}
            />
            <Input
              type="number"
              label="Total Floors"
              placeholder="e.g., 10"
              value={formData.totalFloors}
              onChange={(e) => handleInputChange('totalFloors', e.target.value)}
            />
            <Select
              label="Furnished"
              options={furnishedOptions}
              value={formData.furnished}
              onChange={(value) => handleInputChange('furnished', value)}
            />
          </div>
        </div>

        {/* Section 5: Pricing */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Pricing</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="number"
              label="Rent Amount (BDT) *"
              placeholder="e.g., 25000"
              value={formData.rentAmount}
              onChange={(e) => handleInputChange('rentAmount', e.target.value)}
            />
            <Select
              label="Rent Period"
              options={rentPeriodOptions}
              value={formData.rentPeriod}
              onChange={(value) => handleInputChange('rentPeriod', value)}
            />
            <Input
              type="number"
              label="Security Deposit (BDT)"
              placeholder="e.g., 50000"
              value={formData.securityDeposit}
              onChange={(e) => handleInputChange('securityDeposit', e.target.value)}
            />
            <Input
              type="number"
              label="Advance Payment (BDT)"
              placeholder="e.g., 25000"
              value={formData.advancePayment}
              onChange={(e) => handleInputChange('advancePayment', e.target.value)}
            />
          </div>
        </div>

        {/* Section 6: Amenities */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Amenities</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {amenities.map((amenity) => (
              <label key={amenity.id} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.selectedAmenities.includes(amenity.id)}
                  onChange={() => handleAmenityToggle(amenity.id)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">{amenity.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Section 7: Availability */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Availability</h3>
          <Input
            type="date"
            label="Available From"
            value={formData.availableFrom}
            onChange={(e) => handleInputChange('availableFrom', e.target.value)}
          />
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} loading={loading} disabled={loading}>
          {loading ? 'Creating...' : 'Create Property'}
        </Button>
      </div>
    </Modal>
  )
}

export default CreatePropertyModal
