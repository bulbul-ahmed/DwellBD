import React, { useState, useEffect } from 'react'
import { getAdminProperties, updatePropertyStatus } from '../../api/adminApi'
import StatusBadge from '../../components/admin/StatusBadge'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Modal from '../../components/ui/Modal'
import { Edit2, ChevronLeft, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'

interface Property {
  id: string
  title: string
  address: string
  area: string
  status: string
  isVerified: boolean
  rentAmount: any
  owner: {
    id: string
    email: string
    firstName: string
    lastName: string
  }
  _count: {
    inquiries: number
    favorites: number
    reviews: number
    propertyViews: number
  }
  createdAt: string
}

const AdminProperties: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(0)
  const [filters, setFilters] = useState({
    status: '',
    isVerified: '',
    search: '',
  })
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [updateData, setUpdateData] = useState({
    status: '',
  })

  const formatRentAmount = (amount: any): string => {
    if (typeof amount === 'string') {
      return amount
    }
    if (typeof amount === 'number') {
      return amount.toLocaleString('en-BD')
    }
    return '0'
  }

  const fetchProperties = async () => {
    try {
      setLoading(true)
      const response: any = await getAdminProperties(page, 20, {
        status: filters.status || undefined,
        isVerified: filters.isVerified ? filters.isVerified === 'true' : undefined,
        search: filters.search || undefined,
      })
      // Map API response to component format
      const data = response.properties || response.data || []
      const total = response.total || 0
      const totalPages = response.totalPages || response.pages || 0

      setProperties(data)
      setTotal(total)
      setPages(totalPages)
    } catch (error) {
      console.error('Error fetching properties:', error)
      toast.error('Failed to load properties')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setPage(1)
  }, [filters])

  useEffect(() => {
    fetchProperties()
  }, [page, filters])

  const handleOpenModal = (property: Property) => {
    setSelectedProperty(property)
    setUpdateData({
      status: property.status,
    })
    setIsModalOpen(true)
  }

  const handleUpdateProperty = async () => {
    if (!selectedProperty) return

    if (!window.confirm(`Are you sure you want to update "${selectedProperty.title}"?`)) return

    try {
      await updatePropertyStatus(selectedProperty.id, {
        status: updateData.status,
      })
      toast.success('Property updated successfully')
      setIsModalOpen(false)
      fetchProperties()
    } catch (error) {
      console.error('Error updating property:', error)
      toast.error('Failed to update property')
    }
  }

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
    { value: 'RENTED', label: 'Rented' },
    { value: 'SOLD', label: 'Sold' },
  ]

  const verificationOptions = [
    { value: '', label: 'All' },
    { value: 'true', label: 'Verified' },
    { value: 'false', label: 'Unverified' },
  ]

  if (loading && properties.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Properties Management</h1>
        <p className="text-gray-600 mt-1">Total properties: {total}</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input
            type="text"
            placeholder="Search by title or address..."
            value={filters.search}
            onChange={e => setFilters({ ...filters, search: e.target.value })}
          />
          <Select
            options={statusOptions}
            value={filters.status}
            onChange={value => setFilters({ ...filters, status: value })}
            label="Status"
          />
          <Select
            options={verificationOptions}
            value={filters.isVerified}
            onChange={value => setFilters({ ...filters, isVerified: value })}
            label="Verification"
          />
        </div>
      </div>

      {/* Properties Table - Desktop view */}
      <div className="bg-white rounded-lg shadow overflow-hidden hidden md:block">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Owner</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Rent</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {properties.map(property => (
              <tr key={property.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{property.title}</p>
                    <p className="text-sm text-gray-600">{property.address}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {property.owner.firstName} {property.owner.lastName}
                  <p className="text-xs text-gray-600">{property.owner.email}</p>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={property.status} variant="status" />
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {formatRentAmount(property.rentAmount)} Tk
                </td>
                <td className="px-6 py-4">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleOpenModal(property)}
                    className="flex items-center"
                  >
                    <Edit2 className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Properties Cards - Mobile view */}
      <div className="md:hidden space-y-4">
        {properties.map(property => (
          <div key={property.id} className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold text-gray-900">{property.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{property.address}</p>
            <div className="mt-3 flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-xs">
                  <StatusBadge status={property.status} variant="status" />
                </div>
                <div className="text-xs mt-1">
                  <StatusBadge status={property.isVerified ? 'true' : 'false'} variant="verification" />
                </div>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleOpenModal(property)}
              >
                Edit
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-lg shadow p-4">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </button>
          <span className="text-sm text-gray-700">
            Page {page} of {pages}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page === pages}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        </div>
      )}

      {/* Update Modal */}
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title="Update Property">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900">Status</label>
            <Select
              options={[
                { value: 'PENDING', label: 'Pending' },
                { value: 'ACTIVE', label: 'Active' },
                { value: 'INACTIVE', label: 'Inactive' },
                { value: 'RENTED', label: 'Rented' },
                { value: 'SOLD', label: 'Sold' },
              ]}
              value={updateData.status}
              onChange={value => setUpdateData({ ...updateData, status: value })}
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateProperty}>Update</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default AdminProperties
