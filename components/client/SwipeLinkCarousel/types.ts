// SwipeLink Carousel Type Definitions

export interface Property {
  id: string
  title: string
  address: string
  price: number
  priceFormatted: string
  bedrooms: number
  bathrooms: number
  sqft: number
  images: string[]
  description: string
  features: string[]
  yearBuilt?: number
  propertyType: 'house' | 'condo' | 'apartment' | 'townhouse'
  listingDate: string
  mls?: string
  agent?: {
    name: string
    phone: string
    email: string
  }
}

export type BucketType = 'new' | 'liked' | 'disliked' | 'scheduled'

export type ActionType = 'like' | 'dislike' | 'consider' | 'schedule'

export interface BucketData {
  type: BucketType
  label: string
  icon: string
  count: number
  properties: string[] // Property IDs
}

export interface PropertyAction {
  type: ActionType
  label: string
  icon: string
  handler: (propertyId: string) => void
}

export interface ScheduleVisitData {
  propertyId: string
  date: string
  time: string
  name: string
  email: string
  phone: string
  message?: string
}

export interface CarouselState {
  properties: Property[]
  currentIndex: number
  selectedProperty: Property | null
  isModalOpen: boolean
  buckets: Record<BucketType, BucketData>
  activeBucket: BucketType
}

export interface SwipeLinkSession {
  linkCode: string
  startTime: string
  buckets: Record<BucketType, string[]>
  interactions: InteractionEvent[]
  scheduleRequests: ScheduleVisitData[]
}

export interface InteractionEvent {
  propertyId: string
  action: ActionType
  timestamp: string
  bucket?: BucketType
}