import React, { useState, useEffect } from 'react'
import { MessageCircle, Mail, Phone, Loader2, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'
import * as inquiryApi from '../api/inquiryApi'

interface OwnerInquiry {
  id: string
  message: string
  status: 'PENDING' | 'RESPONDED' | 'CLOSED'
  createdAt: string
  user?: {
    firstName: string
    lastName: string
    email: string
    phone?: string
  }
  property: {
    id: string
    title: string
    area: string
    price: number
    coverImage?: string
  }
}

interface PaginationInfo {
  total: number
  page: number
  limit: number
  totalPages: number
}

/**
 * OwnerInquiriesPage
 * View and manage inquiries for owner's properties
 */
const OwnerInquiriesPage: React.FC = () => {
  const [inquiries, setInquiries] = useState<OwnerInquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'RESPONDED' | 'CLOSED'>('ALL')
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  })

  // Load inquiries on mount and when tab changes
  useEffect(() => {
    loadInquiries()
  }, [activeTab])

  const loadInquiries = async () => {
    try {
      setLoading(true)
      const response = await inquiryApi.getOwnerInquiries(
        activeTab === 'ALL' ? undefined : activeTab,
        undefined,
        1,
        10
      )
      setInquiries((response.inquiries || []) as unknown as OwnerInquiry[])
      setPagination(response.pagination)
    } catch (error) {
      console.error('Load inquiries error:', error)
      toast.error('Failed to load inquiries')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (inquiryId: string, newStatus: 'RESPONDED' | 'CLOSED') => {
    try {
      await inquiryApi.updateInquiryStatus(inquiryId, newStatus)
      toast.success(`Inquiry marked as ${newStatus.toLowerCase()}`)
      loadInquiries()
    } catch (error: any) {
      console.error('Status update error:', error)
      toast.error('Failed to update inquiry status')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'RESPONDED': return 'bg-green-100 text-green-800'
      case 'CLOSED': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Calculate stats
  const stats = {
    total: pagination.total,
    pending: inquiries.filter(i => i.status === 'PENDING').length,
    responded: inquiries.filter(i => i.status === 'RESPONDED').length,
    closed: inquiries.filter(i => i.status === 'CLOSED').length
  }

  const tabs = [
    { label: 'All', value: 'ALL' as const },
    { label: 'Pending', value: 'PENDING' as const },
    { label: 'Responded', value: 'RESPONDED' as const },
    { label: 'Closed', value: 'CLOSED' as const }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Property Inquiries</h1>
          <p className="text-gray-600 mt-1">Manage inquiries from potential tenants</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm font-medium">Total Inquiries</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm font-medium">Pending</p>
            <p className="text-2xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm font-medium">Responded</p>
            <p className="text-2xl font-bold text-green-600 mt-2">{stats.responded}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm font-medium">Closed</p>
            <p className="text-2xl font-bold text-gray-600 mt-2">{stats.closed}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          {tabs.map(tab => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === tab.value
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
          </div>
        )}

        {/* Empty State */}
        {!loading && inquiries.length === 0 && (
          <div className="text-center py-12">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No inquiries yet</h3>
            <p className="text-gray-600">
              {activeTab === 'ALL'
                ? 'When tenants contact you about your properties, they will appear here'
                : `No ${activeTab.toLowerCase()} inquiries at this time`}
            </p>
          </div>
        )}

        {/* Inquiries List */}
        {!loading && inquiries.length > 0 && (
          <div className="space-y-4">
            {inquiries.map(inquiry => (
              <div key={inquiry.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Property Info */}
                  <div className="md:col-span-1">
                    {inquiry.property.coverImage && (
                      <img
                        src={inquiry.property.coverImage}
                        alt={inquiry.property.title}
                        className="w-full h-24 object-cover rounded-lg mb-2"
                      />
                    )}
                    <h4 className="font-semibold text-gray-900 text-sm line-clamp-2">
                      {inquiry.property.title}
                    </h4>
                    <p className="text-gray-600 text-xs mt-1">{inquiry.property.area}</p>
                  </div>

                  {/* Inquiry Details */}
                  <div className="md:col-span-2 space-y-3">
                    {/* Tenant Info */}
                    {inquiry.user && (
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold">
                            {inquiry.user.firstName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {inquiry.user.firstName} {inquiry.user.lastName}
                          </p>
                          <p className="text-gray-600 text-sm">{inquiry.user.email}</p>
                        </div>
                      </div>
                    )}

                    {/* Message */}
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-gray-700 text-sm line-clamp-2">{inquiry.message}</p>
                    </div>

                    {/* Date and Status */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-600 text-sm">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(inquiry.createdAt)}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(inquiry.status)}`}>
                        {inquiry.status}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="md:col-span-1 flex flex-col gap-2">
                    {inquiry.user && (
                      <>
                        <a
                          href={`mailto:${inquiry.user.email}`}
                          className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          <Mail className="h-4 w-4" />
                          Email
                        </a>
                        {inquiry.user.phone && (
                          <a
                            href={`tel:${inquiry.user.phone}`}
                            className="flex items-center justify-center gap-2 px-3 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
                          >
                            <Phone className="h-4 w-4" />
                            Call
                          </a>
                        )}
                      </>
                    )}

                    {inquiry.status !== 'CLOSED' && (
                      <button
                        onClick={() => handleStatusChange(
                          inquiry.id,
                          inquiry.status === 'PENDING' ? 'RESPONDED' : 'CLOSED'
                        )}
                        className="flex items-center justify-center px-3 py-2 bg-gray-200 text-gray-900 text-sm rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        {inquiry.status === 'PENDING' ? 'Mark Responded' : 'Close'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default OwnerInquiriesPage
