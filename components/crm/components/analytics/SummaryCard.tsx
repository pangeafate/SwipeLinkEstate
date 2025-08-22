import React from 'react'

/**
 * SummaryCard - Metric display card for CRM dashboard
 * 
 * Displays key metrics with optional trend indicators.
 * Part of the modular CRMAnalytics component system.
 */

export interface SummaryCardProps {
  title: string
  value: string | number
  icon: string
  trend?: {
    direction: 'up' | 'down'
    percentage: number
  } | null
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ 
  title, 
  value, 
  icon, 
  trend 
}) => (
  <div className="bg-white rounded-xl shadow-lg p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-600 text-sm font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {trend && (
          <div className={`flex items-center mt-2 text-sm ${
            trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
          }`}>
            <span className="mr-1">
              {trend.direction === 'up' ? '↗️' : '↘️'}
            </span>
            <span>{trend.percentage}% vs last month</span>
          </div>
        )}
      </div>
      <div className="text-3xl">{icon}</div>
    </div>
  </div>
)