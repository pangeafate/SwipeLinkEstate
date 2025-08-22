/**
 * PropertyCarousel Component
 * 
 * Mobile-first property carousel that displays 4 properties in a 2x2 grid on mobile
 * or horizontal carousel on desktop. Integrates with PropertyCard components.
 */

import React, { memo, useState, useEffect, useCallback, useRef } from 'react'
import { PropertyCard } from '../NewPropertyCard'
import type { Property, PropertyAction, BucketType } from '../types'

interface PropertyCarouselProps {
  properties: Property[]
  onActionClick: (propertyId: string, action: PropertyAction) => void
  onCardClick: (property: Property) => void
  showActions?: boolean
  loading?: boolean
  currentBucket?: BucketType
  bucketCounts?: Record<BucketType, number>
  showNavigation?: boolean
  activeIndex?: number
  onNavigate?: (index: number) => void
  onSwipe?: (direction: 'left' | 'right') => void
  virtualScrolling?: boolean
  className?: string
}

export const PropertyCarousel = memo<PropertyCarouselProps>(({
  properties,
  onActionClick,
  onCardClick,
  showActions = false,
  loading = false,
  currentBucket = 'new_properties',
  bucketCounts,
  showNavigation = false,
  activeIndex = 0,
  onNavigate,
  onSwipe,
  virtualScrolling = false,
  className = ''
}) => {
  const [isMobile, setIsMobile] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(activeIndex)
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null)
  const carouselRef = useRef<HTMLDivElement>(null)

  // Handle responsive layout
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    const currentFocus = document.activeElement as HTMLElement
    const cards = carouselRef.current?.querySelectorAll('[role="button"]') as NodeListOf<HTMLElement>
    
    if (!cards) return

    const currentIndex = Array.from(cards).indexOf(currentFocus)
    let nextIndex = currentIndex

    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault()
        nextIndex = Math.min(currentIndex + 1, cards.length - 1)
        break
      case 'ArrowLeft':
        event.preventDefault()
        nextIndex = Math.max(currentIndex - 1, 0)
        break
      case 'ArrowDown':
        if (isMobile) {
          event.preventDefault()
          nextIndex = Math.min(currentIndex + 2, cards.length - 1)
        }
        break
      case 'ArrowUp':
        if (isMobile) {
          event.preventDefault()
          nextIndex = Math.max(currentIndex - 2, 0)
        }
        break
    }

    if (nextIndex !== currentIndex && cards[nextIndex]) {
      cards[nextIndex].focus()
    }
  }, [isMobile])

  // Handle touch interactions
  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    const touch = event.touches[0]
    setTouchStart({ x: touch.clientX, y: touch.clientY })
  }, [])

  const handleTouchMove = useCallback((event: React.TouchEvent) => {
    // Removed - will handle in touchEnd for better gesture detection
  }, [])

  const handleTouchEnd = useCallback((event: React.TouchEvent) => {
    if (!touchStart || !onSwipe) {
      setTouchStart(null)
      return
    }

    const touch = event.changedTouches[0]
    const deltaX = touchStart.x - touch.clientX
    const deltaY = touchStart.y - touch.clientY

    // Only handle horizontal swipes with minimum threshold
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      onSwipe(deltaX > 0 ? 'left' : 'right')
    }
    
    setTouchStart(null)
  }, [touchStart, onSwipe])

  // Navigation handler
  const handleNavigate = useCallback((index: number) => {
    setCurrentIndex(index)
    if (onNavigate) {
      onNavigate(index)
    }
  }, [onNavigate])

  // Filter valid properties
  const validProperties = properties.filter(property => 
    property && 
    property.id && 
    property.price !== null && 
    property.address !== null
  )

  // Virtual scrolling for large lists
  const visibleProperties = virtualScrolling && validProperties.length > 10
    ? validProperties.slice(0, 10)  // Show first 10 for virtual scrolling
    : validProperties.slice(0, 4)   // Show first 4 properties as specified

  // Loading state
  if (loading) {
    return (
      <div 
        className={`property-carousel-container ${isMobile ? 'grid grid-cols-2 gap-2' : 'flex overflow-x-auto'} ${className}`}
        data-testid="property-carousel"
        role="region"
        aria-label="Property carousel"
        style={isMobile ? { overflowY: 'auto', maxHeight: '80vh' } : {}}
      >
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={`skeleton-${index}`} className={isMobile ? 'p-2' : 'p-4'}>
            <PropertyCard
              property={{} as Property}
              onActionClick={onActionClick}
              onCardClick={onCardClick}
              loading={true}
            />
          </div>
        ))}
      </div>
    )
  }

  // Empty state
  if (validProperties.length === 0) {
    return (
      <div 
        className={`property-carousel-container ${className}`}
        data-testid="property-carousel"
        role="region"
        aria-label="Property carousel"
      >
        <div 
          data-testid="carousel-empty-state"
          className="flex flex-col items-center justify-center py-12 px-4 text-center"
        >
          <div className="text-6xl mb-4">🏠</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No properties available
          </h3>
          <p className="text-gray-600">
            Check back later for new property listings
          </p>
        </div>
      </div>
    )
  }

  return (
    <div 
      className={`property-carousel-container ${isMobile ? 'grid grid-cols-2 gap-2' : 'flex overflow-x-auto'} ${className}`}
      data-testid="property-carousel"
      role="region"
      aria-label="Property carousel"
      onKeyDown={handleKeyDown}
      style={isMobile ? { overflowY: 'auto', maxHeight: '80vh' } : {}}
    >
      {/* Screen reader announcement */}
      <div className="sr-only" aria-live="polite">
        Showing {validProperties.length} properties
      </div>

      {/* Carousel Content */}
      <div
        ref={carouselRef}
        className={`
          ${isMobile 
            ? 'contents' 
            : 'flex gap-4 p-4'
          } 
          scroll-smooth
        `}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {visibleProperties.map((property, index) => (
          <div key={property.id} className={isMobile ? 'p-2' : 'flex-shrink-0'}>
            <PropertyCard
              property={property}
              onActionClick={onActionClick}
              onCardClick={onCardClick}
              showActions={showActions}
              carouselIndex={index}
              totalCards={validProperties.length}
              currentBucket={currentBucket}
              className={isMobile ? 'max-w-none' : 'w-80'}
            />
          </div>
        ))}
      </div>

      {/* Navigation Dots */}
      {showNavigation && validProperties.length > 1 && (
        <div className="flex justify-center space-x-2 mt-4 pb-4">
          {validProperties.map((_, index) => (
            <button
              key={index}
              className={`
                w-2 h-2 rounded-full transition-colors duration-200 
                ${index === currentIndex 
                  ? 'bg-blue-600' 
                  : 'bg-gray-300 hover:bg-gray-400'
                }
              `}
              onClick={() => handleNavigate(index)}
              aria-label={`Go to property ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Property Counter for Screen Readers */}
      <div className="sr-only" aria-live="polite">
        {currentBucket && bucketCounts && (
          `${bucketCounts[currentBucket]} properties in ${currentBucket.replace('_', ' ')}`
        )}
      </div>
    </div>
  )
})

PropertyCarousel.displayName = 'PropertyCarousel'

export default PropertyCarousel