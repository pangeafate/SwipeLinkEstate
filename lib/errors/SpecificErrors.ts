/**
 * Specific error classes for different scenarios
 * Extracted from ErrorTypes.ts to maintain file size limits
 */
import { AppError } from './BaseErrors'
import { ErrorCategory, ErrorSeverity, ErrorMetadata } from './ErrorDefinitions'

/**
 * Network-related errors (API calls, connectivity issues)
 */
export class NetworkError extends AppError {
  constructor(message: string, context?: string, originalError?: Error) {
    super(message, {
      category: ErrorCategory.NETWORK,
      severity: ErrorSeverity.HIGH,
      context: { operation: context }
    }, originalError)
    this.name = 'NetworkError'
  }
}

/**
 * Database-related errors (queries, connections, constraints)
 */
export class DatabaseError extends AppError {
  constructor(message: string, context?: string, originalError?: Error) {
    super(message, {
      category: ErrorCategory.DATABASE,
      severity: ErrorSeverity.HIGH,
      context: { operation: context }
    }, originalError)
    this.name = 'DatabaseError'
  }
}

/**
 * Validation errors (input validation, business rules)
 */
export class ValidationError extends AppError {
  constructor(message: string, field?: string, originalError?: Error) {
    super(message, {
      category: ErrorCategory.VALIDATION,
      severity: ErrorSeverity.MEDIUM,
      context: { field }
    }, originalError)
    this.name = 'ValidationError'
  }
}

/**
 * Authentication errors (login, token validation)
 */
export class AuthenticationError extends AppError {
  constructor(message: string, context?: string, originalError?: Error) {
    super(message, {
      category: ErrorCategory.AUTHENTICATION,
      severity: ErrorSeverity.HIGH,
      context: { operation: context }
    }, originalError)
    this.name = 'AuthenticationError'
  }
}

/**
 * Authorization errors (permissions, access control)
 */
export class AuthorizationError extends AppError {
  constructor(message: string, resource?: string, originalError?: Error) {
    super(message, {
      category: ErrorCategory.AUTHORIZATION,
      severity: ErrorSeverity.HIGH,
      context: { resource }
    }, originalError)
    this.name = 'AuthorizationError'
  }
}

/**
 * Not found errors (missing resources)
 */
export class NotFoundError extends AppError {
  constructor(message: string, resource?: string, originalError?: Error) {
    super(message, {
      category: ErrorCategory.NOT_FOUND,
      severity: ErrorSeverity.MEDIUM,
      context: { resource }
    }, originalError)
    this.name = 'NotFoundError'
  }
}

/**
 * Business logic errors (domain-specific rules)
 */
export class BusinessLogicError extends AppError {
  constructor(message: string, rule?: string, originalError?: Error) {
    super(message, {
      category: ErrorCategory.BUSINESS_LOGIC,
      severity: ErrorSeverity.MEDIUM,
      context: { rule }
    }, originalError)
    this.name = 'BusinessLogicError'
  }
}

/**
 * External service errors (third-party APIs, integrations)
 */
export class ExternalServiceError extends AppError {
  constructor(message: string, service?: string, originalError?: Error) {
    super(message, {
      category: ErrorCategory.EXTERNAL_SERVICE,
      severity: ErrorSeverity.HIGH,
      context: { service }
    }, originalError)
    this.name = 'ExternalServiceError'
  }
}