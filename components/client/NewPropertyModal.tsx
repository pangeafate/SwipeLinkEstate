/**
 * PropertyModal Component
 * 
 * Expanded property view modal that opens when a property card is tapped.
 * Features image gallery, detailed property information, and 4 action buttons
 * for bucket management (Like, Dislike, Consider, Schedule Visit).
 */

import React, { memo, useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import type { Property, PropertyAction, BucketType } from './types'

interface PropertyModalProps {
  isOpen: boolean
  property: Property
  onActionClick: (propertyId: string, action: PropertyAction) => void
  onClose: () => void
  loading?: boolean
  currentBucket?: BucketType
  openedFrom?: string
  className?: string
}

export const PropertyModal = memo<PropertyModalProps>(({
  isOpen,
  property,
  onActionClick,
  onClose,
  loading = false,
  currentBucket,
  openedFrom,
  className = ''
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const firstFocusableRef = useRef<HTMLButtonElement>(null)

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Handle modal open/close effects
  useEffect(() => {
    if (isOpen) {
      // Store previous focus
      previousFocusRef.current = document.activeElement as HTMLElement
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden'
      
      // Animate in
      setIsAnimating(true)
      
      // Focus first element after animation
      setTimeout(() => {
        if (firstFocusableRef.current) {
          firstFocusableRef.current.focus()
        }
        setIsAnimating(false)
      }, 150)
    } else {
      // Restore body scroll
      document.body.style.overflow = ''
      
      // Restore previous focus
      if (previousFocusRef.current) {
        previousFocusRef.current.focus()
      }
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  // Handle image navigation with keyboard
  const handleImageKeyDown = useCallback((event: React.KeyboardEvent) => {
    const imageCount = property?.images?.length || 0
    
    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault()
        setCurrentImageIndex(prev => (prev + 1) % imageCount)
        break
      case 'ArrowLeft':
        event.preventDefault()
        setCurrentImageIndex(prev => (prev - 1 + imageCount) % imageCount)
        break
    }
  }, [property?.images?.length])

  // Handle action button click
  const handleActionClick = useCallback((action: PropertyAction) => {
    onActionClick(property.id, action)
  }, [onActionClick, property.id])

  // Handle backdrop click
  const handleBackdropClick = useCallback((event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }, [onClose])

  // Format price
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  // Format square footage
  const formatSquareFootage = (sqft: number): string => {
    return new Intl.NumberFormat('en-US').format(sqft)
  }

  // Format property type
  const formatPropertyType = (type: string | undefined): string => {
    if (!type) return 'Property'
    return type.charAt(0).toUpperCase() + type.slice(1)
  }

  // Format features
  const formatFeature = (feature: string): string => {
    return feature.charAt(0).toUpperCase() + feature.slice(1).replace('_', ' ')
  }

  // Handle image thumbnail click
  const handleThumbnailClick = useCallback((index: number) => {
    setCurrentImageIndex(index)
  }, [])

  if (!isOpen) {
    return null
  }

  const hasImages = property?.images && property.images.length > 0
  const currentImage = hasImages ? property.images[currentImageIndex] : null
  const imageCount = hasImages ? property.images.length : 0

  return (
    <div
      data-testid="property-modal"
      className={`
        fixed inset-0 z-50 flex items-center justify-center
        ${isMobile ? 'mobile-modal' : ''} 
        ${isAnimating ? 'animate-fade-in' : ''}
        ${!isOpen && isAnimating ? 'animate-fade-out' : ''}
        ${className}
      `}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      {/* Screen reader announcement */}
      <div className="sr-only" aria-live="polite">
        Property details modal opened
      </div>

      {/* Backdrop */}
      <div 
        data-testid="modal-backdrop"
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={handleBackdropClick}
      />

      {/* Modal Content */}
      <div
        ref={modalRef}
        data-testid="modal-content"
        className={`
          relative bg-white rounded-lg shadow-2xl
          ${isMobile 
            ? 'h-full w-full rounded-none' 
            : 'max-h-[90vh] max-w-4xl w-full mx-4'
          }
          overflow-hidden
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          ref={firstFocusableRef}
          className="absolute top-4 right-4 z-10 w-8 h-8 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full flex items-center justify-center transition-colors"
          onClick={onClose}
          aria-label="Close modal"
        >
          <span className="text-lg">×</span>
        </button>

        {loading ? (
          // Loading State
          <div data-testid="modal-loading" className="h-96 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          </div>
        ) : (
          <div className={`flex ${isMobile ? 'flex-col h-full' : 'h-[80vh]'}`}>
            {/* Image Section */}
            <div 
              className={`
                ${isMobile ? 'h-1/2' : 'w-1/2'} 
                relative bg-gray-100
              `}
            >
              {hasImages ? (
                <>
                  {/* Main Image */}
                  <div 
                    data-testid="image-gallery"
                    className="relative w-full h-full"
                    onKeyDown={handleImageKeyDown}
                    tabIndex={0}
                  >
                    <Image
                      src={currentImage!}
                      alt={`Property at ${property.address}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      priority
                    />
                    
                    {/* Image Counter */}
                    <div className="absolute top-4 left-4 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-sm">
                      {currentImageIndex + 1} / {imageCount}
                    </div>
                  </div>

                  {/* Thumbnail Gallery */}
                  {imageCount > 1 && (
                    <div className="absolute bottom-4 left-4 right-4 flex space-x-2 overflow-x-auto">
                      {property.images.map((image, index) => (
                        <button
                          key={index}
                          className={`
                            relative w-16 h-16 flex-shrink-0 rounded border-2 overflow-hidden
                            ${index === currentImageIndex 
                              ? 'border-white' 
                              : 'border-transparent opacity-70 hover:opacity-100'
                            }
                          `}
                          onClick={() => handleThumbnailClick(index)}
                          aria-label={`View image ${index + 1}`}
                        >
                          <Image
                            src={image}
                            alt={`Property image ${index + 1}`}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                // Image Placeholder
                <div 
                  data-testid="image-placeholder"
                  className="w-full h-full flex items-center justify-center bg-gray-200"
                >
                  <div className="text-center text-gray-500">
                    <div className="text-6xl mb-2">🏠</div>
                    <div className="text-lg">No Images Available</div>
                  </div>
                </div>
              )}
            </div>

            {/* Content Section */}
            <div 
              className={`
                ${isMobile ? 'flex-1 overflow-y-auto' : 'w-1/2'} 
                p-6 flex flex-col
              `}
            >
              {/* Header */}
              <div className="mb-6">
                <h2 
                  id="modal-title"
                  className="text-2xl font-bold text-gray-900 mb-2"
                >
                  {property.address}
                </h2>
                
                <div className="text-3xl font-bold text-blue-600 mb-4">
                  {formatPrice(property.price)}
                </div>

                {/* Property Type Badge */}
                <div className="inline-block bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
                  {formatPropertyType(property.property_type)}
                </div>
              </div>

              {/* Property Details */}
              <div 
                id="modal-description"
                className="mb-6"
              >
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {property.bedrooms}
                    </div>
                    <div className="text-sm text-gray-600">
                      {property.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {property.bathrooms}
                    </div>
                    <div className="text-sm text-gray-600">
                      {property.bathrooms === 1 ? 'Bathroom' : 'Bathrooms'}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {formatSquareFootage(property.area_sqft)}
                    </div>
                    <div className="text-sm text-gray-600">Sq Ft</div>
                  </div>
                </div>

                {/* Description */}
                {property.description && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-700 leading-relaxed">
                      {property.description}
                    </p>
                  </div>
                )}

                {/* Features */}
                {property.features && property.features.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-2">Features</h3>
                    <div className="flex flex-wrap gap-2">
                      {property.features.map((feature, index) => (
                        <span
                          key={index}
                          className="inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {formatFeature(feature)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div 
                data-testid="action-buttons"
                className={`
                  mt-auto pt-6 border-t border-gray-200
                  ${isMobile 
                    ? 'flex flex-col space-y-2' 
                    : 'grid grid-cols-2 gap-3'
                  }
                `}
              >
                <button
                  className="flex items-center justify-center py-3 px-4 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg font-medium transition-colors min-h-[44px]"
                  onClick={() => handleActionClick('dislike')}
                  aria-label="Dislike this property"
                >
                  <span className="mr-2">👎</span>
                  Dislike
                </button>
                
                <button
                  className="flex items-center justify-center py-3 px-4 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 rounded-lg font-medium transition-colors min-h-[44px]"
                  onClick={() => handleActionClick('consider')}
                  aria-label="Consider this property"
                >
                  <span className="mr-2">🤔</span>
                  Consider
                </button>
                
                <button
                  className="flex items-center justify-center py-3 px-4 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg font-medium transition-colors min-h-[44px]"
                  onClick={() => handleActionClick('like')}
                  aria-label="Like this property"
                >
                  <span className="mr-2">👍</span>
                  Like
                </button>
                
                <button
                  className="flex items-center justify-center py-3 px-4 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-medium transition-colors min-h-[44px]"
                  onClick={() => handleActionClick('schedule_visit')}
                  aria-label="Schedule visit for this property"
                >
                  <span className="mr-2">📅</span>
                  Schedule Visit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
})

PropertyModal.displayName = 'PropertyModal'

export default PropertyModal