/**
 * VisitBooking Component (Refactored)
 * Main component that orchestrates the visit booking flow using smaller sub-components
 */

import React, { useState, useCallback } from 'react'
import { CalendarSelector } from './CalendarSelector'
import { VisitorInfoForm } from './VisitorInfoForm'
import { PreferencesForm } from './PreferencesForm'
import { BookingConfirmation } from './BookingConfirmation'
import type {
  Agent,
  TimeSlot,
  VisitorInfo,
  VisitPreferences,
  AdditionalRequests,
  BookingSubmission,
  ConfirmedBooking,
  ValidationErrors
} from './types'
import { Property } from '../types'

interface VisitBookingProps {
  property: Property
  agent?: Agent
  availableSlots: TimeSlot[]
  isOpen: boolean
  onSubmit: (booking: BookingSubmission) => void
  onCancel: () => void
  loading?: boolean
  error?: string
}

export const VisitBooking: React.FC<VisitBookingProps> = ({
  property,
  agent,
  availableSlots,
  isOpen,
  onSubmit,
  onCancel,
  loading = false,
  error
}) => {
  // Form state
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [visitorInfo, setVisitorInfo] = useState<VisitorInfo>({
    name: '',
    email: '',
    phone: '',
    groupSize: 1
  })
  const [preferences, setPreferences] = useState<VisitPreferences>({
    specialRequirements: '',
    accessibilityNeeds: false,
    budgetDiscussion: false,
    financingDiscussion: false
  })
  const [additionalRequests, setAdditionalRequests] = useState<AdditionalRequests>({
    neighborhoodTour: false,
    comparableProperties: false,
    marketAnalysis: false,
    customNotes: ''
  })
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [confirmedBooking, setConfirmedBooking] = useState<ConfirmedBooking | null>(null)

  // Validate form data
  const validateStep = (step: number): boolean => {
    const errors: ValidationErrors = {}

    if (step === 1) {
      if (!selectedDate) errors.date = 'Please select a date'
      if (!selectedTime) errors.time = 'Please select a time'
    }

    if (step === 2) {
      if (!visitorInfo.name) errors.name = 'Name is required'
      if (!visitorInfo.email) errors.email = 'Email is required'
      if (!visitorInfo.phone) errors.phone = 'Phone is required'
      
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (visitorInfo.email && !emailRegex.test(visitorInfo.email)) {
        errors.email = 'Please enter a valid email'
      }
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle step navigation
  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4))
    }
  }

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  // Handle visitor info changes
  const handleVisitorInfoChange = useCallback((
    field: keyof VisitorInfo,
    value: string | number
  ) => {
    setVisitorInfo(prev => ({ ...prev, [field]: value }))
    // Clear error for this field
    if (validationErrors[field as keyof ValidationErrors]) {
      setValidationErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }, [validationErrors])

  // Handle preference changes
  const handlePreferenceChange = useCallback((
    field: keyof VisitPreferences,
    value: boolean | string
  ) => {
    setPreferences(prev => ({ ...prev, [field]: value }))
  }, [])

  // Handle request changes
  const handleRequestChange = useCallback((
    field: keyof AdditionalRequests,
    value: boolean | string
  ) => {
    setAdditionalRequests(prev => ({ ...prev, [field]: value }))
  }, [])

  // Handle form submission
  const handleSubmit = () => {
    if (!validateStep(2)) return

    const booking: BookingSubmission = {
      propertyId: property.id,
      date: selectedDate,
      time: selectedTime,
      visitor: visitorInfo,
      preferences,
      additionalRequests
    }

    onSubmit(booking)
    
    // Show confirmation (in real app, this would come from the API response)
    setConfirmedBooking({
      confirmationNumber: `VB${Date.now().toString(36).toUpperCase()}`,
      date: selectedDate,
      time: selectedTime,
      property,
      agent: agent || {
        id: '1',
        name: 'Agent Name',
        email: 'agent@example.com',
        phone: '(555) 123-4567'
      }
    })
    setCurrentStep(4)
  }

  if (!isOpen) return null

  // Show confirmation if booking is complete
  if (currentStep === 4 && confirmedBooking) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <BookingConfirmation
          booking={confirmedBooking}
          onClose={onCancel}
        />
      </div>
    )
  }

  return (
    <div 
      data-testid="modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div data-testid="visit-booking-modal" className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Schedule Visit</h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-500"
            >
              <span className="text-2xl">×</span>
            </button>
          </div>
          
          {/* Progress Indicator */}
          <div className="flex items-center justify-center mt-4 space-x-2">
            {[1, 2, 3].map(step => (
              <div
                key={step}
                className={`h-2 w-16 rounded-full ${
                  step <= currentStep ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Property Context Display */}
        <div data-testid="booking-property-context" className="mx-6 mt-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start space-x-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{property.address || 'Property Address'}</h3>
              {property.price !== undefined && (
                <p className="text-xl font-bold text-blue-600 mt-1">
                  ${property.price.toLocaleString()}
                </p>
              )}
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                {property.bedrooms && (
                  <span>{property.bedrooms} {property.bedrooms === 1 ? 'Bed' : 'Beds'}</span>
                )}
                {property.bathrooms && (
                  <span>{property.bathrooms} {property.bathrooms === 1 ? 'Bath' : 'Baths'}</span>
                )}
                {property.sqft && (
                  <span>{property.sqft.toLocaleString()} sqft</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Agent Info Display */}
        {agent && (
          <div data-testid="booking-agent-info" className="mx-6 mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{agent.name}</p>
                {agent.email && <p className="text-xs text-gray-600">{agent.email}</p>}
                {agent.phone && <p className="text-xs text-gray-600">{agent.phone}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Form Content */}
        <div className="p-6">
          {currentStep === 1 && (
            <CalendarSelector
              availableSlots={availableSlots}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              onDateSelect={setSelectedDate}
              onTimeSelect={setSelectedTime}
              loading={loading}
            />
          )}

          {currentStep === 2 && (
            <VisitorInfoForm
              visitorInfo={visitorInfo}
              errors={validationErrors}
              onChange={handleVisitorInfoChange}
              disabled={loading}
            />
          )}

          {currentStep === 3 && (
            <PreferencesForm
              preferences={preferences}
              additionalRequests={additionalRequests}
              onPreferenceChange={handlePreferenceChange}
              onRequestChange={handleRequestChange}
              disabled={loading}
            />
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex justify-between">
            <button
              onClick={currentStep === 1 ? onCancel : handleBack}
              disabled={loading}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
            >
              {currentStep === 1 ? 'Cancel' : 'Back'}
            </button>
            
            {currentStep < 3 ? (
              <button
                onClick={handleNext}
                disabled={loading || (currentStep === 1 && (!selectedDate || !selectedTime))}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  loading || (currentStep === 1 && (!selectedDate || !selectedTime))
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  loading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {loading ? 'Booking...' : 'Confirm Booking'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default VisitBooking