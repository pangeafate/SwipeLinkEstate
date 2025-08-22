/**
 * PreferencesForm Component
 * Collects visit preferences and additional requests
 */

import React, { ChangeEvent } from 'react'
import { VisitPreferences, AdditionalRequests } from './types'

interface PreferencesFormProps {
  preferences: VisitPreferences
  additionalRequests: AdditionalRequests
  onPreferenceChange: (field: keyof VisitPreferences, value: boolean | string) => void
  onRequestChange: (field: keyof AdditionalRequests, value: boolean | string) => void
  disabled?: boolean
}

export const PreferencesForm: React.FC<PreferencesFormProps> = ({
  preferences,
  additionalRequests,
  onPreferenceChange,
  onRequestChange,
  disabled = false
}) => {
  // Handle checkbox changes for preferences
  const handlePreferenceCheck = (field: keyof VisitPreferences) => (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    onPreferenceChange(field, e.target.checked)
  }

  // Handle checkbox changes for requests
  const handleRequestCheck = (field: keyof AdditionalRequests) => (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    onRequestChange(field, e.target.checked)
  }

  // Handle text area changes
  const handleTextChange = (
    type: 'preference' | 'request',
    field: string
  ) => (e: ChangeEvent<HTMLTextAreaElement>) => {
    if (type === 'preference') {
      onPreferenceChange(field as keyof VisitPreferences, e.target.value)
    } else {
      onRequestChange(field as keyof AdditionalRequests, e.target.value)
    }
  }

  return (
    <div data-testid="preferences-form" className="space-y-6">
      {/* Visit Preferences */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Visit Preferences</h3>
        
        <div className="space-y-3">
          {/* Accessibility Needs */}
          <label className="flex items-start">
            <input
              type="checkbox"
              checked={preferences.accessibilityNeeds}
              onChange={handlePreferenceCheck('accessibilityNeeds')}
              disabled={disabled}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-3">
              <span className="block text-sm font-medium text-gray-700">
                Accessibility Requirements
              </span>
              <span className="block text-xs text-gray-500">
                Please ensure the property visit accommodates accessibility needs
              </span>
            </span>
          </label>

          {/* Budget Discussion */}
          <label className="flex items-start">
            <input
              type="checkbox"
              checked={preferences.budgetDiscussion}
              onChange={handlePreferenceCheck('budgetDiscussion')}
              disabled={disabled}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-3">
              <span className="block text-sm font-medium text-gray-700">
                Discuss Budget
              </span>
              <span className="block text-xs text-gray-500">
                I'd like to discuss pricing and negotiation options
              </span>
            </span>
          </label>

          {/* Financing Discussion */}
          <label className="flex items-start">
            <input
              type="checkbox"
              checked={preferences.financingDiscussion}
              onChange={handlePreferenceCheck('financingDiscussion')}
              disabled={disabled}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-3">
              <span className="block text-sm font-medium text-gray-700">
                Financing Information
              </span>
              <span className="block text-xs text-gray-500">
                I'd like information about financing options
              </span>
            </span>
          </label>

          {/* Special Requirements */}
          <div>
            <label htmlFor="special-requirements" className="block text-sm font-medium text-gray-700 mb-1">
              Special Requirements or Questions
            </label>
            <textarea
              id="special-requirements"
              value={preferences.specialRequirements}
              onChange={handleTextChange('preference', 'specialRequirements')}
              disabled={disabled}
              rows={3}
              className={`
                w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none 
                focus:ring-2 focus:ring-blue-500
                ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
              `}
              placeholder="Any specific areas you'd like to see or questions you have..."
            />
          </div>
        </div>
      </div>

      {/* Additional Services */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Additional Services</h3>
        
        <div className="space-y-3">
          {/* Neighborhood Tour */}
          <label className="flex items-start">
            <input
              type="checkbox"
              checked={additionalRequests.neighborhoodTour}
              onChange={handleRequestCheck('neighborhoodTour')}
              disabled={disabled}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-3">
              <span className="block text-sm font-medium text-gray-700">
                Neighborhood Tour
              </span>
              <span className="block text-xs text-gray-500">
                Include a tour of the surrounding neighborhood and amenities
              </span>
            </span>
          </label>

          {/* Comparable Properties */}
          <label className="flex items-start">
            <input
              type="checkbox"
              checked={additionalRequests.comparableProperties}
              onChange={handleRequestCheck('comparableProperties')}
              disabled={disabled}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-3">
              <span className="block text-sm font-medium text-gray-700">
                View Similar Properties
              </span>
              <span className="block text-xs text-gray-500">
                Show me comparable properties in the area
              </span>
            </span>
          </label>

          {/* Market Analysis */}
          <label className="flex items-start">
            <input
              type="checkbox"
              checked={additionalRequests.marketAnalysis}
              onChange={handleRequestCheck('marketAnalysis')}
              disabled={disabled}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-3">
              <span className="block text-sm font-medium text-gray-700">
                Market Analysis
              </span>
              <span className="block text-xs text-gray-500">
                Provide market trends and property value analysis
              </span>
            </span>
          </label>

          {/* Custom Notes */}
          <div>
            <label htmlFor="custom-notes" className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes
            </label>
            <textarea
              id="custom-notes"
              value={additionalRequests.customNotes}
              onChange={handleTextChange('request', 'customNotes')}
              disabled={disabled}
              rows={3}
              className={`
                w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none 
                focus:ring-2 focus:ring-blue-500
                ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
              `}
              placeholder="Any other requests or information you'd like to share..."
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default PreferencesForm