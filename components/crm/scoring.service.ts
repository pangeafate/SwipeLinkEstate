import type { SessionData, EngagementMetrics, ClientTemperature } from './types'

/**
 * ScoringService - Client Engagement Scoring System
 * 
 * Calculates engagement scores from 0-100 based on client behavior:
 * - Session Completion (0-25 points)
 * - Property Interaction (0-35 points)  
 * - Behavioral Indicators (0-25 points)
 * - Recency Factor (0-15 points)
 */
export class ScoringService {

  /**
   * Calculate comprehensive engagement score for a session
   */
  static async calculateEngagementScore(sessionData: SessionData): Promise<EngagementMetrics> {
    
    const sessionCompletion = this.calculateSessionCompletion(sessionData)
    const propertyInteraction = this.calculatePropertyInteraction(sessionData)
    const behavioralIndicators = this.calculateBehavioralIndicators(sessionData)
    const recencyFactor = this.calculateRecencyFactor(sessionData)
    
    const totalScore = Math.min(100, Math.max(0, 
      sessionCompletion + propertyInteraction + behavioralIndicators + recencyFactor
    ))
    
    return {
      sessionCompletion,
      propertyInteraction,
      behavioralIndicators,
      recencyFactor,
      totalScore
    }
  }

  /**
   * Session Completion Scoring (0-25 points)
   * Based on how much of the property collection was viewed
   */
  private static calculateSessionCompletion(sessionData: SessionData): number {
    if (sessionData.totalProperties === 0) return 0
    
    const completionRate = sessionData.propertiesViewed / sessionData.totalProperties
    
    let score = 0
    
    // Partial completion (1-50% properties): 5-15 points
    if (completionRate > 0 && completionRate <= 0.5) {
      score = Math.round(5 + (completionRate * 20)) // 5-15 points
    }
    // Full completion (51-100% properties): 16-25 points  
    else if (completionRate > 0.5) {
      score = Math.round(16 + ((completionRate - 0.5) * 18)) // 16-25 points
    }
    
    // Multiple sessions bonus: +5 points per session (capped at 10 points)
    if (sessionData.isReturnVisit) {
      score += Math.min(10, 5) // First return visit = +5 points
    }
    
    return Math.min(25, score)
  }

  /**
   * Property Interaction Scoring (0-35 points)
   * Based on engagement depth with individual properties
   */
  private static calculatePropertyInteraction(sessionData: SessionData): number {
    let score = 0
    
    // Properties liked: 2 points each (high engagement)
    score += sessionData.propertiesLiked * 2
    
    // Properties considering: 1 point each (moderate engagement)
    score += sessionData.propertiesConsidered * 1
    
    // Detail views accessed: 3 points each (deep engagement)
    score += sessionData.detailViewsOpened * 3
    
    // Time spent per property: 1 point per 30 seconds (quality engagement)
    const timePoints = Math.floor(sessionData.averageTimePerProperty / 30)
    score += timePoints
    
    return Math.min(35, score)
  }

  /**
   * Behavioral Indicators Scoring (0-25 points)
   * Based on session quality and engagement patterns
   */
  private static calculateBehavioralIndicators(sessionData: SessionData): number {
    let score = 0
    
    // Return visits: 10 points per return (shows strong interest)
    if (sessionData.isReturnVisit) {
      score += 10
    }
    
    // Session duration > 5 minutes: 10 points (quality engagement)
    if (sessionData.duration > 300) { // 300 seconds = 5 minutes
      score += 10
    }
    
    // High like-to-view ratio (>20%): 15 points (selective engagement)
    if (sessionData.propertiesViewed > 0) {
      const likeRatio = sessionData.propertiesLiked / sessionData.propertiesViewed
      if (likeRatio > 0.2) {
        score += 15
      }
    }
    
    // Consistent preferences pattern: 10 points (shows focused interest)
    if (this.hasConsistentPreferences(sessionData)) {
      score += 10
    }
    
    return Math.min(25, score)
  }

  /**
   * Recency Factor Scoring (0-15 points)
   * Time-decay factor for engagement score
   */
  private static calculateRecencyFactor(sessionData: SessionData): number {
    const now = new Date()
    const sessionTime = sessionData.endTime ? new Date(sessionData.endTime) : new Date(sessionData.startTime)
    const hoursSinceActivity = (now.getTime() - sessionTime.getTime()) / (1000 * 60 * 60)
    
    // Activity within 24 hours: 15 points
    if (hoursSinceActivity <= 24) {
      return 15
    }
    // Activity within 1 week: 10 points
    else if (hoursSinceActivity <= 168) { // 168 hours = 1 week
      return 10
    }
    // Activity within 1 month: 5 points
    else if (hoursSinceActivity <= 720) { // 720 hours = 30 days
      return 5
    }
    // Older activity: 0 points
    else {
      return 0
    }
  }

  /**
   * Determine client temperature from engagement score
   */
  static getClientTemperature(engagementScore: number): ClientTemperature {
    if (engagementScore >= 80) {
      return 'hot'   // 80-100 points: Highly engaged, immediate follow-up priority
    } else if (engagementScore >= 50) {
      return 'warm'  // 50-79 points: Moderately engaged, scheduled follow-up
    } else {
      return 'cold'  // 0-49 points: Low engagement, nurture campaign
    }
  }

  /**
   * Public method to get client temperature from score
   * (Alias for testing and external use)
   */
  static getClientTemperatureFromScore(score: number): ClientTemperature {
    return this.getClientTemperature(score)
  }

  /**
   * Public method to get engagement score components
   * (Alias for testing and external use)
   */
  static async getEngagementScoreComponents(sessionData: SessionData): Promise<EngagementMetrics> {
    return this.calculateEngagementScore(sessionData)
  }

  /**
   * Calculate engagement score across multiple sessions for a deal
   */
  static async calculateAggregateEngagementScore(
    sessions: SessionData[]
  ): Promise<EngagementMetrics> {
    
    if (sessions.length === 0) {
      return {
        sessionCompletion: 0,
        propertyInteraction: 0,
        behavioralIndicators: 0,
        recencyFactor: 0,
        totalScore: 0
      }
    }
    
    // Calculate weighted average based on recency and session quality
    let totalWeightedScore = 0
    let totalWeight = 0
    
    for (const session of sessions) {
      const sessionScore = await this.calculateEngagementScore(session)
      const weight = this.calculateSessionWeight(session, sessions.length)
      
      totalWeightedScore += sessionScore.totalScore * weight
      totalWeight += weight
    }
    
    const aggregateScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0
    
    // Get the most recent session for component breakdown
    const mostRecentSession = sessions.reduce((latest, current) => {
      return new Date(current.startTime) > new Date(latest.startTime) ? current : latest
    })
    
    const recentSessionMetrics = await this.calculateEngagementScore(mostRecentSession)
    
    return {
      ...recentSessionMetrics,
      totalScore: Math.round(aggregateScore)
    }
  }

  /**
   * Generate engagement insights for CRM dashboard
   */
  static generateEngagementInsights(metrics: EngagementMetrics): {
    temperature: ClientTemperature
    insights: string[]
    recommendations: string[]
  } {
    const temperature = this.getClientTemperature(metrics.totalScore)
    const insights: string[] = []
    const recommendations: string[] = []
    
    // Session completion insights
    if (metrics.sessionCompletion >= 20) {
      insights.push('Client thoroughly reviewed property collection')
      recommendations.push('Follow up with detailed property information')
    } else if (metrics.sessionCompletion >= 10) {
      insights.push('Client showed moderate interest in properties')
      recommendations.push('Send curated selection of similar properties')
    } else {
      insights.push('Client browsed briefly through collection')
      recommendations.push('Re-engage with more targeted property options')
    }
    
    // Property interaction insights
    if (metrics.propertyInteraction >= 25) {
      insights.push('High engagement with individual properties')
      recommendations.push('Schedule property viewings immediately')
    } else if (metrics.propertyInteraction >= 15) {
      insights.push('Solid interest in specific properties')
      recommendations.push('Provide additional property details and arrange viewings')
    }
    
    // Behavioral insights
    if (metrics.behavioralIndicators >= 20) {
      insights.push('Strong behavioral signals indicate serious buyer intent')
      recommendations.push('Prioritize immediate personal contact')
    } else if (metrics.behavioralIndicators >= 10) {
      insights.push('Positive behavioral patterns detected')
      recommendations.push('Schedule follow-up call within 24 hours')
    }
    
    // Recency insights
    if (metrics.recencyFactor >= 10) {
      insights.push('Recent activity indicates active property search')
      recommendations.push('Strike while iron is hot - contact immediately')
    } else if (metrics.recencyFactor >= 5) {
      insights.push('Some recent activity, interest may still be active')
      recommendations.push('Follow up with gentle re-engagement')
    } else {
      insights.push('Activity was some time ago')
      recommendations.push('Consider nurture campaign to rekindle interest')
    }
    
    return {
      temperature,
      insights,
      recommendations
    }
  }

  /**
   * Helper Methods
   */
  
  private static hasConsistentPreferences(sessionData: SessionData): boolean {
    // Simple heuristic: if they liked more than they disliked, shows preference consistency
    // In full implementation, would analyze property features, price ranges, locations
    return sessionData.propertiesLiked > sessionData.propertiesPassed
  }
  
  private static calculateSessionWeight(session: SessionData, totalSessions: number): number {
    // More recent sessions get higher weight
    const recencyWeight = this.calculateRecencyFactor(session) / 15 // Normalize to 0-1
    
    // Longer, more complete sessions get higher weight
    const qualityWeight = Math.min(1, session.duration / 600) // Normalize to 0-1 (10 minutes max)
    
    // If it's the only session, give it full weight
    if (totalSessions === 1) return 1
    
    // Combine recency and quality, with recency having more impact
    return (recencyWeight * 0.7) + (qualityWeight * 0.3)
  }

  /**
   * Real-time score update for active sessions
   * Called as client interacts with properties
   */
  static async updateEngagementScoreRealTime(
    currentScore: EngagementMetrics,
    newActivity: {
      action: 'like' | 'dislike' | 'consider' | 'view' | 'detail'
      timestamp: string
    }
  ): Promise<EngagementMetrics> {
    
    // Create updated session data
    const updatedSessionData: SessionData = {
      sessionId: 'current-session',
      linkId: 'current-link',
      startTime: new Date().toISOString(), // Placeholder
      endTime: newActivity.timestamp,
      duration: 0, // Placeholder
      totalProperties: 0, // Would be passed in
      propertiesViewed: 0, // Would be tracked
      propertiesLiked: newActivity.action === 'like' ? 1 : 0,
      propertiesConsidered: newActivity.action === 'consider' ? 1 : 0,
      propertiesPassed: newActivity.action === 'dislike' ? 1 : 0,
      detailViewsOpened: newActivity.action === 'detail' ? 1 : 0,
      averageTimePerProperty: 30, // Placeholder
      isCompleted: false,
      isReturnVisit: false
    }
    
    // In a real implementation, would incrementally update the existing score
    // For now, return the current score with minimal update
    return {
      ...currentScore,
      recencyFactor: 15, // Max recency for current activity
      totalScore: Math.min(100, currentScore.totalScore + 1) // Small increment
    }
  }
}