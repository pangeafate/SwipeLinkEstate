'use client'

/**
 * @deprecated SwipeInterfaceV2 is deprecated and will be removed in a future version.
 * Please use PropertyCarousel from @/components/client instead.
 */

import React, { useCallback } from 'react'
import { useMotionValue } from 'framer-motion'
import BucketBar from './BucketBar'
import SwipeContainer from './SwipeContainer'
import ActionButtons from './ActionButtons'
import CompletionScreen from './CompletionScreen'
import useSwipeLogic from './hooks/useSwipeLogic'
import type { PropertyCardData, SwipeDirection, SwipeState } from '../types'

interface SwipeInterfaceV2Props {
  properties: PropertyCardData[]
  sessionId: string
  onSwipeComplete?: (finalState: SwipeState) => void
  onSwipe?: (direction: SwipeDirection, propertyId: string) => void
}

const SWIPE_THRESHOLD_DISTANCE = 0.28 // 28% of screen width
const SWIPE_THRESHOLD_VELOCITY = 1.8 // Normalized velocity units

export default function SwipeInterfaceV2({
  properties,
  sessionId,
  onSwipeComplete,
  onSwipe
}: SwipeInterfaceV2Props) {
  // Motion values for animation control
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  // Use custom hook for swipe logic
  const {
    currentIndex,
    isProcessing,
    error,
    bucketCounts,
    visibleCards,
    currentProperty,
    isComplete,
    decideSwipe,
    handleUndo,
    setError
  } = useSwipeLogic({
    properties,
    sessionId,
    onSwipeComplete,
    onSwipe
  })

  // Inject motion values into the hook
  const logicWithMotion = {
    ...useSwipeLogic({ properties, sessionId, onSwipeComplete, onSwipe }),
    x,
    y
  }

  // Handle drag end with distance + velocity thresholds
  const handleDragEnd = useCallback((info: any) => {
    const { offset, velocity } = info
    const screenWidth = window.innerWidth
    
    // Check both distance and velocity thresholds
    const distanceThreshold = screenWidth * SWIPE_THRESHOLD_DISTANCE
    const velocityThreshold = SWIPE_THRESHOLD_VELOCITY * 1000 // Convert to px/s
    
    const shouldCommitHorizontal = 
      Math.abs(offset.x) > distanceThreshold || 
      Math.abs(velocity.x) > velocityThreshold
    
    const shouldCommitVertical = 
      Math.abs(offset.y) > 120 && 
      Math.abs(offset.x) < 100 && 
      Math.abs(velocity.y) > velocityThreshold

    if (shouldCommitHorizontal) {
      const direction = offset.x > 0 ? 'right' : 'left'
      
      // Animate off-screen
      x.set(offset.x > 0 ? screenWidth : -screenWidth)
      
      // Trigger haptic feedback if available
      if ('vibrate' in navigator) {
        navigator.vibrate(50)
      }
      
      setTimeout(() => decideSwipe(direction, currentProperty?.id || ''), 150)
      
    } else if (shouldCommitVertical) {
      // Animate off-screen vertically
      y.set(offset.y > 0 ? window.innerHeight : -window.innerHeight)
      
      if ('vibrate' in navigator) {
        navigator.vibrate(50)
      }
      
      setTimeout(() => decideSwipe('down', currentProperty?.id || ''), 150)
      
    } else {
      // Snap back with spring
      x.set(0)
      y.set(0)
    }
  }, [decideSwipe, currentProperty, x, y])

  // Action buttons that mirror gestures
  const handleButtonAction = useCallback((direction: SwipeDirection) => {
    if (isProcessing || !currentProperty) return
    
    const screenWidth = window.innerWidth
    const targetX = direction === 'right' ? screenWidth : direction === 'left' ? -screenWidth : 0
    const targetY = direction === 'down' ? window.innerHeight : 0
    
    // Animate to target
    x.set(targetX)
    y.set(targetY)
    
    if ('vibrate' in navigator) {
      navigator.vibrate(50)
    }
    
    setTimeout(() => decideSwipe(direction, currentProperty?.id || ''), 150)
  }, [decideSwipe, currentProperty, isProcessing, x, y])

  if (properties.length === 0) {
    return (
      <CompletionScreen
        bucketCounts={bucketCounts}
        onRestart={() => window.location.reload()}
        isEmpty={true}
      />
    )
  }

  if (isComplete) {
    return (
      <CompletionScreen
        bucketCounts={bucketCounts}
        onRestart={() => window.location.reload()}
      />
    )
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50" data-testid="swipe-interface">
      <BucketBar
        bucketCounts={bucketCounts}
        currentIndex={currentIndex}
        totalProperties={properties.length}
        onUndo={handleUndo}
        canUndo={currentIndex > 0}
        isProcessing={isProcessing}
      />

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 text-sm text-center">
          {error}
        </div>
      )}

      <SwipeContainer
        visibleCards={visibleCards}
        currentIndex={currentIndex}
        isProcessing={isProcessing}
        onDragEnd={handleDragEnd}
      />

      <ActionButtons
        onAction={handleButtonAction}
        isProcessing={isProcessing}
      />
    </div>
  )
}