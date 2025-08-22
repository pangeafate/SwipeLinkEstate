// Client module exports following GL-README-DRIVEN-DEVELOMENT guidelines

// Main components
export { default as PropertyCarousel } from './PropertyCarousel'
export { default as PropertyModal } from './PropertyModal'
export { default as CollectionOverview } from './CollectionOverview'
export { default as BucketManager } from './BucketManager'  
export { default as VisitBooking } from './VisitBooking'

// New integrated components
export { default as BucketNavigation } from './BucketNavigation'
export { default as SwipeLinkClient } from './SwipeLinkClient'

// Airbnb-style components
export { default as AirbnbCarousel } from './AirbnbCarousel'
export { default as AirbnbPropertyCard } from './AirbnbPropertyCard'

// Type definitions
export * from './types'

// Re-export shared utilities if needed
export type { 
  Property,
  BucketType,
  BucketData,
  BookingDetails,
  ClientSession,
  InteractionEvent,
  SessionAnalytics
} from './types'