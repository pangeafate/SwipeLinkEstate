import React from 'react'
import type { Deal } from '../../types'
import { DealCard } from './DealCard'

/**
 * DealCardList - Vertical list layout for deal cards
 * 
 * Renders deals in a vertical list with:
 * - Loading skeleton states
 * - Empty state with custom message
 * - Click handlers for deals and quick actions
 */

export interface DealCardListProps {
  deals: Deal[]
  onDealClick?: (deal: Deal) => void
  onQuickAction?: (deal: Deal, action: string) => void
  loading?: boolean
  emptyMessage?: string
}

export const DealCardList: React.FC<DealCardListProps> = ({ 
  deals, 
  onDealClick, 
  onQuickAction,
  loading = false,
  emptyMessage = "No deals found"
}) => {
  
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 h-32 rounded-lg"></div>
          </div>
        ))}
      </div>
    )
  }

  if (deals.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-2">📊</div>
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
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