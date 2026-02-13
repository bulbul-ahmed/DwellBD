import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

/**
 * Helper function to get authentication headers
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// ============================================================================
// TypeScript Interfaces
// ============================================================================

export type RequestType =
  | 'BUSINESS_INFO_CHANGE'
  | 'SERVICE_AREA_CHANGE'
  | 'PROPERTY_APPROVAL'
  | 'PROPERTY_EDIT_APPROVAL'
  | 'VERIFICATION_REQUEST'
  | 'CONTACT_INFO_CHANGE'

export type RequestStatus =
  | 'PENDING'
  | 'IN_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED'

export interface OwnerRequest {
  id: string
  userId: string
  requestType: RequestType
  status: RequestStatus
  requestData: any
  currentData: any | null
  reason: string
  reviewedBy: string | null
  reviewer: {
    id: string
    firstName: string
    lastName: string
    email: string
  } | null
  reviewNotes: string | null
  rejectionReason: string | null
  createdAt: string
  reviewedAt: string | null
  updatedAt: string
  user?: {
    id: string
    firstName: string
    lastName: string
    email: string
    role: string
    isVerified: boolean
  }
}

export interface SubmitRequestData {
  requestType: RequestType
  requestData: any
  currentData?: any
  reason: string
}

export interface RequestsResponse {
  requests: OwnerRequest[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// ============================================================================
// Owner Request API Functions
// ============================================================================

/**
 * Submit a new owner request
 * POST /api/owner/requests
 */
export const submitRequest = async (data: SubmitRequestData): Promise<{ message: string; request: OwnerRequest }> => {
  const response = await axios.post(`${API_URL}/api/owner/requests`, data, {
    headers: getAuthHeaders(),
  })
  return response.data
}

/**
 * Get all requests for the authenticated owner
 * GET /api/owner/requests?status=PENDING&page=1&limit=10
 */
export const getMyRequests = async (
  status?: RequestStatus,
  page = 1,
  limit = 10
): Promise<RequestsResponse> => {
  const params: any = { page, limit }
  if (status) params.status = status

  const response = await axios.get(`${API_URL}/api/owner/requests`, {
    headers: getAuthHeaders(),
    params,
  })
  return response.data
}

/**
 * Get a specific request by ID
 * GET /api/owner/requests/:id
 */
export const getRequestById = async (requestId: string): Promise<OwnerRequest> => {
  const response = await axios.get(`${API_URL}/api/owner/requests/${requestId}`, {
    headers: getAuthHeaders(),
  })
  return response.data
}

/**
 * Cancel a pending request
 * PATCH /api/owner/requests/:id/cancel
 */
export const cancelRequest = async (requestId: string): Promise<{ message: string; request: OwnerRequest }> => {
  const response = await axios.patch(
    `${API_URL}/api/owner/requests/${requestId}/cancel`,
    {},
    {
      headers: getAuthHeaders(),
    }
  )
  return response.data
}

// ============================================================================
// Admin Request API Functions
// ============================================================================

/**
 * Get all requests (admin view)
 * GET /api/admin/requests?status=PENDING&requestType=BUSINESS_INFO_CHANGE&page=1&limit=10
 */
export const getAllRequests = async (
  filters?: {
    status?: RequestStatus
    requestType?: RequestType
    userId?: string
  },
  page = 1,
  limit = 10
): Promise<RequestsResponse> => {
  const params: any = { page, limit }
  if (filters?.status) params.status = filters.status
  if (filters?.requestType) params.requestType = filters.requestType
  if (filters?.userId) params.userId = filters.userId

  const response = await axios.get(`${API_URL}/api/admin/requests`, {
    headers: getAuthHeaders(),
    params,
  })
  return response.data
}

/**
 * Get a specific request by ID (admin view)
 * GET /api/admin/requests/:id
 */
export const getAdminRequestById = async (requestId: string): Promise<OwnerRequest> => {
  const response = await axios.get(`${API_URL}/api/admin/requests/${requestId}`, {
    headers: getAuthHeaders(),
  })
  return response.data
}

/**
 * Approve a request
 * PATCH /api/admin/requests/:id/approve
 */
export const approveRequest = async (
  requestId: string,
  reviewNotes?: string
): Promise<{ message: string; request: OwnerRequest }> => {
  const response = await axios.patch(
    `${API_URL}/api/admin/requests/${requestId}/approve`,
    { reviewNotes },
    {
      headers: getAuthHeaders(),
    }
  )
  return response.data
}

/**
 * Reject a request
 * PATCH /api/admin/requests/:id/reject
 */
export const rejectRequest = async (
  requestId: string,
  rejectionReason: string,
  reviewNotes?: string
): Promise<{ message: string; request: OwnerRequest }> => {
  const response = await axios.patch(
    `${API_URL}/api/admin/requests/${requestId}/reject`,
    { rejectionReason, reviewNotes },
    {
      headers: getAuthHeaders(),
    }
  )
  return response.data
}

/**
 * Mark request as in review
 * PATCH /api/admin/requests/:id/review
 */
export const markRequestInReview = async (
  requestId: string
): Promise<{ message: string; request: OwnerRequest }> => {
  const response = await axios.patch(
    `${API_URL}/api/admin/requests/${requestId}/review`,
    {},
    {
      headers: getAuthHeaders(),
    }
  )
  return response.data
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get human-readable request type label
 */
export const getRequestTypeLabel = (type: RequestType): string => {
  const labels: Record<RequestType, string> = {
    BUSINESS_INFO_CHANGE: 'Business Information Change',
    SERVICE_AREA_CHANGE: 'Service Area Update',
    PROPERTY_APPROVAL: 'New Property Approval',
    PROPERTY_EDIT_APPROVAL: 'Property Edit Approval',
    VERIFICATION_REQUEST: 'Business Verification',
    CONTACT_INFO_CHANGE: 'Contact Information Change',
  }
  return labels[type] || type
}

/**
 * Get status badge color
 */
export const getStatusColor = (status: RequestStatus): string => {
  const colors: Record<RequestStatus, string> = {
    PENDING: 'yellow',
    IN_REVIEW: 'blue',
    APPROVED: 'green',
    REJECTED: 'red',
    CANCELLED: 'gray',
  }
  return colors[status] || 'gray'
}

/**
 * Get status icon
 */
export const getStatusIcon = (status: RequestStatus): string => {
  const icons: Record<RequestStatus, string> = {
    PENDING: '⏳',
    IN_REVIEW: '👀',
    APPROVED: '✅',
    REJECTED: '❌',
    CANCELLED: '🚫',
  }
  return icons[status] || '❓'
}
