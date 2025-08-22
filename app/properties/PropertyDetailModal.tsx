/**
 * Property Detail Modal Component
 * Shows property details in a modal overlay
 */

import type { Property } from '@/components/property'

interface PropertyDetailModalProps {
  property: Property | null
  onClose: () => void
}

export function PropertyDetailModal({ property, onClose }: PropertyDetailModalProps) {
  if (!property) return null
  
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold">{property.address}</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        <p className="text-gray-600 mb-4">{property.description}</p>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <span className="text-gray-500">Price:</span>
            <span className="ml-2 font-semibold">
              ${property.price?.toLocaleString() || 'Contact for price'}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Bedrooms:</span>
            <span className="ml-2 font-semibold">{property.bedrooms || 'N/A'}</span>
          </div>
          <div>
            <span className="text-gray-500">Bathrooms:</span>
            <span className="ml-2 font-semibold">{property.bathrooms || 'N/A'}</span>
          </div>
          <div>
            <span className="text-gray-500">Size:</span>
            <span className="ml-2 font-semibold">
              {property.area_sqft?.toLocaleString() || 'N/A'} sq ft
            </span>
          </div>
        </div>
        <button className="btn-primary w-full">
          Schedule a Viewing
        </button>
      </div>
    </div>
  )
}