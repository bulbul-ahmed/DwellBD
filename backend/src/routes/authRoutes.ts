import express from 'express'
import {
  register,
  login,
  getProfile,
  requestPasswordReset,
  resetPassword,
  updateProfile,
} from '../controllers/authController'
import { authenticateToken } from '../middleware/auth'
import { authLimiter, passwordLimiter } from '../middleware/rateLimiter'

const router = express.Router()

// Public routes with rate limiting
router.post('/register', authLimiter, register)
router.post('/login', authLimiter, login)
router.post('/forgot-password', passwordLimiter, requestPasswordReset)
router.post('/reset-password', passwordLimiter, resetPassword)

// Protected routes
router.get('/me', authenticateToken, getProfile)
router.put('/me', authenticateToken, updateProfile)

export default router
