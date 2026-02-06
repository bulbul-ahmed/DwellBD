import express from 'express'
import {
  getUserRatings,
  getUserRatingStats,
  createRating,
  updateRating,
  deleteRating,
  checkExistingRating,
} from '../controllers/ratingController'
import { authenticateToken } from '../middleware/auth'
import { strictLimiter } from '../middleware/rateLimiter'

const router = express.Router()

// Public routes
router.get('/user/:userId', getUserRatings)
router.get('/user/:userId/stats', getUserRatingStats)

// Protected routes
router.get('/check-existing', authenticateToken, checkExistingRating)
router.post('/', authenticateToken, strictLimiter, createRating)
router.patch('/:ratingId', authenticateToken, strictLimiter, updateRating)
router.delete('/:ratingId', authenticateToken, strictLimiter, deleteRating)

export default router
