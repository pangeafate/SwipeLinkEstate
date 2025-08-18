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
          features: ['parking', 'pool'],
          cover_image: null,
          images: [],
          status: 'active',
          created_at: '2023-01-01T00:00:00.000Z',
          updated_at: '2023-01-01T00:00:00.000Z',
        },
      ]

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: mockProperties,
              error: null,
            }),
          }),
        }),
      } as any)

      // ACT
      const result = await PropertyService.getAllProperties()

      // ASSERT
      expect(result).toEqual(mockProperties)
      expect(mockSupabase.from).toHaveBeenCalledWith('properties')
    })

    it('should throw error when database query fails', async () => {
      // ARRANGE
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database error' },
            }),
          }),
        }),
      } as any)

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
        features: ['parking', 'pool'],
        cover_image: null,
        images: [],
        status: 'active',
        created_at: '2023-01-01T00:00:00.000Z',
        updated_at: '2023-01-01T00:00:00.000Z',
      }

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockProperty,
              error: null,
            }),
          }),
        }),
      } as any)

      // ACT
      const result = await PropertyService.getProperty(propertyId)

      // ASSERT
      expect(result).toEqual(mockProperty)
      expect(mockSupabase.from).toHaveBeenCalledWith('properties')
    })

    it('should throw error when property not found', async () => {
      // ARRANGE
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Property not found' },
            }),
          }),
        }),
      } as any)

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
        features: ['garage', 'garden'],
      }

      const createdProperty: Property = {
        id: '2',
        ...propertyData,
        cover_image: null,
        images: [],
        status: 'active',
        created_at: '2023-01-01T00:00:00.000Z',
        updated_at: '2023-01-01T00:00:00.000Z',
      }

      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: createdProperty,
              error: null,
            }),
          }),
        }),
      } as any)

      // ACT
      const result = await PropertyService.createProperty(propertyData)

      // ASSERT
      expect(result).toEqual(createdProperty)
      expect(mockSupabase.from).toHaveBeenCalledWith('properties')
    })

    it('should throw error with invalid data', async () => {
      // ARRANGE
      const invalidData = {} as PropertyInsert

      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Invalid property data' },
            }),
          }),
        }),
      } as any)

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
        features: ['parking', 'pool'],
        cover_image: null,
        images: [],
        status: 'active',
        created_at: '2023-01-01T00:00:00.000Z',
        updated_at: '2023-01-02T00:00:00.000Z',
      }

      mockSupabase.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: updatedProperty,
                error: null,
              }),
            }),
          }),
        }),
      } as any)

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
        features: ['parking', 'pool'],
        cover_image: null,
        images: [],
        status: 'off-market',
        created_at: '2023-01-01T00:00:00.000Z',
        updated_at: '2023-01-01T00:00:00.000Z',
      }

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { status: 'active' },
              error: null,
            }),
          }),
        }),
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: toggledProperty,
                error: null,
              }),
            }),
          }),
        }),
      } as any)

      // ACT
      const result = await PropertyService.togglePropertyStatus(propertyId)

      // ASSERT
      expect(result).toEqual(toggledProperty)
    })
  })
})