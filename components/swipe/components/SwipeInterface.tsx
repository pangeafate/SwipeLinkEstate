'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'

/**
 * @deprecated SwipeInterface is deprecated and will be removed in a future version.
 * Please use PropertyCarousel from @/components/client instead.
 * 
 * Migration guide:
 * - Replace SwipeInterface with PropertyCarousel
 * - Update prop names: properties -> properties, sessionId -> not needed
 * - Use onBucketAssign instead of onSwipe for user interactions
 * - See PropertyCarousel documentation for complete API
 */
import TinderCard from 'react-tinder-card'
import { motion } from 'framer-motion'
import PropertySwipeCard from './PropertySwipeCard'
import { SwipeService } from '../swipe.service'
import type { PropertyCardData, SwipeDirection, SwipeState, BucketCounts } from '../types'

interface SwipeInterfaceProps {
  properties: PropertyCardData[]
  sessionId: string
  onSwipeComplete?: (finalState: SwipeState) => void
  onSwipe?: (direction: SwipeDirection, propertyId: string) => void
}

export default function SwipeInterface({
  properties,
  sessionId,
  onSwipeComplete,
  onSwipe
}: SwipeInterfaceProps) {
  // Deprecation warning
  useEffect(() => {
    console.warn(
      '🚨 DEPRECATION WARNING: SwipeInterface is deprecated and will be removed in a future version. ' +
      'Please migrate to PropertyCarousel from @/components/client for better performance and features.'
    )
  }, [])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [swipeState, setSwipeState] = useState<SwipeState>({
    liked: [],
    disliked: [],
    considering: [],
    viewed: []
  })

  const isComplete = currentIndex >= properties.length
  const currentProperty = properties[currentIndex]
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
        
        // Find the current index based on viewed properties
        const viewedCount = state.viewed.length
        setCurrentIndex(Math.min(viewedCount, properties.length))
      } catch (error) {
        console.error('Failed to load swipe state:', error)
      }
    }

    if (sessionId) {
      loadSwipeState()
    }
  }, [sessionId, properties.length])

  const handleSwipe = useCallback(async (direction: SwipeDirection, propertyId: string) => {
    if (isProcessing) return

    // Immediately update UI for better responsiveness
    setCurrentIndex(prev => prev + 1)
    onSwipe?.(direction, propertyId)
    
    setIsProcessing(true)
    setError(null)

    try {
      const result = await SwipeService.handleSwipe(direction, propertyId, sessionId)
      
      if (result.success) {
        setSwipeState(result.newState)
        
        // Check if completed
        if (currentIndex + 1 >= properties.length) {
          onSwipeComplete?.(result.newState)
        }
      } else {
        // Revert the UI change if the swipe failed
        setCurrentIndex(prev => Math.max(0, prev - 1))
        setError('This property has already been reviewed')
      }
    } catch (error) {
      console.error('Swipe failed:', error)
      // Revert the UI change if the swipe failed
      setCurrentIndex(prev => Math.max(0, prev - 1))
      setError('Something went wrong. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }, [isProcessing, currentIndex, properties.length, sessionId, onSwipe, onSwipeComplete])

  const handleUndo = async () => {
    if (isProcessing || currentIndex === 0) return

    const previousProperty = properties[currentIndex - 1]
    if (!previousProperty) return

    setIsProcessing(true)
    setError(null)

    try {
      await SwipeService.resetProperty(previousProperty.id, sessionId)
      
      // Reload state and move back one property
      const newState = await SwipeService.getSwipeState(sessionId)
      setSwipeState(newState)
      setCurrentIndex(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Undo failed:', error)
      setError('Failed to undo. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCardLeftScreen = useCallback((propertyId: string) => {
    // Card animation completed - could add sound effects or haptics here
    console.log(`Card ${propertyId} left screen`)
  }, [])

  if (properties.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">🏠</div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            No properties available
          </h2>
          <p className="text-gray-500">
            Check back later for new listings
          </p>
        </div>
      </div>
    )
  }

  if (isComplete) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-md mx-auto"
        >
          <div className="text-6xl mb-6">🎉</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            You've viewed all properties!
          </h2>
          <p className="text-gray-600 mb-6">
            Great job exploring the listings. Here's what you decided:
          </p>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl mb-1">❤️</div>
              <div className="font-semibold">{bucketCounts.liked}</div>
              <div className="text-sm text-gray-600">Liked</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl mb-1">🤔</div>
              <div className="font-semibold">{bucketCounts.considering}</div>
              <div className="text-sm text-gray-600">Considering</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl mb-1">❌</div>
              <div className="font-semibold">{bucketCounts.disliked}</div>
              <div className="text-sm text-gray-600">Passed</div>
            </div>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start Over
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header with progress and bucket counts */}
      <div className="bg-white shadow-sm p-4">
        <div className="max-w-sm mx-auto">
          <div className="flex justify-between items-center mb-2">
            <div className="text-sm text-gray-500">
              {currentIndex + 1} of {properties.length}
            </div>
            <button
              onClick={handleUndo}
              disabled={isProcessing || currentIndex === 0}
              className="text-blue-600 disabled:text-gray-400 text-sm hover:text-blue-800 transition-colors disabled:cursor-not-allowed"
              aria-label="Undo last swipe"
            >
              ↶ Undo
            </button>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex) / properties.length) * 100}%` }}
            />
          </div>

          <div className="flex justify-center space-x-4 text-sm">
            <span className="flex items-center space-x-1">
              <span>❤️</span>
              <span>{bucketCounts.liked}</span>
            </span>
            <span className="flex items-center space-x-1">
              <span>❌</span>
              <span>{bucketCounts.disliked}</span>
            </span>
            <span className="flex items-center space-x-1">
              <span>🤔</span>
              <span>{bucketCounts.considering}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 text-sm text-center">
          {error}
        </div>
      )}

      {/* Main swipe area */}
      <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="relative w-full max-w-sm h-96">
          {currentProperty && (
            <TinderCard
              key={currentProperty.id}
              onSwipe={(direction) => handleSwipe(direction as SwipeDirection, currentProperty.id)}
              onCardLeftScreen={() => handleCardLeftScreen(currentProperty.id)}
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
          )}

          {/* Loading overlay */}
          {isProcessing && (
            <div className="absolute inset-0 bg-black bg-opacity-20 rounded-lg flex items-center justify-center">
              <div className="bg-white rounded-full p-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Swipe hints */}
      <div className="bg-white border-t p-4">
        <div className="max-w-sm mx-auto">
          <div className="grid grid-cols-3 gap-4 text-xs text-gray-500 text-center">
            <div>
              <div className="text-lg mb-1">👈</div>
              <div>Swipe left to pass</div>
            </div>
            <div>
              <div className="text-lg mb-1">👇</div>
              <div>Swipe down to consider</div>
            </div>
            <div>
              <div className="text-lg mb-1">👉</div>
              <div>Swipe right to like</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}