/**
 * CollectionOverview Component (Refactored)
 * Main orchestrator component for displaying property collection overview
 */

import React, { useState, useMemo, useEffect } from 'react'
import { CollectionHeader } from './CollectionHeader'
import { CollectionStats } from './CollectionStats'
import { PropertyCarousel } from './PropertyCarousel'
import { HelpOverlay } from './HelpOverlay'
import { ActionBar } from './ActionBar'
import type { CollectionOverviewProps, CollectionStatistics } from './types'

export const CollectionOverview: React.FC<CollectionOverviewProps> = ({
  collection,
  agent,
  properties,
  buckets,
  sessionProgress,
  onPropertySelect,
  onBucketChange,
  onContactAgent,
  onHelpToggle,
  loading = false,
  showHelp = false,
  error
}) => {
  const [expandedSummary, setExpandedSummary] = useState(false)
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  )

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [])

  // Layout breakpoints
  const isMobile = windowWidth < 768
  const isTablet = windowWidth >= 768 && windowWidth < 1024

  // Collection statistics calculation
  const statistics = useMemo((): CollectionStatistics => {
    if (!properties.length) {
      return {
        averagePrice: 0,
        priceRange: { min: 0, max: 0 },
        averageArea: 0,
        bedroomRange: { min: 0, max: 0 },
        bathroomRange: { min: 0, max: 0 },
        propertyTypes: {}
      }
    }

    const validProperties = properties.filter(
      p => p.price && p.area_sqft && p.bedrooms && p.bathrooms
    )
    
    const averagePrice = validProperties.reduce(
      (sum, p) => sum + (p.price || 0), 0
    ) / validProperties.length
    
    const prices = validProperties.map(p => p.price || 0).sort((a, b) => a - b)
    const areas = validProperties.map(p => p.area_sqft || 0)
    const bedrooms = validProperties.map(p => p.bedrooms || 0)
    const bathrooms = validProperties.map(p => p.bathrooms || 0)
    
    const propertyTypes = properties.reduce((acc, p) => {
      if (p.property_type) {
        acc[p.property_type] = (acc[p.property_type] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    return {
      averagePrice,
      priceRange: { 
        min: prices[0] || 0, 
        max: prices[prices.length - 1] || 0 
      },
      averageArea: areas.reduce((sum, area) => sum + area, 0) / areas.length,
      bedroomRange: { 
        min: Math.min(...bedrooms), 
        max: Math.max(...bedrooms) 
      },
      bathroomRange: { 
        min: Math.min(...bathrooms), 
        max: Math.max(...bathrooms) 
      },
      propertyTypes
    }
  }, [properties])

  // Error state
  if (error) {
    return (
      <div 
        data-testid="collection-overview" 
        className="collection-overview error-state"
        role="main"
        aria-label="Property collection overview"
      >
        <div data-testid="collection-error" className="error-container">
          <h2>Something went wrong</h2>
          <p>Failed to load collection data</p>
          <button data-testid="retry-load-btn" className="btn primary">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // Loading state
  if (loading) {
    return (
      <div 
        data-testid="collection-loading-skeleton" 
        className="collection-skeleton animated-skeleton"
      >
        <div data-testid="header-skeleton" className="skeleton-header">
          <div className="skeleton-avatar" />
          <div className="skeleton-text-block">
            <div className="skeleton-line long" />
            <div className="skeleton-line medium" />
          </div>
        </div>
        
        <div data-testid="summary-skeleton" className="skeleton-summary">
          <div className="skeleton-stats">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="skeleton-stat">
                <div className="skeleton-line short" />
                <div className="skeleton-line medium" />
              </div>
            ))}
          </div>
        </div>

        <div data-testid="carousel-skeleton" className="skeleton-carousel">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="skeleton-card">
              <div className="skeleton-image" />
              <div className="skeleton-content">
                <div className="skeleton-line medium" />
                <div className="skeleton-line short" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Empty collection state
  if (!properties.length) {
    return (
      <div 
        data-testid="collection-overview"
        className="collection-overview empty-state"
        role="main"
        aria-label="Property collection overview"
      >
        <div data-testid="empty-collection-state" className="empty-container">
          <h2>No properties in this collection</h2>
          <p>This collection is currently empty. Check back later for updates.</p>
        </div>
      </div>
    )
  }

  // Missing collection fallback
  if (!collection) {
    return (
      <div 
        data-testid="collection-overview"
        className="collection-overview error-state"
        role="main"
        aria-label="Property collection overview"
      >
        <div className="error-container">
          <h2>Collection unavailable</h2>
          <p>Unable to load collection information.</p>
        </div>
      </div>
    )
  }

  const layoutClass = isMobile ? 'mobile-layout' : isTablet ? 'tablet-layout' : 'desktop-layout'

  return (
    <div 
      data-testid="collection-overview"
      className={`collection-overview ${layoutClass} high-contrast-support`}
      role="main"
      aria-label="Property collection overview"
    >
      <CollectionHeader
        collection={collection}
        agent={agent}
        statistics={statistics}
        sessionProgress={sessionProgress}
        propertyCount={properties.length}
      />

      <CollectionStats
        statistics={statistics}
        isMobile={isMobile}
        expandedSummary={expandedSummary}
        onToggleExpanded={setExpandedSummary}
      />

      <PropertyCarousel
        properties={properties}
        isMobile={isMobile}
        isTablet={isTablet}
        onPropertySelect={onPropertySelect}
        loading={loading}
      />

      <ActionBar
        buckets={buckets}
        sessionProgress={sessionProgress}
        agent={agent}
        onContactAgent={onContactAgent}
        onHelpToggle={onHelpToggle}
        showHelp={showHelp}
      />

      <HelpOverlay
        isOpen={showHelp}
        onClose={onHelpToggle}
      />
    </div>
  )
}

export default CollectionOverview