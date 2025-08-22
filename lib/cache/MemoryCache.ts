/**
 * Simple in-memory cache for frequently accessed data
 * Used as a secondary cache layer on top of React Query
 */
export class MemoryCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()
  private timers = new Map<string, NodeJS.Timeout>()

  /**
   * Set a value in cache with TTL (time to live)
   */
  set(key: string, value: any, ttlMs: number = 5 * 60 * 1000): void {
    // Clear existing timer if any
    const existingTimer = this.timers.get(key)
    if (existingTimer) {
      clearTimeout(existingTimer)
    }

    // Set the cache entry
    this.cache.set(key, {
      data: value,
      timestamp: Date.now(),
      ttl: ttlMs
    })

    // Set expiration timer
    const timer = setTimeout(() => {
      this.delete(key)
    }, ttlMs)
    
    this.timers.set(key, timer)
  }

  /**
   * Get a value from cache
   */
  get<T = any>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return null
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.delete(key)
      return null
    }

    return entry.data as T
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null
  }

  /**
   * Delete a cache entry
   */
  delete(key: string): boolean {
    // Clear timer
    const timer = this.timers.get(key)
    if (timer) {
      clearTimeout(timer)
      this.timers.delete(key)
    }

    return this.cache.delete(key)
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    // Clear all timers
    for (const timer of this.timers.values()) {
      clearTimeout(timer)
    }
    
    this.cache.clear()
    this.timers.clear()
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number
    keys: string[]
    totalMemoryEstimate: number
  } {
    const keys = Array.from(this.cache.keys())
    let totalMemoryEstimate = 0

    // Rough estimate of memory usage
    for (const [key, entry] of this.cache.entries()) {
      totalMemoryEstimate += key.length * 2 // UTF-16 characters
      totalMemoryEstimate += JSON.stringify(entry.data).length * 2
      totalMemoryEstimate += 32 // Rough overhead per entry
    }

    return {
      size: this.cache.size,
      keys,
      totalMemoryEstimate
    }
  }

  /**
   * Create a cache key from multiple parts
   */
  static createKey(...parts: (string | number | boolean)[]): string {
    return parts.map(String).join(':')
  }
}

// Global instance for the application
export const globalMemoryCache = new MemoryCache()

/**
 * Cache decorator for service methods
 */
export function withCache<T extends any[], R>(
  cache: MemoryCache,
  keyGenerator: (...args: T) => string,
  ttlMs: number = 5 * 60 * 1000
) {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const method = descriptor.value

    descriptor.value = async function (...args: T): Promise<R> {
      const key = keyGenerator(...args)
      
      // Check cache first
      const cached = cache.get<R>(key)
      if (cached !== null) {
        return cached
      }

      // Execute original method
      const result = await method.apply(this, args)
      
      // Cache the result
      cache.set(key, result, ttlMs)
      
      return result
    }
  }
}