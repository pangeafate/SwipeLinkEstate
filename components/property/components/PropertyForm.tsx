/**
 * Property form - Refactored to use split components
 * This maintains backward compatibility while using smaller, focused components
 */
import React from 'react'
import type { Property } from '@/lib/supabase/types'
import { PropertyFormContainer } from './PropertyFormContainer'

interface PropertyFormProps {
  onPropertyCreated: (property: Property) => void
  onCancel: () => void
}

export default function PropertyForm({ onPropertyCreated, onCancel }: PropertyFormProps) {
  return <PropertyFormContainer onPropertyCreated={onPropertyCreated} onCancel={onCancel} />
}