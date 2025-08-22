'use client'

import React, { useState, useRef, useEffect } from 'react'
import PropertyCard from './PropertyCard'
import PropertyModal from './PropertyModal'
import BucketNavigation from './BucketNavigation'
import { Property, BucketType, CarouselState, ActionType } from './types'

interface SwipeLinkCarouselProps {
  properties: Property[]
  linkCode: string
  className?: string
}

export default function SwipeLinkCarousel({
  properties,
  linkCode,
  className = ''
}: SwipeLinkCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<CarouselState>({
    properties,
    currentIndex: 0,
    selectedProperty: null,
    isModalOpen: false,
    buckets: {
      new: {
        type: 'new',
        label: 'New',
        icon: '🆕',
        count: properties.length,
        properties: properties.map(p => p.id)
      },
      liked: {
        type: 'liked',
        label: 'Liked',
        icon: '❤️',
        count: 0,
        properties: []
      },
      disliked: {
        type: 'disliked',
        label: 'Disliked',
        icon: '👎',
        count: 0,
        properties: []
      },
      scheduled: {
        type: 'scheduled',
        label: 'Visit Scheduled',
        icon: '📅',
        count: 0,
        properties: []
      }
    },
    activeBucket: 'new'
  })

  // Load saved state from session storage
  useEffect(() => {
    const savedState = sessionStorage.getItem(`swipelink-${linkCode}`)
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState)
        setState(prev => ({
          ...prev,
          buckets: parsed.buckets || prev.buckets,
          activeBucket: parsed.activeBucket || prev.activeBucket
        }))
      } catch (e) {
        console.error('Failed to load saved state:', e)
      }
    }
  }, [linkCode])

  // Save state to session storage
  useEffect(() => {
    const stateToSave = {
      buckets: state.buckets,
      activeBucket: state.activeBucket
    }
    sessionStorage.setItem(`swipelink-${linkCode}`, JSON.stringify(stateToSave))
  }, [state.buckets, state.activeBucket, linkCode])

  const handlePropertyClick = (property: Property) => {
    setState(prev => ({
      ...prev,
      selectedProperty: property,
      isModalOpen: true
    }))
  }

  const handleCloseModal = () => {
    setState(prev => ({
      ...prev,
      selectedProperty: null,
      isModalOpen: false
    }))
  }

  const handlePropertyAction = (propertyId: string, action: ActionType) => {
    let targetBucket: BucketType | null = null
    
    switch (action) {
      case 'like':
        targetBucket = 'liked'
        break
      case 'dislike':
        targetBucket = 'disliked'
        break
      case 'schedule':
        targetBucket = 'scheduled'
        break
      case 'consider':
        // Considering keeps in current bucket but marks it
        return
    }

    if (targetBucket) {
      setState(prev => {
        const newBuckets = { ...prev.buckets }
        
        // Remove from all buckets
        Object.keys(newBuckets).forEach(key => {
          const bucket = newBuckets[key as BucketType]
          bucket.properties = bucket.properties.filter(id => id !== propertyId)
          bucket.count = bucket.properties.length
        })
        
        // Add to target bucket
        newBuckets[targetBucket].properties.push(propertyId)
        newBuckets[targetBucket].count = newBuckets[targetBucket].properties.length
        
        return {
          ...prev,
          buckets: newBuckets
        }
      })
    }
  }

  const handleBucketChange = (bucket: BucketType) => {
    setState(prev => ({
      ...prev,
      activeBucket: bucket
    }))
  }

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return
    
    const container = scrollContainerRef.current
    const cardWidth = container.querySelector('[data-testid^="property-card-"]')?.clientWidth || 300
    const gap = 24
    const scrollAmount = cardWidth + gap
    
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    })
  }

  // Filter properties based on active bucket
  const displayProperties = properties.filter(p => 
    state.buckets[state.activeBucket].properties.includes(p.id)
  )

  return (
    <div className={`swipelink-carousel ${className}`}>
      {/* Carousel Container */}
      <div className="relative" data-testid="carousel-container">
        {/* Navigation Arrows - Desktop Only */}
        {displayProperties.length > 4 && (
          <>
            <button
              onClick={() => handleScroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow hidden lg:flex items-center justify-center"
              style={{ width: 32, height: 32, marginLeft: -16 }}
              aria-label="Previous properties"
              data-testid="carousel-prev"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                <path d="M9.5 6L3.5 6M3.5 6L6.5 3M3.5 6L6.5 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
            </button>
            <button
              onClick={() => handleScroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow hidden lg:flex items-center justify-center"
              style={{ width: 32, height: 32, marginRight: -16 }}
              aria-label="Next properties"
              data-testid="carousel-next"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                <path d="M2.5 6L8.5 6M8.5 6L5.5 3M8.5 6L5.5 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
            </button>
          </>
        )}

        {/* Scrollable Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto scroll-smooth scrollbar-hide pb-4"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
          data-testid="carousel-scroll-container"
        >
          {displayProperties.length > 0 ? (
            displayProperties.map((property, index) => (
              <div
                key={property.id}
                className="flex-none w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)]"
                style={{ maxWidth: 343 }}
                data-testid={`property-card-wrapper-${index}`}
              >
                <PropertyCard
                  property={property}
                  onClick={() => handlePropertyClick(property)}
                  isLiked={state.buckets.liked.properties.includes(property.id)}
                  onLikeToggle={() => handlePropertyAction(property.id, 'like')}
                />
              </div>
            ))
          ) : (
            <div className="w-full text-center py-12 text-gray-500">
              No properties in {state.buckets[state.activeBucket].label} bucket
            </div>
          )}
        </div>
      </div>

      {/* Bucket Navigation */}
      <BucketNavigation
        buckets={state.buckets}
        activeBucket={state.activeBucket}
        onBucketChange={handleBucketChange}
      />

      {/* Property Modal */}
      {state.isModalOpen && state.selectedProperty && (
        <PropertyModal
          property={state.selectedProperty}
          onClose={handleCloseModal}
          onAction={handlePropertyAction}
          currentBucket={
            Object.values(state.buckets).find(b => 
              b.properties.includes(state.selectedProperty!.id)
            )?.type || 'new'
          }
        />
      )}
    </div>
  )
}