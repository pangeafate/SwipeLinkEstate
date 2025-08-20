import React from 'react'
import type { Link } from '../types'

interface LinkShareFormProps {
  createdLink: Link | null
  selectedPropertyCount: number
  copySuccess: boolean
  onCopyLink: () => void
  onCreateAnother: () => void
}

const LinkShareForm: React.FC<LinkShareFormProps> = ({
  createdLink,
  selectedPropertyCount,
  copySuccess,
  onCopyLink,
  onCreateAnother
}) => {
  return (
    <div>
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Link Created Successfully!</h2>
        <p className="text-gray-600">Your property collection is ready to share</p>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Shareable Link
          </label>
          <div className="flex">
            <input
              type="text"
              value={`${window.location.origin}/link/${createdLink?.code}`}
              readOnly
              className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg bg-white text-gray-900 font-mono text-sm"
            />
            <button
              onClick={onCopyLink}
              className={`px-6 py-3 rounded-r-lg font-medium transition-colors ${
                copySuccess
                  ? 'bg-green-600 text-white'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {copySuccess ? (
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Copied!</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>Copy</span>
                </div>
              )}
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Link Code:</span>
            <div className="font-mono text-gray-900">{createdLink?.code}</div>
          </div>
          <div>
            <span className="font-medium text-gray-700">Properties:</span>
            <div className="text-gray-900">{selectedPropertyCount} selected</div>
          </div>
        </div>
      </div>
      
      <div className="text-center space-y-4">
        <button
          onClick={onCreateAnother}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors inline-flex items-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Create Another Link</span>
        </button>
        
        <div className="text-sm text-gray-500">
          Share this link with clients via email, text, or any messaging platform
        </div>
      </div>
    </div>
  )
}

export default LinkShareForm