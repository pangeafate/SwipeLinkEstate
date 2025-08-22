/**
 * Reusable React Query Wrapper for Tests
 * 
 * This wrapper replaces the createWrapper functions found in 6+ test files
 * and provides consistent QueryClient configuration for all tests.
 */

import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

/**
 * Default QueryClient configuration for testing
 * - No retries to speed up tests
 * - No background refetching
 * - Shorter cache times
 */
const DEFAULT_QUERY_CONFIG = {
  defaultOptions: {
    queries: {
      retry: false,
      retryDelay: 0,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      staleTime: 0,
      cacheTime: 0,
    },
    mutations: {
      retry: false,
      retryDelay: 0,
    },
  },
  logger: {
    log: console.log,
    warn: console.warn,
    error: process.env.NODE_ENV === 'test' ? () => {} : console.error,
  },
}

/**
 * Creates a QueryClient with test-optimized configuration
 * @param {Object} customConfig - Custom configuration to merge with defaults
 * @returns {QueryClient} Configured QueryClient instance
 */
export function createTestQueryClient(customConfig = {}) {
  const config = {
    ...DEFAULT_QUERY_CONFIG,
    ...customConfig,
    defaultOptions: {
      ...DEFAULT_QUERY_CONFIG.defaultOptions,
      ...customConfig.defaultOptions,
      queries: {
        ...DEFAULT_QUERY_CONFIG.defaultOptions.queries,
        ...customConfig.defaultOptions?.queries,
      },
      mutations: {
        ...DEFAULT_QUERY_CONFIG.defaultOptions.mutations,
        ...customConfig.defaultOptions?.mutations,
      },
    },
  }

  return new QueryClient(config)
}

/**
 * React Query Test Wrapper Component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to wrap
 * @param {QueryClient} props.client - Optional custom QueryClient
 * @param {Object} props.queryConfig - Optional custom query configuration
 */
export function QueryWrapper({ children, client, queryConfig }) {
  const queryClient = client || createTestQueryClient(queryConfig)
  
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

/**
 * Hook to create a wrapper function for renderHook from @testing-library/react-hooks
 * @param {Object} options - Configuration options
 * @param {QueryClient} options.client - Optional custom QueryClient
 * @param {Object} options.queryConfig - Optional custom query configuration
 * @returns {Function} Wrapper function for renderHook
 */
export function createQueryWrapper(options = {}) {
  const { client, queryConfig } = options
  const queryClient = client || createTestQueryClient(queryConfig)

  return function Wrapper({ children }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )
  }
}

/**
 * Higher-order component for wrapping test components with QueryClient
 * @param {React.ComponentType} Component - Component to wrap
 * @param {Object} options - Configuration options
 * @returns {React.ComponentType} Wrapped component
 */
export function withQueryClient(Component, options = {}) {
  const { client, queryConfig } = options
  
  return function WrappedComponent(props) {
    return (
      <QueryWrapper client={client} queryConfig={queryConfig}>
        <Component {...props} />
      </QueryWrapper>
    )
  }
}

/**
 * Utility function to wait for all queries to be settled
 * @param {QueryClient} queryClient - The QueryClient instance
 * @param {number} timeout - Maximum time to wait in milliseconds
 * @returns {Promise} Promise that resolves when all queries are settled
 */
export async function waitForQueriesToSettle(queryClient, timeout = 5000) {
  const startTime = Date.now()
  
  while (Date.now() - startTime < timeout) {
    const queries = queryClient.getQueryCache().getAll()
    const isAnyFetching = queries.some(query => query.state.isFetching)
    
    if (!isAnyFetching) {
      return
    }
    
    await new Promise(resolve => setTimeout(resolve, 10))
  }
  
  throw new Error(`Queries did not settle within ${timeout}ms`)
}

/**
 * Utility function to clear all query caches and reset state
 * @param {QueryClient} queryClient - The QueryClient instance
 */
export function clearQueryCache(queryClient) {
  queryClient.clear()
  queryClient.resetQueries()
  queryClient.cancelQueries()
}

/**
 * Test utility to mock specific queries with data
 * @param {QueryClient} queryClient - The QueryClient instance
 * @param {Array} mockQueries - Array of query mocks { queryKey, data, error }
 */
export function mockQueries(queryClient, mockQueries = []) {
  mockQueries.forEach(({ queryKey, data, error }) => {
    queryClient.setQueryData(queryKey, data)
    
    if (error) {
      queryClient.setQueryState(queryKey, {
        status: 'error',
        error,
        data: undefined,
      })
    }
  })
}

/**
 * Test utility to simulate query loading states
 * @param {QueryClient} queryClient - The QueryClient instance
 * @param {Array} queryKeys - Array of query keys to set as loading
 */
export function setQueriesLoading(queryClient, queryKeys = []) {
  queryKeys.forEach(queryKey => {
    queryClient.setQueryState(queryKey, {
      status: 'loading',
      isFetching: true,
      data: undefined,
      error: null,
    })
  })
}

/**
 * Preset configurations for different test scenarios
 */
export const queryConfigs = {
  // Fast tests - no delays, no retries
  fast: {
    defaultOptions: {
      queries: {
        retry: false,
        retryDelay: 0,
        staleTime: 0,
        cacheTime: 0,
      },
      mutations: {
        retry: false,
        retryDelay: 0,
      },
    },
  },
  
  // Integration tests - more realistic but still fast
  integration: {
    defaultOptions: {
      queries: {
        retry: 1,
        retryDelay: 10,
        staleTime: 1000,
        cacheTime: 2000,
      },
      mutations: {
        retry: 1,
        retryDelay: 10,
      },
    },
  },
  
  // Error testing - focus on error handling
  errorTesting: {
    defaultOptions: {
      queries: {
        retry: 2,
        retryDelay: 50,
        staleTime: 0,
        cacheTime: 0,
      },
      mutations: {
        retry: 2,
        retryDelay: 50,
      },
    },
  },
}

// Default export for convenience
export default QueryWrapper