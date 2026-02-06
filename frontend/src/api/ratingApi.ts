import api from './authApi'

export interface UserRating {
  id: string
  fromUserId: string
  toUserId: string
  rating: number // 1-5
  review: string | null
  ratingType: 'OWNER' | 'TENANT' // What the rater is (Owner rating Tenant or vice versa)
  bookingId?: string
  createdAt: string
  updatedAt: string
  fromUser?: {
    id: string
    firstName: string
    lastName: string
    avatar?: string
  }
  toUser?: {
    id: string
    firstName: string
    lastName: string
    avatar?: string
  }
}

export interface UserRatingStats {
  userId: string
  averageRating: number // 1-5
  totalRatings: number
  ownerRating?: number // Average rating as owner
  tenantRating?: number // Average rating as tenant
  ownerRatingsCount?: number
  tenantRatingsCount?: number
}

export interface CreateRatingRequest {
  toUserId: string
  rating: number // 1-5
  review?: string
  ratingType: 'OWNER' | 'TENANT'
  bookingId?: string
}

// Get ratings for a user
export const getUserRatings = async (
  userId: string,
  filters?: {
    ratingType?: 'OWNER' | 'TENANT'
    page?: number
    limit?: number
  }
): Promise<{ ratings: UserRating[]; total: number; pages: number }> => {
  try {
    const params = new URLSearchParams()
    if (filters?.ratingType) params.append('ratingType', filters.ratingType)
    if (filters?.page) params.append('page', String(filters.page))
    if (filters?.limit) params.append('limit', String(filters.limit))

    const response = await api.get(`/ratings/user/${userId}`, { params })
    return response.data
  } catch (error) {
    console.error('Error fetching user ratings:', error)
    return { ratings: [], total: 0, pages: 0 }
  }
}

// Get rating stats for a user
export const getUserRatingStats = async (userId: string): Promise<UserRatingStats> => {
  try {
    const response = await api.get(`/ratings/user/${userId}/stats`)
    return response.data
  } catch (error) {
    console.error('Error fetching rating stats:', error)
    return {
      userId,
      averageRating: 0,
      totalRatings: 0,
    }
  }
}

// Create a rating
export const createRating = async (data: CreateRatingRequest): Promise<UserRating> => {
  const response = await api.post('/ratings', data)
  return response.data
}

// Check if user has already rated another user for a specific booking
export const checkExistingRating = async (
  toUserId: string,
  bookingId?: string
): Promise<UserRating | null> => {
  try {
    const params = new URLSearchParams()
    params.append('toUserId', toUserId)
    if (bookingId) params.append('bookingId', bookingId)

    const response = await api.get('/ratings/check-existing', { params })
    return response.data
  } catch (error) {
    console.error('Error checking existing rating:', error)
    return null
  }
}

// Update a rating
export const updateRating = async (
  ratingId: string,
  data: {
    rating: number
    review?: string
  }
): Promise<UserRating> => {
  const response = await api.patch(`/ratings/${ratingId}`, data)
  return response.data
}

// Delete a rating
export const deleteRating = async (ratingId: string): Promise<void> => {
  await api.delete(`/ratings/${ratingId}`)
}
