/**
 * PropertyCard Component
 * 
 * Mobile-first property card component for the client interface.
 * Displays property information in a compact, tappable format
 * with optional action buttons for bucket management.
 */

import React, { memo } from 'react'
import Image from 'next/image'
import type { Property, PropertyAction, BucketType } from './types'

interface PropertyCardProps {
  property: Property
  onActionClick: (propertyId: string, action: PropertyAction) => void
  onCardClick: (property: Property) => void
  showActions?: boolean
  loading?: boolean
  carouselIndex?: number
  totalCards?: number
  currentBucket?: BucketType
  className?: string
}

export const PropertyCard = memo<PropertyCardProps>(({
  property,
  onActionClick,
  onCardClick,
  showActions = false,
  loading = false,
  carouselIndex,
  totalCards,
  currentBucket,
  className = ''
}) => {
  // Handle card click
  const handleCardClick = () => {
    onCardClick(property)
  }

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onCardClick(property)
    }
  }

  // Handle action button click with event bubbling prevention
  const handleActionClick = (action: PropertyAction) => (event: React.MouseEvent) => {
    event.stopPropagation()
    event.preventDefault()
    onActionClick(property.id, action)
  }

  // Format price with proper comma separation
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  // Format square footage with comma separation
  const formatSquareFootage = (sqft: number): string => {
    return new Intl.NumberFormat('en-US').format(sqft)
  }

  // Get the main property image or fallback
  const getImageSrc = (): string => {
    return property.images && property.images.length > 0 
      ? property.images[0] 
      : 'https://via.placeholder.com/400x300/e5e7eb/9ca3af?text=Property+Image'
  }

  // Capitalize property type
  const formatPropertyType = (type?: string): string => {
    if (!type) return 'Property'
    return type.charAt(0).toUpperCase() + type.slice(1)
  }

  // Format features for display
  const formatFeature = (feature: string): string => {
    return feature.charAt(0).toUpperCase() + feature.slice(1).replace('_', ' ')
  }

  // Loading state
  if (loading) {
    return (
      <div 
        data-testid="property-card-skeleton"
        className="property-card w-full max-w-sm mx-auto bg-gray-200 animate-pulse rounded-lg overflow-hidden"
      >
        <div className="h-48 bg-gray-300" />
        <div className="p-4 space-y-3">
          <div className="h-4 bg-gray-300 rounded w-3/4" />
          <div className="h-4 bg-gray-300 rounded w-1/2" />
          <div className="flex space-x-2">
            <div className="h-3 bg-gray-300 rounded w-12" />
            <div className="h-3 bg-gray-300 rounded w-12" />
            <div className="h-3 bg-gray-300 rounded w-16" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <button
      className={`property-card w-full max-w-sm mx-auto bg-white rounded-lg shadow-md overflow-hidden transition-all duration-200 hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-95 ${className}`}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      aria-label={`Property card for ${property.address}, ${formatPrice(property.price)}`}
      tabIndex={0}
      role="button"
      style={{ minHeight: '200px' }}
    >
      {/* Property Image */}
      <div className="relative h-48 w-full">
        <Image
          src={getImageSrc()}
          alt={`Property at ${property.address}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {/* Property Type Badge */}
        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-gray-800">
          {formatPropertyType(property.property_type)}
        </div>

        {/* Carousel indicator (if applicable) */}
        {carouselIndex !== undefined && totalCards && (
          <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded-full text-xs">
            {carouselIndex + 1}/{totalCards}
          </div>
        )}
      </div>

      {/* Property Information */}
      <div className="p-4">
        {/* Price */}
        <div className="text-xl font-bold text-gray-900 mb-1">
          {formatPrice(property.price)}
        </div>

        {/* Address */}
        <div className="text-gray-600 text-sm mb-3 line-clamp-2">
          {property.address}
        </div>

        {/* Property Details */}
        <div className="flex items-center space-x-4 text-sm text-gray-700 mb-3">
          <span className="font-medium">{property.bedrooms} bd</span>
          <span className="font-medium">{property.bathrooms} ba</span>
          <span className="font-medium">{formatSquareFootage(property.area_sqft)} sq ft</span>
        </div>

        {/* Features */}
        {property.features && property.features.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {property.features.slice(0, 3).map((feature, index) => (
              <span
                key={index}
                className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium"
              >
                {formatFeature(feature)}
              </span>
            ))}
            {property.features.length > 3 && (
              <span className="inline-block text-gray-500 text-xs font-medium px-1">
                +{property.features.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        {showActions && (
          <div className="flex justify-between space-x-2 mt-4">
            <button
              className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 py-2 px-3 rounded-lg text-sm font-medium transition-colors min-h-[44px] flex items-center justify-center"
              onClick={handleActionClick('dislike')}
              aria-label="Dislike this property"
            >
              <span className="mr-1">👎</span>
              Dislike
            </button>
            
            <button
              className="flex-1 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 py-2 px-3 rounded-lg text-sm font-medium transition-colors min-h-[44px] flex items-center justify-center"
              onClick={handleActionClick('consider')}
              aria-label="Consider this property"
            >
              <span className="mr-1">🤔</span>
              Consider
            </button>
            
            <button
              className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 py-2 px-3 rounded-lg text-sm font-medium transition-colors min-h-[44px] flex items-center justify-center"
              onClick={handleActionClick('like')}
              aria-label="Like this property"
            >
              <span className="mr-1">👍</span>
              Like
            </button>
            
            <button
              className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 px-3 rounded-lg text-sm font-medium transition-colors min-h-[44px] flex items-center justify-center"
              onClick={handleActionClick('schedule_visit')}
              aria-label="Schedule visit for this property"
            >
              <span className="mr-1">📅</span>
              Visit
            </button>
          </div>
        )}
      </div>
    </button>
  )
})

PropertyCard.displayName = 'PropertyCard'

export default PropertyCard