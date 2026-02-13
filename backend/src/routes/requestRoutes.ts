import { Router } from 'express'
import { authenticateToken, requireRole } from '../middleware/auth'
import {
  // Owner endpoints
  submitRequest,
  getOwnerRequests,
  getRequestById,
  cancelRequest,
  // Admin endpoints
  getAllRequests,
  approveRequest,
  rejectRequest,
  markInReview,
} from '../controllers/requestController'

const router = Router()

/**
 * Owner Request Routes
 * All routes require authentication and OWNER role
 */

// Submit a new request
router.post('/owner/requests', authenticateToken, requireRole('OWNER'), submitRequest)

// Get all requests for the authenticateTokend owner
router.get('/owner/requests', authenticateToken, requireRole('OWNER'), getOwnerRequests)

// Get a specific request by ID (owner can only view their own)
router.get('/owner/requests/:id', authenticateToken, requireRole('OWNER'), getRequestById)

// Cancel a pending request
router.patch('/owner/requests/:id/cancel', authenticateToken, requireRole('OWNER'), cancelRequest)

/**
 * Admin Request Routes
 * All routes require authentication and ADMIN role
 */

// Get all requests (with filtering)
router.get('/admin/requests', authenticateToken, requireRole('ADMIN'), getAllRequests)

// Get a specific request by ID (admin can view any)
router.get('/admin/requests/:id', authenticateToken, requireRole('ADMIN'), getRequestById)

// Approve a request
router.patch('/admin/requests/:id/approve', authenticateToken, requireRole('ADMIN'), approveRequest)

// Reject a request
router.patch('/admin/requests/:id/reject', authenticateToken, requireRole('ADMIN'), rejectRequest)

// Mark request as in review
router.patch('/admin/requests/:id/review', authenticateToken, requireRole('ADMIN'), markInReview)

export default router
