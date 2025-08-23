// propertyService.Deletion.test.ts - TDD Tests for Property Deletion
import { 
  createMockProperty, 
  createMockLink,
  createMockActivity,
  SupabaseMockFactory 
} from '@/test'
import { PropertyService } from '@/lib/supabase/property.service'
import { PropertyDeletionService } from '../propertyDeletionService'
import { DeletionImpact, DeleteOptions } from '../types/deletion.types'

// Mock the Supabase client module
jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: jest.fn()
  }
}))

describe('PropertyDeletionService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('deleteProperty', () => {
    it('should delete unused property successfully', async () => {
      // ARRANGE - Use mock factory for consistent data
      const property = createMockProperty({
        id: 'prop-123',
        address: '123 Test Street',
        status: 'active'
      })
      
      // Mock Supabase to return no related data (property is unused)
      const { supabase } = require('@/lib/supabase/client')
      supabase.from.mockImplementation((table: string) => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        contains: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: null, error: null })
        })
      }))
      
      // ACT - Execute the deletion
      const result = await PropertyDeletionService.deleteProperty(property.id)

      // ASSERT - Check expectations
      expect(result.success).toBe(true)
      expect(result.type).toBe('hard_delete')
      expect(supabase.from).toHaveBeenCalledWith('properties')
    })

    it('should soft delete property with activities', async () => {
      // ARRANGE
      const property = createMockProperty({ id: 'prop-456' })
      const activities = [createMockActivity({ property_id: property.id })]
      
      const { supabase } = require('@/lib/supabase/client')
      supabase.from.mockImplementation((table: string) => {
        if (table === 'activities') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockResolvedValue({ data: activities, error: null }),
            update: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnThis(),
              select: jest.fn().mockResolvedValue({ count: 1 })
            })
          }
        }
        if (table === 'links') {
          return {
            select: jest.fn().mockReturnThis(),
            contains: jest.fn().mockResolvedValue({ data: [], error: null })
          }
        }
        if (table === 'properties') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: property, error: null }),
            update: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ data: null, error: null })
            }),
            delete: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ data: null, error: null })
            })
          }
        }
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          contains: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: null, error: null })
        }
      })
      
      // ACT
      const result = await PropertyDeletionService.deleteProperty(property.id)
      
      // ASSERT
      expect(result.success).toBe(true)
      expect(result.type).toBe('soft_delete')
      expect(result.archivedActivities).toBe(1)
    })

    it('should prevent deletion of property in active links', async () => {
      // ARRANGE
      const property = createMockProperty({ id: 'prop-789' })
      const activeLink = createMockLink({ 
        property_ids: [property.id],
        status: 'active' 
      })
      
      const { supabase } = require('@/lib/supabase/client')
      supabase.from.mockImplementation((table: string) => {
        if (table === 'links') {
          return {
            select: jest.fn().mockReturnThis(),
            contains: jest.fn().mockResolvedValue({ data: [activeLink], error: null })
          }
        }
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: null, error: null })
        }
      })
      
      // ACT & ASSERT
      await expect(PropertyDeletionService.deleteProperty(property.id))
        .rejects
        .toThrow('Cannot delete property with active links')
    })

    it('should handle database errors gracefully', async () => {
      // ARRANGE
      const property = createMockProperty()
      const error = new Error('Database connection failed')
      
      const { supabase } = require('@/lib/supabase/client')
      supabase.from.mockImplementation(() => {
        throw error
      })
      
      // ACT & ASSERT
      await expect(PropertyDeletionService.deleteProperty(property.id))
        .rejects
        .toThrow('Database connection failed')
    })

    it('should validate property ownership before deletion', async () => {
      // ARRANGE
      const property = createMockProperty({ 
        id: 'prop-owned',
        agent_id: 'agent-123' 
      })
      
      const options: DeleteOptions = {
        agentId: 'agent-456' // Different agent
      }
      
      const { supabase } = require('@/lib/supabase/client')
      supabase.from.mockImplementation((table: string) => {
        if (table === 'properties') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: property, error: null })
          }
        }
        return {
          select: jest.fn().mockReturnThis(),
          contains: jest.fn().mockResolvedValue({ data: [], error: null })
        }
      })
      
      // ACT & ASSERT
      await expect(PropertyDeletionService.deleteProperty(property.id, options))
        .rejects
        .toThrow('Unauthorized: Property belongs to another agent')
    })

    it('should allow force deletion of property with active links', async () => {
      // ARRANGE
      const property = createMockProperty({ id: 'prop-force' })
      const activeLink = createMockLink({ 
        property_ids: [property.id],
        status: 'active' 
      })
      
      const { supabase } = require('@/lib/supabase/client')
      supabase.from.mockImplementation((table: string) => {
        if (table === 'links') {
          return {
            select: jest.fn().mockReturnThis(),
            contains: jest.fn().mockResolvedValue({ data: [activeLink], error: null }),
            update: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ data: null, error: null })
            })
          }
        }
        if (table === 'activities') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockResolvedValue({ data: [], error: null }),
            update: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnThis(),
              select: jest.fn().mockResolvedValue({ count: 0 })
            })
          }
        }
        if (table === 'properties') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: property, error: null }),
            update: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ data: null, error: null })
            }),
            delete: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ data: null, error: null })
            })
          }
        }
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis()
        }
      })
      
      const options: DeleteOptions = { forceDelete: true }
      
      // ACT
      const result = await PropertyDeletionService.deleteProperty(property.id, options)
      
      // ASSERT
      expect(result.success).toBe(true)
      expect(result.cascadeResults.linksUpdated).toBeGreaterThan(0)
    })
  })

  describe('analyzeDeletionImpact', () => {
    it('should analyze deletion impact correctly', async () => {
      // ARRANGE
      const property = createMockProperty({ id: 'prop-impact' })
      const links = [
        createMockLink({ property_ids: [property.id] }),
        createMockLink({ property_ids: [property.id] })
      ]
      const activities = [
        createMockActivity({ property_id: property.id }),
        createMockActivity({ property_id: property.id })
      ]
      
      const { supabase } = require('@/lib/supabase/client')
      supabase.from.mockImplementation((table: string) => {
        if (table === 'links') {
          return {
            select: jest.fn().mockReturnThis(),
            contains: jest.fn().mockResolvedValue({ data: links, error: null })
          }
        }
        if (table === 'activities') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockResolvedValue({ data: activities, error: null })
          }
        }
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis()
        }
      })
      
      // ACT
      const impact = await PropertyDeletionService.analyzeDeletionImpact(property.id)
      
      // ASSERT
      expect(impact.linkedCollections).toBe(2)
      expect(impact.totalActivities).toBe(2)
      expect(impact.requiresSoftDelete).toBe(true)
      expect(impact.canUndo).toBe(true)
    })

    it('should identify properties safe for hard deletion', async () => {
      // ARRANGE
      const property = createMockProperty({ id: 'prop-safe' })
      
      const { supabase } = require('@/lib/supabase/client')
      supabase.from.mockImplementation((table: string) => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        contains: jest.fn().mockResolvedValue({ data: [], error: null }) // No related data
      }))
      
      // ACT
      const impact = await PropertyDeletionService.analyzeDeletionImpact(property.id)
      
      // ASSERT
      expect(impact.linkedCollections).toBe(0)
      expect(impact.totalActivities).toBe(0)
      expect(impact.requiresSoftDelete).toBe(false)
      expect(impact.estimatedDataLoss).toHaveLength(0)
    })
  })
})