import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import path from 'path'
import { prisma } from './models'
import authRoutes from './routes/authRoutes'
import adminRoutes from './routes/adminRoutes'
import propertyRoutes from './routes/propertyRoutes'
import favoriteRoutes from './routes/favoriteRoutes'
import bookingRoutes from './routes/bookingRoutes'
import reviewRoutes from './routes/reviewRoutes'
import inquiryRoutes from './routes/inquiryRoutes'
import ratingRoutes from './routes/ratingRoutes'
import visitRoutes from './routes/visitRoutes'
import requestRoutes from './routes/requestRoutes'
import {
  apiLimiter,
  authLimiter,
  searchLimiter,
  strictLimiter,
  passwordLimiter,
} from './middleware/rateLimiter'
import { requestIdMiddleware } from './middleware/requestId'

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
        imgSrc: ["'self'", 'data:', 'https:', 'http:', 'http://localhost:*'],
        connectSrc: ["'self'", 'http://localhost:*', process.env.FRONTEND_URL || 'http://localhost:3000'],
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

// CORS configuration with multiple allowed origins
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:3002',
  'http://192.168.0.125:3000', // For mobile testing on local network
  'http://192.168.0.125:3002'
].filter(Boolean) // Remove undefined values

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) {
        return callback(null, true)
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        // In development, allow all origins for easier testing
        if (process.env.NODE_ENV === 'development') {
          callback(null, true)
        } else {
          callback(new Error('Not allowed by CORS'))
        }
      }
    },
    credentials: true, // Allow cookies to be sent
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
)

// Body parsing middleware with size limits
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Request ID middleware for tracing (before routes)
app.use(requestIdMiddleware)

// Serve uploaded files statically with CORS headers (for local file storage)
app.use('/uploads', (req, res, next) => {
  // Add CORS headers for uploaded files
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range')
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
  res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none')
  next()
}, express.static(path.join(process.cwd(), 'uploads')))

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
app.use('/api/visits', visitRoutes)
app.use('/api', requestRoutes) // Handles both /api/owner/requests and /api/admin/requests

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
