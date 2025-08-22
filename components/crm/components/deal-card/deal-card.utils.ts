/**
 * Deal Card Utility Functions
 * 
 * Helper functions for deal card components including:
 * - Color mapping for temperature and status
 * - Date formatting
 * - Progress calculations
 */

import type { ClientTemperature, DealStatus } from '../../types'

/**
 * Get background color class for client temperature indicator
 */
export const getTemperatureColor = (temp: ClientTemperature): string => {
  const colors = {
    hot: 'bg-red-500',
    warm: 'bg-orange-500', 
    cold: 'bg-gray-500'
  }
  return colors[temp]
}

/**
 * Get status color classes for deal status badge
 */
export const getStatusColor = (status: DealStatus): string => {
  const colors = {
    active: 'bg-blue-100 text-blue-800 border-blue-200',
    qualified: 'bg-green-100 text-green-800 border-green-200',
    nurturing: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'closed-won': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'closed-lost': 'bg-red-100 text-red-800 border-red-200'
  }
  return colors[status]
}

/**
 * Get engagement score color based on score value
 */
export const getEngagementColor = (score: number): string => {
  if (score >= 80) return 'text-red-600 font-semibold'
  if (score >= 50) return 'text-orange-600 font-medium'
  return 'text-gray-600'
}

/**
 * Format relative time string for last activity
 */
export const formatTimeAgo = (dateString: string | null): string => {
  if (!dateString) return 'No activity'
  
  const now = new Date()
  const date = new Date(dateString)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

/**
 * Get progress percentage for deal stage
 */
export const getStageProgress = (stage: string): number => {
  const stageProgress = {
    created: 15,
    shared: 30,
    accessed: 45,
    engaged: 60,
    qualified: 75,
    advanced: 90,
    closed: 100
  }
  return stageProgress[stage as keyof typeof stageProgress] || 0
}

/**
 * Get grid column classes for responsive layouts
 */
export const getGridCols = (columns: number): string => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  }
  return gridCols[columns as keyof typeof gridCols] || gridCols[3]
}