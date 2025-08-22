/**
 * @jest-environment jsdom
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { QueryClient } from '@tanstack/react-query'
import { QueryClientProvider } from '@tanstack/react-query'
import { AppQueryClient, EnhancedQueryClient, enhancedQueryClient } from '../queryClient'
import { globalMemoryCache } from '@/lib/cache/MemoryCache'

// Mock the memory cache
jest.mock('@/lib/cache/MemoryCache', () => ({
  globalMemoryCache: {
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    getStats: jest.fn(() => ({
      size: 10,
      hits: 50,
      misses: 25
    }))
  }
}))

describe('QueryClient Configuration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should create a query client with correct default configuration', () => {
    // ARRANGE & ACT
    const queryClient = AppQueryClient

    // ASSERT
    expect(queryClient).toBeInstanceOf(QueryClient)
    expect(queryClient.getDefaultOptions().queries?.staleTime).toBe(5 * 60 * 1000) // 5 minutes
    expect(queryClient.getDefaultOptions().queries?.gcTime).toBe(10 * 60 * 1000) // 10 minutes
  })

  it('should render QueryClientProvider wrapper correctly', () => {
    // ARRANGE
    const TestComponent = () => <div>Test Content</div>
    
    // ACT
    render(
      <QueryClientProvider client={AppQueryClient}>
        <TestComponent />
      </QueryClientProvider>
    )

    // ASSERT
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('should have proper retry configuration for queries', () => {
    // ARRANGE & ACT
    const queryClient = AppQueryClient
    const defaultOptions = queryClient.getDefaultOptions()

    // ASSERT - retry is now a function for smart retry logic
    expect(typeof defaultOptions.queries?.retry).toBe('function')
    expect(defaultOptions.queries?.retryDelay).toBeDefined()
    
    // Test the retry function behavior
    const retryFn = defaultOptions.queries?.retry as (failureCount: number, error: any) => boolean
    expect(retryFn(1, { status: 404 })).toBe(false) // Don't retry 4xx errors
    expect(retryFn(1, { status: 500 })).toBe(true) // Retry 5xx errors
    expect(retryFn(4, { status: 500 })).toBe(false) // Don't retry after 3 attempts
  })

  it('should have proper retry configuration for mutations', () => {
    // ARRANGE & ACT
    const queryClient = AppQueryClient
    const defaultOptions = queryClient.getDefaultOptions()

    // ASSERT
    expect(typeof defaultOptions.mutations?.retry).toBe('function')
    expect(defaultOptions.mutations?.retryDelay).toBeDefined()
    
    // Test mutation retry function behavior
    const retryFn = defaultOptions.mutations?.retry as (failureCount: number, error: any) => boolean
    expect(retryFn(1, { status: 400 })).toBe(false) // Don't retry 4xx errors
    expect(retryFn(1, { status: 500 })).toBe(true) // Retry 5xx errors
    expect(retryFn(3, { status: 500 })).toBe(false) // Don't retry after 2 attempts (mutations have lower limit)
  })

  it('should test retry delay function', () => {
    // ARRANGE
    const defaultOptions = AppQueryClient.getDefaultOptions()
    const retryDelayFn = defaultOptions.queries?.retryDelay as (attemptIndex: number) => number

    // ACT & ASSERT
    expect(retryDelayFn(0)).toBe(1000) // First retry: 1s
    expect(retryDelayFn(1)).toBe(2000) // Second retry: 2s
    expect(retryDelayFn(2)).toBe(4000) // Third retry: 4s
    expect(retryDelayFn(10)).toBe(30000) // Cap at 30s
  })

  it('should have proper refetch configuration', () => {
    // ARRANGE & ACT
    const queryClient = AppQueryClient
    const defaultOptions = queryClient.getDefaultOptions()

    // ASSERT
    expect(defaultOptions.queries?.refetchOnWindowFocus).toBe(false)
    expect(defaultOptions.queries?.refetchOnMount).toBe(true)
    expect(defaultOptions.queries?.refetchOnReconnect).toBe(true)
    expect(defaultOptions.queries?.networkMode).toBe('online')
  })

  it('should have proper network mode configuration', () => {
    // ARRANGE & ACT
    const defaultOptions = AppQueryClient.getDefaultOptions()

    // ASSERT
    expect(defaultOptions.queries?.networkMode).toBe('online')
    expect(defaultOptions.mutations?.networkMode).toBe('online')
  })
})

describe('EnhancedQueryClient', () => {
  let mockQueryClient: jest.Mocked<QueryClient>
  let enhancedClient: EnhancedQueryClient

  beforeEach(() => {
    jest.clearAllMocks()
    
    mockQueryClient = {
      getQueryData: jest.fn(),
      setQueryData: jest.fn(),
      invalidateQueries: jest.fn(),
      getQueryCache: jest.fn(() => ({ getAll: jest.fn(() => [1, 2, 3]) })),
      getMutationCache: jest.fn(() => ({ getAll: jest.fn(() => [1, 2]) })),
    } as any

    enhancedClient = new EnhancedQueryClient(mockQueryClient)
  })

  describe('getQueryData', () => {
    it('should return data from React Query cache when available', async () => {
      // ARRANGE
      const queryKey = ['test', 'key']
      const testData = { id: 1, name: 'test' }
      mockQueryClient.getQueryData.mockReturnValue(testData)

      // ACT
      const result = await enhancedClient.getQueryData(queryKey)

      // ASSERT
      expect(result).toBe(testData)
      expect(mockQueryClient.getQueryData).toHaveBeenCalledWith(queryKey)
      expect(globalMemoryCache.get).not.toHaveBeenCalled()
    })

    it('should fallback to memory cache when React Query cache is empty', async () => {
      // ARRANGE
      const queryKey = ['test', 'key']
      const testData = { id: 1, name: 'test' }
      const cacheKey = JSON.stringify(queryKey)
      
      mockQueryClient.getQueryData.mockReturnValue(undefined)
      ;(globalMemoryCache.get as jest.Mock).mockReturnValue(testData)

      // ACT
      const result = await enhancedClient.getQueryData(queryKey)

      // ASSERT
      expect(result).toBe(testData)
      expect(mockQueryClient.getQueryData).toHaveBeenCalledWith(queryKey)
      expect(globalMemoryCache.get).toHaveBeenCalledWith(cacheKey)
    })

    it('should execute fallback function when both caches are empty', async () => {
      // ARRANGE
      const queryKey = ['test', 'key']
      const testData = { id: 1, name: 'test' }
      const cacheKey = JSON.stringify(queryKey)
      const fallbackFn = jest.fn().mockResolvedValue(testData)
      
      mockQueryClient.getQueryData.mockReturnValue(undefined)
      ;(globalMemoryCache.get as jest.Mock).mockReturnValue(undefined)

      // ACT
      const result = await enhancedClient.getQueryData(queryKey, fallbackFn)

      // ASSERT
      expect(result).toBe(testData)
      expect(fallbackFn).toHaveBeenCalled()
      expect(globalMemoryCache.set).toHaveBeenCalledWith(cacheKey, testData, 5 * 60 * 1000)
      expect(mockQueryClient.setQueryData).toHaveBeenCalledWith(queryKey, testData)
    })

    it('should return undefined when no fallback function and caches are empty', async () => {
      // ARRANGE
      const queryKey = ['test', 'key']
      
      mockQueryClient.getQueryData.mockReturnValue(undefined)
      ;(globalMemoryCache.get as jest.Mock).mockReturnValue(undefined)

      // ACT
      const result = await enhancedClient.getQueryData(queryKey)

      // ASSERT
      expect(result).toBeUndefined()
    })
  })

  describe('setQueryData', () => {
    it('should set data in both React Query and memory cache', () => {
      // ARRANGE
      const queryKey = ['test', 'key']
      const testData = { id: 1, name: 'test' }
      const cacheKey = JSON.stringify(queryKey)

      // ACT
      enhancedClient.setQueryData(queryKey, testData)

      // ASSERT
      expect(mockQueryClient.setQueryData).toHaveBeenCalledWith(queryKey, testData)
      expect(globalMemoryCache.set).toHaveBeenCalledWith(cacheKey, testData, 5 * 60 * 1000)
    })
  })

  describe('invalidateQueries', () => {
    it('should invalidate queries in both caches', async () => {
      // ARRANGE
      const queryKey = ['test', 'key']
      const cacheKey = JSON.stringify(queryKey)
      const options = { queryKey }

      mockQueryClient.invalidateQueries.mockResolvedValue(undefined)

      // ACT
      await enhancedClient.invalidateQueries(options)

      // ASSERT
      expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey })
      expect(globalMemoryCache.delete).toHaveBeenCalledWith(cacheKey)
    })
  })

  describe('getClient', () => {
    it('should return the underlying React Query client', () => {
      // ACT
      const result = enhancedClient.getClient()

      // ASSERT
      expect(result).toBe(mockQueryClient)
    })
  })

  describe('getCacheStats', () => {
    it('should return combined cache statistics', () => {
      // ACT
      const stats = enhancedClient.getCacheStats()

      // ASSERT
      expect(stats).toEqual({
        reactQuery: {
          queryCache: 3,
          mutationCache: 2
        },
        memory: {
          size: 10,
          hits: 50,
          misses: 25
        }
      })
      expect(mockQueryClient.getQueryCache).toHaveBeenCalled()
      expect(mockQueryClient.getMutationCache).toHaveBeenCalled()
      expect(globalMemoryCache.getStats).toHaveBeenCalled()
    })
  })
})

describe('Enhanced Query Client Instance', () => {
  it('should export enhanced query client instance', () => {
    // ASSERT
    expect(enhancedQueryClient).toBeInstanceOf(EnhancedQueryClient)
    expect(enhancedQueryClient.getClient()).toBe(AppQueryClient)
  })

  it('should have all enhanced methods available', () => {
    // ASSERT
    expect(typeof enhancedQueryClient.getQueryData).toBe('function')
    expect(typeof enhancedQueryClient.setQueryData).toBe('function')
    expect(typeof enhancedQueryClient.invalidateQueries).toBe('function')
    expect(typeof enhancedQueryClient.getClient).toBe('function')
    expect(typeof enhancedQueryClient.getCacheStats).toBe('function')
  })
})