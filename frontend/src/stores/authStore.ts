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
        } catch (error) {
          // Token is invalid or expired - clear everything
          console.error('Failed to fetch current user:', error)

          // Use the logout function to ensure proper cleanup
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
        // After rehydration, validate tokens
        if (state) {
          if (state.token) {
            // Check if tokens exist in localStorage (they might have been cleared by axios interceptor)
            const storageToken = localStorage.getItem('token')
            const storageRefreshToken = localStorage.getItem('refreshToken')

            // If localStorage was cleared but Zustand still has tokens, clear Zustand too
            if (!storageToken || !storageRefreshToken) {
              state.user = null
              state.token = null
              state.refreshToken = null
              state.isAuthenticated = false
            }
          }
          // Mark as hydrated
          state._hasHydrated = true
        }
      },
    }
  )
)
