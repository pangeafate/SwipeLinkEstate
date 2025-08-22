'use client'

import React, { useState } from 'react'
import type { Deal } from '../../types'
import { ActionButton } from './ActionButton'
import { 
  getTemperatureColor, 
  getStatusColor, 
  getEngagementColor, 
  formatTimeAgo, 
  getStageProgress 
} from './deal-card.utils'

/**
 * DealCard - Individual Deal Display Component
 * 
 * Compact card displaying deal information for lists and grids.
 * Used throughout the CRM interface for deal visualization.
 * 
 * Features:
 * - Client temperature indicator with test IDs
 * - Engagement score with color-coded display
 * - Deal stage visualization with progress
 * - Pipedrive-style design and hover states
 * - Accessibility support with ARIA attributes
 * - Keyboard navigation support
 */

export interface DealCardProps {
  deal: Deal
  onClick?: (deal: Deal) => void
  onQuickAction?: (action: string) => void
  showActions?: boolean
  compact?: boolean
}

// Helper function to get client initials
const getClientInitials = (name: string | null | undefined): string => {
  if (!name) return '??'
  const names = name.trim().split(' ')
  if (names.length === 1) return names[0].charAt(0).toUpperCase()
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase()
}

// Helper function to get engagement score class
const getEngagementScoreClass = (score: number): string => {
  if (score >= 80) return 'score-high'
  if (score >= 50) return 'score-medium'
  return 'score-low'
}

// Helper function to get deal stage class
const getDealStageClass = (stage: string): string => {
  const stageMap: Record<string, string> = {
    created: 'stage-created',
    shared: 'stage-shared', 
    accessed: 'stage-accessed',
    engaged: 'stage-engaged',
    qualified: 'stage-qualified',
    advanced: 'stage-advanced',
    closed: 'stage-closed'
  }
  return stageMap[stage] || 'stage-default'
}

// Helper function to get temperature class
const getTemperatureClass = (temperature: string): string => {
  const tempMap: Record<string, string> = {
    hot: 'temperature-hot',
    warm: 'temperature-warm',
    cold: 'temperature-cold'
  }
  return tempMap[temperature] || 'temperature-cold'
}

export const DealCard: React.FC<DealCardProps> = ({ 
  deal, 
  onClick, 
  onQuickAction, 
  showActions = true,
  compact = false 
}) => {
  const [isHovered, setIsHovered] = useState(false)
  
  // Provide fallback values for missing data
  const dealName = deal.dealName || 'Untitled Deal'
  const clientName = deal.clientName || 'Unknown Client'
  const clientEmail = deal.clientEmail || null
  const engagementScore = deal.engagementScore ?? 0
  const dealValue = deal.dealValue || 0
  const propertyCount = deal.propertyCount || deal.propertyIds?.length || 0
  const clientTemperature = deal.clientTemperature || 'cold'
  const dealStage = deal.dealStage || 'created'
  const lastActivityAt = deal.lastActivityAt
  
  const handleClick = () => {
    onClick?.(deal)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const getAriaLabel = (): string => {
    return `Deal: ${dealName} for ${clientName}`
  }
  
  return (
    <div 
      data-testid="deal-card"
      className={`
        deal-card pipedrive-card
        bg-white rounded-lg shadow-sm border border-gray-200 
        ${onClick ? 'cursor-pointer hover:shadow-md hover:border-blue-500' : ''}
        ${isHovered ? 'deal-card--hover' : ''}
        transition-all duration-200
        ${compact ? 'p-3' : 'p-4'}
      `}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onKeyDown={handleKeyDown}
      tabIndex={onClick ? 0 : -1}
      role={onClick ? 'button' : 'article'}
      aria-label={getAriaLabel()}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 role="heading" className={`font-semibold text-gray-900 truncate ${compact ? 'text-sm' : 'text-base'}`}>
            {dealName}
          </h3>
          <p className="text-sm text-gray-600 truncate">{clientName}</p>
          {clientEmail && (
            <p className="text-xs text-gray-500 truncate">{clientEmail}</p>
          )}
        </div>
        
        {/* Client Avatar */}
        <div 
          data-testid="client-avatar" 
          className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600 mr-2"
        >
          {getClientInitials(clientName)}
        </div>
        
        {/* Temperature indicator */}
        <div className="flex items-center space-x-2">
          <div 
            data-testid="temperature-indicator"
            className={`w-3 h-3 rounded-full ${getTemperatureClass(clientTemperature)} ${getTemperatureColor(clientTemperature)}`}
            title={`${clientTemperature.toUpperCase()} lead`}
            aria-label={`${clientTemperature === 'hot' ? 'Hot' : clientTemperature === 'warm' ? 'Warm' : 'Cold'} lead`}
          />
          {!compact && (
            <span className="text-xs text-gray-500 uppercase tracking-wide">
              {clientTemperature}
            </span>
          )}
        </div>
      </div>

      {/* Deal Value */}
      <div className="mb-3">
        <span className="text-2xl font-bold text-green-600">
          {formatCurrency(dealValue)}
        </span>
      </div>

      {/* Key Metrics Grid */}
      <div className={`grid grid-cols-2 gap-3 mb-3 ${compact ? 'text-xs' : 'text-sm'}`}>
        <div>
          <span className="text-gray-600">Properties:</span>
          <span className="font-medium ml-1">
            {propertyCount} {propertyCount === 1 ? 'property' : 'properties'}
          </span>
        </div>
        
        <div>
          <span className="text-gray-600">Engagement:</span>
          <span 
            data-testid="engagement-score"
            className={`ml-1 font-medium ${getEngagementScoreClass(engagementScore)} ${getEngagementColor(engagementScore)}`}
          >
            {engagementScore}%
          </span>
        </div>
        
        <div>
          <span className="text-gray-600">Sessions:</span>
          <span className="font-medium ml-1">{deal.sessionCount || 0}</span>
        </div>
        
        <div>
          <span className="text-gray-600">Stage:</span>
          <span 
            data-testid="deal-stage"
            className={`ml-1 font-medium ${getDealStageClass(dealStage)}`}
          >
            {dealStage}
          </span>
        </div>
      </div>

      {/* Stage Progress Indicator */}
      <div className="mb-3">
        <div 
          data-testid="stage-indicator"
          className="stage-indicator w-full bg-gray-200 rounded-full h-1"
        >
          <div 
            className="bg-blue-600 h-1 rounded-full transition-all duration-300"
            style={{ width: `${getStageProgress(dealStage)}%` }}
          />
        </div>
      </div>

      {/* Status Badge & Last Activity */}
      <div className="flex items-center justify-between mb-3">
        <span className={`
          px-2 py-1 rounded-full text-xs font-medium border
          ${getStatusColor(deal.dealStatus || 'active')}
        `}>
          {(deal.dealStatus || 'active').replace('-', ' ').toUpperCase()}
        </span>
        
        <span 
          data-testid="last-activity"
          className="text-xs text-gray-500"
        >
          {lastActivityAt ? (
            <>Last activity: {formatTimeAgo(lastActivityAt)}</>
          ) : (
            'No activity'
          )}
        </span>
      </div>

      {/* Tags */}
      {deal.tags && deal.tags.length > 0 && (
        <div className="mb-3">
          <div className="flex flex-wrap gap-1">
            {deal.tags.slice(0, 3).map(tag => (
              <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                {tag}
              </span>
            ))}
            {deal.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-xs">
                +{deal.tags.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {showActions && !compact && (
        <div className="pt-3 border-t border-gray-100">
          <div className="grid grid-cols-3 gap-2">
            <ActionButton
              icon="📞"
              label="Call"
              onClick={() => onQuickAction?.('call')}
              variant="primary"
            />
            <ActionButton
              icon="📧"
              label="Email"
              onClick={() => onQuickAction?.('email')}
              variant="secondary"
            />
            <ActionButton
              icon="📋"
              label="Tasks"
              onClick={() => onQuickAction?.('tasks')}
              variant="secondary"
            />
          </div>
        </div>
      )}

      {/* Compact Actions */}
      {showActions && compact && (
        <div className="flex justify-end space-x-1">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onQuickAction?.('call')
            }}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            title="Call client"
          >
            📞
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onQuickAction?.('email')
            }}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            title="Email client"
          >
            📧
          </button>
        </div>
      )}
    </div>
  )
}