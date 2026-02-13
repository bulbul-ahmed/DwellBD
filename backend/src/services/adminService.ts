import { prisma, PropertyStatus } from '../models'
import { validateServiceAreas } from '../constants/areas'

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
  // Validate owner-specific fields if present
  if (data.serviceAreas !== undefined) {
    const validation = validateServiceAreas(data.serviceAreas)
    if (!validation.valid) {
      throw new Error(`Invalid service areas: ${validation.invalidAreas?.join(', ')}`)
    }
  }

  // Validate businessName length
  if (data.businessName && data.businessName.length > 100) {
    throw new Error('Business name must be 100 characters or less')
  }

  // Validate businessLocation length
  if (data.businessLocation && data.businessLocation.length > 200) {
    throw new Error('Business location must be 200 characters or less')
  }

  // Prepare update data
  const updateData: any = { ...data }

  // If role is being changed to non-OWNER, clear owner-specific fields
  if (data.role && data.role !== 'OWNER') {
    updateData.serviceAreas = []
    updateData.businessName = null
    updateData.businessLocation = null
  }

  // If role is OWNER and owner fields are provided, validate them
  if (data.role === 'OWNER' || !data.role) {
    // Fetch current user to check if they're an owner
    const currentUser = await prisma.user.findUnique({
      where: { id },
      select: { role: true }
    })

    const isOwner = data.role === 'OWNER' || currentUser?.role === 'OWNER'

    // Only apply owner fields if user is or will be an owner
    if (!isOwner) {
      delete updateData.serviceAreas
      delete updateData.businessName
      delete updateData.businessLocation
      delete updateData.verificationAddress
    }
  }

  const user = await prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      email: true,
      phone: true,
      firstName: true,
      lastName: true,
      role: true,
      isVerified: true,
      isActive: true,
      avatar: true,
      serviceAreas: true,
      businessName: true,
      businessLocation: true,
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

  // Get counts for summary
  const totalUsers = await prisma.user.count({ where: { createdAt: { gte: startDate } } })
  const totalProperties = await prisma.property.count({ where: { createdAt: { gte: startDate } } })
  const totalInquiries = await prisma.inquiry.count({ where: { createdAt: { gte: startDate } } })
  const totalViews = await prisma.propertyView.count({ where: { viewedAt: { gte: startDate } } })
  const totalFavorites = await prisma.favorite.count({ where: { createdAt: { gte: startDate } } })

  // Get data for growth charts
  const users = await prisma.user.findMany({
    where: { createdAt: { gte: startDate } },
    select: { createdAt: true }
  })

  const properties = await prisma.property.findMany({
    where: { createdAt: { gte: startDate } },
    select: { createdAt: true, area: true, type: true }
  })

  const bookings = await prisma.booking.findMany({
    where: { createdAt: { gte: startDate } }
  })

  // Build growth data
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
      growthData[dateStr]!.users++
    }
  })

  properties.forEach(property => {
    const dateStr = property.createdAt.toISOString().split('T')[0]!
    if (dateStr in growthData) {
      growthData[dateStr]!.properties++
    }
  })

  bookings.forEach(booking => {
    const dateStr = booking.createdAt.toISOString().split('T')[0]!
    if (dateStr in growthData) {
      growthData[dateStr]!.bookings++
    }
  })

  // Area statistics
  const areaStats: { [key: string]: number } = {}
  properties.forEach(property => {
    const area = property.area || 'Unknown'
    areaStats[area] = (areaStats[area] || 0) + 1
  })

  // Type distribution
  const typeDistribution: { [key: string]: number } = {}
  properties.forEach(property => {
    const type = property.type || 'Unknown'
    typeDistribution[type] = (typeDistribution[type] || 0) + 1
  })

  // Top owners
  const topOwners = await prisma.user.findMany({
    where: { role: 'OWNER' },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      _count: { select: { properties: true } }
    },
    orderBy: { properties: { _count: 'desc' } },
    take: 5
  })

  // Most viewed properties
  const mostViewed = await prisma.property.findMany({
    select: {
      id: true,
      title: true,
      address: true,
      rentAmount: true,
      _count: { select: { propertyViews: true } }
    },
    orderBy: { propertyViews: { _count: 'desc' } },
    take: 5
  })

  // Most favorited properties
  const mostFavorited = await prisma.property.findMany({
    select: {
      id: true,
      title: true,
      address: true,
      rentAmount: true,
      _count: { select: { favorites: true } }
    },
    orderBy: { favorites: { _count: 'desc' } },
    take: 5
  })

  return {
    summary: {
      totalUsers,
      totalProperties,
      totalInquiries,
      totalViews,
      totalFavorites
    },
    userGrowth: Object.entries(growthData).map(([date, data]) => ({
      date,
      count: data.users
    })),
    propertyGrowth: Object.entries(growthData).map(([date, data]) => ({
      date,
      count: data.properties
    })),
    areaStats: Object.entries(areaStats).map(([area, count]) => ({ area, count })),
    typeDistribution,
    topOwners: topOwners.map(owner => ({
      id: owner.id,
      name: `${owner.firstName} ${owner.lastName}`,
      email: owner.email,
      phone: owner.phone || '',
      propertyCount: owner._count.properties
    })),
    mostViewed: mostViewed.map(prop => ({
      id: prop.id,
      title: prop.title,
      address: prop.address,
      rentAmount: prop.rentAmount?.toString() || '0',
      viewCount: prop._count.propertyViews
    })),
    mostFavorited: mostFavorited.map(prop => ({
      id: prop.id,
      title: prop.title,
      address: prop.address,
      rentAmount: prop.rentAmount?.toString() || '0',
      favoriteCount: prop._count.favorites
    }))
  }
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
