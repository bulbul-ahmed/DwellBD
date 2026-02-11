import { Request, Response } from 'express'
import crypto from 'crypto'
import { prisma } from '../models'
import { comparePassword, hashPassword } from '../utils/auth'
import { generateToken, generateRefreshToken, verifyRefreshToken, JWTPayload } from '../utils/jwt'
import { uploadFileToS3 } from '../utils/s3'
import { sendPasswordResetEmail } from '../services/emailService'

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, firstName, lastName, phone } = req.body

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      res.status(400).json({ error: 'User already exists' })
      return
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        role: 'TENANT'
      }
    })

    // Generate tokens
    const token = generateToken({ userId: user.id, email: user.email, role: user.role })
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email, role: user.role })

    // Return user without password
    const { password: _, ...userWithoutPassword } = user

    res.status(201).json({
      message: 'User registered successfully',
      token,
      refreshToken,
      user: userWithoutPassword
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    })

    // ACCOUNT LOCKOUT: Check if account is locked
    if (user && user.lockedUntil && user.lockedUntil > new Date()) {
      const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / (60 * 1000))
      res.status(403).json({
        error: `Account is locked due to too many failed login attempts. Please try again in ${minutesLeft} minute(s).`
      })
      return
    }

    // TIMING ATTACK PREVENTION:
    // Use a fake hash if user doesn't exist to maintain constant time
    // This prevents attackers from determining if an email exists by measuring response time
    const passwordHash = user?.password || '$2b$10$fakeHashToPreventTimingAttackXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'

    // Always call comparePassword, even if user doesn't exist
    const isValidPassword = await comparePassword(password, passwordHash)

    // Check both conditions together to maintain consistent timing
    if (!user || !isValidPassword) {
      // ACCOUNT LOCKOUT: Increment failed attempts if user exists
      if (user) {
        const failedAttempts = user.failedLoginAttempts + 1
        const maxAttempts = 5
        const lockDuration = 15 // minutes

        if (failedAttempts >= maxAttempts) {
          // Lock account for 15 minutes
          await prisma.user.update({
            where: { id: user.id },
            data: {
              failedLoginAttempts: failedAttempts,
              lockedUntil: new Date(Date.now() + lockDuration * 60 * 1000)
            }
          })

          res.status(403).json({
            error: `Account locked due to too many failed login attempts. Please try again in ${lockDuration} minutes or reset your password.`
          })
          return
        } else {
          // Increment failed attempts
          await prisma.user.update({
            where: { id: user.id },
            data: { failedLoginAttempts: failedAttempts }
          })

          res.status(401).json({
            error: `Invalid credentials. ${maxAttempts - failedAttempts} attempt(s) remaining before account lockout.`
          })
          return
        }
      }

      res.status(401).json({ error: 'Invalid credentials' })
      return
    }

    // Check if user account is active
    if (!user.isActive) {
      res.status(403).json({ error: 'Account has been deactivated. Please contact support.' })
      return
    }

    // SUCCESSFUL LOGIN: Reset failed attempts and unlock account
    if (user.failedLoginAttempts > 0 || user.lockedUntil) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: 0,
          lockedUntil: null
        }
      })
    }

    // Generate tokens
    const token = generateToken({ userId: user.id, email: user.email, role: user.role })
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email, role: user.role })

    // Return user without password
    const { password: _, ...userWithoutPassword } = user

    res.json({
      message: 'Login successful',
      token,
      refreshToken,
      user: userWithoutPassword
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    const { password: _, ...userWithoutPassword } = user
    res.json(userWithoutPassword)
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const requestPasswordReset = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    })

    // SECURITY: Always return success even if user not found
    // This prevents email enumeration attacks
    if (!user) {
      // Still return success to prevent revealing if email exists
      res.json({ message: 'If an account with that email exists, a password reset link has been sent' })
      return
    }

    // Generate secure random token (32 bytes = 64 hex characters)
    const resetToken = crypto.randomBytes(32).toString('hex')

    // Hash token before storing (same as password - never store plain tokens!)
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex')

    // Set expiration to 1 hour from now
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Delete any existing unused password reset tokens for this user
    await prisma.passwordReset.deleteMany({
      where: {
        userId: user.id,
        used: false
      }
    })

    // Create new password reset token
    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        token: hashedToken,
        expiresAt,
        used: false
      }
    })

    // Send email with reset link (using plain token, not hashed)
    await sendPasswordResetEmail(user.email, resetToken, user.firstName)

    // Return success message (generic to prevent email enumeration)
    res.json({ message: 'If an account with that email exists, a password reset link has been sent' })
  } catch (error) {
    console.error('Password reset request error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, password } = req.body

    // Hash the token to match stored version
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

    // Find valid, unused, non-expired reset token
    const resetToken = await prisma.passwordReset.findFirst({
      where: {
        token: hashedToken,
        used: false,
        expiresAt: {
          gt: new Date() // Token must not be expired
        }
      },
      include: {
        user: true
      }
    })

    if (!resetToken) {
      res.status(400).json({ error: 'Invalid or expired reset token' })
      return
    }

    // Hash new password
    const hashedPassword = await hashPassword(password)

    // Update user password and mark token as used
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { password: hashedPassword }
      }),
      prisma.passwordReset.update({
        where: { id: resetToken.id },
        data: { used: true }
      })
    ])

    // Optionally: Delete all other reset tokens for this user
    await prisma.passwordReset.deleteMany({
      where: {
        userId: resetToken.userId,
        id: { not: resetToken.id }
      }
    })

    res.json({ message: 'Password reset successful. You can now log in with your new password.' })
  } catch (error) {
    console.error('Password reset error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId
    const { firstName, lastName, phone, avatar } = req.body

    // Build update object with only provided fields
    const updateData: any = {}
    if (firstName !== undefined) updateData.firstName = firstName
    if (lastName !== undefined) updateData.lastName = lastName
    if (phone !== undefined) updateData.phone = phone
    if (avatar !== undefined) updateData.avatar = avatar

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData
    })

    // Return user without password
    const { password: _, ...userWithoutPassword } = updatedUser

    res.json({
      message: 'Profile updated successfully',
      user: userWithoutPassword
    })
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const uploadProfilePhoto = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId
    const file = req.file

    if (!file) {
      res.status(400).json({ error: 'No file provided' })
      return
    }

    // Validate file type
    if (!file.mimetype.startsWith('image/')) {
      res.status(400).json({ error: 'File must be an image' })
      return
    }

    // Upload to S3
    const avatarUrl = await uploadFileToS3(file, 'profile-photos')

    // Update user with new avatar URL
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarUrl }
    })

    // Return user without password
    const { password: _, ...userWithoutPassword } = updatedUser

    res.json({
      message: 'Profile photo uploaded successfully',
      user: userWithoutPassword
    })
  } catch (error) {
    console.error('Upload profile photo error:', error)
    res.status(500).json({ error: 'Failed to upload profile photo' })
  }
}

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    // JWT is stateless, so logout is handled by frontend clearing the token
    // Backend just confirms the logout was successful
    res.json({ message: 'Logout successful' })
  } catch (error) {
    console.error('Logout error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const refreshTokenEndpoint = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      res.status(401).json({ error: 'Refresh token required' })
      return
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken)

    if (!decoded) {
      res.status(401).json({ error: 'Invalid or expired refresh token' })
      return
    }

    // Verify user still exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!user) {
      res.status(401).json({ error: 'User not found' })
      return
    }

    // Generate new tokens
    const newAccessToken = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    })
    const newRefreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role
    })

    res.json({
      message: 'Token refreshed successfully',
      token: newAccessToken,
      refreshToken: newRefreshToken
    })
  } catch (error) {
    console.error('Refresh token error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
