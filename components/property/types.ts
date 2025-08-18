// Property Module Types - Re-export from centralized types
import type { 
  Property as BaseProperty, 
  PropertyInsert,
  PropertyUpdate,
  PropertyStatus as BasePropertyStatus
} from '@/lib/supabase/types'

export type Property = BaseProperty
export type PropertyFormData = PropertyInsert
export type PropertyStatus = BasePropertyStatus

export { type PropertyUpdate } from '@/lib/supabase/types'

// Component-specific props interfaces
export interface PropertyCardProps {
  property: Property
  onClick?: (property: Property) => void
  showActions?: boolean
}

export interface PropertyGridProps {
  properties: Property[]
  onPropertyClick?: (property: Property) => void
  loading?: boolean
}