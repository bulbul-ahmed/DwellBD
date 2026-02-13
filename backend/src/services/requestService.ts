import { prisma } from '../models'
import { validateServiceAreas } from '../constants/areas'

interface CreateRequestData {
  requestType: string
  requestData: any
  currentData: any
  reason: string
}

interface RequestFilters {
  status?: string
  requestType?: string
  userId?: string
}

/**
 * Create a new owner request
 */
export async function createOwnerRequest(userId: string, data: CreateRequestData) {
  // Check for duplicate pending request of the same type
  const existingRequest = await prisma.ownerRequest.findFirst({
    where: {
      userId,
      requestType: data.requestType as any,
      status: 'PENDING',
    },
  })

  if (existingRequest) {
    throw new Error(
      `You already have a pending ${data.requestType} request. Please wait for it to be reviewed.`
    )
  }

  // Validate request data based on type
  validateRequestData(data.requestType, data.requestData)

  // Create the request
  const request = await prisma.ownerRequest.create({
    data: {
      userId,
      requestType: data.requestType as any,
      requestData: data.requestData,
      currentData: data.currentData,
      reason: data.reason,
      status: 'PENDING',
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      },
    },
  })

  return request
}

/**
 * Get a specific request by ID
 */
export async function getOwnerRequestById(requestId: string) {
  const request = await prisma.ownerRequest.findUnique({
    where: { id: requestId },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          isVerified: true,
        },
      },
      reviewer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  })

  return request
}

/**
 * Get all requests for a specific user
 */
export async function getOwnerRequestsForUser(
  userId: string,
  status?: string,
  page = 1,
  limit = 10
) {
  const skip = (page - 1) * limit

  const where: any = { userId }

  if (status) {
    where.status = status
  }

  const [requests, total] = await Promise.all([
    prisma.ownerRequest.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    }),
    prisma.ownerRequest.count({ where }),
  ])

  return {
    requests,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}

/**
 * Get all requests (admin view)
 */
export async function getAllOwnerRequests(
  filters: RequestFilters,
  page = 1,
  limit = 10
) {
  const skip = (page - 1) * limit

  const where: any = {}

  if (filters.status) {
    where.status = filters.status
  }

  if (filters.requestType) {
    where.requestType = filters.requestType
  }

  if (filters.userId) {
    where.userId = filters.userId
  }

  const [requests, total] = await Promise.all([
    prisma.ownerRequest.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            isVerified: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    }),
    prisma.ownerRequest.count({ where }),
  ])

  return {
    requests,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}

/**
 * Cancel a pending request
 */
export async function cancelOwnerRequest(requestId: string, userId: string) {
  // Get the request
  const request = await prisma.ownerRequest.findUnique({
    where: { id: requestId },
  })

  if (!request) {
    throw new Error('Request not found')
  }

  // Verify ownership
  if (request.userId !== userId) {
    throw new Error('You can only cancel your own requests')
  }

  // Can only cancel pending requests
  if (request.status !== 'PENDING') {
    throw new Error('Only pending requests can be cancelled')
  }

  // Update status to cancelled
  const updatedRequest = await prisma.ownerRequest.update({
    where: { id: requestId },
    data: { status: 'CANCELLED' },
  })

  return updatedRequest
}

/**
 * Approve a request and apply changes
 */
export async function approveOwnerRequest(
  requestId: string,
  adminId: string,
  reviewNotes?: string
) {
  // Get the request
  const request = await prisma.ownerRequest.findUnique({
    where: { id: requestId },
    include: {
      user: true,
    },
  })

  if (!request) {
    throw new Error('Request not found')
  }

  // Can only approve pending or in-review requests
  if (request.status !== 'PENDING' && request.status !== 'IN_REVIEW') {
    throw new Error('Only pending or in-review requests can be approved')
  }

  // Apply the changes based on request type
  await applyRequestChanges(request.requestType, request.userId, request.requestData)

  // Update the request
  const updatedRequest = await prisma.ownerRequest.update({
    where: { id: requestId },
    data: {
      status: 'APPROVED',
      reviewedBy: adminId,
      reviewedAt: new Date(),
      reviewNotes,
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      reviewer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  })

  return updatedRequest
}

/**
 * Reject a request
 */
export async function rejectOwnerRequest(
  requestId: string,
  adminId: string,
  rejectionReason: string,
  reviewNotes?: string
) {
  // Get the request
  const request = await prisma.ownerRequest.findUnique({
    where: { id: requestId },
  })

  if (!request) {
    throw new Error('Request not found')
  }

  // Can only reject pending or in-review requests
  if (request.status !== 'PENDING' && request.status !== 'IN_REVIEW') {
    throw new Error('Only pending or in-review requests can be rejected')
  }

  // Update the request
  const updatedRequest = await prisma.ownerRequest.update({
    where: { id: requestId },
    data: {
      status: 'REJECTED',
      reviewedBy: adminId,
      reviewedAt: new Date(),
      rejectionReason,
      reviewNotes,
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      reviewer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  })

  return updatedRequest
}

/**
 * Mark request as in review
 */
export async function markRequestInReview(requestId: string, adminId: string) {
  // Get the request
  const request = await prisma.ownerRequest.findUnique({
    where: { id: requestId },
  })

  if (!request) {
    throw new Error('Request not found')
  }

  // Can only mark pending requests as in review
  if (request.status !== 'PENDING') {
    throw new Error('Only pending requests can be marked as in review')
  }

  // Update the request
  const updatedRequest = await prisma.ownerRequest.update({
    where: { id: requestId },
    data: {
      status: 'IN_REVIEW',
      reviewedBy: adminId,
    },
  })

  return updatedRequest
}

/**
 * Validate request data based on type
 */
function validateRequestData(requestType: string, requestData: any) {
  switch (requestType) {
    case 'BUSINESS_INFO_CHANGE':
      if (!requestData.businessName && !requestData.businessLocation) {
        throw new Error('At least one of businessName or businessLocation is required')
      }
      if (requestData.businessName && requestData.businessName.length > 100) {
        throw new Error('Business name must be 100 characters or less')
      }
      if (requestData.businessLocation && requestData.businessLocation.length > 200) {
        throw new Error('Business location must be 200 characters or less')
      }
      break

    case 'SERVICE_AREA_CHANGE':
      if (!requestData.serviceAreas || !Array.isArray(requestData.serviceAreas)) {
        throw new Error('serviceAreas must be an array')
      }
      const validation = validateServiceAreas(requestData.serviceAreas)
      if (!validation.valid) {
        throw new Error(`Invalid service areas: ${validation.invalidAreas?.join(', ')}`)
      }
      break

    case 'PROPERTY_APPROVAL':
      if (!requestData.propertyId) {
        throw new Error('propertyId is required for property approval requests')
      }
      break

    case 'PROPERTY_EDIT_APPROVAL':
      if (!requestData.propertyId) {
        throw new Error('propertyId is required for property edit requests')
      }
      break

    case 'CONTACT_INFO_CHANGE':
      if (!requestData.phone && !requestData.email) {
        throw new Error('At least one of phone or email is required')
      }
      break

    default:
      throw new Error(`Unknown request type: ${requestType}`)
  }
}

/**
 * Apply changes based on request type
 */
async function applyRequestChanges(requestType: string, userId: string, requestData: any) {
  switch (requestType) {
    case 'BUSINESS_INFO_CHANGE':
      await prisma.user.update({
        where: { id: userId },
        data: {
          businessName: requestData.businessName || null,
          businessLocation: requestData.businessLocation || null,
        },
      })
      break

    case 'SERVICE_AREA_CHANGE':
      await prisma.user.update({
        where: { id: userId },
        data: {
          serviceAreas: requestData.serviceAreas || [],
        },
      })
      break

    case 'PROPERTY_APPROVAL':
      await prisma.property.update({
        where: { id: requestData.propertyId },
        data: {
          status: 'ACTIVE',
        },
      })
      break

    case 'PROPERTY_EDIT_APPROVAL':
      // Apply the property edits
      const { propertyId, ...updates } = requestData
      await prisma.property.update({
        where: { id: propertyId },
        data: updates,
      })
      break

    case 'CONTACT_INFO_CHANGE':
      const updateData: any = {}
      if (requestData.phone) updateData.phone = requestData.phone
      if (requestData.email) updateData.email = requestData.email

      await prisma.user.update({
        where: { id: userId },
        data: updateData,
      })
      break

    default:
      throw new Error(`Cannot apply changes for unknown request type: ${requestType}`)
  }
}
