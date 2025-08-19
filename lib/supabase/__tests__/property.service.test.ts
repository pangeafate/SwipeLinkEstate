import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { PropertyService } from '../property.service'
import { supabase } from '../client'
import type { Property, PropertyInsert } from '../types'

// Mock Supabase client
jest.mock('../client', () => ({
  supabase: {
    from: jest.fn(),
  },
}))

const mockSupabase = supabase as jest.Mocked<typeof supabase>

describe('PropertyService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getAllProperties', () => {
    it('should return all active properties', async () => {
      // ARRANGE
      const mockProperties: Property[] = [
        {
          id: '1',
          address: '123 Test St',
          price: 500000,
          bedrooms: 3,
          bathrooms: 2.0,
          area_sqft: 1500,
          description: 'Test property',
          features: ['parking', 'pool'] as any, // Cast to Json type
          cover_image: null,
          images: [] as any, // Cast to Json type
          status: 'active',
          created_at: '2023-01-01T00:00:00.000Z',
          updated_at: '2023-01-01T00:00:00.000Z',
        },
      ]

      // @ts-expect-error Mock typing issue
      const mockOrder = (jest.fn() as jest.Mock).mockResolvedValue({
        data: mockProperties,
        error: null,
      })
      const mockEq = jest.fn().mockReturnValue({ order: mockOrder })
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq })
      const mockQueryBuilder = { select: mockSelect }
      mockSupabase.from.mockReturnValue(mockQueryBuilder as any)

      // ACT
      const result = await PropertyService.getAllProperties()

      // ASSERT
      expect(result).toEqual(mockProperties)
      expect(mockSupabase.from).toHaveBeenCalledWith('properties')
    })

    it('should throw error when database query fails', async () => {
      // ARRANGE
      // @ts-expect-error Mock typing issue
      const mockOrder = (jest.fn() as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      })
      const mockEq = jest.fn().mockReturnValue({ order: mockOrder })
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq })
      const mockQueryBuilder = { select: mockSelect }
      mockSupabase.from.mockReturnValue(mockQueryBuilder as any)

      // ACT & ASSERT
      await expect(PropertyService.getAllProperties()).rejects.toThrow('Database error')
    })
  })

  describe('getProperty', () => {
    it('should return a single property by id', async () => {
      // ARRANGE
      const propertyId = '1'
      const mockProperty: Property = {
        id: propertyId,
        address: '123 Test St',
        price: 500000,
        bedrooms: 3,
        bathrooms: 2.0,
        area_sqft: 1500,
        description: 'Test property',
        features: ['parking', 'pool'] as any, // Cast to Json type
        cover_image: null,
        images: [] as any, // Cast to Json type
        status: 'active',
        created_at: '2023-01-01T00:00:00.000Z',
        updated_at: '2023-01-01T00:00:00.000Z',
      }

      // @ts-expect-error Mock typing issue
      const mockSingle = (jest.fn() as jest.Mock).mockResolvedValue({
        data: mockProperty,
        error: null,
      })
      const mockEq = jest.fn().mockReturnValue({ single: mockSingle })
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq })
      const mockQueryBuilder = { select: mockSelect }
      mockSupabase.from.mockReturnValue(mockQueryBuilder as any)

      // ACT
      const result = await PropertyService.getProperty(propertyId)

      // ASSERT
      expect(result).toEqual(mockProperty)
      expect(mockSupabase.from).toHaveBeenCalledWith('properties')
    })

    it('should throw error when property not found', async () => {
      // ARRANGE
      // @ts-expect-error Mock typing issue
      const mockSingle = (jest.fn() as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Property not found' },
      })
      const mockEq = jest.fn().mockReturnValue({ single: mockSingle })
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq })
      const mockQueryBuilder = { select: mockSelect }
      mockSupabase.from.mockReturnValue(mockQueryBuilder as any)

      // ACT & ASSERT
      await expect(PropertyService.getProperty('nonexistent')).rejects.toThrow('Property not found')
    })
  })

  describe('createProperty', () => {
    it('should create a new property', async () => {
      // ARRANGE
      const propertyData: PropertyInsert = {
        address: '456 New St',
        price: 750000,
        bedrooms: 4,
        bathrooms: 3.0,
        area_sqft: 2000,
        description: 'New test property',
        features: ['garage', 'garden'] as any, // Cast to Json type
      }

      const createdProperty: Property = {
        id: '2',
        address: propertyData.address,
        price: propertyData.price!,
        bedrooms: propertyData.bedrooms!,
        bathrooms: propertyData.bathrooms!,
        area_sqft: propertyData.area_sqft!,
        description: propertyData.description!,
        features: propertyData.features!,
        cover_image: null,
        images: [] as any, // Cast to Json type
        status: 'active',
        created_at: '2023-01-01T00:00:00.000Z',
        updated_at: '2023-01-01T00:00:00.000Z',
      }

      // @ts-expect-error Mock typing issue
      const mockSingle = (jest.fn() as jest.Mock).mockResolvedValue({
        data: createdProperty,
        error: null,
      })
      const mockSelect = jest.fn().mockReturnValue({ single: mockSingle })
      const mockInsert = jest.fn().mockReturnValue({ select: mockSelect })
      const mockQueryBuilder = { insert: mockInsert }
      mockSupabase.from.mockReturnValue(mockQueryBuilder as any)

      // ACT
      const result = await PropertyService.createProperty(propertyData)

      // ASSERT
      expect(result).toEqual(createdProperty)
      expect(mockSupabase.from).toHaveBeenCalledWith('properties')
    })

    it('should throw error with invalid data', async () => {
      // ARRANGE
      const invalidData = {} as PropertyInsert

      // @ts-expect-error Mock typing issue
      const mockSingle = (jest.fn() as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Invalid property data' },
      })
      const mockSelect = jest.fn().mockReturnValue({ single: mockSingle })
      const mockInsert = jest.fn().mockReturnValue({ select: mockSelect })
      const mockQueryBuilder = { insert: mockInsert }
      mockSupabase.from.mockReturnValue(mockQueryBuilder as any)

      // ACT & ASSERT
      await expect(PropertyService.createProperty(invalidData)).rejects.toThrow('Invalid property data')
    })
  })

  describe('updateProperty', () => {
    it('should update existing property', async () => {
      // ARRANGE
      const propertyId = '1'
      const updateData = { price: 600000, description: 'Updated description' }
      
      const updatedProperty: Property = {
        id: propertyId,
        address: '123 Test St',
        price: 600000,
        bedrooms: 3,
        bathrooms: 2.0,
        area_sqft: 1500,
        description: 'Updated description',
        features: ['parking', 'pool'] as any, // Cast to Json type
        cover_image: null,
        images: [] as any, // Cast to Json type
        status: 'active',
        created_at: '2023-01-01T00:00:00.000Z',
        updated_at: '2023-01-02T00:00:00.000Z',
      }

      // @ts-expect-error Mock typing issue
      const mockSingle = (jest.fn() as jest.Mock).mockResolvedValue({
        data: updatedProperty,
        error: null,
      })
      const mockSelect = jest.fn().mockReturnValue({ single: mockSingle })
      const mockEq = jest.fn().mockReturnValue({ select: mockSelect })
      const mockUpdate = jest.fn().mockReturnValue({ eq: mockEq })
      const mockQueryBuilder = { update: mockUpdate }
      mockSupabase.from.mockReturnValue(mockQueryBuilder as any)

      // ACT
      const result = await PropertyService.updateProperty(propertyId, updateData)

      // ASSERT
      expect(result).toEqual(updatedProperty)
    })
  })

  describe('togglePropertyStatus', () => {
    it('should toggle property from active to off-market', async () => {
      // ARRANGE
      const propertyId = '1'
      const toggledProperty: Property = {
        id: propertyId,
        address: '123 Test St',
        price: 500000,
        bedrooms: 3,
        bathrooms: 2.0,
        area_sqft: 1500,
        description: 'Test property',
        features: ['parking', 'pool'] as any, // Cast to Json type
        cover_image: null,
        images: [] as any, // Cast to Json type
        status: 'off-market',
        created_at: '2023-01-01T00:00:00.000Z',
        updated_at: '2023-01-01T00:00:00.000Z',
      }

      // @ts-expect-error Mock typing issue
      const mockSingleForStatus = (jest.fn() as jest.Mock).mockResolvedValue({
        data: { status: 'active' },
        error: null,
      })
      const mockEqForStatus = jest.fn().mockReturnValue({ single: mockSingleForStatus })
      const mockSelectForStatus = jest.fn().mockReturnValue({ eq: mockEqForStatus })

      // @ts-expect-error Mock typing issue
      const mockSingleForUpdate = (jest.fn() as jest.Mock).mockResolvedValue({
        data: toggledProperty,
        error: null,
      })
      const mockSelectForUpdate = jest.fn().mockReturnValue({ single: mockSingleForUpdate })
      const mockEqForUpdate = jest.fn().mockReturnValue({ select: mockSelectForUpdate })
      const mockUpdate = jest.fn().mockReturnValue({ eq: mockEqForUpdate })

      const mockQueryBuilder = {
        select: mockSelectForStatus,
        update: mockUpdate
      }
      mockSupabase.from.mockReturnValue(mockQueryBuilder as any)

      // ACT
      const result = await PropertyService.togglePropertyStatus(propertyId)

      // ASSERT
      expect(result).toEqual(toggledProperty)
    })

    it('should toggle property from off-market to active', async () => {
      // ARRANGE
      const propertyId = '1'
      const toggledProperty: Property = {
        id: propertyId,
        address: '123 Test St',
        price: 500000,
        bedrooms: 3,
        bathrooms: 2.0,
        area_sqft: 1500,
        description: 'Test property',
        features: ['parking', 'pool'] as any,
        cover_image: null,
        images: [] as any,
        status: 'active',
        created_at: '2023-01-01T00:00:00.000Z',
        updated_at: '2023-01-01T00:00:00.000Z',
      }

      // Mock the current status fetch returning 'off-market'
      const mockSingleForStatus = (jest.fn() as jest.Mock).mockResolvedValue({
        data: { status: 'off-market' },
        error: null,
      })
      const mockEqForStatus = jest.fn().mockReturnValue({ single: mockSingleForStatus })
      const mockSelectForStatus = jest.fn().mockReturnValue({ eq: mockEqForStatus })

      // Mock the update operation
      const mockSingleForUpdate = (jest.fn() as jest.Mock).mockResolvedValue({
        data: toggledProperty,
        error: null,
      })
      const mockSelectForUpdate = jest.fn().mockReturnValue({ single: mockSingleForUpdate })
      const mockEqForUpdate = jest.fn().mockReturnValue({ select: mockSelectForUpdate })
      const mockUpdate = jest.fn().mockReturnValue({ eq: mockEqForUpdate })

      const mockQueryBuilder = {
        select: mockSelectForStatus,
        update: mockUpdate
      }
      mockSupabase.from.mockReturnValue(mockQueryBuilder as any)

      // ACT
      const result = await PropertyService.togglePropertyStatus(propertyId)

      // ASSERT
      expect(result).toEqual(toggledProperty)
      expect(result.status).toBe('active')
    })

    it('should throw error when fetching current status fails', async () => {
      // ARRANGE
      const propertyId = '1'

      const mockSingleForStatus = (jest.fn() as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Property not found for status check' },
      })
      const mockEqForStatus = jest.fn().mockReturnValue({ single: mockSingleForStatus })
      const mockSelectForStatus = jest.fn().mockReturnValue({ eq: mockEqForStatus })

      const mockQueryBuilder = {
        select: mockSelectForStatus,
      }
      mockSupabase.from.mockReturnValue(mockQueryBuilder as any)

      // ACT & ASSERT
      await expect(PropertyService.togglePropertyStatus(propertyId)).rejects.toThrow('Property not found for status check')
    })

    it('should throw error when update operation fails', async () => {
      // ARRANGE
      const propertyId = '1'

      // Mock successful status fetch
      const mockSingleForStatus = (jest.fn() as jest.Mock).mockResolvedValue({
        data: { status: 'active' },
        error: null,
      })
      const mockEqForStatus = jest.fn().mockReturnValue({ single: mockSingleForStatus })
      const mockSelectForStatus = jest.fn().mockReturnValue({ eq: mockEqForStatus })

      // Mock failed update operation
      const mockSingleForUpdate = (jest.fn() as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Update failed' },
      })
      const mockSelectForUpdate = jest.fn().mockReturnValue({ single: mockSingleForUpdate })
      const mockEqForUpdate = jest.fn().mockReturnValue({ select: mockSelectForUpdate })
      const mockUpdate = jest.fn().mockReturnValue({ eq: mockEqForUpdate })

      const mockQueryBuilder = {
        select: mockSelectForStatus,
        update: mockUpdate
      }
      mockSupabase.from.mockReturnValue(mockQueryBuilder as any)

      // ACT & ASSERT
      await expect(PropertyService.togglePropertyStatus(propertyId)).rejects.toThrow('Update failed')
    })
  })

  describe('updateProperty error handling', () => {
    it('should throw error when update fails', async () => {
      // ARRANGE
      const propertyId = '1'
      const updateData = { price: 600000 }

      const mockSingle = (jest.fn() as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Update operation failed' },
      })
      const mockSelect = jest.fn().mockReturnValue({ single: mockSingle })
      const mockEq = jest.fn().mockReturnValue({ select: mockSelect })
      const mockUpdate = jest.fn().mockReturnValue({ eq: mockEq })
      const mockQueryBuilder = { update: mockUpdate }
      mockSupabase.from.mockReturnValue(mockQueryBuilder as any)

      // ACT & ASSERT
      await expect(PropertyService.updateProperty(propertyId, updateData)).rejects.toThrow('Update operation failed')
    })
  })

  describe('uploadPropertyImages', () => {
    beforeEach(() => {
      // Mock supabase storage
      mockSupabase.storage = {
        from: jest.fn(),
      } as any
    })

    it('should upload multiple property images successfully', async () => {
      // ARRANGE
      const propertyId = 'property-123'
      const mockFiles = [
        new File(['image1'], 'image1.jpg', { type: 'image/jpeg' }),
        new File(['image2'], 'image2.png', { type: 'image/png' }),
      ]

      // Mock successful uploads
      const mockUpload = jest.fn()
        .mockResolvedValueOnce({
          data: { path: 'property-123/timestamp-0-image1.jpg' },
          error: null,
        })
        .mockResolvedValueOnce({
          data: { path: 'property-123/timestamp-1-image2.png' },
          error: null,
        })

      const mockGetPublicUrl = jest.fn()
        .mockReturnValueOnce({
          data: { publicUrl: 'https://storage.supabase.co/property-123/timestamp-0-image1.jpg' },
        })
        .mockReturnValueOnce({
          data: { publicUrl: 'https://storage.supabase.co/property-123/timestamp-1-image2.png' },
        })

      const mockStorageBucket = {
        upload: mockUpload,
        getPublicUrl: mockGetPublicUrl,
      }

      mockSupabase.storage.from.mockReturnValue(mockStorageBucket)

      // ACT
      const result = await PropertyService.uploadPropertyImages(propertyId, mockFiles)

      // ASSERT
      expect(result).toEqual([
        'https://storage.supabase.co/property-123/timestamp-0-image1.jpg',
        'https://storage.supabase.co/property-123/timestamp-1-image2.png',
      ])
      expect(mockSupabase.storage.from).toHaveBeenCalledWith('property-images')
      expect(mockUpload).toHaveBeenCalledTimes(2)
      expect(mockGetPublicUrl).toHaveBeenCalledTimes(2)
    })

    it('should throw error when upload fails for a file', async () => {
      // ARRANGE
      const propertyId = 'property-123'
      const mockFiles = [
        new File(['image1'], 'image1.jpg', { type: 'image/jpeg' }),
        new File(['image2'], 'image2.png', { type: 'image/png' }),
      ]

      // Mock first upload success, second upload failure
      const mockUpload = jest.fn()
        .mockResolvedValueOnce({
          data: { path: 'property-123/timestamp-0-image1.jpg' },
          error: null,
        })
        .mockResolvedValueOnce({
          data: null,
          error: { message: 'Upload failed' },
        })

      const mockGetPublicUrl = jest.fn()
        .mockReturnValue({
          data: { publicUrl: 'https://storage.supabase.co/property-123/timestamp-0-image1.jpg' },
        })

      const mockStorageBucket = {
        upload: mockUpload,
        getPublicUrl: mockGetPublicUrl,
      }

      mockSupabase.storage.from.mockReturnValue(mockStorageBucket)

      // ACT & ASSERT
      await expect(PropertyService.uploadPropertyImages(propertyId, mockFiles))
        .rejects.toThrow('Failed to upload image2.png: Upload failed')
    })

    it('should handle empty files array', async () => {
      // ARRANGE
      const propertyId = 'property-123'
      const mockFiles: File[] = []

      // ACT
      const result = await PropertyService.uploadPropertyImages(propertyId, mockFiles)

      // ASSERT
      expect(result).toEqual([])
      expect(mockSupabase.storage.from).not.toHaveBeenCalled()
    })

    it('should generate unique file names with timestamps', async () => {
      // ARRANGE
      const propertyId = 'property-123'
      const mockFiles = [
        new File(['image1'], 'test.jpg', { type: 'image/jpeg' }),
      ]

      // Mock Date.now to control timestamp
      const originalDateNow = Date.now
      Date.now = jest.fn(() => 1640995200000) // Fixed timestamp

      const mockUpload = jest.fn().mockResolvedValue({
        data: { path: 'property-123/1640995200000-0-test.jpg' },
        error: null,
      })

      const mockGetPublicUrl = jest.fn().mockReturnValue({
        data: { publicUrl: 'https://storage.supabase.co/property-123/1640995200000-0-test.jpg' },
      })

      const mockStorageBucket = {
        upload: mockUpload,
        getPublicUrl: mockGetPublicUrl,
      }

      mockSupabase.storage.from.mockReturnValue(mockStorageBucket)

      try {
        // ACT
        await PropertyService.uploadPropertyImages(propertyId, mockFiles)

        // ASSERT
        expect(mockUpload).toHaveBeenCalledWith(
          'property-123/1640995200000-0-test.jpg',
          mockFiles[0]
        )
      } finally {
        // Restore Date.now
        Date.now = originalDateNow
      }
    })
  })

  describe('getPropertiesByIds', () => {
    it('should return properties matching provided IDs', async () => {
      // ARRANGE
      const propertyIds = ['1', '2', '3']
      const mockProperties: Property[] = [
        {
          id: '1',
          address: '123 Test St',
          price: 500000,
          bedrooms: 3,
          bathrooms: 2,
          area_sqft: 1500,
          description: 'Property 1',
          features: [] as any,
          cover_image: null,
          images: [] as any,
          status: 'active',
          created_at: '2023-01-01T00:00:00.000Z',
          updated_at: '2023-01-01T00:00:00.000Z',
        },
        {
          id: '2',
          address: '456 Test Ave',
          price: 750000,
          bedrooms: 4,
          bathrooms: 3,
          area_sqft: 2000,
          description: 'Property 2',
          features: [] as any,
          cover_image: null,
          images: [] as any,
          status: 'active',
          created_at: '2023-01-02T00:00:00.000Z',
          updated_at: '2023-01-02T00:00:00.000Z',
        },
      ]

      const mockOrder = (jest.fn() as jest.Mock).mockResolvedValue({
        data: mockProperties,
        error: null,
      })
      const mockIn = jest.fn().mockReturnValue({ order: mockOrder })
      const mockSelect = jest.fn().mockReturnValue({ in: mockIn })
      const mockQueryBuilder = { select: mockSelect }
      mockSupabase.from.mockReturnValue(mockQueryBuilder as any)

      // ACT
      const result = await PropertyService.getPropertiesByIds(propertyIds)

      // ASSERT
      expect(result).toEqual(mockProperties)
      expect(mockSupabase.from).toHaveBeenCalledWith('properties')
      expect(mockSelect).toHaveBeenCalledWith('*')
      expect(mockIn).toHaveBeenCalledWith('id', propertyIds)
      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false })
    })

    it('should throw error when query fails', async () => {
      // ARRANGE
      const propertyIds = ['1', '2']

      const mockOrder = (jest.fn() as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Database query failed' },
      })
      const mockIn = jest.fn().mockReturnValue({ order: mockOrder })
      const mockSelect = jest.fn().mockReturnValue({ in: mockIn })
      const mockQueryBuilder = { select: mockSelect }
      mockSupabase.from.mockReturnValue(mockQueryBuilder as any)

      // ACT & ASSERT
      await expect(PropertyService.getPropertiesByIds(propertyIds)).rejects.toThrow('Database query failed')
    })

    it('should handle empty array of IDs', async () => {
      // ARRANGE
      const propertyIds: string[] = []

      const mockOrder = (jest.fn() as jest.Mock).mockResolvedValue({
        data: [],
        error: null,
      })
      const mockIn = jest.fn().mockReturnValue({ order: mockOrder })
      const mockSelect = jest.fn().mockReturnValue({ in: mockIn })
      const mockQueryBuilder = { select: mockSelect }
      mockSupabase.from.mockReturnValue(mockQueryBuilder as any)

      // ACT
      const result = await PropertyService.getPropertiesByIds(propertyIds)

      // ASSERT
      expect(result).toEqual([])
      expect(mockIn).toHaveBeenCalledWith('id', [])
    })
  })

  describe('searchProperties', () => {
    it('should return properties matching search query in address', async () => {
      // ARRANGE
      const query = 'Test Street'
      const mockProperties: Property[] = [
        {
          id: '1',
          address: '123 Test Street, City, State',
          price: 500000,
          bedrooms: 3,
          bathrooms: 2,
          area_sqft: 1500,
          description: 'Beautiful home',
          features: [] as any,
          cover_image: null,
          images: [] as any,
          status: 'active',
          created_at: '2023-01-01T00:00:00.000Z',
          updated_at: '2023-01-01T00:00:00.000Z',
        },
      ]

      const mockOrder = (jest.fn() as jest.Mock).mockResolvedValue({
        data: mockProperties,
        error: null,
      })
      const mockEq = jest.fn().mockReturnValue({ order: mockOrder })
      const mockOr = jest.fn().mockReturnValue({ eq: mockEq })
      const mockSelect = jest.fn().mockReturnValue({ or: mockOr })
      const mockQueryBuilder = { select: mockSelect }
      mockSupabase.from.mockReturnValue(mockQueryBuilder as any)

      // ACT
      const result = await PropertyService.searchProperties(query)

      // ASSERT
      expect(result).toEqual(mockProperties)
      expect(mockSupabase.from).toHaveBeenCalledWith('properties')
      expect(mockSelect).toHaveBeenCalledWith('*')
      expect(mockOr).toHaveBeenCalledWith(`address.ilike.%${query}%,description.ilike.%${query}%`)
      expect(mockEq).toHaveBeenCalledWith('status', 'active')
      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false })
    })

    it('should return properties matching search query in description', async () => {
      // ARRANGE
      const query = 'spacious'
      const mockProperties: Property[] = [
        {
          id: '1',
          address: '123 Main St',
          price: 500000,
          bedrooms: 3,
          bathrooms: 2,
          area_sqft: 1500,
          description: 'Very spacious home with modern amenities',
          features: [] as any,
          cover_image: null,
          images: [] as any,
          status: 'active',
          created_at: '2023-01-01T00:00:00.000Z',
          updated_at: '2023-01-01T00:00:00.000Z',
        },
      ]

      const mockOrder = (jest.fn() as jest.Mock).mockResolvedValue({
        data: mockProperties,
        error: null,
      })
      const mockEq = jest.fn().mockReturnValue({ order: mockOrder })
      const mockOr = jest.fn().mockReturnValue({ eq: mockEq })
      const mockSelect = jest.fn().mockReturnValue({ or: mockOr })
      const mockQueryBuilder = { select: mockSelect }
      mockSupabase.from.mockReturnValue(mockQueryBuilder as any)

      // ACT
      const result = await PropertyService.searchProperties(query)

      // ASSERT
      expect(result).toEqual(mockProperties)
      expect(mockOr).toHaveBeenCalledWith(`address.ilike.%${query}%,description.ilike.%${query}%`)
    })

    it('should throw error when search query fails', async () => {
      // ARRANGE
      const query = 'test query'

      const mockOrder = (jest.fn() as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Search failed' },
      })
      const mockEq = jest.fn().mockReturnValue({ order: mockOrder })
      const mockOr = jest.fn().mockReturnValue({ eq: mockEq })
      const mockSelect = jest.fn().mockReturnValue({ or: mockOr })
      const mockQueryBuilder = { select: mockSelect }
      mockSupabase.from.mockReturnValue(mockQueryBuilder as any)

      // ACT & ASSERT
      await expect(PropertyService.searchProperties(query)).rejects.toThrow('Search failed')
    })

    it('should return empty array when no matches found', async () => {
      // ARRANGE
      const query = 'nonexistent property'

      const mockOrder = (jest.fn() as jest.Mock).mockResolvedValue({
        data: [],
        error: null,
      })
      const mockEq = jest.fn().mockReturnValue({ order: mockOrder })
      const mockOr = jest.fn().mockReturnValue({ eq: mockEq })
      const mockSelect = jest.fn().mockReturnValue({ or: mockOr })
      const mockQueryBuilder = { select: mockSelect }
      mockSupabase.from.mockReturnValue(mockQueryBuilder as any)

      // ACT
      const result = await PropertyService.searchProperties(query)

      // ASSERT
      expect(result).toEqual([])
    })

    it('should handle special characters in search query', async () => {
      // ARRANGE
      const query = "O'Connor Street & 5th Ave"

      const mockOrder = (jest.fn() as jest.Mock).mockResolvedValue({
        data: [],
        error: null,
      })
      const mockEq = jest.fn().mockReturnValue({ order: mockOrder })
      const mockOr = jest.fn().mockReturnValue({ eq: mockEq })
      const mockSelect = jest.fn().mockReturnValue({ or: mockOr })
      const mockQueryBuilder = { select: mockSelect }
      mockSupabase.from.mockReturnValue(mockQueryBuilder as any)

      // ACT
      const result = await PropertyService.searchProperties(query)

      // ASSERT
      expect(result).toEqual([])
      expect(mockOr).toHaveBeenCalledWith(`address.ilike.%${query}%,description.ilike.%${query}%`)
    })
  })
})