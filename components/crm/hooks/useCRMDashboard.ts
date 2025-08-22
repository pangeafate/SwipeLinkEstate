import { useState, useEffect } from 'react'
import type { CRMDashboard } from '../types'
import { CRMService } from '../crm.service'

/**
 * useCRMDashboard - React Hook for CRM Dashboard Data
 * 
 * Provides comprehensive CRM dashboard data with real-time updates,
 * error handling, and loading states.
 */
export const useCRMDashboard = (
  agentId?: string,
  refreshInterval?: number
) => {
  const [dashboard, setDashboard] = useState<CRMDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const loadDashboard = async () => {
    try {
      setError(null)
      const data = await CRMService.getCRMDashboard(agentId)
      setDashboard(data)
      setLastUpdated(new Date())
    } catch (err) {
      console.error('Error loading CRM dashboard:', err)
      setError(err instanceof Error ? err.message : 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  const refresh = () => {
    setLoading(true)
    loadDashboard()
  }

  useEffect(() => {
    loadDashboard()
  }, [agentId])

  // Auto-refresh if interval is specified
  useEffect(() => {
    if (!refreshInterval) return

    const interval = setInterval(loadDashboard, refreshInterval)
    return () => clearInterval(interval)
  }, [refreshInterval, agentId])

  return {
    dashboard,
    loading,
    error,
    lastUpdated,
    refresh
  }
}

/**
 * useCRMMetrics - Hook for Key CRM Metrics
 */
export const useCRMMetrics = (agentId?: string) => {
  const { dashboard, loading, error } = useCRMDashboard(agentId)

  const metrics = dashboard ? {
    totalDeals: dashboard.summary.totalDeals,
    hotLeads: dashboard.summary.hotLeads,
    pendingTasks: dashboard.summary.pendingTasks,
    thisMonthRevenue: dashboard.summary.thisMonthRevenue,
    conversionRate: dashboard.pipeline.overallConversionRate,
    averageDealValue: dashboard.pipeline.averageDealValue,
    pipelineValue: dashboard.pipeline.totalPipelineValue,
    performanceGrowth: {
      deals: getPerformanceChange(
        dashboard.performanceMetrics.thisMonth.dealsCreated,
        dashboard.performanceMetrics.lastMonth.dealsCreated
      ),
      revenue: getPerformanceChange(
        dashboard.performanceMetrics.thisMonth.revenue,
        dashboard.performanceMetrics.lastMonth.revenue
      ),
      conversion: getPerformanceChange(
        dashboard.performanceMetrics.thisMonth.conversionRate,
        dashboard.performanceMetrics.lastMonth.conversionRate
      )
    }
  } : null

  return {
    metrics,
    loading,
    error
  }
}

const getPerformanceChange = (current: number, previous: number) => {
  if (previous === 0) return null
  return ((current - previous) / previous) * 100
}