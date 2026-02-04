import api from './authApi'

export interface PropertyFilters {
  area?: string
  minPrice?: number
  maxPrice?: number
  propertyType?: string
  bedrooms?: number
  furnished?: string
  listingType?: string
  page?: number
  limit?: number
}

export interface PropertyData {
  title: string
  description?: string
  propertyType: 'BACHELOR' | 'FAMILY' | 'HOSTEL' | 'SUBLET' | 'OFFICE'
  listingType?: 'RENT' | 'SELL'
  address: string
  area: string
  city?: string
  bedrooms?: number
  bathrooms?: number
  floorNumber?: number
  totalFloors?: number
  squareFeet?: number
  furnished?: 'NONE' | 'PARTIAL' | 'FULL'
  rentAmount: number
  rentPeriod?: 'MONTHLY' | 'YEARLY'
  securityDeposit?: number
  advancePayment?: number
  amenities?: string[]
  coverImage?: string
  images?: string[]
  videoUrl?: string
}

export interface Property extends PropertyData {
  id: string
  ownerId: string
  status: 'PENDING' | 'ACTIVE' | 'INACTIVE' | 'RENTED' | 'SOLD'
  isVerified: boolean
  createdAt: string
  updatedAt: string
  owner?: {
    id: string
    firstName: string
    lastName: string
    avatar?: string
    email?: string
    phone?: string
  }
}

export interface PropertyResponse {
  properties: Property[]
  total: number
  pages: number
  currentPage: number
}

export async function searchProperties(filters: PropertyFilters): Promise<PropertyResponse> {
  const params = new URLSearchParams()

  if (filters.area) params.append('area', filters.area)
  if (filters.minPrice) params.append('minPrice', filters.minPrice.toString())
  if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString())
  if (filters.propertyType) params.append('propertyType', filters.propertyType)
  if (filters.bedrooms) params.append('bedrooms', filters.bedrooms.toString())
  if (filters.furnished) params.append('furnished', filters.furnished)
  if (filters.listingType) params.append('listingType', filters.listingType)
  if (filters.page) params.append('page', filters.page.toString())
  if (filters.limit) params.append('limit', filters.limit.toString())

  const response = await api.get(`/properties/search?${params.toString()}`)
  return response.data
}

export async function getProperty(id: string): Promise<{ property: Property }> {
  const response = await api.get(`/properties/${id}`)
  return response.data
}

export async function getMyProperties(page?: number, limit?: number): Promise<PropertyResponse> {
  const params = new URLSearchParams()
  if (page) params.append('page', page.toString())
  if (limit) params.append('limit', limit.toString())

  const response = await api.get(`/properties/user/my-properties?${params.toString()}`)
  return response.data
}

export async function createProperty(
  data: PropertyData
): Promise<{ message: string; property: Property }> {
  const response = await api.post('/properties', data)
  return response.data
}

export async function updateProperty(
  id: string,
  data: Partial<PropertyData>
): Promise<{ message: string; property: Property }> {
  const response = await api.patch(`/properties/${id}`, data)
  return response.data
}

export async function deleteProperty(id: string): Promise<{ message: string }> {
  const response = await api.delete(`/properties/${id}`)
  return response.data
}

export async function uploadPropertyImages(
  files: File[]
): Promise<{ message: string; urls: string[] }> {
  const formData = new FormData()
  files.forEach((file) => {
    formData.append('images', file)
  })

  const response = await api.post('/properties/upload/images', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

export async function getPropertyStats(
  id: string
): Promise<{
  stats: { favorites: number; inquiries: number; reviews: number; propertyViews: number }
}> {
  const response = await api.get(`/properties/${id}/stats`)
  return response.data
}
