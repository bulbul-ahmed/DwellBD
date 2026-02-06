import { prisma } from '../models'
import { PropertyStatus } from '@prisma/client'

export const getAllProperties = async (page: number = 1, limit: number = 10) => {
  const skip = (page - 1) * limit

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      skip,
      take: limit,
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            inquiries: true,
            favorites: true,
            reviews: true,
            propertyViews: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.property.count(),
  ])

  return {
    properties,
    total,
    pages: Math.ceil(total / limit),
    currentPage: page,
  }
}

export const updatePropertyStatus = async (
  propertyId: string,
  data: {
    status?: PropertyStatus
  }
) => {
  return await prisma.property.update({
    where: { id: propertyId },
    data,
    include: {
      owner: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  })
}

export const deleteProperty = async (propertyId: string) => {
  return await prisma.property.delete({
    where: { id: propertyId },
  })
}

export const getPropertyById = async (propertyId: string) => {
  return await prisma.property.findUnique({
    where: { id: propertyId },
    include: {
      owner: true,
      _count: {
        select: {
          inquiries: true,
          favorites: true,
          reviews: true,
          propertyViews: true,
        },
      },
    },
  })
}

export const getPendingProperties = async (limit: number = 10) => {
  return await prisma.property.findMany({
    where: { status: 'PENDING' },
    take: limit,
    include: {
      owner: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
      _count: {
        select: {
          inquiries: true,
          favorites: true,
          reviews: true,
          propertyViews: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}
