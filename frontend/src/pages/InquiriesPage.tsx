import { useState, useEffect } from 'react'
import { Mail, Calendar, Check, Clock, XCircle, MessageCircle, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import Button from '../components/ui/Button'
import { getUserInquiries, deleteInquiry } from '../api/inquiryApi'

interface Inquiry {
  id: string
  propertyId: string
  name?: string
  phone?: string
  message: string
  status: string
  createdAt: string
  updatedAt: string
}

const InquiriesPage = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'RESPONDED' | 'CLOSED'>('ALL')

  useEffect(() => {
    loadInquiries()
  }, [])

  const loadInquiries = async () => {
    try {
      setIsLoading(true)
      const inquiriesList = await getUserInquiries()
      setInquiries(inquiriesList)
    } catch (error) {
      console.error('Error loading inquiries:', error)
      toast.error('Failed to load inquiries')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteInquiry = async (inquiryId: string) => {
    if (!window.confirm('Are you sure you want to delete this inquiry?')) return

    try {
      await deleteInquiry(inquiryId)
      setInquiries((prev) => prev.filter((inq) => inq.id !== inquiryId))
      toast.success('Inquiry deleted')
    } catch (error) {
      console.error('Error deleting inquiry:', error)
      toast.error('Failed to delete inquiry')
    }
  }

  const getFilteredInquiries = () => {
    if (filterStatus === 'ALL') return inquiries
    return inquiries.filter((inq) => inq.status === filterStatus)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'RESPONDED':
        return <Check className="h-5 w-5 text-green-500" />
      case 'CLOSED':
        return <XCircle className="h-5 w-5 text-gray-500" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200'
      case 'RESPONDED':
        return 'bg-green-50 text-green-800 border-green-200'
      case 'CLOSED':
        return 'bg-gray-50 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-50 text-gray-800 border-gray-200'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-primary-600 mx-auto"></div>
          <p className="text-gray-600">Loading inquiries...</p>
        </div>
      </div>
    )
  }

  const filteredInquiries = getFilteredInquiries()
  const stats = {
    total: inquiries.length,
    pending: inquiries.filter((i) => i.status === 'PENDING').length,
    responded: inquiries.filter((i) => i.status === 'RESPONDED').length,
    closed: inquiries.filter((i) => i.status === 'CLOSED').length,
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Inquiries</h1>
          <p className="mt-2 text-gray-600">Track all your property inquiries and responses</p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Inquiries</div>
          </div>
          <div className="rounded-lg bg-yellow-50 p-4 shadow-sm border border-yellow-200">
            <div className="text-3xl font-bold text-yellow-800">{stats.pending}</div>
            <div className="text-sm text-yellow-700">Pending</div>
          </div>
          <div className="rounded-lg bg-green-50 p-4 shadow-sm border border-green-200">
            <div className="text-3xl font-bold text-green-800">{stats.responded}</div>
            <div className="text-sm text-green-700">Responded</div>
          </div>
          <div className="rounded-lg bg-gray-100 p-4 shadow-sm border border-gray-200">
            <div className="text-3xl font-bold text-gray-800">{stats.closed}</div>
            <div className="text-sm text-gray-700">Closed</div>
          </div>
        </div>

        {/* Filter */}
        {inquiries.length > 0 && (
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Filter:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-primary-600"
              >
                <option value="ALL">All Inquiries</option>
                <option value="PENDING">Pending</option>
                <option value="RESPONDED">Responded</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
          </div>
        )}

        {/* Empty State */}
        {inquiries.length === 0 ? (
          <div className="rounded-lg bg-white p-12 text-center shadow-sm">
            <MessageCircle className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h3 className="mb-2 text-xl font-semibold text-gray-900">No inquiries yet</h3>
            <p className="mb-6 text-gray-600">
              You haven't sent any inquiries. Start exploring properties and contact owners!
            </p>
            <Link to="/properties">
              <Button className="bg-primary-600 hover:bg-primary-700">
                Browse Properties
              </Button>
            </Link>
          </div>
        ) : filteredInquiries.length === 0 ? (
          <div className="rounded-lg bg-white p-8 text-center shadow-sm">
            <p className="text-gray-600">No inquiries with this status</p>
          </div>
        ) : (
          /* Inquiries List */
          <div className="space-y-4">
            {filteredInquiries.map((inquiry) => (
              <div
                key={inquiry.id}
                className="rounded-lg bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left Side - Status & Content */}
                  <div className="flex-1 min-w-0">
                    <div className="mb-3 flex items-center gap-2">
                      {getStatusIcon(inquiry.status)}
                      <span className={`rounded-full px-3 py-1 text-sm font-medium border ${getStatusColor(inquiry.status)}`}>
                        {inquiry.status}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(inquiry.createdAt)}
                      </span>
                    </div>

                    {/* Message */}
                    <div className="mb-3 break-words">
                      <p className="text-sm font-medium text-gray-900">Your Message:</p>
                      <p className="mt-1 text-sm text-gray-600">{inquiry.message}</p>
                    </div>

                    {/* Contact Info */}
                    <div className="text-sm text-gray-600 space-y-1">
                      {inquiry.name && <p>Name: <span className="font-medium text-gray-900">{inquiry.name}</span></p>}
                      {inquiry.phone && (
                        <p className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          <span className="font-medium text-gray-900">{inquiry.phone}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Side - Actions */}
                  <div className="flex flex-col gap-2">
                    <Link to={`/properties/${inquiry.propertyId}`}>
                      <Button size="sm" variant="secondary" className="whitespace-nowrap">
                        View Property
                      </Button>
                    </Link>
                    <button
                      onClick={() => handleDeleteInquiry(inquiry.id)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
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

export default InquiriesPage
