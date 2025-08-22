/**
 * Deal Card Components - Main Export
 * 
 * Provides access to all deal card components in the modular system.
 * Maintains backward compatibility with the original single-file structure.
 */

export { DealCard } from './DealCard'
export { ActionButton } from './ActionButton'
export { DealCardList } from './DealCardList'
export { DealCardGrid } from './DealCardGrid'

// Re-export utility functions
export {
  getTemperatureColor,
  getStatusColor,
  getEngagementColor,
  formatTimeAgo,
  getStageProgress,
  getGridCols
} from './deal-card.utils'

// Re-export types
export type { DealCardProps } from './DealCard'
export type { ActionButtonProps } from './ActionButton'
export type { DealCardListProps } from './DealCardList'
export type { DealCardGridProps } from './DealCardGrid'

// Default export maintains backward compatibility
export { DealCard as default } from './DealCard'