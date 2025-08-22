/**
 * Centralized Error Handling Service
 * Manages error reporting, logging, and user notifications
 */

import { AppError, ErrorFactory, ErrorUtils, ErrorSeverity } from './ErrorTypes'
import { globalMemoryCache } from '@/lib/cache/MemoryCache'

export interface ErrorHandlerConfig {
  logToConsole?: boolean
  logToService?: boolean
  notifyUser?: boolean
  trackAnalytics?: boolean
}

export interface ErrorContext {
  component?: string
  operation?: string
  userId?: string
  sessionId?: string
  additionalData?: Record<string, any>
}

export class ErrorHandler {
  private static instance: ErrorHandler
  private errorQueue: Array<{ error: AppError; context?: ErrorContext }> = []
  private config: ErrorHandlerConfig = {
    logToConsole: true,
    logToService: process.env.NODE_ENV === 'production',
    notifyUser: true,
    trackAnalytics: true
  }

  private constructor() {
    // Initialize error handler
    this.setupGlobalErrorHandlers()
    this.setupPeriodicErrorProcessing()
  }

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler()
    }
    return ErrorHandler.instance
  }

  /**
   * Handle an error with context
   */
  public handleError(
    error: unknown, 
    context?: ErrorContext, 
    config?: Partial<ErrorHandlerConfig>
  ): AppError {
    const appError = ErrorFactory.fromUnknownError(error, context)
    const effectiveConfig = { ...this.config, ...config }

    // Add to error queue for processing
    this.errorQueue.push({ error: appError, context })

    // Log to console if enabled
    if (effectiveConfig.logToConsole) {
      this.logToConsole(appError, context)
    }

    // Cache error for debugging
    this.cacheError(appError, context)

    // Process error immediately for critical errors
    if (appError.metadata.severity === ErrorSeverity.CRITICAL) {
      this.processErrorImmediately(appError, context, effectiveConfig)
    }

    return appError
  }

  /**
   * Handle async operations with error handling
   */
  public async handleAsyncOperation<T>(
    operation: () => Promise<T>,
    context?: ErrorContext,
    config?: Partial<ErrorHandlerConfig>
  ): Promise<T> {
    try {
      return await operation()
    } catch (error) {
      throw this.handleError(error, context, config)
    }
  }

  /**
   * Handle sync operations with error handling
   */
  public handleSyncOperation<T>(
    operation: () => T,
    context?: ErrorContext,
    config?: Partial<ErrorHandlerConfig>
  ): T {
    try {
      return operation()
    } catch (error) {
      throw this.handleError(error, context, config)
    }
  }

  /**
   * Report error to external services
   */
  public async reportError(
    error: AppError, 
    context?: ErrorContext
  ): Promise<void> {
    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      try {
        await this.sendToErrorTrackingService(error, context)
      } catch (reportingError) {
        console.error('Failed to report error:', reportingError)
      }
    }
  }

  /**
   * Get error statistics
   */
  public getErrorStats(): {
    totalErrors: number
    errorsByCategory: Record<string, number>
    errorsBySeverity: Record<string, number>
    recentErrors: AppError[]
  } {
    const errors = this.getRecentErrorsFromCache()
    
    const errorsByCategory: Record<string, number> = {}
    const errorsBySeverity: Record<string, number> = {}

    errors.forEach(error => {
      errorsByCategory[error.metadata.category] = (errorsByCategory[error.metadata.category] || 0) + 1
      errorsBySeverity[error.metadata.severity] = (errorsBySeverity[error.metadata.severity] || 0) + 1
    })

    return {
      totalErrors: errors.length,
      errorsByCategory,
      errorsBySeverity,
      recentErrors: errors.slice(0, 10) // Last 10 errors
    }
  }

  /**
   * Clear error history
   */
  public clearErrorHistory(): void {
    this.errorQueue = []
    const stats = globalMemoryCache.getStats()
    stats.keys
      .filter(key => key.startsWith('error-'))
      .forEach(key => globalMemoryCache.delete(key))
  }

  private setupGlobalErrorHandlers(): void {
    if (typeof window !== 'undefined') {
      // Handle unhandled promise rejections
      window.addEventListener('unhandledrejection', (event) => {
        const error = ErrorFactory.fromUnknownError(event.reason, {
          type: 'unhandled-promise-rejection',
          source: 'global'
        })
        this.handleError(error, { operation: 'unhandled-promise-rejection' })
        event.preventDefault()
      })

      // Handle uncaught errors
      window.addEventListener('error', (event) => {
        const error = ErrorFactory.fromUnknownError(event.error || event.message, {
          type: 'uncaught-error',
          source: 'global',
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        })
        this.handleError(error, { operation: 'uncaught-error' })
      })
    }
  }

  private setupPeriodicErrorProcessing(): void {
    // Process error queue every 30 seconds
    setInterval(() => {
      this.processErrorQueue()
    }, 30000)
  }

  private processErrorQueue(): void {
    if (this.errorQueue.length === 0) return

    const errors = [...this.errorQueue]
    this.errorQueue = []

    errors.forEach(({ error, context }) => {
      this.processError(error, context)
    })
  }

  private processErrorImmediately(
    error: AppError, 
    context?: ErrorContext,
    config?: ErrorHandlerConfig
  ): void {
    this.processError(error, context, config)
  }

  private processError(
    error: AppError, 
    context?: ErrorContext,
    config?: ErrorHandlerConfig
  ): void {
    const effectiveConfig = { ...this.config, ...config }

    // Send to external service
    if (effectiveConfig.logToService) {
      this.reportError(error, context).catch(console.error)
    }

    // Track analytics
    if (effectiveConfig.trackAnalytics) {
      this.trackErrorAnalytics(error, context)
    }
  }

  private logToConsole(error: AppError, context?: ErrorContext): void {
    const severity = error.metadata.severity
    const method = severity === ErrorSeverity.CRITICAL || severity === ErrorSeverity.HIGH 
      ? console.error 
      : console.warn

    method.call(console, `[${error.name}] ${error.message}`, {
      metadata: error.metadata,
      context,
      stack: error.stack
    })
  }

  private cacheError(error: AppError, context?: ErrorContext): void {
    const errorId = `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    globalMemoryCache.set(errorId, {
      error: error.toJSON(),
      context,
      timestamp: new Date().toISOString()
    }, 60 * 60 * 1000) // Keep for 1 hour
  }

  private async sendToErrorTrackingService(
    error: AppError, 
    context?: ErrorContext
  ): Promise<void> {
    // Placeholder for external error service integration
    // In production, this would send to Sentry, LogRocket, etc.
    console.log('Would send to error tracking service:', {
      error: error.toJSON(),
      context
    })
  }

  private trackErrorAnalytics(error: AppError, context?: ErrorContext): void {
    // Placeholder for analytics tracking
    // In production, this would send to Google Analytics, Mixpanel, etc.
    console.log('Would track error analytics:', {
      event: 'error_occurred',
      category: error.metadata.category,
      severity: error.metadata.severity,
      component: context?.component
    })
  }

  private getRecentErrorsFromCache(): AppError[] {
    const stats = globalMemoryCache.getStats()
    const errors: AppError[] = []

    stats.keys
      .filter(key => key.startsWith('error-'))
      .forEach(key => {
        const cached = globalMemoryCache.get(key)
        if (cached && cached.error) {
          // Reconstruct AppError from cached data
          const error = new AppError(
            cached.error.message,
            cached.error.metadata,
            cached.error.originalError
          )
          errors.push(error)
        }
      })

    return errors.sort((a, b) => 
      new Date(b.metadata.timestamp || 0).getTime() - new Date(a.metadata.timestamp || 0).getTime()
    )
  }
}

// Global error handler instance
export const errorHandler = ErrorHandler.getInstance()

/**
 * Decorator for error handling in class methods
 */
export function withErrorHandling(context?: Omit<ErrorContext, 'operation'>) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value

    descriptor.value = async function (...args: any[]) {
      return errorHandler.handleAsyncOperation(
        () => method.apply(this, args),
        {
          operation: `${target.constructor.name}.${propertyName}`,
          ...context
        }
      )
    }

    return descriptor
  }
}

/**
 * Error handling utilities
 */
export const ErrorHandlingUtils = {
  /**
   * Safe async operation execution
   */
  safeAsync: async <T>(
    operation: () => Promise<T>,
    fallback?: T,
    context?: ErrorContext
  ): Promise<T | undefined> => {
    try {
      return await errorHandler.handleAsyncOperation(operation, context)
    } catch (error) {
      return fallback
    }
  },

  /**
   * Safe sync operation execution
   */
  safeSync: <T>(
    operation: () => T,
    fallback?: T,
    context?: ErrorContext
  ): T | undefined => {
    try {
      return errorHandler.handleSyncOperation(operation, context)
    } catch (error) {
      return fallback
    }
  },

  /**
   * Get user-friendly error message
   */
  getUserMessage: (error: unknown): string => {
    const appError = ErrorFactory.fromUnknownError(error)
    return ErrorUtils.getUserMessage(appError)
  },

  /**
   * Check if error is retryable
   */
  isRetryable: (error: unknown): boolean => {
    const appError = ErrorFactory.fromUnknownError(error)
    return ErrorUtils.isRetryable(appError)
  }
}