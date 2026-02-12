import axios from 'axios'
import { jwtDecode } from 'jwt-decode'
import { useAuthStore } from '../stores/authStore'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

// Main API instance with interceptors
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Separate API instance for refresh calls (NO INTERCEPTORS to prevent infinite loop)
const apiNoIntercept = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Token refresh state
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

// Helper to check if token is expired or expiring soon
const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<{ exp: number }>(token)
    const now = Date.now() / 1000
    // Consider token expired if it expires in less than 5 minutes (300 seconds)
    // This reduces aggressive proactive refreshing during normal navigation
    return decoded.exp < now + 300
  } catch {
    return true
  }
}

// Helper to refresh tokens
const refreshTokens = async (): Promise<{ token: string; refreshToken: string }> => {
  const refreshToken = localStorage.getItem('refreshToken')
  if (!refreshToken) {
    throw new Error('No refresh token available')
  }

  // Use apiNoIntercept to prevent infinite loop
  const response = await apiNoIntercept.post('/auth/refresh', { refreshToken })

  const { token: newToken, refreshToken: newRefreshToken } = response.data

  // Update stored tokens
  localStorage.setItem('token', newToken)
  localStorage.setItem('refreshToken', newRefreshToken)

  return { token: newToken, refreshToken: newRefreshToken }
}

// Request interceptor: Add token + proactive refresh
api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('token')

    if (token) {
      // Check if token is expired or expiring soon
      if (isTokenExpired(token)) {
        try {
          // Proactively refresh before making the request
          const { token: newToken } = await refreshTokens()
          config.headers.Authorization = `Bearer ${newToken}`
        } catch (error) {
          // If refresh fails, sync state by calling authStore.logout()
          // This ensures both localStorage AND Zustand state are cleared
          try {
            await useAuthStore.getState().logout()
          } catch (logoutError) {
            // Even if logout API fails, state is cleared
            console.error('Logout during token refresh failed:', logoutError)
          }
          return Promise.reject(new Error('Session expired. Please login again.'))
        }
      } else {
        config.headers.Authorization = `Bearer ${token}`
      }
    }

    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor: Handle 401 errors with token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If 401 and haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      // If already refreshing, queue this request
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
        const { token: newToken } = await refreshTokens()

        // Update request with new token
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`

        // Process queued requests
        processQueue(null, newToken)
        isRefreshing = false

        // Retry original request
        return api(originalRequest)
      } catch (refreshError) {
        // Refresh failed - sync state by calling authStore.logout()
        processQueue(refreshError, null)
        isRefreshing = false

        // Logout properly to sync both localStorage AND Zustand state
        try {
          await useAuthStore.getState().logout()
        } catch (logoutError) {
          // Even if logout API fails, state is cleared
          console.error('Logout during 401 refresh failed:', logoutError)
        }

        return Promise.reject(new Error('Session expired. Please login again.'))
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

export async function refreshToken(): Promise<{ message: string; token: string; refreshToken: string }> {
  const refreshToken = localStorage.getItem('refreshToken')
  if (!refreshToken) {
    throw new Error('No refresh token available')
  }

  // Use apiNoIntercept to prevent triggering interceptors
  const response = await apiNoIntercept.post('/auth/refresh', { refreshToken })

  // Update stored tokens
  localStorage.setItem('token', response.data.token)
  localStorage.setItem('refreshToken', response.data.refreshToken)

  return response.data
}

export async function logoutUser(): Promise<any> {
  const response = await api.post('/auth/logout')
  // Token cleanup is handled by authStore.logout() to avoid race conditions
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
