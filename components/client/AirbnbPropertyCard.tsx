import React from 'react'
import { Property, BucketType } from './types'

interface AirbnbPropertyCardProps {
  property: Property
  isActive?: boolean
  onPropertySelect: (property: Property) => void
  onBucketAssign?: (propertyId: string, bucket: BucketType) => void
  isVisible?: boolean
  showGuestFavorite?: boolean
}

/**
 * Airbnb-style Property Card Component
 * 
 * Matches exact Airbnb design:
 * - Square image with rounded corners
 * - White outlined heart icon top-right
 * - Guest favorite badge top-left (optional)
 * - Text content below image (not overlaid)
 * - No shadows on cards
 * - Clean, minimal design
 */
const AirbnbPropertyCard: React.FC<AirbnbPropertyCardProps> = ({
  property,
  isActive = false,
  onPropertySelect,
  onBucketAssign,
  isVisible = true,
  showGuestFavorite = false
}) => {
  const [isWishlisted, setIsWishlisted] = React.useState(false)

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsWishlisted(!isWishlisted)
    if (onBucketAssign) {
      onBucketAssign(property.id, isWishlisted ? 'pass' : 'like')
    }
  }

  // Extract city and state from address
  const getLocation = () => {
    const parts = property.address.split(',')
    if (parts.length >= 2) {
      const city = parts[parts.length - 2].trim()
      const state = parts[parts.length - 1].trim().split(' ')[0]
      return `${city}, ${state}`
    }
    return 'Miami, FL'
  }

  // Format price per night
  const getPricePerNight = () => {
    // Assuming monthly price, convert to nightly
    const nightlyPrice = Math.round((property.price || 0) / 30)
    return nightlyPrice
  }

  return (
    <div
      data-testid={`airbnb-property-card-${property.id}`}
      className="group cursor-pointer"
      onClick={() => onPropertySelect(property)}
      role="article"
      aria-label={`${property.bedrooms} bedroom property at ${property.address}`}
    >
      {/* Image Container - Square aspect ratio */}
      <div className="relative aspect-square mb-3 overflow-hidden rounded-xl bg-gray-200">
        {/* Property Image */}
        {property.images && property.images.length > 0 ? (
          <img
            src={property.images[0]}
            alt={property.address}
            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
            loading={isActive ? 'eager' : 'lazy'}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-200">
            <span className="text-4xl text-gray-400">🏠</span>
          </div>
        )}

        {/* Guest Favorite Badge - Top Left */}
        {showGuestFavorite && (
          <div className="absolute left-3 top-3">
            <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold shadow-sm">
              Guest favorite
            </div>
          </div>
        )}

        {/* Heart Icon - Top Right */}
        <button
          onClick={handleWishlistClick}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full transition-opacity hover:opacity-100"
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <svg
            viewBox="0 0 32 32"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            role="presentation"
            focusable="false"
            className="h-6 w-6"
            style={{
              fill: isWishlisted ? 'rgb(255, 56, 92)' : 'rgba(0, 0, 0, 0.5)',
              stroke: 'white',
              strokeWidth: 2,
              overflow: 'visible'
            }}
          >
            <path d="m16 28c7-4.733 14-10 14-17 0-1.792-.683-3.583-2.05-4.95-1.367-1.366-3.158-2.05-4.95-2.05-1.791 0-3.583.684-4.949 2.05l-2.051 2.051-2.05-2.051c-1.367-1.366-3.158-2.05-4.95-2.05-1.791 0-3.583.684-4.949 2.05-1.367 1.367-2.051 3.158-2.051 4.95 0 7 7 12.267 14 17z"></path>
          </svg>
        </button>

        {/* Photo dots indicator (for multiple photos) */}
        {property.images && property.images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
            {property.images.slice(0, 5).map((_, index) => (
              <div
                key={index}
                className={`h-1.5 w-1.5 rounded-full ${
                  index === 0 ? 'bg-white' : 'bg-white/60'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content Below Image */}
      <div className="space-y-1">
        {/* Location and Type */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-[15px] font-medium text-gray-900 line-clamp-1">
              {getLocation()}
            </h3>
            <p className="text-[15px] text-gray-500">
              Individual host
            </p>
            <p className="text-[15px] text-gray-500">
              {property.bedrooms} bed{property.bedrooms !== 1 ? 's' : ''} · {property.bathrooms} bath{property.bathrooms !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Price */}
        <div className="pt-1">
          <span className="text-[15px] font-semibold text-gray-900">
            ${getPricePerNight()}
          </span>
          <span className="text-[15px] text-gray-900"> night</span>
        </div>
      </div>
    </div>
  )
}

export default AirbnbPropertyCard