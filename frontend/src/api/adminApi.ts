import api from './authApi'

export async function getDashboardStats() {
  const response = await api.get('/admin/dashboard')
  return response.data
}

export async function getAdminProperties(
  page: number = 1,
  limit: number = 20,
  filters: { status?: string; isVerified?: boolean; search?: string } = {}
) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  })

  if (filters.status) params.append('status', filters.status)
  if (filters.isVerified !== undefined) params.append('isVerified', String(filters.isVerified))
  if (filters.search) params.append('search', filters.search)

  const response = await api.get(`/admin/properties?${params}`)
  return response.data
}

export async function updatePropertyStatus(
  id: string,
  data: {
    status?: string
    isVerified?: boolean
    reason?: string
  }
) {
  const response = await api.patch(`/admin/properties/${id}`, data)
  return response.data
}

export async function getAdminUsers(
  page: number = 1,
  limit: number = 20,
  filters: { role?: string; isActive?: boolean; isVerified?: boolean; search?: string } = {}
) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  })

  if (filters.role) params.append('role', filters.role)
  if (filters.isActive !== undefined) params.append('isActive', String(filters.isActive))
  if (filters.isVerified !== undefined) params.append('isVerified', String(filters.isVerified))
  if (filters.search) params.append('search', filters.search)

  const response = await api.get(`/admin/users?${params}`)
  return response.data
}

export async function updateAdminUser(
  id: string,
  data: {
    isActive?: boolean
    isVerified?: boolean
    role?: string
  }
) {
  const response = await api.patch(`/admin/users/${id}`, data)
  return response.data
}

export async function getAnalytics(dateRange?: { start: string; end: string }) {
  const params = new URLSearchParams()
  if (dateRange?.start) params.append('start', dateRange.start)
  if (dateRange?.end) params.append('end', dateRange.end)

  const response = await api.get(`/admin/analytics?${params}`)
  return response.data
}
