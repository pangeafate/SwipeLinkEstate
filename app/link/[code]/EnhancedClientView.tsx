/**
 * Enhanced Client Link View - Airbnb-Style Implementation
 * 
 * Mobile-first property browsing experience with:
 * - 4-property carousel view (2x2 grid on mobile)
 * - 5-bucket organization system
 * - Property modal with action buttons
 * - Real-time state management with Zustand
 */

'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { PropertyCarousel } from '@/components/client/NewPropertyCarousel'
import { PropertyModal } from '@/components/client/NewPropertyModal'  
import { BucketNavigation } from '@/components/client/BucketNavigation'
import { useBucketStore } from '@/stores/bucketStore'
import type { Property, PropertyAction, BucketType } from '@/components/client/types'
import { ErrorBoundary } from '@/lib/errors/ErrorBoundary'
import { useSessionTracking } from './hooks/useSessionTracking'

interface EnhancedClientViewProps {
  linkCode: string
  properties: Property[]
  agentInfo?: {
    name: string
    email: string
    phone?: string
    company?: string
    photo?: string
  }
  collectionInfo?: {
    name: string
    description?: string
    createdAt: Date
  }
}

function EnhancedClientViewComponent({
  linkCode,
  properties,
  agentInfo,
  collectionInfo
}: EnhancedClientViewProps) {
  // State management
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // Bucket store
  const {
    currentBucket,
    setCurrentBucket,
    moveProperty,
    getBucketCounts,
    getPropertiesForBucket,
    propertiesCache,
    initializeWithProperties
  } = useBucketStore()

  // Session tracking
  const { trackEvent, sessionId } = useSessionTracking(linkCode)

  // Initialize properties in cache on mount
  useEffect(() => {
    if (properties && properties.length > 0) {
      initializeWithProperties(properties)
      trackEvent({
        type: 'link_opened',
        data: { 
          linkCode, 
          propertyCount: properties.length,
          sessionId 
        }
      })
    }
  }, [properties, linkCode, sessionId, initializeWithProperties, trackEvent])

  // Get properties for current bucket
  const getCurrentBucketProperties = useCallback(() => {
    if (currentBucket === 'new_properties') {
      // Show all properties that aren't in other buckets
      const assignedProperties = new Set([
        ...getPropertiesForBucket('liked'),
        ...getPropertiesForBucket('disliked'),
        ...getPropertiesForBucket('considering'),
        ...getPropertiesForBucket('schedule_visit')
      ])
      
      return properties.filter(p => !assignedProperties.has(p.id))
    }
    
    // Get properties for specific bucket
    const propertyIds = getPropertiesForBucket(currentBucket)
    return propertyIds
      .map(id => propertiesCache[id] || properties.find(p => p.id === id))
      .filter(Boolean) as Property[]
  }, [currentBucket, getPropertiesForBucket, propertiesCache, properties])

  // Handle property card click
  const handleCardClick = useCallback((property: Property) => {
    setSelectedProperty(property)
    setIsModalOpen(true)
    trackEvent({
      type: 'property_viewed',
      data: { propertyId: property.id }
    })
  }, [trackEvent])

  // Handle property action
  const handleActionClick = useCallback((propertyId: string, action: PropertyAction) => {
    const property = properties.find(p => p.id === propertyId)
    if (!property) return

    // Map action to bucket
    const actionToBucket: Record<PropertyAction, BucketType> = {
      like: 'liked',
      dislike: 'disliked', 
      consider: 'considering',
      schedule_visit: 'schedule_visit'
    }

    const targetBucket = actionToBucket[action]
    if (targetBucket) {
      moveProperty(propertyId, targetBucket, property)
      trackEvent({
        type: 'bucket_assign',
        data: { propertyId, bucket: targetBucket, action }
      })
    }

    // Close modal after action
    if (isModalOpen) {
      setIsModalOpen(false)
      setSelectedProperty(null)
    }
  }, [properties, moveProperty, trackEvent, isModalOpen])

  // Handle bucket change
  const handleBucketChange = useCallback((bucket: BucketType) => {
    setCurrentBucket(bucket)
    trackEvent({
      type: 'bucket_switch',
      data: { bucket }
    })
  }, [setCurrentBucket, trackEvent])

  // Handle modal close
  const handleModalClose = useCallback(() => {
    setIsModalOpen(false)
    setSelectedProperty(null)
  }, [])

  const bucketCounts = getBucketCounts()
  const visibleProperties = getCurrentBucketProperties()

  // Handle empty state
  if (!properties || properties.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="text-6xl mb-4">🏠</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No Properties Available
          </h2>
          <p className="text-gray-600">
            This collection doesn't contain any properties yet.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with collection info */}
      {collectionInfo && (
        <header className="bg-white shadow-sm border-b px-4 py-3">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-lg font-semibold text-gray-900">
              {collectionInfo.name}
            </h1>
            {agentInfo && (
              <p className="text-sm text-gray-600">
                by {agentInfo.name}
              </p>
            )}
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="flex flex-col h-[calc(100vh-80px)]">
        {/* Property Carousel */}
        <div className="flex-1 overflow-hidden">
          <PropertyCarousel
            properties={visibleProperties}
            onActionClick={handleActionClick}
            onCardClick={handleCardClick}
            showActions={false}
            currentBucket={currentBucket}
            bucketCounts={bucketCounts}
            showNavigation={true}
            className="h-full"
          />
        </div>

        {/* Bucket Navigation */}
        <div className="bg-white border-t">
          <BucketNavigation
            currentBucket={currentBucket}
            onBucketChange={handleBucketChange}
            bucketCounts={bucketCounts}
          />
        </div>
      </main>

      {/* Property Modal */}
      {selectedProperty && (
        <PropertyModal
          isOpen={isModalOpen}
          property={selectedProperty}
          onActionClick={handleActionClick}
          onClose={handleModalClose}
          currentBucket={currentBucket}
        />
      )}
    </div>
  )
}

export default function EnhancedClientView(props: EnhancedClientViewProps) {
  return (
    <ErrorBoundary>
      <EnhancedClientViewComponent {...props} />
    </ErrorBoundary>
  )
}