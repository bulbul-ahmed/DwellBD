import { prisma } from '../models'

export async function getOverviewStats() {
  const [
    totalUsers,
    totalProperties,
    pendingProperties,
    rentedProperties,
    totalViews,
    totalFavorites,
    totalBookings,
    newUsersThisMonth,
    newPropertiesThisMonth
  ] = await Promise.all([
    prisma.user.count(),
    prisma.property.count(),
    prisma.property.count({ where: { status: 'PENDING' } }),
    prisma.property.count({ where: { status: 'RENTED' } }),
    prisma.propertyView.count(),
    prisma.favorite.count(),
    prisma.booking.count(),
    prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }
    }),
    prisma.property.count({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }
    })
  ])

  return {
    totalUsers,
    totalProperties,
    pendingProperties,
    rentedProperties,
    totalViews,
    totalFavorites,
    totalBookings,
    newUsersThisMonth,
    newPropertiesThisMonth
  }
}

export async function getUserGrowthTrend(days: number = 30) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const users = await prisma.user.findMany({
    where: {
      createdAt: {
        gte: startDate
      }
    },
    orderBy: {
      createdAt: 'asc'
    },
    select: {
      createdAt: true
    }
  })

  // Group users by day
  const growthData: { [key: string]: number } = {}
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    const dateStr = date.toISOString().split('T')[0]!
    growthData[dateStr] = 0
  }

  users.forEach(user => {
    const dateStr = user.createdAt.toISOString().split('T')[0]!
    if (dateStr in growthData) {
      (growthData[dateStr] as number)++
    }
  })

  return Object.entries(growthData).map(([date, count]) => ({
    date,
    count
  }))
}

export async function getPropertyTypeDistribution() {
  const stats = await prisma.property.groupBy({
    by: ['type'],
    _count: {
      id: true
    }
  })

  const result: Record<string, number> = {}
  stats.forEach(s => {
    result[s.type] = s._count.id
  })
  return result
}

export async function getPropertyStatusDistribution() {
  const stats = await prisma.property.groupBy({
    by: ['status'],
    _count: {
      id: true
    }
  })

  const result: Record<string, number> = {}
  stats.forEach(s => {
    result[s.status] = s._count.id
  })
  return result
}

export async function getTopPerformingProperties(limit: number = 10) {
  const properties = await prisma.property.findMany({
    orderBy: [
      {
        reviews: {
          _count: 'desc'
        }
      }
    ],
    include: {
      reviews: {
        select: {
          id: true
        }
      },
      _count: {
        select: {
          reviews: true,
          favorites: true,
          bookings: true
        }
      }
    },
    take: limit
  })

  return properties.map(property => ({
    id: property.id,
    title: property.title,
    type: property.type,
    status: property.status,
    city: property.city,
    reviewCount: property._count.reviews || 0,
    favoriteCount: property._count.favorites || 0,
    bookingCount: property._count.bookings || 0
  }))
}

export async function getMonthlyData() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  
  const [
    newUsers,
    newProperties,
    newBookings
  ] = await Promise.all([
    prisma.user.count({
      where: {
        createdAt: {
          gte: startOfMonth
        }
      }
    }),
    prisma.property.count({
      where: {
        createdAt: {
          gte: startOfMonth
        }
      }
    }),
    prisma.booking.count({
      where: {
        createdAt: {
          gte: startOfMonth
        }
      }
    })
  ])

  return {
    newUsers,
    newProperties,
    newBookings
  }
}

export async function getRecentActivity(limit: number = 10) {
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const [
    newUsers,
    newProperties,
    newBookings
  ] = await Promise.all([
    prisma.user.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: Math.ceil(limit / 3)
    }),
    prisma.property.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      include: {
        owner: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: Math.ceil(limit / 3)
    }),
    prisma.booking.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      include: {
        property: {
          select: {
            title: true
          }
        },
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: Math.ceil(limit / 3)
    })
  ])

  const allActivities = [
    ...newUsers.map(user => ({
      type: 'user',
      message: `New user: ${user.firstName} ${user.lastName}`,
      timestamp: user.createdAt
    })),
    ...newProperties.map(property => ({
      type: 'property',
      message: `New property: ${property.title}`,
      timestamp: property.createdAt,
      details: {
        owner: property.owner
      }
    })),
    ...newBookings.map(booking => ({
      type: 'booking',
      message: `New booking by ${booking.user.firstName} ${booking.user.lastName}`,
      timestamp: booking.createdAt,
      details: {
        property: booking.property.title
      }
    }))
  ]

  return allActivities
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, limit)
}
