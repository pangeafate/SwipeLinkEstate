'use client'

/**
 * PropertyEditModal Component
 * Modal for editing property details
 */

import React, { useState, useEffect } from 'react'
import { PropertyService } from '../property.service'
import { Property } from '../types/property.types'

interface PropertyEditModalProps {
  property: Property
  isOpen: boolean
  onClose: () => void
  onSave: (updatedProperty: Property) => void
}

export function PropertyEditModal({ property, isOpen, onClose, onSave }: PropertyEditModalProps) {
  const [formData, setFormData] = useState({
    address: property.address,
    city: property.city,
    state: property.state,
    zipCode: property.zipCode,
    price: property.price,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    sqft: property.sqft,
    type: property.type,
    description: property.description || ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [saveError, setSaveError] = useState('')

  // Reset form when property changes
  useEffect(() => {
    setFormData({
      address: property.address,
      city: property.city,
      state: property.state,
      zipCode: property.zipCode,
      price: property.price,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      sqft: property.sqft,
      type: property.type,
      description: property.description || ''
    })
    setErrors({})
    setSaveError('')
  }, [property])

  if (!isOpen) return null

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required'
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required'
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required'
    }

    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'ZIP code is required'
    }

    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'Price must be a positive number'
    }

    if (!formData.bedrooms || formData.bedrooms < 0) {
      newErrors.bedrooms = 'Bedrooms must be 0 or greater'
    }

    if (!formData.bathrooms || formData.bathrooms < 0) {
      newErrors.bathrooms = 'Bathrooms must be 0 or greater'
    }

    if (!formData.sqft || formData.sqft <= 0) {
      newErrors.sqft = 'Square footage must be a positive number'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setSaveError('')

    try {
      const result = await PropertyService.updateProperty(property.id, formData)
      
      if (result) {
        onSave(result)
        onClose()
      } else {
        setSaveError('Failed to update property')
      }
    } catch (error: any) {
      setSaveError(error.message || 'Failed to update property')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }))
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      data-testid="modal-backdrop"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Edit Property</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <input
                id="address"
                name="address"
                type="text"
                value={formData.address}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm ${
                  errors.address ? 'border-red-300' : 'border-gray-300'
                } focus:border-blue-500 focus:ring-blue-500`}
                aria-label="Address"
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-600">{errors.address}</p>
              )}
            </div>

            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                City
              </label>
              <input
                id="city"
                name="city"
                type="text"
                value={formData.city}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm ${
                  errors.city ? 'border-red-300' : 'border-gray-300'
                } focus:border-blue-500 focus:ring-blue-500`}
                aria-label="City"
              />
              {errors.city && (
                <p className="mt-1 text-sm text-red-600">{errors.city}</p>
              )}
            </div>

            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                State
              </label>
              <input
                id="state"
                name="state"
                type="text"
                value={formData.state}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm ${
                  errors.state ? 'border-red-300' : 'border-gray-300'
                } focus:border-blue-500 focus:ring-blue-500`}
                aria-label="State"
              />
              {errors.state && (
                <p className="mt-1 text-sm text-red-600">{errors.state}</p>
              )}
            </div>

            <div>
              <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
                ZIP Code
              </label>
              <input
                id="zipCode"
                name="zipCode"
                type="text"
                value={formData.zipCode}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm ${
                  errors.zipCode ? 'border-red-300' : 'border-gray-300'
                } focus:border-blue-500 focus:ring-blue-500`}
                aria-label="ZIP Code"
              />
              {errors.zipCode && (
                <p className="mt-1 text-sm text-red-600">{errors.zipCode}</p>
              )}
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                Price
              </label>
              <input
                id="price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm ${
                  errors.price ? 'border-red-300' : 'border-gray-300'
                } focus:border-blue-500 focus:ring-blue-500`}
                aria-label="Price"
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price}</p>
              )}
            </div>

            <div>
              <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700">
                Bedrooms
              </label>
              <input
                id="bedrooms"
                name="bedrooms"
                type="number"
                value={formData.bedrooms}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm ${
                  errors.bedrooms ? 'border-red-300' : 'border-gray-300'
                } focus:border-blue-500 focus:ring-blue-500`}
                aria-label="Bedrooms"
              />
              {errors.bedrooms && (
                <p className="mt-1 text-sm text-red-600">{errors.bedrooms}</p>
              )}
            </div>

            <div>
              <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700">
                Bathrooms
              </label>
              <input
                id="bathrooms"
                name="bathrooms"
                type="number"
                step="0.5"
                value={formData.bathrooms}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm ${
                  errors.bathrooms ? 'border-red-300' : 'border-gray-300'
                } focus:border-blue-500 focus:ring-blue-500`}
                aria-label="Bathrooms"
              />
              {errors.bathrooms && (
                <p className="mt-1 text-sm text-red-600">{errors.bathrooms}</p>
              )}
            </div>

            <div>
              <label htmlFor="sqft" className="block text-sm font-medium text-gray-700">
                Square Feet
              </label>
              <input
                id="sqft"
                name="sqft"
                type="number"
                value={formData.sqft}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm ${
                  errors.sqft ? 'border-red-300' : 'border-gray-300'
                } focus:border-blue-500 focus:ring-blue-500`}
                aria-label="Square Feet"
              />
              {errors.sqft && (
                <p className="mt-1 text-sm text-red-600">{errors.sqft}</p>
              )}
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                Property Type
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                aria-label="Property Type"
              >
                <option value="house">House</option>
                <option value="apartment">Apartment</option>
                <option value="condo">Condo</option>
                <option value="townhouse">Townhouse</option>
                <option value="land">Land</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                aria-label="Description"
              />
            </div>
          </div>

          {saveError && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{saveError}</p>
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`px-4 py-2 rounded-md text-white ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}