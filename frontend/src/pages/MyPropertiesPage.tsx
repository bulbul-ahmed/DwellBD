import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Eye, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import PropertyFormModal from '../components/PropertyFormModal'
import Button from '../components/ui/Button'
import Select from '../components/ui/Select'
import * as propertyApi from '../api/propertyApi'
import { Property } from '../api/propertyApi'

/**
 * MyPropertiesPage
 * Owner's property management dashboard
 */
const MyPropertiesPage: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editProperty, setEditProperty] = useState<Property | undefined>()
  const [deleting, setDeleting] = useState<string | null>(null)

  // Load properties on mount
  useEffect(() => {
    loadProperties()
  }, [])

  const loadProperties = async () => {
    try {
      setLoading(true)
      const response = await propertyApi.getMyProperties()
      setProperties(response.properties || [])
    } catch (error) {
      console.error('Load properties error:', error)
      toast.error('Failed to load properties')
    } finally {
      setLoading(false)
    }
  }

  const handleAddProperty = () => {
    setEditProperty(undefined)
    setModalOpen(true)
  }

  const handleEditProperty = (property: Property) => {
    setEditProperty(property)
    setModalOpen(true)
  }

  const handleDeleteProperty = async (id: string) => {
    if (!confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      return
    }

    try {
      setDeleting(id)
      await propertyApi.deleteProperty(id)
      setProperties(prev => prev.filter(p => p.id !== id))
      toast.success('Property deleted successfully')
    } catch (error: any) {
      console.error('Delete error:', error)
      toast.error(error.response?.data?.error || 'Failed to delete property')
    } finally {
      setDeleting(null)
    }
  }

  const getFilteredProperties = () => {
    return properties.filter(p => {
      if (statusFilter && p.status !== statusFilter) return false
      if (typeFilter && p.propertyType !== typeFilter) return false
      return true
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'ACTIVE': return 'bg-green-100 text-green-800'
      case 'INACTIVE': return 'bg-gray-100 text-gray-800'
      case 'RENTED': return 'bg-blue-100 text-blue-800'
      case 'SOLD': return 'bg-purple-100 text-purple-800'
      case 'UNDER_DISCUSSION': return 'bg-orange-100 text-orange-800'
      case 'BOOKED': return 'bg-cyan-100 text-cyan-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    return status.replace(/_/g, ' ').charAt(0).toUpperCase() + status.replace(/_/g, ' ').slice(1).toLowerCase()
  }

  const filteredProperties = getFilteredProperties()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Properties</h1>
              <p className="text-gray-600 mt-1">Manage your property listings</p>
            </div>
            <Button onClick={handleAddProperty} leftIcon={<Plus className="h-4 w-4" />}>
              Add Property
            </Button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Filter by Status"
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'PENDING', label: 'Pending' },
                { value: 'ACTIVE', label: 'Active' },
                { value: 'INACTIVE', label: 'Inactive' },
                { value: 'RENTED', label: 'Rented' },
                { value: 'SOLD', label: 'Sold' }
              ]}
            />
            <Select
              label="Filter by Type"
              value={typeFilter}
              onChange={setTypeFilter}
              options={[
                { value: '', label: 'All Types' },
                { value: 'BACHELOR', label: 'Bachelor' },
                { value: 'FAMILY', label: 'Family' },
                { value: 'HOSTEL', label: 'Hostel' },
                { value: 'SUBLET', label: 'Sublet' },
                { value: 'OFFICE', label: 'Office' }
              ]}
            />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredProperties.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-5xl mb-4">🏠</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
            <p className="text-gray-600 mb-6">
              {properties.length === 0
                ? 'Start listing your properties to get started!'
                : 'No properties match your filters'}
            </p>
            {properties.length === 0 && (
              <Button onClick={handleAddProperty}>Add Your First Property</Button>
            )}
          </div>
        )}

        {/* Properties Grid */}
        {!loading && filteredProperties.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map(property => (
              <div key={property.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden">
                {/* Image */}
                <div className="relative h-48 bg-gray-200">
                  {property.coverImage ? (
                    <img
                      src={property.coverImage}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      📷 No image
                    </div>
                  )}
                  {/* Status Badge */}
                  <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(property.status)}`}>
                    {getStatusLabel(property.status)}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  {/* Title */}
                  <h3 className="font-bold text-gray-900 line-clamp-2">{property.title}</h3>

                  {/* Details */}
                  <div className="space-y-2 text-sm text-gray-600">
                    <p className="flex items-center">
                      <span className="w-20">Location:</span>
                      <span className="font-medium text-gray-900">{property.area}</span>
                    </p>
                    <p className="flex items-center">
                      <span className="w-20">Price:</span>
                      <span className="font-medium text-gray-900">
                        ৳{property.rentAmount.toLocaleString()}
                        {property.rentPeriod === 'MONTHLY' ? '/mo' : '/yr'}
                      </span>
                    </p>
                    {property.bedrooms && (
                      <p className="flex items-center">
                        <span className="w-20">Beds:</span>
                        <span className="font-medium text-gray-900">{property.bedrooms}</span>
                      </p>
                    )}
                    {property.bathrooms && (
                      <p className="flex items-center">
                        <span className="w-20">Baths:</span>
                        <span className="font-medium text-gray-900">{property.bathrooms}</span>
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-3 border-t">
                    <Link
                      to={`/properties/${property.id}`}
                      className="flex-1"
                    >
                      <Button variant="outline" size="sm" className="w-full" leftIcon={<Eye className="h-4 w-4" />}>
                        View
                      </Button>
                    </Link>
                    <button
                      onClick={() => handleEditProperty(property)}
                      className="flex-1 px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <Edit2 className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteProperty(property.id)}
                      disabled={deleting === property.id}
                      className="flex-1 px-3 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {deleting === property.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      {deleting === property.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Property Form Modal */}
      <PropertyFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={editProperty ? 'edit' : 'create'}
        property={editProperty}
        propertyId={editProperty?.id}
        onSuccess={() => {
          loadProperties()
        }}
      />
    </div>
  )
}

export default MyPropertiesPage
