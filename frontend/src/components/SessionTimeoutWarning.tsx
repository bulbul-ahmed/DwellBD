import { useState, useEffect, useCallback } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { jwtDecode } from 'jwt-decode'
import { useAuthStore } from '@/stores/authStore'
import Button from './ui/Button'

interface SessionTimeoutWarningProps {
  /** Warning time in seconds before expiration (default: 120 = 2 minutes) */
  warningTime?: number
}

export default function SessionTimeoutWarning({ warningTime = 120 }: SessionTimeoutWarningProps) {
  const [showWarning, setShowWarning] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const { token, logout } = useAuthStore()

  const checkTokenExpiry = useCallback(() => {
    if (!token) {
      setShowWarning(false)
      return
    }

    try {
      const decoded = jwtDecode<{ exp: number }>(token)
      const now = Date.now() / 1000
      const timeUntilExpiry = decoded.exp - now

      // Show warning if token expires in less than warningTime seconds
      if (timeUntilExpiry <= warningTime && timeUntilExpiry > 0) {
        setShowWarning(true)
        setTimeRemaining(Math.ceil(timeUntilExpiry))
      } else if (timeUntilExpiry <= 0) {
        // Token expired - logout
        setShowWarning(false)
        logout()
      } else {
        setShowWarning(false)
      }
    } catch (error) {
      console.error('Error checking token expiry:', error)
      setShowWarning(false)
    }
  }, [token, warningTime, logout])

  useEffect(() => {
    // Check immediately
    checkTokenExpiry()

    // Check every 10 seconds
    const interval = setInterval(checkTokenExpiry, 10000)

    return () => clearInterval(interval)
  }, [checkTokenExpiry])

  // Update countdown every second when warning is shown
  useEffect(() => {
    if (!showWarning) return

    const countdown = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setShowWarning(false)
          logout()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(countdown)
  }, [showWarning, logout])

  const handleDismiss = () => {
    setShowWarning(false)
  }

  const handleStayLoggedIn = () => {
    // Refresh the page to trigger token refresh
    window.location.reload()
  }

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  if (!showWarning) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md animate-slide-up">
      <div className="rounded-lg border border-orange-200 bg-white p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-6 w-6 text-orange-500" />
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  Session Expiring Soon
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  Your session will expire in{' '}
                  <span className="font-bold text-orange-600">
                    {formatTime(timeRemaining)}
                  </span>
                </p>
              </div>
              <button
                onClick={handleDismiss}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Dismiss warning"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-gray-500">
              Click "Stay Logged In" to extend your session, or you'll be logged out automatically.
            </p>

            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                onClick={handleStayLoggedIn}
                className="flex-1"
              >
                Stay Logged In
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => logout()}
                className="flex-1"
              >
                Logout Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
