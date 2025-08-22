import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Property, BucketType } from './types'
import AirbnbPropertyCard from './AirbnbPropertyCard'

interface AirbnbCarouselProps {
  properties: Property[]
  onPropertySelect: (property: Property) => void
  onBucketAssign?: (propertyId: string, bucket: BucketType) => void
  title?: string
  showGuestFavorites?: boolean
  loading?: boolean
}

/**
 * Airbnb-style Property Carousel
 * 
 * Matches exact Airbnb design:
 * - Horizontal scrolling grid
 * - 5 cards visible on desktop
 * - Arrow navigation buttons
 * - Clean, minimal design
 * - No dot indicators (Airbnb style)
 */
const AirbnbCarousel: React.FC<AirbnbCarouselProps> = ({
  properties,
  onPropertySelect,
  onBucketAssign,
  title = "Popular homes",
  showGuestFavorites = true,
  loading = false
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  // Check scroll position
  const checkScrollPosition = useCallback(() => {
    if (!scrollContainerRef.current) return
    
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
  }, [])

  useEffect(() => {
    checkScrollPosition()
    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener('scroll', checkScrollPosition)
      return () => container.removeEventListener('scroll', checkScrollPosition)
    }
  }, [checkScrollPosition])

  // Scroll handlers
  const scrollLeft = () => {
    if (!scrollContainerRef.current) return
    const cardWidth = scrollContainerRef.current.querySelector('[data-testid^="airbnb-property-card"]')?.clientWidth || 300
    scrollContainerRef.current.scrollBy({ left: -(cardWidth * 3), behavior: 'smooth' })
  }

  const scrollRight = () => {
    if (!scrollContainerRef.current) return
    const cardWidth = scrollContainerRef.current.querySelector('[data-testid^="airbnb-property-card"]')?.clientWidth || 300
    scrollContainerRef.current.scrollBy({ left: cardWidth * 3, behavior: 'smooth' })
  }

  // Loading skeleton
  if (loading) {
    return (
      <div className="relative">
        <h2 className="mb-6 text-2xl font-semibold text-gray-900">{title}</h2>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square rounded-xl bg-gray-200"></div>
              <div className="mt-3 space-y-2">
                <div className="h-4 w-3/4 rounded bg-gray-200"></div>
                <div className="h-4 w-1/2 rounded bg-gray-200"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Section Title with Arrow */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">
          {title}
          <span className="ml-2 text-gray-900">›</span>
        </h2>
      </div>

      {/* Carousel Container */}
      <div className="relative">
        {/* Left Arrow */}
        {canScrollLeft && (
          <button
            onClick={scrollLeft}
            className="absolute -left-3 top-[35%] z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-gray-300 bg-white shadow-sm transition-all hover:scale-105 hover:shadow-md"
            aria-label="Previous properties"
          >
            <svg
              viewBox="0 0 16 16"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              role="presentation"
              focusable="false"
              className="h-3 w-3"
            >
              <path d="M10.8 16a1 1 0 0 1-.8-.4L4 8l6-7.6a1 1 0 0 1 1.6 1.2L6.67 8l4.93 6.4a1 1 0 0 1-.8 1.6z"></path>
            </svg>
          </button>
        )}

        {/* Right Arrow */}
        {canScrollRight && (
          <button
            onClick={scrollRight}
            className="absolute -right-3 top-[35%] z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-gray-300 bg-white shadow-sm transition-all hover:scale-105 hover:shadow-md"
            aria-label="Next properties"
          >
            <svg
              viewBox="0 0 16 16"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              role="presentation"
              focusable="false"
              className="h-3 w-3"
            >
              <path d="M5.2 0a1 1 0 0 1 .8.4l6 7.6-6 7.6a1 1 0 0 1-1.6-1.2L9.33 8 4.4 1.6A1 1 0 0 1 5.2 0z"></path>
            </svg>
          </button>
        )}

        {/* Scrollable Container */}
        <div
          ref={scrollContainerRef}
          className="no-scrollbar flex gap-6 overflow-x-auto scroll-smooth"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitScrollbar: { display: 'none' }
          }}
        >
          {properties.map((property, index) => (
            <div
              key={property.id}
              className="flex-none"
              style={{ width: 'calc(20% - 19.2px)' }} // 5 cards visible with gaps
            >
              <AirbnbPropertyCard
                property={property}
                isActive={index === 0}
                onPropertySelect={onPropertySelect}
                onBucketAssign={onBucketAssign}
                showGuestFavorite={showGuestFavorites && index < 2}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Custom CSS for hiding scrollbar */}
      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}

export default AirbnbCarousel