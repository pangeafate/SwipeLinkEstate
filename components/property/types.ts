// Property Module Types
export interface Property {
  id: string
  address: string
  description?: string
  price?: number
  bedrooms?: number
  bathrooms?: number
  area_sqft?: number
  property_type?: string
  status: PropertyStatus
  images?: string[]
  features?: string[]
  created_at?: string
  updated_at?: string
}

export enum PropertyStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SOLD = 'sold',
  PENDING = 'pending'
}

export interface PropertyFormData {
  address: string
  description?: string
  price?: number
  bedrooms?: number
  bathrooms?: number
  area_sqft?: number
  property_type?: string
  features?: string[]
}

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