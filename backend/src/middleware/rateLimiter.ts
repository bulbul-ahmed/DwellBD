import rateLimit from 'express-rate-limit'

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development'

// General API rate limiter - 100 requests per 15 minutes (1000 in dev)
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 1000 : 100, // Higher limit in development
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health' || req.path === '/api/health'
  },
})

// Strict rate limiter for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 500 : 50, // Much higher limit in development
  message: 'Too many login/register attempts, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Skip counting successful requests
  skipFailedRequests: false, // Count failed requests
})

// Moderate rate limiter for search and property listing
export const searchLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 500 : 50, // Higher limit in development
  message: 'Too many search requests, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
})

// Strict limiter for sensitive operations (create, update, delete)
export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 200 : 20, // Higher limit in development
  message: 'Too many requests, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
})

// Very strict limiter for password reset and email verification
export const passwordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: isDevelopment ? 50 : 3, // Much higher in development for testing
  message: 'Too many password reset attempts, please try again after 1 hour',
  standardHeaders: true,
  legacyHeaders: false,
})
