import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Phone, Lock, User } from 'lucide-react'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import { toast } from 'react-hot-toast'
import { useAuthStore } from '../stores/authStore'
import { isValidEmail, isValidBdPhone, isValidPassword } from '../utils/validation'

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'TENANT' as 'TENANT' | 'OWNER',
  })
  const navigate = useNavigate()
  const { register, isAuthenticated } = useAuthStore()

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/')
    }
  }, [isAuthenticated, navigate])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | string) => {
    let name: string
    let value: string

    if (typeof e === 'string') {
      // Called from Select component with string value
      name = 'role'
      value = e
    } else {
      // Called from Input or native Select with event
      name = e.target.name
      value = e.target.value
    }

    setFormData({
      ...formData,
      [name]: value,
    })
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      })
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // First name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }

    // Last name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!isValidBdPhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid Bangladeshi phone number'
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (!isValidPassword(formData.password, 8)) {
      newErrors.password = 'Password must be at least 8 characters'
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const { confirmPassword, ...registerData } = formData
      await register(registerData)
      toast.success('Registration successful! Redirecting to login...')
      navigate('/')
    } catch (error: any) {
      // Handle specific backend errors
      if (error.response?.status === 409) {
        const field = error.response.data?.field
        const message = error.response.data?.message

        if (field === 'email') {
          setErrors({
            ...errors,
            email: message || 'This email address is already registered',
          })
          toast.error('Email already exists. Please use a different email.')
        } else if (field === 'phone') {
          setErrors({
            ...errors,
            phone: message || 'This phone number is already registered',
          })
          toast.error('Phone number already exists. Please use a different phone.')
        } else {
          toast.error(message || 'This account already exists')
        }
      } else {
        const message =
          error instanceof Error ? error.message : 'Registration failed. Please try again.'
        toast.error(message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const roleOptions = [
    { value: 'TENANT', label: 'Looking for Property (Tenant)' },
    { value: 'OWNER', label: 'Property Owner/Agent' },
  ]

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">Create your account</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
              Sign in
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                placeholder="First name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                icon={<User className="h-4 w-4" />}
                error={errors.firstName}
              />
              <Input
                label="Last Name"
                placeholder="Last name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                icon={<User className="h-4 w-4" />}
                error={errors.lastName}
              />
            </div>

            <Input
              label="Email address"
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
              icon={<Mail className="h-4 w-4" />}
              error={errors.email}
            />

            <Input
              label="Phone Number"
              type="tel"
              name="phone"
              placeholder="01712345678 or +8801712345678"
              value={formData.phone}
              onChange={handleChange}
              required
              icon={<Phone className="h-4 w-4" />}
              error={errors.phone}
              helperText="Bangladeshi format: 01X-XXXXXX or +8801X-XXXXXX"
            />

            <Select
              label="I am a"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              options={roleOptions}
            />

            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Create a password"
                  className={`w-full rounded-lg border py-2 pl-10 pr-10 focus:border-transparent focus:ring-2 ${
                    errors.password
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-primary-600'
                  }`}
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              <p className={`mt-1 text-xs ${errors.password ? 'text-red-600' : 'text-gray-500'}`}>
                {errors.password || 'Password must be at least 8 characters'}
              </p>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Confirm your password"
                  className={`w-full rounded-lg border py-2 pl-10 pr-10 focus:border-transparent focus:ring-2 ${
                    errors.confirmPassword
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-primary-600'
                  }`}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
              required
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
              I agree to the{' '}
              <Link to="/terms" className="text-primary-600 hover:text-primary-500">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-primary-600 hover:text-primary-500">
                Privacy Policy
              </Link>
            </label>
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full bg-primary-600 hover:bg-primary-700"
            loading={isLoading}
          >
            Create Account
          </Button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-gray-50 px-2 text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <Button variant="outline" className="w-full">
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </Button>
            <Button variant="outline" className="w-full">
              <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.404-5.957 1.404-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.097.118.112.221.085.345-.09.372-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.748-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.017 0z" />
              </svg>
              Facebook
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
