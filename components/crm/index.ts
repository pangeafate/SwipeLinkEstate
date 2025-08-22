// CRM Module Public API
// Export only the public interface, keeping internal implementation hidden

// Types
export type {
  Deal,
  DealStatus,
  DealStage,
  ClientProfile,
  ClientTemperature,
  EngagementMetrics,
  SessionData,
  Task,
  TaskPriority,
  TaskStatus,
  TaskAutomationRule,
  PipelineMetrics,
  CRMDashboard,
  DealFilters,
  TaskFilters,
  CRMApiResponse,
  PaginatedResponse
} from './types'

// Services - Core CRM functionality
export { CRMService } from './crm.service'
export { DealService } from './deal.service'
export { ClientService } from './client.service'
export { ScoringService } from './scoring.service'
export { TaskService } from './task.service'

// Components - UI elements
export { default as DealPipeline } from './components/DealPipeline'
export { default as DealCard } from './components/DealCard'
export { default as ClientProfile } from './components/ClientProfile'
export { default as TaskAutomation } from './components/TaskAutomation'
export { default as CRMAnalytics } from './components/CRMAnalytics'

// Hooks - React hooks for CRM functionality
export { useCRMDashboard } from './hooks/useCRMDashboard'
export { useDeals } from './hooks/useDeals'
export { useTasks } from './hooks/useTasks'
export { useClientInsights } from './hooks/useClientInsights'