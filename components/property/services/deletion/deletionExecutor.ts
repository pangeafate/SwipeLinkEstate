// deletionExecutor.ts - Executes the actual deletion operations
import { supabase } from '@/lib/supabase/client'

export class DeletionExecutor {
  /**
   * Perform soft delete by updating property status
   */
  static async softDeleteProperty(propertyId: string): Promise<void> {
    const { error } = await supabase
      .from('properties')
      .update({ status: 'deleted' })
      .eq('id', propertyId)
    
    if (error) {
      console.error('Soft delete error:', error)
      throw new Error(`Failed to soft delete property: ${error.message}`)
    }
  }

  /**
   * Perform hard delete by removing property from database
   */
  static async hardDeleteProperty(propertyId: string): Promise<void> {
    console.log(`Attempting to hard delete property: ${propertyId}`)
    
    const { data, error } = await supabase
      .from('properties')
      .delete()
      .eq('id', propertyId)
      .select() // Return deleted data to confirm
    
    if (error) {
      console.error('Hard delete error:', error)
      throw new Error(`Failed to hard delete property: ${error.message}`)
    }
    
    console.log('Delete successful, deleted data:', data)
  }

  /**
   * Validate that the agent owns the property
   */
  static async validateOwnership(propertyId: string, agentId: string): Promise<void> {
    const { data: property } = await supabase
      .from('properties')
      .select('agent_id')
      .eq('id', propertyId)
      .single()

    if (property?.agent_id && property.agent_id !== agentId) {
      throw new Error('Unauthorized: Property belongs to another agent')
    }
  }

  /**
   * Create a snapshot for undo functionality (placeholder)
   */
  static async createUndoSnapshot(propertyId: string): Promise<string> {
    // Minimal implementation - just return a mock snapshot ID
    return `snapshot-${propertyId}-${Date.now()}`
  }
}