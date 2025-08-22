import type { Deal } from '../../types'

export class ClientAnalyticsService {
  /**
   * Extract property preferences from client's deal history
   */
  static async extractPropertyPreferences(deals: Deal[]): Promise<{
    types: string[]
    priceRange: { min: number | null, max: number | null }
    features: string[]
    locations: string[]
  }> {
    // In full implementation, would analyze liked/considered properties
    // to extract common patterns
    return {
      types: [],
      priceRange: { min: null, max: null },
      features: [],
      locations: []
    }
  }

  /**
   * Analyze client's behavioral patterns from engagement data
   */
  static analyzeBehaviorPatterns(deals: Deal[]): {
    averageSessionTime: number
    likeRate: number
    decisionSpeed: 'fast' | 'medium' | 'slow'
  } {
    const totalSessionTime = deals.reduce((sum, deal) => sum + deal.totalTimeSpent, 0)
    const averageSessionTime = deals.length > 0 ? totalSessionTime / deals.length : 0
    
    // Placeholder calculations
    const likeRate = 0.2 // Would calculate from actual swipe data
    const decisionSpeed: 'fast' | 'medium' | 'slow' = 
      averageSessionTime < 300 ? 'fast' : 
      averageSessionTime < 600 ? 'medium' : 'slow'
    
    return {
      averageSessionTime,
      likeRate,
      decisionSpeed
    }
  }

  /**
   * Calculate engagement metrics for a client
   */
  static calculateEngagementMetrics(deals: Deal[]): {
    totalEngagement: number
    averageEngagement: number
    engagementTrend: 'increasing' | 'stable' | 'decreasing'
  } {
    const totalEngagement = deals.reduce((sum, deal) => sum + deal.engagementScore, 0)
    const averageEngagement = deals.length > 0 ? totalEngagement / deals.length : 0
    
    // Simple trend calculation - would be more sophisticated in real implementation
    const recentDeals = deals.slice(-3)
    const olderDeals = deals.slice(0, -3)
    
    const recentAvg = recentDeals.length > 0 ? 
      recentDeals.reduce((sum, deal) => sum + deal.engagementScore, 0) / recentDeals.length : 0
    const olderAvg = olderDeals.length > 0 ? 
      olderDeals.reduce((sum, deal) => sum + deal.engagementScore, 0) / olderDeals.length : 0
    
    let engagementTrend: 'increasing' | 'stable' | 'decreasing' = 'stable'
    if (recentAvg > olderAvg + 10) engagementTrend = 'increasing'
    else if (recentAvg < olderAvg - 10) engagementTrend = 'decreasing'
    
    return {
      totalEngagement,
      averageEngagement,
      engagementTrend
    }
  }
}