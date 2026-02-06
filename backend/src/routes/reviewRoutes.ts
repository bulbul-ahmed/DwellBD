import express from 'express'
import {
  createReview,
  getPropertyReviews,
  getUserReviews,
  updateReview,
  deleteReview
} from '../controllers/reviewController'
import { authenticateToken } from '../middleware/auth'
import { strictLimiter } from '../middleware/rateLimiter'

const router = express.Router()

// Get reviews for a specific property (public)
router.get('/property/:propertyId', getPropertyReviews)

// Protected routes - require authentication
router.use(authenticateToken)

// Create review with rate limiting
router.post('/', strictLimiter, createReview)

// Get user's reviews
router.get('/', getUserReviews)

// Update review with rate limiting
router.patch('/:reviewId', strictLimiter, updateReview)

// Delete review with rate limiting
router.delete('/:reviewId', strictLimiter, deleteReview)

export default router
