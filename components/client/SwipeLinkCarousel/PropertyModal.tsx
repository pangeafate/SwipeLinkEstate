'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { Property, ActionType, BucketType } from './types'
import ActionButtons from '../PropertyActions/ActionButtons'
import ScheduleVisitForm from '../PropertyActions/ScheduleVisitForm'

interface PropertyModalProps {
  property: Property
  onClose: () => void
  onAction: (propertyId: string, action: ActionType) => void
  currentBucket: BucketType
}

export default function PropertyModal({
  property,
  onClose,
  onAction,
  currentBucket
}: PropertyModalProps) {
  const [showScheduleForm, setShowScheduleForm] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden'
    
    // Handle ESC key
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEsc)
    
    return () => {
      document.body.style.overflow = 'unset'
      document.removeEventListener('keydown', handleEsc)
    }
  }, [onClose])

  const handleAction = (action: ActionType) => {
    if (action === 'schedule') {
      setShowScheduleForm(true)
    } else {
      onAction(property.id, action)
      // Show feedback animation
      const feedbackEl = document.createElement('div')
      feedbackEl.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in-out'
      feedbackEl.textContent = action === 'like' ? 'Added to Liked!' : 
                              action === 'dislike' ? 'Added to Disliked!' : 
                              'Marked for Consideration!'
      document.body.appendChild(feedbackEl)
      setTimeout(() => feedbackEl.remove(), 2000)
    }
  }

  const handleScheduleSubmit = (data: any) => {
    onAction(property.id, 'schedule')
    setShowScheduleForm(false)
    // Show success message
    const feedbackEl = document.createElement('div')
    feedbackEl.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in-out'
    feedbackEl.textContent = 'Visit scheduled successfully!'
    document.body.appendChild(feedbackEl)
    setTimeout(() => feedbackEl.remove(), 2000)
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % property.images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length)
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      data-testid="property-modal"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto m-4 animate-slide-up">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow"
          aria-label="Close modal"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
            <path d="M13.5 4.5L4.5 13.5M4.5 4.5L13.5 13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>

        {/* Image Gallery */}
        <div className="relative h-96 bg-gray-100">
          <Image
            src={property.images[currentImageIndex] || '/placeholder-property.jpg'}
            alt={`${property.title} - Image ${currentImageIndex + 1}`}
            fill
            className="object-cover"
          />
          
          {/* Image Navigation */}
          {property.images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow"
                aria-label="Previous image"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                  <path d="M8 2L3 6L8 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                </svg>
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow"
                aria-label="Next image"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                  <path d="M4 2L9 6L4 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                </svg>
              </button>
              
              {/* Image Dots */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
                {property.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentImageIndex ? 'bg-white' : 'bg-white/60'
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Property Details */}
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-2">{property.title}</h2>
            <p className="text-gray-600">{property.address}</p>
            <div className="flex items-center gap-4 mt-2 text-gray-700">
              <span>{property.bedrooms} bedrooms</span>
              <span>·</span>
              <span>{property.bathrooms} bathrooms</span>
              <span>·</span>
              <span>{property.sqft.toLocaleString()} sqft</span>
            </div>
          </div>

          {/* Price */}
          <div className="mb-6">
            <div className="text-3xl font-semibold">{property.priceFormatted}</div>
            {property.propertyType && (
              <div className="text-gray-600 capitalize mt-1">{property.propertyType}</div>
            )}
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">About this property</h3>
            <p className="text-gray-700 leading-relaxed">{property.description}</p>
          </div>

          {/* Features */}
          {property.features && property.features.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Features</h3>
              <div className="grid grid-cols-2 gap-2">
                {property.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Current Bucket Status */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">
              Current Status: <span className="font-semibold capitalize">{currentBucket}</span>
            </div>
          </div>

          {/* Action Buttons */}
          {!showScheduleForm ? (
            <ActionButtons onAction={handleAction} currentBucket={currentBucket} />
          ) : (
            <ScheduleVisitForm
              propertyId={property.id}
              propertyTitle={property.title}
              onSubmit={handleScheduleSubmit}
              onCancel={() => setShowScheduleForm(false)}
            />
          )}
        </div>
      </div>
    </div>
  )
}