/**
 * Deal-related type definitions for SwipeLink Estate CRM
 * Part of the modular CRM type system following CRM Master Specification
 * 
 * Implements the Link-as-Deal paradigm with comprehensive deal lifecycle management.
 * All enums match the exact values specified in the CRM Master Specification.
 * 
 * @version 1.0.0
 * @see /DevelopmentGuidelines/CRM-MASTER-SPECIFICATION.md Section 2
 */

import { DatabaseRecord } from '../types'

/**
 * Deal status classifications following CRM Master Specification Section 2.2
 * Represents the overall business state of the deal
 */
export type DealStatus = 
  | 'active'       // Link created and ready for sharing
  | 'qualified'    // Client has accessed link and shown engagement (score >50)
  | 'nurturing'    // Ongoing follow-up and relationship building
  | 'closed-won'   // Successful property transaction completed  
  | 'closed-lost'  // Deal ended without transaction

/**
 * Deal lifecycle stages following CRM Master Specification Section 2.1
 * Represents the specific point in the 7-stage sales pipeline
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
 * Client temperature classification based on engagement score
 * Following CRM Master Specification Section 3.2
 */
export type ClientTemperature = 
  | 'hot'        // 80-100 points - Immediate follow-up priority
  | 'warm'       // 50-79 points - Scheduled follow-up within 48 hours
  | 'cold'       // 0-49 points - Nurture campaign, weekly check-ins

/**
 * Deal priority levels for agent workflow management
 */
export type DealPriority = 'urgent' | 'high' | 'medium' | 'low'

/**
 * Deal source indicating origin channel
 */
export type DealSource = 'link' | 'referral' | 'marketing' | 'direct' | 'website' | 'social'

/**
 * Core Deal entity extending Link data with comprehensive CRM functionality
 * Implements the Link-as-Deal paradigm from CRM Master Specification
 */
export interface Deal extends DatabaseRecord {
  // Link Integration (Link-as-Deal paradigm)
  linkId: string
  linkCode: string
  
  // Agent Assignment  
  agentId: string
  coAgentId?: string | null
  teamId?: string | null
  
  // Deal Identification
  dealName: string
  dealNumber: string // Auto-generated unique identifier
  dealStatus: DealStatus
  dealStage: DealStage
  dealValue: number | null // Estimated commission value
  
  // Client Information (Progressive Profiling)
  clientId: string | null
  clientName: string | null
  clientEmail: string | null  
  clientPhone: string | null
  clientSource: DealSource
  clientTemperature: ClientTemperature
  
  // Property Portfolio
  propertyIds: string[]
  propertyCount: number
  averagePropertyValue: number | null
  
  // Engagement and Behavioral Data
  engagementScore: number // 0-100 following CRM Master Spec Section 3.1
  sessionCount: number
  totalTimeSpent: number // seconds
  lastEngagementAt: string | null
  
  // Financial Projections
  estimatedClosingValue: number | null
  commissionRate: number // Default 2.5% per CRM Master Spec Section 3.4
  estimatedCommission: number | null
  
  // Timeline Management
  expectedCloseDate: string | null
  actualCloseDate: string | null
  daysSinceCreated: number
  daysSinceLastActivity: number
  
  // Task and Follow-up Management  
  nextFollowUpDate: string | null
  nextFollowUpType: string | null
  pendingTasksCount: number
  completedTasksCount: number
  
  // CRM Specific Fields
  priority: DealPriority
  notes: string | null
  tags: string[]
  isArchived: boolean
  
  // Stage History for Audit Trail
  stageHistory: DealStageTransition[]
  
  // Behavioral Insights
  behaviorInsights?: {
    preferredPropertyTypes: string[]
    averageSessionDuration: number
    likeToViewRatio: number
    mostActiveTimeOfDay: string
  }
}

/**
 * Deal stage transition record for audit trail and analytics
 */
export interface DealStageTransition extends DatabaseRecord {
  dealId: string
  fromStage: DealStage | null
  toStage: DealStage
  changedBy: string // Agent ID
  reason?: string
  notes?: string
  engagementScoreAtTransition: number
  automaticTransition: boolean
  triggeredByTaskId?: string
}

/**
 * Comprehensive deal filtering and search interface
 * Supports all filtering requirements from CRM Master Specification
 */
export interface DealFilters {
  // Status and Stage Filters
  statuses?: DealStatus[]
  stages?: DealStage[]
  temperatures?: ClientTemperature[]
  priorities?: DealPriority[]
  sources?: DealSource[]
  
  // Agent and Team Filters
  agentIds?: string[]
  teamIds?: string[]
  includeCoAgentDeals?: boolean
  
  // Time-based Filters
  dateRange?: {
    field: 'createdAt' | 'updatedAt' | 'lastEngagementAt' | 'expectedCloseDate'
    startDate: string
    endDate: string
  }
  
  // Value-based Filters
  dealValueRange?: {
    min: number
    max: number
  }
  estimatedCommissionRange?: {
    min: number
    max: number
  }
  
  // Engagement Filters
  engagementScoreRange?: {
    min: number // 0-100
    max: number // 0-100
  }
  
  // Activity Filters
  daysSinceLastActivity?: {
    min: number
    max: number
  }
  hasOverdueTasks?: boolean
  hasPendingFollowUp?: boolean
  
  // Property Filters
  propertyCountRange?: {
    min: number
    max: number
  }
  propertyTypes?: string[]
  
  // Search and Text Filters
  searchQuery?: string // Searches deal name, client name, notes, tags
  tags?: string[]
  hasNotes?: boolean
  
  // Sorting Options
  sortBy?: 'createdAt' | 'updatedAt' | 'dealValue' | 'engagementScore' | 'expectedCloseDate' | 'dealName'
  sortOrder?: 'asc' | 'desc'
  
  // Pagination
  page?: number
  limit?: number
}

/**
 * Deal creation input for Link-as-Deal automatic generation
 */
export interface CreateDealFromLinkInput {
  linkId: string
  linkData: {
    name: string
    propertyIds: string[]
    agentId: string
    code: string
  }
  
  clientInfo?: {
    name?: string
    email?: string
    phone?: string
    source?: DealSource
  }
  
  dealSettings?: {
    customName?: string
    priority?: DealPriority  
    expectedCloseDate?: string
    tags?: string[]
    notes?: string
  }
}

/**
 * Deal update input with comprehensive field support
 */
export interface UpdateDealInput {
  dealId: string
  
  // Core deal updates
  dealName?: string
  dealValue?: number
  expectedCloseDate?: string
  priority?: DealPriority
  notes?: string
  tags?: string[]
  
  // Client updates
  clientName?: string
  clientEmail?: string
  clientPhone?: string
  clientSource?: DealSource
  
  // Financial updates
  estimatedClosingValue?: number
  commissionRate?: number
  
  // Follow-up updates
  nextFollowUpDate?: string
  nextFollowUpType?: string
  
  // Stage/Status updates (use separate methods for stage transitions)
  // These should typically go through stage progression methods
}

/**
 * Deal stage progression input for controlled stage transitions
 */
export interface ProgressDealStageInput {
  dealId: string
  targetStage: DealStage
  reason?: string
  notes?: string
  generateAutomatedTasks?: boolean
  notifyAgent?: boolean
}

/**
 * Deal analytics for performance insights
 */
export interface DealAnalytics extends DatabaseRecord {
  dealId: string
  
  // Performance Metrics
  daysInCurrentStage: number
  totalDaysInPipeline: number
  stageVelocity: Record<DealStage, number> // days spent in each stage
  
  // Engagement Analytics  
  engagementTrend: 'improving' | 'declining' | 'stable'
  engagementVelocity: number // points per day
  sessionFrequency: number // sessions per week
  
  // Probability and Forecasting
  closeProbability: number // 0-1 based on stage and engagement
  estimatedDaysToClose: number | null
  riskFactors: string[] // Identified risk factors
  
  // Comparative Benchmarks
  performanceVsAverage: {
    engagementScore: number // percentage above/below average
    stageProgression: number // percentage faster/slower  
    dealValue: number // percentage above/below average
  }
  
  // Recommendations
  recommendations: string[]
  nextBestActions: string[]
}

/**
 * Deal summary for dashboard widgets and reporting
 */
export interface DealSummary {
  totalDeals: number
  dealsByStatus: Record<DealStatus, number>
  dealsByStage: Record<DealStage, number>
  dealsByTemperature: Record<ClientTemperature, number>
  totalPipelineValue: number
  averageDealValue: number
  conversionRates: {
    linkToAccess: number
    accessToEngagement: number  
    engagementToQualified: number
    qualifiedToClosed: number
    overall: number
  }
}