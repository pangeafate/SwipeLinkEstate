/**
 * Next.js Router Mock for Testing
 * Provides comprehensive mock for next/navigation and next/router
 */

import { vi } from 'vitest'

// Mock for next/navigation (App Router)
export const mockUseRouter = vi.fn(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  prefetch: vi.fn(),
}))

export const mockUsePathname = vi.fn(() => '/')

export const mockUseSearchParams = vi.fn(() => ({
  get: vi.fn(),
  getAll: vi.fn(),
  has: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
  toString: vi.fn(() => ''),
  entries: vi.fn(() => []),
  keys: vi.fn(() => []),
  values: vi.fn(() => []),
  forEach: vi.fn(),
  sort: vi.fn(),
  [Symbol.iterator]: vi.fn(() => [][Symbol.iterator]())
}))

export const mockUseParams = vi.fn(() => ({}))

// Mock for next/router (Pages Router - for compatibility)
export const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  reload: vi.fn(),
  pathname: '/',
  query: {},
  asPath: '/',
  route: '/',
  isReady: true,
  isFallback: false,
  isPreview: false,
  events: {
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn()
  },
  beforePopState: vi.fn(),
  prefetch: vi.fn()
}

// Jest mocks (for Jest compatibility)
export const jestMockUseRouter = jest.fn(() => ({
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  prefetch: jest.fn(),
}))

export const jestMockUsePathname = jest.fn(() => '/')

export const jestMockUseSearchParams = jest.fn(() => ({
  get: jest.fn(),
  getAll: jest.fn(),
  has: jest.fn(),
  set: jest.fn(),
  delete: jest.fn(),
  toString: jest.fn(() => ''),
  entries: jest.fn(() => []),
  keys: jest.fn(() => []),
  values: jest.fn(() => []),
  forEach: jest.fn(),
  sort: jest.fn(),
  [Symbol.iterator]: jest.fn(() => [][Symbol.iterator]())
}))

export const jestMockUseParams = jest.fn(() => ({}))

// Setup function for global router mocking
export function setupRouterMock(mockImplementation?: Partial<ReturnType<typeof mockUseRouter>>) {
  const router = {
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
    ...mockImplementation
  }

  mockUseRouter.mockReturnValue(router)
  
  return router
}

// Reset all router mocks
export function resetRouterMocks() {
  mockUseRouter.mockClear()
  mockUsePathname.mockClear()
  mockUseSearchParams.mockClear()
  mockUseParams.mockClear()
  
  // Reset Jest mocks if using Jest
  if (typeof jest !== 'undefined') {
    jestMockUseRouter.mockClear()
    jestMockUsePathname.mockClear()
    jestMockUseSearchParams.mockClear()
    jestMockUseParams.mockClear()
  }
}

// Default export for convenience
export default {
  useRouter: mockUseRouter,
  usePathname: mockUsePathname,
  useSearchParams: mockUseSearchParams,
  useParams: mockUseParams,
  setupRouterMock,
  resetRouterMocks
}