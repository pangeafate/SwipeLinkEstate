/**
 * API Response and Service I/O Type Definitions for SwipeLink Estate CRM
 * Part of the modular CRM type system following industry best practices
 * 
 * Provides comprehensive type safety for API responses, service inputs/outputs,
 * database operations, and form validation throughout the CRM system.
 * 
 * @version 1.0.0
 * @author SwipeLink Estate CRM Team
 * @see /DevelopmentGuidelines/CRM-MASTER-SPECIFICATION.md Section 6
 */

/**
 * Standard API response wrapper with comprehensive error handling
 * @template T The expected data type for successful responses
 */
export interface CRMApiResponse<T> {
  /** Indicates if the request was successful */
  success: boolean
  
  /** Response data (only present on success) */
  data?: T
  
  /** Error information (only present on failure) */
  error?: {
    code: string
    message: string
    details?: Record<string, unknown>
    stack?: string // Only in development
  }
  
  /** Additional metadata */
  metadata?: {
    requestId: string
    timestamp: string
    executionTime: number // milliseconds
    apiVersion: string
    rateLimit?: {
      remaining: number
      reset: string // ISO timestamp
      limit: number
    }
  }
  
  /** Warnings that don't prevent success but should be noted */
  warnings?: string[]
}

/**
 * Paginated API response with comprehensive pagination metadata
 * @template T The type of items being paginated
 */
export interface PaginatedResponse<T> {
  /** Array of items for the current page */
  data: T[]
  
  /** Comprehensive pagination information */
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrevious: boolean
    
    /** Links for easy navigation */
    links: {
      first: string | null
      previous: string | null
      current: string
      next: string | null
      last: string | null
    }
    
    /** Additional pagination context */
    range: {
      from: number // First item index (1-based)
      to: number   // Last item index (1-based)
    }
  }
  
  /** Filters applied to generate this result set */
  appliedFilters?: Record<string, unknown>
  
  /** Sorting applied to the results */
  sorting?: {
    field: string
    direction: 'asc' | 'desc'
  }
  
  /** Performance metadata */
  queryMetadata?: {
    executionTime: number // milliseconds
    cached: boolean
    cacheExpiry?: string
  }
}

/**
 * Bulk operation response for batch processing
 * @template T The type of items being processed
 * @template E The type of error information for failed items
 */
export interface BulkOperationResponse<T, E = string> {
  /** Overall operation success status */
  success: boolean
  
  /** Items that were processed successfully */
  successful: T[]
  
  /** Items that failed processing with error details */
  failed: Array<{
    item: Partial<T>
    error: E
    index: number
  }>
  
  /** Summary statistics */
  summary: {
    total: number
    successful: number
    failed: number
    skipped: number
    processingTime: number // milliseconds
  }
  
  /** Overall error if the entire operation failed */
  operationError?: {
    code: string
    message: string
    details?: Record<string, unknown>
  }
  
  /** Warnings generated during processing */
  warnings?: string[]
}

/**
 * Database operation result with audit information
 * @template T The type of the database record
 */
export interface DatabaseOperationResult<T> {
  /** The affected record(s) */
  data: T | T[]
  
  /** Type of operation performed */
  operation: 'create' | 'read' | 'update' | 'delete' | 'upsert'
  
  /** Number of records affected */
  recordsAffected: number
  
  /** Audit trail information */
  audit: {
    performedBy: string // User/Agent ID
    timestamp: string
    ipAddress?: string
    userAgent?: string
  }
  
  /** Database performance metadata */
  performance: {
    queryTime: number // milliseconds
    fromCache: boolean
  }
  
  /** Validation results if applicable */
  validation?: {
    passed: boolean
    errors?: string[]
    warnings?: string[]
  }
}

/**
 * Form validation result with field-level error details
 */
export interface FormValidationResult {
  /** Overall validation status */
  isValid: boolean
  
  /** Field-specific errors */
  fieldErrors: Record<string, string[]>
  
  /** Form-level errors (cross-field validation) */
  formErrors: string[]
  
  /** Warnings that don't prevent submission */
  warnings: Record<string, string[]>
  
  /** Validation context */
  validationContext: {
    timestamp: string
    validatorVersion: string
    rules: string[] // Names of validation rules applied
  }
}

/**
 * Search result response with relevance scoring and facets
 * @template T The type of search result items
 */
export interface SearchResponse<T> {
  /** Search result items */
  results: T[]
  
  /** Search metadata */
  searchMetadata: {
    query: string
    totalResults: number
    executionTime: number // milliseconds
    searchId: string // For debugging and analytics
  }
  
  /** Faceted search results for filtering */
  facets?: Record<string, Array<{
    value: string
    count: number
    selected: boolean
  }>>
  
  /** Search suggestions and corrections */
  suggestions?: {
    didYouMean?: string[]
    relatedQueries?: string[]
    autoComplete?: string[]
  }
  
  /** Pagination for search results */
  pagination: PaginatedResponse<T>['pagination']
}

/**
 * Real-time update notification structure
 * @template T The type of data being updated
 */
export interface RealtimeNotification<T> {
  /** Unique notification ID */
  id: string
  
  /** Type of update */
  type: 'create' | 'update' | 'delete' | 'status_change' | 'engagement_update'
  
  /** Entity type being updated */
  entityType: 'deal' | 'client' | 'task' | 'activity' | 'engagement'
  
  /** Entity ID */
  entityId: string
  
  /** The updated data */
  data: T
  
  /** Previous data for comparison (on updates) */
  previousData?: Partial<T>
  
  /** Change summary */
  changes?: {
    changedFields: string[]
    changeType: 'minor' | 'major' | 'critical'
    triggeredBy: string // User/System ID
  }
  
  /** Notification metadata */
  metadata: {
    timestamp: string
    source: 'user_action' | 'system_automation' | 'external_integration'
    priority: 'low' | 'medium' | 'high' | 'critical'
    
    /** Delivery tracking */
    delivery: {
      attempts: number
      lastAttempt: string
      acknowledged: boolean
    }
  }
}

/**
 * Health check response for service monitoring
 */
export interface HealthCheckResponse {
  /** Overall system health status */
  status: 'healthy' | 'degraded' | 'unhealthy'
  
  /** Timestamp of health check */
  timestamp: string
  
  /** Individual service statuses */
  services: Record<string, {
    status: 'up' | 'down' | 'degraded'
    responseTime: number // milliseconds
    lastCheck: string
    details?: Record<string, unknown>
  }>
  
  /** System metrics */
  metrics: {
    uptime: number // seconds
    memoryUsage: number // percentage
    cpuUsage: number // percentage
    diskUsage: number // percentage
    activeConnections: number
    requestsPerMinute: number
  }
  
  /** Dependencies status */
  dependencies: {
    database: 'connected' | 'disconnected' | 'slow'
    cache: 'available' | 'unavailable'
    externalAPIs: Record<string, 'reachable' | 'unreachable' | 'timeout'>
  }
}

/**
 * Service configuration response for feature toggles and settings
 */
export interface ServiceConfigResponse {
  /** Feature flags */
  features: Record<string, boolean>
  
  /** Configuration values */
  config: Record<string, string | number | boolean>
  
  /** Rate limiting configuration */
  rateLimits: Record<string, {
    requests: number
    windowMs: number
    skipSuccessfulRequests: boolean
  }>
  
  /** API version information */
  version: {
    api: string
    build: string
    deployedAt: string
  }
  
  /** Environment information */
  environment: {
    name: 'development' | 'staging' | 'production'
    region: string
    datacenter?: string
  }
}

/**
 * Analytics query response with aggregated data
 * @template T The type of analytics data points
 */
export interface AnalyticsResponse<T> {
  /** Analytics data points */
  data: T[]
  
  /** Query information */
  query: {
    metrics: string[]
    dimensions: string[]
    filters: Record<string, unknown>
    dateRange: {
      start: string
      end: string
      granularity: 'hour' | 'day' | 'week' | 'month'
    }
  }
  
  /** Aggregated summaries */
  summary: {
    totals: Record<string, number>
    averages: Record<string, number>
    trends: Record<string, 'up' | 'down' | 'stable'>
  }
  
  /** Data quality indicators */
  dataQuality: {
    completeness: number // percentage
    freshness: string // last update timestamp
    accuracy: number // confidence score 0-1
    sampleSize?: number
  }
  
  /** Comparative data (e.g., previous period) */
  comparison?: {
    period: string
    data: T[]
    summary: AnalyticsResponse<T>['summary']
    changes: Record<string, {
      absolute: number
      percentage: number
    }>
  }
}

/**
 * File upload response with processing status
 */
export interface FileUploadResponse {
  /** Upload success status */
  success: boolean
  
  /** Uploaded file information */
  file?: {
    id: string
    originalName: string
    storedName: string
    url: string
    size: number // bytes
    mimeType: string
    checksum: string
  }
  
  /** Processing status for files requiring processing */
  processing?: {
    status: 'pending' | 'in_progress' | 'completed' | 'failed'
    progress: number // percentage
    estimatedCompletion?: string
    resultUrl?: string
  }
  
  /** Error information if upload failed */
  error?: {
    code: 'FILE_TOO_LARGE' | 'INVALID_TYPE' | 'PROCESSING_FAILED' | 'QUOTA_EXCEEDED'
    message: string
    details?: Record<string, unknown>
  }
  
  /** Security scan results */
  security?: {
    scanned: boolean
    threats: string[]
    safe: boolean
  }
}

/**
 * Export operation response for data exports
 */
export interface ExportResponse {
  /** Export operation ID for tracking */
  exportId: string
  
  /** Current status of the export */
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'expired'
  
  /** Progress information */
  progress: {
    percentage: number
    recordsProcessed: number
    totalRecords: number
    estimatedCompletion?: string
  }
  
  /** Export configuration */
  config: {
    format: 'csv' | 'xlsx' | 'json' | 'pdf'
    filters: Record<string, unknown>
    columns: string[]
    dateRange?: {
      start: string
      end: string
    }
  }
  
  /** Download information (when completed) */
  download?: {
    url: string
    expiresAt: string
    fileSize: number // bytes
    filename: string
  }
  
  /** Error information if export failed */
  error?: {
    code: string
    message: string
    retryable: boolean
  }
}

/**
 * Webhook delivery response for external integrations
 */
export interface WebhookResponse {
  /** Webhook delivery ID */
  deliveryId: string
  
  /** Target webhook URL */
  url: string
  
  /** Delivery status */
  status: 'pending' | 'delivered' | 'failed' | 'retrying'
  
  /** HTTP response details */
  response?: {
    statusCode: number
    headers: Record<string, string>
    body?: string
    responseTime: number // milliseconds
  }
  
  /** Delivery attempts */
  attempts: Array<{
    timestamp: string
    statusCode: number | null
    error?: string
    duration: number // milliseconds
  }>
  
  /** Payload information */
  payload: {
    event: string
    timestamp: string
    data: Record<string, unknown>
    signature: string // For webhook verification
  }
  
  /** Retry configuration */
  retry: {
    maxAttempts: number
    currentAttempt: number
    nextRetry?: string
    backoffMs: number
  }
}