'use client'

import React, { useState } from 'react'
import { usePathname } from 'next/navigation'
import { useCRMDashboard } from '@/components/crm/hooks/useCRMDashboard'
import DealPipeline from '@/components/crm/components/DealPipeline'
import CRMSidebar from '@/components/crm/components/sidebar/CRMSidebar'
// import { CRMAnalytics } from '@/components/crm/components/CRMAnalytics'
// import { TaskAutomation } from '@/components/crm/components/TaskAutomation'

/**
 * CRM Dashboard Page
 * Phase 1 Foundation Implementation
 */
export default function CRMDashboard() {
  const pathname = usePathname()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const { 
    dashboard, 
    loading, 
    error,
    refresh 
  } = useCRMDashboard()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Error loading CRM data: {error}</div>
      </div>
    )
  }

  // Prepare tasks data for sidebar
  const upcomingTasks = dashboard?.recentActivity?.tasks?.map(task => ({
    id: task.id || Math.random().toString(),
    title: task.title || task.description || 'Untitled Task',
    dueDate: task.dueDate || new Date().toISOString(),
    priority: task.priority || 'medium' as 'high' | 'medium' | 'low'
  })) || []

  // Prepare hot leads data for sidebar
  const hotLeads = dashboard?.recentActivity?.hotLeads || []

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <CRMSidebar
        currentPath={pathname}
        upcomingTasks={upcomingTasks}
        hotLeads={hotLeads}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      
      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-[60px]' : 'lg:ml-[280px]'}`}>
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">CRM Dashboard</h1>
            <p className="text-gray-600 mt-2">Link-as-Deal Management System</p>
          </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <SummaryCard
          title="Total Deals"
          value={dashboard?.summary.totalDeals || 0}
          trend="up"
          color="blue"
        />
        <SummaryCard
          title="Hot Leads"
          value={dashboard?.summary.hotLeads || 0}
          trend="up"
          color="red"
        />
        <SummaryCard
          title="Pending Tasks"
          value={dashboard?.summary.pendingTasks || 0}
          color="yellow"
        />
        <SummaryCard
          title="This Month Revenue"
          value={`$${(dashboard?.summary.thisMonthRevenue || 0).toLocaleString()}`}
          trend="up"
          color="green"
        />
      </div>

          {/* Deal Pipeline - Full Width */}
          <div className="mb-8">
            <DealPipeline 
              pipeline={dashboard?.pipeline}
              onRefresh={refresh}
            />
          </div>

          {/* Analytics Section */}
          <div className="mt-8" data-testid="crm-analytics">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Analytics</h3>
              <p className="text-gray-600">Performance metrics will appear here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Summary Card Component
 */
function SummaryCard({ 
  title, 
  value, 
  trend, 
  color = 'gray' 
}: { 
  title: string
  value: string | number
  trend?: 'up' | 'down' | 'stable'
  color?: string 
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700',
    red: 'bg-red-50 text-red-700',
    yellow: 'bg-yellow-50 text-yellow-700',
    green: 'bg-green-50 text-green-700',
    gray: 'bg-gray-50 text-gray-700'
  }

  return (
    <div className={`rounded-lg p-6 ${colorClasses[color as keyof typeof colorClasses]}`}>
      <p className="text-sm font-medium opacity-80">{title}</p>
      <div className="mt-2 flex items-baseline">
        <p className="text-2xl font-bold">{value}</p>
        {trend && (
          <span className={`ml-2 text-sm ${
            trend === 'up' ? 'text-green-600' : 
            trend === 'down' ? 'text-red-600' : 
            'text-gray-600'
          }`}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
          </span>
        )}
      </div>
    </div>
  )
}

