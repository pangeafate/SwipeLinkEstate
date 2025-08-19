'use client'

import React, { useState } from 'react'
import { PropertyService } from '@/components/property'
import type { Property, PropertyInsert } from '@/lib/supabase/types'

interface PropertyFormProps {
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

interface FieldErrors {
  address?: string
  price?: string
  bedrooms?: string
  bathrooms?: string
  area_sqft?: string
}

export default function PropertyForm({ onPropertyCreated, onCancel }: PropertyFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
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

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    // Clear field-specific error when user starts typing
    if (fieldErrors[field as keyof FieldErrors]) {
      setFieldErrors(prev => ({
        ...prev,
        [field]: undefined
      }))
    }
  }

  const handleFeaturesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const features = e.target.value.split(',').map(f => f.trim()).filter(f => f.length > 0)
    setFormData(prev => ({
      ...prev,
      features
    }))
  }

  const validateForm = (): boolean => {
    const errors: FieldErrors = {}
    let isValid = true

    // Address validation
    if (!formData.address?.trim()) {
      errors.address = 'Address is required'
      isValid = false
    }

    // Price validation
    if (!formData.price?.trim()) {
      errors.price = 'Price is required'
      isValid = false
    } else {
      const priceNum = parseFloat(formData.price)
      if (isNaN(priceNum)) {
        errors.price = 'Invalid price value'
        isValid = false
      } else if (priceNum <= 0) {
        errors.price = 'Price must be greater than 0'
        isValid = false
      }
    }

    // Bedrooms validation
    if (!formData.bedrooms?.trim()) {
      errors.bedrooms = 'Number of bedrooms is required'
      isValid = false
    } else {
      const bedroomsNum = parseInt(formData.bedrooms)
      if (isNaN(bedroomsNum)) {
        errors.bedrooms = 'Invalid number of bedrooms'
        isValid = false
      } else if (bedroomsNum !== parseFloat(formData.bedrooms)) {
        errors.bedrooms = 'Bedrooms must be a whole number'
        isValid = false
      } else if (bedroomsNum <= 0) {
        errors.bedrooms = 'Property must have at least 1 bedroom'
        isValid = false
      }
    }

    // Bathrooms validation
    if (!formData.bathrooms?.trim()) {
      errors.bathrooms = 'Number of bathrooms is required'
      isValid = false
    } else {
      const bathroomsNum = parseFloat(formData.bathrooms)
      if (isNaN(bathroomsNum)) {
        errors.bathrooms = 'Invalid number of bathrooms'
        isValid = false
      } else if (bathroomsNum <= 0) {
        errors.bathrooms = 'Property must have at least 1 bathroom'
        isValid = false
      }
    }

    // Area validation (optional but if provided, must be valid)
    if (formData.area_sqft?.trim()) {
      const areaNum = parseInt(formData.area_sqft)
      if (isNaN(areaNum) || areaNum <= 0) {
        errors.area_sqft = 'Area must be a positive number'
        isValid = false
      }
    }

    setFieldErrors(errors)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setFieldErrors({})

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      // Convert form data to proper types with safe parsing
      const propertyData: PropertyInsert = {
        address: formData.address.trim(),
        price: parseFloat(formData.price),
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseFloat(formData.bathrooms),
        area_sqft: formData.area_sqft?.trim() ? parseInt(formData.area_sqft) : null,
        description: formData.description?.trim() || null,
        features: formData.features.length > 0 ? formData.features : null,
        status: 'active'
      }

      const newProperty = await PropertyService.createProperty(propertyData)
      onPropertyCreated(newProperty)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create property')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Add New Property</h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div role="alert" className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <div className="text-red-700">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Address */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Address *
              </label>
              <input
                id="address"
                type="text"
                required
                value={formData.address || ''}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  fieldErrors.address ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="123 Main Street, Miami Beach, FL 33139"
                aria-invalid={!!fieldErrors.address}
                aria-describedby={fieldErrors.address ? 'address-error' : undefined}
              />
              {fieldErrors.address && (
                <div id="address-error" role="alert" className="mt-1 text-sm text-red-600">
                  {fieldErrors.address}
                </div>
              )}
            </div>

            {/* Price */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Price *
              </label>
              <input
                id="price"
                type="text"
                required
                value={formData.price || ''}
                onChange={(e) => handleInputChange('price', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  fieldErrors.price ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="850000"
                aria-invalid={!!fieldErrors.price}
                aria-describedby={fieldErrors.price ? 'price-error' : undefined}
              />
              {fieldErrors.price && (
                <div id="price-error" role="alert" className="mt-1 text-sm text-red-600">
                  {fieldErrors.price}
                </div>
              )}
            </div>

            {/* Bedrooms, Bathrooms, Area */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700 mb-1">
                  Bedrooms *
                </label>
                <input
                  id="bedrooms"
                  type="text"
                  required
                  value={formData.bedrooms || ''}
                  onChange={(e) => handleInputChange('bedrooms', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    fieldErrors.bedrooms ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="3"
                  aria-invalid={!!fieldErrors.bedrooms}
                  aria-describedby={fieldErrors.bedrooms ? 'bedrooms-error' : undefined}
                />
                {fieldErrors.bedrooms && (
                  <div id="bedrooms-error" role="alert" className="mt-1 text-sm text-red-600">
                    {fieldErrors.bedrooms}
                  </div>
                )}
              </div>
              <div>
                <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700 mb-1">
                  Bathrooms *
                </label>
                <input
                  id="bathrooms"
                  type="text"
                  required
                  value={formData.bathrooms || ''}
                  onChange={(e) => handleInputChange('bathrooms', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    fieldErrors.bathrooms ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="2.5"
                  aria-invalid={!!fieldErrors.bathrooms}
                  aria-describedby={fieldErrors.bathrooms ? 'bathrooms-error' : undefined}
                />
                {fieldErrors.bathrooms && (
                  <div id="bathrooms-error" role="alert" className="mt-1 text-sm text-red-600">
                    {fieldErrors.bathrooms}
                  </div>
                )}
              </div>
              <div>
                <label htmlFor="area_sqft" className="block text-sm font-medium text-gray-700 mb-1">
                  Area (sq ft)
                </label>
                <input
                  id="area_sqft"
                  type="text"
                  value={formData.area_sqft || ''}
                  onChange={(e) => handleInputChange('area_sqft', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    fieldErrors.area_sqft ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="1200"
                  aria-invalid={!!fieldErrors.area_sqft}
                  aria-describedby={fieldErrors.area_sqft ? 'area-error' : undefined}
                />
                {fieldErrors.area_sqft && (
                  <div id="area-error" role="alert" className="mt-1 text-sm text-red-600">
                    {fieldErrors.area_sqft}
                  </div>
                )}
              </div>
            </div>

            {/* Features */}
            <div>
              <label htmlFor="features" className="block text-sm font-medium text-gray-700 mb-1">
                Features
              </label>
              <input
                id="features"
                type="text"
                value={formData.features?.join(', ') || ''}
                onChange={handleFeaturesChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Pool, Garage, Ocean View, Modern Kitchen (separate with commas)"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Beautiful property with stunning views..."
              />
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 font-medium flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Add Property</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}