/**
 * React Hooks for Error Handling
 * Provides React-specific error handling utilities and state management
 */

import { useState, useCallback, useEffect, useRef } from 'react'
import { errorHandler, ErrorContext, ErrorHandlingUtils } from './ErrorHandler'
import { AppError, ErrorUtils } from './ErrorTypes'
import { useUIStore } from '@/stores/useUIStore'

export interface UseErrorHandlerOptions {
  context?: ErrorContext
  showNotification?: boolean
  autoRetry?: boolean
  maxRetries?: number
  retryDelay?: number
}

export interface ErrorState {
  error?: AppError
  isRetrying: boolean
  retryCount: number
  canRetry: boolean
}

/**
 * Hook for handling errors in React components
 */
export function useErrorHandler(options: UseErrorHandlerOptions = {}) {
  const { context, showNotification = true, autoRetry = false, maxRetries = 3, retryDelay = 1000 } = options
  const [errorState, setErrorState] = useState<ErrorState>({
    isRetrying: false,
    retryCount: 0,
    canRetry: false
  })
  
  const retryTimeoutRef = useRef<NodeJS.Timeout>()
  const addNotification = useUIStore(state => state.addNotification)

  const handleError = useCallback((error: unknown, errorContext?: ErrorContext) => {
    const appError = errorHandler.handleError(error, { ...context, ...errorContext })
    const canRetry = ErrorUtils.isRetryable(appError) && errorState.retryCount < maxRetries

    setErrorState(prev => ({
      error: appError,
      isRetrying: false,
      retryCount: prev.retryCount,
      canRetry
    }))

    // Show user notification
    if (showNotification) {
      addNotification({
        id: `error-${Date.now()}`,
        type: 'error',
        message: ErrorUtils.getUserMessage(appError),
        duration: 5000
      })
    }

    return appError
  }, [context, showNotification, errorState.retryCount, maxRetries, addNotification])

  const retry = useCallback(async (operation?: () => Promise<any>) => {
    if (!errorState.canRetry || errorState.isRetrying) return

    setErrorState(prev => ({
      ...prev,
      isRetrying: true,
      retryCount: prev.retryCount + 1
    }))

    try {
      if (operation) {
        await operation()
      }
      
      // Clear error on successful retry
      setErrorState({
        isRetrying: false,
        retryCount: 0,
        canRetry: false
      })

      if (showNotification) {
        addNotification({
          id: `retry-success-${Date.now()}`,
          type: 'success',
          message: 'Operation completed successfully',
          duration: 3000
        })
      }
    } catch (error) {
      handleError(error, { operation: 'retry-attempt' })
    }
  }, [errorState.canRetry, errorState.isRetrying, handleError, showNotification, addNotification])

  const clearError = useCallback(() => {
    setErrorState({
      isRetrying: false,
      retryCount: 0,
      canRetry: false
    })
    
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
    }
  }, [])

  // Auto-retry logic
  useEffect(() => {
    if (autoRetry && errorState.error && errorState.canRetry && !errorState.isRetrying) {
      const delay = retryDelay * Math.pow(2, errorState.retryCount) // Exponential backoff
      
      retryTimeoutRef.current = setTimeout(() => {
        retry()
      }, delay)
    }

    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }
    }
  }, [autoRetry, errorState.error, errorState.canRetry, errorState.isRetrying, errorState.retryCount, retryDelay, retry])

  return {
    error: errorState.error,
    isRetrying: errorState.isRetrying,
    canRetry: errorState.canRetry,
    retryCount: errorState.retryCount,
    handleError,
    retry,
    clearError
  }
}

/**
 * Hook for safe async operations with error handling
 */
export function useSafeAsync<T>(
  asyncOperation: () => Promise<T>,
  dependencies: any[] = [],
  options: UseErrorHandlerOptions = {}
) {
  const [data, setData] = useState<T | undefined>(undefined)
  const [loading, setLoading] = useState(false)
  const { error, handleError, retry, clearError, isRetrying } = useErrorHandler(options)

  const execute = useCallback(async () => {
    setLoading(true)
    clearError()

    try {
      const result = await ErrorHandlingUtils.safeAsync(
        asyncOperation,
        undefined,
        options.context
      )
      setData(result)
      return result
    } catch (error) {
      handleError(error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [asyncOperation, handleError, clearError, options.context, ...dependencies])

  const retryOperation = useCallback(async () => {
    return retry(execute)
  }, [retry, execute])

  // Execute on mount and when dependencies change
  useEffect(() => {
    execute().catch(() => {}) // Error is handled by handleError
  }, [execute])

  return {
    data,
    loading: loading || isRetrying,
    error,
    execute,
    retry: retryOperation,
    clearError
  }
}

/**
 * Hook for form error handling
 */
export function useFormErrorHandler() {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | undefined>()

  const handleFieldError = useCallback((field: string, error: unknown) => {
    const appError = errorHandler.handleError(error, {
      component: 'form',
      operation: 'field-validation',
      additionalData: { field }
    })

    setFieldErrors(prev => ({
      ...prev,
      [field]: ErrorUtils.getUserMessage(appError)
    }))
  }, [])

  const handleFormError = useCallback((error: unknown) => {
    const appError = errorHandler.handleError(error, {
      component: 'form',
      operation: 'form-submission'
    })

    setFormError(ErrorUtils.getUserMessage(appError))
  }, [])

  const clearFieldError = useCallback((field: string) => {
    setFieldErrors(prev => {
      const next = { ...prev }
      delete next[field]
      return next
    })
  }, [])

  const clearFormError = useCallback(() => {
    setFormError(undefined)
  }, [])

  const clearAllErrors = useCallback(() => {
    setFieldErrors({})
    setFormError(undefined)
  }, [])

  const hasErrors = Object.keys(fieldErrors).length > 0 || !!formError

  return {
    fieldErrors,
    formError,
    hasErrors,
    handleFieldError,
    handleFormError,
    clearFieldError,
    clearFormError,
    clearAllErrors
  }
}

/**
 * Hook for API error handling with React Query integration
 */
export function useApiErrorHandler() {
  const addNotification = useUIStore(state => state.addNotification)

  const handleQueryError = useCallback((error: unknown, operation?: string) => {
    const appError = errorHandler.handleError(error, {
      component: 'api',
      operation: operation || 'query'
    })

    // Show appropriate notification based on error type
    const message = ErrorUtils.getUserMessage(appError)
    const isRetryable = ErrorUtils.isRetryable(appError)

    addNotification({
      id: `api-error-${Date.now()}`,
      type: 'error',
      message: isRetryable ? `${message} Click to retry.` : message,
      duration: isRetryable ? 0 : 5000 // Don't auto-dismiss retryable errors
    })

    return appError
  }, [addNotification])

  const handleMutationError = useCallback((error: unknown, operation?: string) => {
    const appError = errorHandler.handleError(error, {
      component: 'api',
      operation: operation || 'mutation'
    })

    addNotification({
      id: `mutation-error-${Date.now()}`,
      type: 'error',
      message: ErrorUtils.getUserMessage(appError),
      duration: 5000
    })

    return appError
  }, [addNotification])

  return {
    handleQueryError,
    handleMutationError
  }
}

/**
 * Error boundary hook (for use in functional components)
 */
export function useErrorBoundary() {
  const [error, setError] = useState<Error | undefined>()

  const resetError = useCallback(() => {
    setError(undefined)
  }, [])

  const captureError = useCallback((error: Error) => {
    setError(error)
    errorHandler.handleError(error, {
      component: 'error-boundary',
      operation: 'capture'
    })
  }, [])

  // Throw error to trigger error boundary
  if (error) {
    throw error
  }

  return {
    captureError,
    resetError
  }
}