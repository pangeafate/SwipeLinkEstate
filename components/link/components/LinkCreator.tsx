'use client'

import React, { useState, useEffect } from 'react'
import { PropertyService } from '../../property'
import { LinkService } from '../link.service'
import PropertyCard from '../../agent/PropertyCard'
import type { Property } from '@/lib/supabase/types'
import type { Link } from '../types'

interface LinkCreatorProps {
  onLinkCreated: (link: Link) => void
  onCancel: () => void
}

type Step = 'properties' | 'details' | 'success'

const LinkCreator: React.FC<LinkCreatorProps> = ({ onLinkCreated, onCancel }) => {
  const [step, setStep] = useState<Step>('properties')
  const [properties, setProperties] = useState<Property[]>([])
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<string[]>([])
  const [linkName, setLinkName] = useState('')
  const [createdLink, setCreatedLink] = useState<Link | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copySuccess, setCopySuccess] = useState(false)

  // Load properties on mount
  useEffect(() => {
    const loadProperties = async () => {
      try {
        setLoading(true)
        const props = await PropertyService.getAllProperties()
        setProperties(props)
      } catch (err) {
        setError('Error loading properties. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadProperties()
  }, [])

  const handlePropertySelect = (property: Property) => {
    setSelectedPropertyIds(prev => 
      prev.includes(property.id)
        ? prev.filter(id => id !== property.id)
        : [...prev, property.id]
    )
  }

  const handleNext = () => {
    setStep('details')
  }

  const handleBack = () => {
    setStep('properties')
  }

  const handleCreateLink = async () => {
    try {
      setLoading(true)
      setError(null)
      const link = await LinkService.createLink(
        selectedPropertyIds,
        linkName || undefined
      )
      setCreatedLink(link)
      setStep('success')
      onLinkCreated(link)
    } catch (err) {
      setError('Failed to create link. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyLink = async () => {
    if (createdLink) {
      try {
        await LinkService.copyLinkUrl(createdLink.code)
        setCopySuccess(true)
        setTimeout(() => setCopySuccess(false), 2000)
      } catch (err) {
        setError('Failed to copy link')
      }
    }
  }

  const handleCreateAnother = () => {
    setStep('properties')
    setSelectedPropertyIds([])
    setLinkName('')
    setCreatedLink(null)
    setError(null)
    setCopySuccess(false)
  }

  const renderStep1 = () => (
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
                onClick={handlePropertySelect}
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
          onClick={handleNext}
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

  const renderStep2 = () => (
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
          onChange={(e) => setLinkName(e.target.value)}
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
          onClick={handleBack}
          className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors flex items-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back</span>
        </button>
        <button
          onClick={handleCreateLink}
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

  const renderStep3 = () => (
    <div>
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Link Created Successfully!</h2>
        <p className="text-gray-600">Your property collection is ready to share</p>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Shareable Link
          </label>
          <div className="flex">
            <input
              type="text"
              value={`${window.location.origin}/link/${createdLink?.code}`}
              readOnly
              className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg bg-white text-gray-900 font-mono text-sm"
            />
            <button
              onClick={handleCopyLink}
              className={`px-6 py-3 rounded-r-lg font-medium transition-colors ${
                copySuccess
                  ? 'bg-green-600 text-white'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {copySuccess ? (
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Copied!</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>Copy</span>
                </div>
              )}
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Link Code:</span>
            <div className="font-mono text-gray-900">{createdLink?.code}</div>
          </div>
          <div>
            <span className="font-medium text-gray-700">Properties:</span>
            <div className="text-gray-900">{selectedPropertyIds.length} selected</div>
          </div>
        </div>
      </div>
      
      <div className="text-center space-y-4">
        <button
          onClick={handleCreateAnother}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors inline-flex items-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Create Another Link</span>
        </button>
        
        <div className="text-sm text-gray-500">
          Share this link with clients via email, text, or any messaging platform
        </div>
      </div>
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-8">
        {step === 'properties' && renderStep1()}
        {step === 'details' && renderStep2()}
        {step === 'success' && renderStep3()}
      </div>
    </div>
  )
}

export default LinkCreator