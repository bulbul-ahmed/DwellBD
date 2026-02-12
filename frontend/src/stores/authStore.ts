import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser,
  User,
  RegisterRequest,
  LoginRequest,
} from '../api/authApi'

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
      _hasHydrated: false,

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
            _hasHydrated: false,
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
          // Only logout on 401 Unauthorized or 403 Forbidden errors
          // For other errors (network, server 500, etc.), keep user logged in
          if (error?.response?.status === 401 || error?.response?.status === 403) {
            console.error('Authentication failed:', error)
            // Use the logout function to ensure proper cleanup
            await get().logout()
          } else {
            // For temporary errors, just log and keep state
            console.warn('Temporary error fetching user, keeping session:', error?.message || error)
          }
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
        // After rehydration, sync tokens between Zustand and localStorage
        if (state) {
          if (state.token && state.refreshToken) {
            // Check if tokens exist in localStorage
            const storageToken = localStorage.getItem('token')
            const storageRefreshToken = localStorage.getItem('refreshToken')

            // If Zustand has tokens but localStorage doesn't, RESTORE them
            // This fixes the issue where axios interceptor clears localStorage but not Zustand
            if (!storageToken) {
              localStorage.setItem('token', state.token)
            }
            if (!storageRefreshToken) {
              localStorage.setItem('refreshToken', state.refreshToken)
            }
          } else {
            // If Zustand has no tokens, ensure localStorage is also clear
            localStorage.removeItem('token')
            localStorage.removeItem('refreshToken')
          }
          // Mark as hydrated
          state._hasHydrated = true
        }
      },
    }
  )
)
