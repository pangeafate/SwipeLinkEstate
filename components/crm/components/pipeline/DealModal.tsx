import React from 'react'
import type { Deal } from '../../types'

interface DealModalProps {
  deal: Deal | null
  isOpen: boolean
  onClose: () => void
}

export const DealModal: React.FC<DealModalProps> = ({ deal, isOpen, onClose }) => {
  if (!isOpen || !deal) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">{deal.dealName}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
              <div className="bg-gray-50 px-3 py-2 rounded-lg text-sm">
                {deal.dealStage.charAt(0).toUpperCase() + deal.dealStage.slice(1)}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <div className="bg-gray-50 px-3 py-2 rounded-lg text-sm">
                {deal.dealStatus.replace('-', ' ').charAt(0).toUpperCase() + deal.dealStatus.slice(1).replace('-', ' ')}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Engagement Score</label>
              <div className="bg-gray-50 px-3 py-2 rounded-lg text-sm">
                {deal.engagementScore}/100
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client Temperature</label>
              <div className="bg-gray-50 px-3 py-2 rounded-lg text-sm flex items-center space-x-2">
                <span>{deal.clientTemperature === 'hot' ? '🔥' : deal.clientTemperature === 'warm' ? '⚡' : '❄️'}</span>
                <span>{deal.clientTemperature.charAt(0).toUpperCase() + deal.clientTemperature.slice(1)}</span>
              </div>
            </div>
          </div>

          {/* Client Info */}
          {(deal.clientName || deal.clientEmail || deal.clientPhone) && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Client Information</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                {deal.clientName && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">{deal.clientName}</span>
                  </div>
                )}
                {deal.clientEmail && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{deal.clientEmail}</span>
                  </div>
                )}
                {deal.clientPhone && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium">{deal.clientPhone}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Deal Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Deal Details</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Properties:</span>
                <span className="font-medium">{deal.propertyCount}</span>
              </div>
              
              {deal.dealValue && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Estimated Value:</span>
                  <span className="font-medium">${deal.dealValue.toLocaleString()}</span>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Created:</span>
                <span className="font-medium">{new Date(deal.createdAt).toLocaleDateString()}</span>
              </div>
              
              {deal.lastActivityAt && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Last Activity:</span>
                  <span className="font-medium">{new Date(deal.lastActivityAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Engagement Metrics */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Engagement</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Sessions:</span>
                <span className="font-medium">{deal.sessionCount}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Time Spent:</span>
                <span className="font-medium">{Math.round(deal.totalTimeSpent / 60)} minutes</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {deal.notes && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Notes</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-800">{deal.notes}</p>
              </div>
            </div>
          )}

          {/* Tags */}
          {deal.tags.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {deal.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Close
          </button>
          
          <button
            onClick={() => {
              // Would implement edit functionality
              console.log('Edit deal:', deal.id)
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Edit Deal
          </button>
        </div>
      </div>
    </div>
  )
}