import { QueryClient } from '@tanstack/react-query'
import { globalMemoryCache } from '@/lib/cache/MemoryCache'

const STALE_TIME = 5 * 60 * 1000 // 5 minutes
const GC_TIME = 10 * 60 * 1000 // 10 minutes

export const AppQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data considered fresh for 5 minutes
      staleTime: STALE_TIME,
      
      // Keep unused data in cache for 10 minutes
      gcTime: GC_TIME,
      
      // Smart retry logic based on error type
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.status >= 400 && error?.status < 500) {
          return false
        }
        // Retry up to 3 times for other errors
        return failureCount < 3
      },
      
      // Exponential backoff for retries
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Don't refetch on window focus to avoid unnecessary requests
      refetchOnWindowFocus: false,
      
      // Refetch on mount to ensure data freshness
      refetchOnMount: true,
      
      // Refetch on reconnect after network issues
      refetchOnReconnect: true,
      
      // Network mode
      networkMode: 'online',
    },
    mutations: {
      // Smart retry for mutations
      retry: (failureCount, error: any) => {
        if (error?.status >= 400 && error?.status < 500) {
          return false
        }
        return failureCount < 2
      },
      
      // Retry delay for mutations
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Network mode for mutations
      networkMode: 'online',
    },
  },
})

/**
 * Enhanced query client with memory cache integration
 */
export class EnhancedQueryClient {
  constructor(private queryClient: QueryClient) {}

  /**
   * Get data with memory cache fallback
   */
  async getQueryData<T>(queryKey: unknown[], fallbackFn?: () => Promise<T>): Promise<T | undefined> {
    const cacheKey = JSON.stringify(queryKey)
    
    // Try React Query cache first
    let data = this.queryClient.getQueryData<T>(queryKey)
    
    if (!data) {
      // Try memory cache
      data = globalMemoryCache.get<T>(cacheKey)
      
      if (!data && fallbackFn) {
        // Execute fallback function and cache result
        data = await fallbackFn()
        if (data) {
          globalMemoryCache.set(cacheKey, data, STALE_TIME)
          this.queryClient.setQueryData(queryKey, data)
        }
      }
    }
    
    return data
  }

  /**
   * Set data in both caches
   */
  setQueryData<T>(queryKey: unknown[], data: T): void {
    const cacheKey = JSON.stringify(queryKey)
    
    // Set in both caches
    this.queryClient.setQueryData(queryKey, data)
    globalMemoryCache.set(cacheKey, data, STALE_TIME)
  }

  /**
   * Invalidate queries in both caches
   */
  async invalidateQueries(options: { queryKey: unknown[] }): Promise<void> {
    const cacheKey = JSON.stringify(options.queryKey)
    
    // Invalidate in both caches
    await this.queryClient.invalidateQueries({ queryKey: options.queryKey })
    globalMemoryCache.delete(cacheKey)
  }

  /**
   * Get the underlying React Query client
   */
  getClient(): QueryClient {
    return this.queryClient
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    const reactQueryStats = {
      queryCache: this.queryClient.getQueryCache().getAll().length,
      mutationCache: this.queryClient.getMutationCache().getAll().length,
    }
    
    const memoryStats = globalMemoryCache.getStats()
    
    return {
      reactQuery: reactQueryStats,
      memory: memoryStats,
    }
  }
}

// Export both the standard client and enhanced client
export const enhancedQueryClient = new EnhancedQueryClient(AppQueryClient)

export default AppQueryClient