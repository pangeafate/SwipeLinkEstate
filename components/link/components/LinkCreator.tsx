'use client'

import React, { useState, useEffect } from 'react'
import { PropertyService } from '../../property'
import { LinkService } from '../link.service'
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

  const handlePropertySelect = (propertyId: string) => {
    setSelectedPropertyIds(prev => 
      prev.includes(propertyId)
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
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
        await navigator.clipboard.writeText(`${window.location.origin}/link/${createdLink.code}`)
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
      <h2 className="text-xl font-semibold mb-4">Create Property Link</h2>
      <h3 className="text-lg mb-4">Step 1: Select Properties</h3>
      
      {loading && <div>Loading properties...</div>}
      {error && <div className="text-red-500 mb-4">{error}</div>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {properties.map(property => (
          <div
            key={property.id}
            data-testid={`property-card-${property.id}`}
            className={`p-4 border rounded cursor-pointer ${
              selectedPropertyIds.includes(property.id) 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => handlePropertySelect(property.id)}
          >
            <h4 className="font-medium">{property.address}</h4>
            <p className="text-sm text-gray-600">${property.price?.toLocaleString()}</p>
            <p className="text-sm text-gray-600">
              {property.bedrooms}bd, {property.bathrooms}ba, {property.area_sqft} sqft
            </p>
          </div>
        ))}
      </div>
      
      <div className="flex justify-between items-center">
        <span>{selectedPropertyIds.length} {selectedPropertyIds.length === 1 ? 'property' : 'properties'} selected</span>
        <div className="space-x-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleNext}
            disabled={selectedPropertyIds.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div>
      <h3 className="text-lg mb-4">Step 2: Link Details</h3>
      
      <div className="mb-4">
        <span className="text-sm text-gray-600">
          {selectedPropertyIds.length} {selectedPropertyIds.length === 1 ? 'property' : 'properties'} selected
        </span>
        <div className="mt-2 space-y-2">
          {properties
            .filter(p => selectedPropertyIds.includes(p.id))
            .map(property => (
              <div key={property.id} className="text-sm">
                {property.address}
              </div>
            ))
          }
        </div>
      </div>
      
      <div className="mb-4">
        <label htmlFor="linkName" className="block text-sm font-medium mb-2">
          Link Name (Optional)
        </label>
        <input
          id="linkName"
          type="text"
          value={linkName}
          onChange={(e) => setLinkName(e.target.value)}
          placeholder="e.g., Waterfront Collection"
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
      
      {error && <div className="text-red-500 mb-4">{error}</div>}
      
      <div className="flex justify-between">
        <button
          onClick={handleBack}
          className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
        >
          Back
        </button>
        <button
          onClick={handleCreateLink}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300"
        >
          {loading ? 'Creating...' : 'Create Link'}
        </button>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div>
      <h3 className="text-lg mb-4">Step 3: Link Created!</h3>
      
      <div className="mb-4">
        <p className="mb-2">Your link has been created successfully!</p>
        <input
          type="text"
          value={`${window.location.origin}/link/${createdLink?.code}`}
          readOnly
          className="w-full p-2 border border-gray-300 rounded bg-gray-50"
        />
      </div>
      
      <div className="flex space-x-2 mb-4">
        <button
          onClick={handleCopyLink}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          {copySuccess ? 'Copied!' : 'Copy Link'}
        </button>
        <button
          onClick={handleCreateAnother}
          className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
        >
          Create Another
        </button>
      </div>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto p-6">
      {step === 'properties' && renderStep1()}
      {step === 'details' && renderStep2()}
      {step === 'success' && renderStep3()}
    </div>
  )
}

export default LinkCreator