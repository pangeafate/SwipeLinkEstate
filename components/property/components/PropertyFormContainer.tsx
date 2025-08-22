/**
 * Property form container component
 * Main component that handles state and coordinates sub-components
 * Extracted from PropertyForm.tsx to maintain file size limits
 */
'use client'

import React, { useState } from 'react'
import { PropertyService } from '@/components/property'
import type { Property, PropertyInsert } from '@/lib/supabase/types'
import { FormData, FieldErrors, PropertyFormProps } from './PropertyFormTypes'
import { validatePropertyForm } from './PropertyFormValidation'
import { PropertyFormFields } from './PropertyFormFields'
import { PropertyFormActions } from './PropertyFormActions'

export function PropertyFormContainer({ onPropertyCreated, onCancel }: PropertyFormProps) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setFieldErrors({})

    const { isValid, errors } = validatePropertyForm(formData)
    if (!isValid) {
      setFieldErrors(errors)
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

          <form onSubmit={handleSubmit}>
            <PropertyFormFields
              formData={formData}
              fieldErrors={fieldErrors}
              handleInputChange={handleInputChange}
              handleFeaturesChange={handleFeaturesChange}
            />
            <PropertyFormActions loading={loading} onCancel={onCancel} />
          </form>
        </div>
      </div>
    </div>
  )
}