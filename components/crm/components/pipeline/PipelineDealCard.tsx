import React from 'react'
import type { Deal, DealStage, DealStatus, ClientTemperature } from '../../types'

interface PipelineDealCardProps {
  deal: Deal
  onStageChange: (dealId: string, stage: DealStage) => void
  onStatusChange: (dealId: string, status: DealStatus) => void
  onClick: () => void
}

export const PipelineDealCard: React.FC<PipelineDealCardProps> = ({ 
  deal, 
  onStageChange, 
  onStatusChange, 
  onClick 
}) => {
  const getTemperatureColor = (temp: ClientTemperature) => {
    const colors = {
      hot: 'bg-red-500',
      warm: 'bg-orange-500',
      cold: 'bg-gray-500'
    }
    return colors[temp]
  }

  const getStatusColor = (status: DealStatus) => {
    const colors = {
      active: 'bg-blue-100 text-blue-800',
      qualified: 'bg-green-100 text-green-800',
      nurturing: 'bg-yellow-100 text-yellow-800',
      'closed-won': 'bg-emerald-100 text-emerald-800',
      'closed-lost': 'bg-red-100 text-red-800'
    }
    return colors[status]
  }

  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-medium text-gray-900 truncate flex-1 mr-2">
          {deal.dealName}
        </h4>
        <div className={`w-3 h-3 rounded-full ${getTemperatureColor(deal.clientTemperature)}`} 
             title={`${deal.clientTemperature} lead`}>
        </div>
      </div>

      {/* Deal Info */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Properties:</span>
          <span className="font-medium">{deal.propertyCount}</span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Engagement:</span>
          <span className="font-medium">{deal.engagementScore}/100</span>
        </div>
        
        {deal.dealValue && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Value:</span>
            <span className="font-medium">${deal.dealValue.toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* Status Badge */}
      <div className="flex items-center justify-between">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(deal.dealStatus)}`}>
          {deal.dealStatus.replace('-', ' ')}
        </span>
        
        {deal.lastActivityAt && (
          <span className="text-xs text-gray-500">
            {new Date(deal.lastActivityAt).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-3 pt-3 border-t border-gray-100 flex space-x-2">
        <button
          className="flex-1 text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          onClick={(e) => {
            e.stopPropagation()
            // Quick action - would implement task creation
          }}
        >
          Add Task
        </button>
        
        <button
          className="flex-1 text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          onClick={(e) => {
            e.stopPropagation()
            // Quick action - would implement client contact
          }}
        >
          Contact
        </button>
      </div>
    </div>
  )
}