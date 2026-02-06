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

// Token refresh logic
let isRefreshing = false
let failedQueue: Array<{ resolve: (value?: any) => void; reject: (reason?: any) => void }> = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// Response interceptor for automatic token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (!refreshToken) {
          throw new Error('No refresh token')
        }

        const response = await api.post('/auth/refresh', null, {
          headers: { Authorization: `Bearer ${refreshToken}` },
        })

        const newToken = response.data.token
        localStorage.setItem('token', newToken)
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`

        processQueue(null, newToken)
        isRefreshing = false

        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        isRefreshing = false

        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'

        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

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

export async function requestPasswordReset(email: string): Promise<{ message: string }> {
  const response = await api.post('/auth/forgot-password', { email })
  return response.data
}

export async function resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
  const response = await api.post('/auth/reset-password', { token, newPassword })
  return response.data
}

export default api
