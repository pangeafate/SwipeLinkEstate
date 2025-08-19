'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import type { PropertyCardData } from '../types'

interface PropertySwipeCardProps {
  property: PropertyCardData
}

const PropertySwipeCard = React.memo(function PropertySwipeCard({ property }: PropertySwipeCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  
  const images = property.images || (property.cover_image ? [property.cover_image] : [])
  const hasMultipleImages = images.length > 1

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(price)
  }

  const formatArea = (area?: number): string | null => {
    if (!area) return null
    return new Intl.NumberFormat('en-US').format(area) + ' sq ft'
  }

  const nextImage = () => {
    if (hasMultipleImages) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length)
    }
  }

  const prevImage = () => {
    if (hasMultipleImages) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
    }
  }

  return (
    <div
      className="bg-white rounded-lg shadow-lg overflow-hidden h-full max-w-sm mx-auto"
      style={{ touchAction: 'pan-y pinch-zoom' }}
    >
      {/* Image Section */}
      <div className="relative h-64 bg-gray-200">
        {images.length > 0 ? (
          <>
            <Image
              src={images[currentImageIndex]}
              alt={`Property at ${property.address}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 400px"
            />
            
            {hasMultipleImages && (
              <>
                {/* Image Navigation - using tap areas instead of buttons to avoid interfering with swipe */}
                <div
                  onClick={prevImage}
                  className="absolute left-0 top-0 w-1/3 h-full z-10 cursor-pointer pressable"
                  aria-label="Previous image"
                />
                <div
                  onClick={nextImage}
                  className="absolute right-0 top-0 w-1/3 h-full z-10 cursor-pointer pressable"
                  aria-label="Next image"
                />
                
                {/* Visual indicators for tap areas */}
                <div className="absolute left-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <div className="bg-black bg-opacity-30 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                    ←
                  </div>
                </div>
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <div className="bg-black bg-opacity-30 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                    →
                  </div>
                </div>
                
                {/* Image Counter */}
                <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                  {currentImageIndex + 1} / {images.length}
                </div>
              </>
            )}
            
            {/* Property Type Badge */}
            <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded capitalize">
              {property.property_type}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-2">🏠</div>
              <div>No Image Available</div>
            </div>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4">
        {/* Price */}
        <div className="text-2xl font-bold text-gray-900 mb-2">
          {formatPrice(property.price)}
        </div>

        {/* Address */}
        <div className="text-gray-600 mb-3 text-sm line-clamp-2">
          {property.address}
        </div>

        {/* Property Details */}
        <div className="flex items-center space-x-4 mb-3 text-sm text-gray-700">
          <div className="flex items-center space-x-1">
            <span className="text-gray-500">🛏️</span>
            <span className="font-medium">{property.bedrooms}</span>
            <span>bed{property.bedrooms !== 1 ? 's' : ''}</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <span className="text-gray-500">🚿</span>
            <span className="font-medium">{property.bathrooms}</span>
            <span>bath{property.bathrooms !== 1 ? 's' : ''}</span>
          </div>
          
          {property.area_sqft && (
            <div className="flex items-center space-x-1">
              <span className="text-gray-500">📏</span>
              <span className="font-medium">{formatArea(property.area_sqft)}</span>
            </div>
          )}
        </div>

        {/* Features */}
        {property.features && property.features.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Features
            </div>
            <div className="flex flex-wrap gap-1">
              {property.features.slice(0, 6).map((feature, index) => (
                <span
                  key={index}
                  className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                >
                  {feature}
                </span>
              ))}
              {property.features.length > 6 && (
                <span className="inline-block bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded">
                  +{property.features.length - 6} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Swipe Instructions */}
      <div className="px-4 pb-4">
        <div className="text-xs text-gray-400 text-center">
          Swipe right to like • Swipe left to pass • Swipe down to consider
        </div>
      </div>
    </div>
  )
})

export default PropertySwipeCard