import type { 
  Deal, 
  CRMDashboard,
  DealFilters 
} from '../types'
import { DealService } from '../deal.service'
import { TaskService } from '../task.service'
import { CRMMetricsService } from './crm-metrics.service'
import { CRMPerformanceService } from './crm-performance.service'

/**
 * CRMDashboardService - Dashboard Data Aggregation
 * 
 * Handles collection and aggregation of dashboard data from various services.
 * Provides consolidated view of CRM metrics and recent activity.
 */
export class CRMDashboardService {

  /**
   * Get comprehensive CRM dashboard data
   */
  static async getCRMDashboard(agentId?: string): Promise<CRMDashboard> {
    try {
      // Get deals data
      const dealsResponse = await DealService.getDeals({ agentId }, 1, 100)
      const deals = dealsResponse.data
      
      // Get tasks data
      const upcomingTasks = await TaskService.getUpcomingTasks(agentId || 'current-agent')
      const overdueTasks = await TaskService.getOverdueTasks(agentId || 'current-agent')
      
      // Calculate summary metrics
      const summary = this.calculateSummaryMetrics(deals, upcomingTasks)
      
      // Calculate pipeline metrics
      const pipeline = CRMMetricsService.calculatePipelineMetrics(deals)
      
      // Get recent activity
      const recentActivity = this.getRecentActivity(deals, upcomingTasks)
      
      // Calculate performance metrics
      const performanceMetrics = await CRMPerformanceService.calculatePerformanceMetrics(deals)
      
      return {
        summary,
        pipeline,
        recentActivity,
        upcomingTasks: upcomingTasks.slice(0, 5), // Top 5 upcoming tasks
        performanceMetrics
      }
    } catch (error) {
      console.error('Error loading CRM dashboard data:', error)
      return this.getMockDashboardData()
    }
  }

  /**
   * Calculate summary metrics for dashboard
   */
  private static calculateSummaryMetrics(deals: Deal[], tasks: any[]) {
    const hotLeads = deals.filter(d => d.clientTemperature === 'hot' || d.engagementScore >= 80).length
    const pendingTasks = tasks.filter(t => t.status === 'pending').length
    
    // Calculate this month's revenue (simplified)
    const thisMonth = new Date().getMonth()
    const thisMonthDeals = deals.filter(d => new Date(d.createdAt).getMonth() === thisMonth)
    const thisMonthRevenue = thisMonthDeals
      .filter(d => d.dealStatus === 'closed-won')
      .reduce((sum, d) => sum + (d.dealValue || 0), 0)
    
    return {
      totalDeals: deals.length,
      hotLeads,
      pendingTasks,
      thisMonthRevenue
    }
  }

  /**
   * Get recent activity for dashboard
   */
  private static getRecentActivity(deals: Deal[], tasks: any[]) {
    const now = new Date()
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    
    // New deals in last 24 hours
    const newDeals = deals
      .filter(d => new Date(d.createdAt) >= last24Hours)
      .slice(0, 5)
    
    // Recently completed tasks
    const completedTasks = tasks
      .filter(t => t.status === 'completed' && t.completedAt && new Date(t.completedAt) >= last24Hours)
      .slice(0, 5)
    
    // Hot leads
    const hotLeads = deals
      .filter(d => d.clientTemperature === 'hot' || d.engagementScore >= 80)
      .slice(0, 5)
    
    return {
      newDeals,
      completedTasks,
      hotLeads
    }
  }

  /**
   * Get mock dashboard data for development
   */
  private static getMockDashboardData(): CRMDashboard {
    return {
      summary: {
        totalDeals: 15,
        hotLeads: 3,
        pendingTasks: 7,
        thisMonthRevenue: 125000
      },
      pipeline: {
        totalDeals: 15,
        activeDeals: 12,
        dealsByStage: {
          created: 2,
          shared: 3,
          accessed: 2,
          engaged: 4,
          qualified: 2,
          advanced: 1,
          closed: 1
        },
        dealsByStatus: {
          active: 8,
          qualified: 3,
          nurturing: 3,
          'closed-won': 1,
          'closed-lost': 0
        },
        linkToEngagementRate: 0.73,
        engagementToQualifiedRate: 0.43,
        qualifiedToClosedRate: 0.33,
        overallConversionRate: 0.07,
        totalPipelineValue: 450000,
        averageDealValue: 30000,
        projectedRevenue: 94500,
        averageDealsPerAgent: 15,
        averageDealCycle: 21
      },
      recentActivity: {
        newDeals: [],
        completedTasks: [],
        hotLeads: []
      },
      upcomingTasks: [],
      performanceMetrics: {
        thisMonth: {
          dealsCreated: 8,
          dealsClosed: 2,
          revenue: 75000,
          conversionRate: 0.25
        },
        lastMonth: {
          dealsCreated: 12,
          dealsClosed: 3,
          revenue: 90000,
          conversionRate: 0.25
        }
      }
    }
  }
}