import { prisma, CreatePropertyInput, PropertyStatus, PropertyType } from '../models'

interface SearchFilters {
  q?: string
  area?: string
  minPrice?: number
  maxPrice?: number
  propertyType?: PropertyType
  bedrooms?: number
  furnished?: string
  listingType?: string
  sortBy?: 'createdAt' | 'rentAmount' | 'bedrooms'
  order?: 'asc' | 'desc'
}

interface PaginationOptions {
  page?: number
  limit?: number
}

function buildOrderBy(sortBy?: string, order?: 'asc' | 'desc') {
  const sortOrder = order || 'desc'
  switch (sortBy) {
    case 'rentAmount':
      return { rentAmount: sortOrder }
    case 'bedrooms':
      return { bedrooms: sortOrder }
    case 'createdAt':
    default:
      return { createdAt: sortOrder }
  }
}

export async function createProperty(ownerId: string, data: CreatePropertyInput) {
  return prisma.property.create({
    data: {
      ...data,
      ownerId,
      status: 'PENDING' as PropertyStatus,
    },
    include: {
      owner: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true,
        },
      },
    },
  })
}

export async function getPropertyById(id: string) {
  return prisma.property.findUnique({
    where: { id },
    include: {
      owner: {
        select: {
          id: true,
          email: true,
          phone: true,
          firstName: true,
          lastName: true,
          avatar: true,
          isVerified: true,
        },
      },
      reviews: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
      },
      _count: {
        select: {
          favorites: true,
          inquiries: true,
          reviews: true,
          propertyViews: true,
        },
      },
    },
  })
}

export async function getPropertiesByOwner(ownerId: string, options: PaginationOptions = {}) {
  const page = options.page || 1
  const limit = options.limit || 10
  const skip = (page - 1) * limit

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where: { ownerId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { favorites: true, inquiries: true },
        },
      },
    }),
    prisma.property.count({ where: { ownerId } }),
  ])

  return {
    properties,
    total,
    pages: Math.ceil(total / limit),
    currentPage: page,
  }
}

export async function searchProperties(
  filters: SearchFilters = {},
  options: PaginationOptions = {}
) {
  const page = options.page || 1
  const limit = options.limit || 20
  const skip = (page - 1) * limit

  const where: any = {
    status: 'ACTIVE',
  }

  // Add text search support
  if (filters.q && filters.q.trim()) {
    where.OR = [
      {
        title: {
          contains: filters.q.trim(),
          mode: 'insensitive',
        },
      },
      {
        description: {
          contains: filters.q.trim(),
          mode: 'insensitive',
        },
      },
      {
        address: {
          contains: filters.q.trim(),
          mode: 'insensitive',
        },
      },
      {
        area: {
          contains: filters.q.trim(),
          mode: 'insensitive',
        },
      },
    ]
  }

  if (filters.area) {
    where.area = {
      contains: filters.area,
      mode: 'insensitive',
    }
  }

  if (filters.minPrice || filters.maxPrice) {
    where.rentAmount = {}
    if (filters.minPrice) {
      where.rentAmount.gte = filters.minPrice
    }
    if (filters.maxPrice) {
      where.rentAmount.lte = filters.maxPrice
    }
  }

  if (filters.propertyType) {
    where.propertyType = filters.propertyType
  }

  if (filters.bedrooms) {
    where.bedrooms = filters.bedrooms
  }

  if (filters.furnished) {
    where.furnished = filters.furnished
  }

  if (filters.listingType) {
    where.listingType = filters.listingType
  }

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where,
      skip,
      take: limit,
      orderBy: buildOrderBy(filters.sortBy, filters.order),
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        _count: {
          select: { favorites: true },
        },
      },
    }),
    prisma.property.count({ where }),
  ])

  return {
    properties,
    total,
    pages: Math.ceil(total / limit),
    currentPage: page,
  }
}

export async function updateProperty(
  id: string,
  ownerId: string,
  data: Partial<CreatePropertyInput>
) {
  // Verify ownership
  const property = await prisma.property.findUnique({
    where: { id },
  })

  if (!property || property.ownerId !== ownerId) {
    throw new Error('Unauthorized: Cannot update property')
  }

  return prisma.property.update({
    where: { id },
    data,
    include: {
      owner: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  })
}

export async function deleteProperty(id: string, ownerId: string) {
  // Verify ownership
  const property = await prisma.property.findUnique({
    where: { id },
  })

  if (!property || property.ownerId !== ownerId) {
    throw new Error('Unauthorized: Cannot delete property')
  }

  return prisma.property.delete({
    where: { id },
  })
}

export async function updatePropertyStatus(id: string, status: PropertyStatus) {
  return prisma.property.update({
    where: { id },
    data: { status },
  })
}

export async function recordPropertyView(propertyId: string, userId?: string) {
  const data: any = {
    propertyId,
  }

  if (userId) {
    data.userId = userId
  }

  return prisma.propertyView.create({ data })
}

export async function getPropertyStats(propertyId: string) {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: {
      _count: {
        select: {
          favorites: true,
          inquiries: true,
          reviews: true,
          propertyViews: true,
        },
      },
    },
  })

  if (!property) {
    throw new Error('Property not found')
  }

  return property._count
}
