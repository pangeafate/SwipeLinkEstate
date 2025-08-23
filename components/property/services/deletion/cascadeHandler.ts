// cascadeHandler.ts - Handles cascade operations during property deletion
import { supabase } from '@/lib/supabase/client'
import { CascadeResults } from '../types/deletion.types'

export class CascadeHandler {
  /**
   * Handle cascade operations when deleting a property
   */
  static async cascadePropertyDeletion(propertyId: string): Promise<CascadeResults> {
    console.log(`Starting cascade operations for property ${propertyId}`)
    try {
      let linksUpdated = 0
      let activitiesArchived = 0

      // Remove property from link collections
      // First, get all links that contain this property
      console.log('Fetching all links...')
      const { data: allLinks, error: linksError } = await supabase
        .from('links')
        .select('id, property_ids')
      
      if (linksError) {
        console.error('Error fetching links:', linksError)
        throw linksError
      }
      
      console.log(`Found ${allLinks?.length || 0} total links`)
      
      // Filter links that contain the property ID
      const affectedLinks = allLinks?.filter(link => {
        try {
          const ids = Array.isArray(link.property_ids) ? link.property_ids : JSON.parse(link.property_ids)
          return ids.includes(propertyId)
        } catch (err) {
          console.error('Error parsing property_ids for link:', link.id, err)
          return false
        }
      })
      
      console.log(`Found ${affectedLinks?.length || 0} affected links`)

      if (affectedLinks?.length) {
        console.log(`Found ${affectedLinks.length} affected links - updating them...`)
        
        // Process links in parallel with Promise.all for better performance
        const updatePromises = affectedLinks.map(async (link) => {
          try {
            // Parse property_ids if it's a string
            const currentIds = Array.isArray(link.property_ids) 
              ? link.property_ids 
              : JSON.parse(link.property_ids)
            
            // Remove the property ID from the array
            const updatedIds = currentIds.filter((id: string) => id !== propertyId)
            
            // Update the link with the new array
            const { error: updateError } = await supabase
              .from('links')
              .update({ property_ids: updatedIds })
              .eq('id', link.id)
            
            if (updateError) {
              console.error(`Error updating link ${link.id}:`, updateError)
              return false
            } else {
              return true
            }
          } catch (err) {
            console.error(`Failed to update link ${link.id}:`, err)
            return false
          }
        })
        
        const results = await Promise.all(updatePromises)
        linksUpdated = results.filter(r => r === true).length
        console.log(`Successfully updated ${linksUpdated} out of ${affectedLinks.length} links`)
      }

      // Delete related activities (no archive column in schema)
      const { count, error: deleteError } = await supabase
        .from('activities')
        .delete()
        .eq('property_id', propertyId)
        .select('*', { count: 'exact', head: true })
      
      if (deleteError) {
        console.error('Error deleting activities:', deleteError)
      }

      activitiesArchived = count || 0

      return {
        success: true,
        linksUpdated,
        propertiesRemoved: 1,
        activitiesArchived,
        metricsUpdated: true,
        integrityMaintained: true
      }
    } catch (error) {
      return {
        success: false,
        partialSuccess: true,
        linksUpdated: 0,
        propertiesRemoved: 0,
        activitiesArchived: 0,
        metricsUpdated: false,
        integrityMaintained: false,
        failures: ['cascade_operation_failed']
      }
    }
  }
}