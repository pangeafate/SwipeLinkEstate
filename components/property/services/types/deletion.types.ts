// deletion.types.ts - Type definitions for property deletion functionality

export interface DeletionImpact {
  propertyId: string
  linkedCollections: number
  activeLinks: string[]
  totalActivities: number
  requiresSoftDelete: boolean
  safeForHardDelete: boolean
  estimatedDataLoss: string[]
  canUndo: boolean
  undoTimeLimit: number // minutes
  integrityWarnings: string[]
}

export interface DeleteOptions {
  forceDelete?: boolean
  createUndoSnapshot?: boolean
  reason?: string
  cascadeLinks?: boolean
  agentId?: string
  requireConfirmation?: boolean
}

export interface DeletionResult {
  success: boolean
  type: 'hard_delete' | 'soft_delete'
  propertyId: string
  canUndo: boolean
  undoSnapshotId?: string
  cascadeResults: CascadeResults
  archivedActivities?: number
  warnings?: string[]
}

export interface CascadeResults {
  success: boolean
  partialSuccess?: boolean
  linksUpdated: number
  propertiesRemoved: number
  activitiesArchived: number
  metricsUpdated: boolean
  integrityMaintained: boolean
  failures?: string[]
}

export interface UndoSnapshot {
  id: string
  propertyId: string
  propertyData: any // Property object
  relatedData: {
    links: any[]
    activities: any[]
    metrics: any[]
  }
  createdAt: Date
  expiresAt: Date
  agentId?: string
  reason?: string
}

export interface UndoResult {
  success: boolean
  restoredProperty: any
  restoredRelatedData: {
    links: number
    activities: number
    metrics: number
  }
  warnings?: string[]
}

export interface AuditLogEntry {
  id: string
  propertyId: string
  action: 'delete' | 'undo' | 'cascade'
  agentId: string
  reason?: string
  impact: DeletionImpact
  result: DeletionResult | UndoResult
  timestamp: Date
  ipAddress?: string
  userAgent?: string
}

export interface PropertyDeletionError extends Error {
  code: 'PROPERTY_NOT_FOUND' | 'UNAUTHORIZED' | 'HAS_ACTIVE_LINKS' | 'DELETION_IN_PROGRESS' | 'DATABASE_ERROR'
  propertyId: string
  details?: any
}

// Validation and safety types
export interface SafetyCheck {
  propertyId: string
  checkType: 'ownership' | 'active_links' | 'concurrent_deletion' | 'confirmation'
  passed: boolean
  reason?: string
  suggestedAction?: string
}

export interface DeletionValidation {
  propertyId: string
  isValid: boolean
  safetyChecks: SafetyCheck[]
  requiredConfirmations: string[]
  blockers: string[]
}

// Background processing types
export interface DeletionJob {
  id: string
  propertyId: string
  type: 'cascade' | 'cleanup' | 'archive'
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  createdAt: Date
  startedAt?: Date
  completedAt?: Date
  error?: string
  result?: any
}