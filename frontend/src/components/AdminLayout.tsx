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
    return location.pathname.startsWith(path)
  }

  const handleLogout = () => {
    logout()
    window.location.href = '/'
  }

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    {
      path: '/admin/properties',
      label: 'Properties',
      icon: Building,
      subItems: [
        { path: '/admin/properties', label: 'All Properties' },
        { path: '/admin/properties/pending', label: 'Pending Approvals', badge: 'pending' },
      ],
    },
    { path: '/admin/users', label: 'Users', icon: Users },
    { path: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  ]

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b">
            <Link to="/" className="text-xl font-bold text-blue-600">
              BDFlatHub
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 hover:bg-gray-100 rounded"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-6">
            {navItems.map(item => (
              <div key={item.path}>
                {item.subItems ? (
                  <div>
                    <div className="px-6 py-2 text-sm font-semibold text-gray-500 uppercase">
                      <div className="flex items-center">
                        <item.icon className="h-5 w-5 mr-3" />
                        {item.label}
                      </div>
                    </div>
                    <div className="space-y-1">
                      {item.subItems.map(subItem => (
                        <Link
                          key={subItem.path}
                          to={subItem.path}
                          onClick={() => setSidebarOpen(false)}
                          className={`block px-6 py-2 text-sm transition-colors ${
                            isActive(subItem.path)
                              ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{subItem.label}</span>
                            {subItem.badge && (
                              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                                {subItem.badge}
                              </span>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center px-6 py-3 transition-colors ${
                      isActive(item.path)
                        ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="bg-white shadow">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                <Menu className="h-6 w-6" />
              </button>
              <h1 className="ml-4 lg:ml-0 text-2xl font-bold text-gray-900">Admin Panel</h1>
            </div>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg"
              >
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {user?.firstName?.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline text-sm font-medium text-gray-700">
                  {user?.firstName}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-600" />
              </button>

              {/* Dropdown menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50">
                  <div className="p-3 border-b">
                    <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
