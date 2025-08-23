'use client'

import Link from 'next/link'
import { AgentNavigation } from '@/components/shared/AgentNavigation'
import { useState } from 'react'
import { PropertyService, type Property } from '@/components/property'
import PropertyCard from '@/components/agent/PropertyCard'
import PropertyForm from '@/components/property/components/PropertyForm'
import LinkCreationModal from '@/components/agent/LinkCreationModal'
import { PropertyEditModal } from '@/components/property/components/PropertyEditModal'
import { LinkService } from '@/components/link'
import { useDashboardAnalytics } from '@/lib/query/useAnalyticsQuery'
import { usePropertiesQuery } from '@/lib/query/usePropertiesQuery'
import { useLinksQuery } from '@/lib/query/useLinksQuery'
import { ErrorBoundary } from '@/lib/errors/ErrorBoundary'
import { DashboardStats } from '@/components/dashboard/DashboardStats'
import { usePropertyDeletion } from '@/components/dashboard/PropertyDeletionHandler'

export default function AgentDashboard() {
  const [selectedProperties, setSelectedProperties] = useState<Set<string>>(new Set())
  const [showPropertyForm, setShowPropertyForm] = useState(false)
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [editingProperty, setEditingProperty] = useState<Property | null>(null)

  // Use React Query hooks for data fetching
  const { 
    data: analyticsData, 
    isLoading: analyticsLoading
  } = useDashboardAnalytics()
  
  const analytics = analyticsData as any
  
  const { 
    data: propertiesData, 
    isLoading: propertiesLoading,
    refetch: refetchProperties
  } = usePropertiesQuery()
  
  const { 
    data: linksData, 
    isLoading: linksLoading 
  } = useLinksQuery()

  const properties = propertiesData || []
  const links = linksData || []
  const loading = propertiesLoading || analyticsLoading

  // Property deletion handler
  const { handleDeleteProperty } = usePropertyDeletion(
    refetchProperties,
    (propertyId) => {
      const newSelection = new Set(selectedProperties)
      newSelection.delete(propertyId)
      setSelectedProperties(newSelection)
    },
    selectedProperties
  )

  const togglePropertySelection = (propertyId: string) => {
    const newSelection = new Set(selectedProperties)
    if (newSelection.has(propertyId)) {
      newSelection.delete(propertyId)
    } else {
      newSelection.add(propertyId)
    }
    setSelectedProperties(newSelection)
  }

  const handleAddProperty = () => {
    setShowPropertyForm(true)
  }

  const handlePropertyCreated = (newProperty: Property) => {
    refetchProperties()
    setShowPropertyForm(false)
  }

  const handleCancelPropertyForm = () => {
    setShowPropertyForm(false)
  }

  const handleCreateLink = () => {
    setShowLinkModal(true)
  }

  const handleModalCreateLink = async (propertyIds: string[], name?: string) => {
    try {
      const link = await LinkService.createLink(propertyIds, name)
      setSelectedProperties(new Set())
      return link
    } catch (error) {
      throw error
    }
  }

  const handleCloseModal = () => {
    setShowLinkModal(false)
  }

  const handleEditProperty = (property: Property) => {
    setEditingProperty(property)
  }

  const handleSaveProperty = (updatedProperty: Property) => {
    refetchProperties()
    setEditingProperty(null)
  }

  const handleCloseEditModal = () => {
    setEditingProperty(null)
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-gray-900">
                SwipeLink Estate
              </Link>
              <span className="ml-4 text-sm text-gray-500">Agent Properties</span>
            </div>
            <AgentNavigation />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <DashboardStats 
          analytics={analytics} 
          properties={properties} 
          links={links} 
        />

        {/* Actions Bar */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Properties</h2>
          <div className="flex space-x-4">
            {selectedProperties.size > 0 && (
              <>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-500 self-center">
                    {selectedProperties.size} selected
                  </span>
                  {selectedProperties.size >= 2 && selectedProperties.size <= 10 && (
                    <span data-testid="optimal-count-indicator" className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      Optimal range
                    </span>
                  )}
                </div>
                <button 
                  className={`${
                    selectedProperties.size >= 2 && selectedProperties.size <= 10 
                      ? 'btn-primary-enhanced' 
                      : 'btn-secondary'
                  }`} 
                  onClick={handleCreateLink}
                >
                  Create Link
                </button>
              </>
            )}
            <button className="btn-primary" onClick={handleAddProperty}>
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
            <button className="btn-primary" onClick={handleAddProperty}>Add Your First Property</button>
          </div>
        ) : (
          <div 
            data-testid="properties-grid"
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${
              showLinkModal ? 'modal-backdrop-blur' : ''
            }`}
          >
            {properties.map(property => (
              <PropertyCard
                key={property.id}
                property={property}
                selected={selectedProperties.has(property.id)}
                onClick={() => togglePropertySelection(property.id)}
                onEdit={handleEditProperty}
                onDelete={handleDeleteProperty}
                requireConfirmation={false}
              />
            ))}
          </div>
        )}

        {/* Property Form Modal */}
        {showPropertyForm && (
          <PropertyForm
            onPropertyCreated={handlePropertyCreated}
            onCancel={handleCancelPropertyForm}
          />
        )}

        {/* Link Creation Modal */}
        <LinkCreationModal
          isOpen={showLinkModal}
          onClose={handleCloseModal}
          selectedProperties={Array.from(selectedProperties).map(id => {
            const property = properties.find(p => p.id === id)
            return property ? {
              id: property.id,
              address: property.address,
              price: property.price,
              bedrooms: property.bedrooms,
              bathrooms: property.bathrooms
            } : null
          }).filter(Boolean) as any[]}
          onCreateLink={handleModalCreateLink}
        />

        {/* Property Edit Modal */}
        {editingProperty && (
          <PropertyEditModal
            property={editingProperty}
            isOpen={!!editingProperty}
            onClose={handleCloseEditModal}
            onSave={handleSaveProperty}
          />
        )}
      </main>
      </div>
    </ErrorBoundary>
  )
}