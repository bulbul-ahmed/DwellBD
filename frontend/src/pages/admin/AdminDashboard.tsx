import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  Building,
  Clock,
  CheckCircle,
  MessageSquare,
  Heart,
  Star,
  TrendingUp,
  Eye,
  ArrowRight,
} from 'lucide-react'
import { getDashboardStats } from '../../api/adminApi'
import StatsCard from '../../components/admin/StatsCard'
import Button from '../../components/ui/Button'
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
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Building className="h-6 w-6 text-purple-600" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-red-700">
        <p className="text-lg font-semibold">{error || 'Failed to load dashboard'}</p>
      </div>
    )
  }

  // Provide defaults for missing fields
  const dashboardStats = {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.firstName}! 👋
            </h1>
            <p className="text-gray-600 text-lg">Here's what's happening with your platform today</p>
          </div>
        </div>

        {/* Main Stats Grid - Soft Pastel Colors */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Users"
            value={dashboardStats.totalUsers}
            icon={Users}
            variant="purple"
            trend={`+${Math.floor(dashboardStats.totalUsers * 0.12)} this month`}
          />
          <StatsCard
            title="Total Properties"
            value={dashboardStats.totalProperties}
            icon={Building}
            variant="pink"
            trend={`${dashboardStats.activeProperties} active`}
          />
          <StatsCard
            title="Pending Approvals"
            value={dashboardStats.pendingApprovals}
            icon={Clock}
            variant="yellow"
            trend="Needs attention"
          />
          <StatsCard
            title="Active Properties"
            value={dashboardStats.activeProperties}
            icon={CheckCircle}
            variant="mint"
            trend="Live on platform"
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <StatsCard
            title="Total Inquiries"
            value={dashboardStats.totalInquiries}
            icon={MessageSquare}
            variant="blue"
          />
          <StatsCard
            title="Total Favorites"
            value={dashboardStats.totalFavorites}
            icon={Heart}
            variant="coral"
          />
          <StatsCard
            title="Total Reviews"
            value={dashboardStats.totalReviews}
            icon={Star}
            variant="yellow"
          />
        </div>

        {/* Quick Actions - Improved Design */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
            <TrendingUp className="h-6 w-6 text-purple-500" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/admin/properties/pending')}
              className="group relative bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 border border-purple-200"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-white rounded-xl shadow-sm">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
                <span className="text-2xl font-bold text-purple-600">{dashboardStats.pendingApprovals}</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Pending Approvals</h3>
              <p className="text-sm text-gray-600">Review and approve properties</p>
              <ArrowRight className="absolute bottom-4 right-4 h-5 w-5 text-purple-400 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => navigate('/admin/users')}
              className="group relative bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 border border-pink-200"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-white rounded-xl shadow-sm">
                  <Users className="h-6 w-6 text-pink-600" />
                </div>
                <span className="text-2xl font-bold text-pink-600">{dashboardStats.totalUsers}</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Manage Users</h3>
              <p className="text-sm text-gray-600">View and manage all users</p>
              <ArrowRight className="absolute bottom-4 right-4 h-5 w-5 text-pink-400 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => navigate('/admin/analytics')}
              className="group relative bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 border border-blue-200"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-white rounded-xl shadow-sm">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <Eye className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">View Analytics</h3>
              <p className="text-sm text-gray-600">Detailed platform insights</p>
              <ArrowRight className="absolute bottom-4 right-4 h-5 w-5 text-blue-400 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Recent Activity - Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Properties */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Recent Properties</h2>
              <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm font-medium">
                {dashboardStats.recentProperties.length}
              </span>
            </div>
            {dashboardStats.recentProperties.length === 0 ? (
              <div className="text-center py-12">
                <Building className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No properties yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {dashboardStats.recentProperties.slice(0, 5).map((prop, index) => (
                  <div
                    key={prop.id}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white border border-gray-100 rounded-xl hover:shadow-md transition-all duration-200 cursor-pointer group"
                    onClick={() => navigate(`/properties/${prop.id}`)}
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                        {prop.title}
                      </p>
                      <p className="text-gray-600 text-sm mt-1">{prop.address}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        prop.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-700'
                          : prop.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {prop.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Users */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Recent Users</h2>
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                {dashboardStats.recentUsers.length}
              </span>
            </div>
            {dashboardStats.recentUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No users yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {dashboardStats.recentUsers.slice(0, 5).map((user, index) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white border border-gray-100 rounded-xl hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full text-white font-bold text-sm">
                        {user.firstName[0]}{user.lastName[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-gray-600 text-sm">{user.email}</p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.role === 'ADMIN'
                          ? 'bg-red-100 text-red-700'
                          : user.role === 'OWNER'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {user.role}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* User Role Breakdown - Enhanced Design */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">User Breakdown by Role</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {Object.entries(dashboardStats.usersByRole).length > 0 ? (
              Object.entries(dashboardStats.usersByRole).map(([role, count], index) => {
                const colors = ['purple', 'pink', 'blue']
                const bgColors = ['bg-purple-50', 'bg-pink-50', 'bg-blue-50']
                const textColors = ['text-purple-600', 'text-pink-600', 'text-blue-600']
                const borderColors = ['border-purple-200', 'border-pink-200', 'border-blue-200']

                return (
                  <div
                    key={role}
                    className={`text-center p-6 ${bgColors[index % 3]} ${borderColors[index % 3]} border-2 rounded-2xl transition-all duration-300 hover:shadow-lg hover:scale-105`}
                  >
                    <p className="text-sm text-gray-600 font-medium mb-2">{role}</p>
                    <p className={`text-5xl font-bold ${textColors[index % 3]} mb-2`}>{count}</p>
                    <div className={`h-2 ${bgColors[index % 3]} rounded-full overflow-hidden mt-3`}>
                      <div
                        className={`h-full bg-gradient-to-r ${
                          index % 3 === 0
                            ? 'from-purple-400 to-purple-600'
                            : index % 3 === 1
                            ? 'from-pink-400 to-pink-600'
                            : 'from-blue-400 to-blue-600'
                        }`}
                        style={{ width: `${(count / dashboardStats.totalUsers) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="col-span-3 text-center py-12">
                <p className="text-gray-500">No user data available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
