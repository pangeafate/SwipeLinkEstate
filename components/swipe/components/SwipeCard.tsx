'use client'

import React from 'react'
import TinderCard from 'react-tinder-card'
import PropertySwipeCard from './PropertySwipeCard'
import type { PropertyCardData, SwipeDirection } from '../types'

interface SwipeCardProps {
  currentProperty: PropertyCardData | null
  isProcessing: boolean
  onSwipe: (direction: SwipeDirection, propertyId: string) => void
  onCardLeftScreen: (propertyId: string) => void
}

export default function SwipeCard({
  currentProperty,
  isProcessing,
  onSwipe,
  onCardLeftScreen
}: SwipeCardProps) {
  if (!currentProperty) {
    return null
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="relative w-full max-w-sm h-96">
        <TinderCard
          key={currentProperty.id}
          onSwipe={(direction) => onSwipe(direction as SwipeDirection, currentProperty.id)}
          onCardLeftScreen={() => onCardLeftScreen(currentProperty.id)}
          preventSwipe={isProcessing ? ['left', 'right', 'up', 'down'] : []}
          swipeRequirementType="velocity"
          swipeThreshold={300}
          flickOnSwipe={true}
          className="absolute inset-0"
        >
          <div className="h-full">
            <PropertySwipeCard property={currentProperty} />
          </div>
        </TinderCard>

        {/* Loading overlay */}
        {isProcessing && (
          <div 
            className="absolute inset-0 bg-black bg-opacity-20 rounded-lg flex items-center justify-center"
            role="status"
            aria-label="Processing swipe"
          >
            <div className="bg-white rounded-full p-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}