/**
 * Next.js Navigation Mocks
 * 
 * Provides mock implementations for Next.js navigation hooks
 * to fix the common "useRouter is not a function" error in tests.
 * 
 * Usage:
 * import { mockNextNavigation } from '@/test/mocks/nextNavigation'
 * 
 * beforeEach(() => {
 *   mockNextNavigation()
 * })
 */

/**
 * Creates a mock router object with all necessary methods
 */
export const createMockRouter = (overrides = {}) => ({
  route: '/',
  pathname: '/',
  query: {},
  asPath: '/',
  basePath: '',
  locale: 'en',
  locales: ['en'],
  defaultLocale: 'en',
  isLocaleDomain: false,
  push: jest.fn(() => Promise.resolve(true)),
  replace: jest.fn(() => Promise.resolve(true)),
  reload: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  prefetch: jest.fn(() => Promise.resolve()),
  beforePopState: jest.fn(),
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
  isFallback: false,
  isReady: true,
  isPreview: false,
  ...overrides
})

/**
 * Creates a mock for useRouter hook
 */
export const createUseRouterMock = (routerOverrides = {}) => {
  const mockRouter = createMockRouter(routerOverrides)
  return jest.fn(() => mockRouter)
}

/**
 * Creates a mock for usePathname hook
 */
export const createUsePathnameMock = (pathname = '/') => {
  return jest.fn(() => pathname)
}

/**
 * Creates a mock for useSearchParams hook
 */
export const createUseSearchParamsMock = (params = {}) => {
  const searchParams = new URLSearchParams(params)
  return jest.fn(() => searchParams)
}

/**
 * Creates a mock for useParams hook
 */
export const createUseParamsMock = (params = {}) => {
  return jest.fn(() => params)
}

/**
 * Creates a mock for redirect function
 */
export const createRedirectMock = () => {
  return jest.fn((url) => {
    throw new Error(`NEXT_REDIRECT: ${url}`)
  })
}

/**
 * Creates a mock for notFound function
 */
export const createNotFoundMock = () => {
  return jest.fn(() => {
    throw new Error('NEXT_NOT_FOUND')
  })
}

/**
 * Sets up all Next.js navigation mocks
 * Call this in beforeEach() to mock all navigation hooks
 */
export const mockNextNavigation = (options = {}) => {
  const {
    router = {},
    pathname = '/',
    searchParams = {},
    params = {},
  } = options

  // Mock next/navigation module
  jest.mock('next/navigation', () => ({
    useRouter: createUseRouterMock(router),
    usePathname: createUsePathnameMock(pathname),
    useSearchParams: createUseSearchParamsMock(searchParams),
    useParams: createUseParamsMock(params),
    redirect: createRedirectMock(),
    notFound: createNotFoundMock(),
  }))

  // Also mock next/router for older components
  jest.mock('next/router', () => ({
    useRouter: createUseRouterMock(router),
  }))

  return {
    router: createMockRouter(router),
    pathname,
    searchParams: new URLSearchParams(searchParams),
    params
  }
}

/**
 * Clears all navigation mocks
 * Call this in afterEach() to clean up
 */
export const clearNavigationMocks = () => {
  jest.unmock('next/navigation')
  jest.unmock('next/router')
}

/**
 * Helper to test navigation calls
 */
export const expectNavigation = {
  /**
   * Expects router.push to have been called with specific args
   */
  toHavePushed: (router, url, options = {}) => {
    expect(router.push).toHaveBeenCalledWith(url, undefined, options)
  },

  /**
   * Expects router.replace to have been called with specific args
   */
  toHaveReplaced: (router, url, options = {}) => {
    expect(router.replace).toHaveBeenCalledWith(url, undefined, options)
  },

  /**
   * Expects router.prefetch to have been called with specific args
   */
  toHavePrefetched: (router, url) => {
    expect(router.prefetch).toHaveBeenCalledWith(url)
  },

  /**
   * Expects router.back to have been called
   */
  toHaveGoneBack: (router) => {
    expect(router.back).toHaveBeenCalled()
  },

  /**
   * Expects no navigation to have occurred
   */
  notToHaveNavigated: (router) => {
    expect(router.push).not.toHaveBeenCalled()
    expect(router.replace).not.toHaveBeenCalled()
    expect(router.back).not.toHaveBeenCalled()
    expect(router.forward).not.toHaveBeenCalled()
  }
}

/**
 * Mock Link component for testing
 */
export const MockLink = ({ children, href, ...props }) => {
  return (
    <a href={href} {...props}>
      {children}
    </a>
  )
}

/**
 * Setup Next.js Image mock
 */
export const mockNextImage = () => {
  jest.mock('next/image', () => ({
    __esModule: true,
    default: (props) => {
      // eslint-disable-next-line jsx-a11y/alt-text
      return <img {...props} />
    },
  }))
}

/**
 * Helper to simulate navigation events
 */
export class NavigationSimulator {
  constructor(router) {
    this.router = router
  }

  /**
   * Simulates a route change start event
   */
  routeChangeStart(url) {
    this.router.events.emit('routeChangeStart', url)
  }

  /**
   * Simulates a route change complete event
   */
  routeChangeComplete(url) {
    this.router.events.emit('routeChangeComplete', url)
  }

  /**
   * Simulates a route change error event
   */
  routeChangeError(err, url) {
    this.router.events.emit('routeChangeError', err, url)
  }

  /**
   * Simulates a before history change event
   */
  beforeHistoryChange(url) {
    this.router.events.emit('beforeHistoryChange', url)
  }

  /**
   * Simulates a hash change start event
   */
  hashChangeStart(url) {
    this.router.events.emit('hashChangeStart', url)
  }

  /**
   * Simulates a hash change complete event
   */
  hashChangeComplete(url) {
    this.router.events.emit('hashChangeComplete', url)
  }
}

// Export all utilities
export default {
  createMockRouter,
  createUseRouterMock,
  createUsePathnameMock,
  createUseSearchParamsMock,
  createUseParamsMock,
  createRedirectMock,
  createNotFoundMock,
  mockNextNavigation,
  clearNavigationMocks,
  expectNavigation,
  MockLink,
  mockNextImage,
  NavigationSimulator
}