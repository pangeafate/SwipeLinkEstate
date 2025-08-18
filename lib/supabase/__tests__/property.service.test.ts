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
  })
})