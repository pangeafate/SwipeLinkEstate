import React from 'react'
import type { Deal } from '../../types'
import { DealCard } from './DealCard'
import { getGridCols } from './deal-card.utils'

/**
 * DealCardGrid - Responsive grid layout for deal cards
 * 
 * Renders deals in a responsive grid with:
 * - Configurable column counts (1-4 columns)
 * - Loading skeleton states
 * - Empty state with centered message
 * - Responsive breakpoints
 */

export interface DealCardGridProps {
  deals: Deal[]
  onDealClick?: (deal: Deal) => void
  onQuickAction?: (deal: Deal, action: string) => void
  loading?: boolean
  columns?: number
}

export const DealCardGrid: React.FC<DealCardGridProps> = ({ 
  deals, 
  onDealClick, 
  onQuickAction,
  loading = false,
  columns = 3
}) => {
  
  const gridColsClass = getGridCols(columns)

  if (loading) {
    return (
      <div className={`grid ${gridColsClass} gap-6`}>
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 h-48 rounded-lg"></div>
          </div>
        ))}
      </div>
    )
  }

  if (deals.length === 0) {
    return (
      <div className="text-center py-12 col-span-full">
        <div className="text-gray-400 mb-2 text-4xl">📊</div>
        <p className="text-gray-500">No deals found</p>
      </div>
    )
  }

  return (
    <div className={`grid ${gridColsClass} gap-6`}>
      {deals.map(deal => (
        <DealCard
          key={deal.id}
          deal={deal}
          onClick={() => onDealClick?.(deal)}
          onQuickAction={(action) => onQuickAction?.(deal, action)}
        />
      ))}
    </div>
  )
}