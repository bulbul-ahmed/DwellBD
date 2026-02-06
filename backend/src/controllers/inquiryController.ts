import { Request, Response } from 'express'
import { prisma } from '../models'

export const createInquiry = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId || null
    const { propertyId, name, email, phone, message } = req.body

    if (!propertyId || !name || !email || !phone || !message) {
      res.status(400).json({ error: 'All fields are required' })
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

    // Create inquiry
    const inquiry = await prisma.inquiry.create({
      data: {
        userId: userId || null,
        propertyId,
        name,
        email,
        phone,
        message,
        status: 'PENDING'
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            owner: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      }
    })

    res.status(201).json({
      message: 'Inquiry sent successfully',
      inquiry
    })
  } catch (error) {
    console.error('Create inquiry error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const getUserInquiries = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId
    const { limit = 10, page = 1, status } = req.query

    const skip = ((parseInt(page as string) || 1) - 1) * parseInt(limit as string || '10')

    const where: any = { userId }
    if (status) {
      where.status = status
    }

    const inquiries = await prisma.inquiry.findMany({
      where,
      include: {
        property: {
          select: {
            id: true,
            title: true,
            type: true,
            area: true,
            coverImage: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string || '10'),
      skip
    })

    const total = await prisma.inquiry.count({ where })

    res.json({
      inquiries,
      total,
      page: parseInt(page as string) || 1,
      limit: parseInt(limit as string || '10')
    })
  } catch (error) {
    console.error('Get inquiries error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const getInquiryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId
    const { inquiryId } = req.params

    if (!inquiryId) {
      res.status(400).json({ error: 'Inquiry ID is required' })
      return
    }

    const inquiry = await prisma.inquiry.findUnique({
      where: { id: inquiryId },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            type: true,
            area: true,
            coverImage: true,
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

    if (!inquiry) {
      res.status(404).json({ error: 'Inquiry not found' })
      return
    }

    // Check if user owns this inquiry (if inquiry has a user)
    if (inquiry.userId && inquiry.userId !== userId) {
      res.status(403).json({ error: 'Unauthorized' })
      return
    }

    res.json(inquiry)
  } catch (error) {
    console.error('Get inquiry error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const updateInquiryStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId
    const { inquiryId } = req.params
    const { status } = req.body

    if (!inquiryId) {
      res.status(400).json({ error: 'Inquiry ID is required' })
      return
    }

    if (!status) {
      res.status(400).json({ error: 'Status is required' })
      return
    }

    const validStatuses = ['PENDING', 'RESPONDED', 'CLOSED']
    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: 'Invalid status' })
      return
    }

    // Get existing inquiry
    const inquiry = await prisma.inquiry.findUnique({
      where: { id: inquiryId }
    })

    if (!inquiry) {
      res.status(404).json({ error: 'Inquiry not found' })
      return
    }

    // Check if user owns this inquiry (if inquiry has a user)
    if (!inquiry.userId || inquiry.userId !== userId) {
      res.status(403).json({ error: 'Unauthorized' })
      return
    }

    // Update inquiry
    const updatedInquiry = await prisma.inquiry.update({
      where: { id: inquiryId },
      data: { status }
    })

    res.json({
      message: 'Inquiry status updated successfully',
      inquiry: updatedInquiry
    })
  } catch (error) {
    console.error('Update inquiry error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const deleteInquiry = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId
    const { inquiryId } = req.params

    if (!inquiryId) {
      res.status(400).json({ error: 'Inquiry ID is required' })
      return
    }

    // Get existing inquiry
    const inquiry = await prisma.inquiry.findUnique({
      where: { id: inquiryId }
    })

    if (!inquiry) {
      res.status(404).json({ error: 'Inquiry not found' })
      return
    }

    // Check if user owns this inquiry (if inquiry has a user)
    if (!inquiry.userId || inquiry.userId !== userId) {
      res.status(403).json({ error: 'Unauthorized' })
      return
    }

    // Delete inquiry
    await prisma.inquiry.delete({
      where: { id: inquiryId }
    })

    res.json({ message: 'Inquiry deleted successfully' })
  } catch (error) {
    console.error('Delete inquiry error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
