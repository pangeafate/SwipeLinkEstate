import React from 'react'
import PropertyCard from '../../agent/PropertyCard'
import type { Property } from '@/lib/supabase/types'

interface PropertySelectorProps {
  properties: Property[]
  selectedPropertyIds: string[]
  loading: boolean
  error: string | null
  onPropertySelect: (property: Property) => void
  onNext: () => void
  onCancel: () => void
}

const PropertySelector: React.FC<PropertySelectorProps> = ({
  properties,
  selectedPropertyIds,
  loading,
  error,
  onPropertySelect,
  onNext,
  onCancel
}) => {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Property Link</h2>
        <p className="text-gray-600">Step 1: Select Properties</p>
      </div>
      
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading properties...</span>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div className="text-red-700">{error}</div>
        </div>
      )}
      
      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {properties.map(property => (
              <PropertyCard
                key={property.id}
                property={property}
                selected={selectedPropertyIds.includes(property.id)}
                onClick={onPropertySelect}
              />
            ))}
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                <span className="font-medium text-gray-900">
                  {selectedPropertyIds.length} {selectedPropertyIds.length === 1 ? 'property' : 'properties'} selected
                </span>
              </div>
              {selectedPropertyIds.length > 0 && (
                <div className="text-sm text-gray-600">
                  Ready to create link
                </div>
              )}
            </div>
          </div>
        </>
      )}
      
      <div className="flex justify-between items-center pt-6 border-t border-gray-200">
        <button
          onClick={onCancel}
          className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onNext}
          disabled={selectedPropertyIds.length === 0}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium transition-colors flex items-center space-x-2"
        >
          <span>Next</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default PropertySelector