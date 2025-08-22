/**
 * Details View Component
 * Shows link creation details form
 */

import { PropertyPreview } from './PropertyPreview'

interface DetailsViewProps {
  selectedProperties: Array<{
    id: string
    address: string
    price: number | null
    bedrooms: number | null
    bathrooms: number | null
  }>
  linkName: string
  onLinkNameChange: (name: string) => void
  generateSmartName: () => string
  onClose: () => void
  onQuickCreate: () => void
  onRegularCreate: () => void
  isCreating: boolean
}

export function DetailsView({
  selectedProperties,
  linkName,
  onLinkNameChange,
  generateSmartName,
  onClose,
  onQuickCreate,
  onRegularCreate,
  isCreating
}: DetailsViewProps) {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Create Property Link</h2>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close modal"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Pre-selected Properties Preview */}
      <PropertyPreview selectedProperties={selectedProperties} />

      {/* Smart Name Suggestions */}
      <div data-testid="name-suggestions" className="mb-6">
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Collection Name
        </label>
        <input
          type="text"
          value={linkName}
          onChange={(e) => onLinkNameChange(e.target.value)}
          placeholder={generateSmartName()}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        />
        
        {/* Suggested Names */}
        <div className="mt-2 flex flex-wrap gap-2">
          {['Ocean Properties Collection', 'Miami Beach Properties', 'Waterfront Collection'].map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => onLinkNameChange(suggestion)}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-6 border-t border-gray-200">
        <button
          onClick={onClose}
          className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
        >
          Cancel
        </button>
        <div className="flex space-x-3">
          <button
            onClick={onQuickCreate}
            disabled={isCreating}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-medium transition-colors"
          >
            {isCreating ? 'Creating...' : 'Quick Create'}
          </button>
          <button
            onClick={onRegularCreate}
            disabled={isCreating}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium transition-colors"
          >
            {isCreating ? 'Creating...' : 'Create Link'}
          </button>
        </div>
      </div>

      {/* Helper Text */}
      <p className="text-sm text-gray-500 mt-3 text-center">
        Create link instantly with smart defaults
      </p>
    </div>
  )
}