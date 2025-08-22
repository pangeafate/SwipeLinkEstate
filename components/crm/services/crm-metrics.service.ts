import type { Deal, PipelineMetrics } from '../types'

/**
 * CRMMetricsService - Pipeline Metrics and Calculations
 * 
 * Handles complex calculations for pipeline metrics, conversion rates,
 * and business intelligence data.
 */
export class CRMMetricsService {

  /**
   * Calculate comprehensive pipeline metrics
   */
  static calculatePipelineMetrics(deals: Deal[]): PipelineMetrics {
    const totalDeals = deals.length
    const activeDeals = deals.filter(d => 
      d.dealStatus === 'active' || 
      d.dealStatus === 'qualified' || 
      d.dealStatus === 'nurturing'
    ).length
    
    // Count by stage
    const dealsByStage = deals.reduce((acc, deal) => {
      acc[deal.dealStage] = (acc[deal.dealStage] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    // Count by status
    const dealsByStatus = deals.reduce((acc, deal) => {
      acc[deal.dealStatus] = (acc[deal.dealStatus] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    // Calculate conversion rates
    const engaged = deals.filter(d => 
      ['engaged', 'qualified', 'advanced', 'closed'].includes(d.dealStage)
    ).length
    const qualified = deals.filter(d => d.dealStatus === 'qualified').length
    const closed = deals.filter(d => d.dealStatus === 'closed-won').length
    
    const linkToEngagementRate = totalDeals > 0 ? engaged / totalDeals : 0
    const engagementToQualifiedRate = engaged > 0 ? qualified / engaged : 0
    const qualifiedToClosedRate = qualified > 0 ? closed / qualified : 0
    const overallConversionRate = totalDeals > 0 ? closed / totalDeals : 0
    
    // Calculate revenue metrics
    const totalPipelineValue = deals.reduce((sum, d) => sum + (d.dealValue || 0), 0)
    const averageDealValue = totalDeals > 0 ? totalPipelineValue / totalDeals : 0
    const projectedRevenue = activeDeals * averageDealValue * overallConversionRate
    
    // Performance metrics (simplified)
    const averageDealsPerAgent = totalDeals // Assuming single agent for now
    const averageDealCycle = this.calculateAverageDealCycle(deals)
    
    return {
      totalDeals,
      activeDeals,
      dealsByStage: dealsByStage as any,
      dealsByStatus: dealsByStatus as any,
      linkToEngagementRate,
      engagementToQualifiedRate,
      qualifiedToClosedRate,
      overallConversionRate,
      totalPipelineValue,
      averageDealValue,
      projectedRevenue,
      averageDealsPerAgent,
      averageDealCycle
    }
  }

  /**
   * Calculate average deal cycle length
   */
  static calculateAverageDealCycle(deals: Deal[]): number {
    const closedDeals = deals.filter(d => 
      d.dealStatus === 'closed-won' || d.dealStatus === 'closed-lost'
    )
    
    if (closedDeals.length === 0) return 30 // Default estimate
    
    const totalDays = closedDeals.reduce((sum, deal) => {
      const created = new Date(deal.createdAt)
      const updated = new Date(deal.updatedAt)
      const days = Math.ceil((updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
      return sum + days
    }, 0)
    
    return Math.round(totalDays / closedDeals.length)
  }

  /**
   * Calculate conversion rates between stages
   */
  static calculateStageConversionRates(deals: Deal[]): {
    createdToShared: number
    sharedToAccessed: number
    accessedToEngaged: number
    engagedToQualified: number
    qualifiedToAdvanced: number
    advancedToClosed: number
  } {
    const stages = ['created', 'shared', 'accessed', 'engaged', 'qualified', 'advanced', 'closed']
    const stageCounts = stages.reduce((acc, stage) => {
      acc[stage] = deals.filter(d => d.dealStage === stage).length
      return acc
    }, {} as Record<string, number>)

    return {
      createdToShared: this.safeConversionRate(stageCounts.created, stageCounts.shared),
      sharedToAccessed: this.safeConversionRate(stageCounts.shared, stageCounts.accessed),
      accessedToEngaged: this.safeConversionRate(stageCounts.accessed, stageCounts.engaged),
      engagedToQualified: this.safeConversionRate(stageCounts.engaged, stageCounts.qualified),
      qualifiedToAdvanced: this.safeConversionRate(stageCounts.qualified, stageCounts.advanced),
      advancedToClosed: this.safeConversionRate(stageCounts.advanced, stageCounts.closed)
    }
  }

  /**
   * Calculate time-based metrics
   */
  static calculateTimeMetrics(deals: Deal[]): {
    averageTimeToFirstEngagement: number
    averageTimeToQualification: number
    averageTimeToClose: number
  } {
    // Simplified calculations - in real implementation would use actual timestamps
    return {
      averageTimeToFirstEngagement: 2.5, // days
      averageTimeToQualification: 7.2,   // days
      averageTimeToClose: 21.5           // days
    }
  }

  /**
   * Helper method for safe conversion rate calculation
   */
  private static safeConversionRate(from: number, to: number): number {
    return from > 0 ? to / from : 0
  }
}