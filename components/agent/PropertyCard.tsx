'use client'

import Image from 'next/image'
import type { Property } from '@/lib/supabase/types'
import { formatPrice, formatBedsBaths, formatArea, formatShortAddress, formatFeatures } from '@/lib/utils/formatters'

interface PropertyCardProps {
  property: Property
  selected?: boolean
  onClick?: (property: Property) => void
  onEdit?: (property: Property) => void
}

export default function PropertyCard({ 
  property, 
  selected = false, 
  onClick, 
  onEdit 
}: PropertyCardProps) {
  const handleCardClick = () => {
    if (onClick) {
      onClick(property)
    }
  }

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onEdit) {
      onEdit(property)
    }
  }

  const getStatusColor = () => {
    switch (property.status) {
      case 'active':
        return 'bg-green-500'
      case 'pending':
        return 'bg-yellow-500'
      case 'sold':
        return 'bg-blue-500'
      case 'off-market':
        return 'bg-orange-500'
      default:
        return 'bg-gray-400'
    }
  }

  // Handle JSON fields from database
  const features = Array.isArray(property.features) 
    ? property.features as string[]
    : (property.features ? JSON.parse(property.features as string) : [])
  const images = Array.isArray(property.images)
    ? property.images as string[]
    : (property.images ? JSON.parse(property.images as string) : [])
    
  const displayFeatures = formatFeatures(features)
  const shortAddress = formatShortAddress(property.address)

  return (
    <div
      data-testid="property-card"
      onClick={handleCardClick}
      className={`
        bg-white rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer group
        ${selected ? 'ring-2 ring-primary-500' : ''}
        ${property.status === 'off-market' ? 'opacity-75' : ''}
      `}
    >
      {/* Image Section */}
      <div className="relative h-48 w-full">
        <Image
          src={property.cover_image || images[0] || '/images/properties/sample-1.jpg'}
          alt={property.address}
          fill
          className="object-cover rounded-t-xl"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {/* Status Indicator */}
        <div className="absolute top-3 left-3">
          <div
            data-testid="status-indicator"
            className={`w-3 h-3 rounded-full ${getStatusColor()}`}
            title={property.status}
          />
        </div>

        {/* Price Badge */}
        <div className="absolute top-3 right-3 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg px-3 py-1">
          <span className="font-bold text-gray-900">
            {formatPrice(property.price)}
          </span>
        </div>

        {/* Edit Button */}
        {onEdit && (
          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleEditClick}
              className="bg-primary-600 text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-primary-700 transition-colors"
            >
              Edit
            </button>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4">
        {/* Address */}
        <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-2">
          {shortAddress}
        </h3>

        {/* Property Details */}
        <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
          <span>{formatBedsBaths(property.bedrooms, property.bathrooms)}</span>
          <span>{formatArea(property.area_sqft)}</span>
        </div>

        {/* Features */}
        {displayFeatures.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {displayFeatures.slice(0, 3).map((feature, index) => (
              <span
                key={index}
                className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
              >
                {feature}
              </span>
            ))}
            {displayFeatures.length > 3 && (
              <span className="inline-block text-gray-500 text-xs px-2 py-1">
                +{displayFeatures.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Description Preview */}
        {property.description && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {property.description}
          </p>
        )}
      </div>
    </div>
  )
}