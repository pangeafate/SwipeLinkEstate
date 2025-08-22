/**
 * @jest-environment jsdom
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ErrorBoundary, PageErrorBoundary, FeatureErrorBoundary, ComponentErrorBoundary } from '../ErrorBoundary'

// Mock the global memory cache
jest.mock('@/lib/cache/MemoryCache', () => ({
  globalMemoryCache: {
    set: jest.fn(),
    get: jest.fn(),
    delete: jest.fn(),
    getStats: jest.fn(() => ({ keys: [], size: 0, totalMemoryEstimate: 0 }))
  }
}))

// Component that throws an error
const ThrowError: React.FC<{ shouldThrow?: boolean; error?: Error }> = ({ 
  shouldThrow = true, 
  error = new Error('Test error') 
}) => {
  if (shouldThrow) {
    throw error
  }
  return <div>No error</div>
}

describe('ErrorBoundary', () => {
  // Suppress console errors during tests
  const originalError = console.error
  beforeAll(() => {
    console.error = jest.fn()
  })

  afterAll(() => {
    console.error = originalError
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Basic Error Boundary', () => {
    it('should render children when no error occurs', () => {
      // ACT
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      )

      // ASSERT
      expect(screen.getByText('No error')).toBeInTheDocument()
    })

    it('should render error UI when error occurs', () => {
      // ACT
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      // ASSERT
      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
      expect(screen.getByText('A component error occurred.')).toBeInTheDocument()
    })

    it('should display try again and refresh buttons', () => {
      // ACT
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      // ASSERT
      expect(screen.getByText('Try Again')).toBeInTheDocument()
      expect(screen.getByText('Refresh Page')).toBeInTheDocument()
    })

    it('should show error details in development mode', () => {
      // ARRANGE
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'

      // ACT
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} error={new Error('Detailed test error')} />
        </ErrorBoundary>
      )

      // ASSERT
      expect(screen.getByText('Error Details (Development Only)')).toBeInTheDocument()

      // CLEANUP
      process.env.NODE_ENV = originalEnv
    })

    it('should hide error details in production mode', () => {
      // ARRANGE
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'

      // ACT
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      // ASSERT
      expect(screen.queryByText('Error Details (Development Only)')).not.toBeInTheDocument()

      // CLEANUP
      process.env.NODE_ENV = originalEnv
    })

    it('should call onError callback when provided', () => {
      // ARRANGE
      const mockOnError = jest.fn()

      // ACT
      render(
        <ErrorBoundary onError={mockOnError}>
          <ThrowError shouldThrow={true} error={new Error('Callback test error')} />
        </ErrorBoundary>
      )

      // ASSERT
      expect(mockOnError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.any(String)
        })
      )
    })

    it('should reset error when try again is clicked', () => {
      // ARRANGE
      let shouldThrow = true
      const DynamicThrowError = () => {
        if (shouldThrow) {
          throw new Error('Test error')
        }
        return <div>No error</div>
      }

      const { rerender } = render(
        <ErrorBoundary>
          <DynamicThrowError />
        </ErrorBoundary>
      )

      // Verify error is shown
      expect(screen.getByText('Something went wrong')).toBeInTheDocument()

      // ACT - Click try again and change shouldThrow
      shouldThrow = false
      fireEvent.click(screen.getByText('Try Again'))

      // Re-render with updated component
      rerender(
        <ErrorBoundary>
          <DynamicThrowError />
        </ErrorBoundary>
      )

      // ASSERT
      expect(screen.getByText('No error')).toBeInTheDocument()
      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument()
    })
  })

  describe('Page Error Boundary', () => {
    it('should render page-level error message', () => {
      // ACT
      render(
        <PageErrorBoundary>
          <ThrowError shouldThrow={true} />
        </PageErrorBoundary>
      )

      // ASSERT
      expect(screen.getByText('The page encountered an error and cannot be displayed.')).toBeInTheDocument()
    })
  })

  describe('Feature Error Boundary', () => {
    it('should render feature-specific error message', () => {
      // ACT
      render(
        <FeatureErrorBoundary featureName="Property Search">
          <ThrowError shouldThrow={true} />
        </FeatureErrorBoundary>
      )

      // ASSERT
      expect(screen.getByText('Property Search Temporarily Unavailable')).toBeInTheDocument()
      expect(screen.getByText('We\'re experiencing issues with this feature. Please try again later.')).toBeInTheDocument()
    })

    it('should render children when no error', () => {
      // ACT
      render(
        <FeatureErrorBoundary featureName="Property Search">
          <ThrowError shouldThrow={false} />
        </FeatureErrorBoundary>
      )

      // ASSERT
      expect(screen.getByText('No error')).toBeInTheDocument()
    })
  })

  describe('Component Error Boundary', () => {
    it('should render component error boundary fallback', () => {
      // ACT
      render(
        <ComponentErrorBoundary componentName="PropertyCard">
          <ThrowError shouldThrow={true} />
        </ComponentErrorBoundary>
      )

      // ASSERT
      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
      expect(screen.getByText('A component error occurred.')).toBeInTheDocument()
    })
  })

  describe('Custom Fallback', () => {
    it('should render custom fallback when provided', () => {
      // ARRANGE
      const customFallback = <div>Custom error message</div>

      // ACT
      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      // ASSERT
      expect(screen.getByText('Custom error message')).toBeInTheDocument()
      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument()
    })
  })

  describe('Error ID Generation', () => {
    it('should display error ID for debugging', () => {
      // ACT
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      // ASSERT
      expect(screen.getByText(/Error ID: error-/)).toBeInTheDocument()
    })
  })

  describe('Different Error Levels', () => {
    it('should render appropriate message for each level', () => {
      // Test page level
      const { rerender } = render(
        <ErrorBoundary level="page">
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText('The page encountered an error and cannot be displayed.')).toBeInTheDocument()

      // Test feature level
      rerender(
        <ErrorBoundary level="feature">
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText('This feature is temporarily unavailable.')).toBeInTheDocument()

      // Test component level (default)
      rerender(
        <ErrorBoundary level="component">
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText('A component error occurred.')).toBeInTheDocument()
    })
  })
})