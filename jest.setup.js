import '@testing-library/jest-dom'

// Import shared test utilities for global setup
import { SupabaseMockFactory } from './test/mocks/supabase.js'
import { mockModules } from './test/mocks/components.js'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      reload: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return ''
  },
}))

// Mock Supabase client using our centralized factory
// This provides a default success scenario with empty data
// Individual tests can override this by importing and using SupabaseMockFactory
jest.mock('./lib/supabase/client', () => ({
  supabase: SupabaseMockFactory.createSuccessMock([])
}))

// Mock window.matchMedia for responsive components
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock common component libraries using our centralized mocks
// Tests can override these on a per-test basis if needed
jest.mock('next/image', () => mockModules['next/image'])
jest.mock('next/link', () => mockModules['next/link'])
jest.mock('next/head', () => mockModules['next/head'])

// Set up global test environment variables
process.env.NODE_ENV = 'test'
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'

// Global afterEach cleanup
afterEach(() => {
  // Clear all mocks after each test to prevent test pollution
  jest.clearAllMocks()
})

// Console suppression for cleaner test output
// Individual tests can re-enable console methods if needed for debugging
if (process.env.NODE_ENV === 'test') {
  global.console = {
    ...console,
    // Suppress console.log in tests unless explicitly needed
    log: jest.fn(),
    // Keep error and warn for debugging
    error: console.error,
    warn: console.warn,
    info: console.info,
    debug: jest.fn(),
  }
}