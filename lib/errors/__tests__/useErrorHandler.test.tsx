/**
 * @jest-environment jsdom
 */

import React from 'react'
import { renderHook, act, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import {
  useErrorHandler,
  useSafeAsync,
  useFormErrorHandler,
  useApiErrorHandler
} from '../useErrorHandler'
import { NetworkError, ValidationError } from '../ErrorTypes'

// Mock UI store
const mockAddNotification = jest.fn()
jest.mock('@/stores/useUIStore', () => ({
  useUIStore: (selector: any) => selector({
    addNotification: mockAddNotification
  })
}))

// Mock error handler
const mockAppError = {
  name: 'AppError',
  message: 'Test error',
  metadata: {
    category: 'unknown',
    severity: 'medium',
    timestamp: new Date().toISOString(),
    context: undefined
  },
  context: undefined,
  stack: 'Test stack'
}

jest.mock('../ErrorHandler', () => ({
  errorHandler: {
    handleError: jest.fn(() => mockAppError),
    clearErrorHistory: jest.fn()
  },
  ErrorHandlingUtils: {
    safeAsync: jest.fn()
  }
}))

// Mock ErrorUtils
jest.mock('../ErrorTypes', () => ({
  ...jest.requireActual('../ErrorTypes'),
  ErrorUtils: {
    isRetryable: jest.fn(() => false),
    getUserMessage: jest.fn(() => 'Test error message')
  }
}))

describe('useErrorHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('basic functionality', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useErrorHandler())

      expect(result.current.error).toBeUndefined()
      expect(result.current.isRetrying).toBe(false)
      expect(result.current.canRetry).toBe(false)
      expect(result.current.retryCount).toBe(0)
    })

    it('should handle errors and show notifications', () => {
      const { result } = renderHook(() => useErrorHandler())
      const testError = new Error('Test error')

      act(() => {
        result.current.handleError(testError)
      })

      expect(mockAddNotification).toHaveBeenCalledWith({
        id: expect.any(String),
        type: 'error',
        message: expect.any(String),
        duration: 5000
      })
    })

    it('should not show notification when disabled', () => {
      const { result } = renderHook(() => useErrorHandler({ showNotification: false }))
      const testError = new Error('Test error')

      act(() => {
        result.current.handleError(testError)
      })

      expect(mockAddNotification).not.toHaveBeenCalled()
    })

    it('should clear errors', () => {
      const { result } = renderHook(() => useErrorHandler())
      const testError = new Error('Test error')

      act(() => {
        result.current.handleError(testError)
      })

      act(() => {
        result.current.clearError()
      })

      expect(result.current.error).toBeUndefined()
      expect(result.current.canRetry).toBe(false)
      expect(result.current.retryCount).toBe(0)
    })
  })

  describe('retry functionality', () => {
    it('should handle retry operation', async () => {
      const mockOperation = jest.fn().mockResolvedValue('success')
      // First, we need to set up error state to enable retry
      const { ErrorUtils } = require('../ErrorTypes')
      ErrorUtils.isRetryable.mockReturnValue(true)
      
      const { result } = renderHook(() => useErrorHandler({ maxRetries: 3 }))

      // First handle an error to enable retry
      act(() => {
        result.current.handleError(new Error('Test error'))
      })

      // Now retry should be available
      await act(async () => {
        await result.current.retry(mockOperation)
      })

      expect(mockOperation).toHaveBeenCalledTimes(1)
      expect(mockAddNotification).toHaveBeenCalledWith({
        id: expect.any(String),
        type: 'success',
        message: 'Operation completed successfully',
        duration: 3000
      })
    })

    it('should not retry when canRetry is false', async () => {
      const mockOperation = jest.fn()
      const { result } = renderHook(() => useErrorHandler())

      await act(async () => {
        await result.current.retry(mockOperation)
      })

      expect(mockOperation).not.toHaveBeenCalled()
    })
  })
})

describe('useSafeAsync', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should execute async operation and return data', async () => {
    const mockOperation = jest.fn().mockResolvedValue('test data')
    const { ErrorHandlingUtils } = require('../ErrorHandler')
    ErrorHandlingUtils.safeAsync.mockResolvedValue('test data')

    const { result } = renderHook(() => useSafeAsync(mockOperation))

    await waitFor(() => {
      expect(result.current.data).toBe('test data')
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeUndefined()
    })
  })

  it('should handle loading state', () => {
    const mockOperation = jest.fn().mockImplementation(() => new Promise(() => {})) // Never resolves
    const { ErrorHandlingUtils } = require('../ErrorHandler')
    ErrorHandlingUtils.safeAsync.mockImplementation(() => new Promise(() => {}))

    const { result } = renderHook(() => useSafeAsync(mockOperation))

    expect(result.current.loading).toBe(true)
    expect(result.current.data).toBeUndefined()
  })
})

describe('useFormErrorHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should initialize with no errors', () => {
    const { result } = renderHook(() => useFormErrorHandler())

    expect(result.current.fieldErrors).toEqual({})
    expect(result.current.formError).toBeUndefined()
    expect(result.current.hasErrors).toBe(false)
  })

  it('should handle field errors', () => {
    const { result } = renderHook(() => useFormErrorHandler())
    const testError = new ValidationError('Invalid email')

    act(() => {
      result.current.handleFieldError('email', testError)
    })

    expect(result.current.fieldErrors.email).toBeDefined()
    expect(result.current.hasErrors).toBe(true)
  })

  it('should handle form errors', () => {
    const { result } = renderHook(() => useFormErrorHandler())
    const testError = new Error('Form submission failed')

    act(() => {
      result.current.handleFormError(testError)
    })

    expect(result.current.formError).toBeDefined()
    expect(result.current.hasErrors).toBe(true)
  })

  it('should clear field errors', () => {
    const { result } = renderHook(() => useFormErrorHandler())

    act(() => {
      result.current.handleFieldError('email', new Error('Invalid email'))
    })

    act(() => {
      result.current.clearFieldError('email')
    })

    expect(result.current.fieldErrors.email).toBeUndefined()
    expect(result.current.hasErrors).toBe(false)
  })

  it('should clear all errors', () => {
    const { result } = renderHook(() => useFormErrorHandler())

    act(() => {
      result.current.handleFieldError('email', new Error('Invalid email'))
      result.current.handleFormError(new Error('Form error'))
    })

    act(() => {
      result.current.clearAllErrors()
    })

    expect(result.current.fieldErrors).toEqual({})
    expect(result.current.formError).toBeUndefined()
    expect(result.current.hasErrors).toBe(false)
  })
})

describe('useApiErrorHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should handle query errors with notifications', () => {
    // Mock isRetryable to return true for this test
    const { ErrorUtils } = require('../ErrorTypes')
    ErrorUtils.isRetryable.mockReturnValue(true)
    ErrorUtils.getUserMessage.mockReturnValue('Network error')

    const { result } = renderHook(() => useApiErrorHandler())
    const testError = new Error('Network error')

    act(() => {
      result.current.handleQueryError(testError, 'fetchData')
    })

    expect(mockAddNotification).toHaveBeenCalledWith({
      id: expect.any(String),
      type: 'error',
      message: 'Network error Click to retry.',
      duration: 0
    })
  })

  it('should handle mutation errors', () => {
    const { ErrorUtils } = require('../ErrorTypes')
    ErrorUtils.getUserMessage.mockReturnValue('Mutation failed')

    const { result } = renderHook(() => useApiErrorHandler())
    const testError = new Error('Mutation failed')

    act(() => {
      result.current.handleMutationError(testError, 'updateData')
    })

    expect(mockAddNotification).toHaveBeenCalledWith({
      id: expect.any(String),
      type: 'error',
      message: 'Mutation failed',
      duration: 5000
    })
  })
})