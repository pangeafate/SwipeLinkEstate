// propertyService.Cascade.test.ts - TDD Tests for Cascade Deletion Operations
import { 
  setupTest, 
  createMockProperty, 
  createMockLink,
  createMockActivity,
  SupabaseMockFactory 
} from '@/test'
import { PropertyDeletionService } from '../propertyDeletionService'

const { getWrapper } = setupTest()

describe('PropertyDeletionService - Cascade Operations', () => {
  describe('cascadePropertyDeletion', () => {
    it('should remove property from link collections', async () => {
      // ARRANGE
      const property = createMockProperty({ id: 'prop-cascade-1' })
      const linkWithProperty = createMockLink({ 
        id: 'link-1',
        property_ids: [property.id, 'other-prop-1', 'other-prop-2'] 
      })
      
      const mockSupabase = SupabaseMockFactory.createComplexQueryMock({
        table: 'links',
        chains: ['.update()', '.contains("property_ids", [property.id])'],
        data: [linkWithProperty]
      })
      
      // ACT
      const result = await PropertyDeletionService.cascadePropertyDeletion(property.id)
      
      // ASSERT
      expect(result.linksUpdated).toBe(1)
      expect(result.propertiesRemoved).toBe(1)
      expect(mockSupabase.from).toHaveBeenCalledWith('links')
    })

    it('should archive related activities', async () => {
      // ARRANGE
      const property = createMockProperty({ id: 'prop-activities' })
      const activities = [
        createMockActivity({ property_id: property.id, action: 'view' }),
        createMockActivity({ property_id: property.id, action: 'like' })
      ]
      
      const mockSupabase = SupabaseMockFactory.createSuccessMock(activities)
      
      // ACT
      const result = await PropertyDeletionService.cascadePropertyDeletion(property.id)
      
      // ASSERT
      expect(result.activitiesArchived).toBe(2)
      expect(result.success).toBe(true)
    })

    it('should update engagement metrics', async () => {
      // ARRANGE
      const property = createMockProperty({ id: 'prop-metrics' })
      const links = [createMockLink({ property_ids: [property.id] })]
      
      const mockSupabase = SupabaseMockFactory.createComplexQueryMock({
        table: 'links',
        data: links
      })
      
      // ACT
      const result = await PropertyDeletionService.cascadePropertyDeletion(property.id)
      
      // ASSERT
      expect(result.metricsUpdated).toBe(true)
    })

    it('should handle partial cascade failures', async () => {
      // ARRANGE
      const property = createMockProperty({ id: 'prop-partial-fail' })
      
      // Mock partial failure - links update succeeds, activities fail
      const mockSupabase = SupabaseMockFactory.createPartialFailureMock({
        successOperations: ['links'],
        failureOperations: ['activities']
      })
      
      // ACT
      const result = await PropertyDeletionService.cascadePropertyDeletion(property.id)
      
      // ASSERT
      expect(result.success).toBe(false)
      expect(result.partialSuccess).toBe(true)
      expect(result.failures).toContain('activities')
    })

    it('should maintain referential integrity', async () => {
      // ARRANGE
      const property = createMockProperty({ id: 'prop-integrity' })
      const linkBefore = createMockLink({ 
        id: 'link-integrity',
        property_ids: [property.id, 'keep-1', 'keep-2'] 
      })
      
      const mockSupabase = SupabaseMockFactory.createTransactionMock([
        {
          operation: 'select',
          table: 'links',
          result: [linkBefore]
        },
        {
          operation: 'update',
          table: 'links',
          result: [{
            ...linkBefore,
            property_ids: ['keep-1', 'keep-2'] // Property removed
          }]
        }
      ])
      
      // ACT
      const result = await PropertyDeletionService.cascadePropertyDeletion(property.id)
      
      // ASSERT
      expect(result.success).toBe(true)
      expect(result.integrityMaintained).toBe(true)
    })
  })
})