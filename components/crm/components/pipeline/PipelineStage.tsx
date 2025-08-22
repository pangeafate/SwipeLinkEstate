import React, { useState } from 'react'
import type { Deal, DealStage, DealStatus } from '../../types'
import { PipelineDealCard } from './PipelineDealCard'
import PipelineStageHeader from './PipelineStageHeader'

interface PipelineStageProps {
  stage: DealStage
  deals: Deal[]
  onStageChange: (dealId: string, stage: DealStage) => void
  onStatusChange: (dealId: string, status: DealStatus) => void
  onDealClick: (deal: Deal) => void
}

export const PipelineStage: React.FC<PipelineStageProps> = ({
  stage,
  deals,
  onStageChange,
  onStatusChange,
  onDealClick
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  
  const getStageColor = (stage: DealStage) => {
    const colors = {
      created: '#9CA3AF',      // Gray
      shared: '#3B82F6',       // Blue
      accessed: '#F59E0B',     // Yellow/Amber
      engaged: '#FB923C',      // Orange
      qualified: '#10B981',    // Green
      advanced: '#8B5CF6',     // Purple
      closed: '#10B981'        // Emerald
    }
    return colors[stage]
  }

  const getStageTitle = (stage: DealStage) => {
    const titles = {
      created: 'Created',
      shared: 'Shared',
      accessed: 'Accessed',
      engaged: 'Engaged',
      qualified: 'Qualified',
      advanced: 'Advanced',
      closed: 'Closed'
    }
    return titles[stage]
  }

  const getStageIcon = (stage: DealStage) => {
    const icons = {
      created: '📝',
      shared: '🔗',
      accessed: '👀',
      engaged: '💬',
      qualified: '✅',
      advanced: '🚀',
      closed: '🎉'
    }
    return icons[stage]
  }

  // Calculate total value for the stage
  const totalValue = deals.reduce((sum, deal) => sum + (deal.dealValue || 0), 0)

  return (
    <div className="flex-1 min-w-80 bg-gray-50 rounded-lg overflow-hidden">
      {/* Enhanced Pipedrive-style Stage Header */}
      <PipelineStageHeader
        stageName={getStageTitle(stage)}
        stageKey={stage}
        dealCount={deals.length}
        totalValue={totalValue}
        currency="USD"
        color={getStageColor(stage)}
        isCollapsible={true}
        onCollapse={setIsCollapsed}
      />

      {/* Deals List */}
      {!isCollapsed && (
        <div className="p-4 space-y-3 min-h-32 bg-white">
          {deals.map(deal => (
            <PipelineDealCard
              key={deal.id}
              deal={deal}
              onStageChange={onStageChange}
              onStatusChange={onStatusChange}
              onClick={() => onDealClick(deal)}
            />
          ))}
          
          {deals.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm">
              No deals in this stage
            </div>
          )}
        </div>
      )}
    </div>
  )
}