export type SwipeDirection = 'left' | 'right' | 'up' | 'down'

export interface SwipeSession {
  id: string
  linkId: string
  startedAt: Date
  deviceInfo?: {
    userAgent: string
    screen: {
      width: number
      height: number
    }
  }
}

export interface SwipeAction {
  direction: SwipeDirection
  propertyId: string
  sessionId: string
  timestamp: Date
}

export interface SwipeState {
  liked: string[]      // Property IDs
  disliked: string[]   // Property IDs
  considering: string[] // Property IDs
  viewed: string[]     // All viewed property IDs
}

export interface SwipeResult {
  success: boolean
  newState: SwipeState
  nextPropertyId?: string
}

export interface PropertyCardData {
  id: string
  address: string
  price: number
  bedrooms: number
  bathrooms: number
  area_sqft?: number
  cover_image?: string
  images?: string[]
  features?: string[]
  property_type: string
}

export interface SwipeGestureConfig {
  velocityThreshold: number
  distanceThreshold: number
  rotationFactor: number
  animationDuration: number
}

export interface BucketCounts {
  liked: number
  disliked: number
  considering: number
  remaining: number
}