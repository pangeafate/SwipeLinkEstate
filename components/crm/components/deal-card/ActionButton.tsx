import React from 'react'

/**
 * ActionButton - Reusable action button for deal cards
 * 
 * Provides quick actions like call, email, tasks with:
 * - Icon and label display
 * - Primary/secondary variants
 * - Click event handling with stopPropagation
 */

export interface ActionButtonProps {
  icon: string
  label: string
  onClick: () => void
  variant: 'primary' | 'secondary'
}

export const ActionButton: React.FC<ActionButtonProps> = ({ 
  icon, 
  label, 
  onClick, 
  variant 
}) => (
  <button
    onClick={(e) => {
      e.stopPropagation()
      onClick()
    }}
    className={`
      flex items-center justify-center space-x-1 px-2 py-1.5 rounded text-xs font-medium
      transition-colors duration-200
      ${variant === 'primary' 
        ? 'bg-blue-600 text-white hover:bg-blue-700' 
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }
    `}
  >
    <span>{icon}</span>
    <span>{label}</span>
  </button>
)