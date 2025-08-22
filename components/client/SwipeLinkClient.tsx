import React, { useEffect, useState, useCallback } from 'react'
import PropertyCarousel from './PropertyCarousel'
import PropertyModal from './PropertyModal'
import BucketNavigation from './BucketNavigation'
import { Property, BucketType } from './types'
import { useBucketStore, useBucketCounts, useCurrentBucket, useBucketProperties } from '../../stores/bucketStore'

interface SwipeLinkClientProps {
  linkCode: string
  properties: Property[]
  onAnalyticsEvent?: (event: string, data?: any) => void
  className?: string
}

const SwipeLinkClient: React.FC<SwipeLinkClientProps> = ({
  linkCode,
  properties,
  onAnalyticsEvent,
  className = ''
}) => {
  // Zustand store hooks
  const bucketCounts = useBucketCounts()
  const { currentBucket, setCurrentBucket } = useCurrentBucket()
  const { properties: currentBucketProperties } = useBucketProperties(currentBucket)
  const initializeWithProperties = useBucketStore(state => state.initializeWithProperties)
  const moveProperty = useBucketStore(state => state.moveProperty)
  const getPropertiesForBucket = useBucketStore(state => state.getPropertiesForBucket)
  const getPropertyFromCache = useBucketStore(state => state.getPropertyFromCache)
  
  // Local UI state
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  
  // Initialize bucket store with properties
  useEffect(() => {
    if (properties.length > 0) {
      setLoading(true)
      initializeWithProperties(properties)
      setLoading(false)
      
      // Analytics event
      onAnalyticsEvent?.('client_initialized', {
        linkCode,
        propertyCount: properties.length
      })
    }
  }, [properties, linkCode, initializeWithProperties, onAnalyticsEvent])

  // Get current displayable properties based on selected bucket
  const getDisplayProperties = useCallback(() => {
    if (currentBucket === 'new_properties') {
      // For new properties, use the original properties array
      return properties.filter(property => {
        const propertyIds = getPropertiesForBucket('new_properties')
        return propertyIds.includes(property.id)
      })
    } else {
      // For other buckets, get from cache
      const propertyIds = getPropertiesForBucket(currentBucket)
      return propertyIds.map(id => getPropertyFromCache(id)).filter(Boolean) as Property[]
    }
  }, [currentBucket, properties, getPropertiesForBucket, getPropertyFromCache])

  const displayProperties = getDisplayProperties()

  // Reset current index when bucket changes
  useEffect(() => {
    setCurrentIndex(0)
  }, [currentBucket])

  // Ensure current index is within bounds
  useEffect(() => {
    if (displayProperties.length > 0 && currentIndex >= displayProperties.length) {
      setCurrentIndex(Math.max(0, displayProperties.length - 1))
    }
  }, [displayProperties.length, currentIndex])

  // Handle property selection (open modal)
  const handlePropertySelect = useCallback((property: Property) => {
    setSelectedProperty(property)
    setIsModalOpen(true)
    
    onAnalyticsEvent?.('property_modal_opened', {
      propertyId: property.id,
      bucket: currentBucket
    })
  }, [currentBucket, onAnalyticsEvent])

  // Handle bucket assignment from property cards
  const handleBucketAssign = useCallback((propertyId: string, bucket: BucketType) => {
    const property = properties.find(p => p.id === propertyId) || getPropertyFromCache(propertyId)
    if (property) {
      moveProperty(propertyId, bucket, property)
      
      onAnalyticsEvent?.('property_moved_to_bucket', {
        propertyId,
        bucket,
        fromBucket: currentBucket
      })
    }
  }, [properties, getPropertyFromCache, moveProperty, currentBucket, onAnalyticsEvent])

  // Handle carousel navigation
  const handleCarouselNavigate = useCallback((index: number) => {
    setCurrentIndex(index)
    
    if (displayProperties[index]) {
      onAnalyticsEvent?.('carousel_navigated', {
        propertyId: displayProperties[index].id,
        index,
        bucket: currentBucket
      })
    }
  }, [displayProperties, currentBucket, onAnalyticsEvent])

  // Handle bucket navigation
  const handleBucketChange = useCallback((bucket: BucketType) => {
    setCurrentBucket(bucket)
    
    onAnalyticsEvent?.('bucket_changed', {
      newBucket: bucket,
      previousBucket: currentBucket
    })
  }, [setCurrentBucket, currentBucket, onAnalyticsEvent])

  // Handle modal close
  const handleModalClose = useCallback(() => {
    setIsModalOpen(false)
    setSelectedProperty(null)
    
    onAnalyticsEvent?.('property_modal_closed', {
      propertyId: selectedProperty?.id
    })
  }, [selectedProperty, onAnalyticsEvent])

  // Handle bucket assignment from modal
  const handleModalBucketAssign = useCallback((propertyId: string, bucket: BucketType) => {
    handleBucketAssign(propertyId, bucket)
    // Close modal after assignment for better UX
    handleModalClose()
  }, [handleBucketAssign, handleModalClose])

  // Get bucket assignments for property cards
  const getSelectedBuckets = useCallback(() => {
    const assignments: Record<string, BucketType> = {}
    
    // Check all buckets to find where each property is assigned
    Object.entries({
      new_properties: getPropertiesForBucket('new_properties'),
      liked: getPropertiesForBucket('liked'),
      disliked: getPropertiesForBucket('disliked'),
      considering: getPropertiesForBucket('considering'),
      schedule_visit: getPropertiesForBucket('schedule_visit')
    }).forEach(([bucket, propertyIds]) => {
      propertyIds.forEach(propertyId => {
        assignments[propertyId] = bucket as BucketType
      })
    })
    
    return assignments
  }, [getPropertiesForBucket])

  const selectedBuckets = getSelectedBuckets()

  // Empty state when no properties in current bucket
  if (!loading && displayProperties.length === 0) {
    return (
      <div className={`swipelink-client ${className}`}>
        <div className="flex flex-col items-center justify-center min-h-[400px] px-4">
          <div className="text-center">
            <div className="text-6xl mb-4">
              {currentBucket === 'new_properties' ? '🏠' : 
               currentBucket === 'liked' ? '❤️' : 
               currentBucket === 'disliked' ? '👎' : 
               currentBucket === 'considering' ? '🤔' : '📅'}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Properties Yet
            </h3>
            <p className="text-gray-600 mb-6">
              {currentBucket === 'new_properties' 
                ? 'New properties will appear here when available.'
                : `You haven't added any properties to your ${currentBucket.replace('_', ' ')} list yet.`
              }
            </p>
            {currentBucket !== 'new_properties' && (
              <button
                onClick={() => handleBucketChange('new_properties')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Browse Properties
              </button>
            )}
          </div>
        </div>
        
        {/* Always show navigation */}
        <BucketNavigation
          currentBucket={currentBucket}
          bucketCounts={bucketCounts}
          onBucketChange={handleBucketChange}
        />
      </div>
    )
  }

  return (
    <div className={`swipelink-client min-h-screen bg-gray-50 ${className}`}>
      {/* Main content area */}
      <div className="pb-20 md:pb-8">
        {/* Header with current bucket info */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {currentBucket === 'new_properties' ? 'New Properties' :
                 currentBucket === 'liked' ? 'Liked Properties' :
                 currentBucket === 'disliked' ? 'Disliked Properties' :
                 currentBucket === 'considering' ? 'Considering' :
                 'Schedule Visit'}
              </h2>
              <p className="text-sm text-gray-600">
                {displayProperties.length} {displayProperties.length === 1 ? 'property' : 'properties'}
              </p>
            </div>
            <div className="text-sm text-gray-500">
              Link: {linkCode}
            </div>
          </div>
        </div>

        {/* Property Carousel */}
        <div className="p-4">
          <PropertyCarousel
            properties={displayProperties}
            currentIndex={currentIndex}
            onNavigate={handleCarouselNavigate}
            onPropertySelect={handlePropertySelect}
            onBucketAssign={handleBucketAssign}
            selectedBuckets={selectedBuckets}
            loading={loading}
          />
        </div>
      </div>

      {/* Property Modal */}
      {selectedProperty && (
        <PropertyModal
          property={selectedProperty}
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onBucketAssign={handleModalBucketAssign}
          currentBucket={selectedBuckets[selectedProperty.id]}
        />
      )}

      {/* Bucket Navigation */}
      <BucketNavigation
        currentBucket={currentBucket}
        bucketCounts={bucketCounts}
        onBucketChange={handleBucketChange}
      />
    </div>
  )
}

export default SwipeLinkClient