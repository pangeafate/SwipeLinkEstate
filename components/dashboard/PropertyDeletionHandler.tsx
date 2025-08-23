// PropertyDeletionHandler.tsx - Handles property deletion logic for dashboard
import { PropertyDeletionService } from '@/components/property/services/propertyDeletionService'

interface PropertyDeletionHandlerProps {
  onDeletionComplete: () => void
  onSelectionUpdate: (propertyId: string) => void
  selectedProperties: Set<string>
}

export class PropertyDeletionHandler {
  private props: PropertyDeletionHandlerProps

  constructor(props: PropertyDeletionHandlerProps) {
    this.props = props
  }

  async handleDeleteProperty(propertyId: string): Promise<void> {
    console.log(`handleDeleteProperty called with propertyId: ${propertyId}`)
    try {
      // Analyze the deletion impact first
      const impact = await PropertyDeletionService.analyzeDeletionImpact(propertyId)
      console.log('Deletion impact:', impact)
      
      // Show confirmation if there are impacts
      if (impact.requiresSoftDelete) {
        const warnings = impact.estimatedDataLoss.join('\n')
        const confirmed = window.confirm(
          `Deleting this property will:\n${warnings}\n\nAre you sure you want to continue?`
        )
        if (!confirmed) {
          console.log('User cancelled deletion')
          return
        }
      } else {
        const confirmed = window.confirm('Are you sure you want to delete this property?')
        if (!confirmed) {
          console.log('User cancelled deletion')
          return
        }
      }
      
      console.log('User confirmed deletion, proceeding...')
      // Perform the deletion (force delete if there are active links but user confirmed)
      const options = impact.activeLinks.length > 0 ? { forceDelete: true } : {}
      console.log('Delete options:', options)
      const result = await PropertyDeletionService.deleteProperty(propertyId, options)
      console.log('Delete result:', result)
      
      if (result.success) {
        // Refresh the properties list
        this.props.onDeletionComplete()
        
        // Remove from selection if selected
        if (this.props.selectedProperties.has(propertyId)) {
          this.props.onSelectionUpdate(propertyId)
        }
      }
    } catch (error) {
      console.error('Failed to delete property:', error)
      alert('Failed to delete property. Please try again.')
    }
  }
}

// Export as a hook for easier use in components
export function usePropertyDeletion(
  onDeletionComplete: () => void,
  onSelectionUpdate: (propertyId: string) => void,
  selectedProperties: Set<string>
) {
  const handler = new PropertyDeletionHandler({
    onDeletionComplete,
    onSelectionUpdate,
    selectedProperties
  })
  
  return {
    handleDeleteProperty: handler.handleDeleteProperty.bind(handler)
  }
}