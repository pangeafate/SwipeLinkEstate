/**
 * CRM Module Type Definitions - SwipeLink Estate CRM System
 * 
 * Comprehensive TypeScript type definitions for the SwipeLink Estate CRM system
 * following the CRM Master Specification and Phase 1 Implementation workplan.
 * 
 * This file re-exports all types from the modular type system with comprehensive
 * type coverage for Deal management, Client profiling, Task automation, Engagement
 * scoring, and Analytics.
 * 
 * Architecture follows TypeScript best practices:
 * - Strict typing with no 'any' types
 * - Proper generics where appropriate  
 * - Discriminated unions for status/stage types
 * - Comprehensive JSDoc comments
 * - Single responsibility principle (200-line limit per file)
 * 
 * Type Organization:
 * - deal.types.ts: Deal lifecycle, stages, and management types
 * - client.types.ts: Client profiling and engagement types
 * - task.types.ts: Task automation and management types
 * - dashboard.types.ts: Dashboard and analytics types
 * - api.types.ts: API response and service I/O types
 * - scoring.types.ts: Engagement scoring and behavioral types
 * 
 * @version 1.0.0
 * @author SwipeLink Estate CRM Team
 * @see /DevelopmentGuidelines/CRM-MASTER-SPECIFICATION.md
 * @see /DevelopmentGuidelines/WorkPlan/WP-CRM-PHASE1-IMPLEMENTATION-20250121-1430.md
 */

// Re-export all modular types
export * from './types/index'

// Type utilities for strict typing
export type NonNullable<T> = T extends null | undefined ? never : T
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>
export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

/**
 * Utility type for creating strict enums that prevent invalid values
 * @example
 * type DealStageStrict = StrictEnum<typeof DEAL_STAGES>
 */
export type StrictEnum<T extends Record<string, string | number>> = T[keyof T]

/**
 * Utility type for API service responses with proper error handling
 * @template T The expected data type
 */
export type ServiceResponse<T> = {
  success: true
  data: T
  error?: never
} | {
  success: false
  data?: never
  error: string
}

/**
 * Utility type for paginated responses
 * @template T The item type being paginated
 */
export type PaginatedServiceResponse<T> = ServiceResponse<{
  items: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrevious: boolean
  }
}>

/**
 * Database record base type with audit fields
 */
export interface DatabaseRecord {
  readonly id: string
  readonly createdAt: string
  readonly updatedAt: string
}

/**
 * Soft-deletable database record
 */
export interface SoftDeletableRecord extends DatabaseRecord {
  readonly deletedAt: string | null
  readonly isDeleted: boolean
}