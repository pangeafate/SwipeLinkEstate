/**
 * CRM Constants and Enum Values
 * 
 * Comprehensive constants for the SwipeLink Estate CRM system following
 * the exact enum values specified in the CRM Master Specification.
 * 
 * These constants ensure type safety and prevent invalid values throughout
 * the application while providing a single source of truth for all enums.
 * 
 * @version 1.0.0
 * @author SwipeLink Estate CRM Team
 * @see /DevelopmentGuidelines/CRM-MASTER-SPECIFICATION.md
 */

/**
 * Deal status constants following CRM Master Specification Section 2.2
 */
export const DEAL_STATUS = {
  ACTIVE: 'active',
  QUALIFIED: 'qualified', 
  NURTURING: 'nurturing',
  CLOSED_WON: 'closed-won',
  CLOSED_LOST: 'closed-lost'
} as const

/**
 * Deal lifecycle stages following CRM Master Specification Section 2.1
 */
export const DEAL_STAGE = {
  CREATED: 'created',
  SHARED: 'shared',
  ACCESSED: 'accessed', 
  ENGAGED: 'engaged',
  QUALIFIED: 'qualified',
  ADVANCED: 'advanced',
  CLOSED: 'closed'
} as const

/**
 * Client temperature classification following CRM Master Specification Section 3.2
 */
export const CLIENT_TEMPERATURE = {
  HOT: 'hot',     // 80-100 points
  WARM: 'warm',   // 50-79 points  
  COLD: 'cold'    // 0-49 points
} as const

/**
 * Task priority levels
 */
export const TASK_PRIORITY = {
  URGENT: 'urgent',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
} as const

/**
 * Task status options
 */
export const TASK_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  DISMISSED: 'dismissed',
  OVERDUE: 'overdue',
  BLOCKED: 'blocked'
} as const

/**
 * Task types for real estate workflows
 */
export const TASK_TYPE = {
  CALL: 'call',
  EMAIL: 'email',
  TEXT_MESSAGE: 'text_message',
  SHOWING: 'showing',
  FOLLOW_UP: 'follow_up',
  URGENT_CALL: 'urgent_call',
  URGENT_FOLLOW_UP: 'urgent_follow_up',
  PREPARATION: 'preparation',
  ANALYSIS: 'analysis',
  ADMINISTRATIVE: 'administrative',
  CONTRACT_REVIEW: 'contract_review',
  APPOINTMENT_SCHEDULING: 'appointment_scheduling',
  LEAD_QUALIFICATION: 'lead_qualification',
  MARKET_RESEARCH: 'market_research',
  FEEDBACK_COLLECTION: 'feedback_collection',
  REFERRAL_FOLLOW_UP: 'referral_follow_up',
  CLOSING_COORDINATION: 'closing_coordination',
  POST_SALE_FOLLOW_UP: 'post_sale_follow_up',
  GENERAL: 'general',
  CUSTOM: 'custom'
} as const

/**
 * Task trigger types for automation
 */
export const TASK_TRIGGER_TYPE = {
  HIGH_ENGAGEMENT: 'high_engagement',
  LINK_ACCESSED: 'link_accessed',
  MULTIPLE_LIKES: 'multiple_likes',
  TIME_BASED: 'time_based',
  MILESTONE: 'milestone',
  STATUS_CHANGE: 'status_change',
  RULE_BASED: 'rule_based',
  AUTOMATED: 'automated',
  MANUAL: 'manual',
  SCORE_THRESHOLD: 'score_threshold',
  INACTIVITY: 'inactivity',
  TEMPERATURE_CHANGE: 'temperature_change',
  PROPERTY_INTERACTION: 'property_interaction',
  SESSION_COMPLETE: 'session_complete',
  BEHAVIORAL_PATTERN: 'behavioral_pattern'
} as const

/**
 * Property interaction types for engagement scoring
 */
export const PROPERTY_INTERACTION_TYPE = {
  VIEWED: 'viewed',
  LIKED: 'liked',
  DISLIKED: 'disliked',
  CONSIDERED: 'considered',
  DETAIL_VIEWED: 'detail_viewed',
  IMAGE_BROWSED: 'image_browsed',
  MAP_VIEWED: 'map_viewed'
} as const

/**
 * Communication preferences
 */
export const COMMUNICATION_PREFERENCE = {
  EMAIL: 'email',
  PHONE: 'phone',
  TEXT: 'text',
  APP_NOTIFICATION: 'app_notification'
} as const

/**
 * Deal source channels
 */
export const DEAL_SOURCE = {
  LINK: 'link',
  REFERRAL: 'referral',
  MARKETING: 'marketing',
  DIRECT: 'direct',
  WEBSITE: 'website',
  SOCIAL: 'social'
} as const

/**
 * Analytics time periods
 */
export const ANALYTICS_TIME_PERIOD = {
  TODAY: 'today',
  YESTERDAY: 'yesterday',
  LAST_7_DAYS: 'last_7_days',
  LAST_30_DAYS: 'last_30_days',
  THIS_MONTH: 'this_month',
  LAST_MONTH: 'last_month',
  THIS_QUARTER: 'this_quarter',
  LAST_QUARTER: 'last_quarter',
  THIS_YEAR: 'this_year',
  LAST_YEAR: 'last_year',
  CUSTOM: 'custom'
} as const

/**
 * Dashboard widget types
 */
export const DASHBOARD_WIDGET_TYPE = {
  PIPELINE_OVERVIEW: 'pipeline_overview',
  PERFORMANCE_METRICS: 'performance_metrics',
  RECENT_ACTIVITY: 'recent_activity',
  UPCOMING_TASKS: 'upcoming_tasks',
  HOT_LEADS: 'hot_leads',
  CONVERSION_FUNNEL: 'conversion_funnel',
  REVENUE_CHART: 'revenue_chart',
  ENGAGEMENT_TRENDS: 'engagement_trends',
  AGENT_LEADERBOARD: 'agent_leaderboard',
  DEAL_FORECAST: 'deal_forecast',
  TASK_COMPLETION: 'task_completion',
  CLIENT_INSIGHTS: 'client_insights'
} as const

/**
 * Engagement scoring configuration following CRM Master Specification Section 3.1
 */
export const ENGAGEMENT_SCORING = {
  /** Total possible score */
  MAX_SCORE: 100,
  
  /** Component maximum scores */
  MAX_SESSION_COMPLETION: 25,
  MAX_PROPERTY_INTERACTION: 35,
  MAX_BEHAVIORAL_INDICATORS: 25,
  MAX_RECENCY_FACTOR: 15,
  
  /** Temperature thresholds */
  HOT_THRESHOLD: 80,
  WARM_THRESHOLD: 50,
  
  /** Property interaction points */
  POINTS_PER_LIKE: 3,
  POINTS_PER_CONSIDERATION: 2,
  POINTS_PER_DETAIL_VIEW: 2,
  POINTS_PER_IMAGE_BROWSE: 1,
  POINTS_PER_MAP_VIEW: 1,
  
  /** Session completion thresholds */
  PARTIAL_COMPLETION_MIN: 5,
  PARTIAL_COMPLETION_MAX: 15,
  FULL_COMPLETION_MIN: 16,
  FULL_COMPLETION_MAX: 25,
  ADDITIONAL_SESSION_BONUS: 5,
  
  /** Behavioral indicator points */
  RETURN_VISIT_POINTS: 10,
  LONG_SESSION_POINTS: 5,
  HIGH_LIKE_RATIO_POINTS: 5,
  CONSISTENT_PREFERENCES_POINTS: 5,
  
  /** Recency factor points */
  WITHIN_24_HOURS: 15,
  WITHIN_1_WEEK: 10,
  WITHIN_1_MONTH: 5,
  OLDER_THAN_1_MONTH: 0
} as const

/**
 * Default commission rate from CRM Master Specification Section 3.4
 */
export const DEFAULT_COMMISSION_RATE = 2.5 // percentage

/**
 * Task automation rule limits
 */
export const TASK_AUTOMATION_LIMITS = {
  MAX_TRIGGERS_PER_DAY: 50,
  MAX_TRIGGERS_PER_DEAL: 10,
  DEFAULT_COOLDOWN_HOURS: 4,
  MAX_REMINDER_INTERVALS: 5
} as const

/**
 * System performance thresholds
 */
export const PERFORMANCE_THRESHOLDS = {
  API_RESPONSE_TIME_MS: 100,
  DATABASE_QUERY_TIME_MS: 50,
  ENGAGEMENT_UPDATE_TIME_MS: 500,
  TASK_GENERATION_TIME_HOURS: 2
} as const

/**
 * File upload constraints
 */
export const FILE_UPLOAD_LIMITS = {
  MAX_FILE_SIZE_MB: 10,
  ALLOWED_MIME_TYPES: [
    'image/jpeg',
    'image/png', 
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ] as const,
  MAX_FILES_PER_UPLOAD: 5
} as const

/**
 * Validation rules and limits
 */
export const VALIDATION_RULES = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_TEXT_FIELD_LENGTH: 1000,
  MAX_DESCRIPTION_LENGTH: 5000,
  MAX_TAGS_PER_ITEM: 10,
  MAX_TAG_LENGTH: 50,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^\+?[\d\s-()]+$/,
  MIN_DEAL_VALUE: 0,
  MAX_DEAL_VALUE: 100000000, // 100M
  MIN_ENGAGEMENT_SCORE: 0,
  MAX_ENGAGEMENT_SCORE: 100
} as const

/**
 * Export typed versions of constants for strict type checking
 */
export type DealStatusType = typeof DEAL_STATUS[keyof typeof DEAL_STATUS]
export type DealStageType = typeof DEAL_STAGE[keyof typeof DEAL_STAGE]  
export type ClientTemperatureType = typeof CLIENT_TEMPERATURE[keyof typeof CLIENT_TEMPERATURE]
export type TaskPriorityType = typeof TASK_PRIORITY[keyof typeof TASK_PRIORITY]
export type TaskStatusType = typeof TASK_STATUS[keyof typeof TASK_STATUS]
export type TaskTypeType = typeof TASK_TYPE[keyof typeof TASK_TYPE]
export type CommunicationPreferenceType = typeof COMMUNICATION_PREFERENCE[keyof typeof COMMUNICATION_PREFERENCE]
export type DealSourceType = typeof DEAL_SOURCE[keyof typeof DEAL_SOURCE]
export type AnalyticsTimePeriodType = typeof ANALYTICS_TIME_PERIOD[keyof typeof ANALYTICS_TIME_PERIOD]
export type DashboardWidgetTypeType = typeof DASHBOARD_WIDGET_TYPE[keyof typeof DASHBOARD_WIDGET_TYPE]