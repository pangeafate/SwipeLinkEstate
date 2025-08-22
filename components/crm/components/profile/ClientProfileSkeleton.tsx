import React from 'react'

interface ClientProfileSkeletonProps {
  onClose?: () => void
}

export const ClientProfileSkeleton: React.FC<ClientProfileSkeletonProps> = ({ onClose }) => (
  <div className="bg-white rounded-xl shadow-lg animate-pulse">
    <div className="flex justify-between items-center p-6 border-b border-gray-200">
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
        <div>
          <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
      {onClose && (
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
    
    <div className="p-6">
      <div className="space-y-6">
        {[1, 2, 3].map(i => (
          <div key={i}>
            <div className="h-5 bg-gray-200 rounded w-32 mb-3"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)