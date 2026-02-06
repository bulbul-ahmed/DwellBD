import { prisma } from '../models'
import { UserRole } from '@prisma/client'

export const getAllUsers = async (page: number = 1, limit: number = 10) => {
  const skip = (page - 1) * limit

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: limit,
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        role: true,
        isVerified: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            properties: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count(),
  ])

  return {
    users,
    total,
    pages: Math.ceil(total / limit),
    currentPage: page,
  }
}

export const updateUserStatus = async (
  userId: string,
  data: {
    isActive?: boolean
    isVerified?: boolean
    role?: UserRole
  }
) => {
  return await prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isVerified: true,
      isActive: true,
      createdAt: true,
    },
  })
}

export const deleteUser = async (userId: string) => {
  return await prisma.user.delete({
    where: { id: userId },
  })
}

export const getUserById = async (userId: string) => {
  return await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      phone: true,
      firstName: true,
      lastName: true,
      role: true,
      isVerified: true,
      isActive: true,
      createdAt: true,
      _count: {
        select: {
          properties: true,
          bookings: true,
          reviews: true,
        },
      },
    },
  })
}

export const getUsersByRole = async (role: UserRole, limit: number = 10) => {
  return await prisma.user.findMany({
    where: { role },
    take: limit,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isVerified: true,
      isActive: true,
      createdAt: true,
      _count: {
        select: {
          properties: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export const countUsersByRole = async () => {
  const [admins, owners, tenants] = await Promise.all([
    prisma.user.count({ where: { role: 'ADMIN' } }),
    prisma.user.count({ where: { role: 'OWNER' } }),
    prisma.user.count({ where: { role: 'TENANT' } }),
  ])

  return { admins, owners, tenants }
}
