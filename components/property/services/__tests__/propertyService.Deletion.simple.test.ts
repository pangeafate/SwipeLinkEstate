// propertyService.Deletion.simple.test.ts - Simplified TDD Tests for Property Deletion

// Mock the Supabase client before importing the service
jest.mock('@/lib/supabase/client', () => {
  const mockSupabaseQuery = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    contains: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: null, error: null }),
    update: jest.fn().mockResolvedValue({ data: [], error: null }),
    delete: jest.fn().mockResolvedValue({ data: [], error: null }),
    then: jest.fn().mockResolvedValue({ data: [], error: null })
  }

  return {
    supabase: {
      from: jest.fn().mockReturnValue(mockSupabaseQuery)
    }
  }
})

import { PropertyDeletionService } from '../propertyDeletionService'
import { supabase } from '@/lib/supabase/client'

const mockSupabase = supabase as any
const mockQuery = mockSupabase.from()

describe('PropertyDeletionService - Basic Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset mock query chain
    mockQuery.then.mockResolvedValue({ data: [], error: null })
    mockQuery.single.mockResolvedValue({ data: null, error: null })
  })

  describe('deleteProperty', () => {
    it('should delete unused property successfully', async () => {
      // ARRANGE - Mock empty results (no related data)
      mockQuery.then.mockResolvedValue({ data: [], error: null })
      
      const propertyId = 'prop-123'

      // ACT
      const result = await PropertyDeletionService.deleteProperty(propertyId)

      // ASSERT
      expect(result.success).toBe(true)
      expect(result.propertyId).toBe(propertyId)
      expect(result.type).toBe('hard_delete')
      expect(mockSupabase.from).toHaveBeenCalledWith('properties')
    })

    it('should prevent deletion of property in active links', async () => {
      // ARRANGE - Mock active links found
      mockQuery.then
        .mockResolvedValueOnce({ data: [{ id: 'link-1', status: 'active' }], error: null }) // links query
        .mockResolvedValueOnce({ data: [], error: null }) // activities query

      const propertyId = 'prop-with-links'

      // ACT & ASSERT
      await expect(PropertyDeletionService.deleteProperty(propertyId))
        .rejects
        .toThrow('Cannot delete property with active links')
    })

    it('should allow force deletion of property with active links', async () => {
      // ARRANGE - Mock active links found
      mockQuery.then
        .mockResolvedValueOnce({ data: [{ id: 'link-1', status: 'active' }], error: null }) // links query
        .mockResolvedValueOnce({ data: [], error: null }) // activities query
        .mockResolvedValue({ data: [], error: null }) // other queries

      const propertyId = 'prop-force-delete'
      const options = { forceDelete: true }

      // ACT
      const result = await PropertyDeletionService.deleteProperty(propertyId, options)

      // ASSERT
      expect(result.success).toBe(true)
      expect(result.type).toBe('hard_delete')
      expect(result.cascadeResults.linksUpdated).toBe(0) // Will be 0 since we mock empty updates
    })

    it('should validate property ownership before deletion', async () => {
      // ARRANGE - Mock property with different agent
      mockQuery.single.mockResolvedValue({ 
        data: { agent_id: 'agent-owner' }, 
        error: null 
      })

      const propertyId = 'prop-owned'
      const options = { agentId: 'agent-different' }

      // ACT & ASSERT
      await expect(PropertyDeletionService.deleteProperty(propertyId, options))
        .rejects
        .toThrow('Unauthorized: Property belongs to another agent')
    })

    it('should handle concurrent deletion attempts', async () => {
      // ARRANGE
      const propertyId = 'prop-concurrent'
      
      // Start first deletion
      const firstDeletion = PropertyDeletionService.deleteProperty(propertyId)

      // ACT & ASSERT - Second deletion should fail
      await expect(PropertyDeletionService.deleteProperty(propertyId))
        .rejects
        .toThrow('Property deletion already in progress')

      // Cleanup - wait for first deletion to complete
      await firstDeletion
    })
  })

  describe('analyzeDeletionImpact', () => {
    it('should analyze deletion impact correctly', async () => {
      // ARRANGE - Mock links and activities
      const propertyId = 'prop-impact'
      
      mockQuery.then
        .mockResolvedValueOnce({ 
          data: [
            { id: 'link-1', status: 'active' },
            { id: 'link-2', status: 'inactive' }
          ], 
          error: null 
        }) // links query
        .mockResolvedValueOnce({ 
          data: [
            { id: 'activity-1' },
            { id: 'activity-2' }
          ], 
          error: null 
        }) // activities query

      // ACT
      const impact = await PropertyDeletionService.analyzeDeletionImpact(propertyId)

      // ASSERT
      expect(impact.linkedCollections).toBe(2)
      expect(impact.totalActivities).toBe(2)
      expect(impact.activeLinks).toContain('link-1')
      expect(impact.activeLinks).not.toContain('link-2')
      expect(impact.requiresSoftDelete).toBe(true)
      expect(impact.canUndo).toBe(true)
    })

    it('should identify properties safe for hard deletion', async () => {
      // ARRANGE - Mock no related data
      const propertyId = 'prop-safe'
      
      mockQuery.then
        .mockResolvedValueOnce({ data: [], error: null }) // no links
        .mockResolvedValueOnce({ data: [], error: null }) // no activities

      // ACT
      const impact = await PropertyDeletionService.analyzeDeletionImpact(propertyId)

      // ASSERT
      expect(impact.linkedCollections).toBe(0)
      expect(impact.totalActivities).toBe(0)
      expect(impact.requiresSoftDelete).toBe(false)
      expect(impact.safeForHardDelete).toBe(true)
      expect(impact.estimatedDataLoss).toHaveLength(0)
    })
  })

  describe('cascadePropertyDeletion', () => {
    it('should remove property from link collections', async () => {
      // ARRANGE
      const propertyId = 'prop-cascade'
      
      mockQuery.then
        .mockResolvedValueOnce({ 
          data: [
            { 
              id: 'link-1', 
              property_ids: [propertyId, 'other-prop-1'] 
            }
          ], 
          error: null 
        }) // select affected links
        .mockResolvedValueOnce({ count: 0, error: null }) // activities update

      // ACT
      const result = await PropertyDeletionService.cascadePropertyDeletion(propertyId)

      // ASSERT
      expect(result.success).toBe(true)
      expect(result.linksUpdated).toBe(1)
      expect(result.integrityMaintained).toBe(true)
    })
  })
})