/**
 * Shared types for PropertyForm components
 */

export interface FormData {
  address: string
  price: string
  bedrooms: string
  bathrooms: string
  area_sqft: string
  description: string
  features: string[]
  status: string
}

export interface FieldErrors {
  address?: string
  price?: string
  bedrooms?: string
  bathrooms?: string
  area_sqft?: string
}

export interface PropertyFormProps {
  onPropertyCreated: (property: any) => void
  onCancel: () => void
}