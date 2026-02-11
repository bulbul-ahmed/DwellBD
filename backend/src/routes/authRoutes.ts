import express from 'express'
import multer from 'multer'
import {
  register,
  login,
  getProfile,
  requestPasswordReset,
  resetPassword,
  updateProfile,
  uploadProfilePhoto,
  logout,
  refreshTokenEndpoint,
} from '../controllers/authController'
import { authenticateToken } from '../middleware/auth'
import { authLimiter, passwordLimiter } from '../middleware/rateLimiter'
import { validate } from '../middleware/validation'
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  passwordResetRequestSchema,
  passwordResetSchema,
  updateProfileSchema
} from '../schemas/auth.schema'

// Configure multer for profile photo uploads
const profilePhotoUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    // Only accept image files
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Only image files are allowed'))
      return
    }
    cb(null, true)
  }
})

const router = express.Router()

// Public routes with rate limiting + validation
router.post('/register', authLimiter, validate(registerSchema), register)
router.post('/login', authLimiter, validate(loginSchema), login)
router.post('/refresh', authLimiter, validate(refreshTokenSchema), refreshTokenEndpoint)
router.post('/forgot-password', passwordLimiter, validate(passwordResetRequestSchema), requestPasswordReset)
router.post('/reset-password', passwordLimiter, validate(passwordResetSchema), resetPassword)

// Protected routes with validation
router.get('/me', authenticateToken, getProfile)
router.put('/me', authenticateToken, validate(updateProfileSchema), updateProfile)
router.post('/upload-photo', authenticateToken, profilePhotoUpload.single('photo'), uploadProfilePhoto)
router.post('/logout', authenticateToken, logout)

export default router
