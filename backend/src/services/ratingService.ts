import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface CreateRatingData {
  toUserId: string
  rating: number
  review?: string
  ratingType: 'OWNER' | 'TENANT'
  bookingId?: string
}

interface UpdateRatingData {
  rating?: number
  review?: string
}

export const ratingService = {
  // Get ratings for a user
  async getUserRatings(
    userId: string,
    filters?: {
      ratingType?: 'OWNER' | 'TENANT'
      page?: number
      limit?: number
    }
  ) {
    const page = filters?.page || 1
    const limit = filters?.limit || 10
    const skip = (page - 1) * limit

    const where = {
      toUserId: userId,
      ...(filters?.ratingType && { ratingType: filters.ratingType }),
    }

    const [ratings, total] = await Promise.all([
      prisma.userRating.findMany({
        where,
        include: {
          fromUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.userRating.count({ where }),
    ])

    return {
      ratings,
      total,
      pages: Math.ceil(total / limit),
    }
  },

  // Get rating statistics for a user
  async getUserRatingStats(userId: string) {
    const ratings = await prisma.userRating.findMany({
      where: { toUserId: userId },
      select: { rating: true, ratingType: true },
    })

    if (ratings.length === 0) {
      return {
        userId,
        averageRating: 0,
        totalRatings: 0,
      }
    }

    const ownerRatings = ratings.filter((r) => r.ratingType === 'OWNER')
    const tenantRatings = ratings.filter((r) => r.ratingType === 'TENANT')

    const averageRating =
      ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length

    const ownerAvg =
      ownerRatings.length > 0
        ? ownerRatings.reduce((sum, r) => sum + r.rating, 0) / ownerRatings.length
        : undefined

    const tenantAvg =
      tenantRatings.length > 0
        ? tenantRatings.reduce((sum, r) => sum + r.rating, 0) / tenantRatings.length
        : undefined

    return {
      userId,
      averageRating: Math.round(averageRating * 10) / 10,
      totalRatings: ratings.length,
      ...(ownerAvg !== undefined && {
        ownerRating: Math.round(ownerAvg * 10) / 10,
        ownerRatingsCount: ownerRatings.length,
      }),
      ...(tenantAvg !== undefined && {
        tenantRating: Math.round(tenantAvg * 10) / 10,
        tenantRatingsCount: tenantRatings.length,
      }),
    }
  },

  // Create a rating
  async createRating(fromUserId: string, data: CreateRatingData) {
    // Validate rating range
    if (data.rating < 1 || data.rating > 5) {
      throw new Error('Rating must be between 1 and 5')
    }

    // Prevent self-rating
    if (fromUserId === data.toUserId) {
      throw new Error('Cannot rate yourself')
    }

    // Validate review length
    if (data.review && data.review.length > 500) {
      throw new Error('Review must not exceed 500 characters')
    }

    // Check for existing rating
    let existing = null
    const bookingIdValue = data.bookingId || null
    try {
      existing = await prisma.userRating.findUnique({
        where: {
          fromUserId_toUserId_bookingId: {
            fromUserId,
            toUserId: data.toUserId,
            bookingId: bookingIdValue as any,
          },
        },
      })
    } catch (e) {
      // If bookingId query fails, ignore and proceed with creation
      existing = null
    }

    if (existing) {
      throw new Error('You have already rated this user for this booking')
    }

    return prisma.userRating.create({
      data: {
        fromUserId,
        toUserId: data.toUserId,
        rating: data.rating,
        review: data.review,
        ratingType: data.ratingType,
        ...(data.bookingId && { bookingId: data.bookingId }),
      },
    })
  },

  // Update a rating
  async updateRating(ratingId: string, fromUserId: string, data: UpdateRatingData) {
    // Check ownership
    const rating = await prisma.userRating.findUnique({
      where: { id: ratingId },
    })

    if (!rating) {
      throw new Error('Rating not found')
    }

    if (rating.fromUserId !== fromUserId) {
      throw new Error('You can only update your own ratings')
    }

    // Validate rating range
    if (data.rating && (data.rating < 1 || data.rating > 5)) {
      throw new Error('Rating must be between 1 and 5')
    }

    // Validate review length
    if (data.review && data.review.length > 500) {
      throw new Error('Review must not exceed 500 characters')
    }

    return prisma.userRating.update({
      where: { id: ratingId },
      data: {
        ...(data.rating !== undefined && { rating: data.rating }),
        ...(data.review !== undefined && { review: data.review }),
      },
    })
  },

  // Delete a rating
  async deleteRating(ratingId: string, fromUserId: string) {
    // Check ownership
    const rating = await prisma.userRating.findUnique({
      where: { id: ratingId },
    })

    if (!rating) {
      throw new Error('Rating not found')
    }

    if (rating.fromUserId !== fromUserId) {
      throw new Error('You can only delete your own ratings')
    }

    return prisma.userRating.delete({
      where: { id: ratingId },
    })
  },

  // Check if rating exists
  async checkExistingRating(fromUserId: string, toUserId: string, bookingId?: string) {
    return prisma.userRating.findUnique({
      where: {
        fromUserId_toUserId_bookingId: {
          fromUserId,
          toUserId,
          bookingId: (bookingId || null) as any,
        },
      },
    })
  },
}
