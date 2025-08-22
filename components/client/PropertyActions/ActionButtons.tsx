'use client'

import React from 'react'
import { ActionType, BucketType } from '../SwipeLinkCarousel/types'

interface ActionButtonsProps {
  onAction: (action: ActionType) => void
  currentBucket: BucketType
}

export default function ActionButtons({ onAction, currentBucket }: ActionButtonsProps) {
  const actions: Array<{
    type: ActionType
    label: string
    icon: string
    color: string
    disabled?: boolean
  }> = [
    {
      type: 'like',
      label: 'Like',
      icon: '❤️',
      color: 'bg-red-500 hover:bg-red-600',
      disabled: currentBucket === 'liked'
    },
    {
      type: 'dislike',
      label: 'Dislike',
      icon: '👎',
      color: 'bg-gray-500 hover:bg-gray-600',
      disabled: currentBucket === 'disliked'
    },
    {
      type: 'consider',
      label: 'Consider',
      icon: '🤔',
      color: 'bg-yellow-500 hover:bg-yellow-600',
      disabled: false
    },
    {
      type: 'schedule',
      label: 'Schedule Visit',
      icon: '📅',
      color: 'bg-blue-500 hover:bg-blue-600',
      disabled: currentBucket === 'scheduled'
    }
  ]

  return (
    <div className="grid grid-cols-2 gap-3" data-testid="property-actions">
      {actions.map((action) => (
        <button
          key={action.type}
          onClick={() => !action.disabled && onAction(action.type)}
          disabled={action.disabled}
          className={`
            flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-white font-medium transition-all
            ${action.disabled 
              ? 'bg-gray-300 cursor-not-allowed opacity-50' 
              : action.color
            }
          `}
          aria-label={action.label}
          data-testid={`action-${action.type}`}
        >
          <span className="text-xl">{action.icon}</span>
          <span>{action.label}</span>
        </button>
      ))}
    </div>
  )
}