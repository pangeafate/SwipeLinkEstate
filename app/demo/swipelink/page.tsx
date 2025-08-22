/**
 * SwipeLink Demo Page
 * 
 * Integration demo showcasing the complete mobile-first property browsing experience
 * with 4-property carousel view and 5-bucket organization system
 * Now loads real data from Supabase!
 */

'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { PropertyCarousel } from '@/components/client/NewPropertyCarousel'
import { PropertyModal } from '@/components/client/NewPropertyModal'
import { BucketNavigation } from '@/components/client/BucketNavigation'
import { useBucketStore } from '@/stores/bucketStore'
import { LinkService } from '@/components/link/link.service'
import type { Property, PropertyAction, BucketType } from '@/components/client/types'

// Demo link code - this would normally come from URL params
const DEMO_LINK_CODE = 'km3yBlCT'

export default function SwipeLinkDemoPage() {
  // State management
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [properties, setProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
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

  // Load properties from Supabase
  useEffect(() => {
    const loadLinkData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Fetch link with properties
        const linkData = await LinkService.getLink(DEMO_LINK_CODE)
        
        // Convert Supabase properties to our Property type
        const loadedProperties: Property[] = linkData.properties.map((p: any) => ({
          id: p.id,
          address: p.address || 'Unknown Address',
          price: p.price || 0,
          bedrooms: p.bedrooms || 0,
          bathrooms: p.bathrooms || 0,
          area_sqft: p.area_sqft || 0,
          property_type: p.property_type || 'house',
          images: Array.isArray(p.images) ? p.images : p.images ? [p.images] : ['/images/properties/sample-1.jpg'],
          features: Array.isArray(p.features) ? p.features : [],
          description: p.description || 'No description available',
          status: p.status || 'active',
          created_at: p.created_at || new Date().toISOString(),
          updated_at: p.updated_at || new Date().toISOString()
        }))
        
        setProperties(loadedProperties)
        initializeWithProperties(loadedProperties)
      } catch (err) {
        console.error('Failed to load link data:', err)
        setError('Failed to load properties. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    loadLinkData()
  }, [initializeWithProperties])

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
  }, [])

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
    }

    // Close modal after action
    if (isModalOpen) {
      setIsModalOpen(false)
      setSelectedProperty(null)
    }
  }, [moveProperty, isModalOpen, properties])

  // Handle bucket change
  const handleBucketChange = useCallback((bucket: BucketType) => {
    setCurrentBucket(bucket)
  }, [setCurrentBucket])

  // Handle modal close
  const handleModalClose = useCallback(() => {
    setIsModalOpen(false)
    setSelectedProperty(null)
  }, [])

  const bucketCounts = getBucketCounts()
  const visibleProperties = getCurrentBucketProperties()

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading properties...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Properties</h2>
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  // No properties state
  if (!properties.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-yellow-800 mb-2">No Properties Available</h2>
            <p className="text-yellow-600">This link doesn't contain any properties.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">SwipeLink Demo</h1>
          <p className="text-sm text-gray-600 mt-1">
            Mobile-first property browsing with {properties.length} properties from Supabase
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-col h-[calc(100vh-140px)]">
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