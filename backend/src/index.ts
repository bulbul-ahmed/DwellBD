import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import { prisma } from './models'
import authRoutes from './routes/authRoutes'
import adminRoutes from './routes/adminRoutes'
import propertyRoutes from './routes/propertyRoutes'
import favoriteRoutes from './routes/favoriteRoutes'
import bookingRoutes from './routes/bookingRoutes'
import reviewRoutes from './routes/reviewRoutes'
import inquiryRoutes from './routes/inquiryRoutes'
import ratingRoutes from './routes/ratingRoutes'
import {
  apiLimiter,
  authLimiter,
  searchLimiter,
  strictLimiter,
  passwordLimiter,
} from './middleware/rateLimiter'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3002

// Enhanced security middleware with Helmet
app.use(
  helmet({
    // Content Security Policy
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
      },
    },
    // Disable X-Powered-By header
    hidePoweredBy: true,
    // Enable HSTS (HTTP Strict Transport Security)
    hsts: {
      maxAge: 31536000, // 1 year in seconds
      includeSubDomains: true,
      preload: true,
    },
    // Enable X-Frame-Options to prevent clickjacking
    frameguard: {
      action: 'deny',
    },
    // Enable X-Content-Type-Options
    noSniff: true,
    // Enable X-XSS-Protection
    xssFilter: true,
  })
)

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
)

// Body parsing middleware with size limits
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Apply general API rate limiter to all API routes
app.use('/api/', apiLimiter)

// Basic routes
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'BD Flat Hub Backend is running' })
})

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'BD Flat Hub API is running' })
})

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/properties', propertyRoutes)
app.use('/api/favorites', favoriteRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/inquiries', inquiryRoutes)
app.use('/api/ratings', ratingRoutes)

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Something went wrong!' })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV}`)
})
