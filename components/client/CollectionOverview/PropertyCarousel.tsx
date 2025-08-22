/**
 * PropertyCarousel Component
 * Displays a carousel of property cards with navigation controls
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { PropertyCarouselProps } from './types'
import { Property } from '../types'

export const PropertyCarousel: React.FC<PropertyCarouselProps> = ({
  properties,
  isMobile,
  isTablet,
  onPropertySelect,
  loading = false
}) => {
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0)
  const [preloadedCount, setPreloadedCount] = useState(0)

  // Progressive loading simulation
  useEffect(() => {
    if (!loading && properties.length > 5) {
      const timer = setTimeout(() => {
        setPreloadedCount(Math.min(10, properties.length - 5))
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [loading, properties.length])

  // Get visible preview properties
  const previewProperties = useMemo(() => {
    const visibleCount = isMobile ? 1 : isTablet ? 2 : 3
    if (properties.length > 100) {
      return properties.slice(currentPreviewIndex, currentPreviewIndex + 4)
    }
    return properties.slice(0, Math.min(visibleCount + 1, properties.length))
  }, [properties, currentPreviewIndex, isMobile, isTablet])

  // Navigation handlers
  const handlePreviewNext = useCallback(() => {
    if (currentPreviewIndex < properties.length - 3) {
      setCurrentPreviewIndex(prev => prev + 1)
      const preview = document.querySelector('[data-testid="carousel-preview"]')
      if (preview) {
        preview.classList.add('shifted')
      }
    }
  }, [currentPreviewIndex, properties.length])

  const handlePreviewPrev = useCallback(() => {
    if (currentPreviewIndex > 0) {
      setCurrentPreviewIndex(prev => prev - 1)
    }
  }, [currentPreviewIndex])

  const handlePropertyClick = useCallback((property: Property) => {
    onPropertySelect(property)
    const liveRegion = document.querySelector('[data-testid="overview-live-region"]')
    if (liveRegion) {
      liveRegion.textContent = `Selected property: ${property.address}, $${property.price?.toLocaleString()}`
    }
  }, [onPropertySelect])

  if (!properties.length) return null

  return (
    <section 
      data-testid="carousel-preview" 
      className={`carousel-preview ${isMobile ? 'mobile-preview' : ''} ${currentPreviewIndex > 0 ? 'shifted' : ''}`}
      data-swipeable="true"
    >
      <h3>Featured Properties</h3>
      
      {/* Navigation Arrows */}
      <button
        data-testid="carousel-preview-prev"
        className="preview-nav prev"
        onClick={handlePreviewPrev}
        disabled={currentPreviewIndex === 0}
        aria-label="Previous properties"
      >
        ◀
      </button>
      
      <button
        data-testid="carousel-preview-next"
        className="preview-nav next"
        onClick={handlePreviewNext}
        disabled={currentPreviewIndex >= properties.length - 3}
        aria-label="Next properties"
      >
        ▶
      </button>

      {/* Property Cards */}
      <div className="preview-cards touch-enabled" data-swipeable="true">
        {properties.length > 100 && (
          <div data-testid="virtualized-preview" className="virtualized-container" />
        )}
        
        {previewProperties.map((property, index) => (
          <div
            key={property.id}
            data-testid={`preview-property-card-${property.id}`}
            className="preview-card"
            onClick={() => handlePropertyClick(property)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                handlePropertyClick(property)
              }
            }}
          >
            <img
              data-testid={`property-hero-image-${property.id}`}
              src={property.images[0]}
              alt={property.address}
              className="preview-image"
              loading={index < 2 ? "eager" : "lazy"}
              srcSet={`${property.images[0]}.webp 1x, ${property.images[0]}@2x.webp 2x`}
            />
            
            {property.images.length > 1 && (
              <img
                data-testid={`property-thumbnail-${property.id}`}
                src={property.images[1]}
                alt={`${property.address} thumbnail`}
                className="preview-thumbnail"
                loading="lazy"
              />
            )}
            
            <div className="preview-info">
              <h4>{property.address}</h4>
              <p className="price">${property.price?.toLocaleString()}</p>
              <p className="features">
                {property.bedrooms} bed • {property.bathrooms} bath • {property.area_sqft?.toLocaleString()} sqft
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Indicators */}
      <div data-testid="carousel-preview-indicators" className="preview-indicators">
        {Array.from({ length: Math.min(properties.length, 3) }, (_, index) => (
          <button
            key={index}
            data-testid={`carousel-indicator-${index}`}
            className={`indicator ${index === currentPreviewIndex ? 'active' : ''}`}
            onClick={() => setCurrentPreviewIndex(index)}
            aria-label={`Go to property ${index + 1}`}
          />
        ))}
      </div>

      {/* Progressive Loading Status */}
      {properties.length > 5 && (
        <div className="loading-status">
          <div data-testid="progressive-loading-indicator">
            Loading additional properties...
          </div>
          <div 
            data-testid="preload-status" 
            data-preloaded={preloadedCount}
            className="preload-info"
          >
            {preloadedCount > 0 && `${preloadedCount} properties preloaded`}
          </div>
        </div>
      )}

      {/* Lazy Load Trigger */}
      <div data-testid="lazy-load-trigger" className="lazy-trigger" />

      {/* Screen Reader Live Region */}
      <div 
        data-testid="overview-live-region"
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      />
    </section>
  )
}

export default PropertyCarousel