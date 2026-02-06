import React, { useState, useEffect } from 'react'
import { getAnalytics } from '../../api/adminApi'
import StatsCard from '../../components/admin/StatsCard'
import Button from '../../components/ui/Button'
import { Users, Building, Eye, Heart, TrendingUp } from 'lucide-react'
import toast from 'react-hot-toast'

interface AnalyticsData {
  summary: {
    totalUsers: number
    totalProperties: number
    totalInquiries: number
    totalViews: number
    totalFavorites: number
  }
  userGrowth: Array<{ date: string; count: number }>
  propertyGrowth: Array<{ date: string; count: number }>
  areaStats: Array<{ area: string; count: number }>
  typeDistribution: Record<string, number>
  topOwners: Array<{ id: string; name: string; email: string; phone: string; propertyCount: number }>
  mostViewed: Array<{ id: string; title: string; address: string; rentAmount: string; viewCount: number }>
  mostFavorited: Array<{
    id: string
    title: string
    address: string
    rentAmount: string
    favoriteCount: number
  }>
}

const AdminAnalytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [startDate, setStartDate] = useState(() => {
    const date = new Date()
    date.setDate(date.getDate() - 30)
    return date.toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getAnalytics({
        start: new Date(startDate).toISOString(),
        end: new Date(endDate).toISOString(),
      })
      setData(response)
    } catch (err) {
      console.error('Error fetching analytics:', err)
      setError('Failed to load analytics data')
      toast.error('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700">
        <p>{error || 'Failed to load analytics'}</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-1">Track platform growth and user activity</p>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Date Range</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            <Button onClick={fetchAnalytics} className="w-full sm:w-auto">
              Apply Filter
            </Button>
          </div>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
        <StatsCard
          title="New Users"
          value={data.summary.totalUsers}
          icon={Users}
          variant="default"
        />
        <StatsCard
          title="New Properties"
          value={data.summary.totalProperties}
          icon={Building}
          variant="default"
        />
        <StatsCard
          title="Total Views"
          value={data.summary.totalViews}
          icon={Eye}
          variant="default"
        />
        <StatsCard
          title="Total Favorites"
          value={data.summary.totalFavorites}
          icon={Heart}
          variant="default"
        />
        <StatsCard
          title="Total Inquiries"
          value={data.summary.totalInquiries}
          icon={TrendingUp}
          variant="default"
        />
      </div>

      {/* Growth Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-gray-900 mb-4">User Growth</h3>
          <div className="space-y-2">
            {data.userGrowth.length === 0 ? (
              <p className="text-gray-500 text-sm">No data available</p>
            ) : (
              <div className="flex items-end justify-end gap-2 h-48">
                {data.userGrowth.map((point, idx) => {
                  const maxVal = Math.max(...data.userGrowth.map(p => p.count))
                  const height = (point.count / maxVal) * 100
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-blue-500 rounded-t-lg hover:bg-blue-600 transition-colors"
                        style={{ height: `${height}%`, minHeight: '4px' }}
                        title={`${point.date}: ${point.count}`}
                      />
                      <label className="text-xs text-gray-600 mt-2 text-center truncate">
                        {new Date(point.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </label>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Property Growth Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Property Growth</h3>
          <div className="space-y-2">
            {data.propertyGrowth.length === 0 ? (
              <p className="text-gray-500 text-sm">No data available</p>
            ) : (
              <div className="flex items-end justify-end gap-2 h-48">
                {data.propertyGrowth.map((point, idx) => {
                  const maxVal = Math.max(...data.propertyGrowth.map(p => p.count))
                  const height = (point.count / maxVal) * 100
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-green-500 rounded-t-lg hover:bg-green-600 transition-colors"
                        style={{ height: `${height}%`, minHeight: '4px' }}
                        title={`${point.date}: ${point.count}`}
                      />
                      <label className="text-xs text-gray-600 mt-2 text-center truncate">
                        {new Date(point.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </label>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Properties by Area */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Top 10 Areas</h3>
          {data.areaStats.length === 0 ? (
            <p className="text-gray-500 text-sm">No data available</p>
          ) : (
            <div className="space-y-2">
              {data.areaStats.map((area, idx) => {
                const maxCount = Math.max(...data.areaStats.map(a => a.count))
                const percentage = (area.count / maxCount) * 100
                return (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-sm font-medium text-gray-700">{area.area}</label>
                      <span className="text-sm text-gray-600">{area.count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Property Types Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Property Type Distribution</h3>
          {Object.keys(data.typeDistribution).length === 0 ? (
            <p className="text-gray-500 text-sm">No data available</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(data.typeDistribution).map(([type, count]) => {
                const total = Object.values(data.typeDistribution).reduce((a, b) => a + b, 0)
                const percentage = (count / total) * 100
                return (
                  <div key={type}>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-sm font-medium text-gray-700">{type}</label>
                      <span className="text-sm text-gray-600">{count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Top Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Owners */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Top 10 Property Owners</h3>
          {data.topOwners.length === 0 ? (
            <p className="text-gray-500 text-sm">No data available</p>
          ) : (
            <div className="space-y-3">
              {data.topOwners.map((owner, idx) => (
                <div key={owner.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="flex items-center">
                      <span className="text-lg font-bold text-gray-400 mr-3 w-6">{idx + 1}</span>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{owner.name}</p>
                        <p className="text-xs text-gray-600">{owner.email}</p>
                      </div>
                    </div>
                  </div>
                  <span className="font-semibold text-blue-600">{owner.propertyCount}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Most Viewed Properties */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Most Viewed Properties</h3>
          {data.mostViewed.length === 0 ? (
            <p className="text-gray-500 text-sm">No data available</p>
          ) : (
            <div className="space-y-3">
              {data.mostViewed.map((prop, idx) => (
                <div key={prop.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="flex items-center">
                      <span className="text-lg font-bold text-gray-400 mr-3 w-6">{idx + 1}</span>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{prop.title}</p>
                        <p className="text-xs text-gray-600">{prop.address}</p>
                      </div>
                    </div>
                  </div>
                  <span className="font-semibold text-purple-600">{prop.viewCount}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Most Favorited */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Most Favorited Properties</h3>
        {data.mostFavorited.length === 0 ? (
          <p className="text-gray-500 text-sm">No data available</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.mostFavorited.map((prop) => (
              <div key={prop.id} className="p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-gray-900">{prop.title}</p>
                    <p className="text-sm text-gray-600">{prop.address}</p>
                  </div>
                  <span className="text-lg font-bold text-pink-600">{prop.favoriteCount}</span>
                </div>
                <p className="text-sm font-semibold text-blue-600">
                  {prop.rentAmount} Tk
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminAnalytics
