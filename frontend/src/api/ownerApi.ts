import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

/**
 * Helper function to get authentication headers
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export interface OwnerStats {
  totalProperties: number
  activeListings: number
  totalInquiries: number
  pendingVisits: number
  averageRating: number
  totalReviews: number
  responseRate: number
}

/**
 * Fetches owner statistics by aggregating data from multiple endpoints
 * Uses existing endpoints (Option B) for MVP implementation
 */
export const getOwnerStats = async (): Promise<OwnerStats> => {
  try {
    const headers = getAuthHeaders()

    // Fetch data from multiple endpoints in parallel
    const [propertiesRes, inquiriesRes, visitsRes, ratingsRes] = await Promise.all([
      // Get properties count
      axios.get(`${API_URL}/api/properties/user/my-properties?page=1&limit=1`, { headers }),
      // Get inquiries
      axios.get(`${API_URL}/api/inquiries/owner?page=1&limit=1`, { headers }),
      // Get visit requests
      axios.get(`${API_URL}/api/visits/owner`, { headers }),
      // Get user ratings - we'll need to extract userId from token or profile
      getUserRatingStats(headers),
    ])

    // Extract counts from responses
    const totalProperties = propertiesRes.data.totalCount || propertiesRes.data.total || 0
    const activeListings = propertiesRes.data.properties?.filter(
      (p: any) => p.status === 'ACTIVE'
    ).length || 0
    const totalInquiries = inquiriesRes.data.totalCount || inquiriesRes.data.total || 0
    const pendingVisits = visitsRes.data.filter(
      (v: any) => v.status === 'PENDING'
    ).length || 0

    // Extract rating stats
    const averageRating = ratingsRes?.averageRating || 0
    const totalReviews = ratingsRes?.totalRatings || 0

    // Calculate response rate (responded inquiries / total inquiries * 100)
    const respondedInquiries = inquiriesRes.data.inquiries?.filter(
      (i: any) => i.status === 'RESPONDED' || i.status === 'CLOSED'
    ).length || 0
    const responseRate = totalInquiries > 0
      ? Math.round((respondedInquiries / totalInquiries) * 100)
      : 0

    return {
      totalProperties,
      activeListings,
      totalInquiries,
      pendingVisits,
      averageRating,
      totalReviews,
      responseRate,
    }
  } catch (error) {
    console.error('Error fetching owner stats:', error)
    // Return zeros if there's an error
    return {
      totalProperties: 0,
      activeListings: 0,
      totalInquiries: 0,
      pendingVisits: 0,
      averageRating: 0,
      totalReviews: 0,
      responseRate: 0,
    }
  }
}

/**
 * Helper function to get user rating stats
 * Requires fetching the current user ID first
 */
async function getUserRatingStats(headers: any) {
  try {
    // Get current user profile to extract userId
    const profileRes = await axios.get(`${API_URL}/api/auth/me`, { headers })
    const userId = profileRes.data.id

    // Get rating stats for this user
    const ratingsRes = await axios.get(`${API_URL}/api/ratings/user/${userId}/stats`, { headers })
    return ratingsRes.data
  } catch (error) {
    console.error('Error fetching rating stats:', error)
    return null
  }
}

export interface Activity {
  id: string
  type: 'INQUIRY' | 'VISIT' | 'PROPERTY_UPDATE'
  propertyId: string
  propertyTitle: string
  propertyArea: string
  tenantName?: string
  status: string
  createdAt: string
  message?: string
}

/**
 * Fetches recent activity for the owner (inquiries and visit requests)
 */
export const getRecentActivity = async (limit = 5): Promise<Activity[]> => {
  try {
    const headers = getAuthHeaders()

    // Fetch recent inquiries and visits
    const [inquiriesRes, visitsRes] = await Promise.all([
      axios.get(`${API_URL}/api/inquiries/owner?page=1&limit=3&sort=createdAt:desc`, { headers }),
      axios.get(`${API_URL}/api/visits/owner?limit=2&sort=createdAt:desc`, { headers }),
    ])

    const activities: Activity[] = []

    // Map inquiries to activities
    const inquiries = inquiriesRes.data.inquiries || []
    inquiries.forEach((inquiry: any) => {
      activities.push({
        id: inquiry.id,
        type: 'INQUIRY',
        propertyId: inquiry.propertyId || inquiry.property?.id,
        propertyTitle: inquiry.property?.title || 'Property',
        propertyArea: inquiry.property?.area || '',
        tenantName: inquiry.name || inquiry.user?.firstName,
        status: inquiry.status,
        createdAt: inquiry.createdAt,
        message: inquiry.message,
      })
    })

    // Map visit requests to activities
    const visits = visitsRes.data.slice(0, 2) || []
    visits.forEach((visit: any) => {
      activities.push({
        id: visit.id,
        type: 'VISIT',
        propertyId: visit.propertyId || visit.property?.id,
        propertyTitle: visit.property?.title || 'Property',
        propertyArea: visit.property?.area || '',
        tenantName: visit.tenant?.firstName
          ? `${visit.tenant.firstName} ${visit.tenant.lastName || ''}`.trim()
          : 'Tenant',
        status: visit.status,
        createdAt: visit.createdAt,
        message: visit.tenantNote,
      })
    })

    // Sort by createdAt descending and limit
    activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    return activities.slice(0, limit)
  } catch (error) {
    console.error('Error fetching recent activity:', error)
    return []
  }
}
