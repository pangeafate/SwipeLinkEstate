import type { Deal } from '../types'

/**
 * CRMPerformanceService - Performance Analytics and Reporting
 * 
 * Handles performance metrics calculation and comparative analysis
 * between different time periods.
 */
export class CRMPerformanceService {

  /**
   * Calculate performance metrics comparing current and previous periods
   */
  static async calculatePerformanceMetrics(deals: Deal[]) {
    const now = new Date()
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)
    
    // This month metrics
    const thisMonthDeals = deals.filter(d => new Date(d.createdAt) >= thisMonthStart)
    const thisMonthClosed = thisMonthDeals.filter(d => d.dealStatus === 'closed-won')
    const thisMonthRevenue = thisMonthClosed.reduce((sum, d) => sum + (d.dealValue || 0), 0)
    const thisMonthConversion = thisMonthDeals.length > 0 ? thisMonthClosed.length / thisMonthDeals.length : 0
    
    // Last month metrics
    const lastMonthDeals = deals.filter(d => {
      const createdAt = new Date(d.createdAt)
      return createdAt >= lastMonthStart && createdAt <= lastMonthEnd
    })
    const lastMonthClosed = lastMonthDeals.filter(d => d.dealStatus === 'closed-won')
    const lastMonthRevenue = lastMonthClosed.reduce((sum, d) => sum + (d.dealValue || 0), 0)
    const lastMonthConversion = lastMonthDeals.length > 0 ? lastMonthClosed.length / lastMonthDeals.length : 0
    
    return {
      thisMonth: {
        dealsCreated: thisMonthDeals.length,
        dealsClosed: thisMonthClosed.length,
        revenue: thisMonthRevenue,
        conversionRate: thisMonthConversion
      },
      lastMonth: {
        dealsCreated: lastMonthDeals.length,
        dealsClosed: lastMonthClosed.length,
        revenue: lastMonthRevenue,
        conversionRate: lastMonthConversion
      }
    }
  }

  /**
   * Calculate performance trends over multiple periods
   */
  static calculatePerformanceTrends(deals: Deal[], periods: number = 6): {
    dealCreationTrend: number[]
    revenueTrend: number[]
    conversionTrend: number[]
  } {
    const now = new Date()
    const dealCreationTrend: number[] = []
    const revenueTrend: number[] = []
    const conversionTrend: number[] = []

    for (let i = periods - 1; i >= 0; i--) {
      const periodStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const periodEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
      
      const periodDeals = deals.filter(d => {
        const createdAt = new Date(d.createdAt)
        return createdAt >= periodStart && createdAt <= periodEnd
      })
      
      const periodClosed = periodDeals.filter(d => d.dealStatus === 'closed-won')
      const periodRevenue = periodClosed.reduce((sum, d) => sum + (d.dealValue || 0), 0)
      const periodConversion = periodDeals.length > 0 ? periodClosed.length / periodDeals.length : 0
      
      dealCreationTrend.push(periodDeals.length)
      revenueTrend.push(periodRevenue)
      conversionTrend.push(periodConversion)
    }

    return {
      dealCreationTrend,
      revenueTrend,
      conversionTrend
    }
  }

  /**
   * Get performance insights and recommendations
   */
  static getPerformanceInsights(deals: Deal[]): {
    insights: string[]
    recommendations: string[]
  } {
    const insights: string[] = []
    const recommendations: string[] = []
    
    const totalDeals = deals.length
    const conversionRate = this.calculateOverallConversionRate(deals)
    const avgDealValue = this.calculateAverageDealValue(deals)
    
    // Generate insights based on metrics
    if (conversionRate > 0.3) {
      insights.push('Excellent conversion rate indicates strong lead qualification process')
    } else if (conversionRate < 0.1) {
      insights.push('Low conversion rate suggests need for improved lead quality or follow-up')
      recommendations.push('Review lead qualification criteria and follow-up timelines')
    }
    
    if (avgDealValue > 50000) {
      insights.push('High average deal value suggests successful targeting of premium clients')
    } else if (avgDealValue < 20000) {
      insights.push('Lower deal values may indicate opportunity for upselling or premium targeting')
      recommendations.push('Consider strategies to increase deal size through premium properties')
    }
    
    const hotLeadsCount = deals.filter(d => d.clientTemperature === 'hot').length
    if (hotLeadsCount / totalDeals > 0.2) {
      insights.push('High percentage of hot leads indicates effective engagement strategies')
    } else if (hotLeadsCount / totalDeals < 0.1) {
      recommendations.push('Implement strategies to increase client engagement and nurture cold leads')
    }
    
    return { insights, recommendations }
  }

  /**
   * Calculate key performance indicators
   */
  static calculateKPIs(deals: Deal[]): {
    totalRevenue: number
    averageDealSize: number
    conversionRate: number
    dealVelocity: number
    clientRetentionRate: number
  } {
    const closedDeals = deals.filter(d => d.dealStatus === 'closed-won')
    const totalRevenue = closedDeals.reduce((sum, d) => sum + (d.dealValue || 0), 0)
    const averageDealSize = closedDeals.length > 0 ? totalRevenue / closedDeals.length : 0
    const conversionRate = deals.length > 0 ? closedDeals.length / deals.length : 0
    
    // Simplified calculations
    const dealVelocity = this.calculateDealVelocity(deals)
    const clientRetentionRate = 0.85 // Mock value - would calculate from actual client data

    return {
      totalRevenue,
      averageDealSize,
      conversionRate,
      dealVelocity,
      clientRetentionRate
    }
  }

  /**
   * Private helper methods
   */
  private static calculateOverallConversionRate(deals: Deal[]): number {
    const closed = deals.filter(d => d.dealStatus === 'closed-won').length
    return deals.length > 0 ? closed / deals.length : 0
  }

  private static calculateAverageDealValue(deals: Deal[]): number {
    const totalValue = deals.reduce((sum, d) => sum + (d.dealValue || 0), 0)
    return deals.length > 0 ? totalValue / deals.length : 0
  }

  private static calculateDealVelocity(deals: Deal[]): number {
    const now = new Date()
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const recentDeals = deals.filter(d => new Date(d.createdAt) >= last30Days)
    return recentDeals.length / 30 // Deals per day
  }
}