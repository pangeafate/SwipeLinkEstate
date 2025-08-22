/**
 * PropertyService Tests
 * 
 * Following TDD principles with shared test infrastructure
 * Tests the property management business logic layer
 */

import { 
  setupTest, 
  createMockProperty, 
  SupabaseMockFactory,
  fixtures 
} from '@/test'
import { PropertyService } from '../property.service'
import { supabase } from '@/lib/supabase/client'
import { PropertyStatus, type PropertyFormData } from '../types'

// Setup shared test utilities
const { getWrapper } = setupTest({
  mockSupabase: true,
  mockNavigation: false // Not needed for service tests
})

describe('PropertyService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getAllProperties', () => {
    it('should fetch all active properties', async () => {
      // ARRANGE - Use shared mock factory
      const mockProperties = [
        createMockProperty({ id: '1', address: '123 Test St', status: 'active' }),
        createMockProperty({ id: '2', address: '456 Test Ave', status: 'active' })
      ]
      const mockSupabase = SupabaseMockFactory.createSuccessMock(mockProperties)
      jest.mocked(supabase).from = mockSupabase.from

      // ACT
      const result = await PropertyService.getAllProperties()

      // ASSERT
      expect(result).toEqual(mockProperties)
      expect(mockSupabase.from).toHaveBeenCalledWith('properties')
    })

    it('should throw error when fetch fails', async () => {
      // ARRANGE - Use shared error mock
      const mockSupabase = SupabaseMockFactory.createErrorMock('Database error')
      jest.mocked(supabase).from = mockSupabase.from

      // ACT & ASSERT
      await expect(PropertyService.getAllProperties()).rejects.toThrow('Database error')
    })

    it('should handle empty properties list', async () => {
      // ARRANGE
      const mockSupabase = SupabaseMockFactory.createSuccessMock([])
      jest.mocked(supabase).from = mockSupabase.from

      // ACT
      const result = await PropertyService.getAllProperties()

      // ASSERT
      expect(result).toEqual([])
      expect(mockSupabase.from).toHaveBeenCalledWith('properties')
    })
  })

  describe('createProperty', () => {
    it('should create a new property', async () => {
      // ARRANGE - Use mock factory for consistent data
      const propertyData: PropertyFormData = {
        address: '123 New St',
        price: 500000,
        bedrooms: 3,
        bathrooms: 2
      }

      const mockCreatedProperty = createMockProperty({
        ...propertyData,
        status: 'active'
      })

      const mockSupabase = SupabaseMockFactory.createSuccessMock([mockCreatedProperty])
      jest.mocked(supabase).from = mockSupabase.from

      // ACT
      const result = await PropertyService.createProperty(propertyData)

      // ASSERT
      expect(result).toEqual(mockCreatedProperty)
      expect(result.status).toBe('active')
    })

    it('should validate required fields', async () => {
      // ARRANGE
      const invalidData = {
        // Missing required address
        price: 500000
      } as PropertyFormData

      // ACT & ASSERT
      await expect(PropertyService.createProperty(invalidData))
        .rejects
        .toThrow('Address is required')
    })
  })

  describe('togglePropertyStatus', () => {
    it('should toggle property status between active and off-market', async () => {
      // ARRANGE
      const propertyId = 'test-id'
      const mockCurrentProperty = createMockProperty({ 
        id: propertyId,
        status: 'active' 
      })
      const mockUpdatedProperty = createMockProperty({
        id: propertyId,
        address: '123 Test St',
        status: 'off-market'
      })

      // Mock first call to get current status
      const mockGetSupabase = SupabaseMockFactory.createSuccessMock([mockCurrentProperty])
      // Mock second call to update status  
      const mockUpdateSupabase = SupabaseMockFactory.createSuccessMock([mockUpdatedProperty])
      
      jest.mocked(supabase).from = jest.fn()
        .mockReturnValueOnce(mockGetSupabase.from('properties'))
        .mockReturnValueOnce(mockUpdateSupabase.from('properties'))

      // ACT
      const result = await PropertyService.togglePropertyStatus(propertyId)

      // ASSERT
      expect(result).toEqual(mockUpdatedProperty)
      expect(result.status).toBe('off-market')
    })

    it('should toggle from off-market to active', async () => {
      // ARRANGE
      const propertyId = 'test-id'
      const mockCurrentProperty = createMockProperty({ 
        id: propertyId,
        status: 'off-market' 
      })
      const mockUpdatedProperty = createMockProperty({
        id: propertyId,
        status: 'active'
      })

      const mockGetSupabase = SupabaseMockFactory.createSuccessMock([mockCurrentProperty])
      const mockUpdateSupabase = SupabaseMockFactory.createSuccessMock([mockUpdatedProperty])
      
      jest.mocked(supabase).from = jest.fn()
        .mockReturnValueOnce(mockGetSupabase.from('properties'))
        .mockReturnValueOnce(mockUpdateSupabase.from('properties'))

      // ACT
      const result = await PropertyService.togglePropertyStatus(propertyId)

      // ASSERT
      expect(result.status).toBe('active')
    })
  })

  // Additional test coverage for better practices
  describe('getProperty', () => {
    it('should fetch a single property by ID', async () => {
      // ARRANGE
      const mockProperty = createMockProperty({ 
        id: 'prop-123',
        address: '123 Test Street'
      })
      const mockSupabase = SupabaseMockFactory.createSuccessMock([mockProperty])
      jest.mocked(supabase).from = mockSupabase.from

      // ACT
      const result = await PropertyService.getProperty('prop-123')

      // ASSERT
      expect(result.id).toBe('prop-123')
      expect(result.address).toBe('123 Test Street')
    })

    it('should return null for non-existent property', async () => {
      // ARRANGE
      const mockSupabase = SupabaseMockFactory.createSuccessMock([])
      jest.mocked(supabase).from = mockSupabase.from

      // ACT
      const result = await PropertyService.getProperty('non-existent')

      // ASSERT
      expect(result).toBeNull()
    })
  })

  describe('updateProperty', () => {
    it('should update property details', async () => {
      // ARRANGE
      const propertyId = 'prop-123'
      const updates = {
        price: 550000,
        description: 'Updated description'
      }
      const updatedProperty = createMockProperty({
        id: propertyId,
        ...updates
      })
      const mockSupabase = SupabaseMockFactory.createSuccessMock([updatedProperty])
      jest.mocked(supabase).from = mockSupabase.from

      // ACT
      const result = await PropertyService.updateProperty(propertyId, updates)

      // ASSERT
      expect(result.id).toBe(propertyId)
      expect(result.price).toBe(updates.price)
      expect(result.description).toBe(updates.description)
    })
  })
})