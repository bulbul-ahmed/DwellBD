import React, { useState, useEffect } from 'react'
import { getAnalytics } from '../../api/adminApi'
import StatsCard from '../../components/admin/StatsCard'
import Button from '../../components/ui/Button'
import { Users, Building, Eye, Heart, TrendingUp, MapPin, Award } from 'lucide-react'
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
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <TrendingUp className="h-6 w-6 text-purple-600" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-red-700">
        <p className="text-lg font-semibold">{error || 'Failed to load analytics'}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Analytics Dashboard 📊</h1>
          <p className="text-gray-600 text-lg">Track platform growth and user activity</p>
        </div>

        {/* Date Range Filter */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Date Range Filter</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={fetchAnalytics}
                className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-3 rounded-xl font-semibold"
              >
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
            variant="purple"
          />
          <StatsCard
            title="New Properties"
            value={data.summary.totalProperties}
            icon={Building}
            variant="pink"
          />
          <StatsCard
            title="Total Views"
            value={data.summary.totalViews}
            icon={Eye}
            variant="blue"
          />
          <StatsCard
            title="Total Favorites"
            value={data.summary.totalFavorites}
            icon={Heart}
            variant="coral"
          />
          <StatsCard
            title="Total Inquiries"
            value={data.summary.totalInquiries}
            icon={TrendingUp}
            variant="yellow"
          />
        </div>

        {/* Growth Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Growth Chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-purple-100 rounded-xl">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">User Growth</h3>
            </div>
            <div className="space-y-2">
              {data.userGrowth.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-12">No data available</p>
              ) : (
                <div className="flex items-end justify-end gap-1 h-64 px-2">
                  {data.userGrowth.map((point, idx) => {
                    const maxVal = Math.max(...data.userGrowth.map(p => p.count), 1)
                    const height = (point.count / maxVal) * 100
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center group">
                        <div className="w-full relative">
                          <div
                            className="w-full bg-gradient-to-t from-purple-500 to-purple-300 rounded-t-xl hover:from-purple-600 hover:to-purple-400 transition-all duration-300 group-hover:shadow-lg"
                            style={{ height: `${Math.max(height, 2)}%`, minHeight: '8px' }}
                          />
                          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {point.count}
                          </div>
                        </div>
                        <label className="text-[10px] text-gray-600 mt-2 text-center truncate w-full">
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
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-pink-100 rounded-xl">
                <Building className="h-5 w-5 text-pink-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Property Growth</h3>
            </div>
            <div className="space-y-2">
              {data.propertyGrowth.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-12">No data available</p>
              ) : (
                <div className="flex items-end justify-end gap-1 h-64 px-2">
                  {data.propertyGrowth.map((point, idx) => {
                    const maxVal = Math.max(...data.propertyGrowth.map(p => p.count), 1)
                    const height = (point.count / maxVal) * 100
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center group">
                        <div className="w-full relative">
                          <div
                            className="w-full bg-gradient-to-t from-pink-500 to-pink-300 rounded-t-xl hover:from-pink-600 hover:to-pink-400 transition-all duration-300 group-hover:shadow-lg"
                            style={{ height: `${Math.max(height, 2)}%`, minHeight: '8px' }}
                          />
                          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {point.count}
                          </div>
                        </div>
                        <label className="text-[10px] text-gray-600 mt-2 text-center truncate w-full">
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
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-blue-100 rounded-xl">
                <MapPin className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Top Areas</h3>
            </div>
            {data.areaStats.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-12">No data available</p>
            ) : (
              <div className="space-y-4">
                {data.areaStats.slice(0, 10).map((area, idx) => {
                  const maxCount = Math.max(...data.areaStats.map(a => a.count))
                  const percentage = (area.count / maxCount) * 100
                  const colors = ['bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-yellow-500', 'bg-mint-500']
                  return (
                    <div key={idx} className="group">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-semibold text-gray-700">{area.area}</label>
                        <span className="text-sm font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-full">{area.count}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-3 rounded-full transition-all duration-500 ${colors[idx % 5]} group-hover:opacity-80`}
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
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-mint-100 rounded-xl">
                <Building className="h-5 w-5 text-mint-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Property Types</h3>
            </div>
            {Object.keys(data.typeDistribution).length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-12">No data available</p>
            ) : (
              <div className="space-y-4">
                {Object.entries(data.typeDistribution).map(([type, count], idx) => {
                  const total = Object.values(data.typeDistribution).reduce((a, b) => a + b, 0)
                  const percentage = (count / total) * 100
                  const colors = ['bg-mint-500', 'bg-coral-500', 'bg-yellow-500', 'bg-purple-500']
                  return (
                    <div key={type} className="group">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-semibold text-gray-700">{type}</label>
                        <span className="text-sm font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-full">
                          {count} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-3 rounded-full transition-all duration-500 ${colors[idx % 4]} group-hover:opacity-80`}
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
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-yellow-100 rounded-xl">
                <Award className="h-5 w-5 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Top Property Owners</h3>
            </div>
            {data.topOwners.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-12">No data available</p>
            ) : (
              <div className="space-y-3">
                {data.topOwners.map((owner, idx) => (
                  <div key={owner.id} className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-white border border-gray-100 rounded-xl hover:shadow-md transition-all duration-200">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-white ${
                      idx === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                      idx === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
                      idx === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600' :
                      'bg-gradient-to-br from-purple-400 to-purple-600'
                    }`}>
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{owner.name}</p>
                      <p className="text-xs text-gray-600">{owner.email}</p>
                    </div>
                    <span className="font-bold text-2xl text-purple-600">{owner.propertyCount}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Most Viewed Properties */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-blue-100 rounded-xl">
                <Eye className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Most Viewed</h3>
            </div>
            {data.mostViewed.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-12">No data available</p>
            ) : (
              <div className="space-y-3">
                {data.mostViewed.map((prop, idx) => (
                  <div key={prop.id} className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-white border border-gray-100 rounded-xl hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full font-bold text-white">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{prop.title}</p>
                      <p className="text-xs text-gray-600">{prop.address}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-xl text-blue-600">{prop.viewCount}</div>
                      <div className="text-xs text-gray-500">views</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Most Favorited */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-pink-100 rounded-xl">
              <Heart className="h-5 w-5 text-pink-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Most Favorited Properties</h3>
          </div>
          {data.mostFavorited.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-12">No data available</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.mostFavorited.map((prop) => (
                <div key={prop.id} className="p-5 bg-gradient-to-br from-pink-50 to-white border border-pink-100 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 mb-1">{prop.title}</p>
                      <p className="text-sm text-gray-600 mb-2">{prop.address}</p>
                      <p className="text-lg font-bold text-purple-600">
                        ৳{parseInt(prop.rentAmount).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-pink-100">
                    <Heart className="h-4 w-4 text-pink-600 fill-pink-600" />
                    <span className="text-sm font-semibold text-pink-600">{prop.favoriteCount} favorites</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminAnalytics
