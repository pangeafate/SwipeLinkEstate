'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { PropertyService, PropertyCard, type Property } from '@/components/property'

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)

  useEffect(() => {
    loadProperties()
  }, [])

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              SwipeLink Estate
            </Link>
            <nav className="flex space-x-4">
              <Link 
                href="/" 
                className="text-gray-500 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Home
              </Link>
              <Link 
                href="/properties" 
                className="text-gray-900 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Browse
              </Link>
              <Link 
                href="/dashboard" 
                className="text-gray-500 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Agent Portal
              </Link>
            </nav>
          </div>
        </div>
      </header>

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
        {/* Filter Bar */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <select className="input">
              <option>All Types</option>
              <option>Apartment</option>
              <option>House</option>
              <option>Condo</option>
            </select>
            <select className="input">
              <option>Any Price</option>
              <option>Under $500k</option>
              <option>$500k - $1M</option>
              <option>$1M - $2M</option>
              <option>Over $2M</option>
            </select>
            <select className="input">
              <option>Any Beds</option>
              <option>1+ bed</option>
              <option>2+ beds</option>
              <option>3+ beds</option>
              <option>4+ beds</option>
            </select>
            <button className="btn-primary">
              Apply Filters
            </button>
          </div>
        </div>

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
                  onClick={(p) => setSelectedProperty(p)}
                />
              </div>
            ))}
          </div>
        )}

        {/* Property Detail Modal (placeholder for now) */}
        {selectedProperty && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedProperty(null)}
          >
            <div 
              className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">{selectedProperty.address}</h2>
                <button 
                  onClick={() => setSelectedProperty(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <p className="text-gray-600 mb-4">{selectedProperty.description}</p>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <span className="text-gray-500">Price:</span>
                  <span className="ml-2 font-semibold">
                    ${selectedProperty.price?.toLocaleString() || 'Contact for price'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Bedrooms:</span>
                  <span className="ml-2 font-semibold">{selectedProperty.bedrooms || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Bathrooms:</span>
                  <span className="ml-2 font-semibold">{selectedProperty.bathrooms || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Size:</span>
                  <span className="ml-2 font-semibold">
                    {selectedProperty.area_sqft?.toLocaleString() || 'N/A'} sq ft
                  </span>
                </div>
              </div>
              <button className="btn-primary w-full">
                Schedule a Viewing
              </button>
            </div>
          </div>
        )}
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