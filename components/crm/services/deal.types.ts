/**
 * Deal Management Type Definitions
 * 
 * Comprehensive TypeScript types for deal management in the SwipeLink Estate CRM
 * system. Covers the complete deal lifecycle from creation through closing.
 * 
 * Implements the Link-as-Deal paradigm where every shared property link
 * automatically becomes a trackable CRM deal.
 * 
 * @version 1.0.0
 * @author SwipeLink Estate CRM Team
 * @see /DevelopmentGuidelines/CRM-MASTER-SPECIFICATION.md Section 2
 */

import { DatabaseRecord, ServiceResponse, PaginatedServiceResponse } from '../types'
import { ClientTemperature, EngagementScore } from './scoring.types'

/**
 * Deal status classifications following CRM Master Specification
 * Status represents the overall state of the deal
 */
export type DealStatus = 
  | 'active'       // Link created and ready for sharing
  | 'qualified'    // Client has accessed link and shown engagement (score >50)
  | 'nurturing'    // Ongoing follow-up and relationship building
  | 'closed-won'   // Successful property transaction completed
  | 'closed-lost'  // Deal ended without transaction

/**
 * Deal lifecycle stages following the 7-stage pipeline
 * Stage represents the specific point in the sales process
 */
export type DealStage = 
  | 'created'    // Agent creates property link
  | 'shared'     // Link sent to client  
  | 'accessed'   // Client opens link
  | 'engaged'    // Client swipes through properties
  | 'qualified'  // High engagement detected (score >50)
  | 'advanced'   // Property showing scheduled/completed
  | 'closed'     // Deal completed (Won/Lost)

/**
 * Deal source indicating how the deal originated
 */
export type DealSource = 
  | 'link'         // Created from shared property link (primary)
  | 'referral'     // Referral from existing client
  | 'marketing'    // Marketing campaign response  
  | 'direct'       // Direct agent contact
  | 'website'      // Website inquiry
  | 'social'       // Social media engagement

/**
 * Deal priority levels for agent workflow management
 */
export type DealPriority = 
  | 'urgent'       // Immediate attention required
  | 'high'         // High engagement, quick follow-up needed
  | 'medium'       // Standard follow-up schedule
  | 'low'          // Long-term nurturing

/**
 * Property types associated with deals
 */
export type PropertyType = 
  | 'residential'
  | 'commercial'
  | 'investment'
  | 'luxury'
  | 'new_construction'
  | 'land'

/**
 * Core Deal entity extending Link data with CRM functionality
 * Represents a complete deal record in the system
 */
export interface Deal extends DatabaseRecord {
  // Link Integration (Link-as-Deal paradigm)
  linkId: string
  linkCode: string
  linkName: string
  
  // Deal Identification
  dealName: string
  dealNumber: string // Auto-generated unique identifier
  
  // Status and Stage Management  
  dealStatus: DealStatus
  dealStage: DealStage
  stageHistory: DealStageHistory[]
  
  // Financial Information
  dealValue: number | null // Estimated commission value
  estimatedClosingValue: number | null // Total property transaction value
  commissionRate: number // Percentage (default 2.5%)
  estimatedCommission: number | null // Calculated commission amount
  
  // Client Information (Progressive Profiling)
  clientId: string | null
  clientName: string | null  
  clientEmail: string | null
  clientPhone: string | null
  clientSource: DealSource
  
  // Property Portfolio
  propertyIds: string[]
  propertyCount: number
  preferredPropertyTypes: PropertyType[]
  priceRangeMin: number | null
  priceRangeMax: number | null
  
  // Agent Assignment
  agentId: string
  coAgentId: string | null // Co-listing agent
  teamId: string | null
  
  // Engagement and Scoring
  engagementScore: number
  clientTemperature: ClientTemperature
  lastEngagementAt: string | null
  totalSessions: number
  totalTimeSpent: number // seconds
  
  // Timeline Management
  expectedCloseDate: string | null
  actualCloseDate: string | null
  daysSinceCreated: number
  daysSinceLastActivity: number
  
  // Follow-up and Tasks
  nextFollowUpDate: string | null
  nextFollowUpType: string | null
  pendingTasksCount: number
  completedTasksCount: number
  
  // Additional Context
  notes: string | null
  tags: string[]
  priority: DealPriority
  isArchived: boolean
  
  // Metadata
  metadata: DealMetadata
}

/**
 * Deal stage transition history for audit trail
 */
export interface DealStageHistory extends DatabaseRecord {
  dealId: string
  fromStage: DealStage | null
  toStage: DealStage
  changedBy: string // Agent ID
  reason: string | null
  notes: string | null
  engagementScoreAtChange: number | null
  automaticTransition: boolean
}

/**
 * Additional metadata for deal context
 */
export interface DealMetadata {
  /** Original link creation context */
  linkCreationContext?: {
    propertySelectionCriteria: string
    targetClientType: string
    campaignId?: string
  }
  
  /** Client behavior insights */
  behaviorInsights?: {
    preferredViewingTimes: string[]
    devicePreferences: string[]
    communicationPreferences: string[]
  }
  
  /** Market context */
  marketContext?: {
    averageMarketTime: number
    marketTemperature: 'hot' | 'warm' | 'cold'
    competitiveListings: number
  }
  
  /** Integration data */
  integrations?: {
    mlsIds?: string[]
    externalSystemIds?: Record<string, string>
  }
}

/**
 * Deal creation input for automatic deal generation from links
 */
export interface CreateDealFromLinkInput {
  linkId: string
  linkData: {
    name: string
    propertyIds: string[]
    agentId: string
    createdAt: string
  }
  
  /** Optional client information if known */
  clientInfo?: {
    name?: string
    email?: string
    phone?: string
    source?: DealSource
  }
  
  /** Optional deal configuration */
  dealConfig?: {
    customDealName?: string
    priority?: DealPriority
    tags?: string[]
    notes?: string
    expectedCloseDate?: string
  }
}

/**
 * Deal update input for stage progression and data updates
 */
export interface UpdateDealInput {
  dealId: string
  
  /** Stage and status updates */
  stageUpdate?: {
    newStage: DealStage
    newStatus?: DealStatus
    reason?: string
    notes?: string
    nextFollowUpDate?: string
  }
  
  /** Client information updates */
  clientUpdate?: {
    name?: string
    email?: string
    phone?: string
    source?: DealSource
  }
  
  /** Financial updates */
  financialUpdate?: {
    dealValue?: number
    estimatedClosingValue?: number
    commissionRate?: number
    expectedCloseDate?: string
  }
  
  /** Engagement updates */
  engagementUpdate?: {
    engagementScore?: number
    temperature?: ClientTemperature
    lastEngagementAt?: string
    sessionData?: {
      duration: number
      actionsCount: number
    }
  }
  
  /** General updates */
  generalUpdate?: {
    notes?: string
    tags?: string[]
    priority?: DealPriority
    nextFollowUpDate?: string
    nextFollowUpType?: string
  }
}

/**
 * Deal filtering and search criteria
 */
export interface DealFilters {
  // Status and stage filters
  statuses?: DealStatus[]
  stages?: DealStage[]
  priorities?: DealPriority[]
  temperatures?: ClientTemperature[]
  
  // Agent and team filters
  agentIds?: string[]
  teamIds?: string[]
  includeCoAgentDeals?: boolean
  
  // Time-based filters
  dateRange?: {
    field: 'createdAt' | 'updatedAt' | 'expectedCloseDate' | 'lastEngagementAt'
    startDate: string
    endDate: string
  }
  
  // Value-based filters
  valueRange?: {
    min: number
    max: number
    field: 'dealValue' | 'estimatedClosingValue' | 'estimatedCommission'
  }
  
  // Engagement filters
  engagementRange?: {
    minScore: number
    maxScore: number
  }
  
  // Property filters
  propertyTypes?: PropertyType[]
  propertyCount?: {
    min: number
    max: number
  }
  
  // Search
  searchQuery?: string // Searches deal name, client name, notes, tags
  
  // Advanced filters
  hasNotes?: boolean
  hasOverdueTasks?: boolean
  isStale?: boolean // No activity in X days
  staleDays?: number
  
  // Sorting
  sortBy?: 'createdAt' | 'updatedAt' | 'dealValue' | 'engagementScore' | 'expectedCloseDate'
  sortOrder?: 'asc' | 'desc'
}

/**
 * Deal analytics and metrics
 */
export interface DealAnalytics {
  dealId: string
  
  /** Performance metrics */
  performance: {
    daysInPipeline: number
    stageProgression: Array<{
      stage: DealStage
      daysInStage: number
      enteredAt: string
      exitedAt: string | null
    }>
    conversionProbability: number // 0-1
    timeToClose: number | null // estimated days
  }
  
  /** Engagement analytics */
  engagement: {
    totalSessions: number
    totalEngagementTime: number
    averageSessionDuration: number
    engagementTrend: 'improving' | 'declining' | 'stable'
    lastEngagementDays: number
  }
  
  /** Task and activity metrics */
  activity: {
    totalTasks: number
    completedTasks: number
    overdueTasks: number
    averageTaskCompletionTime: number
    lastActivityDays: number
  }
  
  /** Comparative analysis */
  benchmarks: {
    averageDealsAtStage: number
    averageTimeAtStage: number
    conversionRateAtStage: number
    aboveAverageDealValue: boolean
  }
}

/**
 * Deal pipeline metrics for dashboard analytics
 */
export interface DealPipelineMetrics {
  // Volume metrics
  totalDeals: number
  activeDeals: number
  dealsByStage: Record<DealStage, number>
  dealsByStatus: Record<DealStatus, number>
  dealsByTemperature: Record<ClientTemperature, number>
  
  // Conversion metrics
  stageConversionRates: Record<DealStage, number>
  overallConversionRate: number
  linkToEngagementRate: number
  engagementToQualifiedRate: number
  qualifiedToClosedRate: number
  
  // Financial metrics
  totalPipelineValue: number
  averageDealValue: number
  projectedRevenue: number
  actualRevenue: number
  commissionProjected: number
  commissionActual: number
  
  // Performance metrics
  averageDealCycle: number // days
  averageTimePerStage: Record<DealStage, number>
  dealVelocity: number // deals per month
  
  // Trend analysis
  trends: {
    dealVolumeChange: number // percentage change
    conversionRateChange: number
    revenueChange: number
    period: string // comparison period
  }
}

/**
 * Deal service namespace with input/output types
 */
export namespace DealService {
  // Create operations
  export interface CreateDealResponse {
    deal: Deal
    tasks: Array<{ id: string; title: string; priority: string }>
    recommendations: string[]
  }
  
  // Read operations
  export type GetDealsResponse = PaginatedServiceResponse<Deal>
  export type GetDealResponse = ServiceResponse<Deal>
  export type GetDealAnalyticsResponse = ServiceResponse<DealAnalytics>
  
  // Update operations
  export interface UpdateDealResponse {
    deal: Deal
    stageChanged: boolean
    statusChanged: boolean
    tasksGenerated: Array<{ id: string; title: string }>
    notifications: string[]
  }
  
  // Stage progression
  export interface ProgressDealStageInput {
    dealId: string
    targetStage: DealStage
    reason?: string
    notes?: string
    generateTasks?: boolean
  }
  
  export interface ProgressDealStageResponse {
    deal: Deal
    previousStage: DealStage
    newStage: DealStage
    automaticTasks: Array<{ id: string; title: string; dueDate: string }>
    stageRequirements?: string[]
  }
  
  // Bulk operations
  export interface BulkUpdateDealsInput {
    dealIds: string[]
    updates: Partial<UpdateDealInput>
    reason?: string
  }
  
  export interface BulkUpdateDealsResponse {
    updated: number
    failed: number
    errors: Array<{ dealId: string; error: string }>
    summary: {
      stageChanges: Record<DealStage, number>
      statusChanges: Record<DealStatus, number>
    }
  }
  
  // Analytics operations
  export type GetPipelineMetricsResponse = ServiceResponse<DealPipelineMetrics>
  
  export interface GetDealsAnalyticsInput {
    agentIds?: string[]
    dateRange?: {
      startDate: string
      endDate: string
    }
    includeForecasting?: boolean
  }
}