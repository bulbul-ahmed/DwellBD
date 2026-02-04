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

// Public routes - these must come before /:id routes
router.get('/search', searchAllProperties)

// Protected routes - these must come before /:id routes
router.post('/', authenticateToken, requireRole('OWNER'), createNewProperty)
router.get('/user/my-properties', authenticateToken, getMyProperties)
router.post('/upload/images', authenticateToken, upload.array('images', 10), uploadPropertyImages)

// Routes with :id parameter - these come last
router.get('/:id', getProperty)
router.get('/:id/stats', getPropertyStatsHandler)
router.patch('/:id', authenticateToken, requireRole('OWNER'), updatePropertyData)
router.delete('/:id', authenticateToken, requireRole('OWNER'), deletePropertyData)

export default router
