import api from './authApi'

export interface UserProfile {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  avatar?: string
  role: 'TENANT' | 'OWNER' | 'ADMIN'
  isVerified: boolean
  createdAt: string
  updatedAt: string
}

export interface UpdateProfileData {
  firstName?: string
  lastName?: string
  phone?: string
  avatar?: string
}

export interface ChangePasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

// Get current user profile
export const getProfile = async (): Promise<UserProfile> => {
  const response = await api.get('/auth/me')
  return response.data
}

// Update user profile
export const updateProfile = async (data: UpdateProfileData): Promise<UserProfile> => {
  const response = await api.put('/auth/me', data)
  return response.data
}

// Change password
export const changePassword = async (data: ChangePasswordData): Promise<{ message: string }> => {
  const response = await api.post('/auth/change-password', data)
  return response.data
}

// Logout
export const logout = (): void => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}
