import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'
import { toast } from 'react-hot-toast'
import Header from './components/Header'
import Footer from './components/Footer'
import ErrorBoundary from './components/ErrorBoundary'
import ProtectedRoute from './components/ProtectedRoute'
import AdminLayout from './components/AdminLayout'
import SessionTimeoutWarning from './components/SessionTimeoutWarning'
import { useAuthStore } from './stores/authStore'
import HomePage from './pages/HomePage'
import PropertyListingsPage from './pages/PropertyListingsPage'
import PropertyDetailPage from './pages/PropertyDetailPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import ProfilePage from './pages/ProfilePage'
import FavoritesPage from './pages/FavoritesPage'
import InquiriesPage from './pages/InquiriesPage'
import BookingsPage from './pages/BookingsPage'
import VisitsPage from './pages/VisitsPage'
import OwnerVisitRequestsPage from './pages/OwnerVisitRequestsPage'
import MyPropertiesPage from './pages/MyPropertiesPage'
import OwnerInquiriesPage from './pages/OwnerInquiriesPage'
import OwnerRequestsPage from './pages/OwnerRequestsPage'
import FAQPage from './pages/FAQPage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import TermsOfServicePage from './pages/TermsOfServicePage'
import NotFoundPage from './pages/NotFoundPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProperties from './pages/admin/AdminProperties'
import PendingApprovals from './pages/admin/PendingApprovals'
import AdminUsers from './pages/admin/AdminUsers'
import AdminAnalytics from './pages/admin/AdminAnalytics'
import AdminRequests from './pages/admin/AdminRequests'

function App() {
  const { fetchCurrentUser, logout } = useAuthStore()

  // Fetch user only on initial mount (not on every route change)
  // Validate token before making API call to prevent unnecessary requests
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      // Validate token expiry before calling API
      try {
        const decoded = jwtDecode<{ exp: number }>(token)
        const now = Date.now() / 1000
        if (decoded.exp > now) {
          // Token is valid and not expired - fetch user
          fetchCurrentUser()
        } else {
          // Token expired - clear immediately without API call
          console.warn('Token expired on app mount, clearing auth state')
          toast.error('Your session has expired. Please login again.')
          logout()
        }
      } catch (error) {
        // Invalid token format - clear
        console.error('Invalid token format on app mount:', error)
        logout()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    // Cross-tab synchronization: listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      // If token was removed in another tab, logout in this tab too
      if (e.key === 'token' && e.newValue === null) {
        logout()
      }

      // If token was added/changed in another tab, refetch user
      if (e.key === 'token' && e.newValue !== null) {
        fetchCurrentUser()
      }
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [logout, fetchCurrentUser])

  return (
    <ErrorBoundary>
      {/* Session Timeout Warning - shows when token about to expire */}
      <SessionTimeoutWarning warningTime={120} />

      <div className="flex min-h-screen flex-col bg-white">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/properties" element={<PropertyListingsPage />} />
            <Route path="/properties/:id" element={<PropertyDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/favorites" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />
            <Route path="/inquiries" element={<ProtectedRoute><InquiriesPage /></ProtectedRoute>} />
            <Route path="/bookings" element={<ProtectedRoute><BookingsPage /></ProtectedRoute>} />
            <Route path="/visits" element={<ProtectedRoute><VisitsPage /></ProtectedRoute>} />
            <Route path="/owner/visit-requests" element={<ProtectedRoute requiredRole="OWNER"><OwnerVisitRequestsPage /></ProtectedRoute>} />
            <Route path="/my-properties" element={<ProtectedRoute requiredRole="OWNER"><MyPropertiesPage /></ProtectedRoute>} />
            <Route path="/owner/inquiries" element={<ProtectedRoute requiredRole="OWNER"><OwnerInquiriesPage /></ProtectedRoute>} />
            <Route path="/owner/requests" element={<ProtectedRoute requiredRole="OWNER"><OwnerRequestsPage /></ProtectedRoute>} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/terms-of-service" element={<TermsOfServicePage />} />
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <AdminLayout>
                    <Routes>
                      <Route path="/" element={<AdminDashboard />} />
                      <Route path="/properties" element={<AdminProperties />} />
                      <Route path="/properties/pending" element={<PendingApprovals />} />
                      <Route path="/users" element={<AdminUsers />} />
                      <Route path="/requests" element={<AdminRequests />} />
                      <Route path="/analytics" element={<AdminAnalytics />} />
                    </Routes>
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </ErrorBoundary>
  )
}

export default App
