'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { LinkService } from '@/components/link'
import { SwipeInterface, SwipeService, type PropertyCardData, type SwipeState } from '@/components/swipe'
import type { LinkWithProperties, Property } from '@/lib/supabase/types'

export default function ClientLinkPage() {
  const params = useParams()
  const linkCode = params.code as string
  
  const [linkData, setLinkData] = useState<LinkWithProperties | null>(null)
  const [sessionId, setSessionId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [swipeComplete, setSwipeComplete] = useState(false)
  const [finalState, setFinalState] = useState<SwipeState | null>(null)

  useEffect(() => {
    const initializeLinkAndSession = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Load link data
        const data = await LinkService.getLink(linkCode)
        setLinkData(data)
        
        // Initialize swipe session
        const session = await SwipeService.initializeSession(linkCode)
        setSessionId(session.id)
      } catch (err) {
        setError('Link not found or expired. Please check the link code and try again.')
      } finally {
        setLoading(false)
      }
    }

    if (linkCode) {
      initializeLinkAndSession()
    }
  }, [linkCode])

  // Convert Property type to PropertyCardData type  
  const convertToPropertyCardData = (property: Property): PropertyCardData => ({
    id: property.id,
    address: property.address,
    price: property.price || 0,
    bedrooms: property.bedrooms || 0,
    bathrooms: property.bathrooms || 0,
    area_sqft: property.area_sqft || undefined,
    cover_image: property.cover_image || undefined,
    images: property.images as string[] || undefined,
    features: property.features as string[] || undefined,
    property_type: 'house' // Default since not in database schema yet
  })

  const handleSwipeComplete = (finalSwipeState: SwipeState) => {
    setFinalState(finalSwipeState)
    setSwipeComplete(true)
  }

  const handleSwipe = (direction: string, propertyId: string) => {
    // Could add analytics tracking here
    console.log(`Swiped ${direction} on property ${propertyId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-primary-600 font-medium">Loading property collection...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-red-500 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Link Not Found</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <a href="/" className="btn-primary inline-block">
              Return to Homepage
            </a>
          </div>
        </div>
      </div>
    )
  }

  if (linkData?.properties && linkData.properties.length > 0 && sessionId && !swipeComplete) {
    const propertyCardData = linkData.properties.map(convertToPropertyCardData)
    
    return (
      <SwipeInterface
        properties={propertyCardData}
        sessionId={sessionId}
        onSwipeComplete={handleSwipeComplete}
        onSwipe={handleSwipe}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <a href="/" className="text-2xl font-bold text-gray-900">
              SwipeLink Estate
            </a>
            <div className="text-sm text-gray-500">
              Property Collection
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {swipeComplete && finalState ? (
          /* Completion Summary */
          <div className="text-center max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-6xl mb-6">🎉</div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Thanks for browsing!
              </h1>
              <p className="text-gray-600 mb-8">
                You've finished reviewing {linkData?.name || 'this property collection'}. 
                Here's a summary of your choices:
              </p>
              
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-green-50 rounded-xl">
                  <div className="text-3xl mb-2">❤️</div>
                  <div className="text-2xl font-bold text-green-600">{finalState.liked.length}</div>
                  <div className="text-sm text-gray-600">Liked</div>
                </div>
                <div className="text-center p-6 bg-yellow-50 rounded-xl">
                  <div className="text-3xl mb-2">🤔</div>
                  <div className="text-2xl font-bold text-yellow-600">{finalState.considering.length}</div>
                  <div className="text-sm text-gray-600">Considering</div>
                </div>
                <div className="text-center p-6 bg-red-50 rounded-xl">
                  <div className="text-3xl mb-2">❌</div>
                  <div className="text-2xl font-bold text-red-600">{finalState.disliked.length}</div>
                  <div className="text-sm text-gray-600">Passed</div>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-gray-600">
                  Your preferences have been saved. An agent will follow up with you soon 
                  about the properties you liked and are considering.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Browse Again
                  </button>
                  <a
                    href="/"
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Explore More Properties
                  </a>
                </div>
              </div>
            </div>
          </div>
        ) : linkData?.properties && linkData.properties.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2m-2 0H7m-2 0H5" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Properties Available</h3>
            <p className="text-gray-600">This property collection is currently empty.</p>
          </div>
        ) : (
          /* Loading/Initializing State */
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Preparing your property collection...</p>
          </div>
        )}
      </main>
    </div>
  )
}