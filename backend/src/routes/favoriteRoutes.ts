import express from 'express'
import {
  addFavorite,
  removeFavorite,
  getUserFavorites,
  checkFavorite
} from '../controllers/favoriteController'
import { authenticateToken } from '../middleware/auth'
import { strictLimiter } from '../middleware/rateLimiter'

const router = express.Router()

// All favorite routes require authentication
router.use(authenticateToken)

// Add favorite with rate limiting
router.post('/', strictLimiter, addFavorite)

// Get user's favorites
router.get('/', getUserFavorites)

// Check if property is favorited
router.get('/:propertyId/check', checkFavorite)

// Remove favorite with rate limiting
router.delete('/:propertyId', strictLimiter, removeFavorite)

export default router
