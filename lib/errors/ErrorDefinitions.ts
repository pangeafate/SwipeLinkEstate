/**
 * Error enums and basic definitions
 * Extracted from ErrorTypes.ts to maintain file size limits
 */

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum ErrorCategory {
  NETWORK = 'network',
  DATABASE = 'database',
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  NOT_FOUND = 'not_found',
  BUSINESS_LOGIC = 'business_logic',
  EXTERNAL_SERVICE = 'external_service',
  UNKNOWN = 'unknown'
}

export interface ErrorMetadata {
  category: ErrorCategory
  severity: ErrorSeverity
  code?: string
  context?: Record<string, any>
  timestamp?: string
  userAgent?: string
  url?: string
  userId?: string
}