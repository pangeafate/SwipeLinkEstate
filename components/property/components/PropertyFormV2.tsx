'use client'

import React, { useState } from 'react'
import { PropertyService } from '@/components/property'
import FormInput from './FormInput'
import usePropertyValidation from './hooks/usePropertyValidation'
import type { Property, PropertyInsert } from '@/lib/supabase/types'

interface PropertyFormV2Props {
  onPropertyCreated: (property: Property) => void
  onCancel: () => void
}

interface FormData {
  address: string
  price: string
  bedrooms: string
  bathrooms: string
  area_sqft: string
  description: string
  features: string[]
  status: string
}

export default function PropertyFormV2({ onPropertyCreated, onCancel }: PropertyFormV2Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { errors: fieldErrors, validateField, validateAll, clearErrors } = usePropertyValidation()
  
  const [formData, setFormData] = useState<FormData>({
    address: '',
    price: '',
    bedrooms: '',
    bathrooms: '',
    area_sqft: '',
    description: '',
    features: [],
    status: 'active'
  })

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Validate field on change
    validateField(field as any, value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate all fields and get immediate result
    const isValid = validateAll({
      address: formData.address,
      price: formData.price,
      bedrooms: formData.bedrooms,
      bathrooms: formData.bathrooms,
      area_sqft: formData.area_sqft
    })

    if (!isValid) {
      return
    }
    
    await submitForm()
  }

  const submitForm = async () => {
    setLoading(true)

    try {
      const propertyData: PropertyInsert = {
        address: formData.address,
        price: parseFloat(formData.price),
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseFloat(formData.bathrooms),
        area_sqft: formData.area_sqft ? parseInt(formData.area_sqft) : null,
        description: formData.description || null,
        features: formData.features,
        status: formData.status as 'active' | 'sold' | 'pending'
      }

      const property = await PropertyService.createProperty(propertyData)
      onPropertyCreated(property)
    } catch (err) {
      setError('Failed to create property. Please try again.')
      console.error('Property creation error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Add New Property</h2>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700"
          aria-label="Close form"
        >
          ✕
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <FormInput
          id="address"
          label="Property Address"
          value={formData.address}
          onChange={(value) => handleInputChange('address', value)}
          error={fieldErrors.address}
          required={true}
          placeholder="123 Main Street, Miami Beach, FL 33139"
        />

        <FormInput
          id="price"
          label="Price"
          value={formData.price}
          onChange={(value) => handleInputChange('price', value)}
          error={fieldErrors.price}
          required={true}
          placeholder="850000"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormInput
            id="bedrooms"
            label="Bedrooms"
            value={formData.bedrooms}
            onChange={(value) => handleInputChange('bedrooms', value)}
            error={fieldErrors.bedrooms}
            required={true}
            placeholder="3"
          />

          <FormInput
            id="bathrooms"
            label="Bathrooms"
            value={formData.bathrooms}
            onChange={(value) => handleInputChange('bathrooms', value)}
            error={fieldErrors.bathrooms}
            required={true}
            placeholder="2.5"
          />

          <FormInput
            id="area_sqft"
            label="Area (sq ft)"
            value={formData.area_sqft}
            onChange={(value) => handleInputChange('area_sqft', value)}
            error={fieldErrors.area_sqft}
            placeholder="1500"
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Property'}
          </button>
        </div>
      </form>
    </div>
  )
}