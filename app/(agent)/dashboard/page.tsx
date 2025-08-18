'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { PropertyService, type Property } from '@/components/property'
import PropertyCard from '@/components/agent/PropertyCard'

export default function AgentDashboard() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProperties, setSelectedProperties] = useState<Set<string>>(new Set())

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

  const togglePropertySelection = (propertyId: string) => {
    const newSelection = new Set(selectedProperties)
    if (newSelection.has(propertyId)) {
      newSelection.delete(propertyId)
    } else {
      newSelection.add(propertyId)
    }
    setSelectedProperties(newSelection)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-gray-900">
                SwipeLink Estate
              </Link>
              <span className="ml-4 text-sm text-gray-500">Agent Dashboard</span>
            </div>
            <nav className="flex space-x-4">
              <Link 
                href="/dashboard" 
                className="text-gray-900 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Properties
              </Link>
              <Link 
                href="/links" 
                className="text-gray-500 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Links
              </Link>
              <Link 
                href="/analytics" 
                className="text-gray-500 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Analytics
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Total Properties</div>
            <div className="text-2xl font-bold text-gray-900">{properties.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Active Listings</div>
            <div className="text-2xl font-bold text-gray-900">
              {properties.filter(p => p.status === 'active').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Total Views</div>
            <div className="text-2xl font-bold text-gray-900">248</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Active Links</div>
            <div className="text-2xl font-bold text-gray-900">3</div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Properties</h2>
          <div className="flex space-x-4">
            {selectedProperties.size > 0 && (
              <>
                <span className="text-sm text-gray-500 self-center">
                  {selectedProperties.size} selected
                </span>
                <button className="btn-secondary">
                  Create Link
                </button>
              </>
            )}
            <button className="btn-primary">
              Add Property
            </button>
          </div>
        </div>

        {/* Properties Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-500">Loading properties...</div>
          </div>
        ) : properties.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-gray-500 mb-4">No properties found</div>
            <button className="btn-primary">Add Your First Property</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map(property => (
              <PropertyCard
                key={property.id}
                property={property}
                selected={selectedProperties.has(property.id)}
                onClick={() => togglePropertySelection(property.id)}
                onEdit={(property) => {
                  // Handle edit action
                  console.log('Edit property:', property.id)
                }}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}