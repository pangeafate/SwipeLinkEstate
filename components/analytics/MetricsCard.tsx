import React from 'react'

export interface MetricsCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: {
    value: number
    label: string
    direction: 'up' | 'down' | 'neutral'
  }
  icon?: string
  className?: string
  isLoading?: boolean
}

export function MetricsCard({
  title,
  value,
  subtitle,
  trend,
  icon,
  className = '',
  isLoading = false
}: MetricsCardProps) {
  const formatValue = (val: string | number): string => {
    if (typeof val === 'number') {
      if (val >= 1000000) {
        return `${(val / 1000000).toFixed(1)}M`
      }
      if (val >= 1000) {
        return `${(val / 1000).toFixed(1)}k`
      }
      return val.toString()
    }
    return val
  }

  const getTrendColor = (direction: 'up' | 'down' | 'neutral') => {
    switch (direction) {
      case 'up':
        return 'text-green-600'
      case 'down':
        return 'text-red-600'
      case 'neutral':
        return 'text-gray-500'
      default:
        return 'text-gray-500'
    }
  }

  const getTrendIcon = (direction: 'up' | 'down' | 'neutral') => {
    switch (direction) {
      case 'up':
        return '↗️'
      case 'down':
        return '↘️'
      case 'neutral':
        return '→'
      default:
        return '→'
    }
  }

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-2">
            <div className="h-4 bg-gray-200 rounded w-20"></div>
            {icon && <div className="h-6 w-6 bg-gray-200 rounded"></div>}
          </div>
          <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-12"></div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-500 truncate">{title}</h3>
        {icon && (
          <span className="text-2xl" role="img" aria-label={title}>
            {icon}
          </span>
        )}
      </div>
      
      <div className="flex items-baseline space-x-2">
        <p className="text-2xl font-bold text-gray-900" title={value.toString()}>
          {formatValue(value)}
        </p>
        
        {trend && (
          <div className={`flex items-center text-sm ${getTrendColor(trend.direction)}`}>
            <span className="mr-1" role="img" aria-label={`trend ${trend.direction}`}>
              {getTrendIcon(trend.direction)}
            </span>
            <span className="font-medium">{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
      
      {subtitle && (
        <p className="text-xs text-gray-500 mt-1" title={subtitle}>
          {subtitle}
        </p>
      )}
      
      {trend?.label && (
        <p className="text-xs text-gray-400 mt-1">
          {trend.label}
        </p>
      )}
    </div>
  )
}

export default MetricsCard