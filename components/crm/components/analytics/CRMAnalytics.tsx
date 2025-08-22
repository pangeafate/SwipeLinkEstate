'use client'

import React, { useState, useEffect } from 'react'
import type { CRMDashboard } from '../../types'
import { CRMService } from '../../crm.service'
import { SummaryCard } from './SummaryCard'
import { PipelineVisualization } from './PipelineVisualization'
import { PerformanceChart } from './PerformanceChart'
import { ConversionFunnel } from './ConversionFunnel'
import { RecentActivityFeed } from './RecentActivityFeed'
import { TasksList } from './TasksList'
import { getPerformanceTrend } from '../../utils/performance.utils'

/**
 * CRMAnalytics - Main CRM Analytics Dashboard
 * 
 * Provides comprehensive overview of CRM performance including:
 * - Deal pipeline metrics
 * - Engagement analytics  
 * - Revenue projections
 * - Performance trends
 * 
 * Refactored into modular components following development guidelines.
 */

export interface CRMAnalyticsProps {
  agentId?: string
}

export const CRMAnalytics: React.FC<CRMAnalyticsProps> = ({ agentId }) => {
  const [dashboardData, setDashboardData] = useState<CRMDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d'>('30d')

  useEffect(() => {
    loadDashboardData()
  }, [agentId, selectedTimeframe])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const data = await CRMService.getCRMDashboard(agentId)
      setDashboardData(data)
      
    } catch (err) {
      console.error('Error loading CRM dashboard:', err)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-semibold">Error Loading Dashboard</h3>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={loadDashboardData}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">
          <p>No dashboard data available</p>
        </div>
      </div>
    )
  }

  const { summary, pipeline, recentActivity, upcomingTasks, performanceMetrics } = dashboardData

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">CRM Analytics</h1>
          <p className="text-gray-600">Real estate deal pipeline and performance metrics</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value as any)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          
          <button
            onClick={loadDashboardData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <SummaryCard
          title="Total Deals"
          value={summary.totalDeals}
          icon="📊"
          trend={getPerformanceTrend(performanceMetrics.thisMonth.dealsCreated, performanceMetrics.lastMonth.dealsCreated)}
        />
        <SummaryCard
          title="Hot Leads"
          value={summary.hotLeads}
          icon="🔥"
          trend={null}
        />
        <SummaryCard
          title="Pending Tasks"
          value={summary.pendingTasks}
          icon="✅"
          trend={null}
        />
        <SummaryCard
          title="Revenue"
          value={`$${summary.thisMonthRevenue.toLocaleString()}`}
          icon="💰"
          trend={getPerformanceTrend(performanceMetrics.thisMonth.revenue, performanceMetrics.lastMonth.revenue)}
        />
      </div>

      {/* Pipeline Overview */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Deal Pipeline</h2>
        <PipelineVisualization pipeline={pipeline} />
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Performance Trends</h2>
          <PerformanceChart 
            thisMonth={performanceMetrics.thisMonth}
            lastMonth={performanceMetrics.lastMonth}
          />
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Conversion Funnel</h2>
          <ConversionFunnel pipeline={pipeline} />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
        <RecentActivityFeed activity={recentActivity} />
      </div>

      {/* Upcoming Tasks Preview */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Upcoming Tasks</h2>
        <TasksList tasks={upcomingTasks.slice(0, 5)} />
      </div>
    </div>
  )
}