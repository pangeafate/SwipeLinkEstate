/**
 * CRM Module Type Definitions - Main Export
 * 
 * Provides a unified interface for all CRM types following the
 * SwipeLink Estate CRM Master Specification and Phase 1 Implementation workplan.
 * 
 * Types are organized into logical modules following the single responsibility
 * principle with comprehensive type coverage for the entire CRM system.
 * 
 * @version 1.0.0
 * @author SwipeLink Estate CRM Team
 * @see /DevelopmentGuidelines/CRM-MASTER-SPECIFICATION.md
 */

// Deal lifecycle and management types
export * from './deal.types'

// Client profiling and behavioral intelligence types  
export * from './client.types'

// Task automation and management types
export * from './task.types'

// Dashboard widgets and analytics types
export * from './dashboard.types'

// API responses and service I/O types
export * from './api.types'

// Engagement scoring and behavioral analysis types
// Note: These are in services/ directory as they're service-specific
export * from '../services/scoring.types'
export * from '../services/deal.types'