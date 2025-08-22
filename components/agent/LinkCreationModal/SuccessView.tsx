/**
 * Success View Component
 * Shows success state after link creation
 */

interface SuccessViewProps {
  createdLink: string | null
  onCopyLink: () => void
  onShareViaEmail: () => void
  onShareViaSMS: () => void
  onViewLink: () => void
}

export function SuccessView({ 
  createdLink, 
  onCopyLink, 
  onShareViaEmail, 
  onShareViaSMS, 
  onViewLink 
}: SuccessViewProps) {
  return (
    <div className="p-6">
      <div data-testid="link-success-message" className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Link created successfully!</h2>
        <p className="text-gray-600">Your property collection is ready to share</p>
      </div>

      {/* Copyable Link */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Shareable Link
        </label>
        <div className="flex">
          <input
            data-testid="copyable-link"
            type="text"
            value={createdLink || ''}
            readOnly
            className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg bg-white text-gray-900 font-mono text-sm"
          />
          <button
            onClick={onCopyLink}
            className="px-6 py-3 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 font-medium transition-colors"
          >
            Copy Link
          </button>
        </div>
      </div>

      {/* Sharing Options */}
      <div className="flex justify-center space-x-3 mb-6">
        <button
          onClick={onShareViaEmail}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Share via Email
        </button>
        <button
          onClick={onShareViaSMS}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Share via SMS
        </button>
        <button
          onClick={onViewLink}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          View Link
        </button>
      </div>

      {/* Success Toast (inline for now) */}
      <div data-testid="inline-success-toast" className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
        <div className="text-green-800 font-medium">Link created and copied to clipboard!</div>
      </div>
    </div>
  )
}