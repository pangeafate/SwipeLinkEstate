import React from 'react'

export interface ChartProps {
  title: string
  data: Array<{ label: string; value: number; color?: string }>
  type: 'bar' | 'line' | 'pie' | 'doughnut'
  className?: string
  height?: number
}

/**
 * Simple chart component using CSS for basic visualizations
 * In production, you might want to use a library like Chart.js or Recharts
 */
export function AnalyticsChart({ title, data, type, className = '', height = 200 }: ChartProps) {
  const maxValue = Math.max(...data.map(d => d.value), 1)

  const renderBarChart = () => (
    <div className="space-y-3" style={{ height }}>
      {data.map((item, index) => (
        <div key={item.label} className="flex items-center space-x-3">
          <div className="w-20 text-sm text-gray-600 truncate" title={item.label}>
            {item.label}
          </div>
          <div className="flex-1 flex items-center">
            <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
              <div
                className={`h-4 rounded-full transition-all duration-300 ${
                  item.color || 'bg-blue-500'
                }`}
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              />
            </div>
            <span className="ml-3 text-sm font-medium text-gray-900 w-8">
              {item.value}
            </span>
          </div>
        </div>
      ))}
    </div>
  )

  const renderPieChart = () => {
    const total = data.reduce((sum, item) => sum + item.value, 0)
    if (total === 0) {
      return (
        <div className="flex items-center justify-center h-32 text-gray-500">
          No data available
        </div>
      )
    }

    return (
      <div className="flex items-center space-x-6">
        {/* Simple pie representation using flex */}
        <div className="flex-1">
          <div className="space-y-2">
            {data.map((item, index) => {
              const percentage = (item.value / total) * 100
              return (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-3 h-3 rounded-full ${item.color || 'bg-blue-500'}`}
                    />
                    <span className="text-sm text-gray-600">{item.label}</span>
                  </div>
                  <div className="text-sm font-medium">
                    {item.value} ({percentage.toFixed(1)}%)
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  const renderLineChart = () => {
    // Simplified line chart representation
    return (
      <div className="space-y-4" style={{ height }}>
        <div className="relative h-32 bg-gray-50 rounded border flex items-end justify-around p-2">
          {data.map((item, index) => (
            <div
              key={item.label}
              className="flex flex-col items-center"
              style={{ height: '100%' }}
            >
              <div
                className={`w-6 rounded-t transition-all duration-300 ${
                  item.color || 'bg-blue-500'
                }`}
                style={{
                  height: `${(item.value / maxValue) * 80}%`,
                  marginTop: `${100 - (item.value / maxValue) * 80}%`
                }}
              />
              <span className="text-xs text-gray-600 mt-1 truncate max-w-12" title={item.label}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
        <div className="flex justify-around text-xs text-gray-500">
          {data.map((item) => (
            <div key={item.label} className="text-center">
              <div className="font-medium">{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return renderBarChart()
      case 'pie':
      case 'doughnut':
        return renderPieChart()
      case 'line':
        return renderLineChart()
      default:
        return renderBarChart()
    }
  }

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-32 text-gray-500">
          No data available
        </div>
      ) : (
        renderChart()
      )}
    </div>
  )
}

export default AnalyticsChart