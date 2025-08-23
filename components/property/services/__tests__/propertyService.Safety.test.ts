// propertyService.Safety.test.ts - TDD Tests for Safety Validation and Undo
import { 
  setupTest, 
  createMockProperty, 
  SupabaseMockFactory 
} from '@/test'
import { PropertyDeletionService } from '../propertyDeletionService'
import { UndoService } from '../undoService'
import { AuditService } from '../auditService'

const { getWrapper } = setupTest()

describe('PropertyDeletionService - Safety Features', () => {
  describe('safety validations', () => {
    it('should require confirmation for properties with data', async () => {
      // ARRANGE
      const property = createMockProperty({ id: 'prop-confirm' })
      
      // Mock property with activities (requires confirmation)
      const mockSupabase = SupabaseMockFactory.createComplexQueryMock({
        table: 'activities',
        data: [{ property_id: property.id }]
      })
      
      // ACT & ASSERT
      await expect(PropertyDeletionService.deleteProperty(property.id, { 
        requireConfirmation: false 
      }))
        .rejects
        .toThrow('Property deletion requires explicit confirmation')
    })

    it('should prevent concurrent deletion attempts', async () => {
      // ARRANGE
      const property = createMockProperty({ id: 'prop-concurrent' })
      const mockSupabase = SupabaseMockFactory.createSuccessMock([])
      
      // Start first deletion
      const firstDeletion = PropertyDeletionService.deleteProperty(property.id)
      
      // ACT & ASSERT - Second deletion should fail
      await expect(PropertyDeletionService.deleteProperty(property.id))
        .rejects
        .toThrow('Property deletion already in progress')
      
      // Cleanup
      await firstDeletion
    })

    it('should create audit trail for deletion actions', async () => {
      // ARRANGE
      const property = createMockProperty({ id: 'prop-audit' })
      const mockSupabase = SupabaseMockFactory.createSuccessMock([])
      
      // Spy on AuditService
      const auditSpy = jest.spyOn(AuditService, 'logPropertyDeletion')
      
      // ACT
      await PropertyDeletionService.deleteProperty(property.id, {
        agentId: 'agent-123',
        reason: 'Test deletion'
      })
      
      // ASSERT
      expect(auditSpy).toHaveBeenCalledWith(
        property.id,
        'agent-123',
        expect.objectContaining({
          reason: 'Test deletion'
        })
      )
    })

    it('should validate agent permissions before deletion', async () => {
      // ARRANGE
      const property = createMockProperty({ 
        id: 'prop-perms',
        agent_id: 'agent-owner' 
      })
      
      const mockSupabase = SupabaseMockFactory.createSuccessMock([property])
      
      // ACT & ASSERT
      await expect(PropertyDeletionService.deleteProperty(property.id, {
        agentId: 'agent-unauthorized'
      }))
        .rejects
        .toThrow('Unauthorized: Property belongs to another agent')
    })
  })

  describe('undo functionality', () => {
    it('should provide undo capability within time window', async () => {
      // ARRANGE
      const property = createMockProperty({ id: 'prop-undo' })
      const mockSupabase = SupabaseMockFactory.createSuccessMock([])
      
      // Spy on UndoService
      const undoSpy = jest.spyOn(UndoService, 'createUndoSnapshot')
      
      // ACT
      const result = await PropertyDeletionService.deleteProperty(property.id, {
        createUndoSnapshot: true
      })
      
      // ASSERT
      expect(result.canUndo).toBe(true)
      expect(result.undoSnapshotId).toBeDefined()
      expect(undoSpy).toHaveBeenCalledWith(property.id)
    })

    it('should restore property from undo snapshot', async () => {
      // ARRANGE
      const property = createMockProperty({ id: 'prop-restore' })
      const snapshotId = 'snapshot-123'
      
      const mockSupabase = SupabaseMockFactory.createSuccessMock([property])
      
      // ACT
      const result = await UndoService.undoPropertyDeletion(snapshotId)
      
      // ASSERT
      expect(result.success).toBe(true)
      expect(result.restoredProperty).toEqual(property)
    })

    it('should expire undo snapshots after time limit', async () => {
      // ARRANGE
      const expiredSnapshotId = 'expired-snapshot'
      
      // Mock expired snapshot
      const mockSupabase = SupabaseMockFactory.createSuccessMock([{
        id: expiredSnapshotId,
        expiresAt: new Date(Date.now() - 1000) // Expired 1 second ago
      }])
      
      // ACT & ASSERT
      await expect(UndoService.undoPropertyDeletion(expiredSnapshotId))
        .rejects
        .toThrow('Undo snapshot has expired')
    })

    it('should handle undo failures gracefully', async () => {
      // ARRANGE
      const snapshotId = 'invalid-snapshot'
      const mockSupabase = SupabaseMockFactory.createErrorMock('Snapshot not found')
      
      // ACT & ASSERT
      await expect(UndoService.undoPropertyDeletion(snapshotId))
        .rejects
        .toThrow('Snapshot not found')
    })
  })

  describe('deletion impact warnings', () => {
    it('should highlight data loss warnings', async () => {
      // ARRANGE
      const property = createMockProperty({ id: 'prop-warnings' })
      
      const mockSupabase = SupabaseMockFactory.createComplexQueryMock({
        table: 'activities',
        data: [
          { property_id: property.id, action: 'view' },
          { property_id: property.id, action: 'like' }
        ]
      })
      
      // ACT
      const impact = await PropertyDeletionService.analyzeDeletionImpact(property.id)
      
      // ASSERT
      expect(impact.estimatedDataLoss).toContain('2 client activities will be archived')
      expect(impact.estimatedDataLoss).toContain('engagement history will be lost')
    })

    it('should identify safe deletions', async () => {
      // ARRANGE
      const property = createMockProperty({ id: 'prop-safe-delete' })
      const mockSupabase = SupabaseMockFactory.createSuccessMock([]) // No related data
      
      // ACT
      const impact = await PropertyDeletionService.analyzeDeletionImpact(property.id)
      
      // ASSERT
      expect(impact.estimatedDataLoss).toHaveLength(0)
      expect(impact.requiresSoftDelete).toBe(false)
      expect(impact.safeForHardDelete).toBe(true)
    })
  })
})