/**
 * Task-related type definitions for SwipeLink Estate CRM
 * Part of the modular CRM type system following CRM Master Specification
 * 
 * Implements comprehensive task automation and management system for
 * real estate workflows with behavioral triggering and smart scheduling.
 * 
 * @version 1.0.0
 * @see /DevelopmentGuidelines/CRM-MASTER-SPECIFICATION.md Section 3.3
 */

import { DatabaseRecord, ServiceResponse } from '../types'
import { DealStage, DealStatus, ClientTemperature } from './deal.types'

/**
 * Task priority levels following CRM Master Specification
 */
export type TaskPriority = 
  | 'urgent'    // Immediate attention required (red)
  | 'high'      // High engagement, quick follow-up needed (orange)
  | 'medium'    // Standard follow-up schedule (yellow)
  | 'low'       // Long-term nurturing (green)

/**
 * Task status for workflow management
 */
export type TaskStatus = 
  | 'pending'      // Not yet started
  | 'in_progress'  // Currently being worked on
  | 'completed'    // Successfully completed
  | 'dismissed'    // Dismissed without completion
  | 'overdue'      // Past due date
  | 'blocked'      // Cannot proceed due to external factors

/**
 * Comprehensive task types for real estate workflows
 */
export type TaskType = 
  | 'call'                    // Phone call to client
  | 'email'                   // Email communication
  | 'text_message'            // SMS communication
  | 'showing'                 // Property showing
  | 'follow_up'               // General follow-up
  | 'urgent_call'             // Immediate call required
  | 'urgent_follow_up'        // Urgent follow-up required
  | 'preparation'             // Meeting/showing preparation
  | 'analysis'                // Market analysis or research
  | 'administrative'          // Administrative tasks
  | 'contract_review'         // Contract or document review
  | 'appointment_scheduling'  // Schedule appointments
  | 'lead_qualification'      // Qualify lead
  | 'market_research'         // Research market conditions
  | 'feedback_collection'     // Collect client feedback
  | 'referral_follow_up'      // Follow up on referrals
  | 'closing_coordination'    // Coordinate closing process
  | 'post_sale_follow_up'     // Post-sale client care
  | 'general'                 // General task
  | 'custom'                  // Custom user-defined type

/**
 * Task trigger types for automation rules
 */
export type TaskTriggerType = 
  | 'high_engagement'         // Engagement score > 80
  | 'link_accessed'           // Client accessed link
  | 'multiple_likes'          // Client liked multiple properties
  | 'time_based'              // Time-based trigger (e.g., 24 hours after)
  | 'milestone'               // Deal stage milestone reached
  | 'status_change'           // Deal status changed
  | 'rule_based'              // Complex rule-based trigger
  | 'automated'               // System-automated generation
  | 'manual'                  // Manually created by agent
  | 'score_threshold'         // Engagement score threshold
  | 'inactivity'              // Client inactivity trigger
  | 'temperature_change'      // Client temperature changed
  | 'property_interaction'    // Specific property interactions
  | 'session_complete'        // Link session completed
  | 'behavioral_pattern'      // Behavioral pattern detected

/**
 * Task urgency levels for immediate attention classification
 */
export type TaskUrgency = 
  | 'critical'    // Must be done immediately (within 1 hour)
  | 'high'        // Should be done today
  | 'normal'      // Standard timing
  | 'low'         // Can be delayed

/**
 * Comprehensive Task entity with CRM integration
 */
export interface Task extends DatabaseRecord {
  // Core Identification
  taskNumber: string // Auto-generated unique identifier
  title: string
  description: string
  type: TaskType
  category: 'sales' | 'marketing' | 'administrative' | 'follow_up' | 'closing'
  
  // Priority and Urgency
  priority: TaskPriority
  urgency: TaskUrgency
  status: TaskStatus
  
  // Assignment and Ownership
  dealId: string
  agentId: string
  assignedBy: string | null // Who assigned the task
  delegatedTo: string | null // If delegated to another agent
  teamId: string | null
  
  // Client and Property Context
  clientId: string | null
  clientName: string | null
  propertyIds: string[]
  relatedProperties: Array<{
    propertyId: string
    propertyAddress: string
    relevance: 'primary' | 'alternative' | 'comparative'
  }>
  
  // Scheduling and Timing
  dueDate: string | null
  dueDateFlexibility: 'strict' | 'flexible' | 'approximate'
  estimatedDuration: number | null // minutes
  actualDuration: number | null // minutes (after completion)
  
  // Reminders and Notifications
  reminderDates: string[] // Multiple reminder times
  snoozedUntil: string | null
  escalationDate: string | null // When to escalate if incomplete
  
  // Automation Context
  isAutomated: boolean
  automationRuleId: string | null
  triggerType: TaskTriggerType
  triggerData: TaskTriggerData | null
  
  // Dependencies and Blocking
  dependencies: string[] // Task IDs this task depends on
  blockedBy: string[] // What's blocking this task
  blocks: string[] // What tasks this task blocks
  
  // Completion and Results
  completedAt: string | null
  completedBy: string | null
  completionNotes: string | null
  outcomeType: TaskOutcome | null
  followUpTasks: string[] // Generated follow-up tasks
  
  // Context and Metadata
  notes: string | null
  tags: string[]
  attachments: TaskAttachment[]
  communicationLog: CommunicationEntry[]
  
  // Performance Tracking
  engagementScoreAtCreation: number | null
  engagementScoreAtCompletion: number | null
  temperatureAtCreation: ClientTemperature | null
  temperatureAtCompletion: ClientTemperature | null
  
  // External Integration
  externalSystemIds: Record<string, string> // CRM/calendar integration IDs
  calendarEventId: string | null
}

/**
 * Task trigger data for context preservation
 */
export interface TaskTriggerData {
  triggerSource: string // What triggered the task
  triggerContext: Record<string, unknown> // Additional context data
  engagementScore: number | null
  sessionId: string | null
  propertyInteractions: Array<{
    propertyId: string
    action: string
    timestamp: string
  }>
  dealStageAtTrigger: DealStage | null
  clientTemperatureAtTrigger: ClientTemperature | null
}

/**
 * Task completion outcomes for performance analysis
 */
export type TaskOutcome = 
  | 'successful'           // Task completed successfully
  | 'partially_successful' // Partial completion
  | 'no_response'         // Client didn't respond
  | 'rescheduled'         // Rescheduled for later
  | 'cancelled'           // Task cancelled
  | 'delegated'           // Delegated to someone else
  | 'converted'           // Led to conversion/advancement
  | 'unsuccessful'        // Task completed but unsuccessful

/**
 * Task attachment for document management
 */
export interface TaskAttachment extends DatabaseRecord {
  taskId: string
  fileName: string
  fileType: string
  fileSize: number
  storageUrl: string
  uploadedBy: string
  description: string | null
}

/**
 * Communication entry for task-related interactions
 */
export interface CommunicationEntry extends DatabaseRecord {
  taskId: string
  type: 'call' | 'email' | 'text' | 'meeting' | 'note'
  direction: 'inbound' | 'outbound' | 'internal'
  subject: string | null
  content: string
  duration: number | null // for calls/meetings, in minutes
  participantIds: string[] // Client and agent IDs
  attachments: string[] // File URLs or attachment IDs
  outcome: 'positive' | 'neutral' | 'negative' | 'no_response'
}

/**
 * Task automation rule with comprehensive triggering logic
 */
export interface TaskAutomationRule extends DatabaseRecord {
  // Rule Identification
  name: string
  description: string
  category: 'engagement' | 'follow_up' | 'milestone' | 'time_based' | 'behavioral'
  
  // Trigger Conditions (AND logic between conditions)
  conditions: {
    // Deal-based conditions
    dealStages?: DealStage[]
    dealStatuses?: DealStatus[]
    dealAge?: { min: number; max: number } // days since creation
    
    // Engagement conditions
    engagementScore?: { min: number; max: number }
    engagementTrend?: 'improving' | 'declining' | 'stable'
    clientTemperature?: ClientTemperature[]
    
    // Activity conditions
    daysSinceLastActivity?: { min: number; max: number }
    daysSinceLastTask?: { min: number; max: number }
    sessionCount?: { min: number; max: number }
    
    // Property interaction conditions
    propertiesLiked?: { min: number; max: number }
    propertiesConsidered?: { min: number; max: number }
    sessionCompletionRate?: { min: number; max: number } // percentage
    
    // Time-based conditions
    timeOfDay?: { start: number; end: number } // hours 0-23
    daysOfWeek?: number[] // 0-6, Sunday = 0
    dateRange?: { start: string; end: string }
    
    // Client profile conditions
    clientSource?: string[]
    clientTags?: string[]
    isQualifiedClient?: boolean
  }
  
  // Task Generation Configuration
  action: {
    taskType: TaskType
    taskTitle: string // Can include template variables like ${clientName}
    taskDescription: string
    taskPriority: TaskPriority
    taskUrgency: TaskUrgency
    category: 'sales' | 'marketing' | 'administrative' | 'follow_up' | 'closing'
    
    // Scheduling
    delayMinutes?: number // Delay before creating task
    dueInHours?: number // When task is due (hours from creation)
    dueDateFlexibility?: 'strict' | 'flexible' | 'approximate'
    
    // Assignment
    assignTo: 'deal_agent' | 'specific_agent' | 'team_lead' | 'auto_assign'
    specificAgentId?: string
    
    // Additional configuration
    generateReminders?: boolean
    reminderIntervals?: number[] // hours before due date
    autoEscalate?: boolean
    escalationHours?: number
    tags?: string[]
  }
  
  // Rule Management
  isActive: boolean
  agentIds: string[] // Empty array = applies to all agents
  teamIds: string[] // Empty array = applies to all teams
  
  // Performance Tracking
  timesTriggered: number
  successRate: number // percentage of generated tasks completed successfully
  averageCompletionTime: number // hours
  lastTriggered: string | null
  
  // Rule Constraints
  maxTriggersPerDay?: number // Prevent spam
  maxTriggersPerDeal?: number // Prevent duplicate tasks
  cooldownHours?: number // Minimum time between triggers for same deal
}

/**
 * Task template for consistent task creation
 */
export interface TaskTemplate extends DatabaseRecord {
  name: string
  description: string
  type: TaskType
  category: 'sales' | 'marketing' | 'administrative' | 'follow_up' | 'closing'
  
  // Template Configuration
  titleTemplate: string // Template with variables
  descriptionTemplate: string
  defaultPriority: TaskPriority
  defaultUrgency: TaskUrgency
  estimatedDuration: number | null // minutes
  
  // Scheduling defaults
  defaultDueInHours: number | null
  dueDateFlexibility: 'strict' | 'flexible' | 'approximate'
  defaultReminders: number[] // hours before due date
  
  // Context requirements
  requiresClientInfo: boolean
  requiresPropertyInfo: boolean
  requiresNotes: boolean
  
  // Usage statistics
  usageCount: number
  averageCompletionTime: number | null
  successRate: number | null
  
  // Template tags and categorization
  tags: string[]
  isSystemTemplate: boolean // Created by system vs user
  createdBy: string
}

/**
 * Task filtering and search interface
 */
export interface TaskFilters {
  // Status and Priority Filters
  statuses?: TaskStatus[]
  priorities?: TaskPriority[]
  urgencies?: TaskUrgency[]
  types?: TaskType[]
  categories?: ('sales' | 'marketing' | 'administrative' | 'follow_up' | 'closing')[]
  
  // Assignment Filters
  agentIds?: string[]
  teamIds?: string[]
  assignedBy?: string[]
  delegatedTo?: string[]
  
  // Context Filters
  dealIds?: string[]
  clientIds?: string[]
  hasPropertyContext?: boolean
  propertyIds?: string[]
  
  // Time-based Filters
  dateRange?: {
    field: 'createdAt' | 'dueDate' | 'completedAt'
    startDate: string
    endDate: string
  }
  
  // Due date filters
  dueToday?: boolean
  overdue?: boolean
  dueSoon?: boolean // Due within 24 hours
  dueThisWeek?: boolean
  
  // Automation filters
  isAutomated?: boolean
  triggerTypes?: TaskTriggerType[]
  automationRuleIds?: string[]
  
  // Completion filters
  completionOutcomes?: TaskOutcome[]
  completedBy?: string[]
  hasFollowUpTasks?: boolean
  
  // Search and tags
  searchQuery?: string // Searches title, description, notes
  tags?: string[]
  hasNotes?: boolean
  hasAttachments?: boolean
  
  // Engagement context
  engagementScoreRange?: { min: number; max: number }
  temperatureAtCreation?: ClientTemperature[]
  
  // Performance filters
  durationRange?: { min: number; max: number } // minutes
  createdInLastDays?: number
  
  // Sorting options
  sortBy?: 'createdAt' | 'dueDate' | 'priority' | 'urgency' | 'completedAt' | 'title'
  sortOrder?: 'asc' | 'desc'
  
  // Pagination
  page?: number
  limit?: number
}

/**
 * Task analytics and performance metrics
 */
export interface TaskAnalytics {
  agentId?: string // If agent-specific, otherwise system-wide
  dateRange: { startDate: string; endDate: string }
  
  // Volume metrics
  totalTasks: number
  completedTasks: number
  pendingTasks: number
  overdueTasks: number
  
  // Performance metrics
  completionRate: number // percentage
  averageCompletionTime: number // hours
  onTimeCompletionRate: number // percentage
  
  // Breakdown by categories
  tasksByType: Record<TaskType, number>
  tasksByPriority: Record<TaskPriority, number>
  tasksByStatus: Record<TaskStatus, number>
  tasksByOutcome: Record<TaskOutcome, number>
  
  // Automation effectiveness
  automatedTasks: number
  automationSuccessRate: number
  topTriggerTypes: Array<{ type: TaskTriggerType; count: number }>
  
  // Trends
  dailyTaskCounts: Array<{ date: string; created: number; completed: number }>
  taskLoadTrend: 'increasing' | 'stable' | 'decreasing'
  
  // Recommendations
  recommendations: string[]
}

/**
 * Task service namespace with input/output types
 */
export namespace TaskService {
  export interface CreateTaskInput {
    title: string
    description?: string
    type: TaskType
    category?: 'sales' | 'marketing' | 'administrative' | 'follow_up' | 'closing'
    priority?: TaskPriority
    urgency?: TaskUrgency
    dealId: string
    agentId: string
    clientId?: string
    propertyIds?: string[]
    dueDate?: string
    notes?: string
    tags?: string[]
    templateId?: string // Use template
  }
  
  export interface UpdateTaskInput {
    taskId: string
    title?: string
    description?: string
    priority?: TaskPriority
    urgency?: TaskUrgency
    status?: TaskStatus
    dueDate?: string
    notes?: string
    tags?: string[]
    delegatedTo?: string
  }
  
  export interface CompleteTaskInput {
    taskId: string
    completionNotes?: string
    outcome: TaskOutcome
    actualDuration?: number // minutes
    generateFollowUpTasks?: boolean
  }
  
  export type CreateTaskResponse = ServiceResponse<{
    task: Task
    generatedTasks?: Task[] // If template created multiple tasks
    recommendations?: string[]
  }>
  
  export type UpdateTaskResponse = ServiceResponse<Task>
  
  export type CompleteTaskResponse = ServiceResponse<{
    task: Task
    followUpTasks: Task[]
    engagementImpact?: {
      scoreChange: number
      temperatureChange?: string
    }
  }>
  
  export interface BulkTaskOperationInput {
    taskIds: string[]
    operation: 'complete' | 'delete' | 'update_priority' | 'reassign'
    operationData?: Record<string, unknown>
  }
  
  export interface BulkTaskOperationResponse {
    successful: number
    failed: number
    errors: Array<{ taskId: string; error: string }>
  }
}