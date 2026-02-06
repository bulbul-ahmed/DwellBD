import api from './authApi'

export interface InquiryData {
  propertyId: string
  name?: string
  phone?: string
  message: string
}

export interface Inquiry {
  id: string
  propertyId: string
  userId?: string
  name?: string
  phone?: string
  message: string
  status: string
  createdAt: string
  updatedAt: string
}

// Create a new inquiry
export const createInquiry = async (data: InquiryData): Promise<Inquiry> => {
  const response = await api.post('/inquiries', data)
  return response.data
}

// Get user's inquiries
export const getUserInquiries = async (): Promise<Inquiry[]> => {
  const response = await api.get('/inquiries')
  return response.data
}

// Get specific inquiry
export const getInquiry = async (id: string): Promise<Inquiry> => {
  const response = await api.get(`/inquiries/${id}`)
  return response.data
}

// Update inquiry status
export const updateInquiryStatus = async (
  id: string,
  status: string
): Promise<Inquiry> => {
  const response = await api.patch(`/inquiries/${id}`, { status })
  return response.data
}

// Delete inquiry
export const deleteInquiry = async (id: string): Promise<void> => {
  await api.delete(`/inquiries/${id}`)
}
