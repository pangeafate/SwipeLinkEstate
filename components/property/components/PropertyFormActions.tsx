/**
 * Property form action buttons component
 * Extracted from PropertyForm.tsx to maintain file size limits
 */
import React from 'react'

interface PropertyFormActionsProps {
  loading: boolean
  onCancel: () => void
}

export function PropertyFormActions({ loading, onCancel }: PropertyFormActionsProps) {
  return (
    <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
      <button
        type="button"
        onClick={onCancel}
        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 font-medium flex items-center space-x-2"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Creating...</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Add Property</span>
          </>
        )}
      </button>
    </div>
  )
}