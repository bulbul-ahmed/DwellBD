import api from './authApi'

// TypeScript Interfaces
export interface VisitRequest {
  id: string
  propertyId: string
  tenantId: string
  ownerId: string
  requestedDate: string
  requestedTime: string
  confirmedDate?: string
  confirmedTime?: string
  suggestedDate?: string
  suggestedTime?: string
  tenantNote?: string
  ownerNote?: string
  rejectionReason?: string
  status: 'PENDING' | 'CONFIRMED' | 'PENDING_ALTERNATIVE' | 'REJECTED' | 'CANCELLED' | 'COMPLETED'
  createdAt: string
  updatedAt: string
  completedAt?: string
  property?: {
    id: string
    title: string
    area: string
    images: string[]
    coverImage?: string
  }
  tenant?: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone?: string
  }
  owner?: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone?: string
  }
}

export interface CreateVisitRequestData {
  propertyId: string
  requestedDate: string
  requestedTime: string
  tenantNote?: string
}

export interface ConfirmVisitData {
  confirmedDate: string
  confirmedTime: string
  ownerNote?: string
}

export interface SuggestAlternativeData {
  suggestedDate: string
  suggestedTime: string
}

export interface RejectVisitData {
  rejectionReason?: string
}

// API Functions

/**
 * Creates a new visit request for a property
 * @param data - Visit request data (propertyId, requestedDate, requestedTime, optional tenantNote)
 * @returns Promise containing the created VisitRequest object
 * @throws Error if property doesn't exist, user already has pending request, or dates/times are invalid
 * @example
 * const visit = await createVisitRequest({
 *   propertyId: "prop123",
 *   requestedDate: "2026-02-15",
 *   requestedTime: "14:00",
 *   tenantNote: "Looking forward to viewing this property"
 * })
 */
export const createVisitRequest = async (data: CreateVisitRequestData): Promise<VisitRequest> => {
  try {
    const response = await api.post('/visits', data)
    return response.data.visitRequest
  } catch (error: any) {
    console.error('Error creating visit request:', error)
    throw error
  }
}

/**
 * Get all visit requests for the current tenant
 * @param status - Optional status filter
 * @returns Array of visit requests
 */
export const getTenantVisitRequests = async (status?: string): Promise<VisitRequest[]> => {
  try {
    const params = status ? { status } : {}
    const response = await api.get('/visits/tenant', { params })
    return response.data || []
  } catch (error: any) {
    console.error('Error fetching tenant visits:', error)
    return []
  }
}

/**
 * Get all visit requests for the current owner's properties
 * @param status - Optional status filter
 * @returns Array of visit requests
 */
export const getOwnerVisitRequests = async (status?: string): Promise<VisitRequest[]> => {
  try {
    const params = status ? { status } : {}
    const response = await api.get('/visits/owner', { params })
    return response.data || []
  } catch (error: any) {
    console.error('Error fetching owner visits:', error)
    return []
  }
}

/**
 * Get a specific visit request by ID
 * @param visitId - Visit request ID
 * @returns Visit request details
 */
export const getVisitRequest = async (visitId: string): Promise<VisitRequest> => {
  try {
    const response = await api.get(`/visits/${visitId}`)
    return response.data
  } catch (error: any) {
    console.error('Error fetching visit request:', error)
    throw error
  }
}

/**
 * Confirm a visit request (owner action)
 * @param visitId - Visit request ID
 * @param data - Confirmation data (date, time, note)
 * @returns Updated visit request
 */
export const confirmVisitRequest = async (
  visitId: string,
  data: ConfirmVisitData
): Promise<VisitRequest> => {
  try {
    const response = await api.patch(`/visits/${visitId}/confirm`, data)
    return response.data.visitRequest
  } catch (error: any) {
    console.error('Error confirming visit:', error)
    throw error
  }
}

/**
 * Reject a visit request (owner action)
 * @param visitId - Visit request ID
 * @param rejectionReason - Optional reason for rejection
 * @returns Updated visit request
 */
export const rejectVisitRequest = async (
  visitId: string,
  rejectionReason?: string
): Promise<VisitRequest> => {
  try {
    const response = await api.patch(`/visits/${visitId}/reject`, {
      rejectionReason: rejectionReason || null
    })
    return response.data.visitRequest
  } catch (error: any) {
    console.error('Error rejecting visit:', error)
    throw error
  }
}

/**
 * Suggest an alternative date (owner action)
 * @param visitId - Visit request ID
 * @param data - Alternative date and time
 * @returns Updated visit request
 */
export const suggestAlternativeDate = async (
  visitId: string,
  data: SuggestAlternativeData
): Promise<VisitRequest> => {
  try {
    const response = await api.patch(`/visits/${visitId}/suggest-alternative`, data)
    return response.data.visitRequest
  } catch (error: any) {
    console.error('Error suggesting alternative date:', error)
    throw error
  }
}

/**
 * Cancel a visit request (tenant action)
 * @param visitId - Visit request ID
 */
export const cancelVisitRequest = async (visitId: string): Promise<void> => {
  try {
    await api.delete(`/visits/${visitId}`)
  } catch (error: any) {
    console.error('Error cancelling visit request:', error)
    throw error
  }
}

/**
 * Mark a visit as completed (owner action)
 * @param visitId - Visit request ID
 * @returns Updated visit request
 */
export const markVisitCompleted = async (visitId: string): Promise<VisitRequest> => {
  try {
    const response = await api.patch(`/visits/${visitId}/complete`)
    return response.data.visitRequest
  } catch (error: any) {
    console.error('Error marking visit as completed:', error)
    throw error
  }
}

/**
 * Checks if a time slot is available for a property (not already booked)
 * Used to prevent double-booking when confirming visits
 * @param propertyId - The ID of the property to check
 * @param date - Date in YYYY-MM-DD format (e.g., "2026-02-15")
 * @param time - Time in HH:mm format (e.g., "14:00")
 * @returns Promise<boolean> - true if slot is available, false if already booked
 * @example
 * const isAvailable = await checkTimeSlotAvailability("prop123", "2026-02-15", "14:00")
 * if (!isAvailable) {
 *   toast.error("This time slot is already booked")
 * }
 */
export const checkTimeSlotAvailability = async (
  propertyId: string,
  date: string,
  time: string
): Promise<boolean> => {
  try {
    const response = await api.get(`/visits/property/${propertyId}/availability`, {
      params: { date, time }
    })
    return response.data.available ?? true
  } catch (error: any) {
    console.error('Error checking time slot availability:', error)
    return true // Default to available if check fails
  }
}

/**
 * Get time slots for a property on a specific date
 * @returns Array of available time slots
 */
export const getTimeSlots = (): string[] => {
  const slots: string[] = []
  for (let hour = 9; hour < 18; hour++) {
    const hourStr = hour.toString().padStart(2, '0')
    slots.push(`${hourStr}:00`)
    slots.push(`${hourStr}:30`)
  }
  return slots
}

/**
 * Format a visit request status as a readable string
 * @param status - Visit status
 * @returns Formatted status string
 */
export const formatVisitStatus = (status: string): string => {
  const statusMap: { [key: string]: string } = {
    PENDING: 'Awaiting Confirmation',
    CONFIRMED: 'Confirmed',
    PENDING_ALTERNATIVE: 'Alternative Date Suggested',
    REJECTED: 'Rejected',
    CANCELLED: 'Cancelled',
    COMPLETED: 'Completed'
  }
  return statusMap[status] || status
}

/**
 * Get status color for UI rendering
 * @param status - Visit status
 * @returns Tailwind CSS color classes
 */
export const getStatusColor = (
  status: string
): string => {
  const colorMap: { [key: string]: string } = {
    PENDING: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    CONFIRMED: 'bg-blue-50 text-blue-800 border-blue-200',
    PENDING_ALTERNATIVE: 'bg-orange-50 text-orange-800 border-orange-200',
    REJECTED: 'bg-red-50 text-red-800 border-red-200',
    CANCELLED: 'bg-gray-50 text-gray-800 border-gray-200',
    COMPLETED: 'bg-green-50 text-green-800 border-green-200'
  }
  return colorMap[status] || 'bg-gray-50 text-gray-800 border-gray-200'
}

/**
 * Format date for display
 * @param dateString - ISO date string
 * @returns Formatted date (e.g., "Feb 15, 2026")
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

/**
 * Format time for display
 * @param timeString - Time in HH:mm format
 * @returns Formatted time (e.g., "2:00 PM")
 */
export const formatTime = (timeString: string): string => {
  if (!timeString) return ''
  const [hours, minutes] = timeString.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
}

/**
 * Format date and time together
 * @param dateString - ISO date string
 * @param timeString - Time in HH:mm format
 * @returns Formatted date and time
 */
export const formatDateTime = (dateString: string, timeString: string): string => {
  return `${formatDate(dateString)} at ${formatTime(timeString)}`
}
