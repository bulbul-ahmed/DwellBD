import { Request, Response } from 'express'
import {
  createProperty,
  getPropertyById,
  getPropertiesByOwner,
  searchProperties,
  updateProperty,
  deleteProperty,
  recordPropertyView,
  getPropertyStats as getPropertyStatsService,
} from '../services/propertyService'
import { uploadFileToS3 } from '../utils/s3'

export async function createNewProperty(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    const {
      title,
      description,
      propertyType,
      address,
      area,
      rentAmount,
      bedrooms,
      bathrooms,
      images,
      amenities,
    } = req.body

    // Validate required fields
    if (!title || !propertyType || !address || !area || rentAmount === undefined) {
      res.status(400).json({
        error: 'Validation error',
        message: 'title, propertyType, address, area, and rentAmount are required',
      })
      return
    }

    const data: any = {
      title,
      description,
      propertyType,
      address,
      area,
      rentAmount: parseFloat(rentAmount),
      images: images || [],
      amenities: Array.isArray(amenities) ? amenities : [],
    }

    if (bedrooms) data.bedrooms = parseInt(bedrooms)
    if (bathrooms) data.bathrooms = parseInt(bathrooms)

    const property = await createProperty(req.user.userId, data)

    res.status(201).json({
      message: 'Property created successfully',
      property,
    })
  } catch (error) {
    console.error('Create property error:', error)
    res.status(500).json({
      error: 'Failed to create property',
      message: error instanceof Error ? error.message : 'An error occurred',
    })
  }
}

export async function getProperty(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params as { id: string }

    const property = await getPropertyById(id)
    if (!property) {
      res.status(404).json({
        error: 'Not found',
        message: 'Property not found',
      })
      return
    }

    // Record view
    await recordPropertyView(id, req.user?.userId || undefined)

    res.status(200).json({ property })
  } catch (error) {
    console.error('Get property error:', error)
    res.status(500).json({
      error: 'Failed to fetch property',
      message: error instanceof Error ? error.message : 'An error occurred',
    })
  }
}

export async function getMyProperties(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    const page = req.query.page ? parseInt(req.query.page as string) : 1
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10

    const result = await getPropertiesByOwner(req.user.userId, { page, limit })

    res.status(200).json(result)
  } catch (error) {
    console.error('Get my properties error:', error)
    res.status(500).json({
      error: 'Failed to fetch properties',
      message: error instanceof Error ? error.message : 'An error occurred',
    })
  }
}

export async function searchAllProperties(req: Request, res: Response): Promise<void> {
  try {
    const {
      q,
      area,
      minPrice,
      maxPrice,
      propertyType,
      bedrooms,
      furnished,
      listingType,
      sortBy,
      order,
      page,
      limit,
    } = req.query

    const filters: any = {}
    if (q) filters.q = q as string
    if (area) filters.area = area as string
    if (minPrice) filters.minPrice = parseFloat(minPrice as string)
    if (maxPrice) filters.maxPrice = parseFloat(maxPrice as string)
    if (propertyType) filters.propertyType = propertyType as string
    if (bedrooms) filters.bedrooms = parseInt(bedrooms as string)
    if (furnished) filters.furnished = furnished as string
    if (listingType) filters.listingType = listingType as string
    if (sortBy) filters.sortBy = sortBy as string
    if (order) filters.order = order as 'asc' | 'desc'

    const options = {
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 20,
    }

    const result = await searchProperties(filters, options)

    res.status(200).json(result)
  } catch (error) {
    console.error('Search properties error:', error)
    res.status(500).json({
      error: 'Failed to search properties',
      message: error instanceof Error ? error.message : 'An error occurred',
    })
  }
}

export async function updatePropertyData(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    const { id } = req.params as { id: string }
    const { title, description, address, area, rentAmount, bedrooms, bathrooms, amenities } =
      req.body

    const updateData: any = {}
    if (title) updateData.title = title
    if (description) updateData.description = description
    if (address) updateData.address = address
    if (area) updateData.area = area
    if (rentAmount) updateData.rentAmount = parseFloat(rentAmount)
    if (bedrooms) updateData.bedrooms = parseInt(bedrooms)
    if (bathrooms) updateData.bathrooms = parseInt(bathrooms)
    if (amenities) updateData.amenities = amenities

    const property = await updateProperty(id, req.user.userId, updateData)

    res.status(200).json({
      message: 'Property updated successfully',
      property,
    })
  } catch (error) {
    console.error('Update property error:', error)
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      res.status(403).json({ error: 'Forbidden', message: error.message })
    } else {
      res.status(500).json({
        error: 'Failed to update property',
        message: error instanceof Error ? error.message : 'An error occurred',
      })
    }
  }
}

export async function deletePropertyData(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    const { id } = req.params as { id: string }

    await deleteProperty(id, req.user.userId)

    res.status(200).json({
      message: 'Property deleted successfully',
    })
  } catch (error) {
    console.error('Delete property error:', error)
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      res.status(403).json({ error: 'Forbidden', message: error.message })
    } else {
      res.status(500).json({
        error: 'Failed to delete property',
        message: error instanceof Error ? error.message : 'An error occurred',
      })
    }
  }
}

export async function uploadPropertyImages(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    if (!req.files || req.files.length === 0) {
      res.status(400).json({
        error: 'Validation error',
        message: 'No images provided',
      })
      return
    }

    const uploadedUrls: string[] = []

    for (const file of req.files as Express.Multer.File[]) {
      const url = await uploadFileToS3(file, `properties/${req.user.userId}`)
      uploadedUrls.push(url)
    }

    res.status(200).json({
      message: 'Images uploaded successfully',
      urls: uploadedUrls,
    })
  } catch (error) {
    console.error('Upload images error:', error)
    res.status(500).json({
      error: 'Failed to upload images',
      message: error instanceof Error ? error.message : 'An error occurred',
    })
  }
}

export async function getPropertyStatsHandler(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params as { id: string }

    const stats = await getPropertyStatsService(id)

    res.status(200).json({ stats })
  } catch (error) {
    console.error('Get stats error:', error)
    res.status(500).json({
      error: 'Failed to fetch stats',
      message: error instanceof Error ? error.message : 'An error occurred',
    })
  }
}
