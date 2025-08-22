'use client'

import React from 'react'
import type { SwipeDirection } from '../types'

interface ActionButtonsProps {
  onAction: (direction: SwipeDirection) => void
  isProcessing: boolean
}

export default function ActionButtons({
  onAction,
  isProcessing
}: ActionButtonsProps) {
  return (
    <div className="bg-white border-t p-4">
      <div className="max-w-sm mx-auto">
        <div className="flex justify-center space-x-6 mb-4">
          <button
            onClick={() => onAction('left')}
            disabled={isProcessing}
            className="bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white rounded-full w-14 h-14 flex items-center justify-center text-2xl transition-colors"
            aria-label="Pass (swipe left)"
            data-testid="swipe-pass-button"
          >
            ❌
          </button>
          
          <button
            onClick={() => onAction('down')}
            disabled={isProcessing}
            className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 text-white rounded-full w-14 h-14 flex items-center justify-center text-2xl transition-colors"
            aria-label="Consider (swipe down)"
          >
            🤔
          </button>
          
          <button
            onClick={() => onAction('right')}
            disabled={isProcessing}
            className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded-full w-14 h-14 flex items-center justify-center text-2xl transition-colors"
            aria-label="Like (swipe right)"
            data-testid="swipe-like-button"
          >
            ❤️
          </button>
        </div>

        {/* Gesture hints */}
        <div className="grid grid-cols-3 gap-4 text-xs text-gray-500 text-center">
          <div>Swipe left to pass</div>
          <div>Swipe down to consider</div>
          <div>Swipe right to like</div>
        </div>
      </div>
    </div>
  )
}