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
} from '../controllers/authController'
import { authenticateToken } from '../middleware/auth'
import { authLimiter, passwordLimiter } from '../middleware/rateLimiter'

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

// Public routes with rate limiting
router.post('/register', authLimiter, register)
router.post('/login', authLimiter, login)
router.post('/forgot-password', passwordLimiter, requestPasswordReset)
router.post('/reset-password', passwordLimiter, resetPassword)

// Protected routes
router.get('/me', authenticateToken, getProfile)
router.put('/me', authenticateToken, updateProfile)
router.post('/upload-photo', authenticateToken, profilePhotoUpload.single('photo'), uploadProfilePhoto)

export default router
