import React from 'react'
import type { TaskFilters, TaskPriority } from '../../types'

interface TaskFiltersProps {
  filters: TaskFilters
  onFiltersChange: (filters: TaskFilters) => void
}

export const TaskFilters: React.FC<TaskFiltersProps> = ({ filters, onFiltersChange }) => {
  return (
    <div className="flex items-center space-x-3">
      {/* Priority Filter */}
      <select
        value={filters.priority?.[0] || ''}
        onChange={(e) => {
          const priority = e.target.value as TaskPriority
          onFiltersChange({
            ...filters,
            priority: priority ? [priority] : undefined
          })
        }}
        className="border border-gray-300 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500"
      >
        <option value="">All Priorities</option>
        <option value="high">High Priority</option>
        <option value="medium">Medium Priority</option>
        <option value="low">Low Priority</option>
      </select>

      {/* Type Filter */}
      <select
        value={filters.type?.[0] || ''}
        onChange={(e) => {
          const type = e.target.value
          onFiltersChange({
            ...filters,
            type: type ? [type] : undefined
          })
        }}
        className="border border-gray-300 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500"
      >
        <option value="">All Types</option>
        <option value="call">Calls</option>
        <option value="email">Emails</option>
        <option value="showing">Showings</option>
        <option value="follow-up">Follow-ups</option>
        <option value="nurture">Nurture</option>
      </select>
    </div>
  )
}