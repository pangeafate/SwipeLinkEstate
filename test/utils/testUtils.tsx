/**
 * Test Utilities for SwipeLinkEstate
 * 
 * Comprehensive testing utilities to prevent common issues:
 * - State management loops
 * - Async operation handling
 * - Mock isolation
 * - Memory leak prevention
 */

import React from 'react'
import { render, RenderOptions, RenderResult } from '@testing-library/react'
import { jest } from '@jest/globals'

// ================================
// MOCK FACTORY UTILITIES
// ================================

/**
 * Creates a stable mock for Zustand stores
 * Prevents infinite re-renders and state update loops
 */
export const createMockZustandStore = <T extends Record<string, any>>(
  initialState: Partial<T>,
  methods: Partial<T> = {}
): T => {
  const mockStore = {
    ...initialState,
    ...methods
  } as T

  // Ensure all methods are jest functions
  Object.keys(methods).forEach(key => {
    if (typeof methods[key] === 'function' && !jest.isMockFunction(methods[key])) {
      mockStore[key] = jest.fn(methods[key])
    }
  })

  return mockStore
}

/**
 * Creates stable React component mocks
 * Prevents component state loops and ensures predictable testing
 */
export const createStableComponentMock = (
  componentName: string,
  renderFn: (props: any) => React.ReactElement | null
) => {
  return jest.fn((props: any) => {
    try {
      return renderFn(props)
    } catch (error) {
      console.warn(`Mock component ${componentName} error:`, error)
      return <div data-testid={`mock-${componentName.toLowerCase()}-error`}>Mock Error</div>
    }
  })
}

// ================================
// ASYNC TESTING UTILITIES
// ================================

/**
 * Waits for async operations to complete with timeout
 */
export const waitForAsync = (
  fn: () => void | Promise<void>,
  timeout = 5000
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`Async operation timed out after ${timeout}ms`))
    }, timeout)

    Promise.resolve(fn()).then(() => {
      clearTimeout(timeoutId)
      resolve()
    }).catch((error) => {
      clearTimeout(timeoutId)
      reject(error)
    })
  })
}

/**
 * Flushes all pending promises and timers
 */
export const flushPromises = async (): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 0))
  await new Promise(resolve => setImmediate(resolve))
}

// ================================
// CLEANUP UTILITIES
// ================================

/**
 * Comprehensive test cleanup function
 * Prevents memory leaks and state pollution between tests
 */
export const cleanupAfterTest = () => {
  // Clear all timers
  jest.clearAllTimers()
  
  // Clear all mocks
  jest.clearAllMocks()
  
  // Clean up localStorage and sessionStorage
  if (typeof window !== 'undefined') {
    window.localStorage.clear()
    window.sessionStorage.clear()
  }
  
  // Reset document
  if (typeof document !== 'undefined') {
    document.body.innerHTML = ''
  }
}

/**
 * Creates a test setup function that runs cleanup automatically
 */
export const createTestSetup = (
  setupFn?: () => void | Promise<void>,
  cleanupFn?: () => void | Promise<void>
) => {
  const setup = async () => {
    if (setupFn) {
      await Promise.resolve(setupFn())
    }
  }

  const cleanup = async () => {
    cleanupAfterTest()
    if (cleanupFn) {
      await Promise.resolve(cleanupFn())
    }
  }

  return { setup, cleanup }
}

// ================================
// RENDER UTILITIES
// ================================

/**
 * Enhanced render function with automatic cleanup and error boundary
 */
export const renderWithCleanup = (
  ui: React.ReactElement,
  options?: RenderOptions
): RenderResult & { cleanup: () => void } => {
  const result = render(ui, options)
  
  const cleanup = () => {
    result.unmount()
    cleanupAfterTest()
  }

  return {
    ...result,
    cleanup
  }
}

/**
 * Error boundary wrapper for testing error states
 */
interface ErrorBoundaryProps {
  children: React.ReactNode
  onError?: (error: Error, errorInfo: any) => void
}

export const TestErrorBoundary: React.FC<ErrorBoundaryProps> = ({ 
  children, 
  onError 
}) => {
  const [hasError, setHasError] = React.useState(false)
  const [error, setError] = React.useState<Error | null>(null)

  React.useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      setHasError(true)
      setError(new Error(event.error?.message || 'Unknown error'))
      if (onError) {
        onError(event.error, { componentStack: event.error?.stack })
      }
    }

    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [onError])

  if (hasError) {
    return (
      <div data-testid="error-boundary">
        <h2>Test Error Boundary</h2>
        <p>{error?.message}</p>
      </div>
    )
  }

  return <>{children}</>
}

/**
 * Render component with error boundary
 */
export const renderWithErrorBoundary = (
  ui: React.ReactElement,
  options?: RenderOptions & { onError?: (error: Error, errorInfo: any) => void }
): RenderResult => {
  const { onError, ...renderOptions } = options || {}
  
  return render(
    <TestErrorBoundary onError={onError}>
      {ui}
    </TestErrorBoundary>,
    renderOptions
  )
}

// ================================
// PROPERTY AND DATA FACTORIES
// ================================

/**
 * Creates test property data with defaults
 */
export const createTestProperty = (overrides: Partial<any> = {}): any => {
  return {
    id: Math.random().toString(36).substr(2, 9),
    address: '123 Test Street',
    price: 500000,
    bedrooms: 3,
    bathrooms: 2,
    area: 1500,
    type: 'house',
    images: ['/test-image.jpg'],
    features: ['garage', 'pool'],
    description: 'Test property description',
    location: {
      lat: 0,
      lng: 0,
      city: 'Test City',
      state: 'TS',
      zip: '12345'
    },
    ...overrides
  }
}

/**
 * Creates multiple test properties
 */
export const createTestProperties = (count: number, baseOverrides: Partial<any> = {}): any[] => {
  return Array.from({ length: count }, (_, index) => 
    createTestProperty({
      ...baseOverrides,
      id: `test-property-${index}`,
      address: `${100 + index} Test Street`
    })
  )
}

// ================================
// MOCK MANAGEMENT
// ================================

/**
 * Mock manager for complex test scenarios
 */
export class MockManager {
  private mocks: Map<string, jest.Mock> = new Map()
  private originalValues: Map<string, any> = new Map()

  /**
   * Add a global mock
   */
  addGlobalMock(key: string, mockValue: any): void {
    if (typeof window !== 'undefined' && key in window) {
      this.originalValues.set(key, (window as any)[key])
      ;(window as any)[key] = mockValue
    }
    
    if (typeof global !== 'undefined' && key in global) {
      this.originalValues.set(key, (global as any)[key])
      ;(global as any)[key] = mockValue
    }
  }

  /**
   * Add a jest mock
   */
  addMock(key: string, mockFn: jest.Mock): void {
    this.mocks.set(key, mockFn)
  }

  /**
   * Get a mock by key
   */
  getMock(key: string): jest.Mock | undefined {
    return this.mocks.get(key)
  }

  /**
   * Clear all mocks
   */
  clearAll(): void {
    this.mocks.forEach(mock => mock.mockClear())
    
    // Restore original values
    this.originalValues.forEach((originalValue, key) => {
      if (typeof window !== 'undefined' && key in window) {
        ;(window as any)[key] = originalValue
      }
      if (typeof global !== 'undefined' && key in global) {
        ;(global as any)[key] = originalValue
      }
    })
    
    this.mocks.clear()
    this.originalValues.clear()
  }

  /**
   * Reset all mocks
   */
  resetAll(): void {
    this.mocks.forEach(mock => mock.mockReset())
  }
}

// ================================
// TEST PERFORMANCE UTILITIES
// ================================

/**
 * Performance timer for test optimization
 */
export class TestPerformanceTimer {
  private startTime: number = 0
  private measurements: Map<string, number> = new Map()

  start(): void {
    this.startTime = performance.now()
  }

  mark(label: string): void {
    const duration = performance.now() - this.startTime
    this.measurements.set(label, duration)
  }

  getResults(): Record<string, number> {
    return Object.fromEntries(this.measurements)
  }

  clear(): void {
    this.measurements.clear()
    this.startTime = 0
  }
}

/**
 * Timeout wrapper for slow tests
 */
export const withTimeout = <T>(
  promise: Promise<T>,
  timeoutMs: number = 10000,
  errorMessage?: string
): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage || `Test timed out after ${timeoutMs}ms`)), timeoutMs)
    )
  ])
}

// ================================
// ACCESSIBILITY TESTING UTILITIES
// ================================

/**
 * Check for basic accessibility violations
 */
export const checkBasicA11y = (container: HTMLElement): string[] => {
  const issues: string[] = []
  
  // Check for missing alt text on images
  const images = container.querySelectorAll('img')
  images.forEach((img, index) => {
    if (!img.getAttribute('alt')) {
      issues.push(`Image ${index} missing alt text`)
    }
  })
  
  // Check for missing labels on form controls
  const inputs = container.querySelectorAll('input, select, textarea')
  inputs.forEach((input, index) => {
    const hasLabel = input.getAttribute('aria-label') || 
                    input.getAttribute('aria-labelledby') ||
                    container.querySelector(`label[for="${input.id}"]`)
    
    if (!hasLabel) {
      issues.push(`Form control ${index} missing label`)
    }
  })
  
  // Check for missing button text
  const buttons = container.querySelectorAll('button')
  buttons.forEach((button, index) => {
    if (!button.textContent?.trim() && !button.getAttribute('aria-label')) {
      issues.push(`Button ${index} missing accessible text`)
    }
  })
  
  return issues
}

export default {
  createMockZustandStore,
  createStableComponentMock,
  waitForAsync,
  flushPromises,
  cleanupAfterTest,
  createTestSetup,
  renderWithCleanup,
  renderWithErrorBoundary,
  TestErrorBoundary,
  createTestProperty,
  createTestProperties,
  MockManager,
  TestPerformanceTimer,
  withTimeout,
  checkBasicA11y
}