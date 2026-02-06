import express from 'express'
import {
  createInquiry,
  getUserInquiries,
  getInquiryById,
  updateInquiryStatus,
  deleteInquiry
} from '../controllers/inquiryController'
import { authenticateToken, optionalAuth } from '../middleware/auth'
import { strictLimiter } from '../middleware/rateLimiter'

const router = express.Router()

// Create inquiry with rate limiting (can be used by both authenticated and non-authenticated users)
router.post('/', optionalAuth, strictLimiter, createInquiry)

// Protected routes - require authentication
router.use(authenticateToken)

// Get user's inquiries
router.get('/', getUserInquiries)

// Get inquiry by ID
router.get('/:inquiryId', getInquiryById)

// Update inquiry status with rate limiting
router.patch('/:inquiryId', strictLimiter, updateInquiryStatus)

// Delete inquiry with rate limiting
router.delete('/:inquiryId', strictLimiter, deleteInquiry)

export default router
