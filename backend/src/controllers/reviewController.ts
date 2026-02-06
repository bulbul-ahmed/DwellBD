import { Request, Response } from 'express'
import { prisma } from '../models'

export const createReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId
    const { propertyId, rating, comment } = req.body

    if (!propertyId || !rating) {
      res.status(400).json({ error: 'Property ID and rating are required' })
      return
    }

    if (rating < 1 || rating > 5) {
      res.status(400).json({ error: 'Rating must be between 1 and 5' })
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

    // Check if user already reviewed this property
    const existingReview = await prisma.review.findFirst({
      where: {
        userId,
        propertyId
      }
    })

    if (existingReview) {
      res.status(400).json({ error: 'You have already reviewed this property' })
      return
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        userId,
        propertyId,
        rating,
        comment: comment || ''
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    })

    res.status(201).json({
      message: 'Review created successfully',
      review
    })
  } catch (error) {
    console.error('Create review error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const getPropertyReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { propertyId } = req.params
    const { limit = 10, page = 1 } = req.query

    if (!propertyId) {
      res.status(400).json({ error: 'Property ID is required' })
      return
    }

    const skip = ((parseInt(page as string) || 1) - 1) * parseInt(limit as string || '10')

    // Check if property exists
    const property = await prisma.property.findUnique({
      where: { id: propertyId }
    })

    if (!property) {
      res.status(404).json({ error: 'Property not found' })
      return
    }

    const reviews = await prisma.review.findMany({
      where: { propertyId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string || '10'),
      skip
    })

    const total = await prisma.review.count({
      where: { propertyId }
    })

    // Calculate average rating
    const avgRating = await prisma.review.aggregate({
      where: { propertyId },
      _avg: { rating: true }
    })

    res.json({
      reviews,
      total,
      averageRating: avgRating._avg.rating || 0,
      page: parseInt(page as string) || 1,
      limit: parseInt(limit as string || '10')
    })
  } catch (error) {
    console.error('Get reviews error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const getUserReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId
    const { limit = 10, page = 1 } = req.query

    const skip = ((parseInt(page as string) || 1) - 1) * parseInt(limit as string || '10')

    const reviews = await prisma.review.findMany({
      where: { userId },
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

    const total = await prisma.review.count({
      where: { userId }
    })

    res.json({
      reviews,
      total,
      page: parseInt(page as string) || 1,
      limit: parseInt(limit as string || '10')
    })
  } catch (error) {
    console.error('Get user reviews error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const updateReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId
    const { reviewId } = req.params
    const { rating, comment } = req.body

    if (!reviewId) {
      res.status(400).json({ error: 'Review ID is required' })
      return
    }

    // Get existing review
    const review = await prisma.review.findUnique({
      where: { id: reviewId }
    })

    if (!review) {
      res.status(404).json({ error: 'Review not found' })
      return
    }

    // Check if user owns this review
    if (review.userId !== userId) {
      res.status(403).json({ error: 'Unauthorized' })
      return
    }

    // Validate rating if provided
    if (rating && (rating < 1 || rating > 5)) {
      res.status(400).json({ error: 'Rating must be between 1 and 5' })
      return
    }

    // Update review
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        rating: rating || review.rating,
        comment: comment !== undefined ? comment : review.comment
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    })

    res.json({
      message: 'Review updated successfully',
      review: updatedReview
    })
  } catch (error) {
    console.error('Update review error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const deleteReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId
    const { reviewId } = req.params

    if (!reviewId) {
      res.status(400).json({ error: 'Review ID is required' })
      return
    }

    // Get existing review
    const review = await prisma.review.findUnique({
      where: { id: reviewId }
    })

    if (!review) {
      res.status(404).json({ error: 'Review not found' })
      return
    }

    // Check if user owns this review
    if (review.userId !== userId) {
      res.status(403).json({ error: 'Unauthorized' })
      return
    }

    // Delete review
    await prisma.review.delete({
      where: { id: reviewId }
    })

    res.json({ message: 'Review deleted successfully' })
  } catch (error) {
    console.error('Delete review error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
