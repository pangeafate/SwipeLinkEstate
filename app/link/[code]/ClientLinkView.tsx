'use client'

/**
 * Client Component for Link View
 * Handles client-side interactions and state management
 * 
 * Architecture Notes:
 * - Receives hydrated data from server component
 * - Manages swipe session and interactions
 * - Delegates to specialized components and hooks
 * - Handles loading, error, and completion states
 */

import { useState, useCallback, useMemo, useEffect } from 'react'
import { PropertyCarousel, PropertyModal, CollectionOverview, BucketManager, VisitBooking } from '@/components/client'
import { useSwipeSession } from './hooks/useSwipeSession'
import { CompletionView } from './components/CompletionView'
import { ErrorView } from './components/ErrorView'
import { LoadingView } from './components/LoadingView'
import { EmptyView } from './components/EmptyView'
import type { LinkWithProperties } from '@/lib/supabase/types'
import type { Property as ClientProperty, BucketType } from '@/components/client/types'
import type { Property } from '@/lib/supabase/types'

interface ClientLinkViewProps {
  linkCode: string
  initialLinkData: LinkWithProperties | null
  initialError: string | null
  sessionId: string
}

export default function ClientLinkView({
  linkCode,
  initialLinkData,
  initialError,
  sessionId
}: ClientLinkViewProps) {
  // State management
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedProperty, setSelectedProperty] = useState<ClientProperty | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [buckets, setBuckets] = useState<Record<string, BucketType>>({})
  const [completedReview, setCompletedReview] = useState(false)
  
  // New state for advanced components
  const [currentView, setCurrentView] = useState<'carousel' | 'overview' | 'buckets' | 'completion'>('carousel')
  const [showVisitBooking, setShowVisitBooking] = useState(false)
  const [selectedVisitProperty, setSelectedVisitProperty] = useState<ClientProperty | null>(null)
  const [bookedVisits, setBookedVisits] = useState<Array<{ propertyId: string; date: string; time: string }>>([])
  const [showHelp, setShowHelp] = useState(false)
  
  // Use custom hook for session management
  const { loading, error } = useSwipeSession({
    linkData: initialLinkData,
    sessionId,
    completedReview,
    currentIndex,
    buckets
  })

  // Mock agent data (in real app, this would come from initialLinkData)
  const mockAgent = useMemo(() => ({
    id: 'agent-1',
    name: 'Sarah Johnson',
    phone: '(305) 555-0123',
    email: 'sarah.johnson@realestate.com',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612e2d3?w=150&h=150&fit=crop&crop=face',
    company: 'Miami Real Estate Group',
    license: 'FL-RE-987654321'
  }), [])

  // Mock collection data
  const mockCollection = useMemo(() => ({
    id: initialLinkData?.id || 'collection-1',
    title: initialLinkData?.name || 'Curated Miami Beach Properties',
    description: 'Hand-picked luxury properties in prime Miami Beach locations',
    agentId: mockAgent.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }), [initialLinkData, mockAgent.id])

  // Session progress tracking
  const sessionProgress = useMemo(() => ({
    propertiesViewed: Math.max(currentIndex + 1, Object.keys(buckets).length),
    totalProperties: initialLinkData?.properties?.length || 0,
    timeSpent: 0, // Would be calculated from session start
    startedAt: new Date().toISOString()
  }), [currentIndex, buckets, initialLinkData])

  // Mock available time slots for visit booking
  const mockTimeSlots = useMemo(() => {
    const slots = []
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(tomorrow)
      date.setDate(date.getDate() + i)
      const dateStr = date.toISOString().split('T')[0]
      
      // Add morning and afternoon slots
      slots.push(
        { date: dateStr, time: '10:00 AM', available: true },
        { date: dateStr, time: '11:00 AM', available: true },
        { date: dateStr, time: '2:00 PM', available: i % 2 === 0 }, // Some unavailable
        { date: dateStr, time: '3:00 PM', available: true }
      )
    }
    return slots
  }, [])
  
  // Convert Property type to ClientProperty type
  const convertToClientProperty = useCallback((property: Property): ClientProperty => {
    const prop = property as any
    return {
      id: prop.id,
      address: prop.address,
      price: prop.price || 0,
      bedrooms: prop.bedrooms || 0,
      bathrooms: prop.bathrooms || 0,
      area_sqft: prop.area_sqft || 0,
      images: (prop.images as string[]) || [],
      features: (prop.features as string[]) || [],
      description: prop.description || '',
      property_type: prop.property_type || 'house',
      year_built: prop.year_built,
      lot_size: prop.lot_size,
      garage_spaces: prop.garage_spaces,
      neighborhood: prop.neighborhood || '',
      school_district: prop.school_district || '',
      latitude: prop.latitude,
      longitude: prop.longitude
    }
  }, [])
  
  // Navigation handlers
  const handleNavigate = useCallback((direction: 'prev' | 'next') => {
    if (!initialLinkData?.properties) return
    
    if (direction === 'next' && currentIndex < initialLinkData.properties.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else if (direction === 'prev' && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    } else if (direction === 'next' && currentIndex === initialLinkData.properties.length - 1) {
      setCompletedReview(true)
    }
  }, [currentIndex, initialLinkData])
  
  const handleIndexNavigate = useCallback((newIndex: number) => {
    if (!initialLinkData?.properties) return
    
    if (newIndex >= 0 && newIndex < initialLinkData.properties.length) {
      setCurrentIndex(newIndex)
    } else if (newIndex >= initialLinkData.properties.length) {
      setCompletedReview(true)
    }
  }, [initialLinkData])
  
  // Bucket assignment handler
  const handleBucketAssign = useCallback((propertyId: string, bucket: BucketType) => {
    setBuckets(prev => ({ ...prev, [propertyId]: bucket }))
    // Auto-advance after assignment
    setTimeout(() => handleIndexNavigate(currentIndex + 1), 300)
  }, [handleIndexNavigate, currentIndex])
  
  // Modal handlers
  const handleOpenModal = useCallback((property: ClientProperty) => {
    setSelectedProperty(property)
    setIsModalOpen(true)
  }, [])
  
  // Enhanced visit booking handler
  const handleBookVisit = useCallback((property: ClientProperty) => {
    setSelectedVisitProperty(property)
    setShowVisitBooking(true)
  }, [])

  const handleVisitBookingSubmit = useCallback((booking: any) => {
    // Add to booked visits
    setBookedVisits(prev => [...prev, {
      propertyId: booking.propertyId,
      date: booking.date,
      time: booking.time
    }])
    
    // Close booking modal
    setShowVisitBooking(false)
    setSelectedVisitProperty(null)
    
    console.log('Visit booked:', booking)
  }, [])

  // View navigation handlers
  const handleShowOverview = useCallback(() => {
    setCurrentView('overview')
  }, [])

  const handleShowBuckets = useCallback(() => {
    setCurrentView('buckets')
  }, [])

  const handleBackToCarousel = useCallback(() => {
    setCurrentView('carousel')
  }, [])

  // Bucket management handlers
  const handleBucketChange = useCallback((bucket: BucketType | 'all', propertyId?: string) => {
    if (bucket === 'all') {
      setCurrentView('buckets')
    } else if (propertyId) {
      setBuckets(prev => ({ ...prev, [propertyId]: bucket }))
    }
  }, [])

  const handleClearBucket = useCallback((bucket: BucketType) => {
    setBuckets(prev => {
      const newBuckets = { ...prev }
      Object.keys(newBuckets).forEach(propertyId => {
        if (newBuckets[propertyId] === bucket) {
          delete newBuckets[propertyId]
        }
      })
      return newBuckets
    })
  }, [])

  const handleContactAgent = useCallback((agent: any) => {
    // Open contact modal or redirect to contact form
    window.open(`mailto:${agent.email}?subject=Property Inquiry - ${linkCode}`, '_blank')
  }, [])
  
  // Loading state
  if (loading) {
    return <LoadingView />
  }
  
  // Error state (initial error or session error)
  const displayError = initialError || error
  if (displayError) {
    return <ErrorView error={displayError} />
  }
  
  // Completion state
  if (completedReview && initialLinkData) {
    return (
      <CompletionView
        linkName={initialLinkData.name || 'Property Collection'}
        buckets={buckets}
        onBrowseAgain={() => window.location.reload()}
      />
    )
  }
  
  // Empty state
  if (!initialLinkData?.properties || initialLinkData.properties.length === 0) {
    return <EmptyView />
  }

  const clientProperties = initialLinkData.properties.map(convertToClientProperty)

  // Prepare bucket data for components
  const bucketData = {
    love: Object.keys(buckets).filter(id => buckets[id] === 'love'),
    maybe: Object.keys(buckets).filter(id => buckets[id] === 'maybe'),
    pass: Object.keys(buckets).filter(id => buckets[id] === 'pass')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      {/* Navigation Bar */}
      <div className="sticky top-0 z-50 bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">
                {mockCollection.title}
              </h1>
              <span className="text-sm text-gray-500">
                {sessionProgress.propertiesViewed}/{sessionProgress.totalProperties} viewed
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleShowOverview}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  currentView === 'overview'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Overview
              </button>
              
              <button
                onClick={handleShowBuckets}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  currentView === 'buckets'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                My Lists ({Object.keys(buckets).length})
              </button>
              
              <button
                onClick={handleBackToCarousel}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  currentView === 'carousel'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Browse
              </button>
              
              <button
                onClick={() => setShowHelp(!showHelp)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                ❓
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Collection Overview */}
        {currentView === 'overview' && (
          <CollectionOverview
            collection={mockCollection}
            agent={mockAgent}
            properties={clientProperties}
            buckets={bucketData}
            sessionProgress={sessionProgress}
            onPropertySelect={handleOpenModal}
            onBucketChange={handleBucketChange}
            onContactAgent={handleContactAgent}
            onHelpToggle={() => setShowHelp(!showHelp)}
            loading={loading}
            showHelp={showHelp}
            error={error}
          />
        )}

        {/* Bucket Manager */}
        {currentView === 'buckets' && (
          <BucketManager
            properties={clientProperties}
            buckets={{ ...bucketData, all: clientProperties.map(p => p.id) }}
            bookedVisits={bookedVisits}
            onBucketChange={handleBucketChange}
            onPropertySelect={handleOpenModal}
            onBookVisit={handleBookVisit}
            onClearBucket={handleClearBucket}
            loading={loading}
          />
        )}

        {/* Property Carousel */}
        {currentView === 'carousel' && (
          <PropertyCarousel
            properties={clientProperties}
            currentIndex={currentIndex}
            onNavigate={handleIndexNavigate}
            onPropertySelect={handleOpenModal}
            onBucketAssign={handleBucketAssign}
            selectedBuckets={buckets}
            loading={loading}
          />
        )}
      </div>

      {/* Property Modal */}
      {selectedProperty && (
        <PropertyModal
          property={selectedProperty}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onNavigate={handleNavigate}
          onBucketAssign={(bucket) => handleBucketAssign(selectedProperty.id, bucket)}
          selectedBucket={buckets[selectedProperty.id]}
          canNavigatePrev={currentIndex > 0}
          canNavigateNext={currentIndex < clientProperties.length - 1}
          onBookVisit={() => handleBookVisit(selectedProperty)}
        />
      )}

      {/* Visit Booking Modal */}
      {showVisitBooking && selectedVisitProperty && (
        <VisitBooking
          property={selectedVisitProperty}
          agent={mockAgent}
          availableSlots={mockTimeSlots}
          likedProperties={clientProperties.filter(p => buckets[p.id] === 'love')}
          enableMultiPropertyBooking={true}
          isOpen={showVisitBooking}
          onSubmit={handleVisitBookingSubmit}
          onCancel={() => {
            setShowVisitBooking(false)
            setSelectedVisitProperty(null)
          }}
          loading={loading}
        />
      )}
    </div>
  )
}