import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'TENANT' | 'OWNER' | 'ADMIN'
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user, _hasHydrated } = useAuthStore()

  // Show loading state while hydrating to prevent false redirects
  if (!_hasHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Now safe to check authentication (state is hydrated)
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
