/**
 * Property form fields component
 * Extracted from PropertyForm.tsx to maintain file size limits
 */
import React from 'react'
import { FormData, FieldErrors } from './PropertyFormTypes'

interface PropertyFormFieldsProps {
  formData: FormData
  fieldErrors: FieldErrors
  handleInputChange: (field: keyof FormData, value: string | number) => void
  handleFeaturesChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function PropertyFormFields({
  formData,
  fieldErrors,
  handleInputChange,
  handleFeaturesChange
}: PropertyFormFieldsProps) {
  return (
    <div className="space-y-6">
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
    </div>
  )
}