/**
 * BucketManager Component (Refactored)
 * Main orchestrator for property bucket management
 */

import React, { useState, useCallback, useMemo } from 'react'
import { BucketNav } from './BucketNav'
import { BucketStatsDisplay } from './BucketStatsDisplay'
import { PropertyGrid } from './PropertyGrid'
import { BucketControls } from './BucketControls'
import { BucketActions } from './BucketActions'
import type { BucketManagerProps, BucketStats } from './types'
import { BucketType } from '../types'

export const BucketManager: React.FC<BucketManagerProps> = ({
  properties,
  buckets,
  bookedVisits,
  activeBucket = 'all',
  onBucketChange,
  onPropertySelect,
  onBookVisit,
  onClearBucket,
  loading = false
}) => {
  const [showClearConfirmation, setShowClearConfirmation] = useState<string | null>(null)
  const [showShareModal, setShowShareModal] = useState(false)
  const [sortBy, setSortBy] = useState<'price' | 'date' | 'location'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [dragging, setDragging] = useState<string | null>(null)

  // Get properties for active bucket
  const activeProperties = useMemo(() => {
    if (activeBucket === 'all') {
      return properties
    }
    const propertyIds = buckets[activeBucket as BucketType] || []
    return properties.filter(p => propertyIds.includes(p.id))
  }, [properties, buckets, activeBucket])

  // Calculate bucket statistics
  const bucketStats = useMemo((): BucketStats => {
    if (!activeProperties.length) {
      return {
        averagePrice: 0,
        propertyTypes: {},
        locations: [],
        commonFeatures: {}
      }
    }

    const averagePrice = activeProperties.reduce(
      (sum, p) => sum + p.price, 0
    ) / activeProperties.length
    
    const propertyTypes = activeProperties.reduce((acc, p) => {
      acc[p.property_type] = (acc[p.property_type] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const locations = activeProperties
      .map(p => p.address.split(',')[0])
      .slice(0, 5)
    
    const commonFeatures = activeProperties.reduce((acc, p) => {
      acc[`${p.bedrooms} bedrooms`] = (acc[`${p.bedrooms} bedrooms`] || 0) + 1
      acc[`${p.bathrooms} bathrooms`] = (acc[`${p.bathrooms} bathrooms`] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      averagePrice,
      propertyTypes,
      locations,
      commonFeatures
    }
  }, [activeProperties])

  // Handlers
  const handleBucketClick = useCallback((bucket: BucketType | 'all') => {
    onBucketChange(bucket)
  }, [onBucketChange])

  const handleClearBucket = useCallback((bucket: BucketType) => {
    setShowClearConfirmation(null)
    onClearBucket(bucket)
  }, [onClearBucket])

  const handleSortChange = useCallback((value: string) => {
    const [sortType, order] = value.split('-')
    setSortBy(sortType as 'price' | 'date' | 'location')
    setSortOrder(order as 'asc' | 'desc')
  }, [])

  const handleDragStart = useCallback((propertyId: string) => {
    setDragging(propertyId)
  }, [])

  const handleDragEnd = useCallback(() => {
    setDragging(null)
  }, [])

  const handleDropOnBucket = useCallback((bucket: BucketType, propertyId: string) => {
    onBucketChange(bucket, propertyId)
    setDragging(null)
  }, [onBucketChange])

  const handleDownload = useCallback(() => {
    window.print()
  }, [])

  const handleShare = useCallback(() => {
    setShowShareModal(true)
  }, [])

  const handleClearClick = useCallback(() => {
    setShowClearConfirmation(activeBucket as BucketType)
  }, [activeBucket])

  // Loading state
  if (loading) {
    return (
      <div data-testid="bucket-manager" className="bucket-manager">
        <div data-testid="bucket-loading-skeleton" className="loading-skeleton">
          <div className="skeleton-nav">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="skeleton-tab" />
            ))}
          </div>
          <div className="skeleton-content">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="skeleton-card" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      data-testid="bucket-manager" 
      className="bucket-manager"
      role="region"
      aria-label="Property bucket management"
    >
      <BucketNav
        activeBucket={activeBucket}
        buckets={buckets}
        propertyCount={properties.length}
        loading={loading}
        dragging={dragging}
        onBucketClick={handleBucketClick}
        onDropOnBucket={handleDropOnBucket}
      />

      <BucketStatsDisplay
        bucketStats={bucketStats}
        isVisible={activeProperties.length > 0 && activeBucket !== 'all'}
      />

      <BucketControls
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
      />

      <PropertyGrid
        properties={activeProperties}
        buckets={buckets}
        bookedVisits={bookedVisits}
        activeBucket={activeBucket}
        sortBy={sortBy}
        sortOrder={sortOrder}
        dragging={dragging}
        onPropertyClick={onPropertySelect}
        onBookVisit={onBookVisit}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      />

      <BucketActions
        hasProperties={activeProperties.length > 0}
        activeBucket={activeBucket}
        onDownload={handleDownload}
        onShare={handleShare}
        onClear={handleClearClick}
      />

      {/* Clear Bucket Confirmation Modal */}
      {showClearConfirmation && (
        <div data-testid="clear-bucket-confirmation" className="confirmation-modal">
          <div className="modal-content">
            <h3>Clear {showClearConfirmation} bucket?</h3>
            <p>This will remove all properties from this bucket. This action cannot be undone.</p>
            <div className="modal-actions">
              <button
                data-testid="confirm-clear-bucket"
                className="btn danger"
                onClick={() => handleClearBucket(showClearConfirmation as BucketType)}
              >
                Yes, Clear Bucket
              </button>
              <button
                className="btn secondary"
                onClick={() => setShowClearConfirmation(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div data-testid="share-bucket-modal" className="share-modal">
          <div className="modal-content">
            <h3>Share with Agent</h3>
            <p>Your selected properties will be shared with your agent for follow-up.</p>
            <div className="modal-actions">
              <button
                className="btn primary"
                onClick={() => setShowShareModal(false)}
              >
                Share Properties
              </button>
              <button
                className="btn secondary"
                onClick={() => setShowShareModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Screen Reader Live Region */}
      <div 
        data-testid="bucket-live-region"
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      >
        {activeBucket !== 'all' && 
          `Now viewing ${
            activeBucket === 'love' ? 'Liked' : 
            activeBucket === 'maybe' ? 'Considering' : 
            'Disliked'
          } bucket with ${activeProperties.length} properties`
        }
      </div>
    </div>
  )
}

export default BucketManager