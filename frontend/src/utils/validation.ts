/**
 * Email validation
 * Checks for standard email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Bangladeshi phone number validation
 * Accepts formats:
 * - Domestic: 01XXXXXXXXX (11 digits starting with 01)
 * - International: +8801XXXXXXXXX or +880 1XXXXXXXXX
 * - Landline: 02, 03, etc (city codes)
 */
export function isValidBdPhone(phone: string): boolean {
  // Remove spaces, hyphens, and parentheses
  const cleanPhone = phone.replace(/[\s\-()]/g, '')

  // Pattern 1: International format (+8801XXXXXXXXX)
  const internationalPattern = /^\+8801\d{9}$/
  // Pattern 2: Domestic format (01XXXXXXXXX)
  const domesticPattern = /^01[3-9]\d{8}$/
  // Pattern 3: Landline format (0[2-9]XXXXXXXX)
  const landlinePattern = /^0[2-9]\d{7,9}$/

  return (
    internationalPattern.test(cleanPhone) ||
    domesticPattern.test(cleanPhone) ||
    landlinePattern.test(cleanPhone)
  )
}

/**
 * Password validation
 * Minimum 6 characters for login, 8 for registration
 */
export function isValidPassword(password: string, minLength: number = 6): boolean {
  return password.length >= minLength
}

/**
 * Get validation error message
 */
export function getValidationError(field: string, value: string, minLength?: number): string | null {
  if (!value.trim()) {
    return `${field} is required`
  }

  switch (field.toLowerCase()) {
    case 'email':
      return isValidEmail(value) ? null : 'Please enter a valid email address'
    case 'phone':
      return isValidBdPhone(value) ? null : 'Please enter a valid Bangladeshi phone number (e.g., 01712345678 or +8801712345678)'
    case 'password':
      return isValidPassword(value, minLength) ? null : `Password must be at least ${minLength} characters`
    default:
      return null
  }
}

/**
 * Sanitize input to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim()
}

/**
 * Validate number input
 */
export function validateNumber(value: string | number, min?: number, max?: number): boolean {
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return false
  if (min !== undefined && num < min) return false
  if (max !== undefined && num > max) return false
  return true
}

/**
 * Validate property data
 */
export function validatePropertyData(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!data.title || data.title.trim().length < 5) {
    errors.push('Title must be at least 5 characters')
  }
  if (!data.description || data.description.trim().length < 20) {
    errors.push('Description must be at least 20 characters')
  }
  if (!data.address || data.address.trim().length < 10) {
    errors.push('Address must be at least 10 characters')
  }
  if (!validateNumber(data.rentAmount, 1000)) {
    errors.push('Rent amount must be at least 1000 BDT')
  }
  if (data.bedrooms && !validateNumber(data.bedrooms, 0, 20)) {
    errors.push('Bedrooms must be between 0 and 20')
  }
  if (data.bathrooms && !validateNumber(data.bathrooms, 0, 10)) {
    errors.push('Bathrooms must be between 0 and 10')
  }
  if (data.squareFeet && !validateNumber(data.squareFeet, 100, 50000)) {
    errors.push('Square feet must be between 100 and 50,000')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Rate limiting helper for client-side
 */
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map()

  canAttempt(key: string, maxAttempts: number, windowMs: number): boolean {
    const now = Date.now()
    const attempts = this.attempts.get(key) || []

    // Remove old attempts outside the time window
    const recentAttempts = attempts.filter(time => now - time < windowMs)

    if (recentAttempts.length >= maxAttempts) {
      return false
    }

    recentAttempts.push(now)
    this.attempts.set(key, recentAttempts)
    return true
  }

  reset(key: string): void {
    this.attempts.delete(key)
  }
}

export const rateLimiter = new RateLimiter()
