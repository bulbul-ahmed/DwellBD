import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, Search, MapPin, LogIn, ChevronDown, LogOut, LayoutDashboard, User as UserIcon, Shield, Heart, MessageCircle, Calendar } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, user, logout } = useAuthStore()

  const handleLogout = async () => {
    await logout()
    setIsUserMenuOpen(false)
    navigate('/login')
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (isUserMenuOpen && !target.closest('[data-user-menu]')) {
        setIsUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isUserMenuOpen])

  const navigation = [
    { name: 'Buy', href: '/buy' },
    { name: 'Rent', href: '/rent' },
    { name: 'Sell', href: '/sell' },
  ]

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/')
  }

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-primary-600">BDFlatHub</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden space-x-8 md:flex">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-sm font-medium transition-colors duration-200 ${
                  isActive(item.href) ? 'text-primary-600' : 'text-gray-700 hover:text-primary-600'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Location Search */}
          <div className="hidden items-center space-x-4 lg:flex">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <MapPin className="h-4 w-4 text-gray-400" />
              </div>
              <select className="rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-transparent focus:ring-2 focus:ring-primary-600">
                <option>Dhaka</option>
                <option>Chittagong</option>
                <option>Sylhet</option>
                <option>Rajshahi</option>
                <option>Khulna</option>
              </select>
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {/* Search Button */}
            <button className="p-2 text-gray-500 hover:text-gray-700 lg:hidden">
              <Search className="h-5 w-5" />
            </button>

            {/* User Actions */}
            <div className="hidden items-center space-x-4 md:flex">
              {isAuthenticated && user ? (
                <div className="relative" data-user-menu>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 rounded-lg border border-gray-300 px-3 py-2 transition-colors hover:bg-gray-50"
                  >
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.firstName} className="h-8 w-8 rounded-full" />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-sm font-medium text-white">
                        {user.firstName[0]}
                        {user.lastName[0]}
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-700">{user.firstName}</span>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-lg z-50">
                      <div className="py-1">
                        <Link
                          to="/profile"
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <UserIcon className="h-4 w-4" />
                          <span>Profile</span>
                        </Link>
                        {user.role === 'OWNER' && (
                          <Link
                            to="/dashboard"
                            className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <LayoutDashboard className="h-4 w-4" />
                            <span>Dashboard</span>
                          </Link>
                        )}
                        {user.role === 'ADMIN' && (
                          <Link
                            to="/admin"
                            className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <Shield className="h-4 w-4" />
                            <span>Admin Panel</span>
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="flex items-center space-x-2 text-sm text-gray-700 transition-colors hover:text-primary-600"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>Log in</span>
                  </Link>
                  <Link
                    to="/register"
                    className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-primary-700"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-500 hover:text-gray-700 md:hidden"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="border-t border-gray-200 py-4 md:hidden">
            <div className="space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block text-sm font-medium transition-colors duration-200 ${
                    isActive(item.href)
                      ? 'text-primary-600'
                      : 'text-gray-700 hover:text-primary-600'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="border-t border-gray-200 pt-4">
                {isAuthenticated && user ? (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 px-4 py-2">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.firstName} className="h-8 w-8 rounded-full" />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-sm font-medium text-white">
                          {user.firstName[0]}
                          {user.lastName[0]}
                        </div>
                      )}
                      <span className="text-sm font-medium text-gray-700">{user.firstName}</span>
                    </div>
                    <Link
                      to="/profile"
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <UserIcon className="h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                    <Link
                      to="/favorites"
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Heart className="h-4 w-4" />
                      <span>Saved Properties</span>
                    </Link>
                    <Link
                      to="/inquiries"
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>Inquiries</span>
                    </Link>
                    <Link
                      to="/bookings"
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Calendar className="h-4 w-4" />
                      <span>Bookings</span>
                    </Link>
                    {user.role === 'OWNER' && (
                      <Link
                        to="/dashboard"
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    )}
                    {user.role === 'ADMIN' && (
                      <Link
                        to="/admin"
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Shield className="h-4 w-4" />
                        <span>Admin Panel</span>
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        handleLogout()
                        setIsMenuOpen(false)
                      }}
                      className="flex w-full items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-4">
                    <Link
                      to="/login"
                      className="flex items-center space-x-2 text-sm text-gray-700 transition-colors hover:text-primary-600"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <LogIn className="h-4 w-4" />
                      <span>Log in</span>
                    </Link>
                    <Link
                      to="/register"
                      className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-primary-700"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
