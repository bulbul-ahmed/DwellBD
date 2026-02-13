import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Mail, Phone, Calendar, Edit2, LogOut, Upload, MapPin, Building2, Home, MessageCircle, CalendarCheck, Plus, Shield, Star, Clock, FileEdit } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import RatingSection from '../components/RatingSection'
import RequestChangeModal from '../components/RequestChangeModal'
import { StatCard } from '../components/shared/StatCard'
import { SectionHeader } from '../components/shared/SectionHeader'
import { QuickActionCard } from '../components/shared/QuickActionCard'
import { useAuthStore } from '../stores/authStore'
import { getProfile, updateProfile, logout, uploadProfilePhoto } from '../api/userApi'
import { getOwnerStats, getRecentActivity, OwnerStats, Activity } from '../api/ownerApi'
import { RequestType } from '../api/requestApi'

interface UserData {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  avatar?: string
  role: 'TENANT' | 'OWNER' | 'ADMIN'
  isVerified: boolean
  createdAt: string
  serviceAreas?: string[]
  businessName?: string
  businessLocation?: string
}

const ProfilePage = () => {
  const navigate = useNavigate()
  const { logout: authLogout } = useAuthStore()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  // Owner-specific state
  const [ownerStats, setOwnerStats] = useState<OwnerStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<Activity[]>([])
  const [isLoadingStats, setIsLoadingStats] = useState(false)

  // Request modal state
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false)
  const [requestType, setRequestType] = useState<RequestType>('BUSINESS_INFO_CHANGE')

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  })

  // Load user profile
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true)
        const profile = await getProfile()
        setUserData(profile)
        setFormData({
          firstName: profile.firstName,
          lastName: profile.lastName,
          phone: profile.phone || '',
        })
      } catch (error) {
        console.error('Error loading profile:', error)
        toast.error('Failed to load profile')
        navigate('/login')
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [navigate])

  // Load owner stats and activity
  useEffect(() => {
    const loadOwnerData = async () => {
      if (!userData || userData.role !== 'OWNER') return

      setIsLoadingStats(true)
      try {
        const [stats, activity] = await Promise.all([
          getOwnerStats(),
          getRecentActivity(5),
        ])
        setOwnerStats(stats)
        setRecentActivity(activity)
      } catch (error) {
        console.error('Error loading owner data:', error)
        // Don't show error toast, stats are optional
      } finally {
        setIsLoadingStats(false)
      }
    }

    loadOwnerData()
  }, [userData])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Photo size must be less than 5MB')
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (event) => {
      setPhotoPreview(event.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Upload photo
    setIsUploadingPhoto(true)
    try {
      const updated = await uploadProfilePhoto(file)
      setUserData(updated)
      setPhotoPreview(null)
      toast.success('Profile photo uploaded successfully')
    } catch (error) {
      console.error('Error uploading photo:', error)
      toast.error('Failed to upload photo')
      setPhotoPreview(null)
    } finally {
      setIsUploadingPhoto(false)
      // Reset file input
      e.target.value = ''
    }
  }

  const handleSaveProfile = async () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast.error('First name and last name are required')
      return
    }

    setIsSaving(true)
    try {
      const updated = await updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
      })
      setUserData(updated)
      setIsEditing(false)
      toast.success('Profile updated successfully')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = async () => {
    try {
      await authLogout()
      await logout()
      navigate('/')
      toast.success('Logged out successfully')
    } catch (error) {
      console.error('Error logging out:', error)
      toast.error('Failed to log out')
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-primary-600 mx-auto"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium text-gray-900">Profile not found</p>
          <p className="text-gray-600">Please log in again</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Compact Profile Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-start gap-6">
            {/* Compact Avatar */}
            <div className="relative group cursor-pointer flex-shrink-0">
              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center relative">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : userData.avatar ? (
                  <img
                    src={userData.avatar}
                    alt={userData.firstName}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10 text-blue-600" />
                )}
                {isEditing && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Upload className="w-5 h-5 text-white" />
                  </div>
                )}
                {isEditing && (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    disabled={isUploadingPhoto}
                    className="absolute inset-0 rounded-full opacity-0 cursor-pointer"
                  />
                )}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {userData.firstName} {userData.lastName}
              </h1>
              <p className="text-gray-600 mt-1">
                {userData.role === 'TENANT' && 'Property Tenant'}
                {userData.role === 'OWNER' && 'Property Owner'}
                {userData.role === 'ADMIN' && 'Administrator'}
              </p>

              {/* Trust & Verification Badges */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {userData.isVerified && (
                  <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full border border-green-200">
                    <Shield className="w-4 h-4 mr-1.5" />
                    Verified {userData.role === 'OWNER' ? 'Owner' : 'User'}
                  </div>
                )}

                {userData.role === 'OWNER' && ownerStats && ownerStats.totalReviews > 0 && (
                  <div className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full border border-yellow-200">
                    <Star className="w-4 h-4 mr-1.5 fill-current" />
                    {ownerStats.averageRating.toFixed(1)} ({ownerStats.totalReviews}{' '}
                    {ownerStats.totalReviews === 1 ? 'review' : 'reviews'})
                  </div>
                )}

                {userData.role === 'OWNER' && ownerStats && ownerStats.responseRate >= 80 && (
                  <div className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full border border-blue-200">
                    <Clock className="w-4 h-4 mr-1.5" />
                    Responsive ({ownerStats.responseRate}%)
                  </div>
                )}

                <span className="text-sm text-gray-500">
                  Member since{' '}
                  {new Date(userData.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                  })}
                </span>
              </div>

              {isEditing && (
                <p className="text-sm text-gray-500 mt-2">Click on your photo to upload a new one</p>
              )}
            </div>
          </div>
        </div>

        {/* Owner Stats Dashboard - Moved to top */}
        {userData.role === 'OWNER' && (
          <>
            {isLoadingStats ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : ownerStats ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  title="Total Properties"
                  value={ownerStats.totalProperties}
                  icon={Home}
                  variant="light"
                  subtitle="Total listings"
                />
                <StatCard
                  title="Active Listings"
                  value={ownerStats.activeListings}
                  icon={Building2}
                  variant="sky"
                  subtitle="Currently active"
                />
                <StatCard
                  title="Total Inquiries"
                  value={ownerStats.totalInquiries}
                  icon={MessageCircle}
                  variant="indigo"
                  subtitle="All time"
                />
                <StatCard
                  title="Pending Visits"
                  value={ownerStats.pendingVisits}
                  icon={CalendarCheck}
                  variant="cyan"
                  subtitle="Awaiting response"
                />
              </div>
            ) : null}

            {/* Owner Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <SectionHeader title="Quick Actions" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <QuickActionCard
                  title="My Properties"
                  icon={Home}
                  onClick={() => navigate('/my-properties')}
                  variant="light"
                />
                <QuickActionCard
                  title="Inquiries"
                  icon={MessageCircle}
                  onClick={() => navigate('/owner/inquiries')}
                  variant="sky"
                />
                <QuickActionCard
                  title="Visit Requests"
                  icon={CalendarCheck}
                  onClick={() => navigate('/owner/visit-requests')}
                  variant="indigo"
                />
                <button
                  onClick={() => navigate('/my-properties?action=add')}
                  className="flex items-center justify-between p-4 bg-gradient-to-br from-green-500 to-green-600 border-2 border-green-600 rounded-lg hover:from-green-600 hover:to-green-700 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <Plus className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-medium text-white">Add Property</span>
                  </div>
                </button>
              </div>
            </div>
          </>
        )}

        {/* Profile Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <SectionHeader
            title="Profile Information"
            icon={isEditing ? Edit2 : User}
          />

          {isEditing ? (
            <div className="space-y-4">
              <Input
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="Enter first name"
              />
              <Input
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Enter last name"
              />
              <Input
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Enter phone number"
              />
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  onClick={() => {
                    setIsEditing(false)
                    setFormData({
                      firstName: userData.firstName,
                      lastName: userData.lastName,
                      phone: userData.phone || '',
                    })
                  }}
                  variant="secondary"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600">First Name</span>
                <span className="font-medium text-gray-900">{userData.firstName}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600">Last Name</span>
                <span className="font-medium text-gray-900">{userData.lastName}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </span>
                <span className="font-medium text-gray-900">{userData.email}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone
                </span>
                <span className="font-medium text-gray-900">
                  {userData.phone || 'Not provided'}
                </span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-gray-600 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Member Since
                </span>
                <span className="font-medium text-gray-900">
                  {new Date(userData.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <Button
                onClick={() => setIsEditing(true)}
                variant="secondary"
                className="w-full mt-4"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          )}
        </div>

        {/* Owner-Specific Sections */}
        {userData.role === 'OWNER' && (
          <>
            {/* Recent Activity Feed */}
            {recentActivity.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <SectionHeader title="Recent Activity" />
                <div className="space-y-3">
                  {recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors border border-gray-200"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`
                          w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                          ${activity.type === 'INQUIRY'
                            ? 'bg-blue-100'
                            : 'bg-sky-100'
                          }
                        `}>
                          {activity.type === 'INQUIRY' ? (
                            <MessageCircle className="w-5 h-5 text-blue-600" />
                          ) : (
                            <CalendarCheck className="w-5 h-5 text-sky-600" />
                          )}
                        </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                  {activity.type === 'INQUIRY' ? 'New Inquiry' : 'Visit Request'}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                  {activity.propertyTitle} • {activity.propertyArea}
                                </p>
                                {activity.tenantName && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    From: {activity.tenantName}
                                  </p>
                                )}
                              </div>
                              <span className={`
                                px-2 py-1 rounded-full text-xs font-medium flex-shrink-0
                                ${activity.status === 'PENDING'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : activity.status === 'RESPONDED'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                                }
                              `}>
                                {activity.status}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                              {new Date(activity.createdAt).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit',
                              })}
                            </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Service Areas Section */}
            {userData.serviceAreas && userData.serviceAreas.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <SectionHeader title="Service Areas" icon={MapPin} />
                  <button
                    onClick={() => {
                      setRequestType('SERVICE_AREA_CHANGE')
                      setIsRequestModalOpen(true)
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                  >
                    <FileEdit className="w-4 h-4" />
                    Request Change
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {userData.serviceAreas.map((area) => (
                    <span
                      key={area}
                      className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200"
                    >
                      📍 {area}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-3">
                  You manage properties in {userData.serviceAreas.length}{' '}
                  {userData.serviceAreas.length === 1 ? 'area' : 'areas'}
                </p>
              </div>
            )}

            {/* Business Information Section */}
            {userData.businessName && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <SectionHeader title="Business Information" icon={Building2} />
                  <button
                    onClick={() => {
                      setRequestType('BUSINESS_INFO_CHANGE')
                      setIsRequestModalOpen(true)
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                  >
                    <FileEdit className="w-4 h-4" />
                    Request Change
                  </button>
                </div>
                  <div className="bg-gray-50 rounded-lg p-6 space-y-3">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Business Name</p>
                      <p className="text-lg font-medium text-gray-900">{userData.businessName}</p>
                    </div>
                    {userData.businessLocation && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          Office Location
                        </p>
                        <p className="text-gray-900">{userData.businessLocation}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Empty State for Owners without Service Areas/Business Info */}
              {(!userData.serviceAreas || userData.serviceAreas.length === 0) && !userData.businessName && (
                <div className="border-t border-gray-200 pt-8">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                    <Building2 className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">
                      Complete Your Owner Profile
                    </h3>
                    <p className="text-sm text-blue-700 mb-4">
                      Add your service areas and business information to help tenants find you.
                      Contact an administrator to update your owner profile.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

        {/* Rating Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <SectionHeader title="Your Ratings" icon={Star} />
          <RatingSection
            userId={userData.id}
            userName={`${userData.firstName} ${userData.lastName}`}
            canRate={false}
          />
        </div>

        {/* Logout Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <Button
            onClick={handleLogout}
            variant="secondary"
            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Request Change Modal */}
        {userData && userData.role === 'OWNER' && (
          <RequestChangeModal
            isOpen={isRequestModalOpen}
            onClose={() => setIsRequestModalOpen(false)}
            requestType={requestType}
            currentData={userData}
            onSuccess={async () => {
              // Refresh profile data after request submission
              try {
                const profile = await getProfile()
                setUserData(profile)
              } catch (error) {
                console.error('Error refreshing profile:', error)
              }
            }}
          />
        )}
      </div>
    </div>
  )
}

export default ProfilePage
