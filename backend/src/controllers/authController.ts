import { Request, Response } from 'express'
import { prisma } from '../models'
import { comparePassword, hashPassword } from '../utils/auth'
import { generateToken, JWTPayload } from '../utils/jwt'

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, firstName, lastName, phone } = req.body

    console.log('Registration attempt:', { email, firstName, lastName })

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

    // Generate token
    const token = generateToken({ userId: user.id, email: user.email, role: user.role })

    // Return user without password
    const { password: _, ...userWithoutPassword } = user

    res.status(201).json({
      message: 'User registered successfully',
      token,
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

    console.log('Login attempt:', { email })

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      console.log('User not found:', email)
      res.status(401).json({ error: 'Invalid credentials' })
      return
    }

    console.log('User found:', { id: user.id, email: user.email, role: user.role })

    // Check password
    const isValidPassword = await comparePassword(password, user.password)

    if (!isValidPassword) {
      console.log('Invalid password for:', email)
      res.status(401).json({ error: 'Invalid credentials' })
      return
    }

    console.log('Password valid for:', email)

    // Generate token
    const token = generateToken({ userId: user.id, email: user.email, role: user.role })

    // Return user without password
    const { password: _, ...userWithoutPassword } = user

    console.log('Login successful for:', email)

    res.json({
      message: 'Login successful',
      token,
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
    // Implementation would go here
    res.json({ message: 'Password reset email sent' })
  } catch (error) {
    console.error('Password reset request error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body
    // Implementation would go here
    res.json({ message: 'Password reset successful' })
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
