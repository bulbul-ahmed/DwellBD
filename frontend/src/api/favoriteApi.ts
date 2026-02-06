import api from './authApi'

export interface Favorite {
  id: string
  userId: string
  propertyId: string
  createdAt: string
}

// Get user's favorite properties
export const getFavorites = async (): Promise<Favorite[]> => {
  const response = await api.get('/favorites')
  return response.data
}

// Add property to favorites
export const addFavorite = async (propertyId: string): Promise<Favorite> => {
  const response = await api.post('/favorites', { propertyId })
  return response.data
}

// Remove property from favorites
export const removeFavorite = async (propertyId: string): Promise<void> => {
  await api.delete(`/favorites/${propertyId}`)
}

// Check if property is favorited
export const checkIsFavorited = async (propertyId: string): Promise<boolean> => {
  try {
    const favorites = await getFavorites()
    return favorites.some((fav) => fav.propertyId === propertyId)
  } catch (error) {
    return false
  }
}
