import express from 'express'
import {
  register,
  login,
  getCurrentUser,
  verifyEmail,
  refreshAccessToken,
  logout,
  requestPasswordReset,
  resetPassword,
} from '../controllers/authController'
import { authenticateToken } from '../middleware/auth'

const router = express.Router()

// Public routes
router.post('/register', register)
router.post('/login', login)
router.post('/refresh', refreshAccessToken)
router.post('/logout', logout)
router.post('/forgot-password', requestPasswordReset)
router.post('/reset-password', resetPassword)

// Protected routes
router.get('/me', authenticateToken, getCurrentUser)
router.post('/verify-email', authenticateToken, verifyEmail)

export default router
