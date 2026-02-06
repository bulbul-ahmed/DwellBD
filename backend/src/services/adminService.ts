import { prisma, PropertyStatus } from '../models'

export async function getDashboardStatistics() {
  const totalProperties = await prisma.property.count()
  const totalUsers = await prisma.user.count()
  const pendingProperties = await prisma.property.count({
    where: { status: 'PENDING' }
  })
  const activeProperties = await prisma.property.count({
    where: { status: 'ACTIVE' }
  })

  return {
    totalProperties,
    totalUsers,
    pendingProperties,
    activeProperties
  }
}

export async function getPropertiesForAdmin(page = 1, limit = 10, filters: any = {}) {
  const skip = (page - 1) * limit
  
  const where: any = {}
  
  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { address: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } }
    ]
  }
  
  if (filters.status) {
    where.status = filters.status
  }

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    }),
    prisma.property.count({ where })
  ])

  return {
    properties,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  }
}

export async function updatePropertyByAdmin(id: string, data: any) {
  const property = await prisma.property.update({
    where: { id },
    data,
    include: {
      owner: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      }
    }
  })
  
  return property
}

export async function getUsersForAdmin(page = 1, limit = 10, search = '') {
  const skip = (page - 1) * limit
  
  const where: any = {}
  
  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } }
    ]
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.user.count({ where })
  ])

  return {
    users,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  }
}

export async function updateUserByAdmin(id: string, data: any) {
  const user = await prisma.user.update({
    where: { id },
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
      updatedAt: true
    }
  })
  
  return user
}

export async function getPendingApprovals() {
  const properties = await prisma.property.findMany({
    where: {
      status: 'PENDING'
    },
    include: {
      owner: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
  
  return properties
}

export async function getAnalyticsData(days: number = 30) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const users = await prisma.user.findMany({
    where: {
      createdAt: {
        gte: startDate
      }
    }
  })

  const properties = await prisma.property.findMany({
    where: {
      createdAt: {
        gte: startDate
      }
    }
  })

  const bookings = await prisma.booking.findMany({
    where: {
      createdAt: {
        gte: startDate
      }
    }
  })

  const growthData: { [key: string]: { users: number; properties: number; bookings: number } } = {}
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    const dateStr = date.toISOString().split('T')[0]!
    growthData[dateStr] = { users: 0, properties: 0, bookings: 0 }
  }

  users.forEach(user => {
    const dateStr = user.createdAt.toISOString().split('T')[0]!
    if (dateStr in growthData) {
      (growthData[dateStr] as { users: number; properties: number; bookings: number }).users++
    }
  })

  properties.forEach(property => {
    const dateStr = property.createdAt.toISOString().split('T')[0]!
    if (dateStr in growthData) {
      (growthData[dateStr] as { users: number; properties: number; bookings: number }).properties++
    }
  })

  bookings.forEach(booking => {
    const dateStr = booking.createdAt.toISOString().split('T')[0]!
    if (dateStr in growthData) {
      (growthData[dateStr] as { users: number; properties: number; bookings: number }).bookings++
    }
  })

  return Object.entries(growthData).map(([date, data]) => ({
    date,
    ...data
  }))
}

export async function getMonthlyTrends() {
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const monthlyData = await prisma.user.findMany({
    where: {
      createdAt: {
        gte: sixMonthsAgo
      }
    },
    select: {
      createdAt: true,
      role: true
    }
  })

  const monthlyCounts: { [key: string]: { total: number; owners: number; tenants: number; admins: number } } = {}
  
  // Initialize last 6 months
  for (let i = 5; i >= 0; i--) {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    const monthKey = date.toISOString().substring(0, 7) // YYYY-MM format
    monthlyCounts[monthKey] = { total: 0, owners: 0, tenants: 0, admins: 0 }
  }

  monthlyData.forEach(user => {
    const monthKey = user.createdAt.toISOString().substring(0, 7)
    if (monthlyCounts[monthKey]) {
      monthlyCounts[monthKey].total++
      if (user.role === 'OWNER') monthlyCounts[monthKey].owners++
      else if (user.role === 'TENANT') monthlyCounts[monthKey].tenants++
      else if (user.role === 'ADMIN') monthlyCounts[monthKey].admins++
    }
  })

  return Object.entries(monthlyCounts).map(([month, counts]) => ({
    month,
    ...counts
  }))
}
