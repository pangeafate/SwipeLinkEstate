'use client'

/**
 * Properties Browse Page
 * Main page for browsing all available properties
 * 
 * Architecture Notes:
 * - Client-side rendered for interactive filtering
 * - Tracks anonymous browsing sessions
 * - Components extracted for maintainability
 */

import { useState, useEffect } from 'react'
import { PropertyService, PropertyCard, type Property } from '@/components/property'
import { AnalyticsService } from '@/lib/analytics/analytics.service'
import { PropertiesHeader } from './PropertiesHeader'
import { PropertiesFilterBar } from './PropertiesFilterBar'
import { PropertyDetailModal } from './PropertyDetailModal'

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [sessionId] = useState(() => AnalyticsService.generateSessionId())

  useEffect(() => {
    loadProperties()
    
    // Initialize anonymous browsing session
    AnalyticsService.createSession({
      sessionId,
      deviceInfo: AnalyticsService.getDeviceInfo()
    }).catch(error => console.error('Failed to create session:', error))
  }, [sessionId])

  // Update session activity periodically
  useEffect(() => {
    const interval = setInterval(() => {
      AnalyticsService.updateSessionActivity(sessionId)
        .catch(error => console.error('Failed to update session activity:', error))
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [sessionId])

  const loadProperties = async () => {
    try {
      const data = await PropertyService.getAllProperties()
      setProperties(data)
    } catch (error) {
      console.error('Error loading properties:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePropertyClick = (property: Property) => {
    setSelectedProperty(property)
    // Track property view when modal opens
    AnalyticsService.trackView({
      propertyId: property.id,
      sessionId,
      metadata: {
        viewType: 'detail_modal',
        source: 'properties_page',
        timestamp: new Date().toISOString()
      }
    }).catch(error => console.error('Failed to track property view:', error))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PropertiesHeader />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-50 to-primary-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Discover Your Dream Property
          </h1>
          <p className="text-lg text-gray-600">
            Browse through our curated collection of premium properties in Miami Beach
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PropertiesFilterBar />

        {/* Results Count */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {loading ? 'Loading...' : `${properties.length} Properties Available`}
          </h2>
          <select className="input w-auto">
            <option>Sort by: Newest</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
            <option>Size: Largest</option>
          </select>
        </div>

        {/* Properties Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse">
              <div className="text-gray-500">Loading amazing properties...</div>
            </div>
          </div>
        ) : properties.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-gray-500 mb-4">No properties match your criteria</div>
            <button className="btn-secondary">Reset Filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map(property => (
              <div key={property.id} className="transform hover:scale-105 transition-transform duration-200">
                <PropertyCard
                  property={property}
                  onClick={handlePropertyClick}
                />
              </div>
            ))}
          </div>
        )}

        <PropertyDetailModal 
          property={selectedProperty} 
          onClose={() => setSelectedProperty(null)} 
        />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            © 2024 SwipeLink Estate. Built with Next.js & Supabase.
          </p>
        </div>
      </footer>
    </div>
  )
}