/**
 * BookingConfirmation Component
 * Displays booking confirmation details after successful submission
 */

import React from 'react'
import { ConfirmedBooking } from './types'

interface BookingConfirmationProps {
  booking: ConfirmedBooking
  onClose: () => void
  onDownloadCalendar?: () => void
  onShareBooking?: () => void
}

export const BookingConfirmation: React.FC<BookingConfirmationProps> = ({
  booking,
  onClose,
  onDownloadCalendar,
  onShareBooking
}) => {
  // Format date for display
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Format time for display
  const formatTime = (timeStr: string): string => {
    const [hours, minutes] = timeStr.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  // Format address for display
  const formatAddress = (address: string): string => {
    return address.length > 50 ? address.substring(0, 50) + '...' : address
  }

  return (
    <div className="bg-white rounded-lg p-6 max-w-md mx-auto">
      {/* Success Icon */}
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <svg 
            className="w-8 h-8 text-green-500" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M5 13l4 4L19 7" 
            />
          </svg>
        </div>
      </div>

      {/* Confirmation Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Visit Confirmed!
        </h2>
        <p className="text-gray-600">
          Your property visit has been successfully scheduled
        </p>
      </div>

      {/* Confirmation Number */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-600 mb-1">Confirmation Number</p>
        <p className="text-lg font-mono font-bold text-blue-900">
          {booking.confirmationNumber}
        </p>
      </div>

      {/* Booking Details */}
      <div className="space-y-4 mb-6">
        {/* Property Info */}
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Property</h3>
          <p className="text-gray-900 font-medium">
            {formatAddress(booking.property.address)}
          </p>
          <p className="text-gray-600 text-sm">
            ${booking.property.price.toLocaleString()} • {booking.property.bedrooms} bed • {booking.property.bathrooms} bath
          </p>
        </div>

        {/* Date & Time */}
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Date & Time</h3>
          <p className="text-gray-900">
            {formatDate(booking.date)}
          </p>
          <p className="text-gray-600">
            {formatTime(booking.time)}
          </p>
        </div>

        {/* Agent Info */}
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Your Agent</h3>
          <div className="flex items-center">
            {booking.agent.avatar ? (
              <img 
                src={booking.agent.avatar} 
                alt={booking.agent.name}
                className="w-10 h-10 rounded-full mr-3"
              />
            ) : (
              <div className="w-10 h-10 bg-gray-300 rounded-full mr-3 flex items-center justify-center">
                <span className="text-gray-600 text-sm font-semibold">
                  {booking.agent.name.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <p className="text-gray-900 font-medium">{booking.agent.name}</p>
              <p className="text-gray-600 text-sm">{booking.agent.phone}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {onDownloadCalendar && (
          <button
            onClick={onDownloadCalendar}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            📅 Add to Calendar
          </button>
        )}
        
        {onShareBooking && (
          <button
            onClick={onShareBooking}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            📤 Share Details
          </button>
        )}

        <button
          onClick={onClose}
          className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          Done
        </button>
      </div>

      {/* Reminder Notice */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <p className="text-xs text-yellow-800">
          <span className="font-semibold">Reminder:</span> You'll receive a confirmation email 
          and a reminder 24 hours before your visit.
        </p>
      </div>
    </div>
  )
}

export default BookingConfirmation