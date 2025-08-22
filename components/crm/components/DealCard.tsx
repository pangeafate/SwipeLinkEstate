/**
 * DealCard Components - Backward Compatibility Export
 * 
 * This file maintains backward compatibility by re-exporting 
 * all components from the modular deal-card directory structure.
 * 
 * The original monolithic file has been refactored into:
 * - deal-card/DealCard.tsx (main component)
 * - deal-card/ActionButton.tsx 
 * - deal-card/DealCardList.tsx
 * - deal-card/DealCardGrid.tsx
 * - deal-card/deal-card.utils.ts (utility functions)
 */

export { 
  DealCard as default,
  DealCard,
  ActionButton,
  DealCardList, 
  DealCardGrid,
  getTemperatureColor,
  getStatusColor,
  getEngagementColor,
  formatTimeAgo,
  getStageProgress,
  getGridCols
} from './deal-card'

export type { 
  DealCardProps,
  ActionButtonProps,
  DealCardListProps,
  DealCardGridProps 
} from './deal-card'