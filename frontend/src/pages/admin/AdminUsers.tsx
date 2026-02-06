import React, { useState, useEffect } from 'react'
import { getAdminUsers, updateAdminUser } from '../../api/adminApi'
import StatusBadge from '../../components/admin/StatusBadge'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Modal from '../../components/ui/Modal'
import { Edit2, ChevronLeft, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string
  role: string
  isActive: boolean
  isVerified: boolean
  createdAt: string
  _count: {
    properties: number
  }
}

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(0)
  const [filters, setFilters] = useState({
    role: '',
    isActive: '',
    isVerified: '',
    search: '',
  })
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [updateData, setUpdateData] = useState({
    role: '',
    isActive: false,
    isVerified: false,
  })

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response: any = await getAdminUsers(page, 20, {
        role: filters.role || undefined,
        isActive: filters.isActive ? filters.isActive === 'true' : undefined,
        isVerified: filters.isVerified ? filters.isVerified === 'true' : undefined,
        search: filters.search || undefined,
      })
      // Map API response to component format
      const data = response.users || response.data || []
      const total = response.total || 0
      const totalPages = response.totalPages || response.pages || 0

      // Add _count property for compatibility (set to 0 if not available)
      const usersWithCount = data.map((user: any) => ({
        ...user,
        _count: user._count || { properties: 0 },
      }))

      setUsers(usersWithCount)
      setTotal(total)
      setPages(totalPages)
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setPage(1)
  }, [filters])

  useEffect(() => {
    fetchUsers()
  }, [page, filters])

  const handleOpenModal = (user: User) => {
    setSelectedUser(user)
    setUpdateData({
      role: user.role,
      isActive: user.isActive,
      isVerified: user.isVerified,
    })
    setIsModalOpen(true)
  }

  const handleUpdateUser = async () => {
    if (!selectedUser) return

    if (!window.confirm(`Are you sure you want to update ${selectedUser.firstName} ${selectedUser.lastName}?`)) return

    try {
      await updateAdminUser(selectedUser.id, {
        role: updateData.role,
        isActive: updateData.isActive,
        isVerified: updateData.isVerified,
      })
      toast.success('User updated successfully')
      setIsModalOpen(false)
      fetchUsers()
    } catch (error: any) {
      console.error('Error updating user:', error)
      const errorMessage = error?.response?.data?.error || 'Failed to update user'
      toast.error(errorMessage)
    }
  }

  const roleOptions = [
    { value: '', label: 'All Roles' },
    { value: 'TENANT', label: 'Tenant' },
    { value: 'OWNER', label: 'Owner' },
    { value: 'ADMIN', label: 'Admin' },
  ]

  const activeOptions = [
    { value: '', label: 'All' },
    { value: 'true', label: 'Active' },
    { value: 'false', label: 'Inactive' },
  ]

  const verificationOptions = [
    { value: '', label: 'All' },
    { value: 'true', label: 'Verified' },
    { value: 'false', label: 'Unverified' },
  ]

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-1">Total users: {total}</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input
            type="text"
            placeholder="Search by name, email, phone..."
            value={filters.search}
            onChange={e => setFilters({ ...filters, search: e.target.value })}
          />
          <Select
            options={roleOptions}
            value={filters.role}
            onChange={value => setFilters({ ...filters, role: value })}
            label="Role"
          />
          <Select
            options={activeOptions}
            value={filters.isActive}
            onChange={value => setFilters({ ...filters, isActive: value })}
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

      {/* Users Table - Desktop view */}
      <div className="bg-white rounded-lg shadow overflow-hidden hidden md:block">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Verified</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Properties</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-gray-600">{user.phone}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{user.email}</td>
                <td className="px-6 py-4">
                  <StatusBadge status={user.role} variant="role" />
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={user.isVerified ? 'true' : 'false'} variant="verification" />
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{user._count.properties}</td>
                <td className="px-6 py-4">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleOpenModal(user)}
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

      {/* Users Cards - Mobile view */}
      <div className="md:hidden space-y-4">
        {users.map(user => (
          <div key={user.id} className="bg-white rounded-lg shadow p-4 space-y-3">
            <div>
              <h3 className="font-semibold text-gray-900">
                {user.firstName} {user.lastName}
              </h3>
              <p className="text-sm text-gray-600">{user.email}</p>
              <p className="text-xs text-gray-600">{user.phone}</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <StatusBadge status={user.role} variant="role" />
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  user.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {user.isActive ? 'Active' : 'Inactive'}
              </span>
              <StatusBadge status={user.isVerified ? 'true' : 'false'} variant="verification" />
            </div>
            <div className="text-xs text-gray-600">
              <p>{user._count.properties} properties</p>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleOpenModal(user)}
              className="w-full"
            >
              Edit User
            </Button>
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

      {/* Edit Modal */}
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title="Edit User">
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-900 mb-2">User Information</p>
            <div className="bg-gray-50 p-3 rounded-lg space-y-1">
              <p className="text-sm text-gray-900">
                <span className="font-medium">Name:</span> {selectedUser?.firstName} {selectedUser?.lastName}
              </p>
              <p className="text-sm text-gray-900">
                <span className="font-medium">Email:</span> {selectedUser?.email}
              </p>
              <p className="text-sm text-gray-900">
                <span className="font-medium">Phone:</span> {selectedUser?.phone}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Role</label>
            <Select
              options={roleOptions.filter(opt => opt.value !== '')}
              value={updateData.role}
              onChange={value => setUpdateData({ ...updateData, role: value })}
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={updateData.isActive}
                onChange={e => setUpdateData({ ...updateData, isActive: e.target.checked })}
                className="h-4 w-4 text-blue-600 rounded border-gray-300"
              />
              <span className="ml-2 block text-sm text-gray-700">Active User</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={updateData.isVerified}
                onChange={e => setUpdateData({ ...updateData, isVerified: e.target.checked })}
                className="h-4 w-4 text-blue-600 rounded border-gray-300"
              />
              <span className="ml-2 block text-sm text-gray-700">Verified User</span>
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateUser}>Save Changes</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default AdminUsers
