/**
 * @jest-environment jsdom
 */

import { renderHook, act } from '@testing-library/react'
import { usePropertiesStore } from '../usePropertiesStore'
import type { Property } from '@/lib/supabase/types'

// Mock property data
const mockProperties: Property[] = [
  {
    id: '1',
    address: '123 Test St',
    price: 500000,
    bedrooms: 3,
    bathrooms: 2,
    area_sqft: 1500,
    property_type: 'house',
    status: 'active',
    cover_image: '/test1.jpg',
    images: ['/test1.jpg'],
    features: ['garage'],
    description: 'Test property 1',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z'
  },
  {
    id: '2',
    address: '456 Mock Ave',
    price: 750000,
    bedrooms: 4,
    bathrooms: 3,
    area_sqft: 2000,
    property_type: 'condo',
    status: 'active',
    cover_image: '/test2.jpg',
    images: ['/test2.jpg'],
    features: ['pool'],
    description: 'Test property 2',
    created_at: '2023-01-02T00:00:00Z',
    updated_at: '2023-01-02T00:00:00Z'
  }
]

describe('usePropertiesStore', () => {
  beforeEach(() => {
    // Reset store before each test
    usePropertiesStore.getState().reset()
  })

  it('should initialize with empty state', () => {
    // ARRANGE & ACT
    const { result } = renderHook(() => usePropertiesStore())

    // ASSERT
    expect(result.current.properties).toEqual([])
    expect(result.current.selectedProperties).toEqual([])
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('should set properties correctly', () => {
    // ARRANGE
    const { result } = renderHook(() => usePropertiesStore())

    // ACT
    act(() => {
      result.current.setProperties(mockProperties)
    })

    // ASSERT
    expect(result.current.properties).toEqual(mockProperties)
    expect(result.current.properties).toHaveLength(2)
  })

  it('should add property correctly', () => {
    // ARRANGE
    const { result } = renderHook(() => usePropertiesStore())
    const newProperty: Property = {
      id: '3',
      address: '789 New St',
      price: 600000,
      bedrooms: 2,
      bathrooms: 2,
      area_sqft: 1200,
      property_type: 'apartment',
      status: 'active',
      cover_image: '/test3.jpg',
      images: ['/test3.jpg'],
      features: [],
      description: 'New test property',
      created_at: '2023-01-03T00:00:00Z',
      updated_at: '2023-01-03T00:00:00Z'
    }

    // Set initial properties
    act(() => {
      result.current.setProperties(mockProperties)
    })

    // ACT
    act(() => {
      result.current.addProperty(newProperty)
    })

    // ASSERT
    expect(result.current.properties).toHaveLength(3)
    expect(result.current.properties[2]).toEqual(newProperty)
  })

  it('should update property correctly', () => {
    // ARRANGE
    const { result } = renderHook(() => usePropertiesStore())
    
    act(() => {
      result.current.setProperties(mockProperties)
    })

    const updatedProperty: Property = {
      ...mockProperties[0],
      price: 550000,
      description: 'Updated description'
    }

    // ACT
    act(() => {
      result.current.updateProperty('1', { price: 550000, description: 'Updated description' })
    })

    // ASSERT
    expect(result.current.properties[0].price).toBe(550000)
    expect(result.current.properties[0].description).toBe('Updated description')
  })

  it('should handle property selection', () => {
    // ARRANGE
    const { result } = renderHook(() => usePropertiesStore())
    
    act(() => {
      result.current.setProperties(mockProperties)
    })

    // ACT - Select first property
    act(() => {
      result.current.togglePropertySelection('1')
    })

    // ASSERT
    expect(result.current.selectedProperties).toEqual(['1'])

    // ACT - Toggle again to deselect
    act(() => {
      result.current.togglePropertySelection('1')
    })

    // ASSERT
    expect(result.current.selectedProperties).toEqual([])
  })

  it('should handle multiple property selections', () => {
    // ARRANGE
    const { result } = renderHook(() => usePropertiesStore())
    
    act(() => {
      result.current.setProperties(mockProperties)
    })

    // ACT
    act(() => {
      result.current.togglePropertySelection('1')
      result.current.togglePropertySelection('2')
    })

    // ASSERT
    expect(result.current.selectedProperties).toEqual(['1', '2'])
  })

  it('should clear all selections', () => {
    // ARRANGE
    const { result } = renderHook(() => usePropertiesStore())
    
    act(() => {
      result.current.setProperties(mockProperties)
      result.current.togglePropertySelection('1')
      result.current.togglePropertySelection('2')
    })

    // ACT
    act(() => {
      result.current.clearSelection()
    })

    // ASSERT
    expect(result.current.selectedProperties).toEqual([])
  })

  it('should handle loading state', () => {
    // ARRANGE
    const { result } = renderHook(() => usePropertiesStore())

    // ACT
    act(() => {
      result.current.setLoading(true)
    })

    // ASSERT
    expect(result.current.isLoading).toBe(true)

    // ACT
    act(() => {
      result.current.setLoading(false)
    })

    // ASSERT
    expect(result.current.isLoading).toBe(false)
  })

  it('should handle error state', () => {
    // ARRANGE
    const { result } = renderHook(() => usePropertiesStore())
    const error = 'Failed to load properties'

    // ACT
    act(() => {
      result.current.setError(error)
    })

    // ASSERT
    expect(result.current.error).toBe(error)

    // ACT - Clear error
    act(() => {
      result.current.setError(null)
    })

    // ASSERT
    expect(result.current.error).toBeNull()
  })

  it('should get property by id', () => {
    // ARRANGE
    const { result } = renderHook(() => usePropertiesStore())
    
    act(() => {
      result.current.setProperties(mockProperties)
    })

    // ACT & ASSERT
    expect(result.current.getPropertyById('1')).toEqual(mockProperties[0])
    expect(result.current.getPropertyById('999')).toBeUndefined()
  })

  it('should reset store correctly', () => {
    // ARRANGE
    const { result } = renderHook(() => usePropertiesStore())
    
    act(() => {
      result.current.setProperties(mockProperties)
      result.current.togglePropertySelection('1')
      result.current.setLoading(true)
      result.current.setError('Some error')
    })

    // ACT
    act(() => {
      result.current.reset()
    })

    // ASSERT
    expect(result.current.properties).toEqual([])
    expect(result.current.selectedProperties).toEqual([])
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })
})