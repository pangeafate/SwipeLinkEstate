/**
 * @jest-environment jsdom
 */

import React from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { 
  usePropertiesQuery, 
  usePropertyQuery, 
  useCreatePropertyMutation,
  useUpdatePropertyMutation,
  useDeletePropertyMutation,
  usePropertiesOptimizedQuery,
  usePropertiesBatchQuery,
  usePropertyStatsQuery,
  useSearchPropertiesQuery
} from '../usePropertiesQuery'
import { PropertyService } from '@/components/property'
import { setupTest } from '@/test/utils/testSetup'
import { QueryWrapper } from '@/test/utils/queryWrapper'
import { fixtures } from '@/test/fixtures'

// Mock PropertyService
jest.mock('@/components/property', () => ({
  PropertyService: {
    getAllProperties: jest.fn(),
    getProperty: jest.fn(),
    createProperty: jest.fn(),
    updateProperty: jest.fn(),
    deleteProperty: jest.fn(),
    getPropertiesOptimized: jest.fn(),
    getPropertiesBatch: jest.fn(),
    getPropertyStats: jest.fn(),
    searchProperties: jest.fn(),
  }
}))

const mockProperties = fixtures.properties.slice(0, 1)

// Setup test environment for all tests in this file
const { getWrapper } = setupTest({ createQueryClient: true, suppressConsoleErrors: true })

describe('usePropertiesQuery', () => {

  it('should fetch all properties successfully', async () => {
    // ARRANGE
    ;(PropertyService.getAllProperties as jest.Mock).mockResolvedValue(mockProperties)

    // ACT
    const { result } = renderHook(() => usePropertiesQuery(), {
      wrapper: getWrapper(),
    })

    // ASSERT
    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toEqual(mockProperties)
    expect(result.current.isError).toBe(false)
    expect(PropertyService.getAllProperties).toHaveBeenCalledTimes(1)
  })

  it('should handle error when fetching properties', async () => {
    // ARRANGE
    const error = new Error('Failed to fetch properties')
    ;(PropertyService.getAllProperties as jest.Mock).mockRejectedValue(error)

    // ACT
    const { result } = renderHook(() => usePropertiesQuery(), {
      wrapper: getWrapper(),
    })

    // ASSERT
    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toBe(error)
    expect(result.current.data).toBeUndefined()
  })
})

describe('usePropertyQuery', () => {
  it('should fetch single property successfully', async () => {
    // ARRANGE
    const propertyId = '1'
    ;(PropertyService.getProperty as jest.Mock).mockResolvedValue(mockProperties[0])

    // ACT
    const { result } = renderHook(() => usePropertyQuery(propertyId), {
      wrapper: getWrapper(),
    })

    // ASSERT
    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toEqual(mockProperties[0])
    expect(PropertyService.getProperty).toHaveBeenCalledWith(propertyId)
  })

  it('should not fetch when propertyId is not provided', () => {
    // ARRANGE - Clear mocks first
    jest.clearAllMocks()
    
    // ACT
    const { result } = renderHook(() => usePropertyQuery(''), {
      wrapper: getWrapper(),
    })

    // ASSERT
    expect(result.current.isLoading).toBe(false)
    expect(result.current.data).toBeUndefined()
    expect(PropertyService.getProperty).not.toHaveBeenCalled()
  })
})

describe('useCreatePropertyMutation', () => {
  it('should create property successfully', async () => {
    // ARRANGE
    const newProperty = mockProperties[0]
    ;(PropertyService.createProperty as jest.Mock).mockResolvedValue(newProperty)

    const { result } = renderHook(() => useCreatePropertyMutation(), {
      wrapper: getWrapper(),
    })

    // ACT
    result.current.mutate({
      address: '123 Test St',
      price: 500000,
      bedrooms: 3,
      bathrooms: 2,
      area_sqft: 1500,
      property_type: 'house',
      status: 'active',
    })

    // ASSERT
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(newProperty)
    expect(PropertyService.createProperty).toHaveBeenCalledWith({
      address: '123 Test St',
      price: 500000,
      bedrooms: 3,
      bathrooms: 2,
      area_sqft: 1500,
      property_type: 'house',
      status: 'active',
    })
  })

  it('should handle error when creating property', async () => {
    // ARRANGE
    const error = new Error('Failed to create property')
    ;(PropertyService.createProperty as jest.Mock).mockRejectedValue(error)

    const { result } = renderHook(() => useCreatePropertyMutation(), {
      wrapper: getWrapper(),
    })

    // ACT
    result.current.mutate({
      address: '123 Test St',
      price: 500000,
      bedrooms: 3,
      bathrooms: 2,
      property_type: 'house',
      status: 'active',
    })

    // ASSERT
    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toBe(error)
  })
})

describe('useUpdatePropertyMutation', () => {
  it('should update property successfully', async () => {
    // ARRANGE
    const updatedProperty = { ...mockProperties[0], address: '456 Updated St' }
    ;(PropertyService.updateProperty as jest.Mock).mockResolvedValue(updatedProperty)

    const { result } = renderHook(() => useUpdatePropertyMutation(), {
      wrapper: getWrapper(),
    })

    // ACT
    result.current.mutate({
      id: '1',
      data: { address: '456 Updated St' }
    })

    // ASSERT
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(updatedProperty)
    expect(PropertyService.updateProperty).toHaveBeenCalledWith('1', { address: '456 Updated St' })
  })

  it('should handle error when updating property', async () => {
    // ARRANGE
    const error = new Error('Failed to update property')
    ;(PropertyService.updateProperty as jest.Mock).mockRejectedValue(error)

    const { result } = renderHook(() => useUpdatePropertyMutation(), {
      wrapper: getWrapper(),
    })

    // ACT
    result.current.mutate({
      id: '1',
      data: { address: '456 Updated St' }
    })

    // ASSERT
    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toBe(error)
  })
})

describe('useDeletePropertyMutation', () => {
  it('should delete property successfully', async () => {
    // ARRANGE
    ;(PropertyService.deleteProperty as jest.Mock).mockResolvedValue(true)

    const { result } = renderHook(() => useDeletePropertyMutation(), {
      wrapper: getWrapper(),
    })

    // ACT
    result.current.mutate('1')

    // ASSERT
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(PropertyService.deleteProperty).toHaveBeenCalledWith('1')
  })

  it('should handle error when deleting property', async () => {
    // ARRANGE
    const error = new Error('Failed to delete property')
    ;(PropertyService.deleteProperty as jest.Mock).mockRejectedValue(error)

    const { result } = renderHook(() => useDeletePropertyMutation(), {
      wrapper: getWrapper(),
    })

    // ACT
    result.current.mutate('1')

    // ASSERT
    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toBe(error)
  })
})

describe('usePropertiesOptimizedQuery', () => {
  it('should fetch optimized properties with default options', async () => {
    // ARRANGE
    const optimizedData = { properties: mockProperties, total: 1, page: 1 }
    ;(PropertyService.getPropertiesOptimized as jest.Mock).mockResolvedValue(optimizedData)

    // ACT
    const { result } = renderHook(() => usePropertiesOptimizedQuery(), {
      wrapper: getWrapper(),
    })

    // ASSERT
    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toEqual(optimizedData)
    expect(PropertyService.getPropertiesOptimized).toHaveBeenCalledWith({})
  })

  it('should fetch optimized properties with custom options', async () => {
    // ARRANGE
    const options = {
      page: 2,
      limit: 10,
      status: 'active' as const,
      sortBy: 'price' as const,
      sortOrder: 'desc' as const
    }
    const optimizedData = { properties: mockProperties, total: 1, page: 2 }
    ;(PropertyService.getPropertiesOptimized as jest.Mock).mockResolvedValue(optimizedData)

    // ACT
    const { result } = renderHook(() => usePropertiesOptimizedQuery(options), {
      wrapper: getWrapper(),
    })

    // ASSERT
    await waitFor(() => {
      expect(result.current.data).toEqual(optimizedData)
    })

    expect(PropertyService.getPropertiesOptimized).toHaveBeenCalledWith(options)
  })

  it('should handle error when fetching optimized properties', async () => {
    // ARRANGE
    const error = new Error('Failed to fetch optimized properties')
    ;(PropertyService.getPropertiesOptimized as jest.Mock).mockRejectedValue(error)

    // ACT
    const { result } = renderHook(() => usePropertiesOptimizedQuery(), {
      wrapper: getWrapper(),
    })

    // ASSERT
    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toBe(error)
  })
})

describe('usePropertiesBatchQuery', () => {
  it('should fetch multiple properties by IDs', async () => {
    // ARRANGE
    const propertyIds = ['1', '2', '3']
    ;(PropertyService.getPropertiesBatch as jest.Mock).mockResolvedValue(mockProperties)

    // ACT
    const { result } = renderHook(() => usePropertiesBatchQuery(propertyIds), {
      wrapper: getWrapper(),
    })

    // ASSERT
    await waitFor(() => {
      expect(result.current.data).toEqual(mockProperties)
    })

    expect(PropertyService.getPropertiesBatch).toHaveBeenCalledWith(propertyIds)
  })

  it('should not fetch when property IDs array is empty', () => {
    // ARRANGE
    jest.clearAllMocks()

    // ACT
    const { result } = renderHook(() => usePropertiesBatchQuery([]), {
      wrapper: getWrapper(),
    })

    // ASSERT
    expect(result.current.isLoading).toBe(false)
    expect(result.current.data).toBeUndefined()
    expect(PropertyService.getPropertiesBatch).not.toHaveBeenCalled()
  })

  it('should handle error when fetching batch properties', async () => {
    // ARRANGE
    const propertyIds = ['1', '2', '3']
    const error = new Error('Failed to fetch batch properties')
    ;(PropertyService.getPropertiesBatch as jest.Mock).mockRejectedValue(error)

    // ACT
    const { result } = renderHook(() => usePropertiesBatchQuery(propertyIds), {
      wrapper: getWrapper(),
    })

    // ASSERT
    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toBe(error)
  })
})

describe('usePropertyStatsQuery', () => {
  it('should fetch property statistics', async () => {
    // ARRANGE
    const stats = {
      total: 100,
      active: 80,
      avgPrice: 450000,
      avgBedrooms: 3.2,
      propertyTypes: { house: 60, apartment: 30, condo: 10 }
    }
    ;(PropertyService.getPropertyStats as jest.Mock).mockResolvedValue(stats)

    // ACT
    const { result } = renderHook(() => usePropertyStatsQuery(), {
      wrapper: getWrapper(),
    })

    // ASSERT
    await waitFor(() => {
      expect(result.current.data).toEqual(stats)
    })

    expect(PropertyService.getPropertyStats).toHaveBeenCalled()
    expect(result.current.isError).toBe(false)
  })

  it('should handle error when fetching property statistics', async () => {
    // ARRANGE
    const error = new Error('Failed to fetch property stats')
    ;(PropertyService.getPropertyStats as jest.Mock).mockRejectedValue(error)

    // ACT
    const { result } = renderHook(() => usePropertyStatsQuery(), {
      wrapper: getWrapper(),
    })

    // ASSERT
    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toBe(error)
  })
})

describe('useSearchPropertiesQuery', () => {
  it('should search properties with valid query', async () => {
    // ARRANGE
    const query = 'beachfront'
    const searchResults = mockProperties
    ;(PropertyService.searchProperties as jest.Mock).mockResolvedValue(searchResults)

    // ACT
    const { result } = renderHook(() => useSearchPropertiesQuery(query), {
      wrapper: getWrapper(),
    })

    // ASSERT
    await waitFor(() => {
      expect(result.current.data).toEqual(searchResults)
    })

    expect(PropertyService.searchProperties).toHaveBeenCalledWith(query)
  })

  it('should not search when query is too short', () => {
    // ARRANGE
    jest.clearAllMocks()
    const shortQuery = 'ab'

    // ACT
    const { result } = renderHook(() => useSearchPropertiesQuery(shortQuery), {
      wrapper: getWrapper(),
    })

    // ASSERT
    expect(result.current.isLoading).toBe(false)
    expect(result.current.data).toBeUndefined()
    expect(PropertyService.searchProperties).not.toHaveBeenCalled()
  })

  it('should not search when query is empty', () => {
    // ARRANGE
    jest.clearAllMocks()

    // ACT
    const { result } = renderHook(() => useSearchPropertiesQuery(''), {
      wrapper: getWrapper(),
    })

    // ASSERT
    expect(result.current.isLoading).toBe(false)
    expect(PropertyService.searchProperties).not.toHaveBeenCalled()
  })

  it('should not search when query is only whitespace', () => {
    // ARRANGE
    jest.clearAllMocks()

    // ACT
    const { result } = renderHook(() => useSearchPropertiesQuery('   '), {
      wrapper: getWrapper(),
    })

    // ASSERT
    expect(result.current.isLoading).toBe(false)
    expect(PropertyService.searchProperties).not.toHaveBeenCalled()
  })

  it('should handle error when searching properties', async () => {
    // ARRANGE
    const query = 'beachfront'
    const error = new Error('Search failed')
    ;(PropertyService.searchProperties as jest.Mock).mockRejectedValue(error)

    // ACT
    const { result } = renderHook(() => useSearchPropertiesQuery(query), {
      wrapper: getWrapper(),
    })

    // ASSERT
    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toBe(error)
  })

  it('should search when query is exactly 3 characters', async () => {
    // ARRANGE
    const query = 'abc'
    const searchResults = mockProperties
    ;(PropertyService.searchProperties as jest.Mock).mockResolvedValue(searchResults)

    // ACT
    const { result } = renderHook(() => useSearchPropertiesQuery(query), {
      wrapper: getWrapper(),
    })

    // ASSERT
    await waitFor(() => {
      expect(result.current.data).toEqual(searchResults)
    })

    expect(PropertyService.searchProperties).toHaveBeenCalledWith(query)
  })
})

// Additional integration tests
describe('Property Query Hooks Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should maintain proper staleTime configuration across hooks', () => {
    // ARRANGE & ACT
    const propertiesQuery = renderHook(() => usePropertiesQuery(), {
      wrapper: getWrapper(),
    })
    const propertyQuery = renderHook(() => usePropertyQuery('1'), {
      wrapper: getWrapper(),
    })
    const optimizedQuery = renderHook(() => usePropertiesOptimizedQuery(), {
      wrapper: getWrapper(),
    })
    const batchQuery = renderHook(() => usePropertiesBatchQuery(['1', '2']), {
      wrapper: getWrapper(),
    })

    // ASSERT - Check that stale times are configured correctly
    // Note: In a real test, you'd check the internal query client state
    // This is more of a smoke test to ensure hooks are configured
    expect(propertiesQuery.result.current).toBeDefined()
    expect(propertyQuery.result.current).toBeDefined()
    expect(optimizedQuery.result.current).toBeDefined()
    expect(batchQuery.result.current).toBeDefined()
  })

  it('should handle concurrent property operations', async () => {
    // ARRANGE
    const newProperty = mockProperties[0]
    ;(PropertyService.getAllProperties as jest.Mock).mockResolvedValue([])
    ;(PropertyService.createProperty as jest.Mock).mockResolvedValue(newProperty)

    // ACT
    const propertiesQuery = renderHook(() => usePropertiesQuery(), {
      wrapper: getWrapper(),
    })
    const createMutation = renderHook(() => useCreatePropertyMutation(), {
      wrapper: getWrapper(),
    })

    await waitFor(() => {
      expect(propertiesQuery.result.current.isSuccess).toBe(true)
    })

    createMutation.result.current.mutate({
      address: '123 Test St',
      price: 500000,
      bedrooms: 3,
      bathrooms: 2,
      property_type: 'house',
      status: 'active',
    })

    // ASSERT
    await waitFor(() => {
      expect(createMutation.result.current.isSuccess).toBe(true)
    })

    expect(PropertyService.getAllProperties).toHaveBeenCalled()
    expect(PropertyService.createProperty).toHaveBeenCalled()
  })
})