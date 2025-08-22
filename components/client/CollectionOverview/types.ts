/**
 * Shared type definitions for CollectionOverview components
 */

import { Property, BucketType } from '../types'

export interface Agent {
  id: string
  name: string
  phone: string
  email: string
  avatar?: string
  company?: string
  license?: string
}

export interface Collection {
  id: string
  title: string
  description: string
  agentId: string
  createdAt: string
  updatedAt: string
}

export interface SessionProgress {
  propertiesViewed: number
  totalProperties: number
  timeSpent: number
  startedAt: string
}

export interface CollectionStatistics {
  averagePrice: number
  priceRange: { min: number; max: number }
  averageArea: number
  bedroomRange: { min: number; max: number }
  bathroomRange: { min: number; max: number }
  propertyTypes: Record<string, number>
}

export interface CollectionOverviewProps {
  collection?: Collection
  agent: Agent
  properties: Property[]
  buckets: Record<BucketType, string[]>
  sessionProgress: SessionProgress
  onPropertySelect: (property: Property) => void
  onBucketChange: (bucket: BucketType, propertyId: string) => void
  onContactAgent: (agent: Agent) => void
  onHelpToggle: () => void
  loading?: boolean
  showHelp?: boolean
  error?: string
}

export interface CollectionHeaderProps {
  collection?: Collection
  agent: Agent
  statistics: CollectionStatistics
  sessionProgress: SessionProgress
  propertyCount: number
}

export interface CollectionStatsProps {
  statistics: CollectionStatistics
  isMobile: boolean
  expandedSummary: boolean
  onToggleExpanded: (expanded: boolean) => void
}

export interface PropertyCarouselProps {
  properties: Property[]
  isMobile: boolean
  isTablet: boolean
  onPropertySelect: (property: Property) => void
  loading?: boolean
}

export interface HelpOverlayProps {
  isOpen: boolean
  onClose: () => void
}

export interface ActionBarProps {
  buckets: Record<BucketType, string[]>
  sessionProgress: SessionProgress
  agent: Agent
  onContactAgent: (agent: Agent) => void
  onHelpToggle: () => void
  showHelp: boolean
}