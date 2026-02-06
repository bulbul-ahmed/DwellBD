import express from 'express'
import { authenticateToken, requireRole } from '../middleware/auth'
import {
  getDashboardStatsHandler,
  getAllPropertiesHandler,
  updatePropertyHandler,
  getAllUsersHandler,
  updateUserHandler,
  getAnalyticsDataHandler,
  getMonthlyTrendsHandler,
  getPendingApprovalsHandler
} from '../controllers/adminController'
import { strictLimiter } from '../middleware/rateLimiter'

const router = express.Router()

// Apply auth middleware to all admin routes
router.use(authenticateToken, requireRole('ADMIN'))

// Dashboard
router.get('/dashboard', getDashboardStatsHandler)

// Properties
router.get('/properties', getAllPropertiesHandler)
router.patch('/properties/:id', strictLimiter, updatePropertyHandler)

// Users
router.get('/users', getAllUsersHandler)
router.patch('/users/:id', strictLimiter, updateUserHandler)

// Analytics
router.get('/analytics', getAnalyticsDataHandler)
router.get('/analytics/monthly', getMonthlyTrendsHandler)

// Pending Approvals
router.get('/pending-approvals', getPendingApprovalsHandler)

export default router
