/**
 * Zustand Store Testing Utilities
 * 
 * Specialized utilities for testing Zustand stores to prevent:
 * - State update loops
 * - Memory leaks
 * - Test isolation issues
 * - Subscription conflicts
 */

import { jest } from '@jest/globals'
import { StateCreator, StoreApi } from 'zustand'

// ================================
// STORE MOCKING UTILITIES
// ================================

/**
 * Creates a mock Zustand store with proper isolation
 */
export const createMockStore = <T extends Record<string, any>>(
  initialState: Partial<T>,
  methods: Partial<T> = {}
): T => {
  // Create stable mock functions for methods
  const mockMethods = Object.keys(methods).reduce((acc, key) => {
    const method = methods[key]
    if (typeof method === 'function') {
      acc[key] = jest.fn((...args: any[]) => {
        // Prevent recursive calls during testing
        if (typeof method === 'function') {
          try {
            return method(...args)
          } catch (error) {
            console.warn(`Mock store method ${key} error:`, error)
            return undefined
          }
        }
        return undefined
      })
    } else {
      acc[key] = method
    }
    return acc
  }, {} as any)

  return {
    ...initialState,
    ...mockMethods
  } as T
}

/**
 * Creates a mock for the bucket store specifically
 */
export const createMockBucketStore = (overrides: any = {}) => {
  const defaultState = {
    currentBucket: 'new_properties',
    buckets: {
      new_properties: [],
      liked: [],
      disliked: [],
      considering: [],
      schedule_visit: []
    },
    propertiesCache: {},
    bucketHistory: []
  }

  const defaultMethods = {
    setCurrentBucket: jest.fn(),
    moveProperty: jest.fn(),
    getBucketCounts: jest.fn(() => ({
      new_properties: 0,
      liked: 0,
      disliked: 0,
      considering: 0,
      schedule_visit: 0
    })),
    getPropertiesForBucket: jest.fn(() => []),
    removeProperty: jest.fn(),
    clearBucket: jest.fn(),
    initializeWithProperties: jest.fn(),
    getPropertyFromCache: jest.fn(),
    moveMultipleProperties: jest.fn(),
    getBucketHistory: jest.fn(() => []),
    getMostRecentBucket: jest.fn(() => null),
    clearAllData: jest.fn(),
    exportBucketData: jest.fn(() => '{}'),
    importBucketData: jest.fn(() => true)
  }

  return createMockStore(
    { ...defaultState, ...overrides.state },
    { ...defaultMethods, ...overrides.methods }
  )
}

/**
 * Creates a mock for the properties store
 */
export const createMockPropertiesStore = (overrides: any = {}) => {
  const defaultState = {
    properties: [],
    filteredProperties: [],
    currentProperty: null,
    loading: false,
    error: null,
    filters: {}
  }

  const defaultMethods = {
    setProperties: jest.fn(),
    addProperty: jest.fn(),
    updateProperty: jest.fn(),
    deleteProperty: jest.fn(),
    setCurrentProperty: jest.fn(),
    setFilters: jest.fn(),
    clearFilters: jest.fn(),
    setLoading: jest.fn(),
    setError: jest.fn()
  }

  return createMockStore(
    { ...defaultState, ...overrides.state },
    { ...defaultMethods, ...overrides.methods }
  )
}

/**
 * Creates a mock for the UI store
 */
export const createMockUIStore = (overrides: any = {}) => {
  const defaultState = {
    sidebarOpen: false,
    modalOpen: false,
    currentModal: null,
    notifications: [],
    theme: 'light'
  }

  const defaultMethods = {
    setSidebarOpen: jest.fn(),
    setModalOpen: jest.fn(),
    setCurrentModal: jest.fn(),
    addNotification: jest.fn(),
    removeNotification: jest.fn(),
    clearNotifications: jest.fn(),
    setTheme: jest.fn()
  }

  return createMockStore(
    { ...defaultState, ...overrides.state },
    { ...defaultMethods, ...overrides.methods }
  )
}

// ================================
// STORE TESTING HELPERS
// ================================

/**
 * Test helper for store state transitions
 */
export const testStateTransition = <T>(
  store: T,
  action: (store: T) => void,
  assertions: (store: T) => void
) => {
  // Execute action
  action(store)
  
  // Run assertions
  assertions(store)
}

/**
 * Test helper for async store operations
 */
export const testAsyncStoreOperation = async <T>(
  store: T,
  asyncAction: (store: T) => Promise<void>,
  assertions: (store: T) => void
) => {
  await asyncAction(store)
  assertions(store)
}

/**
 * Utility to verify mock function calls on store methods
 */
export const verifyStoreCalls = (
  store: any,
  expectedCalls: Record<string, any[]>
) => {
  Object.entries(expectedCalls).forEach(([methodName, expectedArgs]) => {
    const method = store[methodName]
    if (jest.isMockFunction(method)) {
      expect(method).toHaveBeenCalledWith(...expectedArgs)
    } else {
      throw new Error(`${methodName} is not a mock function`)
    }
  })
}

/**
 * Reset all mocks in a store
 */
export const resetStoreMocks = (store: any) => {
  Object.values(store).forEach(value => {
    if (jest.isMockFunction(value)) {
      value.mockReset()
    }
  })
}

/**
 * Clear all mock calls in a store
 */
export const clearStoreMocks = (store: any) => {
  Object.values(store).forEach(value => {
    if (jest.isMockFunction(value)) {
      value.mockClear()
    }
  })
}

// ================================
// STORE SNAPSHOT UTILITIES
// ================================

/**
 * Creates a snapshot of store state for comparison
 */
export const createStoreSnapshot = (store: any): any => {
  const snapshot: any = {}
  
  Object.entries(store).forEach(([key, value]) => {
    if (typeof value !== 'function') {
      snapshot[key] = Array.isArray(value) ? [...value] : 
                     typeof value === 'object' && value !== null ? { ...value } : 
                     value
    }
  })
  
  return snapshot
}

/**
 * Compares two store snapshots
 */
export const compareStoreSnapshots = (
  snapshot1: any,
  snapshot2: any
): { changed: string[], unchanged: string[] } => {
  const changed: string[] = []
  const unchanged: string[] = []
  
  const allKeys = new Set([...Object.keys(snapshot1), ...Object.keys(snapshot2)])
  
  allKeys.forEach(key => {
    if (JSON.stringify(snapshot1[key]) !== JSON.stringify(snapshot2[key])) {
      changed.push(key)
    } else {
      unchanged.push(key)
    }
  })
  
  return { changed, unchanged }
}

// ================================
// PERSISTENCE TESTING UTILITIES
// ================================

/**
 * Mock storage for testing persisted stores
 */
export class MockStorage implements Storage {
  private data: Map<string, string> = new Map()

  get length(): number {
    return this.data.size
  }

  clear(): void {
    this.data.clear()
  }

  getItem(key: string): string | null {
    return this.data.get(key) || null
  }

  key(index: number): string | null {
    const keys = Array.from(this.data.keys())
    return keys[index] || null
  }

  removeItem(key: string): void {
    this.data.delete(key)
  }

  setItem(key: string, value: string): void {
    this.data.set(key, value)
  }

  // Utility methods for testing
  getData(): Record<string, string> {
    return Object.fromEntries(this.data)
  }

  hasKey(key: string): boolean {
    return this.data.has(key)
  }

  reset(): void {
    this.data.clear()
  }
}

/**
 * Creates mock storage instances for testing
 */
export const createMockStorage = (): {
  localStorage: MockStorage,
  sessionStorage: MockStorage
} => ({
  localStorage: new MockStorage(),
  sessionStorage: new MockStorage()
})

/**
 * Setup mock storage for tests
 */
export const setupMockStorage = () => {
  const { localStorage, sessionStorage } = createMockStorage()
  
  Object.defineProperty(window, 'localStorage', {
    value: localStorage,
    writable: true
  })
  
  Object.defineProperty(window, 'sessionStorage', {
    value: sessionStorage,
    writable: true
  })
  
  return { localStorage, sessionStorage }
}

// ================================
// SUBSCRIPTION TESTING UTILITIES
// ================================

/**
 * Mock store subscription manager for testing
 */
export class MockSubscriptionManager {
  private subscriptions: Map<string, Set<() => void>> = new Map()

  subscribe(storeKey: string, callback: () => void): () => void {
    if (!this.subscriptions.has(storeKey)) {
      this.subscriptions.set(storeKey, new Set())
    }
    
    this.subscriptions.get(storeKey)!.add(callback)
    
    return () => {
      this.subscriptions.get(storeKey)?.delete(callback)
    }
  }

  notify(storeKey: string): void {
    this.subscriptions.get(storeKey)?.forEach(callback => {
      try {
        callback()
      } catch (error) {
        console.warn(`Subscription callback error for ${storeKey}:`, error)
      }
    })
  }

  getSubscriptionCount(storeKey: string): number {
    return this.subscriptions.get(storeKey)?.size || 0
  }

  clearSubscriptions(storeKey?: string): void {
    if (storeKey) {
      this.subscriptions.delete(storeKey)
    } else {
      this.subscriptions.clear()
    }
  }

  getAllSubscriptions(): Record<string, number> {
    const result: Record<string, number> = {}
    this.subscriptions.forEach((subs, key) => {
      result[key] = subs.size
    })
    return result
  }
}

export default {
  createMockStore,
  createMockBucketStore,
  createMockPropertiesStore,
  createMockUIStore,
  testStateTransition,
  testAsyncStoreOperation,
  verifyStoreCalls,
  resetStoreMocks,
  clearStoreMocks,
  createStoreSnapshot,
  compareStoreSnapshots,
  MockStorage,
  createMockStorage,
  setupMockStorage,
  MockSubscriptionManager
}