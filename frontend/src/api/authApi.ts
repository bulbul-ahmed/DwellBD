import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export interface RegisterRequest {
  firstName: string
  lastName: string
  email: string
  phone?: string
  password: string
  role?: 'TENANT' | 'OWNER'
}

export interface LoginRequest {
  email: string
  password: string
}

export interface AuthResponse {
  message: string
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    role: 'TENANT' | 'OWNER' | 'ADMIN'
    isVerified?: boolean
  }
  token: string
  refreshToken: string
}

export interface User {
  id: string
  email: string
  phone?: string
  firstName: string
  lastName: string
  avatar?: string
  role: 'TENANT' | 'OWNER' | 'ADMIN'
  isVerified: boolean
  isActive: boolean
  createdAt: string
}

export async function registerUser(data: RegisterRequest): Promise<AuthResponse> {
  const response = await api.post('/auth/register', data)
  return response.data
}

export async function loginUser(data: LoginRequest): Promise<AuthResponse> {
  const response = await api.post('/auth/login', data)
  return response.data
}

export async function getCurrentUser(): Promise<{ user: User }> {
  const response = await api.get('/auth/me')
  return response.data
}

export async function verifyEmail(): Promise<any> {
  const response = await api.post('/auth/verify-email')
  return response.data
}

export async function refreshToken(): Promise<{ message: string; token: string }> {
  const response = await api.post('/auth/refresh')
  return response.data
}

export async function logoutUser(): Promise<any> {
  const response = await api.post('/auth/logout')
  localStorage.removeItem('token')
  localStorage.removeItem('refreshToken')
  return response.data
}

export default api
