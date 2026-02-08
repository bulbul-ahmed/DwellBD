import express from 'express'
import {
  createVisitRequest,
  getTenantVisitRequests,
  getOwnerVisitRequests,
  getVisitRequestById,
  confirmVisitRequest,
  rejectVisitRequest,
  suggestAlternativeDate,
  cancelVisitRequest,
  markVisitCompleted,
  checkTimeSlotAvailability,
} from '../controllers/visitController'
import { authenticateToken } from '../middleware/auth'
import { strictLimiter } from '../middleware/rateLimiter'

const router = express.Router()

// All routes require authentication
router.use(authenticateToken)

// Tenant actions
router.post('/', strictLimiter, createVisitRequest)
router.get('/tenant', getTenantVisitRequests)
router.delete('/:visitId', strictLimiter, cancelVisitRequest)

// Owner actions
router.get('/owner', getOwnerVisitRequests)
router.patch('/:visitId/confirm', strictLimiter, confirmVisitRequest)
router.patch('/:visitId/reject', strictLimiter, rejectVisitRequest)
router.patch('/:visitId/suggest-alternative', strictLimiter, suggestAlternativeDate)
router.patch('/:visitId/complete', strictLimiter, markVisitCompleted)

// Shared actions
router.get('/:visitId', getVisitRequestById)
router.get('/property/:propertyId/availability', checkTimeSlotAvailability)

export default router
