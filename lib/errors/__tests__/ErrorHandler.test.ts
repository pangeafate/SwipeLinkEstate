/**
 * @jest-environment jsdom
 */

import { ErrorHandler, ErrorHandlingUtils, errorHandler } from '../ErrorHandler'
import { AppError, NetworkError, DatabaseError, ValidationError } from '../ErrorTypes'
import { globalMemoryCache } from '@/lib/cache/MemoryCache'

// Mock the UI store
jest.mock('@/stores/useUIStore', () => ({
  useUIStore: (selector: any) => selector({
    addNotification: jest.fn()
  })
}))

describe('ErrorHandler', () => {
  beforeEach(() => {
    // Clear error history and cache
    errorHandler.clearErrorHistory()
    globalMemoryCache.clear()
  })

  describe('handleError', () => {
    it('should handle basic errors and return AppError', () => {
      // ARRANGE
      const originalError = new Error('Test error')

      // ACT
      const result = errorHandler.handleError(originalError, {
        component: 'TestComponent',
        operation: 'testOperation'
      })

      // ASSERT
      expect(result).toBeInstanceOf(AppError)
      expect(result.message).toBe('Test error')
      expect(result.metadata.category).toBeDefined()
      expect(result.metadata.timestamp).toBeDefined()
    })

    it('should handle string errors', () => {
      // ARRANGE
      const errorMessage = 'String error message'

      // ACT
      const result = errorHandler.handleError(errorMessage)

      // ASSERT
      expect(result).toBeInstanceOf(AppError)
      expect(result.message).toBe(errorMessage)
    })

    it('should preserve AppError instances', () => {
      // ARRANGE
      const originalError = new NetworkError('Network error', 500)

      // ACT
      const result = errorHandler.handleError(originalError)

      // ASSERT
      expect(result).toBeInstanceOf(NetworkError)
      expect(result.message).toBe('Network error')
      expect(result.metadata.code).toBe('500')
    })

    it('should cache errors for debugging', () => {
      // ARRANGE
      const error = new Error('Cached error')

      // ACT
      errorHandler.handleError(error)

      // ASSERT
      const stats = globalMemoryCache.getStats()
      const errorKeys = stats.keys.filter(key => key.startsWith('error-'))
      expect(errorKeys.length).toBeGreaterThan(0)
    })
  })

  describe('handleAsyncOperation', () => {
    it('should execute successful async operations', async () => {
      // ARRANGE
      const successfulOperation = jest.fn().mockResolvedValue('success')

      // ACT
      const result = await errorHandler.handleAsyncOperation(successfulOperation, {
        component: 'TestComponent'
      })

      // ASSERT
      expect(result).toBe('success')
      expect(successfulOperation).toHaveBeenCalledTimes(1)
    })

    it('should handle async operation errors', async () => {
      // ARRANGE
      const failingOperation = jest.fn().mockRejectedValue(new Error('Async error'))

      // ACT & ASSERT
      await expect(
        errorHandler.handleAsyncOperation(failingOperation, {
          component: 'TestComponent'
        })
      ).rejects.toThrow('Async error')
    })
  })

  describe('handleSyncOperation', () => {
    it('should execute successful sync operations', () => {
      // ARRANGE
      const successfulOperation = jest.fn().mockReturnValue('sync success')

      // ACT
      const result = errorHandler.handleSyncOperation(successfulOperation, {
        component: 'TestComponent'
      })

      // ASSERT
      expect(result).toBe('sync success')
      expect(successfulOperation).toHaveBeenCalledTimes(1)
    })

    it('should handle sync operation errors', () => {
      // ARRANGE
      const failingOperation = jest.fn().mockImplementation(() => {
        throw new Error('Sync error')
      })

      // ACT & ASSERT
      expect(() =>
        errorHandler.handleSyncOperation(failingOperation, {
          component: 'TestComponent'
        })
      ).toThrow('Sync error')
    })
  })

  describe('getErrorStats', () => {
    it('should return error statistics', () => {
      // ARRANGE
      errorHandler.handleError(new NetworkError('Network error', 500))
      errorHandler.handleError(new DatabaseError('DB error', 'select'))
      errorHandler.handleError(new ValidationError('Validation error', 'email'))

      // ACT
      const stats = errorHandler.getErrorStats()

      // ASSERT
      expect(stats.totalErrors).toBe(3)
      expect(stats.errorsByCategory.network).toBe(1)
      expect(stats.errorsByCategory.database).toBe(1)
      expect(stats.errorsByCategory.validation).toBe(1)
    })

    it('should return empty stats when no errors', () => {
      // ACT
      const stats = errorHandler.getErrorStats()

      // ASSERT
      expect(stats.totalErrors).toBe(0)
      expect(stats.errorsByCategory).toEqual({})
      expect(stats.errorsBySeverity).toEqual({})
      expect(stats.recentErrors).toEqual([])
    })
  })
})

describe('ErrorHandlingUtils', () => {
  describe('safeAsync', () => {
    it('should execute successful async operations', async () => {
      // ARRANGE
      const operation = jest.fn().mockResolvedValue('async result')

      // ACT
      const result = await ErrorHandlingUtils.safeAsync(operation)

      // ASSERT
      expect(result).toBe('async result')
      expect(operation).toHaveBeenCalledTimes(1)
    })

    it('should return fallback on error', async () => {
      // ARRANGE
      const operation = jest.fn().mockRejectedValue(new Error('Async error'))
      const fallback = 'fallback value'

      // ACT
      const result = await ErrorHandlingUtils.safeAsync(operation, fallback)

      // ASSERT
      expect(result).toBe(fallback)
    })

    it('should return undefined when no fallback and error occurs', async () => {
      // ARRANGE
      const operation = jest.fn().mockRejectedValue(new Error('Async error'))

      // ACT
      const result = await ErrorHandlingUtils.safeAsync(operation)

      // ASSERT
      expect(result).toBeUndefined()
    })
  })

  describe('safeSync', () => {
    it('should execute successful sync operations', () => {
      // ARRANGE
      const operation = jest.fn().mockReturnValue('sync result')

      // ACT
      const result = ErrorHandlingUtils.safeSync(operation)

      // ASSERT
      expect(result).toBe('sync result')
      expect(operation).toHaveBeenCalledTimes(1)
    })

    it('should return fallback on error', () => {
      // ARRANGE
      const operation = jest.fn().mockImplementation(() => {
        throw new Error('Sync error')
      })
      const fallback = 'fallback value'

      // ACT
      const result = ErrorHandlingUtils.safeSync(operation, fallback)

      // ASSERT
      expect(result).toBe(fallback)
    })
  })

  describe('getUserMessage', () => {
    it('should return user-friendly messages for different error types', () => {
      // ARRANGE & ACT
      const networkMessage = ErrorHandlingUtils.getUserMessage(new NetworkError('Network error'))
      const dbMessage = ErrorHandlingUtils.getUserMessage(new DatabaseError('DB error'))
      const validationMessage = ErrorHandlingUtils.getUserMessage(new ValidationError('Invalid email'))

      // ASSERT
      expect(networkMessage).toBe('Network connection issue. Please check your connection and try again.')
      expect(dbMessage).toBe('Unable to process request. Please try again later.')
      expect(validationMessage).toBe('Invalid email')
    })
  })

  describe('isRetryable', () => {
    it('should correctly identify retryable errors', () => {
      // ARRANGE
      const networkError500 = new NetworkError('Server error', 500)
      const networkError400 = new NetworkError('Client error', 400)
      const dbError = new DatabaseError('Connection lost')
      const validationError = new ValidationError('Invalid input')

      // ACT & ASSERT
      expect(ErrorHandlingUtils.isRetryable(networkError500)).toBe(true)
      expect(ErrorHandlingUtils.isRetryable(networkError400)).toBe(false)
      expect(ErrorHandlingUtils.isRetryable(dbError)).toBe(true)
      expect(ErrorHandlingUtils.isRetryable(validationError)).toBe(false)
    })
  })
})