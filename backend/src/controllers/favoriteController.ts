import { Request, Response } from 'express'
import { prisma } from '../models'

export const addFavorite = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId
    const { propertyId } = req.body

    if (!propertyId) {
      res.status(400).json({ error: 'Property ID is required' })
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

    // Check if already favorited
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_propertyId: {
          userId,
          propertyId
        }
      }
    })

    if (existingFavorite) {
      res.status(400).json({ error: 'Already added to favorites' })
      return
    }

    // Add to favorites
    const favorite = await prisma.favorite.create({
      data: {
        userId,
        propertyId
      }
    })

    res.status(201).json({
      message: 'Added to favorites',
      favorite
    })
  } catch (error) {
    console.error('Add favorite error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const removeFavorite = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId
    const { propertyId } = req.params

    if (!propertyId) {
      res.status(400).json({ error: 'Property ID is required' })
      return
    }

    // Remove from favorites
    await prisma.favorite.delete({
      where: {
        userId_propertyId: {
          userId,
          propertyId
        }
      }
    })

    res.json({ message: 'Removed from favorites' })
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Favorite not found' })
      return
    }
    console.error('Remove favorite error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const getUserFavorites = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId
    const { limit = 10, page = 1 } = req.query

    const skip = ((parseInt(page as string) || 1) - 1) * parseInt(limit as string || '10')

    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        property: {
          include: {
            owner: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true
              }
            },
            _count: {
              select: { favorites: true }
            }
          }
        }
      },
      take: parseInt(limit as string || '10'),
      skip
    })

    const total = await prisma.favorite.count({
      where: { userId }
    })

    res.json({
      favorites: favorites.map(f => f.property),
      total,
      page: parseInt(page as string) || 1,
      limit: parseInt(limit as string || '10')
    })
  } catch (error) {
    console.error('Get favorites error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const checkFavorite = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId
    const { propertyId } = req.params

    if (!propertyId) {
      res.status(400).json({ error: 'Property ID is required' })
      return
    }

    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_propertyId: {
          userId,
          propertyId
        }
      }
    })

    res.json({ isFavorite: !!favorite })
  } catch (error) {
    console.error('Check favorite error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
