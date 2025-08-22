import React from 'react'
import type { DealFilters, DealStatus, ClientTemperature } from '../../types'

interface PipelineFiltersProps {
  filters: DealFilters
  onFiltersChange: (filters: DealFilters) => void
  onRefresh: () => void
}

export const PipelineFilters: React.FC<PipelineFiltersProps> = ({
  filters,
  onFiltersChange,
  onRefresh
}) => {
  const handleStatusFilter = (status: DealStatus) => {
    const currentStatuses = filters.status || []
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status]
    
    onFiltersChange({ ...filters, status: newStatuses })
  }

  const handleTemperatureFilter = (temperature: ClientTemperature) => {
    onFiltersChange({ 
      ...filters, 
      clientTemperature: filters.clientTemperature === temperature ? undefined : temperature 
    })
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-900">Pipeline Filters</h3>
        <button
          onClick={onRefresh}
          className="text-blue-600 hover:text-blue-700 text-sm flex items-center space-x-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Refresh</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
          <input
            type="text"
            placeholder="Search deals..."
            value={filters.search || ''}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <div className="flex flex-wrap gap-2">
            {(['active', 'qualified', 'nurturing'] as DealStatus[]).map(status => (
              <button
                key={status}
                onClick={() => handleStatusFilter(status)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  filters.status?.includes(status)
                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Temperature Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Temperature</label>
          <div className="flex flex-wrap gap-2">
            {(['hot', 'warm', 'cold'] as ClientTemperature[]).map(temp => (
              <button
                key={temp}
                onClick={() => handleTemperatureFilter(temp)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors flex items-center space-x-1 ${
                  filters.clientTemperature === temp
                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{temp === 'hot' ? '🔥' : temp === 'warm' ? '⚡' : '❄️'}</span>
                <span>{temp}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Active Filters Summary */}
      {(filters.search || filters.status?.length || filters.clientTemperature) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>Active filters:</span>
              {filters.search && (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  Search: "{filters.search}"
                </span>
              )}
              {filters.status?.length && (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                  Status: {filters.status.length} selected
                </span>
              )}
              {filters.clientTemperature && (
                <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded">
                  Temperature: {filters.clientTemperature}
                </span>
              )}
            </div>
            
            <button
              onClick={() => onFiltersChange({})}
              className="text-red-600 hover:text-red-700 text-sm"
            >
              Clear all
            </button>
          </div>
        </div>
      )}
    </div>
  )
}