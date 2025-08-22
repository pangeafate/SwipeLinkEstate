import React, { useState, useMemo, memo } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'

interface PipelineStageHeaderProps {
  stageName: string
  stageKey: string
  dealCount: number
  totalValue: number
  currency?: string
  color?: string
  isCollapsible?: boolean
  onCollapse?: (isCollapsed: boolean) => void
  isLoading?: boolean
}

/**
 * Formats large numbers with abbreviations (K, M, B)
 */
const formatLargeNumber = (value: number): string => {
  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(2).replace(/\.?0+$/, '')}B`
  }
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(2).replace(/\.?0+$/, '')}M`
  }
  if (value >= 10000) {
    return `${(value / 1000).toFixed(0)}K`
  }
  return value.toLocaleString()
}

/**
 * Formats currency value with proper symbol and abbreviation
 */
const formatCurrency = (value: number, currency: string = 'USD'): string => {
  const currencySymbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
  }
  
  const symbol = currencySymbols[currency] || '$'
  const formattedValue = formatLargeNumber(Math.abs(value))
  
  return `${symbol}${formattedValue}`
}

/**
 * Formats deal count with proper pluralization
 */
const formatDealCount = (count: number): string => {
  if (count === 0) return 'No deals'
  if (count === 1) return '1 deal'
  return `${count} deals`
}

const PipelineStageHeader: React.FC<PipelineStageHeaderProps> = memo(({
  stageName,
  stageKey,
  dealCount,
  totalValue,
  currency = 'USD',
  color,
  isCollapsible = false,
  onCollapse,
  isLoading = false,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  // Validate and sanitize numeric values
  const safeDealCount = isNaN(dealCount) || dealCount < 0 ? 0 : dealCount
  const safeTotalValue = isNaN(totalValue) ? 0 : totalValue

  // Format metrics
  const formattedValue = useMemo(
    () => formatCurrency(safeTotalValue, currency),
    [safeTotalValue, currency]
  )
  
  const formattedCount = useMemo(
    () => formatDealCount(safeDealCount),
    [safeDealCount]
  )

  const handleToggleCollapse = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    onCollapse?.(newState)
  }

  // Loading skeleton
  if (isLoading) {
    return (
      <div 
        data-testid="stage-header-skeleton"
        className="h-12 animate-pulse"
      >
        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-32"></div>
      </div>
    )
  }

  return (
    <div
      data-testid="pipeline-stage-header"
      role="heading"
      aria-level={3}
      aria-label={`${stageName} stage with ${safeDealCount} deals worth ${formattedValue}`}
      className={`
        stage-header
        px-4 py-3
        border-b-2
        transition-all duration-200
        ${isHovered ? 'stage-header-hovered bg-gray-50' : ''}
      `}
      style={{
        borderColor: color || '#e0e0e0',
        minHeight: '48px',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h3 
            className="stage-header-title text-sm font-medium text-gray-900 truncate"
            style={{ 
              color: '#333',
              fontSize: '14px',
              fontWeight: 500,
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap'
            }}
          >
            {stageName}
          </h3>
          <div 
            data-testid="stage-metrics"
            className="text-xs text-gray-600 mt-0.5"
            style={{ 
              color: '#666',
              fontSize: '13px' 
            }}
          >
            {formattedValue} · {formattedCount}
          </div>
        </div>
        
        {isCollapsible && (
          <button
            role="button"
            aria-label="Toggle stage collapse"
            onClick={handleToggleCollapse}
            className="ml-2 p-1 hover:bg-gray-100 rounded transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </button>
        )}
      </div>
    </div>
  )
})

PipelineStageHeader.displayName = 'PipelineStageHeader'

export default PipelineStageHeader