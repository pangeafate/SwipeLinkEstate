import { renderHook, act } from '@testing-library/react'
import { useBucketStore, useBucketCounts, useCurrentBucket } from '../bucketStore'
import { Property, BucketType } from '../../components/client/types'

// Mock sessionStorage
const mockStorage: Record<string, string> = {}
Object.defineProperty(window, 'sessionStorage', {
  value: {
    getItem: jest.fn((key: string) => mockStorage[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      mockStorage[key] = value
    }),
    removeItem: jest.fn((key: string) => {
      delete mockStorage[key]
    }),
    clear: jest.fn(() => {
      Object.keys(mockStorage).forEach(key => delete mockStorage[key])
    })
  }
})

// Mock properties for testing
const mockProperties: Property[] = [
  {
    id: 'prop1',
    address: '123 Test St',
    price: 300000,
    bedrooms: 3,
    bathrooms: 2,
    area_sqft: 1500,
    property_type: 'house',
    images: ['image1.jpg'],
    features: ['garage'],
    description: 'Test property 1',
    neighborhood: 'Test Area',
    school_district: 'Test District'
  },
  {
    id: 'prop2',
    address: '456 Test Ave',
    price: 450000,
    bedrooms: 4,
    bathrooms: 3,
    area_sqft: 2000,
    property_type: 'house',
    images: ['image2.jpg'],
    features: ['pool'],
    description: 'Test property 2',
    neighborhood: 'Test Area 2',
    school_district: 'Test District 2'
  }
]

describe('bucketStore', () => {
  beforeEach(() => {
    // Clear all mocks and storage before each test
    jest.clearAllMocks()
    Object.keys(mockStorage).forEach(key => delete mockStorage[key])
    
    // Reset store to initial state
    const { result } = renderHook(() => useBucketStore())
    act(() => {
      result.current.clearAllData()
    })
  })

  describe('Initial State', () => {
    it('initializes with empty buckets and new_properties as current', () => {
      const { result } = renderHook(() => useBucketStore())
      
      expect(result.current.currentBucket).toBe('new_properties')
      expect(result.current.buckets).toEqual({
        new_properties: [],
        liked: [],
        disliked: [],
        considering: [],
        schedule_visit: []
      })
    })

    it('initializes bucket counts as zero', () => {
      const { result } = renderHook(() => useBucketCounts())
      
      expect(result.current).toEqual({
        new_properties: 0,
        liked: 0,
        disliked: 0,
        considering: 0,
        schedule_visit: 0
      })
    })
  })

  describe('Property Management', () => {
    it('initializes with properties in new_properties bucket', () => {
      const { result } = renderHook(() => useBucketStore())
      
      act(() => {
        result.current.initializeWithProperties(mockProperties)
      })

      expect(result.current.buckets.new_properties).toEqual(['prop1', 'prop2'])
      expect(result.current.propertiesCache.prop1).toEqual(mockProperties[0])
      expect(result.current.propertiesCache.prop2).toEqual(mockProperties[1])
    })

    it('moves property between buckets', () => {
      const { result } = renderHook(() => useBucketStore())
      
      act(() => {
        result.current.initializeWithProperties(mockProperties)
      })

      act(() => {
        result.current.moveProperty('prop1', 'liked', mockProperties[0])
      })

      expect(result.current.buckets.new_properties).toEqual(['prop2'])
      expect(result.current.buckets.liked).toEqual(['prop1'])
    })

    it('removes property from bucket', () => {
      const { result } = renderHook(() => useBucketStore())
      
      act(() => {
        result.current.initializeWithProperties(mockProperties)
        result.current.moveProperty('prop1', 'liked', mockProperties[0])
      })

      act(() => {
        result.current.removeProperty('prop1')
      })

      expect(result.current.buckets.liked).toEqual([])
      expect(result.current.propertiesCache.prop1).toBeUndefined()
    })

    it('clears entire bucket', () => {
      const { result } = renderHook(() => useBucketStore())
      
      act(() => {
        result.current.initializeWithProperties(mockProperties)
      })

      act(() => {
        result.current.clearBucket('new_properties')
      })

      expect(result.current.buckets.new_properties).toEqual([])
    })
  })

  describe('Bucket Navigation', () => {
    it('changes current bucket', () => {
      const { result } = renderHook(() => useCurrentBucket())
      
      expect(result.current.currentBucket).toBe('new_properties')

      act(() => {
        result.current.setCurrentBucket('liked')
      })

      expect(result.current.currentBucket).toBe('liked')
    })
  })

  describe('Bucket Counts', () => {
    it('updates counts when properties are moved', () => {
      const { result: storeResult } = renderHook(() => useBucketStore())
      const { result: countsResult } = renderHook(() => useBucketCounts())
      
      act(() => {
        storeResult.current.initializeWithProperties(mockProperties)
      })

      expect(countsResult.current.new_properties).toBe(2)

      act(() => {
        storeResult.current.moveProperty('prop1', 'liked', mockProperties[0])
      })

      expect(countsResult.current.new_properties).toBe(1)
      expect(countsResult.current.liked).toBe(1)
    })
  })

  describe('Batch Operations', () => {
    it('moves multiple properties at once', () => {
      const { result } = renderHook(() => useBucketStore())
      
      act(() => {
        result.current.initializeWithProperties(mockProperties)
      })

      act(() => {
        result.current.moveMultipleProperties(['prop1', 'prop2'], 'liked')
      })

      expect(result.current.buckets.new_properties).toEqual([])
      expect(result.current.buckets.liked).toEqual(['prop1', 'prop2'])
    })
  })

  describe('History and Analytics', () => {
    it('tracks bucket history', () => {
      const { result } = renderHook(() => useBucketStore())
      
      act(() => {
        result.current.initializeWithProperties(mockProperties)
      })

      act(() => {
        result.current.moveProperty('prop1', 'liked', mockProperties[0])
      })

      const history = result.current.getBucketHistory('prop1')
      expect(history).toHaveLength(1)
      expect(history[0]).toMatchObject({
        propertyId: 'prop1',
        toBucket: 'liked'
      })
    })

    it('finds most recent bucket for property', () => {
      const { result } = renderHook(() => useBucketStore())
      
      act(() => {
        result.current.initializeWithProperties(mockProperties)
        result.current.moveProperty('prop1', 'liked', mockProperties[0])
      })

      expect(result.current.getMostRecentBucket('prop1')).toBe('liked')
      expect(result.current.getMostRecentBucket('prop2')).toBe('new_properties')
    })
  })

  describe('Data Persistence', () => {
    it('exports and imports bucket data', () => {
      const { result } = renderHook(() => useBucketStore())
      
      act(() => {
        result.current.initializeWithProperties(mockProperties)
        result.current.moveProperty('prop1', 'liked', mockProperties[0])
      })

      // Export data
      const exportedData = result.current.exportBucketData()
      expect(exportedData).toContain('prop1')
      expect(exportedData).toContain('liked')

      // Clear and import
      act(() => {
        result.current.clearAllData()
      })

      expect(result.current.buckets.liked).toEqual([])

      act(() => {
        const success = result.current.importBucketData(exportedData)
        expect(success).toBe(true)
      })

      expect(result.current.buckets.liked).toEqual(['prop1'])
    })

    it('handles invalid import data gracefully', () => {
      const { result } = renderHook(() => useBucketStore())
      
      // Get initial state to compare against
      const initialBuckets = result.current.buckets

      act(() => {
        const success = result.current.importBucketData('invalid json')
        expect(success).toBe(false)
      })

      // Should not crash and state should remain unchanged
      expect(result.current.buckets).toEqual(initialBuckets)
    })
  })

  describe('SessionStorage Persistence', () => {
    it('persists state to sessionStorage', () => {
      const { result } = renderHook(() => useBucketStore())
      
      act(() => {
        result.current.initializeWithProperties(mockProperties)
        result.current.setCurrentBucket('liked')
      })

      // Check that sessionStorage.setItem was called
      expect(window.sessionStorage.setItem).toHaveBeenCalled()
      
      // The exact call depends on zustand's internal implementation
      // but we can check that some data was stored
      const setItemCalls = (window.sessionStorage.setItem as jest.Mock).mock.calls
      const storedData = setItemCalls.find(call => call[0] === 'swipelink-buckets')
      expect(storedData).toBeTruthy()
    })
  })
})