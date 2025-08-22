/**
 * Error Types - Refactored to use split modules
 * This maintains backward compatibility while using smaller, focused files
 */

// Re-export everything from split files for backward compatibility
export * from './ErrorDefinitions'
export * from './BaseErrors'
export * from './SpecificErrors'

// Import what we need for the utility classes
import { AppError } from './BaseErrors'
import { ErrorCategory, ErrorSeverity } from './ErrorDefinitions'
import {
  NetworkError,
  DatabaseError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  BusinessLogicError,
  ExternalServiceError
} from './SpecificErrors'

/**
 * Error type guards (backward compatibility)
 */
export const isAppError = (error: any): error is AppError => {
  return error instanceof AppError
}

export const isNetworkError = (error: any): error is NetworkError => {
  return error instanceof NetworkError
}

export const isDatabaseError = (error: any): error is DatabaseError => {
  return error instanceof DatabaseError
}

export const isValidationError = (error: any): error is ValidationError => {
  return error instanceof ValidationError
}

export const isAuthenticationError = (error: any): error is AuthenticationError => {
  return error instanceof AuthenticationError
}

export const isAuthorizationError = (error: any): error is AuthorizationError => {
  return error instanceof AuthorizationError
}

export const isNotFoundError = (error: any): error is NotFoundError => {
  return error instanceof NotFoundError
}

export const isBusinessLogicError = (error: any): error is BusinessLogicError => {
  return error instanceof BusinessLogicError
}

export const isExternalServiceError = (error: any): error is ExternalServiceError => {
  return error instanceof ExternalServiceError
}

/**
 * Factory for creating specific error types
 */
export class ErrorFactory {
  static createError(
    category: ErrorCategory,
    message: string,
    context?: string,
    originalError?: Error
  ): AppError {
    switch (category) {
      case ErrorCategory.NETWORK:
        return new NetworkError(message, context, originalError)
      case ErrorCategory.DATABASE:
        return new DatabaseError(message, context, originalError)
      case ErrorCategory.VALIDATION:
        return new ValidationError(message, context, originalError)
      case ErrorCategory.AUTHENTICATION:
        return new AuthenticationError(message, context, originalError)
      case ErrorCategory.AUTHORIZATION:
        return new AuthorizationError(message, context, originalError)
      case ErrorCategory.NOT_FOUND:
        return new NotFoundError(message, context, originalError)
      case ErrorCategory.BUSINESS_LOGIC:
        return new BusinessLogicError(message, context, originalError)
      case ErrorCategory.EXTERNAL_SERVICE:
        return new ExternalServiceError(message, context, originalError)
      default:
        return new AppError(message, { category, severity: ErrorSeverity.MEDIUM }, originalError)
    }
  }

  static fromHttpResponse(response: Response, context?: Record<string, any>): AppError {
    const status = response.status
    const url = response.url

    let message = `HTTP ${status}: ${response.statusText}`
    
    if (status >= 500) {
      return new NetworkError(message, undefined, undefined)
    } else if (status === 404) {
      return new NotFoundError('Resource not found', 'http_resource')
    } else if (status === 401) {
      return new AuthenticationError('Authentication required')
    } else if (status === 403) {
      return new AuthorizationError('Insufficient permissions')
    } else if (status >= 400) {
      return new ValidationError(`Client error: ${response.statusText}`)
    } else {
      return new NetworkError(message)
    }
  }

  static fromSupabaseError(error: any, operation?: string, context?: Record<string, any>): AppError {
    const message = error?.message || 'Database operation failed'
    
    if (error?.code === 'PGRST116') {
      return new NotFoundError('Record not found', 'database_record')
    }
    
    if (error?.code?.startsWith('42')) {
      return new DatabaseError(`Database error: ${message}`, operation, error)
    }
    
    return new DatabaseError(message, operation, error)
  }

  static fromUnknownError(error: unknown, context?: Record<string, any>): AppError {
    if (isAppError(error)) {
      return error
    }
    
    if (error instanceof Error) {
      return new AppError(error.message, { 
        category: ErrorCategory.UNKNOWN, 
        severity: ErrorSeverity.MEDIUM,
        context
      }, error)
    }
    
    if (typeof error === 'string') {
      return new AppError(error, { 
        category: ErrorCategory.UNKNOWN, 
        severity: ErrorSeverity.MEDIUM,
        context
      })
    }
    
    return new AppError('An unknown error occurred', { 
      category: ErrorCategory.UNKNOWN, 
      severity: ErrorSeverity.MEDIUM,
      context: { originalError: error, ...context }
    })
  }
}

/**
 * Utilities for working with errors
 */
export class ErrorUtils {
  static isAppError(error: unknown): error is AppError {
    return error instanceof AppError
  }

  static getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message
    }
    if (typeof error === 'string') {
      return error
    }
    return 'An unknown error occurred'
  }

  static formatErrorForLogging(error: unknown): Record<string, any> {
    if (error instanceof AppError) {
      return error.toJSON()
    }
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    }
    return { error: String(error) }
  }
}