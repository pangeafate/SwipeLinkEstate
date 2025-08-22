/**
 * Shared type definitions for BucketManager components
 */

import { Property, BucketType } from '../types'

export interface BucketManagerProps {
  properties: Property[]
  buckets: Record<BucketType | 'all', string[]>
  bookedVisits: Array<{ propertyId: string; date: string; time: string }>
  activeBucket?: BucketType | 'all'
  onBucketChange: (bucket: BucketType | 'all', propertyId?: string) => void
  onPropertySelect: (property: Property) => void
  onBookVisit: (property: Property) => void
  onClearBucket: (bucket: BucketType) => void
  loading?: boolean
}

export interface BucketStats {
  averagePrice: number
  propertyTypes: Record<string, number>
  locations: string[]
  commonFeatures: Record<string, number>
}

export interface BucketNavProps {
  activeBucket: BucketType | 'all'
  buckets: Record<BucketType | 'all', string[]>
  propertyCount: number
  loading?: boolean
  dragging: string | null
  onBucketClick: (bucket: BucketType | 'all') => void
  onDropOnBucket: (bucket: BucketType, propertyId: string) => void
}

export interface BucketStatsDisplayProps {
  bucketStats: BucketStats
  isVisible: boolean
}

export interface PropertyGridProps {
  properties: Property[]
  buckets: Record<BucketType | 'all', string[]>
  bookedVisits: Array<{ propertyId: string; date: string; time: string }>
  activeBucket: BucketType | 'all'
  sortBy: 'price' | 'date' | 'location'
  sortOrder: 'asc' | 'desc'
  dragging: string | null
  onPropertyClick: (property: Property) => void
  onBookVisit: (property: Property) => void
  onDragStart: (propertyId: string) => void
  onDragEnd: () => void
}

export interface BucketControlsProps {
  sortBy: 'price' | 'date' | 'location'
  sortOrder: 'asc' | 'desc'
  onSortChange: (value: string) => void
}

export interface BucketActionsProps {
  hasProperties: boolean
  activeBucket: BucketType | 'all'
  onDownload: () => void
  onShare: () => void
  onClear: () => void
}