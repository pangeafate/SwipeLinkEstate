'use client'

import React from 'react'
import Image from 'next/image'
import { Property } from './types'

interface PropertyCardProps {
  property: Property
  onClick: () => void
  isLiked: boolean
  onLikeToggle: () => void
}

export default function PropertyCard({
  property,
  onClick,
  isLiked,
  onLikeToggle
}: PropertyCardProps) {
  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onLikeToggle()
  }

  return (
    <div
      className="airbnb-card cursor-pointer group"
      onClick={onClick}
      data-testid={`property-card-${property.id}`}
    >
      {/* Image Container */}
      <div className="airbnb-card-image relative" data-testid="property-card-image">
        <Image
          src={property.images[0] || '/placeholder-property.jpg'}
          alt={property.title}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        
        {/* Heart Icon */}
        <button
          onClick={handleLikeClick}
          className="airbnb-heart-button"
          aria-label={isLiked ? 'Remove from favorites' : 'Add to favorites'}
          data-testid="property-card-heart"
        >
          <svg
            className={`airbnb-heart-icon ${isLiked ? 'liked' : ''}`}
            viewBox="0 0 32 32"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M16 28c7-4.73 14-10 14-17a6.98 6.98 0 0 0-7-7c-1.8 0-3.58.68-4.95 2.05L16 8.1l-2.05-2.05a6.98 6.98 0 0 0-9.9 0A6.98 6.98 0 0 0 2 11c0 7 7 12.27 14 17z"/>
          </svg>
        </button>

        {/* Guest Favorite Badge (for highly rated properties) */}
        {property.price > 500000 && (
          <div className="airbnb-guest-favorite" data-testid="guest-favorite-badge">
            Guest favorite
          </div>
        )}
      </div>

      {/* Content */}
      <div className="airbnb-card-content" data-testid="property-card-content">
        <h3 className="airbnb-card-title">{property.title}</h3>
        <div className="airbnb-card-subtitle">
          {property.address}
        </div>
        <div className="airbnb-card-details">
          {property.bedrooms} bed · {property.bathrooms} bath · {property.sqft.toLocaleString()} sqft
        </div>
        <div className="airbnb-card-price">
          <span className="airbnb-card-price-amount">{property.priceFormatted}</span>
        </div>
      </div>
    </div>
  )
}