import { Request, Response } from 'express'
import { ratingService } from '../services/ratingService'

// Get ratings for a user
export const getUserRatings = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params
    const { ratingType, page, limit } = req.query

    const filters = {
      ratingType: ratingType as 'OWNER' | 'TENANT' | undefined,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    }

    const result = await ratingService.getUserRatings(userId!, filters)
    return res.json(result)
  } catch (error: any) {
    console.error('Error fetching ratings:', error)
    return res.status(500).json({ error: error.message || 'Failed to fetch ratings' })
  }
}

// Get rating statistics for a user
export const getUserRatingStats = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params
    const stats = await ratingService.getUserRatingStats(userId!)
    return res.json(stats)
  } catch (error: any) {
    console.error('Error fetching rating stats:', error)
    return res.status(500).json({ error: error.message || 'Failed to fetch rating stats' })
  }
}

// Create a rating
export const createRating = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' })
    }

    const { toUserId, rating, review, ratingType, bookingId } = req.body

    // Validation
    if (!toUserId) {
      return res.status(400).json({ error: 'toUserId is required' })
    }
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' })
    }
    if (!ratingType || !['OWNER', 'TENANT'].includes(ratingType)) {
      return res.status(400).json({ error: 'Invalid ratingType' })
    }

    const newRating = await ratingService.createRating(userId, {
      toUserId,
      rating,
      review,
      ratingType,
      bookingId,
    })

    return res.status(201).json(newRating)
  } catch (error: any) {
    console.error('Error creating rating:', error)

    if (error.message.includes('already rated')) {
      return res.status(409).json({ error: error.message })
    }
    if (error.message.includes('Cannot rate yourself')) {
      return res.status(400).json({ error: error.message })
    }

    return res.status(500).json({ error: error.message || 'Failed to create rating' })
  }
}

// Check existing rating
export const checkExistingRating = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' })
    }

    const { toUserId, bookingId } = req.query

    if (!toUserId) {
      return res.status(400).json({ error: 'toUserId is required' })
    }

    const rating = await ratingService.checkExistingRating(
      userId,
      toUserId as string,
      bookingId ? (bookingId as string) : undefined
    )

    return res.json(rating)
  } catch (error: any) {
    console.error('Error checking existing rating:', error)
    return res.status(500).json({ error: error.message || 'Failed to check rating' })
  }
}

// Update a rating
export const updateRating = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' })
    }

    const { ratingId } = req.params
    const { rating, review } = req.body

    const updatedRating = await ratingService.updateRating(ratingId!, userId, {
      rating,
      review,
    })

    return res.json(updatedRating)
  } catch (error: any) {
    console.error('Error updating rating:', error)

    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message })
    }
    if (error.message.includes('only update your own')) {
      return res.status(403).json({ error: error.message })
    }

    return res.status(500).json({ error: error.message || 'Failed to update rating' })
  }
}

// Delete a rating
export const deleteRating = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' })
    }

    const { ratingId } = req.params

    await ratingService.deleteRating(ratingId!, userId)
    return res.status(204).send()
  } catch (error: any) {
    console.error('Error deleting rating:', error)

    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message })
    }
    if (error.message.includes('only delete your own')) {
      return res.status(403).json({ error: error.message })
    }

    return res.status(500).json({ error: error.message || 'Failed to delete rating' })
  }
}
