import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { jwtDecode } from 'jwt-decode'
import { toast } from 'react-hot-toast'
import {
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser,
  User,
  RegisterRequest,
  LoginRequest,
} from '../api/authApi'

// Helper function to validate JWT token expiry
const isTokenValid = (token: string): boolean => {
  try {
    const decoded = jwtDecode<{ exp: number }>(token)
    const now = Date.now() / 1000
    return decoded.exp > now // Not expired
  } catch {
    return false // Invalid token format
  }
}

interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isLoading: boolean
  error: string | null
  isAuthenticated: boolean
  _hasHydrated: boolean

  // Actions
  register: (data: RegisterRequest) => Promise<void>
  login: (data: LoginRequest) => Promise<void>
  logout: () => Promise<void>
  fetchCurrentUser: () => Promise<void>
  clearError: () => void
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  setHasHydrated: (hydrated: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,
      _hasHydrated: true,

      register: async (data: RegisterRequest) => {
        set({ isLoading: true, error: null })
        try {
          const response = await registerUser(data)
          localStorage.setItem('token', response.token)
          localStorage.setItem('refreshToken', response.refreshToken)
          set({
            user: response.user as User,
            token: response.token,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Registration failed'
          set({ error: message, isLoading: false })
          throw error
        }
      },

      login: async (data: LoginRequest) => {
        set({ isLoading: true, error: null })
        try {
          const response = await loginUser(data)
          localStorage.setItem('token', response.token)
          localStorage.setItem('refreshToken', response.refreshToken)
          set({
            user: response.user as User,
            token: response.token,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Login failed'
          set({ error: message, isLoading: false })
          throw error
        }
      },

      logout: async () => {
        set({ isLoading: true })
        try {
          await logoutUser()
        } catch (error) {
          console.error('Logout error:', error)
        } finally {
          // Always clear state and localStorage, even if API call fails
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            // DO NOT set _hasHydrated to false - it indicates whether Zustand has loaded from storage, not auth status
          })
          // Clear all auth-related localStorage items
          localStorage.removeItem('token')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('user')
          localStorage.removeItem('auth-storage') // Clear Zustand persist cache
        }
      },

      fetchCurrentUser: async () => {
        const token = get().token || localStorage.getItem('token')
        if (!token) {
          // No token - ensure clean state
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false
          })
          return
        }

        try {
          const response = await getCurrentUser()
          // Update both state and localStorage to ensure sync
          const currentRefreshToken = get().refreshToken || localStorage.getItem('refreshToken')
          set({
            user: response.user,
            token: token,
            refreshToken: currentRefreshToken,
            isAuthenticated: true,
          })
        } catch (error: any) {
          // Clear state on ANY error - if we can't validate user, session is unreliable
          console.error('Failed to fetch current user:', error?.message || error)
          toast.error('Session validation failed. Please login again.')
          await get().logout()
        }
      },

      clearError: () => set({ error: null }),

      setUser: (user: User | null) => set({ user }),

      setToken: (token: string | null) => {
        set({ token })
        if (token) {
          localStorage.setItem('token', token)
        } else {
          localStorage.removeItem('token')
        }
      },

      setHasHydrated: (hydrated: boolean) => set({ _hasHydrated: hydrated }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // After rehydration, validate tokens before syncing
        if (state) {
          if (state.token && state.refreshToken) {
            // Validate token before restoring
            if (isTokenValid(state.token)) {
              // Token is valid - sync with localStorage
              const storageToken = localStorage.getItem('token')
              const storageRefreshToken = localStorage.getItem('refreshToken')

              // If Zustand has tokens but localStorage doesn't, RESTORE them
              if (!storageToken) {
                localStorage.setItem('token', state.token)
              }
              if (!storageRefreshToken) {
                localStorage.setItem('refreshToken', state.refreshToken)
              }
            } else {
              // Token is expired or invalid - clear everything
              console.warn('Token expired during rehydration, clearing auth state')
              toast.error('Your session has expired. Please login again.')

              // Clear Zustand state
              useAuthStore.setState({
                user: null,
                token: null,
                refreshToken: null,
                isAuthenticated: false,
              })

              // Clear localStorage
              localStorage.removeItem('token')
              localStorage.removeItem('refreshToken')
              localStorage.removeItem('user')
              localStorage.removeItem('auth-storage')
            }
          } else {
            // If Zustand has no tokens, ensure localStorage is also clear
            localStorage.removeItem('token')
            localStorage.removeItem('refreshToken')
          }
        }
        // ALWAYS mark as hydrated, regardless of whether state exists or not
        // This ensures the UI doesn't stay in a loading state indefinitely
        useAuthStore.setState({ _hasHydrated: true })
      },
    }
  )
)
