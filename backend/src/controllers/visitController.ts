import { Request, Response } from 'express'
import { prisma } from '../models'

// Helper function to get time slots
const getTimeSlots = (): string[] => {
  const slots: string[] = []
  for (let hour = 9; hour < 18; hour++) {
    const hourStr = hour.toString().padStart(2, '0')
    slots.push(`${hourStr}:00`)
    slots.push(`${hourStr}:30`)
  }
  return slots
}

// Helper function to validate business hours
const isValidBusinessHour = (time: string): boolean => {
  const timeMatch = time.match(/^(\d{2}):(\d{2})$/)
  if (!timeMatch || !timeMatch[1] || !timeMatch[2]) return false

  const hours = parseInt(timeMatch[1]!)
  const minutes = parseInt(timeMatch[2]!)

  return hours >= 9 && hours < 18 && minutes % 30 === 0
}

// Helper function to validate date range (future, within 30 days)
const isValidDateRange = (date: Date): { valid: boolean; error?: string } => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (date < today) {
    return { valid: false, error: 'Visit date must be in the future' }
  }

  const maxDate = new Date()
  maxDate.setDate(maxDate.getDate() + 30)

  if (date > maxDate) {
    return { valid: false, error: 'Visit date must be within 30 days' }
  }

  return { valid: true }
}

// 1. Create Visit Request
export const createVisitRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const tenantId = (req as any).user?.userId
    if (!tenantId) {
      res.status(401).json({ error: 'User not authenticated' })
      return
    }

    const { propertyId, requestedDate, requestedTime, tenantNote } = req.body

    // Validation
    if (!propertyId || !requestedDate || !requestedTime) {
      res.status(400).json({ error: 'Property, date, and time are required' })
      return
    }

    // Check property exists and is ACTIVE
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { id: true, ownerId: true, status: true, title: true }
    })

    if (!property) {
      res.status(404).json({ error: 'Property not found' })
      return
    }

    if (property.status !== 'ACTIVE') {
      res.status(400).json({ error: 'Property is not available for visits' })
      return
    }

    // Prevent self-requests
    if (property.ownerId === tenantId) {
      res.status(400).json({ error: 'Cannot request visit to your own property' })
      return
    }

    // Validate date
    const visitDate = new Date(requestedDate)
    const dateValidation = isValidDateRange(visitDate)
    if (!dateValidation.valid) {
      res.status(400).json({ error: dateValidation.error })
      return
    }

    // Validate time
    if (!isValidBusinessHour(requestedTime)) {
      res.status(400).json({
        error: 'Visit time must be between 9:00 AM and 6:00 PM in 30-minute intervals'
      })
      return
    }

    // Check for duplicate pending request
    const existingRequest = await prisma.visitRequest.findFirst({
      where: {
        propertyId,
        tenantId,
        status: { in: ['PENDING', 'CONFIRMED', 'PENDING_ALTERNATIVE'] }
      }
    })

    if (existingRequest) {
      res.status(409).json({
        error: 'You already have a pending or confirmed visit request for this property'
      })
      return
    }

    // Create visit request
    const visitRequest = await prisma.visitRequest.create({
      data: {
        propertyId,
        tenantId,
        ownerId: property.ownerId,
        requestedDate: visitDate,
        requestedTime,
        tenantNote: tenantNote || null,
        status: 'PENDING'
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            area: true,
            images: true,
            coverImage: true
          }
        },
        tenant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        }
      }
    })

    res.status(201).json({
      message: 'Visit request sent successfully',
      visitRequest
    })
  } catch (error: any) {
    console.error('Create visit request error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// 2. Get Tenant Visit Requests
export const getTenantVisitRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const tenantId = (req as any).user?.userId
    if (!tenantId) {
      res.status(401).json({ error: 'User not authenticated' })
      return
    }

    const { status } = req.query

    const where: any = { tenantId }
    if (status) {
      where.status = status
    }

    const visits = await prisma.visitRequest.findMany({
      where,
      include: {
        property: {
          select: {
            id: true,
            title: true,
            area: true,
            images: true,
            coverImage: true
          }
        },
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    res.json(visits)
  } catch (error: any) {
    console.error('Get tenant visits error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// 3. Get Owner Visit Requests
export const getOwnerVisitRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const ownerId = (req as any).user?.userId
    if (!ownerId) {
      res.status(401).json({ error: 'User not authenticated' })
      return
    }

    const { status } = req.query

    const where: any = { ownerId }
    if (status) {
      where.status = status
    }

    const visits = await prisma.visitRequest.findMany({
      where,
      include: {
        property: {
          select: {
            id: true,
            title: true,
            area: true,
            images: true,
            coverImage: true
          }
        },
        tenant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    res.json(visits)
  } catch (error: any) {
    console.error('Get owner visits error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// 4. Get Visit Request By ID
export const getVisitRequestById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' })
      return
    }

    const { visitId } = req.params

    if (!visitId) {
      res.status(400).json({ error: 'Visit ID is required' })
      return
    }

    const visit = await prisma.visitRequest.findUnique({
      where: { id: visitId },
      include: {
        property: true,
        tenant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        }
      }
    })

    if (!visit) {
      res.status(404).json({ error: 'Visit request not found' })
      return
    }

    // Authorization check
    if (visit.tenantId !== userId && visit.ownerId !== userId) {
      res.status(403).json({ error: 'Unauthorized' })
      return
    }

    res.json(visit)
  } catch (error: any) {
    console.error('Get visit error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// 5. Confirm Visit Request
export const confirmVisitRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const ownerId = (req as any).user?.userId
    if (!ownerId) {
      res.status(401).json({ error: 'User not authenticated' })
      return
    }

    const { visitId } = req.params
    const { confirmedDate, confirmedTime, ownerNote } = req.body

    // Validation
    if (!confirmedDate || !confirmedTime) {
      res.status(400).json({ error: 'Confirmed date and time are required' })
      return
    }

    // Get visit request
    const visitRequest = await prisma.visitRequest.findUnique({
      where: { id: visitId! }
    })

    if (!visitRequest) {
      res.status(404).json({ error: 'Visit request not found' })
      return
    }

    // Authorization
    if (visitRequest.ownerId !== ownerId) {
      res.status(403).json({ error: 'Unauthorized' })
      return
    }

    // Check status
    if (!['PENDING', 'PENDING_ALTERNATIVE'].includes(visitRequest.status)) {
      res.status(400).json({ error: 'Visit request cannot be confirmed in current status' })
      return
    }

    // Validate business hours
    if (!isValidBusinessHour(confirmedTime)) {
      res.status(400).json({
        error: 'Visit time must be between 9:00 AM and 6:00 PM in 30-minute intervals'
      })
      return
    }

    // CRITICAL: Check for double-booking
    const confirmedDateObj = new Date(confirmedDate)
    const conflictingVisit = await prisma.visitRequest.findFirst({
      where: {
        propertyId: visitRequest.propertyId,
        status: 'CONFIRMED',
        confirmedDate: confirmedDateObj,
        confirmedTime: confirmedTime,
        id: { not: visitId! }
      }
    })

    if (conflictingVisit) {
      res.status(409).json({
        error: 'This time slot is already booked for another visit'
      })
      return
    }

    // Update visit request
    const updatedVisit = await prisma.visitRequest.update({
      where: { id: visitId! },
      data: {
        confirmedDate: confirmedDateObj,
        confirmedTime,
        ownerNote: ownerNote || null,
        status: 'CONFIRMED',
        suggestedDate: null,
        suggestedTime: null
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            area: true,
            images: true
          }
        },
        tenant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        }
      }
    })

    res.json({
      message: 'Visit request confirmed successfully',
      visitRequest: updatedVisit
    })
  } catch (error: any) {
    console.error('Confirm visit error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// 6. Reject Visit Request
export const rejectVisitRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const ownerId = (req as any).user?.userId
    if (!ownerId) {
      res.status(401).json({ error: 'User not authenticated' })
      return
    }

    const { visitId } = req.params
    const { rejectionReason } = req.body

    // Get visit request
    const visitRequest = await prisma.visitRequest.findUnique({
      where: { id: visitId! }
    })

    if (!visitRequest) {
      res.status(404).json({ error: 'Visit request not found' })
      return
    }

    // Authorization
    if (visitRequest.ownerId !== ownerId) {
      res.status(403).json({ error: 'Unauthorized' })
      return
    }

    // Check status
    if (visitRequest.status !== 'PENDING') {
      res.status(400).json({ error: 'Only pending requests can be rejected' })
      return
    }

    // Update visit request
    const updatedVisit = await prisma.visitRequest.update({
      where: { id: visitId! },
      data: {
        status: 'REJECTED',
        rejectionReason: rejectionReason || null
      },
      include: {
        property: {
          select: { id: true, title: true }
        },
        tenant: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    })

    res.json({
      message: 'Visit request rejected successfully',
      visitRequest: updatedVisit
    })
  } catch (error: any) {
    console.error('Reject visit error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// 7. Suggest Alternative Date
export const suggestAlternativeDate = async (req: Request, res: Response): Promise<void> => {
  try {
    const ownerId = (req as any).user?.userId
    if (!ownerId) {
      res.status(401).json({ error: 'User not authenticated' })
      return
    }

    const { visitId } = req.params
    const { suggestedDate, suggestedTime } = req.body

    // Validation
    if (!suggestedDate || !suggestedTime) {
      res.status(400).json({ error: 'Suggested date and time are required' })
      return
    }

    // Get visit request
    const visitRequest = await prisma.visitRequest.findUnique({
      where: { id: visitId! }
    })

    if (!visitRequest) {
      res.status(404).json({ error: 'Visit request not found' })
      return
    }

    // Authorization
    if (visitRequest.ownerId !== ownerId) {
      res.status(403).json({ error: 'Unauthorized' })
      return
    }

    // Validate business hours
    if (!isValidBusinessHour(suggestedTime)) {
      res.status(400).json({
        error: 'Visit time must be between 9:00 AM and 6:00 PM in 30-minute intervals'
      })
      return
    }

    // Update visit request
    const updatedVisit = await prisma.visitRequest.update({
      where: { id: visitId! },
      data: {
        suggestedDate: new Date(suggestedDate),
        suggestedTime,
        status: 'PENDING_ALTERNATIVE'
      },
      include: {
        property: { select: { id: true, title: true } },
        tenant: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    })

    res.json({
      message: 'Alternative date suggested successfully',
      visitRequest: updatedVisit
    })
  } catch (error: any) {
    console.error('Suggest alternative error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// 8. Cancel Visit Request
export const cancelVisitRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const tenantId = (req as any).user?.userId
    if (!tenantId) {
      res.status(401).json({ error: 'User not authenticated' })
      return
    }

    const { visitId } = req.params

    // Get visit request
    const visitRequest = await prisma.visitRequest.findUnique({
      where: { id: visitId! }
    })

    if (!visitRequest) {
      res.status(404).json({ error: 'Visit request not found' })
      return
    }

    // Authorization
    if (visitRequest.tenantId !== tenantId) {
      res.status(403).json({ error: 'Unauthorized' })
      return
    }

    // Check status
    if (!['PENDING', 'PENDING_ALTERNATIVE'].includes(visitRequest.status)) {
      res.status(400).json({ error: 'Only pending requests can be cancelled' })
      return
    }

    // Update visit request
    const updatedVisit = await prisma.visitRequest.update({
      where: { id: visitId! },
      data: { status: 'CANCELLED' }
    })

    res.status(204).send()
  } catch (error: any) {
    console.error('Cancel visit error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// 9. Mark Visit Completed
export const markVisitCompleted = async (req: Request, res: Response): Promise<void> => {
  try {
    const ownerId = (req as any).user?.userId
    if (!ownerId) {
      res.status(401).json({ error: 'User not authenticated' })
      return
    }

    const { visitId } = req.params

    // Get visit request
    const visitRequest = await prisma.visitRequest.findUnique({
      where: { id: visitId! }
    })

    if (!visitRequest) {
      res.status(404).json({ error: 'Visit request not found' })
      return
    }

    // Authorization
    if (visitRequest.ownerId !== ownerId) {
      res.status(403).json({ error: 'Unauthorized' })
      return
    }

    // Check status
    if (visitRequest.status !== 'CONFIRMED') {
      res.status(400).json({ error: 'Only confirmed visits can be marked as completed' })
      return
    }

    // Check if date has passed
    const confirmedDate = visitRequest.confirmedDate
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (confirmedDate! > today) {
      res.status(400).json({ error: 'Can only mark visit as completed after the visit date' })
      return
    }

    // Update visit request
    const updatedVisit = await prisma.visitRequest.update({
      where: { id: visitId! },
      data: {
        status: 'COMPLETED',
        completedAt: new Date()
      },
      include: {
        property: { select: { id: true, title: true } },
        tenant: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    })

    res.json({
      message: 'Visit marked as completed successfully',
      visitRequest: updatedVisit
    })
  } catch (error: any) {
    console.error('Mark completed error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// 10. Check Time Slot Availability
export const checkTimeSlotAvailability = async (req: Request, res: Response): Promise<void> => {
  try {
    const { propertyId } = req.params
    const { date, time } = req.query

    if (!propertyId || !date || !time) {
      res.status(400).json({ error: 'Property ID, date, and time are required' })
      return
    }

    const confirmedVisit = await prisma.visitRequest.findFirst({
      where: {
        propertyId: propertyId as string,
        status: 'CONFIRMED',
        confirmedDate: new Date(date as string),
        confirmedTime: time as string
      }
    })

    res.json({
      available: !confirmedVisit
    })
  } catch (error: any) {
    console.error('Check availability error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
