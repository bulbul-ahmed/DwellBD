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
} from 'lucide-react'
import { getDashboardStats } from '../../api/adminApi'
import StatsCard from '../../components/admin/StatsCard'
import Button from '../../components/ui/Button'

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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700">
        <p>{error || 'Failed to load dashboard'}</p>
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
    <div className="space-y-8">
      {/* Main stats grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Users"
          value={dashboardStats.totalUsers}
          icon={Users}
          variant="default"
        />
        <StatsCard
          title="Total Properties"
          value={dashboardStats.totalProperties}
          icon={Building}
          variant="default"
        />
        <StatsCard
          title="Pending Approvals"
          value={dashboardStats.pendingApprovals}
          icon={Clock}
          variant="warning"
        />
        <StatsCard
          title="Active Properties"
          value={dashboardStats.activeProperties}
          icon={CheckCircle}
          variant="success"
        />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <StatsCard
          title="Total Inquiries"
          value={dashboardStats.totalInquiries}
          icon={MessageSquare}
          variant="default"
        />
        <StatsCard
          title="Total Favorites"
          value={dashboardStats.totalFavorites}
          icon={Heart}
          variant="default"
        />
        <StatsCard
          title="Total Reviews"
          value={dashboardStats.totalReviews}
          icon={Star}
          variant="default"
        />
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={() => navigate('/admin/properties/pending')}
            className="flex-1"
          >
            View Pending Approvals ({dashboardStats.pendingApprovals})
          </Button>
          <Button
            onClick={() => navigate('/admin/users')}
            variant="secondary"
            className="flex-1"
          >
            Manage Users
          </Button>
          <Button
            onClick={() => navigate('/admin/analytics')}
            variant="secondary"
            className="flex-1"
          >
            View Analytics
          </Button>
        </div>
      </div>

      {/* Recent properties */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Properties</h2>
          {dashboardStats.recentProperties.length === 0 ? (
            <p className="text-gray-500 text-sm">No properties yet</p>
          ) : (
            <div className="space-y-3">
              {dashboardStats.recentProperties.slice(0, 5).map(prop => (
                <div key={prop.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{prop.title}</p>
                    <p className="text-gray-600 text-xs">{prop.address}</p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                    {prop.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent users */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Users</h2>
          {dashboardStats.recentUsers.length === 0 ? (
            <p className="text-gray-500 text-sm">No users yet</p>
          ) : (
            <div className="space-y-3">
              {dashboardStats.recentUsers.slice(0, 5).map(user => (
                <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-gray-600 text-xs">{user.email}</p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                    {user.role}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* User role breakdown */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">User Breakdown by Role</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Object.entries(dashboardStats.usersByRole).length > 0 ? (
            Object.entries(dashboardStats.usersByRole).map(([role, count]) => (
              <div key={role} className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">{role}</p>
                <p className="text-2xl font-bold text-gray-900">{count}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm">No user data available</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
