import React from 'react'
import type { PipelineMetrics } from '../../types'

/**
 * ConversionFunnel - Visual conversion rate display
 * Part of the modular CRMAnalytics component system.
 */

export interface ConversionFunnelProps {
  pipeline: PipelineMetrics
}

export const ConversionFunnel: React.FC<ConversionFunnelProps> = ({ pipeline }) => {
  const funnelStages = [
    { label: 'Links Created', value: pipeline.totalDeals, rate: 100 },
    { label: 'Engaged', value: Math.round(pipeline.totalDeals * (pipeline.linkToEngagementRate / 100)), rate: pipeline.linkToEngagementRate },
    { label: 'Qualified', value: Math.round(pipeline.totalDeals * (pipeline.engagementToQualifiedRate / 100)), rate: pipeline.engagementToQualifiedRate },
    { label: 'Closed', value: Math.round(pipeline.totalDeals * (pipeline.qualifiedToClosedRate / 100)), rate: pipeline.qualifiedToClosedRate }
  ]

  return (
    <div className="space-y-4">
      {funnelStages.map((stage, index) => (
        <div key={stage.label} className="flex items-center space-x-4">
          <div className={`w-${Math.max(12, Math.round(stage.rate / 8))} bg-gradient-to-r from-blue-500 to-blue-600 text-white text-center py-2 rounded`}>
            <div className="font-semibold">{stage.value}</div>
            <div className="text-xs">{stage.rate.toFixed(1)}%</div>
          </div>
          <div className="text-sm text-gray-600">{stage.label}</div>
        </div>
      ))}
    </div>
  )
}