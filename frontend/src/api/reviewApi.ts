import api from './authApi'

export interface Review {
  id: string
  rating: number
  comment: string
  propertyId: string
  userId: string
  user?: {
    id: string
    firstName: string
    lastName: string
    avatar?: string
  }
  createdAt: string
  updatedAt: string
}

export interface PropertyStats {
  viewCount: number
  favoriteCount: number
  averageRating: number
  reviewCount: number
}

// Get reviews for a property
export const getPropertyReviews = async (propertyId: string): Promise<Review[]> => {
  try {
    const response = await api.get(`/reviews`, {
      params: { propertyId },
    })
    return response.data || []
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return []
  }
}

// Get property stats (views, favorites, average rating)
export const getPropertyStats = async (propertyId: string): Promise<PropertyStats> => {
  try {
    const response = await api.get(`/properties/${propertyId}/stats`)
    return response.data
  } catch (error) {
    console.error('Error fetching property stats:', error)
    // Return defaults if endpoint doesn't exist
    return {
      viewCount: 0,
      favoriteCount: 0,
      averageRating: 0,
      reviewCount: 0,
    }
  }
}

// Create a review for a property
export const createReview = async (
  propertyId: string,
  data: {
    rating: number
    comment: string
  }
): Promise<Review> => {
  const response = await api.post(`/reviews`, {
    propertyId,
    ...data,
  })
  return response.data
}
