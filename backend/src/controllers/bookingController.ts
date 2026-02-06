import { Request, Response } from 'express'
import { prisma } from '../models'

export const createBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId
    const { propertyId, checkIn, checkOut } = req.body

    if (!propertyId || !checkIn || !checkOut) {
      res.status(400).json({ error: 'Property ID, check-in and check-out dates are required' })
      return
    }

    // Validate dates
    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)

    if (checkInDate >= checkOutDate) {
      res.status(400).json({ error: 'Check-out date must be after check-in date' })
      return
    }

    // Check if property exists
    const property = await prisma.property.findUnique({
      where: { id: propertyId }
    })

    if (!property) {
      res.status(404).json({ error: 'Property not found' })
      return
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        userId,
        propertyId,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        status: 'PENDING'
      },
      include: {
        property: {
          include: {
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
        }
      }
    })

    res.status(201).json({
      message: 'Booking created successfully',
      booking
    })
  } catch (error) {
    console.error('Create booking error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const getUserBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId
    const { limit = 10, page = 1, status } = req.query

    const skip = ((parseInt(page as string) || 1) - 1) * parseInt(limit as string || '10')

    const where: any = { userId }
    if (status) {
      where.status = status
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        property: {
          select: {
            id: true,
            title: true,
            type: true,
            area: true,
            rentAmount: true,
            coverImage: true,
            owner: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string || '10'),
      skip
    })

    const total = await prisma.booking.count({ where })

    res.json({
      bookings,
      total,
      page: parseInt(page as string) || 1,
      limit: parseInt(limit as string || '10')
    })
  } catch (error) {
    console.error('Get bookings error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const getBookingById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId
    const { bookingId } = req.params

    if (!bookingId) {
      res.status(400).json({ error: 'Booking ID is required' })
      return
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        property: {
          include: {
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
        }
      }
    })

    if (!booking) {
      res.status(404).json({ error: 'Booking not found' })
      return
    }

    // Check if user owns this booking
    if (booking.userId !== userId) {
      res.status(403).json({ error: 'Unauthorized' })
      return
    }

    res.json(booking)
  } catch (error) {
    console.error('Get booking error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const updateBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId
    const { bookingId } = req.params
    const { status, checkIn, checkOut } = req.body

    if (!bookingId) {
      res.status(400).json({ error: 'Booking ID is required' })
      return
    }

    // Get existing booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    })

    if (!booking) {
      res.status(404).json({ error: 'Booking not found' })
      return
    }

    // Check if user owns this booking
    if (booking.userId !== userId) {
      res.status(403).json({ error: 'Unauthorized' })
      return
    }

    // Prepare update data
    const updateData: any = {}
    if (status) updateData.status = status
    if (checkIn) {
      const checkInDate = new Date(checkIn)
      const checkOutDate = new Date(checkOut || booking.checkOut)
      if (checkInDate >= checkOutDate) {
        res.status(400).json({ error: 'Check-out date must be after check-in date' })
        return
      }
      updateData.checkIn = checkInDate
    }
    if (checkOut) {
      const checkInDate = new Date(checkIn || booking.checkIn)
      const checkOutDate = new Date(checkOut)
      if (checkInDate >= checkOutDate) {
        res.status(400).json({ error: 'Check-out date must be after check-in date' })
        return
      }
      updateData.checkOut = checkOutDate
    }

    // Update booking
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: updateData,
      include: {
        property: {
          select: {
            id: true,
            title: true,
            type: true,
            area: true,
            rentAmount: true
          }
        }
      }
    })

    res.json({
      message: 'Booking updated successfully',
      booking: updatedBooking
    })
  } catch (error) {
    console.error('Update booking error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const cancelBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId
    const { bookingId } = req.params

    if (!bookingId) {
      res.status(400).json({ error: 'Booking ID is required' })
      return
    }

    // Get existing booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    })

    if (!booking) {
      res.status(404).json({ error: 'Booking not found' })
      return
    }

    // Check if user owns this booking
    if (booking.userId !== userId) {
      res.status(403).json({ error: 'Unauthorized' })
      return
    }

    // Update status to CANCELLED
    const cancelledBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CANCELLED' }
    })

    res.json({
      message: 'Booking cancelled successfully',
      booking: cancelledBooking
    })
  } catch (error) {
    console.error('Cancel booking error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
