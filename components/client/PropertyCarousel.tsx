import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Property, BucketType } from './types'
import PropertyCard from './PropertyCard'

interface PropertyCarouselProps {
  properties: Property[]
  currentIndex: number
  onNavigate: (index: number) => void
  onPropertySelect: (property: Property) => void
  onBucketAssign: (propertyId: string, bucket: BucketType) => void
  selectedBuckets: Record<string, BucketType>
  loading?: boolean
  className?: string
}

const PropertyCarousel: React.FC<PropertyCarouselProps> = ({
  properties,
  currentIndex,
  onNavigate,
  onPropertySelect,
  onBucketAssign,
  selectedBuckets = {},
  loading = false,
  className = ''
}) => {
  const carouselRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [viewportWidth, setViewportWidth] = useState(1024)
  const [localCurrentIndex, setLocalCurrentIndex] = useState(currentIndex)

  // Ensure currentIndex is within bounds
  const safeCurrentIndex = Math.max(0, Math.min(localCurrentIndex, properties.length - 1))

  // Sync local state with prop changes
  useEffect(() => {
    setLocalCurrentIndex(currentIndex)
  }, [currentIndex])

  // Handle viewport changes for responsive card count
  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Calculate responsive card count
  const getCardsPerView = () => {
    if (viewportWidth < 768) return 1 // Mobile
    if (viewportWidth < 1024) return 2 // Tablet
    return 3 // Desktop (3-4 cards)
  }

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'ArrowLeft' && safeCurrentIndex > 0) {
      const newIndex = safeCurrentIndex - 1
      setLocalCurrentIndex(newIndex)
      onNavigate(newIndex)
    } else if (event.key === 'ArrowRight' && safeCurrentIndex < properties.length - 1) {
      const newIndex = safeCurrentIndex + 1
      setLocalCurrentIndex(newIndex)
      onNavigate(newIndex)
    }
  }, [safeCurrentIndex, properties.length, onNavigate])

  // Smooth scroll to specific card (with null check for testing)
  const scrollToCard = useCallback((index: number) => {
    if (!scrollContainerRef.current || typeof scrollContainerRef.current.scrollTo !== 'function') return
    const cardWidth = viewportWidth < 768 ? 343 : 
                     viewportWidth < 1024 ? (viewportWidth - 48) / 2 : 
                     (viewportWidth - 64) / 3
    const scrollPosition = index * (cardWidth + 16) // 16px gap
    scrollContainerRef.current.scrollTo({
      left: scrollPosition,
      behavior: 'smooth'
    })
  }, [viewportWidth])

  // Update scroll position when currentIndex changes (safer for testing)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      scrollToCard(safeCurrentIndex)
    }
  }, [safeCurrentIndex, scrollToCard])

  // State for live region announcements
  const [liveRegionText, setLiveRegionText] = useState('')

  // Update live region when currentIndex changes
  useEffect(() => {
    if (properties.length > 0 && properties[safeCurrentIndex]) {
      const text = `Now viewing property ${safeCurrentIndex + 1} of ${properties.length}: ${properties[safeCurrentIndex].address}`
      setLiveRegionText(text)
    }
  }, [safeCurrentIndex, properties])

  // Loading skeleton - Airbnb style
  if (loading) {
    const skeletonCount = getCardsPerView()
    return (
      <div data-testid="airbnb-loading-skeleton" className="w-full">
        <div className="flex gap-4 overflow-x-auto scroll-gestures-only">
          {Array.from({ length: Math.max(skeletonCount, 3) }).map((_, i) => (
            <div 
              key={i} 
              data-testid={`skeleton-card-${i}`}
              className={`flex-shrink-0 animate-pulse bg-gray-200 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer rounded-xl ${
                viewportWidth < 768 ? 'w-[343px]' : 
                viewportWidth < 1024 ? 'w-[calc(50%-12px)]' : 
                'w-[calc(33.333%-16px)]'
              } h-96`}
            >
              <div data-testid={`skeleton-image-${i}`} className="h-[70%] bg-gray-200 rounded-t-xl"></div>
              <div data-testid={`skeleton-content-${i}`} className="h-[30%] p-3">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
        <div data-testid="airbnb-dot-indicators" className="flex justify-center mt-4 gap-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="w-1.5 h-1.5 bg-gray-200 rounded-full"></div>
          ))}
        </div>
      </div>
    )
  }

  // Empty state
  if (properties.length === 0) {
    return (
      <div data-testid="carousel-empty-state" className="text-center py-16">
        <p className="text-gray-500 text-lg">No properties available</p>
      </div>
    )
  }

  return (
    <div
      data-testid="airbnb-carousel-container"
      className={`airbnb-carousel carousel-container-airbnb relative focus:outline-none focus:ring-2 focus:ring-[#FF5A5F] ${className}`}
      style={{
        paddingBottom: 'var(--spacing-md)'
      }}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      ref={carouselRef}
      role="region"
      aria-label="Property listings carousel"
      aria-roledescription="carousel"
    >
      {/* Live region for screen reader announcements */}
      <div 
        data-testid="carousel-live-region"
        className="sr-only" 
        aria-live="polite" 
        aria-atomic="true"
      >
        {liveRegionText}
      </div>

      {/* Desktop arrow navigation - Airbnb style */}
      {viewportWidth >= 1024 && (
        <>
          <button
            data-testid="airbnb-left-arrow"
            className="carousel-arrow left absolute top-1/2 transform -translate-y-1/2 z-10 disabled:opacity-50 focus:ring-2 focus:ring-[#FF5A5F] focus:ring-offset-2"
            style={{
              left: 'var(--spacing-md)',
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'var(--color-bg-primary)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              transition: 'all var(--transition-button)',
              boxShadow: 'var(--shadow-card)'
            }}
            onClick={() => {
              const newIndex = Math.max(0, safeCurrentIndex - 1)
              setLocalCurrentIndex(newIndex)
              onNavigate(newIndex)
            }}
            disabled={safeCurrentIndex === 0}
            aria-label="Previous property"
          >
            ←
          </button>
          <button
            data-testid="airbnb-right-arrow"
            className="carousel-arrow right absolute top-1/2 transform -translate-y-1/2 z-10 disabled:opacity-50 focus:ring-2 focus:ring-[#FF5A5F] focus:ring-offset-2"
            style={{
              right: 'var(--spacing-md)',
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'var(--color-bg-primary)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              transition: 'all var(--transition-button)',
              boxShadow: 'var(--shadow-card)'
            }}
            onClick={() => {
              const newIndex = Math.min(properties.length - 1, safeCurrentIndex + 1)
              setLocalCurrentIndex(newIndex)
              onNavigate(newIndex)
            }}
            disabled={safeCurrentIndex === properties.length - 1}
            aria-label="Next property"
          >
            →
          </button>
        </>
      )}

      {/* Horizontal scroll container - Airbnb style */}
      <div 
        data-testid="horizontal-scroll-container"
        ref={scrollContainerRef}
        className="carousel-inner flex overflow-x-auto scroll-smooth carousel-snap"
        style={{
          gap: 'var(--spacing-md)',
          padding: '0 var(--spacing-md)',
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        {properties.map((property, index) => {
          const isVisible = viewportWidth < 768 ? 
            index === safeCurrentIndex : 
            viewportWidth < 1024 ? 
            index >= 0 && index < 2 : // Show first 2 cards on tablet
            index >= 0 && index < Math.min(4, properties.length) // Show up to 4 cards on desktop
          
          return (
            <div 
              key={property.id}
              data-testid={isVisible ? 'property-card-visible' : undefined}
              className="flex-shrink-0"
            >
              <PropertyCard
                property={property}
                isActive={index === safeCurrentIndex}
                selectedBucket={selectedBuckets[property.id]}
                onPropertySelect={onPropertySelect}
                onBucketAssign={onBucketAssign}
                isVisible={isVisible}
                viewportWidth={viewportWidth}
              />
            </div>
          )
        })}
      </div>

      {/* Dot indicators - Airbnb style */}
      <div 
        data-testid="airbnb-dot-indicators" 
        className="dot-indicators flex justify-center"
        style={{
          gap: 'var(--spacing-sm)',
          marginTop: 'var(--spacing-md)'
        }}
      >
        {properties.map((_, index) => (
          <button
            key={index}
            data-testid={`dot-indicator-${index}`}
            className={`dot-indicator ${index === safeCurrentIndex ? 'active' : 'inactive'} focus:ring-2 focus:ring-[#FF5A5F] focus:ring-offset-2 transition-all duration-100`}
            style={{
              minWidth: '44px',
              minHeight: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: 'none',
              borderRadius: '50%',
              cursor: 'pointer'
            }}
            onClick={() => {
              setLocalCurrentIndex(index)
              onNavigate(index)
            }}
            aria-label={`Go to property ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

export default PropertyCarousel