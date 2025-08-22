/**
 * Base error classes
 * Extracted from ErrorTypes.ts to maintain file size limits
 */
import { ErrorMetadata, ErrorCategory, ErrorSeverity } from './ErrorDefinitions'

/**
 * Base application error class
 */
export class AppError extends Error {
  public readonly metadata: ErrorMetadata
  public readonly originalError?: Error

  constructor(
    message: string,
    metadata: Partial<ErrorMetadata> = {},
    originalError?: Error
  ) {
    super(message)
    this.name = 'AppError'
    this.metadata = {
      category: ErrorCategory.UNKNOWN,
      severity: ErrorSeverity.MEDIUM,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Server',
      url: typeof window !== 'undefined' ? window.location.href : 'Server',
      ...metadata
    }
    this.originalError = originalError

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError)
    }
  }

  /**
   * Get error details as a plain object
   */
  toJSON(): Record<string, any> {
    return {
      name: this.name,
      message: this.message,
      metadata: this.metadata,
      stack: this.stack,
      originalError: this.originalError ? {
        name: this.originalError.name,
        message: this.originalError.message,
        stack: this.originalError.stack
      } : undefined
    }
  }

  /**
   * Check if error matches a specific category
   */
  isCategory(category: ErrorCategory): boolean {
    return this.metadata.category === category
  }

  /**
   * Check if error has minimum severity level
   */
  hasSeverity(severity: ErrorSeverity): boolean {
    const severityLevels = {
      [ErrorSeverity.LOW]: 1,
      [ErrorSeverity.MEDIUM]: 2,
      [ErrorSeverity.HIGH]: 3,
      [ErrorSeverity.CRITICAL]: 4
    }
    
    return severityLevels[this.metadata.severity] >= severityLevels[severity]
  }
}