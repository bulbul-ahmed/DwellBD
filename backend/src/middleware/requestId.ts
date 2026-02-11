import { Request, Response, NextFunction } from 'express'
import { v4 as uuidv4 } from 'uuid'

/**
 * Request ID Middleware
 *
 * Generates a unique ID for each request to enable request tracing across logs.
 * The request ID is:
 * - Added to the request object (req.id)
 * - Sent back in response headers (X-Request-ID)
 * - Can be used in logs for debugging and tracing
 *
 * Usage in logs:
 * console.log(`[Request ${req.id}] User logged in`)
 */

// Extend Express Request type to include id
declare global {
  namespace Express {
    interface Request {
      id: string
    }
  }
}

export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Generate unique request ID
  const requestId = uuidv4()

  // Attach to request object
  req.id = requestId

  // Send in response headers for client-side tracing
  res.setHeader('X-Request-ID', requestId)

  // Log request start
  const start = Date.now()

  // Log request completion
  res.on('finish', () => {
    const duration = Date.now() - start
    const logLevel = res.statusCode >= 500 ? 'ERROR' : res.statusCode >= 400 ? 'WARN' : 'INFO'

    console.log(JSON.stringify({
      level: logLevel,
      requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
      userAgent: req.get('user-agent'),
      ip: req.ip
    }))
  })

  next()
}

/**
 * Helper function to create structured log with request ID
 *
 * @example
 * logWithRequestId(req, 'info', 'User login successful', { userId: user.id })
 */
export const logWithRequestId = (
  req: Request,
  level: 'info' | 'warn' | 'error',
  message: string,
  meta?: Record<string, any>
): void => {
  console.log(JSON.stringify({
    level: level.toUpperCase(),
    requestId: req.id,
    message,
    ...meta,
    timestamp: new Date().toISOString()
  }))
}
