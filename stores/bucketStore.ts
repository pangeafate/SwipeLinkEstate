import { create } from 'zustand'
import { subscribeWithSelector, persist } from 'zustand/middleware'
import { BucketType, BucketData, Property } from '../components/client/types'

interface BucketState {
  // Core bucket data
  buckets: BucketData
  currentBucket: BucketType
  
  // Properties cache for each bucket
  propertiesCache: Record<string, Property>
  
  // Analytics
  bucketHistory: Array<{
    propertyId: string
    fromBucket: BucketType | null
    toBucket: BucketType
    timestamp: Date
  }>
  
  // Actions
  moveProperty: (propertyId: string, toBucket: BucketType, property?: Property) => void
  setCurrentBucket: (bucket: BucketType) => void
  getPropertiesForBucket: (bucket: BucketType) => string[]
  getBucketCounts: () => Record<BucketType, number>
  removeProperty: (propertyId: string, fromBucket?: BucketType) => void
  clearBucket: (bucket: BucketType) => void
  initializeWithProperties: (properties: Property[]) => void
  getPropertyFromCache: (propertyId: string) => Property | undefined
  
  // Batch operations
  moveMultipleProperties: (propertyIds: string[], toBucket: BucketType) => void
  
  // Analytics
  getBucketHistory: (propertyId?: string) => typeof BucketState.prototype.bucketHistory
  getMostRecentBucket: (propertyId: string) => BucketType | null
  
  // Persistence
  clearAllData: () => void
  exportBucketData: () => string
  importBucketData: (data: string) => boolean
}

// Initial state
const initialBuckets: BucketData = {
  new_properties: [],
  liked: [],
  disliked: [],
  considering: [],
  schedule_visit: []
}

// Create the store with persistence
export const useBucketStore = create<BucketState>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // Initial state
        buckets: initialBuckets,
        currentBucket: 'new_properties' as BucketType,
        propertiesCache: {},
        bucketHistory: [],

        // Move property between buckets
        moveProperty: (propertyId: string, toBucket: BucketType, property?: Property) => {
          const currentState = get()
          const fromBucket = currentState.getMostRecentBucket(propertyId)
          
          // Remove from all buckets first
          const newBuckets = { ...currentState.buckets }
          Object.keys(newBuckets).forEach(bucket => {
            newBuckets[bucket as BucketType] = newBuckets[bucket as BucketType].filter(
              id => id !== propertyId
            )
          })
          
          // Add to new bucket
          newBuckets[toBucket] = [...newBuckets[toBucket], propertyId]
          
          // Update cache if property data provided
          const newCache = property 
            ? { ...currentState.propertiesCache, [propertyId]: property }
            : currentState.propertiesCache
          
          // Add to history
          const historyEntry = {
            propertyId,
            fromBucket,
            toBucket,
            timestamp: new Date()
          }
          
          set({
            buckets: newBuckets,
            propertiesCache: newCache,
            bucketHistory: [...currentState.bucketHistory, historyEntry]
          })
        },

        // Set current bucket
        setCurrentBucket: (bucket: BucketType) => {
          set({ currentBucket: bucket })
        },

        // Get properties for a specific bucket
        getPropertiesForBucket: (bucket: BucketType) => {
          return get().buckets[bucket] || []
        },

        // Get count for each bucket
        getBucketCounts: () => {
          const { buckets } = get()
          return {
            new_properties: buckets.new_properties.length,
            liked: buckets.liked.length,
            disliked: buckets.disliked.length,
            considering: buckets.considering.length,
            schedule_visit: buckets.schedule_visit.length
          }
        },

        // Remove property from specific bucket or all buckets
        removeProperty: (propertyId: string, fromBucket?: BucketType) => {
          const currentState = get()
          const newBuckets = { ...currentState.buckets }
          
          if (fromBucket) {
            newBuckets[fromBucket] = newBuckets[fromBucket].filter(
              id => id !== propertyId
            )
          } else {
            // Remove from all buckets
            Object.keys(newBuckets).forEach(bucket => {
              newBuckets[bucket as BucketType] = newBuckets[bucket as BucketType].filter(
                id => id !== propertyId
              )
            })
          }
          
          // Remove from cache
          const newCache = { ...currentState.propertiesCache }
          delete newCache[propertyId]
          
          set({
            buckets: newBuckets,
            propertiesCache: newCache
          })
        },

        // Clear all properties from a bucket
        clearBucket: (bucket: BucketType) => {
          const currentState = get()
          const newBuckets = { ...currentState.buckets }
          newBuckets[bucket] = []
          
          set({ buckets: newBuckets })
        },

        // Initialize with properties (typically new properties)
        initializeWithProperties: (properties: Property[]) => {
          const currentState = get()
          const newBuckets = { ...currentState.buckets }
          const newCache = { ...currentState.propertiesCache }
          
          // Add new properties to the new_properties bucket if not already in system
          properties.forEach(property => {
            // Check if property is already in any bucket
            const existsInSystem = Object.values(currentState.buckets).some(
              bucket => bucket.includes(property.id)
            )
            
            if (!existsInSystem) {
              newBuckets.new_properties.push(property.id)
            }
            
            newCache[property.id] = property
          })
          
          set({
            buckets: newBuckets,
            propertiesCache: newCache
          })
        },

        // Get property from cache
        getPropertyFromCache: (propertyId: string) => {
          return get().propertiesCache[propertyId]
        },

        // Move multiple properties at once
        moveMultipleProperties: (propertyIds: string[], toBucket: BucketType) => {
          propertyIds.forEach(propertyId => {
            get().moveProperty(propertyId, toBucket)
          })
        },

        // Get bucket history
        getBucketHistory: (propertyId?: string) => {
          const { bucketHistory } = get()
          return propertyId 
            ? bucketHistory.filter(entry => entry.propertyId === propertyId)
            : bucketHistory
        },

        // Get most recent bucket for a property
        getMostRecentBucket: (propertyId: string) => {
          const { buckets } = get()
          
          // Find which bucket contains this property
          for (const [bucket, properties] of Object.entries(buckets)) {
            if (properties.includes(propertyId)) {
              return bucket as BucketType
            }
          }
          
          return null
        },

        // Clear all data (reset to initial state)
        clearAllData: () => {
          set({
            buckets: initialBuckets,
            currentBucket: 'new_properties',
            propertiesCache: {},
            bucketHistory: []
          })
        },

        // Export bucket data as JSON string
        exportBucketData: () => {
          const { buckets, propertiesCache, bucketHistory } = get()
          return JSON.stringify({
            buckets,
            propertiesCache,
            bucketHistory,
            exportedAt: new Date().toISOString()
          })
        },

        // Import bucket data from JSON string
        importBucketData: (data: string) => {
          try {
            const parsed = JSON.parse(data)
            
            if (parsed.buckets && parsed.propertiesCache) {
              set({
                buckets: parsed.buckets,
                propertiesCache: parsed.propertiesCache,
                bucketHistory: parsed.bucketHistory || []
              })
              return true
            }
            
            return false
          } catch (error) {
            console.error('Failed to import bucket data:', error)
            return false
          }
        }
      }),
      {
        name: 'swipelink-buckets', // Storage key
        storage: {
          getItem: (name) => {
            const str = sessionStorage.getItem(name)
            if (!str) return null
            try {
              return JSON.parse(str)
            } catch {
              return null
            }
          },
          setItem: (name, value) => {
            sessionStorage.setItem(name, JSON.stringify(value))
          },
          removeItem: (name) => {
            sessionStorage.removeItem(name)
          }
        },
        // Only persist essential data, not computed values
        partialize: (state) => ({
          buckets: state.buckets,
          currentBucket: state.currentBucket,
          propertiesCache: state.propertiesCache,
          bucketHistory: state.bucketHistory
        })
      }
    )
  )
)

// Custom hooks for easier usage
export const useBucketCounts = () => {
  return useBucketStore(state => state.getBucketCounts())
}

export const useCurrentBucket = () => {
  return useBucketStore(state => ({
    currentBucket: state.currentBucket,
    setCurrentBucket: state.setCurrentBucket
  }))
}

export const useBucketActions = () => {
  return useBucketStore(state => ({
    moveProperty: state.moveProperty,
    removeProperty: state.removeProperty,
    clearBucket: state.clearBucket,
    moveMultipleProperties: state.moveMultipleProperties
  }))
}

export const useBucketProperties = (bucket: BucketType) => {
  return useBucketStore(state => {
    const propertyIds = state.getPropertiesForBucket(bucket)
    const properties = propertyIds.map(id => state.getPropertyFromCache(id)).filter(Boolean) as Property[]
    return {
      propertyIds,
      properties
    }
  })
}

// Selector for getting properties with their bucket assignments
export const usePropertiesWithBuckets = () => {
  return useBucketStore(state => {
    const bucketAssignments: Record<string, BucketType | null> = {}
    
    Object.entries(state.buckets).forEach(([bucket, propertyIds]) => {
      propertyIds.forEach(propertyId => {
        bucketAssignments[propertyId] = bucket as BucketType
      })
    })
    
    return bucketAssignments
  })
}