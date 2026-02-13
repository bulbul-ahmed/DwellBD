import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Menu,
  X,
  LayoutDashboard,
  Building,
  Users,
  BarChart3,
  LogOut,
  ChevronDown,
  Home,
  Sparkles,
  FileText,
} from 'lucide-react'
import { useAuthStore } from '../stores/authStore'

interface AdminLayoutProps {
  children: React.ReactNode
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const location = useLocation()
  const { user, logout } = useAuthStore()

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin'
    }
    return location.pathname.startsWith(path)
  }

  const handleLogout = () => {
    logout()
    window.location.href = '/'
  }

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, color: 'purple' },
    {
      path: '/admin/properties',
      label: 'Properties',
      icon: Building,
      color: 'pink',
      subItems: [
        { path: '/admin/properties', label: 'All Properties' },
        { path: '/admin/properties/pending', label: 'Pending Approvals', badge: 'pending' },
      ],
    },
    { path: '/admin/users', label: 'Users', icon: Users, color: 'blue' },
    { path: '/admin/requests', label: 'Owner Requests', icon: FileText, color: 'orange' },
    { path: '/admin/analytics', label: 'Analytics', icon: BarChart3, color: 'mint' },
  ]

  return (
    <div className="flex h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white/80 backdrop-blur-xl shadow-2xl transform transition-all duration-300 ease-in-out lg:relative lg:translate-x-0 border-r border-gray-100 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                <Home className="h-5 w-5 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  BDFlatHub
                </span>
                <p className="text-xs text-gray-500 font-medium">Admin Panel</p>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* User Profile Card */}
          <div className="p-4 border-b border-gray-100">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-100">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg">
                  {user?.firstName?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-gray-600">{user?.email}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-white rounded-full text-xs font-semibold text-purple-600 shadow-sm">
                  <Sparkles className="h-3 w-3" />
                  Admin
                </span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {navItems.map(item => {
              const Icon = item.icon
              const activeItem = isActive(item.path)

              const colorClasses = {
                purple: {
                  bg: 'bg-purple-50',
                  text: 'text-purple-600',
                  border: 'border-purple-200',
                  gradient: 'from-purple-500 to-purple-600',
                },
                pink: {
                  bg: 'bg-pink-50',
                  text: 'text-pink-600',
                  border: 'border-pink-200',
                  gradient: 'from-pink-500 to-pink-600',
                },
                blue: {
                  bg: 'bg-blue-50',
                  text: 'text-blue-600',
                  border: 'border-blue-200',
                  gradient: 'from-blue-500 to-blue-600',
                },
                mint: {
                  bg: 'bg-green-50',
                  text: 'text-green-600',
                  border: 'border-green-200',
                  gradient: 'from-green-500 to-green-600',
                },
                orange: {
                  bg: 'bg-orange-50',
                  text: 'text-orange-600',
                  border: 'border-orange-200',
                  gradient: 'from-orange-500 to-orange-600',
                },
              }

              const colors = colorClasses[item.color as keyof typeof colorClasses] || colorClasses.purple

              return (
                <div key={item.path}>
                  {item.subItems ? (
                    <div className="space-y-1">
                      <div className="px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" strokeWidth={2.5} />
                          {item.label}
                        </div>
                      </div>
                      <div className="space-y-1 ml-3">
                        {item.subItems.map(subItem => {
                          const activeSubItem = isActive(subItem.path)
                          return (
                            <Link
                              key={subItem.path}
                              to={subItem.path}
                              onClick={() => setSidebarOpen(false)}
                              className={`group block px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                                activeSubItem
                                  ? `${colors.bg} ${colors.text} shadow-sm border ${colors.border}`
                                  : 'text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span>{subItem.label}</span>
                                {subItem.badge && (
                                  <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full font-semibold">
                                    {subItem.badge}
                                  </span>
                                )}
                              </div>
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                  ) : (
                    <Link
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                        activeItem
                          ? `${colors.bg} ${colors.text} shadow-md border ${colors.border}`
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`p-2 rounded-lg transition-all duration-200 ${
                        activeItem
                          ? `bg-gradient-to-br ${colors.gradient} text-white shadow-lg`
                          : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                      }`}>
                        <Icon className="h-5 w-5" strokeWidth={2.5} />
                      </div>
                      <span className="font-semibold">{item.label}</span>
                    </Link>
                  )}
                </div>
              )
            })}
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-gray-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-semibold hover:from-red-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <LogOut className="h-5 w-5" strokeWidth={2.5} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top bar */}
        <header className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-100 sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-purple-50 rounded-xl transition-colors"
              >
                <Menu className="h-6 w-6 text-purple-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {navItems.find(item => isActive(item.path))?.label || 'Admin Panel'}
                </h1>
                <p className="text-sm text-gray-600">Welcome back, {user?.firstName}! ✨</p>
              </div>
            </div>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-3 px-4 py-2 hover:bg-purple-50 rounded-xl transition-all duration-200 border border-transparent hover:border-purple-200"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-lg">
                  {user?.firstName?.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <span className="block text-sm font-bold text-gray-900">
                    {user?.firstName}
                  </span>
                  <span className="block text-xs text-gray-500">Admin</span>
                </div>
                <ChevronDown className={`h-4 w-4 text-gray-600 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl z-50 border border-gray-100 overflow-hidden">
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white text-lg font-bold">
                        {user?.firstName?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{user?.firstName} {user?.lastName}</p>
                        <p className="text-xs text-gray-600">{user?.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-2">
                    <Link
                      to="/"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 rounded-xl transition-colors font-medium"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Home className="h-4 w-4" />
                      Back to Home
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
