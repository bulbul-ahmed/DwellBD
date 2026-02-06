import express from 'express'
import multer from 'multer'
import {
  createNewProperty,
  getProperty,
  getMyProperties,
  searchAllProperties,
  updatePropertyData,
  deletePropertyData,
  uploadPropertyImages,
  getPropertyStatsHandler,
} from '../controllers/propertyController'
import { authenticateToken, requireRole } from '../middleware/auth'
import { searchLimiter, strictLimiter } from '../middleware/rateLimiter'

const router = express.Router()

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    // Only accept image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed'))
    }
  },
})

// Public routes with search limiter - these must come before /:id routes
router.get('/', searchLimiter, searchAllProperties)
router.get('/search', searchLimiter, searchAllProperties)

// Protected routes with strict limiter for mutations
router.post('/', authenticateToken, requireRole('OWNER'), strictLimiter, createNewProperty)
router.get('/user/my-properties', authenticateToken, getMyProperties)
router.post('/upload/images', authenticateToken, strictLimiter, upload.array('images', 10), uploadPropertyImages)

// Routes with :id parameter - these come last
router.get('/:id', getProperty)
router.get('/:id/stats', getPropertyStatsHandler)
router.patch('/:id', authenticateToken, requireRole('OWNER'), strictLimiter, updatePropertyData)
router.delete('/:id', authenticateToken, requireRole('OWNER'), strictLimiter, deletePropertyData)

export default router
