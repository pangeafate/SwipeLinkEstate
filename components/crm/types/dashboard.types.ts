/**
 * Dashboard and Analytics Type Definitions for SwipeLink Estate CRM
 * Part of the modular CRM type system following CRM Master Specification
 * 
 * Comprehensive dashboard widgets, analytics metrics, and performance indicators
 * for real estate CRM analytics and business intelligence.
 * 
 * @version 1.0.0
 * @author SwipeLink Estate CRM Team
 * @see /DevelopmentGuidelines/CRM-MASTER-SPECIFICATION.md Section 9
 */

import { DatabaseRecord } from '../types'
import { Deal, DealStage, DealStatus, ClientTemperature } from './deal.types'
import { Task, TaskPriority, TaskStatus } from './task.types'
import { ClientProfile } from './client.types'

/**
 * Time period options for analytics queries
 */
export type AnalyticsTimePeriod = 
  | 'today'
  | 'yesterday'
  | 'last_7_days'
  | 'last_30_days'
  | 'this_month'
  | 'last_month'
  | 'this_quarter'
  | 'last_quarter'
  | 'this_year'
  | 'last_year'
  | 'custom'

/**
 * Dashboard widget types for dynamic dashboard configuration
 */
export type DashboardWidgetType = 
  | 'pipeline_overview'
  | 'performance_metrics'
  | 'recent_activity'
  | 'upcoming_tasks'
  | 'hot_leads'
  | 'conversion_funnel'
  | 'revenue_chart'
  | 'engagement_trends'
  | 'agent_leaderboard'
  | 'deal_forecast'
  | 'task_completion'
  | 'client_insights'

/**
 * Comprehensive pipeline analytics and metrics following CRM Master Specification
 */
export interface PipelineMetrics {
  /** Time period for these metrics */
  period: {
    start: string
    end: string
    label: string
    type: AnalyticsTimePeriod
  }
  
  /** Deal Volume Metrics */
  volume: {
    totalDeals: number
    activeDeals: number
    newDeals: number // Created in this period
    closedDeals: number
    dealsByStage: Record<DealStage, number>
    dealsByStatus: Record<DealStatus, number>
    dealsByTemperature: Record<ClientTemperature, number>
  }
  
  /** Conversion Rate Metrics (following CRM Master Spec Section 9.2) */
  conversion: {
    linkToAccessRate: number // Links accessed / Links created
    accessToEngagementRate: number // Engaged / Accessed  
    engagementToQualifiedRate: number // Qualified / Engaged
    qualifiedToAdvancedRate: number // Advanced / Qualified
    advancedToClosedRate: number // Closed / Advanced
    overallConversionRate: number // Closed Won / Created
    
    /** Stage-specific conversion rates */
    stageConversions: Record<DealStage, {
      rate: number
      volume: number
      averageTime: number // days to convert to next stage
    }>
  }
  
  /** Revenue and Financial Metrics */
  revenue: {
    totalPipelineValue: number
    projectedRevenue: number // Based on stage probabilities
    actualRevenue: number // Closed won deals
    averageDealValue: number
    medianDealValue: number
    commissionProjected: number
    commissionActual: number
    
    /** Revenue breakdown */
    revenueByStage: Record<DealStage, number>
    revenueByAgent: Record<string, number>
    revenueByPropertyType: Record<string, number>
  }
  
  /** Performance and Velocity Metrics */
  performance: {
    averageDealCycle: number // days from created to closed
    medianDealCycle: number
    dealVelocity: number // deals per month
    averageTimePerStage: Record<DealStage, number>
    stageDropoffRates: Record<DealStage, number>
    
    /** Agent performance metrics */
    averageDealsPerAgent: number
    topPerformingAgents: Array<{
      agentId: string
      agentName: string
      dealCount: number
      revenue: number
      conversionRate: number
    }>
  }
  
  /** Trend Analysis (comparing to previous period) */
  trends: {
    dealVolumeChange: number // percentage change
    conversionRateChange: number
    revenueChange: number
    averageDealValueChange: number
    cycleTimeChange: number
    
    /** Daily trends within period */
    dailyMetrics: Array<{
      date: string
      dealsCreated: number
      dealsProgressed: number
      dealsClosed: number
      revenue: number
      engagementScore: number
    }>
  }
  
  /** Forecasting based on current pipeline */
  forecast: {
    nextMonth: {
      projectedDeals: number
      projectedRevenue: number
      confidence: number // 0-1
    }
    nextQuarter: {
      projectedDeals: number
      projectedRevenue: number
      confidence: number
    }
    riskFactors: string[]
    opportunities: string[]
  }
}

/**
 * Comprehensive CRM dashboard data structure
 */
export interface CRMDashboard {
  /** Dashboard metadata */
  metadata: {
    generatedAt: string
    agentId: string | null // null for system-wide dashboard
    refreshedAt: string
    dataFreshness: string // "live", "5 minutes ago", etc.
  }
  
  /** High-level summary metrics */
  summary: {
    totalDeals: number
    activeDeals: number
    hotLeads: number // Temperature = 'hot'
    warmLeads: number // Temperature = 'warm'
    pendingTasks: number
    overdueTasks: number
    thisMonthRevenue: number
    monthlyTarget: number | null
    targetProgress: number // percentage
    
    /** Quick performance indicators */
    performanceIndicators: {
      dealsVelocity: 'up' | 'down' | 'stable'
      conversionTrend: 'up' | 'down' | 'stable'
      revenueTrend: 'up' | 'down' | 'stable'
      taskCompletionRate: number
    }
  }
  
  /** Detailed pipeline metrics */
  pipeline: PipelineMetrics
  
  /** Recent activity feed */
  recentActivity: {
    newDeals: Array<Deal & {
      agentName: string
      timeAgo: string
    }>
    completedTasks: Array<Task & {
      agentName: string
      timeAgo: string
    }>
    hotLeads: Array<Deal & {
      reasonForHotStatus: string
      actionRequired: string
    }>
    dealProgressions: Array<{
      dealId: string
      dealName: string
      clientName: string
      fromStage: DealStage
      toStage: DealStage
      timestamp: string
      agentName: string
    }>
    engagementAlerts: Array<{
      type: 'high_engagement' | 'engagement_drop' | 'return_visit'
      dealId: string
      dealName: string
      clientName: string
      message: string
      timestamp: string
    }>
  }
  
  /** Upcoming tasks and priorities */
  taskManagement: {
    upcomingTasks: Task[]
    overdueTasks: Task[]
    tasksByPriority: Record<TaskPriority, number>
    tasksByStatus: Record<TaskStatus, number>
    automatedTasksGenerated: number
    taskCompletionRate: number
    
    /** Task recommendations */
    recommendations: Array<{
      type: 'urgent_follow_up' | 'overdue_task' | 'high_value_opportunity'
      priority: 'high' | 'medium' | 'low'
      message: string
      actionUrl?: string
      dealId?: string
    }>
  }
  
  /** Performance metrics with historical comparison */
  performance: {
    current: PeriodPerformanceMetrics
    previous: PeriodPerformanceMetrics
    yearOverYear?: PeriodPerformanceMetrics
    
    /** Performance goals and targets */
    goals: {
      monthlyDealTarget: number | null
      monthlyRevenueTarget: number | null
      conversionRateTarget: number | null
      progress: {
        deals: number // percentage
        revenue: number // percentage
        conversion: number // percentage
      }
    }
    
    /** Leaderboard data */
    leaderboard: {
      agents: Array<{
        rank: number
        agentId: string
        agentName: string
        dealsCreated: number
        dealsClosed: number
        revenue: number
        conversionRate: number
        engagementScore: number
      }>
      teams?: Array<{
        rank: number
        teamId: string
        teamName: string
        totalRevenue: number
        averageConversion: number
        memberCount: number
      }>
    }
  }
  
  /** Client and engagement insights */
  clientInsights: {
    totalClients: number
    newClients: number
    activeClients: number // Engaged in last 30 days
    clientsByTemperature: Record<ClientTemperature, number>
    averageEngagementScore: number
    topEngagedClients: Array<{
      clientId: string
      clientName: string
      engagementScore: number
      temperature: ClientTemperature
      lastActivity: string
    }>
    
    /** Behavioral insights */
    behaviorTrends: {
      averageSessionDuration: number
      averagePropertiesViewed: number
      likeToViewRatio: number
      returnVisitorRate: number
      mobileUsageRate: number
    }
  }
  
  /** Alerts and notifications requiring attention */
  alerts: Array<{
    id: string
    type: 'urgent' | 'warning' | 'info'
    category: 'task' | 'deal' | 'client' | 'system'
    title: string
    message: string
    timestamp: string
    actionRequired?: string
    actionUrl?: string
    dismissible: boolean
  }>
}

/**
 * Period performance metrics for comparison
 */
export interface PeriodPerformanceMetrics {
  period: {
    start: string
    end: string
    label: string
  }
  
  deals: {
    created: number
    progressed: number // Moved to next stage
    closed: number
    won: number
    lost: number
  }
  
  revenue: {
    actual: number
    projected: number
    commission: number
  }
  
  conversion: {
    rate: number
    stageRates: Record<DealStage, number>
  }
  
  engagement: {
    averageScore: number
    totalSessions: number
    averageSessionTime: number
  }
  
  tasks: {
    created: number
    completed: number
    completionRate: number
    averageCompletionTime: number // hours
  }
}

/**
 * Dashboard widget configuration
 */
export interface DashboardWidget {
  id: string
  type: DashboardWidgetType
  title: string
  
  /** Widget positioning */
  layout: {
    x: number
    y: number
    width: number
    height: number
    minWidth?: number
    minHeight?: number
  }
  
  /** Widget configuration */
  config: {
    timeRange?: AnalyticsTimePeriod
    agentIds?: string[]
    dealStatuses?: DealStatus[]
    showTrends?: boolean
    showComparison?: boolean
    refreshInterval?: number // seconds
    
    /** Widget-specific settings */
    chartType?: 'line' | 'bar' | 'pie' | 'area'
    displayLimit?: number
    sortBy?: string
    filters?: Record<string, unknown>
  }
  
  /** Widget permissions and visibility */
  permissions: {
    roles: string[]
    agents?: string[]
    isPublic: boolean
  }
  
  /** Widget metadata */
  createdBy: string
  createdAt: string
  updatedAt: string
  isSystemWidget: boolean // Created by system vs user
}

/**
 * Dashboard layout configuration
 */
export interface DashboardLayout {
  id: string
  name: string
  description?: string
  
  /** Layout settings */
  settings: {
    columns: number
    rowHeight: number
    margin: [number, number] // [x, y]
    containerPadding: [number, number] // [x, y]
    responsive: boolean
    autoSave: boolean
  }
  
  /** Widgets in this layout */
  widgets: DashboardWidget[]
  
  /** Layout permissions */
  permissions: {
    owner: string
    shared: boolean
    allowEdit: string[] // User IDs who can edit
    allowView: string[] // User IDs who can view
  }
  
  /** Layout metadata */
  createdAt: string
  updatedAt: string
  lastUsed: string
  usageCount: number
  isDefault: boolean
  isTemplate: boolean
}

/**
 * Real-time dashboard updates
 */
export interface DashboardUpdate {
  timestamp: string
  updateType: 'data_refresh' | 'widget_update' | 'layout_change' | 'alert_new'
  
  /** Updated data */
  updates: {
    summary?: Partial<CRMDashboard['summary']>
    pipeline?: Partial<PipelineMetrics>
    recentActivity?: Partial<CRMDashboard['recentActivity']>
    alerts?: CRMDashboard['alerts']
    
    /** Widget-specific updates */
    widgetUpdates?: Record<string, unknown>
  }
  
  /** Change metadata */
  changes: {
    triggeredBy: 'user_action' | 'system_update' | 'schedule' | 'real_time_event'
    changeCount: number
    significantChanges: boolean
  }
}

/**
 * Dashboard analytics for usage tracking
 */
export interface DashboardAnalytics extends DatabaseRecord {
  dashboardId: string
  userId: string
  
  /** Usage metrics */
  usage: {
    viewCount: number
    totalTimeSpent: number // seconds
    lastViewed: string
    averageSessionDuration: number
    widgetInteractions: Record<string, number>
  }
  
  /** Performance metrics */
  performance: {
    averageLoadTime: number // milliseconds
    errorCount: number
    refreshCount: number
    slowQueryCount: number
  }
  
  /** User behavior */
  behavior: {
    mostUsedWidgets: string[]
    preferredTimeRange: AnalyticsTimePeriod
    customFilters: Record<string, unknown>
    layoutChanges: number
  }
}