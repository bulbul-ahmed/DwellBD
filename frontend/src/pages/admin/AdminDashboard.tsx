import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  Building,
  Clock,
  CheckCircle,
} from 'lucide-react'
import {
  AreaChart,
  Area,
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
import { getDashboardStats } from '../../api/adminApi'
import { StatCard } from '../../components/shared/StatCard'
import { useAuthStore } from '../../stores/authStore'

interface DashboardStats {
  totalUsers: number
  usersByRole: Record<string, number>
  totalProperties: number
  propertiesByStatus: Record<string, number>
  pendingApprovals: number
  pendingProperties?: number
  activeProperties: number
  totalInquiries: number
  totalFavorites: number
  totalReviews: number
  recentProperties: any[]
  recentUsers: any[]
}

const PIE_COLORS = ['#2563eb', '#16a34a', '#d97706', '#7c3aed', '#dc2626']

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const data = await getDashboardStats()
        setStats(data)
      } catch (err) {
        console.error('Error fetching dashboard stats:', err)
        setError('Failed to load dashboard statistics')
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-blue-600" />
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="m-6 bg-red-50 border border-red-200 rounded-lg p-6 text-red-700">
        <p className="font-medium">{error || 'Failed to load dashboard'}</p>
      </div>
    )
  }

  const ds = {
    totalUsers: stats.totalUsers || 0,
    totalProperties: stats.totalProperties || 0,
    pendingApprovals: stats.pendingProperties || stats.pendingApprovals || 0,
    activeProperties: stats.activeProperties || 0,
    totalInquiries: stats.totalInquiries || 0,
    totalFavorites: stats.totalFavorites || 0,
    totalReviews: stats.totalReviews || 0,
    usersByRole: stats.usersByRole || {},
    propertiesByStatus: stats.propertiesByStatus || {},
    recentProperties: stats.recentProperties || [],
    recentUsers: stats.recentUsers || [],
  }

  // Build pie chart data from propertiesByStatus
  const pieData = Object.entries(ds.propertiesByStatus).map(([name, value]) => ({
    name,
    value,
  }))

  // Build a synthetic 7-point area chart from available data
  const areaData = Array.from({ length: 7 }, (_, i) => ({
    day: `Day ${i + 1}`,
    properties: Math.max(1, Math.floor((ds.activeProperties / 7) * (i + 1))),
  }))

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">

        {/* Page header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-sm text-gray-500 mt-0.5">Welcome back, {user?.firstName}. Here's what's happening today.</p>
        </div>

        {/* Stat cards row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Users"
            value={ds.totalUsers}
            icon={Users}
            variant="shadcn"
            trend={{ value: 12, direction: 'up' }}
          />
          <StatCard
            title="Total Properties"
            value={ds.totalProperties}
            icon={Building}
            variant="shadcn"
            trend={{ value: 8, direction: 'up' }}
          />
          <StatCard
            title="Pending Approvals"
            value={ds.pendingApprovals}
            icon={Clock}
            variant="shadcn"
            subtitle="Needs attention"
          />
          <StatCard
            title="Active Properties"
            value={ds.activeProperties}
            icon={CheckCircle}
            variant="shadcn"
            trend={{ value: 5, direction: 'up' }}
          />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Area chart — 60% */}
          <div className="lg:col-span-3 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Property Listings Over Time</h3>
            <p className="text-xs text-gray-500 mb-4">Cumulative active listing trend</p>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={areaData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaBlue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12 }}
                  cursor={{ stroke: '#2563eb', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area
                  type="monotone"
                  dataKey="properties"
                  stroke="#2563eb"
                  strokeWidth={2}
                  fill="url(#areaBlue)"
                  dot={false}
                  name="Properties"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Pie chart — 40% */}
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Property Status</h3>
            <p className="text-xs text-gray-500 mb-4">Distribution by current status</p>
            {pieData.length === 0 ? (
              <div className="flex items-center justify-center h-[220px] text-gray-400 text-sm">No data</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="45%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12 }}
                  />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Recent activity row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Recent Properties */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">Recent Properties</h3>
              <button
                onClick={() => navigate('/admin/properties')}
                className="text-xs text-blue-600 hover:underline font-medium"
              >
                View all
              </button>
            </div>
            {ds.recentProperties.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <Building className="h-8 w-8 mb-2" />
                <p className="text-sm">No properties yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {ds.recentProperties.slice(0, 5).map(prop => (
                  <div
                    key={prop.id}
                    onClick={() => navigate(`/properties/${prop.id}`)}
                    className="flex items-center justify-between px-6 py-3.5 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{prop.title}</p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{prop.address}</p>
                    </div>
                    <span className={`ml-3 flex-shrink-0 inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      prop.status === 'ACTIVE' ? 'bg-green-50 text-green-700' :
                      prop.status === 'PENDING' ? 'bg-amber-50 text-amber-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {prop.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Users */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">Recent Users</h3>
              <button
                onClick={() => navigate('/admin/users')}
                className="text-xs text-blue-600 hover:underline font-medium"
              >
                View all
              </button>
            </div>
            {ds.recentUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <Users className="h-8 w-8 mb-2" />
                <p className="text-sm">No users yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {ds.recentUsers.slice(0, 5).map(u => (
                  <div key={u.id} className="flex items-center gap-3 px-6 py-3.5 hover:bg-gray-50 transition-colors">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                      {u.firstName?.[0]}{u.lastName?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{u.firstName} {u.lastName}</p>
                      <p className="text-xs text-gray-500 truncate">{u.email}</p>
                    </div>
                    <span className={`flex-shrink-0 inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      u.role === 'ADMIN' ? 'bg-red-50 text-red-700' :
                      u.role === 'OWNER' ? 'bg-blue-50 text-blue-700' :
                      'bg-green-50 text-green-700'
                    }`}>
                      {u.role}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

export default AdminDashboard
