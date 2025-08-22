/**
 * Client-related type definitions for SwipeLink Estate CRM
 * Part of the modular CRM type system following CRM Master Specification
 * 
 * Implements progressive client profiling with behavioral intelligence
 * and engagement tracking for the real estate domain.
 * 
 * @version 1.0.0
 * @see /DevelopmentGuidelines/CRM-MASTER-SPECIFICATION.md Section 3
 */

import { DatabaseRecord, ServiceResponse } from '../types'
import { ClientTemperature, DealSource } from './deal.types'

/**
 * Client communication preferences for personalized outreach
 */
export type CommunicationPreference = 'email' | 'phone' | 'text' | 'app_notification'

/**
 * Client decision-making speed classification based on behavior analysis
 */
export type DecisionSpeed = 'fast' | 'medium' | 'slow' | 'analytical'

/**
 * Client engagement patterns for behavioral segmentation
 */
export type EngagementPattern = 
  | 'browser'           // Extensive browsing, low action rate
  | 'decisive'          // Quick decisions, high action rate
  | 'analytical'        // Deep property analysis, detailed views
  | 'social'            // Shares and discusses properties
  | 'return_visitor'    // Multiple session engagement
  | 'focused'           // Specific property type focus

/**
 * Property viewing behavior classification
 */
export type ViewingBehavior = 
  | 'quick_scanner'     // Fast property scanning
  | 'detail_focused'    // High detail view rate
  | 'image_browser'     // Heavy image browsing
  | 'map_oriented'      // Location-focused viewing
  | 'mixed'             // Balanced viewing approach

/**
 * Comprehensive client profile with progressive profiling and behavioral intelligence
 * Evolves from "ghost" profiles to full client records through engagement
 */
export interface ClientProfile extends DatabaseRecord {
  // Basic Information (Progressive Enhancement)
  name: string | null
  email: string | null
  phone: string | null
  
  // Contact Preferences
  preferredCommunication: CommunicationPreference[]
  bestContactTime: string | null // "morning", "afternoon", "evening"
  timezone: string | null
  
  // Source and Attribution
  source: DealSource
  sourceDetails: string | null // Campaign ID, referrer, etc.
  
  // Deal Association
  totalDeals: number
  activeDeals: number
  closedDeals: number
  wonDeals: number
  
  // Current Engagement Status
  currentEngagementScore: number // 0-100
  averageEngagementScore: number
  temperature: ClientTemperature
  temperatureHistory: TemperatureChange[]
  
  // Property Preferences (ML-driven analysis)
  propertyPreferences: {
    preferredTypes: PropertyTypePreference[]
    priceRange: {
      min: number | null
      max: number | null
      flexibility: 'rigid' | 'flexible' | 'aspirational' // Budget flexibility
    }
    locationPreferences: LocationPreference[]
    featurePreferences: FeaturePreference[]
    stylePreferences: string[] // "modern", "traditional", "luxury", etc.
  }
  
  // Behavioral Analytics
  behaviorProfile: {
    decisionSpeed: DecisionSpeed
    engagementPattern: EngagementPattern
    viewingBehavior: ViewingBehavior
    likeToViewRatio: number // Percentage of viewed properties liked
    averageSessionDuration: number // Minutes
    peakActivityHours: number[] // Hours of day (0-23) when most active
    devicePreferences: string[] // "mobile", "desktop", "tablet"
  }
  
  // Session and Interaction History
  sessionStats: {
    totalSessions: number
    averageSessionTime: number
    totalPropertiesViewed: number
    totalPropertiesLiked: number
    totalPropertiesConsidered: number
    returnVisitRate: number // Percentage of sessions that are return visits
    lastActiveDate: string | null
  }
  
  // Timeline and Journey
  clientJourney: {
    firstSeen: string
    lastSeen: string | null
    daysSinceFirstContact: number
    daysSinceLastActivity: number
    totalEngagementDays: number
    journeyStage: 'discovery' | 'consideration' | 'decision' | 'post_purchase'
  }
  
  // CRM Management
  assignedAgent: string | null
  tags: string[]
  notes: ClientNote[]
  priority: 'high' | 'medium' | 'low'
  isQualified: boolean
  qualificationCriteria: {
    budgetConfirmed: boolean
    timelineConfirmed: boolean
    preApproved: boolean
    seriousBuyer: boolean
  }
  
  // Privacy and Consent
  consentSettings: {
    marketingEmails: boolean
    phoneContact: boolean
    textMessages: boolean
    dataProcessing: boolean
    consentDate: string
  }
}

/**
 * Property type preference with confidence scoring
 */
export interface PropertyTypePreference {
  type: string // "apartment", "house", "condo", etc.
  confidence: number // 0-1 confidence in this preference
  interactionCount: number // How many times they've engaged with this type
  avgTimeSpent: number // Average time spent on this property type
}

/**
 * Location preference with geographic hierarchy
 */
export interface LocationPreference {
  type: 'city' | 'neighborhood' | 'zip_code' | 'coordinates'
  value: string
  confidence: number // 0-1 confidence in this preference
  radius: number | null // For coordinate-based preferences (in miles)
  interactionCount: number
}

/**
 * Feature preference with importance weighting
 */
export interface FeaturePreference {
  feature: string // "balcony", "parking", "pool", etc.
  importance: 'must_have' | 'nice_to_have' | 'indifferent' | 'dislike'
  confidence: number // 0-1 confidence in this preference
  basedOnInteractions: number // Number of interactions this is based on
}

/**
 * Client temperature change tracking for trend analysis
 */
export interface TemperatureChange extends DatabaseRecord {
  clientId: string
  fromTemperature: ClientTemperature
  toTemperature: ClientTemperature
  engagementScore: number
  changeReason: 'score_increase' | 'score_decrease' | 'manual_override' | 'inactivity'
  triggeredBy: string | null // Task ID, session ID, or agent ID
}

/**
 * Client note for CRM management
 */
export interface ClientNote extends DatabaseRecord {
  clientId: string
  authorId: string // Agent ID
  noteType: 'general' | 'call_log' | 'meeting' | 'showing' | 'feedback'
  title: string
  content: string
  isPrivate: boolean
  linkedDealId: string | null
  linkedTaskId: string | null
}

/**
 * Detailed session data for engagement score calculation and behavior analysis
 */
export interface SessionData extends DatabaseRecord {
  // Session Identification
  sessionId: string
  linkId: string
  dealId: string
  clientId: string | null
  
  // Session Timing
  startTime: string
  endTime: string | null
  duration: number // seconds
  isCompleted: boolean
  exitReason: 'completed' | 'abandoned' | 'timeout' | 'error'
  
  // Device and Context
  deviceType: 'mobile' | 'tablet' | 'desktop'
  userAgent: string
  ipAddress: string | null
  referrer: string | null
  
  // Property Interaction Metrics
  propertyMetrics: {
    totalProperties: number
    propertiesViewed: number
    propertiesLiked: number
    propertiesConsidered: number
    propertiesSkipped: number
    propertiesRejected: number
    completionPercentage: number
  }
  
  // Engagement Quality Metrics
  engagementMetrics: {
    detailViewsOpened: number
    imageGalleryViews: number
    mapViewsOpened: number
    averageTimePerProperty: number
    totalScrollDistance: number | null
    clickThroughActions: number
  }
  
  // Behavioral Indicators
  behaviorIndicators: {
    isReturnVisit: boolean
    sessionSequenceNumber: number // 1st, 2nd, 3rd visit, etc.
    quickDecisionCount: number // Properties decided on quickly
    hesitationCount: number // Properties with long view times
    backtrackCount: number // Times user went back to previous properties
  }
  
  // Property-Level Interactions
  propertyInteractions: PropertyInteraction[]
}

/**
 * Individual property interaction within a session
 */
export interface PropertyInteraction {
  propertyId: string
  sequenceNumber: number // Order in session
  
  // Interaction Details
  action: 'viewed' | 'liked' | 'disliked' | 'considered' | 'detail_viewed' | 'skipped'
  timeSpent: number // seconds
  timestamp: string
  
  // Detailed Engagement
  detailViewDuration: number | null
  imagesViewed: number
  mapViewed: boolean
  favoritedFeatures: string[] // Features they spent time on
  
  // Decision Context
  decisionSpeed: 'instant' | 'quick' | 'deliberate' | 'hesitant'
  certaintyLevel: 'high' | 'medium' | 'low' // Inferred from behavior
}

/**
 * Engagement metrics breakdown for scoring calculation
 */
export interface EngagementMetrics {
  // Core Scoring Components (following CRM Master Spec Section 3.1)
  sessionCompletion: number // 0-25 points
  propertyInteraction: number // 0-35 points  
  behavioralIndicators: number // 0-25 points
  recencyFactor: number // 0-15 points
  totalScore: number // 0-100 points
  
  // Detailed Breakdowns
  scoreBreakdown: {
    completionPoints: {
      partialCompletion: number
      fullCompletion: number
      multipleSessionBonus: number
    }
    interactionPoints: {
      likesScore: number
      consideringScore: number
      detailViewsScore: number
    }
    behaviorPoints: {
      returnVisitsScore: number
      sessionDurationScore: number
      likeRatioScore: number
      consistencyScore: number
    }
    recencyPoints: {
      timeBasedScore: number
      daysSinceLastActivity: number
    }
  }
  
  // Trend Analysis
  scoreHistory: Array<{
    score: number
    timestamp: string
    sessionId: string
  }>
  trend: 'improving' | 'declining' | 'stable'
  trendStrength: number // -1 to 1
}

/**
 * Client insights generated from behavior analysis
 */
export interface ClientInsights {
  clientId: string
  generatedAt: string
  
  // Behavioral Insights
  behaviorInsights: {
    buyerProfile: 'first_time' | 'experienced' | 'investor' | 'upgrader'
    urgencyLevel: 'immediate' | 'within_month' | 'within_quarter' | 'exploring'
    priceConsciousness: 'budget_focused' | 'value_focused' | 'luxury_focused'
    decisionMakingStyle: 'analytical' | 'emotional' | 'practical' | 'social'
  }
  
  // Predictive Insights
  predictions: {
    likelyToConvert: number // 0-1 probability
    estimatedTimeToDecision: number // days
    optimalFollowUpTiming: string // "immediate", "24h", "week"
    preferredCommunicationMethod: CommunicationPreference
  }
  
  // Recommendations
  recommendations: {
    nextBestActions: string[]
    propertyRecommendations: string[]
    engagementStrategies: string[]
    riskMitigation: string[]
  }
  
  // Market Context
  marketInsights: {
    competitivePosition: 'strong' | 'moderate' | 'weak'
    marketOpportunity: string
    timingRecommendation: string
  }
}

/**
 * Client service input/output types namespace
 */
export namespace ClientService {
  export interface CreateClientInput {
    name?: string
    email?: string
    phone?: string
    source: DealSource
    sourceDetails?: string
    dealId?: string
    agentId: string
    initialTags?: string[]
    notes?: string
  }
  
  export interface UpdateClientInput {
    clientId: string
    name?: string
    email?: string
    phone?: string
    preferredCommunication?: CommunicationPreference[]
    bestContactTime?: string
    timezone?: string
    tags?: string[]
    priority?: 'high' | 'medium' | 'low'
    qualificationUpdate?: Partial<ClientProfile['qualificationCriteria']>
    consentUpdate?: Partial<ClientProfile['consentSettings']>
  }
  
  export interface GetClientInsightsInput {
    clientId: string
    includeRecommendations?: boolean
    includePredictions?: boolean
    timeRange?: {
      startDate: string
      endDate: string
    }
  }
  
  export type CreateClientResponse = ServiceResponse<{
    client: ClientProfile
    autoGeneratedTags: string[]
    initialInsights: string[]
  }>
  
  export type GetClientResponse = ServiceResponse<ClientProfile>
  export type GetClientInsightsResponse = ServiceResponse<ClientInsights>
  export type UpdateClientResponse = ServiceResponse<{
    client: ClientProfile
    changesApplied: string[]
    newInsights: string[]
  }>
}