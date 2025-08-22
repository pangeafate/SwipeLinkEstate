import { useCallback, useState } from 'react'

interface SwipeGestureHandlerProps {
  isTransitioning: boolean
  onNavigate: (newIndex: number) => void
  currentIndex: number
  propertiesLength: number
}

interface SwipeState {
  touchStartX: number | null
  touchStartTime: number | null
  dragOffset: number
  isDragging: boolean
  swipeDirection: 'left' | 'right' | null
  swipeProgress: number
}

export const useSwipeGestureHandler = ({
  isTransitioning,
  onNavigate,
  currentIndex,
  propertiesLength
}: SwipeGestureHandlerProps) => {
  const [swipeState, setSwipeState] = useState<SwipeState>({
    touchStartX: null,
    touchStartTime: null,
    dragOffset: 0,
    isDragging: false,
    swipeDirection: null,
    swipeProgress: 0
  })

  // Smooth navigation with spring animations (0.8 damping as per design)
  const smoothNavigate = useCallback((newIndex: number) => {
    if (isTransitioning) return // Prevent rapid navigation during animation
    
    onNavigate(newIndex)
  }, [isTransitioning, onNavigate])

  // Enhanced swipe physics with velocity and distance thresholds
  const handleMomentumScroll = useCallback((velocity: number, distance: number) => {
    const screenWidth = window.innerWidth
    const VELOCITY_THRESHOLD = 300 // px/s as per design guidelines
    const DISTANCE_THRESHOLD = screenWidth * 0.35 // 30-40% of screen width
    
    const shouldNavigate = Math.abs(velocity) > VELOCITY_THRESHOLD || Math.abs(distance) > DISTANCE_THRESHOLD
    
    if (shouldNavigate) {
      const direction = distance > 0 ? -1 : 1
      const newIndex = currentIndex + direction
      
      if (newIndex >= 0 && newIndex < propertiesLength) {
        smoothNavigate(newIndex)
      }
    }
    
    // Reset swipe state
    setSwipeState({
      touchStartX: null,
      touchStartTime: null,
      dragOffset: 0,
      isDragging: false,
      swipeDirection: null,
      swipeProgress: 0
    })
  }, [currentIndex, propertiesLength, smoothNavigate])

  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    if (isTransitioning) return
    
    setSwipeState(prev => ({
      ...prev,
      touchStartX: event.touches[0].clientX,
      touchStartTime: Date.now(),
      isDragging: true
    }))
  }, [isTransitioning])

  const handleTouchMove = useCallback((event: React.TouchEvent) => {
    if (swipeState.touchStartX === null || !swipeState.isDragging) return

    const currentX = event.touches[0].clientX
    const diff = swipeState.touchStartX - currentX
    const screenWidth = window.innerWidth
    
    // Calculate swipe progress and direction
    const progress = Math.abs(diff) / screenWidth
    const direction = diff > 0 ? 'left' : 'right'
    
    // Limit drag offset to prevent over-scrolling (smooth resistance)
    const maxOffset = screenWidth * 0.5
    const limitedOffset = Math.max(-maxOffset, Math.min(maxOffset, diff))
    
    setSwipeState(prev => ({
      ...prev,
      dragOffset: limitedOffset,
      swipeDirection: direction,
      swipeProgress: Math.min(progress, 1)
    }))
  }, [swipeState.touchStartX, swipeState.isDragging])

  const handleTouchEnd = useCallback((event: React.TouchEvent) => {
    if (swipeState.touchStartX === null || swipeState.touchStartTime === null) {
      setSwipeState(prev => ({ ...prev, isDragging: false }))
      return
    }

    const touchEndX = event.changedTouches[0].clientX
    const distance = swipeState.touchStartX - touchEndX
    const duration = Date.now() - swipeState.touchStartTime
    const velocity = Math.abs(distance) / duration * 1000 // px/s

    // Use momentum scrolling with velocity and distance
    handleMomentumScroll(velocity, distance)
  }, [swipeState.touchStartX, swipeState.touchStartTime, handleMomentumScroll])

  return {
    swipeState,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    smoothNavigate
  }
}