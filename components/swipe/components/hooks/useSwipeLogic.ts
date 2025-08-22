import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { SwipeService } from '../../swipe.service'
import type { PropertyCardData, SwipeDirection, SwipeState, BucketCounts } from '../../types'

interface UseSwipeLogicProps {
  properties: PropertyCardData[]
  sessionId: string
  onSwipeComplete?: (finalState: SwipeState) => void
  onSwipe?: (direction: SwipeDirection, propertyId: string) => void
}

interface UseSwipeLogicReturn {
  currentIndex: number
  isProcessing: boolean
  error: string | null
  swipeState: SwipeState
  bucketCounts: BucketCounts
  visibleCards: PropertyCardData[]
  currentProperty: PropertyCardData | undefined
  isComplete: boolean
  decideSwipe: (direction: SwipeDirection, propertyId: string) => Promise<void>
  handleUndo: () => Promise<void>
  setCurrentIndex: (index: number) => void
  setError: (error: string | null) => void
  x: any
  y: any
}

export default function useSwipeLogic({
  properties,
  sessionId,
  onSwipeComplete,
  onSwipe
}: UseSwipeLogicProps): UseSwipeLogicReturn {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [swipeState, setSwipeState] = useState<SwipeState>({
    liked: [],
    disliked: [],
    considering: [],
    viewed: []
  })
  const trackedViews = useRef<Set<string>>(new Set())

  // Motion values would be passed from the component using this hook
  const x: any = null
  const y: any = null

  const isComplete = currentIndex >= properties.length
  const visibleCards = properties.slice(currentIndex, currentIndex + 3)
  const currentProperty = visibleCards[0]
  const remainingCount = properties.length - currentIndex

  // Calculate bucket counts
  const bucketCounts = useMemo((): BucketCounts => ({
    liked: swipeState.liked.length,
    disliked: swipeState.disliked.length,
    considering: swipeState.considering.length,
    remaining: Math.max(0, remainingCount)
  }), [swipeState, remainingCount])

  // Load initial swipe state
  useEffect(() => {
    const loadSwipeState = async () => {
      try {
        const state = await SwipeService.getSwipeState(sessionId)
        setSwipeState(state)
        const viewedCount = state.viewed.length
        setCurrentIndex(Math.min(viewedCount, properties.length))
        
        // Mark already viewed properties as tracked
        state.viewed.forEach(propertyId => {
          trackedViews.current.add(propertyId)
        })
      } catch (error) {
        console.error('Failed to load swipe state:', error)
      }
    }

    if (sessionId) {
      loadSwipeState()
    }
  }, [sessionId, properties.length])

  // Track property views when current property changes
  useEffect(() => {
    if (!currentProperty || !sessionId) return
    
    const propertyId = currentProperty.id
    
    // Only track if we haven't tracked this property view yet
    if (!trackedViews.current.has(propertyId)) {
      trackedViews.current.add(propertyId)
      SwipeService.trackPropertyView(propertyId, sessionId)
    }
  }, [currentProperty, sessionId])

  // Centralized swipe decision logic
  const decideSwipe = useCallback(async (direction: SwipeDirection, propertyId: string) => {
    if (isProcessing) return

    // Optimistic UI update
    setCurrentIndex(prev => prev + 1)
    onSwipe?.(direction, propertyId)
    
    setIsProcessing(true)
    setError(null)

    try {
      const result = await SwipeService.handleSwipe(direction, propertyId, sessionId)
      
      if (result.success) {
        setSwipeState(result.newState)
        
        // Reset motion values for next card (if available)
        if (x && y) {
          x.set(0)
          y.set(0)
        }
        
        if (currentIndex + 1 >= properties.length) {
          onSwipeComplete?.(result.newState)
        }
      } else {
        // Revert UI change
        setCurrentIndex(prev => Math.max(0, prev - 1))
        setError('This property has already been reviewed')
      }
    } catch (error) {
      console.error('Swipe failed:', error)
      setCurrentIndex(prev => Math.max(0, prev - 1))
      setError('Something went wrong. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }, [isProcessing, currentIndex, properties.length, sessionId, onSwipe, onSwipeComplete, x, y])

  const handleUndo = useCallback(async () => {
    if (isProcessing || currentIndex === 0) return

    const previousProperty = properties[currentIndex - 1]
    if (!previousProperty) return

    setIsProcessing(true)
    setError(null)

    try {
      await SwipeService.resetProperty(previousProperty.id, sessionId)
      const newState = await SwipeService.getSwipeState(sessionId)
      setSwipeState(newState)
      setCurrentIndex(prev => Math.max(0, prev - 1))
      
      // Reset motion values (if available)
      if (x && y) {
        x.set(0)
        y.set(0)
      }
    } catch (error) {
      console.error('Undo failed:', error)
      setError('Failed to undo. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }, [isProcessing, currentIndex, properties, sessionId, x, y])

  return {
    currentIndex,
    isProcessing,
    error,
    swipeState,
    bucketCounts,
    visibleCards,
    currentProperty,
    isComplete,
    decideSwipe,
    handleUndo,
    setCurrentIndex,
    setError,
    x,
    y
  }
}