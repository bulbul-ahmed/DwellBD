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
