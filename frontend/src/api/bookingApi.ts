import api from './authApi'

export interface Booking {
  id: string
  userId: string
  propertyId: string
  startDate: string
  endDate: string
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
  totalPrice: number
  createdAt: string
  updatedAt: string
  property?: {
    id: string
    title: string
    area: string
    images: string[]
    ownerId?: string
  }
}

export interface CreateBookingData {
  propertyId: string
  startDate: string
  endDate: string
}

export interface UpdateBookingData {
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
}

// Get user's bookings
export const getUserBookings = async (): Promise<Booking[]> => {
  const response = await api.get('/bookings')
  return response.data
}

// Get specific booking
export const getBooking = async (id: string): Promise<Booking> => {
  const response = await api.get(`/bookings/${id}`)
  return response.data
}

// Create booking
export const createBooking = async (data: CreateBookingData): Promise<Booking> => {
  const response = await api.post('/bookings', data)
  return response.data
}

// Update booking
export const updateBooking = async (id: string, data: UpdateBookingData): Promise<Booking> => {
  const response = await api.patch(`/bookings/${id}`, data)
  return response.data
}

// Cancel booking
export const cancelBooking = async (id: string): Promise<Booking> => {
  return updateBooking(id, { status: 'CANCELLED' })
}

// Delete booking
export const deleteBooking = async (id: string): Promise<void> => {
  await api.delete(`/bookings/${id}`)
}
