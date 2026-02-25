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
  Home,
  FileText,
} from 'lucide-react'
import { useAuthStore } from '../stores/authStore'

interface AdminLayoutProps {
  children: React.ReactNode
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
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
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    {
      path: '/admin/properties',
      label: 'Properties',
      icon: Building,
      subItems: [
        { path: '/admin/properties', label: 'All Properties' },
        { path: '/admin/properties/pending', label: 'Pending Approvals' },
      ],
    },
    { path: '/admin/users', label: 'Users', icon: Users },
    { path: '/admin/requests', label: 'Owner Requests', icon: FileText },
    { path: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  ]

  const initials = `${user?.firstName?.charAt(0) ?? ''}${user?.lastName?.charAt(0) ?? ''}`.toUpperCase()

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Home className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <span className="text-base font-bold text-gray-900">BDFlatHub</span>
              <p className="text-xs text-gray-400 leading-none">Admin Panel</p>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {navItems.map(item => {
            const Icon = item.icon

            if (item.subItems) {
              return (
                <div key={item.path} className="mb-1">
                  <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    <Icon className="h-3.5 w-3.5" />
                    {item.label}
                  </div>
                  <div className="ml-2 space-y-0.5">
                    {item.subItems.map(sub => {
                      const activeSub = isActive(sub.path)
                      return (
                        <Link
                          key={sub.path}
                          to={sub.path}
                          onClick={() => setSidebarOpen(false)}
                          className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            activeSub
                              ? 'bg-gray-100 text-gray-900 border-l-2 border-blue-600 pl-[10px]'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                        >
                          {sub.label}
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )
            }

            const active = isActive(item.path)
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  active
                    ? 'bg-gray-100 text-gray-900 border-l-2 border-blue-600 pl-[10px]'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? 'text-blue-600' : 'text-gray-400'}`} strokeWidth={2} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* User + Logout */}
        <div className="border-t border-gray-200 p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{user?.firstName} {user?.lastName}</p>
              <span className="inline-block text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Admin</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors font-medium"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-md transition-colors"
              >
                <Menu className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  {navItems.find(item => isActive(item.path))?.label || 'Admin Panel'}
                </h1>
                <p className="text-xs text-gray-500">Welcome back, {user?.firstName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/"
                className="hidden sm:flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
              >
                <Home className="h-4 w-4" />
                Back to site
              </Link>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                {initials}
              </div>
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
