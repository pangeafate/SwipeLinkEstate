// Property Service Tests
import { PropertyService } from '../property.service'
import { supabase } from '@/lib/supabase/client'
import { PropertyStatus, type PropertyFormData } from '../types'

// Mock Supabase
jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: jest.fn()
  }
}))

const mockSupabase = supabase as jest.Mocked<typeof supabase>

describe('PropertyService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getAllProperties', () => {
    it('should fetch all active properties', async () => {
      const mockProperties = [
        { id: '1', address: '123 Test St', status: 'active' },
        { id: '2', address: '456 Test Ave', status: 'active' }
      ]

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: mockProperties,
              error: null
            })
          })
        })
      } as any)

      const result = await PropertyService.getAllProperties()

      expect(result).toEqual(mockProperties)
      expect(mockSupabase.from).toHaveBeenCalledWith('properties')
    })

    it('should throw error when fetch fails', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database error' }
            })
          })
        })
      } as any)

      await expect(PropertyService.getAllProperties()).rejects.toThrow('Database error')
    })
  })

  describe('createProperty', () => {
    it('should create a new property', async () => {
      const propertyData: PropertyFormData = {
        address: '123 New St',
        price: 500000,
        bedrooms: 3,
        bathrooms: 2
      }

      const mockCreatedProperty = {
        id: 'new-id',
        ...propertyData,
        status: 'active'
      }

      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockCreatedProperty,
              error: null
            })
          })
        })
      } as any)

      const result = await PropertyService.createProperty(propertyData)

      expect(result).toEqual(mockCreatedProperty)
    })
  })

  describe('togglePropertyStatus', () => {
    it('should toggle property status between active and off-market', async () => {
      const propertyId = 'test-id'

      const mockCurrentProperty = { status: 'active' }
      const mockUpdatedProperty = {
        id: propertyId,
        address: '123 Test St',
        status: 'off-market'
      }

      // Mock first call to get current status
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockCurrentProperty,
              error: null
            })
          })
        })
      } as any)

      // Mock second call to update status
      mockSupabase.from.mockReturnValueOnce({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: mockUpdatedProperty,
                error: null
              })
            })
          })
        })
      } as any)

      const result = await PropertyService.togglePropertyStatus(propertyId)

      expect(result).toEqual(mockUpdatedProperty)
      expect(result.status).toBe('off-market')
    })
  })
})