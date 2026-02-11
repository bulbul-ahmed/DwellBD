import { Request, Response, NextFunction } from 'express'
import { z, ZodError } from 'zod'

/**
 * Validation middleware factory
 * Creates Express middleware that validates request body against a Zod schema
 *
 * @param schema - Zod schema to validate against
 * @returns Express middleware function
 *
 * @example
 * router.post('/register', validate(registerSchema), register)
 */
export const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Parse and validate request body
      // This will throw ZodError if validation fails
      const validatedData = schema.parse(req.body)

      // Replace req.body with validated data (trimmed, transformed)
      req.body = validatedData

      next()
    } catch (error) {
      if (error instanceof ZodError) {
        // Format Zod errors for client
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))

        res.status(400).json({
          message: 'Validation error',
          errors
        })
        return
      }

      // Pass other errors to error handler
      next(error)
    }
  }
}

/**
 * Validates query parameters instead of request body
 * Useful for GET requests with filtering/pagination
 */
export const validateQuery = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validatedData = schema.parse(req.query)
      req.query = validatedData as any
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))

        res.status(400).json({
          message: 'Query validation error',
          errors
        })
        return
      }

      next(error)
    }
  }
}

/**
 * Validates route parameters
 * Useful for validating UUIDs, IDs, etc. in routes like /users/:id
 */
export const validateParams = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validatedData = schema.parse(req.params)
      req.params = validatedData as any
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))

        res.status(400).json({
          message: 'Parameter validation error',
          errors
        })
        return
      }

      next(error)
    }
  }
}
