import React from 'react'

/**
 * PerformanceChart - Performance comparison chart
 * 
 * Compares current month vs previous month performance.
 * Part of the modular CRMAnalytics component system.
 */

export interface PerformanceMetrics {
  dealsCreated: number
  dealsClosed: number
  revenue: number
  conversionRate: number
}

export interface PerformanceChartProps {
  thisMonth: PerformanceMetrics
  lastMonth: PerformanceMetrics
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({ 
  thisMonth, 
  lastMonth 
}) => {
  const metrics = [
    {
      label: 'Deals Created',
      current: thisMonth.dealsCreated,
      previous: lastMonth.dealsCreated,
      format: (value: number) => value.toString()
    },
    {
      label: 'Deals Closed',
      current: thisMonth.dealsClosed,
      previous: lastMonth.dealsClosed,
      format: (value: number) => value.toString()
    },
    {
      label: 'Revenue',
      current: thisMonth.revenue,
      previous: lastMonth.revenue,
      format: (value: number) => `$${value.toLocaleString()}`
    },
    {
      label: 'Conversion Rate',
      current: thisMonth.conversionRate,
      previous: lastMonth.conversionRate,
      format: (value: number) => `${value.toFixed(1)}%`
    }
  ]

  return (
    <div className="space-y-6">
      {/* Performance Comparison */}
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">This Month</h3>
          <div className="space-y-4">
            {metrics.map((metric) => (
              <div key={`current-${metric.label}`} className="bg-blue-50 rounded-lg p-3">
                <div className="text-xl font-bold text-blue-600">
                  {metric.format(metric.current)}
                </div>
                <div className="text-sm text-blue-800">{metric.label}</div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Last Month</h3>
          <div className="space-y-4">
            {metrics.map((metric) => (
              <div key={`previous-${metric.label}`} className="bg-gray-50 rounded-lg p-3">
                <div className="text-xl font-bold text-gray-600">
                  {metric.format(metric.previous)}
                </div>
                <div className="text-sm text-gray-800">{metric.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trend Indicators */}
      <div className="space-y-2">
        {metrics.map((metric) => {
          const change = metric.current - metric.previous
          const percentChange = metric.previous === 0 ? 0 : 
            ((change / metric.previous) * 100)
          const isPositive = change >= 0

          return (
            <div key={`trend-${metric.label}`} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
              <span className="text-sm text-gray-600">{metric.label}</span>
              <div className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? '↗️' : '↘️'} {Math.abs(percentChange).toFixed(1)}%
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}