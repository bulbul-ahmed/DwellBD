import { Request, Response } from 'express'
import {
  createUser,
  getUserByEmail,
  verifyPassword,
  updateUserVerification,
} from '../services/userService'
import { generateToken, generateRefreshToken } from '../utils/jwt'
import { prisma } from '../models'

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { email, phone, password, firstName, lastName, role } = req.body

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      res.status(400).json({
        error: 'Validation error',
        message: 'Email, password, firstName, and lastName are required',
      })
      return
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      res.status(409).json({
        error: 'User already exists',
        message: 'An account with this email already exists',
      })
      return
    }

    // Create new user
    const user = await createUser({
      email,
      phone,
      password,
      firstName,
      lastName,
      role: role || 'TENANT',
    })

    // Generate tokens
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      token,
      refreshToken,
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({
      error: 'Registration failed',
      message: error instanceof Error ? error.message : 'An error occurred during registration',
    })
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body

    // Validate required fields
    if (!email || !password) {
      res.status(400).json({
        error: 'Validation error',
        message: 'Email and password are required',
      })
      return
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password',
      })
      return
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password)
    if (!isValidPassword) {
      res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password',
      })
      return
    }

    // Check if account is active
    if (!user.isActive) {
      res.status(403).json({
        error: 'Account disabled',
        message: 'Your account has been disabled',
      })
      return
    }

    // Generate tokens
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isVerified: user.isVerified,
      },
      token,
      refreshToken,
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      error: 'Login failed',
      message: error instanceof Error ? error.message : 'An error occurred during login',
    })
  }
}

export async function getCurrentUser(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated',
      })
      return
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        avatar: true,
        role: true,
        isVerified: true,
        isActive: true,
        createdAt: true,
      },
    })

    if (!user) {
      res.status(404).json({
        error: 'User not found',
        message: 'The user associated with this token was not found',
      })
      return
    }

    res.status(200).json({ user })
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({
      error: 'Failed to get user',
      message: error instanceof Error ? error.message : 'An error occurred',
    })
  }
}

export async function verifyEmail(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated',
      })
      return
    }

    const user = await updateUserVerification(req.user.userId)

    res.status(200).json({
      message: 'Email verified successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isVerified: user.isVerified,
      },
    })
  } catch (error) {
    console.error('Email verification error:', error)
    res.status(500).json({
      error: 'Email verification failed',
      message: error instanceof Error ? error.message : 'An error occurred',
    })
  }
}

export async function refreshAccessToken(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid refresh token',
      })
      return
    }

    const newToken = generateToken({
      userId: req.user.userId,
      email: req.user.email,
      role: req.user.role,
    })

    res.status(200).json({
      message: 'Token refreshed successfully',
      token: newToken,
    })
  } catch (error) {
    console.error('Token refresh error:', error)
    res.status(500).json({
      error: 'Token refresh failed',
      message: error instanceof Error ? error.message : 'An error occurred',
    })
  }
}

export async function logout(req: Request, res: Response): Promise<void> {
  // In a real-world scenario, you might want to invalidate the token
  // by storing it in a blacklist (Redis, database, etc.)
  res.status(200).json({
    message: 'Logout successful',
  })
}
