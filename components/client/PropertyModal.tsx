import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Property, BucketType } from './types'

interface PropertyModalProps {
  property: Property | null
  isOpen: boolean
  onClose: () => void
  onNavigate: (direction: 'prev' | 'next') => void
  onBucketAssign: (propertyId: string, bucket: BucketType) => void
  selectedBucket: BucketType | null
  canNavigatePrev: boolean
  canNavigateNext: boolean
  onBookVisit: (propertyId: string) => void
}

const PropertyModal: React.FC<PropertyModalProps> = ({
  property,
  isOpen,
  onClose,
  onNavigate,
  onBucketAssign,
  selectedBucket,
  canNavigatePrev,
  canNavigateNext,
  onBookVisit
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [mapExpanded, setMapExpanded] = useState(false)
  const [mapLoading, setMapLoading] = useState(true)
  const [imageError, setImageError] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const [liveRegionText, setLiveRegionText] = useState('')

  // Calculate total images
  const allImages = property ? [
    property.imageUrl,
    ...(property.images || [])
  ].filter(Boolean) : []

  // Reset state when property changes
  useEffect(() => {
    if (property) {
      setCurrentImageIndex(0)
      setMapExpanded(false)
      setImageError(false)
      setLiveRegionText(`Property details modal opened for ${property.address}`)
    }
  }, [property])

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    } else if (e.key === 'ArrowRight' && !e.ctrlKey) {
      // Navigate images
      if (currentImageIndex < allImages.length - 1) {
        setCurrentImageIndex(prev => prev + 1)
      }
    } else if (e.key === 'ArrowLeft' && !e.ctrlKey) {
      // Navigate images
      if (currentImageIndex > 0) {
        setCurrentImageIndex(prev => prev - 1)
      }
    } else if (e.ctrlKey && e.key === 'ArrowRight' && canNavigateNext) {
      // Navigate properties
      onNavigate('next')
    } else if (e.ctrlKey && e.key === 'ArrowLeft' && canNavigatePrev) {
      // Navigate properties
      onNavigate('prev')
    }
  }, [onClose, currentImageIndex, allImages.length, canNavigateNext, canNavigatePrev, onNavigate])

  // Handle global escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  // Simulate map loading
  useEffect(() => {
    if (isOpen && property) {
      setMapLoading(true)
      const timer = setTimeout(() => setMapLoading(false), 500)
      return () => clearTimeout(timer)
    }
  }, [isOpen, property])

  // Bucket configuration
  const bucketConfig = {
    liked: { label: 'Like', icon: '❤️', className: 'bg-red-500 hover:bg-red-600' },
    considering: { label: 'Consider', icon: '🔖', className: 'bg-amber-500 hover:bg-amber-600' },
    disliked: { label: 'Not Interested', icon: '✕', className: 'bg-gray-500 hover:bg-gray-600' },
    book_visit: { label: 'Book Visit', icon: '📅', className: 'bg-green-500 hover:bg-green-600' }
  }

  // Responsive layout detection
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 640
  const isSmallScreen = typeof window !== 'undefined' && window.innerWidth <= 768

  // Don't render if not open or no property
  if (!isOpen || !property) return null

  return (
    <>
      {/* Backdrop */}
      <div
        data-testid="modal-backdrop"
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        data-testid="property-modal"
        ref={modalRef}
        className={`fixed inset-4 md:inset-8 bg-white rounded-lg shadow-2xl z-50 overflow-hidden flex flex-col ${
          isMobile ? 'mobile-layout' : ''
        }`}
        aria-label="Property details"
        tabIndex={-1}
        onKeyDown={handleKeyDown}
      >
        {/* Live region for screen readers */}
        <div
          data-testid="modal-live-region"
          className="sr-only"
          aria-live="polite"
          aria-atomic="true"
        >
          {liveRegionText}
        </div>

        {/* Header */}
        <div
          data-testid="modal-header"
          className="flex items-center justify-between p-4 border-b"
        >
          <h1 className="text-xl font-semibold">{property.address}</h1>
          <button
            data-testid="modal-close-btn"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Navigation arrows */}
        <button
          data-testid="modal-prev-btn"
          onClick={() => onNavigate('prev')}
          disabled={!canNavigatePrev}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg disabled:opacity-50"
          aria-label="Previous property"
        >
          ←
        </button>
        <button
          data-testid="modal-next-btn"
          onClick={() => onNavigate('next')}
          disabled={!canNavigateNext}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg disabled:opacity-50"
          aria-label="Next property"
        >
          →
        </button>

        {/* Content */}
        <div
          data-testid="modal-content"
          className={`flex-1 overflow-y-auto ${isSmallScreen ? 'flex-col' : 'flex'} flex`}
        >
          {/* Left Column - Media Gallery */}
          <div className={`${isSmallScreen ? 'w-full' : 'w-1/2'} p-4`}>
            {/* Primary Image */}
            <div className="relative mb-4">
              {allImages.length > 0 && !imageError ? (
                <>
                  <img
                    data-testid="primary-image"
                    src={allImages[currentImageIndex]}
                    alt={property.address}
                    className="w-full h-96 object-cover rounded-lg"
                    onError={() => setImageError(true)}
                  />
                  {/* Image counter */}
                  <div
                    data-testid="image-counter"
                    className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded"
                  >
                    {currentImageIndex + 1} of {allImages.length}
                  </div>
                  {/* Image navigation */}
                  <button
                    data-testid="image-prev-btn"
                    onClick={() => setCurrentImageIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentImageIndex === 0}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow disabled:opacity-50"
                  >
                    ←
                  </button>
                  <button
                    data-testid="image-next-btn"
                    onClick={() => setCurrentImageIndex(prev => Math.min(allImages.length - 1, prev + 1))}
                    disabled={currentImageIndex === allImages.length - 1}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow disabled:opacity-50"
                  >
                    →
                  </button>
                </>
              ) : imageError ? (
                <div
                  data-testid="image-fallback"
                  className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center"
                >
                  <span className="text-gray-500">Image unavailable</span>
                </div>
              ) : (
                <div
                  data-testid="image-loading-skeleton"
                  className="w-full h-96 bg-gray-200 rounded-lg animate-pulse"
                />
              )}
            </div>

            {/* Thumbnail Navigation */}
            {allImages.length > 1 && (
              <div data-testid="thumbnail-nav" className="flex gap-2 overflow-x-auto">
                {allImages.map((img, index) => (
                  <button
                    key={index}
                    data-testid={`thumbnail-${index}`}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded overflow-hidden border-2 ${
                      index === currentImageIndex ? 'border-blue-500' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Map Section */}
            <div className="mt-4">
              <h2 className="text-lg font-semibold mb-2">Location</h2>
              <div className="relative">
                <div
                  data-testid="property-map"
                  className={`w-full ${mapExpanded ? 'h-96 expanded' : 'h-64'} bg-gray-100 rounded-lg transition-all`}
                  data-lat={property.coordinates?.lat?.toString()}
                  data-lng={property.coordinates?.lng?.toString()}
                >
                  {mapLoading && (
                    <div
                      data-testid="map-loading"
                      className="absolute inset-0 bg-gray-200 rounded-lg animate-pulse flex items-center justify-center z-10"
                    >
                      Loading map...
                    </div>
                  )}
                  {/* Map would be rendered here */}
                  <div className="flex items-center justify-center h-full text-gray-500">
                    Map: {property.neighborhood || property.address}
                  </div>
                </div>
                <button
                  data-testid="map-expand-btn"
                  onClick={() => setMapExpanded(!mapExpanded)}
                  className="absolute top-2 right-2 bg-white rounded p-2 shadow z-20"
                >
                  {mapExpanded ? '↙' : '↗'}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Property Details */}
          <div className={`${isSmallScreen ? 'w-full' : 'w-1/2'} p-4`}>
            {/* Price */}
            <div data-testid="property-price" className="text-3xl font-bold text-blue-600 mb-4">
              ${property.price?.toLocaleString()}
            </div>

            {/* Features */}
            <div data-testid="property-features" className="flex gap-4 mb-4 text-gray-600">
              <span>{property.bedrooms} bed</span>
              <span>•</span>
              <span>{property.bathrooms} bath</span>
              <span>•</span>
              <span>{property.squareFootage?.toLocaleString()} sqft</span>
            </div>

            {/* Description */}
            <h2 className="text-lg font-semibold mb-2">Property Details</h2>
            <p data-testid="property-description" className="text-gray-700 mb-4">
              {property.description}
            </p>

            {/* Additional Details */}
            <div data-testid="property-details" className="grid grid-cols-2 gap-4 mb-6">
              {property.yearBuilt && (
                <div>
                  <span className="text-gray-500">Year Built:</span>
                  <span className="ml-2">Built in {property.yearBuilt}</span>
                </div>
              )}
              {property.lotSize && (
                <div>
                  <span className="text-gray-500">Lot Size:</span>
                  <span className="ml-2">{property.lotSize} acre lot</span>
                </div>
              )}
              {property.neighborhood && (
                <div>
                  <span className="text-gray-500">Neighborhood:</span>
                  <span className="ml-2">{property.neighborhood}</span>
                </div>
              )}
            </div>

            {/* Action Panel */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-4">Actions</h3>
              
              {/* Bucket Assignment Buttons */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {Object.entries(bucketConfig).map(([bucketType, config]) => (
                  <button
                    key={bucketType}
                    data-testid={`bucket-btn-${bucketType}`}
                    onClick={() => onBucketAssign(property.id, bucketType as BucketType)}
                    className={`px-4 py-2 rounded-lg text-white ${config.className} ${
                      selectedBucket === bucketType ? 'selected ring-2 ring-offset-2' : ''
                    }`}
                  >
                    {config.icon} {config.label}
                  </button>
                ))}
              </div>

              {/* Book Visit Button */}
              <button
                data-testid="book-visit-btn"
                onClick={() => onBookVisit(property.id)}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold primary"
              >
                📅 Book a Visit
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default PropertyModal