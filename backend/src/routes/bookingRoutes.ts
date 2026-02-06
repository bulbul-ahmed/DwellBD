import express from 'express'
import {
  createBooking,
  getUserBookings,
  getBookingById,
  updateBooking,
  cancelBooking
} from '../controllers/bookingController'
import { authenticateToken } from '../middleware/auth'
import { strictLimiter } from '../middleware/rateLimiter'

const router = express.Router()

// All booking routes require authentication
router.use(authenticateToken)

// Create booking with strict rate limiting
router.post('/', strictLimiter, createBooking)

// Get user's bookings
router.get('/', getUserBookings)

// Get booking by ID
router.get('/:bookingId', getBookingById)

// Update booking with strict rate limiting
router.patch('/:bookingId', strictLimiter, updateBooking)

// Cancel booking with strict rate limiting
router.delete('/:bookingId', strictLimiter, cancelBooking)

export default router
