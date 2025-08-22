import type { 
  Deal, 
  ClientProfile, 
  CRMDashboard, 
  PipelineMetrics,
  DealFilters 
} from './types'
import { CRMDashboardService } from './services/crm-dashboard.service'
import { CRMMetricsService } from './services/crm-metrics.service'
import { CRMPerformanceService } from './services/crm-performance.service'
import { CRMEngagementService } from './services/crm-engagement.service'
import { DealService } from './deal.service'

/**
 * CRMService - Main CRM Orchestration Service
 * 
 * Coordinates all CRM functionality and provides high-level business operations.
 * This is the main entry point for CRM features in the application.
 */
export class CRMService {

  /**
   * Get comprehensive CRM dashboard data
   */
  static async getCRMDashboard(agentId?: string): Promise<CRMDashboard> {
    return CRMDashboardService.getCRMDashboard(agentId)
  }

  /**
   * Process client engagement event and update deal state
   */
  static async processEngagementEvent(
    dealId: string,
    engagementData: {
      action: string
      metadata?: any
      clientId?: string
    }
  ): Promise<{
    deal: Deal | null
    scoreUpdated: boolean
    newTasks: number
    stageChanged: boolean
  }> {
    return CRMEngagementService.processEngagementEvent(dealId, engagementData)
  }

  /**
   * Get deals requiring immediate attention (hot leads)
   */
  static async getHotLeads(agentId?: string): Promise<Deal[]> {
    return CRMEngagementService.getHotLeads(agentId)
  }

  /**
   * Get pipeline health report with recommendations
   */
  static async getPipelineHealthReport(agentId?: string): Promise<{
    health: 'excellent' | 'good' | 'needs-attention' | 'critical'
    metrics: PipelineMetrics
    recommendations: string[]
  }> {
    const filters: DealFilters = {
      ...(agentId && { agentId })
    }
    
    const dealsResponse = await DealService.getDeals(filters, 1, 100)
    const pipeline = CRMMetricsService.calculatePipelineMetrics(dealsResponse.data)
    
    // Determine health status
    let health: 'excellent' | 'good' | 'needs-attention' | 'critical' = 'good'
    const recommendations: string[] = []
    
    if (pipeline.overallConversionRate < 0.1) {
      health = 'critical'
      recommendations.push('Conversion rate is critically low. Review link quality and follow-up processes.')
    } else if (pipeline.overallConversionRate < 0.2) {
      health = 'needs-attention'
      recommendations.push('Conversion rate could be improved. Focus on lead qualification.')
    }
    
    if (pipeline.activeDeals < 10) {
      if (health === 'good') health = 'needs-attention'
      recommendations.push('Pipeline volume is low. Increase link creation and marketing efforts.')
    }
    
    if (pipeline.averageDealCycle > 60) {
      recommendations.push('Deal cycle is lengthy. Streamline follow-up processes.')
    }
    
    if (pipeline.overallConversionRate > 0.3 && pipeline.activeDeals > 20) {
      health = 'excellent'
      recommendations.push('Excellent performance! Consider scaling current strategies.')
    }
    
    return {
      health,
      metrics: pipeline,
      recommendations
    }
  }

  /**
   * Get performance insights and analytics
   */
  static async getPerformanceInsights(agentId?: string): Promise<{
    kpis: any
    trends: any
    insights: string[]
    recommendations: string[]
  }> {
    const filters: DealFilters = {
      ...(agentId && { agentId })
    }
    
    const dealsResponse = await DealService.getDeals(filters, 1, 100)
    const deals = dealsResponse.data
    
    const kpis = CRMPerformanceService.calculateKPIs(deals)
    const trends = CRMPerformanceService.calculatePerformanceTrends(deals)
    const { insights, recommendations } = CRMPerformanceService.getPerformanceInsights(deals)
    
    return {
      kpis,
      trends,
      insights,
      recommendations
    }
  }

  /**
   * Get engagement analytics for deals
   */
  static async getEngagementAnalytics(dealIds: string[]): Promise<{
    [dealId: string]: {
      riskLevel: 'low' | 'medium' | 'high'
      nextBestAction: string
      urgency: number
    }
  }> {
    return CRMEngagementService.getBatchEngagementInsights(dealIds)
  }

  /**
   * Schedule automated follow-ups for deals needing attention
   */
  static async scheduleAutomatedFollowUps(agentId?: string): Promise<{
    scheduled: number
    skipped: number
    errors: number
  }> {
    return CRMEngagementService.scheduleEngagementFollowUps(agentId)
  }

  /**
   * Get comprehensive pipeline metrics
   */
  static async getPipelineMetrics(agentId?: string): Promise<PipelineMetrics> {
    const filters: DealFilters = {
      ...(agentId && { agentId })
    }
    
    const dealsResponse = await DealService.getDeals(filters, 1, 100)
    return CRMMetricsService.calculatePipelineMetrics(dealsResponse.data)
  }

  /**
   * Get deal stage conversion rates
   */
  static async getStageConversionRates(agentId?: string): Promise<{
    createdToShared: number
    sharedToAccessed: number
    accessedToEngaged: number
    engagedToQualified: number
    qualifiedToAdvanced: number
    advancedToClosed: number
  }> {
    const filters: DealFilters = {
      ...(agentId && { agentId })
    }
    
    const dealsResponse = await DealService.getDeals(filters, 1, 100)
    return CRMMetricsService.calculateStageConversionRates(dealsResponse.data)
  }

  /**
   * Get time-based performance metrics
   */
  static async getTimeMetrics(agentId?: string): Promise<{
    averageTimeToFirstEngagement: number
    averageTimeToQualification: number
    averageTimeToClose: number
  }> {
    const filters: DealFilters = {
      ...(agentId && { agentId })
    }
    
    const dealsResponse = await DealService.getDeals(filters, 1, 100)
    return CRMMetricsService.calculateTimeMetrics(dealsResponse.data)
  }
}