import { Request, Response } from 'express'
import { prisma } from '../models'
import {
  createOwnerRequest,
  getOwnerRequestById,
  getOwnerRequestsForUser,
  getAllOwnerRequests,
  cancelOwnerRequest,
  approveOwnerRequest,
  rejectOwnerRequest,
  markRequestInReview,
} from '../services/requestService'

/**
 * Owner Endpoints
 */

/**
 * Submit a new owner request
 * POST /api/owner/requests
 */
export const submitRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    const { requestType, requestData, currentData, reason } = req.body

    // Validate required fields
    if (!requestType || !requestData || !reason) {
      res.status(400).json({
        error: 'Validation error',
        message: 'requestType, requestData, and reason are required',
      })
      return
    }

    // Validate reason length
    if (reason.trim().length < 10) {
      res.status(400).json({
        error: 'Validation error',
        message: 'Reason must be at least 10 characters',
      })
      return
    }

    // Create the request
    const request = await createOwnerRequest(userId, {
      requestType,
      requestData,
      currentData: currentData || null,
      reason,
    })

    res.status(201).json({
      message: 'Request submitted successfully',
      request,
    })
  } catch (error: any) {
    console.error('Submit request error:', error)
    res.status(500).json({
      error: 'Failed to submit request',
      message: error.message,
    })
  }
}

/**
 * Get all requests for the authenticated owner
 * GET /api/owner/requests?status=PENDING&page=1&limit=10
 */
export const getOwnerRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    const { status, page = '1', limit = '10' } = req.query
    const statusFilter = typeof status === 'string' ? status : undefined

    const result = await getOwnerRequestsForUser(
      userId,
      statusFilter,
      parseInt(page as string),
      parseInt(limit as string)
    )

    res.json(result)
  } catch (error) {
    console.error('Get owner requests error:', error)
    res.status(500).json({ error: 'Failed to fetch requests' })
  }
}

/**
 * Get a specific request by ID
 * GET /api/owner/requests/:id or /api/admin/requests/:id
 */
export const getRequestById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId
    const userRole = (req as any).user?.role
    const { id } = req.params

    if (!userId || !id) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    const request = await getOwnerRequestById(id)

    if (!request) {
      res.status(404).json({ error: 'Request not found' })
      return
    }

    // Authorization: Owners can only view their own requests, admins can view all
    if (userRole !== 'ADMIN' && request.userId !== userId) {
      res.status(403).json({ error: 'Forbidden' })
      return
    }

    res.json(request)
  } catch (error) {
    console.error('Get request by ID error:', error)
    res.status(500).json({ error: 'Failed to fetch request' })
  }
}

/**
 * Cancel a pending request
 * PATCH /api/owner/requests/:id/cancel
 */
export const cancelRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId
    const { id } = req.params

    if (!userId || !id) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    const request = await cancelOwnerRequest(id, userId)

    res.json({
      message: 'Request cancelled successfully',
      request,
    })
  } catch (error: any) {
    console.error('Cancel request error:', error)
    res.status(400).json({
      error: 'Failed to cancel request',
      message: error.message,
    })
  }
}

/**
 * Admin Endpoints
 */

/**
 * Get all requests with filtering
 * GET /api/admin/requests?status=PENDING&requestType=BUSINESS_INFO_CHANGE&page=1&limit=10
 */
export const getAllRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, requestType, userId, page = '1', limit = '10' } = req.query

    const filters = {
      status: typeof status === 'string' ? status : undefined,
      requestType: typeof requestType === 'string' ? requestType : undefined,
      userId: typeof userId === 'string' ? userId : undefined,
    }

    const result = await getAllOwnerRequests(
      filters,
      parseInt(page as string),
      parseInt(limit as string)
    )

    res.json(result)
  } catch (error) {
    console.error('Get all requests error:', error)
    res.status(500).json({ error: 'Failed to fetch requests' })
  }
}

/**
 * Approve a request
 * PATCH /api/admin/requests/:id/approve
 */
export const approveRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const adminId = (req as any).user?.userId
    const { id } = req.params
    const { reviewNotes } = req.body

    if (!adminId || !id) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    const request = await approveOwnerRequest(id, adminId, reviewNotes)

    res.json({
      message: 'Request approved successfully',
      request,
    })
  } catch (error: any) {
    console.error('Approve request error:', error)
    res.status(400).json({
      error: 'Failed to approve request',
      message: error.message,
    })
  }
}

/**
 * Reject a request
 * PATCH /api/admin/requests/:id/reject
 */
export const rejectRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const adminId = (req as any).user?.userId
    const { id } = req.params
    const { rejectionReason, reviewNotes } = req.body

    if (!adminId || !id) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    // Validate rejection reason
    if (!rejectionReason || rejectionReason.trim().length < 10) {
      res.status(400).json({
        error: 'Validation error',
        message: 'Rejection reason is required and must be at least 10 characters',
      })
      return
    }

    const request = await rejectOwnerRequest(id, adminId, rejectionReason, reviewNotes)

    res.json({
      message: 'Request rejected successfully',
      request,
    })
  } catch (error: any) {
    console.error('Reject request error:', error)
    res.status(400).json({
      error: 'Failed to reject request',
      message: error.message,
    })
  }
}

/**
 * Mark request as in review
 * PATCH /api/admin/requests/:id/review
 */
export const markInReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const adminId = (req as any).user?.userId
    const { id } = req.params

    if (!adminId || !id) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    const request = await markRequestInReview(id, adminId)

    res.json({
      message: 'Request marked as in review',
      request,
    })
  } catch (error: any) {
    console.error('Mark in review error:', error)
    res.status(400).json({
      error: 'Failed to update request',
      message: error.message,
    })
  }
}
