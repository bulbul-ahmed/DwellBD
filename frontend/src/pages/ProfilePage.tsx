import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Mail, Phone, Calendar, Edit2, LogOut, Upload } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import RatingSection from '../components/RatingSection'
import { useAuthStore } from '../stores/authStore'
import { getProfile, updateProfile, logout, uploadProfilePhoto } from '../api/userApi'

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
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="mt-2 text-gray-600">View and manage your account information</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-lg shadow-md p-8">
          {/* Avatar Section */}
          <div className="mb-8 text-center">
            <div className="mx-auto w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center mb-4 relative group cursor-pointer">
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
                <User className="w-12 h-12 text-primary-600" />
              )}
              {isEditing && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Upload className="w-6 h-6 text-white" />
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
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {userData.firstName} {userData.lastName}
              </h2>
              <p className="text-gray-600 mt-1">
                {userData.role === 'TENANT' && 'Property Tenant'}
                {userData.role === 'OWNER' && 'Property Owner'}
                {userData.role === 'ADMIN' && 'Administrator'}
              </p>
              {userData.isVerified && (
                <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                  ✓ Verified
                </span>
              )}
              {isEditing && (
                <p className="text-sm text-gray-500 mt-2">Click on your photo to upload a new one</p>
              )}
            </div>
          </div>

          {/* Profile Information */}
          <div className="border-t border-gray-200 pt-8">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                {isEditing ? <Edit2 className="w-5 h-5" /> : <User className="w-5 h-5" />}
                Profile Information
              </h3>

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
                      className="flex-1 bg-primary-600 hover:bg-primary-700"
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
          </div>

          {/* Rating Section */}
          <div className="border-t border-gray-200 pt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Ratings</h3>
            <RatingSection
              userId={userData.id}
              userName={`${userData.firstName} ${userData.lastName}`}
              canRate={false}
            />
          </div>

          {/* Logout Section */}
          <div className="border-t border-gray-200 pt-8">
            <Button
              onClick={handleLogout}
              variant="secondary"
              className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
