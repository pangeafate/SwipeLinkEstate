import React from 'react'
import type { PipelineMetrics } from '../../types'

/**
 * PipelineVisualization - Visual representation of deal pipeline
 * 
 * Shows deal flow through stages with conversion rates.
 * Part of the modular CRMAnalytics component system.
 */

export interface PipelineVisualizationProps {
  pipeline: PipelineMetrics
}

export const PipelineVisualization: React.FC<PipelineVisualizationProps> = ({ pipeline }) => {
  const stages = [
    { key: 'created', label: 'Created', color: 'bg-gray-100' },
    { key: 'shared', label: 'Shared', color: 'bg-blue-100' },
    { key: 'accessed', label: 'Accessed', color: 'bg-green-100' },
    { key: 'engaged', label: 'Engaged', color: 'bg-yellow-100' },
    { key: 'qualified', label: 'Qualified', color: 'bg-orange-100' },
    { key: 'advanced', label: 'Advanced', color: 'bg-red-100' },
    { key: 'closed', label: 'Closed', color: 'bg-purple-100' }
  ]

  const conversions = [
    { rate: pipeline.linkToEngagementRate, label: 'Link → Engagement' },
    { rate: pipeline.engagementToQualifiedRate, label: 'Engagement → Qualified' },
    { rate: pipeline.qualifiedToClosedRate, label: 'Qualified → Closed' }
  ]

  if (pipeline.totalDeals === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-xl font-semibold">0</p>
        <p>No active deals</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Pipeline Stages */}
      <div className="flex items-center justify-between space-x-2 overflow-x-auto pb-4">
        {stages.map((stage, index) => (
          <div key={stage.key} className="flex items-center min-w-0">
            <div className={`${stage.color} rounded-lg p-4 text-center min-w-[100px]`}>
              <div className="text-2xl font-bold text-gray-800">
                {pipeline.dealsByStage[stage.key as keyof typeof pipeline.dealsByStage]}
              </div>
              <div className="text-sm text-gray-600 mt-1">{stage.label}</div>
            </div>
            
            {index < stages.length - 1 && (
              <div className="flex-shrink-0 mx-2">
                <div className="w-8 h-0.5 bg-gray-300"></div>
                <div className="text-xs text-gray-500 text-center mt-1">→</div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Conversion Rates */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {conversions.map((conversion) => (
          <div key={conversion.label} className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="text-xl font-bold text-blue-600">
              {conversion.rate.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">{conversion.label}</div>
          </div>
        ))}
      </div>

      {/* Pipeline Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-800">
            ${pipeline.totalPipelineValue.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Total Pipeline Value</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-800">
            ${pipeline.averageDealValue.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Average Deal Value</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-800">
            {pipeline.averageDealCycle} days
          </div>
          <div className="text-sm text-gray-600">Average Cycle Time</div>
        </div>
      </div>
    </div>
  )
}