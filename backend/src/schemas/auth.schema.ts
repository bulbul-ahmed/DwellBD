import { z } from 'zod'

// Password validation: minimum 8 chars, must have uppercase, lowercase, and digit
const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/\d/, 'Password must contain at least one number')

// Bangladesh phone number format: 01XXXXXXXXX (11 digits starting with 01)
const phoneNumberSchema = z.string()
  .regex(/^01[0-9]{9}$/, 'Invalid Bangladesh phone number format (must be 01XXXXXXXXX)')

// Registration schema
export const registerSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .toLowerCase()
    .trim(),
  password: passwordSchema,
  firstName: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters')
    .trim(),
  lastName: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters')
    .trim(),
  phoneNumber: phoneNumberSchema,
  role: z.enum(['TENANT', 'OWNER'], {
    errorMap: () => ({ message: 'Role must be either TENANT or OWNER' })
  })
  // CRITICAL SECURITY: Never allow ADMIN role from registration!
  // Admins should only be created through database or admin panel
})

// Login schema
export const loginSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(1, 'Password is required')
})

// Refresh token schema
export const refreshTokenSchema = z.object({
  refreshToken: z.string()
    .min(1, 'Refresh token is required')
})

// Password reset request schema
export const passwordResetRequestSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .toLowerCase()
    .trim()
})

// Password reset schema
export const passwordResetSchema = z.object({
  token: z.string()
    .min(1, 'Reset token is required'),
  password: passwordSchema
})

// Update profile schema (for authenticated users)
export const updateProfileSchema = z.object({
  firstName: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters')
    .trim()
    .optional(),
  lastName: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters')
    .trim()
    .optional(),
  phoneNumber: phoneNumberSchema.optional(),
  bio: z.string()
    .max(500, 'Bio must be less than 500 characters')
    .trim()
    .optional()
})

// Type exports for TypeScript
export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>
export type PasswordResetRequestInput = z.infer<typeof passwordResetRequestSchema>
export type PasswordResetInput = z.infer<typeof passwordResetSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
