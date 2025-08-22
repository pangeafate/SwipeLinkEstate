/**
 * Shared Test Setup Utilities
 * 
 * This module provides common setup and teardown utilities for tests,
 * reducing boilerplate code and ensuring consistent test environments.
 */

// Only import cleanup if needed, avoid importing act in the module scope
// since it can cause issues when the module is imported during tests
import { QueryWrapper, createTestQueryClient, clearQueryCache } from './queryWrapper.jsx'
import { SupabaseMockFactory } from '../mocks/supabase.js'
import { mockNextNavigation, clearNavigationMocks } from '../mocks/nextNavigation.js'

/**
 * Global test setup utilities
 */
export class TestSetup {
  static queryClient = null
  static originalConsoleError = null
  static originalConsoleWarn = null

  /**
   * Sets up the test environment before each test
   * @param {Object} options - Configuration options
   */
  static beforeEach(options = {}) {
    const {
      suppressConsoleErrors = true,
      suppressConsoleWarns = false,
      createQueryClient = true,
      mockSupabase = true,
      supabaseMockType = 'success',
      mockNavigation = true,
      navigationOptions = {}
    } = options

    // Suppress console errors/warnings if requested
    if (suppressConsoleErrors) {
      this.originalConsoleError = console.error
      console.error = jest.fn()
    }

    if (suppressConsoleWarns) {
      this.originalConsoleWarn = console.warn
      console.warn = jest.fn()
    }

    // Create a fresh QueryClient for each test
    if (createQueryClient) {
      this.queryClient = createTestQueryClient()
    }

    // Mock Supabase if requested
    if (mockSupabase) {
      this.mockSupabase(supabaseMockType)
    }

    // Mock Next.js navigation if requested
    if (mockNavigation) {
      mockNextNavigation(navigationOptions)
    }

    // Clear any timers
    jest.clearAllTimers()
  }

  /**
   * Cleans up after each test
   */
  static afterEach() {
    // Import cleanup only when needed to avoid hooks issues
    const { cleanup } = require('@testing-library/react')
    
    // Restore console methods
    if (this.originalConsoleError) {
      console.error = this.originalConsoleError
      this.originalConsoleError = null
    }

    if (this.originalConsoleWarn) {
      console.warn = this.originalConsoleWarn
      this.originalConsoleWarn = null
    }

    // Clear QueryClient
    if (this.queryClient) {
      clearQueryCache(this.queryClient)
    }

    // Clear all mocks
    jest.clearAllMocks()

    // Clear navigation mocks
    clearNavigationMocks()

    // React Testing Library cleanup
    cleanup()

    // Clear any pending timers (only if fake timers are active)
    try {
      // Check if fake timers are actually enabled before trying to manage them
      if (jest.isMockFunction(setTimeout)) {
        if (typeof jest.runOnlyPendingTimers === 'function') {
          jest.runOnlyPendingTimers()
        }
        jest.clearAllTimers()
      }
    } catch (e) {
      // Ignore timer errors - they occur when fake timers aren't active
    }
  }

  /**
   * Sets up all tests in a describe block
   * @param {Object} options - Configuration options
   * @returns {Object} Setup utilities for the test suite
   */
  static setupTestSuite(options = {}) {
    beforeEach(() => {
      TestSetup.beforeEach(options)
    })

    afterEach(() => {
      TestSetup.afterEach()
    })

    return {
      getQueryClient: () => TestSetup.queryClient,
      getWrapper: () => ({ children }) => QueryWrapper({ children, client: TestSetup.queryClient })
    }
  }

  /**
   * Mocks Supabase with different scenarios
   * @param {string} type - Mock type ('success', 'error', 'mixed', 'empty')
   * @param {*} data - Data to return (for success scenarios)
   */
  static mockSupabase(type = 'success', data = []) {
    let mockSupabase

    switch (type) {
      case 'success':
        mockSupabase = SupabaseMockFactory.createSuccessMock(data)
        break
      case 'error':
        mockSupabase = SupabaseMockFactory.createErrorMock('Test error')
        break
      case 'mixed':
        mockSupabase = SupabaseMockFactory.createMixedMock()
        break
      case 'empty':
        mockSupabase = SupabaseMockFactory.createSuccessMock([])
        break
      default:
        mockSupabase = SupabaseMockFactory.createSuccessMock(data)
    }

    // Mock the Supabase client module
    jest.doMock('@/lib/supabase/client', () => ({
      supabase: mockSupabase
    }))

    return mockSupabase
  }
}

/**
 * Waits for async operations to complete
 * @param {number} ms - Milliseconds to wait (default: 0 for next tick)
 */
export function waitFor(ms = 0) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Waits for the next React update cycle
 */
export async function waitForNextUpdate() {
  const { act } = require('react-dom/test-utils')
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, 0))
  })
}

/**
 * Flushes all pending promises
 */
export async function flushPromises() {
  const { act } = require('react-dom/test-utils')
  await act(async () => {
    await new Promise(resolve => setImmediate(resolve))
  })
}

/**
 * Mock timer utilities
 */
export const TimerUtils = {
  /**
   * Sets up fake timers for testing
   */
  useFakeTimers() {
    jest.useFakeTimers()
  },

  /**
   * Restores real timers
   */
  useRealTimers() {
    jest.useRealTimers()
  },

  /**
   * Advances timers by specified time
   * @param {number} ms - Milliseconds to advance
   */
  advanceTimers(ms) {
    const { act } = require('react-dom/test-utils')
    act(() => {
      jest.advanceTimersByTime(ms)
    })
  },

  /**
   * Runs all pending timers
   */
  runAllTimers() {
    const { act } = require('react-dom/test-utils')
    act(() => {
      jest.runAllTimers()
    })
  },

  /**
   * Runs only pending timers
   */
  runPendingTimers() {
    const { act } = require('react-dom/test-utils')
    act(() => {
      jest.runOnlyPendingTimers()
    })
  }
}

/**
 * DOM utilities for testing
 */
export const DOMUtils = {
  /**
   * Simulates window resize event
   * @param {number} width - New window width
   * @param {number} height - New window height
   */
  resizeWindow(width, height) {
    global.innerWidth = width
    global.innerHeight = height
    global.dispatchEvent(new Event('resize'))
  },

  /**
   * Simulates media query match
   * @param {string} query - Media query string
   * @param {boolean} matches - Whether the query matches
   */
  mockMediaQuery(query, matches = true) {
    const mockMatchMedia = jest.fn().mockImplementation(q => ({
      matches: q === query ? matches : false,
      media: q,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }))

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia,
    })

    return mockMatchMedia
  },

  /**
   * Simulates scroll events
   * @param {Element} element - Element to scroll
   * @param {number} scrollTop - Scroll position
   */
  simulateScroll(element, scrollTop) {
    element.scrollTop = scrollTop
    element.dispatchEvent(new Event('scroll'))
  },

  /**
   * Gets element by test ID
   * @param {string} testId - Test ID to find
   * @param {Document|Element} container - Container to search within
   */
  getByTestId(testId, container = document) {
    return container.querySelector(`[data-testid="${testId}"]`)
  }
}

/**
 * Network simulation utilities
 */
export const NetworkUtils = {
  /**
   * Simulates network delay
   * @param {number} delay - Delay in milliseconds
   */
  simulateDelay(delay = 100) {
    return new Promise(resolve => setTimeout(resolve, delay))
  },

  /**
   * Simulates network error
   * @param {string} message - Error message
   */
  simulateNetworkError(message = 'Network error') {
    return Promise.reject(new Error(message))
  },

  /**
   * Creates a mock fetch response
   * @param {*} data - Response data
   * @param {number} status - HTTP status code
   * @param {boolean} ok - Whether response is ok
   */
  createMockResponse(data, status = 200, ok = true) {
    return Promise.resolve({
      ok,
      status,
      json: () => Promise.resolve(data),
      text: () => Promise.resolve(JSON.stringify(data))
    })
  }
}

/**
 * Form testing utilities
 */
export const FormUtils = {
  /**
   * Fills out a form field
   * @param {Element} input - Input element
   * @param {string} value - Value to enter
   */
  fillField(input, value) {
    const { fireEvent } = require('@testing-library/react')
    fireEvent.change(input, { target: { value } })
  },

  /**
   * Submits a form
   * @param {Element} form - Form element
   */
  submitForm(form) {
    const { fireEvent } = require('@testing-library/react')
    fireEvent.submit(form)
  },

  /**
   * Creates mock form data
   * @param {Object} data - Form data object
   */
  createFormData(data) {
    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(item => formData.append(key, item))
      } else {
        formData.append(key, value)
      }
    })
    return formData
  }
}

/**
 * Accessibility testing utilities
 */
export const A11yUtils = {
  /**
   * Checks if element has proper ARIA attributes
   * @param {Element} element - Element to check
   * @param {Object} expectedAttrs - Expected ARIA attributes
   */
  checkAriaAttributes(element, expectedAttrs) {
    Object.entries(expectedAttrs).forEach(([attr, value]) => {
      const ariaAttr = attr.startsWith('aria-') ? attr : `aria-${attr}`
      expect(element).toHaveAttribute(ariaAttr, value)
    })
  },

  /**
   * Checks if element is keyboard accessible
   * @param {Element} element - Element to check
   */
  checkKeyboardAccessible(element) {
    expect(element).toHaveAttribute('tabindex')
    expect(element).toBeVisible()
  }
}

/**
 * Performance testing utilities
 */
export const PerformanceUtils = {
  /**
   * Measures render time
   * @param {Function} renderFn - Function that renders component
   */
  async measureRenderTime(renderFn) {
    const start = performance.now()
    await renderFn()
    const end = performance.now()
    return end - start
  },

  /**
   * Creates performance observer mock
   */
  mockPerformanceObserver() {
    const mockObserver = {
      observe: jest.fn(),
      disconnect: jest.fn(),
      takeRecords: jest.fn(() => [])
    }

    global.PerformanceObserver = jest.fn().mockImplementation(() => mockObserver)
    return mockObserver
  }
}

/**
 * Common test patterns and helpers
 */
export const TestPatterns = {
  /**
   * Tests loading states
   * @param {Function} renderHookOrComponent - Render function
   * @param {Object} options - Test options
   */
  async testLoadingState(renderHookOrComponent, options = {}) {
    const { expectLoading = true, timeout = 1000 } = options
    
    const result = renderHookOrComponent()
    
    if (expectLoading) {
      expect(result.current?.isLoading || result.getByTestId?.('loading')).toBeTruthy()
    }
    
    await waitFor(timeout)
  },

  /**
   * Tests error states
   * @param {Function} renderHookOrComponent - Render function
   * @param {Error} error - Error to simulate
   */
  async testErrorState(renderHookOrComponent, error) {
    // Mock console.error to prevent error output
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    
    try {
      const result = renderHookOrComponent()
      await waitFor(100)
      
      expect(result.current?.error || result.getByTestId?.('error')).toBeTruthy()
    } finally {
      consoleSpy.mockRestore()
    }
  },

  /**
   * Tests success states
   * @param {Function} renderHookOrComponent - Render function
   * @param {*} expectedData - Expected success data
   */
  async testSuccessState(renderHookOrComponent, expectedData) {
    const result = renderHookOrComponent()
    await waitFor(100)
    
    expect(result.current?.isSuccess || result.queryByTestId?.('error')).toBeTruthy()
    if (expectedData) {
      expect(result.current?.data).toEqual(expectedData)
    }
  }
}

// Export convenience functions
export const setupTest = TestSetup.setupTestSuite
export const mockSupabase = TestSetup.mockSupabase

export default {
  TestSetup,
  TimerUtils,
  DOMUtils,
  NetworkUtils,
  FormUtils,
  A11yUtils,
  PerformanceUtils,
  TestPatterns,
  waitFor,
  waitForNextUpdate,
  flushPromises,
  setupTest,
  mockSupabase
}