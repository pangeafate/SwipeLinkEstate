// deletionAnalyzer.ts - Analyzes the impact of property deletion
import { supabase } from '@/lib/supabase/client'
import { DeletionImpact } from '../types/deletion.types'

export class DeletionAnalyzer {
  /**
   * Analyze the impact of deleting a property
   */
  static async analyzeDeletionImpact(propertyId: string): Promise<DeletionImpact> {
    // Query all links and filter client-side due to JSONB array complexity
    const { data: allLinks, error: linksError } = await supabase
      .from('links')
      .select('id, expires_at, property_ids')
    
    if (linksError) {
      console.error('Error querying links:', linksError)
    }
    
    // Filter links that contain this property
    const links = allLinks?.filter(link => {
      try {
        const ids = Array.isArray(link.property_ids) ? link.property_ids : JSON.parse(link.property_ids)
        return ids.includes(propertyId)
      } catch {
        return false
      }
    }) || []

    // Query for activities
    const { data: activities, error: activitiesError } = await supabase
      .from('activities')
      .select('id')
      .eq('property_id', propertyId)
    
    if (activitiesError) {
      console.error('Error querying activities:', activitiesError)
      // Continue with empty array if activities query fails
    }

    const linkedCollections = links?.length || 0
    const totalActivities = activities?.length || 0
    // Links are active if they don't have an expires_at or if expires_at is in the future
    const now = new Date()
    const activeLinks = links?.filter(l => !l.expires_at || new Date(l.expires_at) > now).map(l => l.id) || []

    const requiresSoftDelete = linkedCollections > 0 || totalActivities > 0
    const estimatedDataLoss = this.calculateDataLoss(linkedCollections, totalActivities)

    return {
      propertyId,
      linkedCollections,
      activeLinks,
      totalActivities,
      requiresSoftDelete,
      safeForHardDelete: !requiresSoftDelete,
      estimatedDataLoss,
      canUndo: true,
      undoTimeLimit: 30, // 30 minutes
      integrityWarnings: []
    }
  }

  private static calculateDataLoss(linkedCollections: number, totalActivities: number): string[] {
    const warnings: string[] = []

    if (totalActivities > 0) {
      warnings.push(`${totalActivities} client activities will be permanently deleted`)
      warnings.push('All engagement history will be lost')
    }

    if (linkedCollections > 0) {
      warnings.push(`Property will be removed from ${linkedCollections} collection${linkedCollections > 1 ? 's' : ''}`)
    }

    return warnings
  }
}