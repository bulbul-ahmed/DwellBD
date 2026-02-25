import React, { useState, useEffect } from 'react'
import { getAnalytics } from '../../api/adminApi'
import Button from '../../components/ui/Button'
import { Users, Building, Eye, Heart, TrendingUp, MapPin, Award } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

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

const PIE_COLORS = ['#2563eb', '#16a34a', '#d97706', '#7c3aed', '#dc2626']

const fmt = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

const AdminAnalytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [startDate, setStartDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - 30)
    return d.toISOString().split('T')[0]
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
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-blue-600" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="m-6 bg-red-50 border border-red-200 rounded-lg p-6 text-red-700">
        <p className="font-medium">{error || 'Failed to load analytics'}</p>
      </div>
    )
  }

  const userGrowthData = data.userGrowth.map(p => ({ ...p, date: fmt(p.date) }))
  const propertyGrowthData = data.propertyGrowth.map(p => ({ ...p, date: fmt(p.date) }))
  const areaBarData = data.areaStats.slice(0, 10)
  const pieData = Object.entries(data.typeDistribution).map(([name, value]) => ({ name, value }))

  const tooltipStyle = { border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12 }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">

        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
          <p className="text-sm text-gray-500 mt-0.5">Track platform growth and user activity</p>
        </div>

        {/* Date filter */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Date Range</h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-600 mb-1.5">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={fetchAnalytics}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 px-6 py-2 text-sm rounded-md font-medium"
              >
                Apply
              </Button>
            </div>
          </div>
        </div>

        {/* Summary stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: 'New Users', value: data.summary.totalUsers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'New Properties', value: data.summary.totalProperties, icon: Building, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Total Views', value: data.summary.totalViews, icon: Eye, color: 'text-violet-600', bg: 'bg-violet-50' },
            { label: 'Favorites', value: data.summary.totalFavorites, icon: Heart, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Inquiries', value: data.summary.totalInquiries, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className={`inline-flex p-2 rounded-md ${bg} ${color} mb-3`}>
                <Icon className="h-4 w-4" strokeWidth={2} />
              </div>
              <p className="text-xs font-medium text-gray-500">{label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
            </div>
          ))}
        </div>

        {/* Growth charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* User growth — Area chart */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-blue-50 rounded-md">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">User Growth</h3>
            </div>
            {userGrowthData.length === 0 ? (
              <div className="flex items-center justify-center h-[200px] text-gray-400 text-sm">No data</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={userGrowthData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: '#2563eb', strokeWidth: 1, strokeDasharray: '4 4' }} />
                  <Area type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2} fill="url(#userGrad)" dot={false} name="Users" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Property growth — Bar chart */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-green-50 rounded-md">
                <Building className="h-4 w-4 text-green-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">Property Growth</h3>
            </div>
            {propertyGrowthData.length === 0 ? (
              <div className="flex items-center justify-center h-[200px] text-gray-400 text-sm">No data</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={propertyGrowthData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#f9fafb' }} />
                  <Bar dataKey="count" fill="#16a34a" radius={[3, 3, 0, 0]} name="Properties" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Distribution charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Area distribution — Horizontal Bar */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-violet-50 rounded-md">
                <MapPin className="h-4 w-4 text-violet-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">Top Areas</h3>
            </div>
            {areaBarData.length === 0 ? (
              <div className="flex items-center justify-center h-[240px] text-gray-400 text-sm">No data</div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart
                  data={areaBarData}
                  layout="vertical"
                  margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis
                    type="category"
                    dataKey="area"
                    tick={{ fontSize: 10, fill: '#6b7280' }}
                    axisLine={false}
                    tickLine={false}
                    width={80}
                  />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#f9fafb' }} />
                  <Bar dataKey="count" fill="#7c3aed" radius={[0, 3, 3, 0]} name="Properties" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Property types — Pie chart */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-amber-50 rounded-md">
                <Building className="h-4 w-4 text-amber-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">Property Types</h3>
            </div>
            {pieData.length === 0 ? (
              <div className="flex items-center justify-center h-[240px] text-gray-400 text-sm">No data</div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value) => [`${value}`, '']}
                  />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Top lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Top Owners */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100">
              <div className="p-1.5 bg-amber-50 rounded-md">
                <Award className="h-4 w-4 text-amber-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">Top Property Owners</h3>
            </div>
            {data.topOwners.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-gray-400 text-sm">No data</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {data.topOwners.map((owner, idx) => (
                  <div key={owner.id} className="flex items-center gap-3 px-6 py-3.5 hover:bg-gray-50 transition-colors">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${
                      idx === 0 ? 'bg-amber-500' : idx === 1 ? 'bg-gray-400' : idx === 2 ? 'bg-orange-500' : 'bg-blue-500'
                    }`}>
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{owner.name}</p>
                      <p className="text-xs text-gray-500 truncate">{owner.email}</p>
                    </div>
                    <span className="text-sm font-bold text-blue-600 flex-shrink-0">{owner.propertyCount}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Most Viewed */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100">
              <div className="p-1.5 bg-blue-50 rounded-md">
                <Eye className="h-4 w-4 text-blue-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">Most Viewed</h3>
            </div>
            {data.mostViewed.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-gray-400 text-sm">No data</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {data.mostViewed.map((prop, idx) => (
                  <div key={prop.id} className="flex items-center gap-3 px-6 py-3.5 hover:bg-gray-50 transition-colors">
                    <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{prop.title}</p>
                      <p className="text-xs text-gray-500 truncate">{prop.address}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-blue-600">{prop.viewCount}</p>
                      <p className="text-xs text-gray-400">views</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Most Favorited */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100">
            <div className="p-1.5 bg-red-50 rounded-md">
              <Heart className="h-4 w-4 text-red-500" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900">Most Favorited Properties</h3>
          </div>
          {data.mostFavorited.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-gray-400 text-sm">No data</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
              {data.mostFavorited.map(prop => (
                <div key={prop.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <p className="text-sm font-semibold text-gray-900 mb-0.5 truncate">{prop.title}</p>
                  <p className="text-xs text-gray-500 mb-2 truncate">{prop.address}</p>
                  <p className="text-base font-bold text-blue-600 mb-3">
                    ৳{parseInt(prop.rentAmount).toLocaleString()}
                  </p>
                  <div className="flex items-center gap-1.5 pt-3 border-t border-gray-100">
                    <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500" />
                    <span className="text-xs font-semibold text-gray-600">{prop.favoriteCount} favorites</span>
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
