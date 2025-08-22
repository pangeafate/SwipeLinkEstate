/**
 * VisitorInfoForm Component
 * Collects visitor contact information and group size
 */

import React, { ChangeEvent } from 'react'
import { VisitorInfo, ValidationErrors } from './types'

interface VisitorInfoFormProps {
  visitorInfo: VisitorInfo
  errors: ValidationErrors
  onChange: (field: keyof VisitorInfo, value: string | number) => void
  disabled?: boolean
}

export const VisitorInfoForm: React.FC<VisitorInfoFormProps> = ({
  visitorInfo,
  errors,
  onChange,
  disabled = false
}) => {
  // Handle input changes
  const handleInputChange = (field: keyof VisitorInfo) => (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const value = field === 'groupSize' 
      ? parseInt(e.target.value) || 1
      : e.target.value
    onChange(field, value)
  }

  // Email validation pattern
  const emailPattern = '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
  
  // Phone validation pattern (US format)
  const phonePattern = '^\\+?1?\\d{10,14}$'

  return (
    <div data-testid="visitor-info-form" className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Your Information</h3>
      
      {/* Name Field */}
      <div>
        <label htmlFor="visitor-name" className="block text-sm font-medium text-gray-700 mb-1">
          Full Name *
        </label>
        <input
          id="visitor-name"
          data-testid="visitor-name-input"
          type="text"
          value={visitorInfo.name}
          onChange={handleInputChange('name')}
          disabled={disabled}
          required
          className={`
            w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2
            ${errors.name 
              ? 'border-red-300 focus:ring-red-500' 
              : 'border-gray-300 focus:ring-blue-500'
            }
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
          `}
          placeholder="John Doe"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      {/* Email Field */}
      <div>
        <label htmlFor="visitor-email" className="block text-sm font-medium text-gray-700 mb-1">
          Email Address *
        </label>
        <input
          id="visitor-email"
          data-testid="visitor-email-input"
          type="email"
          value={visitorInfo.email}
          onChange={handleInputChange('email')}
          disabled={disabled}
          required
          pattern={emailPattern}
          className={`
            w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2
            ${errors.email 
              ? 'border-red-300 focus:ring-red-500' 
              : 'border-gray-300 focus:ring-blue-500'
            }
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
          `}
          placeholder="john@example.com"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
        )}
      </div>

      {/* Phone Field */}
      <div>
        <label htmlFor="visitor-phone" className="block text-sm font-medium text-gray-700 mb-1">
          Phone Number *
        </label>
        <input
          id="visitor-phone"
          data-testid="visitor-phone-input"
          type="tel"
          value={visitorInfo.phone}
          onChange={handleInputChange('phone')}
          disabled={disabled}
          required
          pattern={phonePattern}
          className={`
            w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2
            ${errors.phone 
              ? 'border-red-300 focus:ring-red-500' 
              : 'border-gray-300 focus:ring-blue-500'
            }
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
          `}
          placeholder="(555) 123-4567"
        />
        {errors.phone && (
          <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
        )}
      </div>

      {/* Group Size Field */}
      <div>
        <label htmlFor="group-size" className="block text-sm font-medium text-gray-700 mb-1">
          Number of Visitors
        </label>
        <select
          id="group-size"
          value={visitorInfo.groupSize}
          onChange={(e) => onChange('groupSize', parseInt(e.target.value))}
          disabled={disabled}
          className={`
            w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none 
            focus:ring-2 focus:ring-blue-500
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
          `}
        >
          {[1, 2, 3, 4, 5, 6].map(num => (
            <option key={num} value={num}>
              {num} {num === 1 ? 'Person' : 'People'}
            </option>
          ))}
        </select>
        {errors.groupSize && (
          <p className="mt-1 text-sm text-red-600">{errors.groupSize}</p>
        )}
      </div>

      {/* Privacy Notice */}
      <div className="bg-gray-50 rounded-lg p-3">
        <p className="text-xs text-gray-600">
          <span className="font-semibold">Privacy:</span> Your information will only be used to 
          schedule your property visit and will not be shared with third parties.
        </p>
      </div>
    </div>
  )
}

export default VisitorInfoForm