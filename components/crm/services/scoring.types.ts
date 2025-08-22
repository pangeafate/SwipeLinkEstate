/**
 * Engagement Scoring Type Definitions
 * 
 * Comprehensive TypeScript types for the SwipeLink Estate CRM engagement
 * scoring algorithm as defined in the CRM Master Specification.
 * 
 * The scoring system calculates client engagement on a 0-100 point scale
 * based on behavioral data from property link interactions.
 * 
 * @version 1.0.0
 * @author SwipeLink Estate CRM Team
 * @see /DevelopmentGuidelines/CRM-MASTER-SPECIFICATION.md Section 3.1
 */

import { DatabaseRecord } from '../types'

/**
 * Client temperature classification based on engagement score
 * Hot: 80-100 points - Immediate follow-up priority
 * Warm: 50-79 points - Scheduled follow-up within 48 hours  
 * Cold: 0-49 points - Nurture campaign, weekly check-ins
 */
export type ClientTemperature = 'hot' | 'warm' | 'cold'

/**
 * Property interaction types that contribute to engagement scoring
 */
export type PropertyInteractionType = 
  | 'viewed'         // Basic property view (0 points)
  | 'liked'          // Swiped right/liked property (3 points each)
  | 'disliked'       // Swiped left/disliked property (0 points)
  | 'considered'     // Added to considering bucket (2 points each)
  | 'detail_viewed'  // Opened detailed property view (2 points each)
  | 'image_browsed'  // Browsed property images (1 point each)
  | 'map_viewed'     // Viewed property on map (1 point each)

/**
 * Session completion status for scoring calculations
 */
export type SessionCompletionStatus = 
  | 'incomplete'     // Session abandoned before completion
  | 'partial'        // 1-50% of properties viewed (5-15 points)
  | 'complete'       // 51-100% of properties viewed (16-25 points)
  | 'multiple'       // Multiple sessions completed (+5 points per additional)

/**
 * Behavioral pattern indicators for advanced scoring
 */
export type BehavioralPattern = 
  | 'consistent_preferences'  // Shows consistent property preferences
  | 'high_like_ratio'        // Like-to-view ratio >20%
  | 'detailed_viewer'        // Frequently opens detail views
  | 'return_visitor'         // Multiple session visits
  | 'decisive'               // Quick decision making
  | 'browser'                // Extensive browsing behavior

/**
 * Core engagement score breakdown following CRM Master Specification
 * Total possible: 100 points across 4 components
 */
export interface EngagementScore {
  /** Session completion score (0-25 points) */
  sessionCompletion: number
  
  /** Property interaction score (0-35 points) */
  propertyInteraction: number
  
  /** Behavioral indicators score (0-25 points) */
  behavioralIndicators: number
  
  /** Recency factor score (0-15 points) */
  recencyFactor: number
  
  /** Total combined score (0-100 points) */
  total: number
  
  /** Calculated temperature based on total score */
  temperature: ClientTemperature
  
  /** Timestamp of score calculation */
  calculatedAt: string
  
  /** Score component breakdown for debugging */
  breakdown: EngagementScoreBreakdown
}

/**
 * Detailed breakdown of score calculation components
 */
export interface EngagementScoreBreakdown {
  sessionCompletion: {
    completionPercentage: number
    sessionCount: number
    points: number
    maxPoints: 25
  }
  
  propertyInteraction: {
    liked: { count: number; points: number; maxPoints: 15 }
    considering: { count: number; points: number; maxPoints: 10 }
    detailViews: { count: number; points: number; maxPoints: 10 }
    points: number
    maxPoints: 35
  }
  
  behavioralIndicators: {
    returnVisits: { count: number; points: number; maxPoints: 20 }
    sessionDuration: { minutes: number; points: number; maxPoints: 5 }
    likeRatio: { percentage: number; points: number; maxPoints: 5 }
    consistentPreferences: { detected: boolean; points: number; maxPoints: 5 }
    points: number
    maxPoints: 25
  }
  
  recencyFactor: {
    hoursSinceActivity: number
    points: number
    maxPoints: 15
  }
}

/**
 * Raw session data used for engagement score calculation
 */
export interface SessionEngagementData {
  /** Unique session identifier */
  sessionId: string
  
  /** Link/deal identifier */
  linkId: string
  
  /** Client identifier (if known) */
  clientId?: string
  
  /** Session timing information */
  startTime: string
  endTime?: string
  duration: number // seconds
  
  /** Property portfolio metrics */
  totalProperties: number
  propertiesViewed: number
  completionPercentage: number
  
  /** Interaction counts by type */
  interactions: {
    liked: number
    disliked: number
    considered: number
    detailViews: number
    imageBrowsed: number
    mapViewed: number
  }
  
  /** Session behavioral metrics */
  averageTimePerProperty: number // seconds
  isReturnVisit: boolean
  deviceType: 'mobile' | 'tablet' | 'desktop'
  
  /** Session completion status */
  completionStatus: SessionCompletionStatus
}

/**
 * Historical engagement tracking for trend analysis
 */
export interface EngagementHistory extends DatabaseRecord {
  clientId: string
  dealId: string
  sessionId: string
  
  /** Calculated engagement metrics */
  engagementScore: EngagementScore
  
  /** Raw session data snapshot */
  sessionData: SessionEngagementData
  
  /** Score change from previous calculation */
  scoreChange?: number
  
  /** Temperature change indicator */
  temperatureChange?: 'heated_up' | 'cooled_down' | 'stable'
}

/**
 * Engagement scoring service configuration
 */
export interface ScoringConfiguration {
  /** Session completion scoring weights */
  sessionWeights: {
    partialCompletionMin: number    // Default: 5 points
    partialCompletionMax: number    // Default: 15 points
    fullCompletionMin: number       // Default: 16 points
    fullCompletionMax: number       // Default: 25 points
    additionalSessionBonus: number  // Default: 5 points
  }
  
  /** Property interaction scoring weights */
  interactionWeights: {
    likedProperty: number           // Default: 3 points
    consideredProperty: number      // Default: 2 points
    detailView: number             // Default: 2 points
    imageBrowse: number            // Default: 1 point
    mapView: number                // Default: 1 point
  }
  
  /** Behavioral indicator thresholds and weights */
  behavioralWeights: {
    returnVisitPoints: number       // Default: 10 points
    longSessionMinutes: number      // Default: 5 minutes
    longSessionPoints: number       // Default: 5 points
    highLikeRatioThreshold: number  // Default: 20%
    highLikeRatioPoints: number     // Default: 5 points
    consistentPreferencesPoints: number // Default: 5 points
  }
  
  /** Recency factor scoring */
  recencyWeights: {
    within24Hours: number          // Default: 15 points
    within1Week: number            // Default: 10 points
    within1Month: number           // Default: 5 points
    olderThan1Month: number        // Default: 0 points
  }
  
  /** Temperature thresholds */
  temperatureThresholds: {
    hotMinScore: number            // Default: 80
    warmMinScore: number           // Default: 50
    coldMaxScore: number           // Default: 49
  }
}

/**
 * Engagement trend analysis data
 */
export interface EngagementTrend {
  dealId: string
  clientId?: string
  
  /** Score progression over time */
  scoreHistory: Array<{
    score: number
    temperature: ClientTemperature
    timestamp: string
  }>
  
  /** Trend indicators */
  trend: 'improving' | 'declining' | 'stable'
  trendStrength: number // -1 to 1, negative = declining
  
  /** Prediction based on trend */
  predictedScore?: number
  predictedTemperature?: ClientTemperature
  predictionConfidence?: number // 0 to 1
}

/**
 * Bulk scoring operation for batch processing
 */
export interface BulkScoringRequest {
  sessions: SessionEngagementData[]
  configuration?: Partial<ScoringConfiguration>
  includeBreakdown?: boolean
  includeTrends?: boolean
}

/**
 * Bulk scoring response
 */
export interface BulkScoringResponse {
  results: Array<{
    sessionId: string
    dealId: string
    score: EngagementScore
    error?: string
  }>
  
  summary: {
    processed: number
    successful: number
    failed: number
    averageScore: number
    temperatureDistribution: Record<ClientTemperature, number>
  }
}

/**
 * Engagement scoring service input/output types
 */
export namespace ScoringService {
  export interface CalculateScoreInput {
    sessionData: SessionEngagementData
    configuration?: Partial<ScoringConfiguration>
    includeBreakdown?: boolean
  }
  
  export interface CalculateScoreOutput {
    score: EngagementScore
    recommendations?: string[]
    nextCalculationTime?: string
  }
  
  export interface GetTrendInput {
    dealId: string
    timeRange?: {
      startDate: string
      endDate: string
    }
    includePrediction?: boolean
  }
  
  export interface GetTrendOutput {
    trend: EngagementTrend
    insights: string[]
  }
  
  export interface UpdateTemperatureInput {
    dealId: string
    newScore: number
    reason?: string
  }
  
  export interface UpdateTemperatureOutput {
    previousTemperature: ClientTemperature
    newTemperature: ClientTemperature
    updated: boolean
  }
}