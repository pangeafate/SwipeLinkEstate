'use client'

import React, { useState, useEffect } from 'react'
import type { CRMDashboard, PipelineMetrics } from '../types'
import { CRMService } from '../crm.service'

/**
 * CRMAnalytics - Main CRM Analytics Dashboard
 * 
 * Provides comprehensive overview of CRM performance including:
 * - Deal pipeline metrics
 * - Engagement analytics  
 * - Revenue projections
 * - Performance trends
 */
const CRMAnalytics: React.FC<{ agentId?: string }> = ({ agentId }) => {
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

/**
 * Summary Card Component
 */
const SummaryCard: React.FC<{
  title: string
  value: string | number
  icon: string
  trend?: { direction: 'up' | 'down', percentage: number } | null
}> = ({ title, value, icon, trend }) => (
  <div className="bg-white rounded-xl shadow-lg p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-600 text-sm font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {trend && (
          <div className={`flex items-center mt-2 text-sm ${trend.direction === 'up' ? 'text-green-600' : 'text-red-600'}`}>
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

/**
 * Pipeline Visualization Component
 */
const PipelineVisualization: React.FC<{ pipeline: PipelineMetrics }> = ({ pipeline }) => (
  <div className="space-y-4">
    {/* Stage breakdown */}
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
      {Object.entries(pipeline.dealsByStage).map(([stage, count]) => (
        <div key={stage} className="text-center">
          <div className="bg-blue-100 rounded-lg p-3">
            <div className="text-2xl font-bold text-blue-600">{count}</div>
            <div className="text-sm text-gray-600 capitalize">{stage.replace('_', ' ')}</div>
          </div>
        </div>
      ))}
    </div>
    
    {/* Key metrics */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
      <div className="text-center">
        <div className="text-lg font-semibold text-gray-900">
          {(pipeline.overallConversionRate * 100).toFixed(1)}%
        </div>
        <div className="text-sm text-gray-600">Conversion Rate</div>
      </div>
      <div className="text-center">
        <div className="text-lg font-semibold text-gray-900">
          ${pipeline.averageDealValue.toLocaleString()}
        </div>
        <div className="text-sm text-gray-600">Avg Deal Value</div>
      </div>
      <div className="text-center">
        <div className="text-lg font-semibold text-gray-900">
          {pipeline.averageDealCycle} days
        </div>
        <div className="text-sm text-gray-600">Avg Deal Cycle</div>
      </div>
    </div>
  </div>
)

/**
 * Performance Chart Component  
 */
const PerformanceChart: React.FC<{
  thisMonth: any
  lastMonth: any
}> = ({ thisMonth, lastMonth }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <div>
        <h4 className="font-semibold text-gray-900">This Month</h4>
        <div className="mt-2 space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Deals Created</span>
            <span className="font-semibold">{thisMonth.dealsCreated}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Deals Closed</span>
            <span className="font-semibold">{thisMonth.dealsClosed}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Revenue</span>
            <span className="font-semibold">${thisMonth.revenue.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Conversion Rate</span>
            <span className="font-semibold">{(thisMonth.conversionRate * 100).toFixed(1)}%</span>
          </div>
        </div>
      </div>
      
      <div>
        <h4 className="font-semibold text-gray-900">Last Month</h4>
        <div className="mt-2 space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Deals Created</span>
            <span className="font-semibold">{lastMonth.dealsCreated}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Deals Closed</span>
            <span className="font-semibold">{lastMonth.dealsClosed}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Revenue</span>
            <span className="font-semibold">${lastMonth.revenue.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Conversion Rate</span>
            <span className="font-semibold">{(lastMonth.conversionRate * 100).toFixed(1)}%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
)

/**
 * Conversion Funnel Component
 */
const ConversionFunnel: React.FC<{ pipeline: PipelineMetrics }> = ({ pipeline }) => (
  <div className="space-y-3">
    <FunnelStage 
      label="Links Created" 
      count={pipeline.totalDeals} 
      percentage={100}
      width="w-full"
    />
    <FunnelStage 
      label="Client Engaged" 
      count={Math.round(pipeline.totalDeals * pipeline.linkToEngagementRate)} 
      percentage={pipeline.linkToEngagementRate * 100}
      width="w-4/5"
    />
    <FunnelStage 
      label="Qualified Leads" 
      count={Math.round(pipeline.totalDeals * pipeline.linkToEngagementRate * pipeline.engagementToQualifiedRate)} 
      percentage={pipeline.engagementToQualifiedRate * 100}
      width="w-3/5"
    />
    <FunnelStage 
      label="Deals Closed" 
      count={Math.round(pipeline.totalDeals * pipeline.overallConversionRate)} 
      percentage={pipeline.overallConversionRate * 100}
      width="w-2/5"
    />
  </div>
)

const FunnelStage: React.FC<{
  label: string
  count: number
  percentage: number
  width: string
}> = ({ label, count, percentage, width }) => (
  <div className="flex items-center space-x-3">
    <div className={`${width} bg-blue-200 rounded h-8 flex items-center justify-between px-3`}>
      <span className="text-sm font-medium text-blue-800">{label}</span>
      <span className="text-sm font-semibold text-blue-900">{count}</span>
    </div>
    <div className="text-sm text-gray-600 min-w-[3rem]">
      {percentage.toFixed(1)}%
    </div>
  </div>
)

/**
 * Recent Activity Feed Component
 */
const RecentActivityFeed: React.FC<{ activity: any }> = ({ activity }) => (
  <div className="space-y-4">
    {activity.newDeals.length > 0 && (
      <div>
        <h4 className="font-semibold text-gray-900 mb-2">New Deals (24h)</h4>
        <div className="space-y-2">
          {activity.newDeals.map((deal: any) => (
            <div key={deal.id} className="flex items-center justify-between p-2 bg-green-50 rounded">
              <span className="text-green-800">{deal.dealName}</span>
              <span className="text-sm text-green-600">{new Date(deal.createdAt).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    )}
    
    {activity.hotLeads.length > 0 && (
      <div>
        <h4 className="font-semibold text-gray-900 mb-2">Hot Leads</h4>
        <div className="space-y-2">
          {activity.hotLeads.map((deal: any) => (
            <div key={deal.id} className="flex items-center justify-between p-2 bg-red-50 rounded">
              <span className="text-red-800">{deal.dealName}</span>
              <span className="text-sm text-red-600">Score: {deal.engagementScore}</span>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
)

/**
 * Tasks List Component
 */
const TasksList: React.FC<{ tasks: any[] }> = ({ tasks }) => (
  <div className="space-y-2">
    {tasks.length === 0 ? (
      <p className="text-gray-500">No upcoming tasks</p>
    ) : (
      tasks.map(task => (
        <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
          <div>
            <span className="font-medium text-gray-900">{task.title}</span>
            <p className="text-sm text-gray-600">{task.description}</p>
          </div>
          <div className="text-right">
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              task.priority === 'high' ? 'bg-red-100 text-red-800' :
              task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {task.priority}
            </span>
            {task.dueDate && (
              <p className="text-xs text-gray-500 mt-1">
                Due: {new Date(task.dueDate).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      ))
    )}
  </div>
)

/**
 * Helper functions
 */
const getPerformanceTrend = (current: number, previous: number) => {
  if (previous === 0) return null
  
  const percentage = Math.round(((current - previous) / previous) * 100)
  return {
    direction: percentage >= 0 ? 'up' as const : 'down' as const,
    percentage: Math.abs(percentage)
  }
}

export default CRMAnalytics