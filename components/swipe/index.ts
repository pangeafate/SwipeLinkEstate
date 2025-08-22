// Public exports for swipe module

// Services
export { SwipeService } from './swipe.service'

// Components
export { default as SwipeInterface } from './components/SwipeInterface'
export { default as SwipeInterfaceV2 } from './components/SwipeInterfaceV2'
export { default as PropertySwipeCard } from './components/PropertySwipeCard'

// Types
export type {
  SwipeDirection,
  SwipeSession,
  SwipeAction,
  SwipeState,
  SwipeResult,
  PropertyCardData,
  SwipeGestureConfig,
  BucketCounts
} from './types'