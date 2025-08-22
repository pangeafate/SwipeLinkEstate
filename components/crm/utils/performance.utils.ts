/**
 * Performance utility functions for CRM analytics
 */

export interface PerformanceTrend {
  direction: 'up' | 'down'
  percentage: number
}

export const getPerformanceTrend = (current: number, previous: number): PerformanceTrend | null => {
  if (previous === 0 && current === 0) return null
  if (previous === 0) return { direction: 'up', percentage: 100 }
  
  const percentage = Math.round(((current - previous) / previous) * 100)
  return {
    direction: percentage >= 0 ? 'up' as const : 'down' as const,
    percentage: Math.abs(percentage)
  }
}