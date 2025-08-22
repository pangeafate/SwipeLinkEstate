'use client'

/**
 * @deprecated SwipeInterfaceV3 is deprecated and will be removed in a future version.
 * Please use PropertyCarousel from @/components/client instead.
 */

import React from 'react'
import SwipeHeader from './SwipeHeader'
import SwipeCard from './SwipeCard'
import SwipeHints from './SwipeHints'
import SwipeCompleted from './SwipeCompleted'
import SwipeEmptyState from './SwipeEmptyState'
import useSwipeLogic from './hooks/useSwipeLogic'
import type { PropertyCardData, SwipeDirection, SwipeState } from '../types'

interface SwipeInterfaceV3Props {
  properties: PropertyCardData[]
  sessionId: string
  onSwipeComplete?: (finalState: SwipeState) => void
  onSwipe?: (direction: SwipeDirection, propertyId: string) => void
}

export default function SwipeInterfaceV3({
  properties,
  sessionId,
  onSwipeComplete,
  onSwipe
}: SwipeInterfaceV3Props) {
  const {
    currentIndex,
    isProcessing,
    error,
    bucketCounts,
    currentProperty,
    isComplete,
    decideSwipe,
    handleUndo
  } = useSwipeLogic({
    properties,
    sessionId,
    onSwipeComplete,
    onSwipe
  })

  const handleCardLeftScreen = (propertyId: string) => {
    console.log(`Card ${propertyId} left screen`)
  }

  const handleStartOver = () => {
    window.location.reload()
  }

  // Empty state
  if (properties.length === 0) {
    return <SwipeEmptyState />
  }

  // Completion state
  if (isComplete) {
    return (
      <SwipeCompleted
        bucketCounts={bucketCounts}
        onStartOver={handleStartOver}
      />
    )
  }

  // Main swipe interface
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <SwipeHeader
        currentIndex={currentIndex}
        totalProperties={properties.length}
        bucketCounts={bucketCounts}
        canUndo={currentIndex > 0}
        isProcessing={isProcessing}
        onUndo={handleUndo}
      />

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 text-sm text-center" role="alert">
          {error}
        </div>
      )}

      <SwipeCard
        currentProperty={currentProperty}
        isProcessing={isProcessing}
        onSwipe={decideSwipe}
        onCardLeftScreen={handleCardLeftScreen}
      />

      <SwipeHints />
    </div>
  )
}