import React from 'react'
import type { Property } from '@/lib/supabase/types'

interface LinkCustomizerProps {
  properties: Property[]
  selectedPropertyIds: string[]
  linkName: string
  loading: boolean
  error: string | null
  onLinkNameChange: (name: string) => void
  onBack: () => void
  onCreateLink: () => void
}

const LinkCustomizer: React.FC<LinkCustomizerProps> = ({
  properties,
  selectedPropertyIds,
  linkName,
  loading,
  error,
  onLinkNameChange,
  onBack,
  onCreateLink
}) => {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Link Details</h2>
        <p className="text-gray-600">Step 2: Customize your link</p>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-900 mb-2">Selected Properties</h3>
        <div className="text-sm text-blue-800 mb-3">
          {selectedPropertyIds.length} {selectedPropertyIds.length === 1 ? 'property' : 'properties'} in this collection
        </div>
        <div className="space-y-2">
          {properties
            .filter(p => selectedPropertyIds.includes(p.id))
            .map(property => (
              <div key={property.id} className="flex items-center space-x-3 bg-white rounded-md p-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{property.address}</div>
                  <div className="text-sm text-gray-500">
                    ${property.price?.toLocaleString()} • {property.bedrooms}bd, {property.bathrooms}ba
                  </div>
                </div>
              </div>
            ))
          }
        </div>
      </div>
      
      <div className="mb-6">
        <label htmlFor="linkName" className="block text-sm font-semibold text-gray-900 mb-2">
          Collection Name (Optional)
        </label>
        <input
          id="linkName"
          type="text"
          value={linkName}
          onChange={(e) => onLinkNameChange(e.target.value)}
          placeholder="e.g., Waterfront Collection, Downtown Condos"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        />
        <p className="text-sm text-gray-500 mt-1">
          Give your collection a memorable name to help clients understand the theme
        </p>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div className="text-red-700">{error}</div>
        </div>
      )}
      
      <div className="flex justify-between items-center pt-6 border-t border-gray-200">
        <button
          onClick={onBack}
          className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors flex items-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back</span>
        </button>
        <button
          onClick={onCreateLink}
          disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium transition-colors flex items-center space-x-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Creating...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <span>Create Link</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default LinkCustomizer