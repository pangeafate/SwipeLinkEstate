'use client'

import React from 'react'
import type { BucketCounts } from '../types'

interface BucketBarProps {
  bucketCounts: BucketCounts
  currentIndex: number
  totalProperties: number
  onUndo: () => void
  canUndo: boolean
  isProcessing: boolean
}

export default function BucketBar({
  bucketCounts,
  currentIndex,
  totalProperties,
  onUndo,
  canUndo,
  isProcessing
}: BucketBarProps) {
  return (
    <div className="bg-white shadow-sm p-4">
      <div className="max-w-sm mx-auto">
        <div className="flex justify-between items-center mb-2">
          <div className="text-sm text-gray-500">
            {currentIndex + 1} of {totalProperties}
          </div>
          <button
            onClick={onUndo}
            disabled={isProcessing || !canUndo}
            className="text-blue-600 disabled:text-gray-400 text-sm hover:text-blue-800 transition-colors disabled:cursor-not-allowed"
            aria-label="Undo last swipe"
          >
            ↶ Undo
          </button>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentIndex / totalProperties) * 100}%` }}
          />
        </div>

        <div className="flex justify-center space-x-4 text-sm">
          <span className="flex items-center space-x-1">
            <span>❤️</span>
            <span>{bucketCounts.liked}</span>
          </span>
          <span className="flex items-center space-x-1">
            <span>❌</span>
            <span>{bucketCounts.disliked}</span>
          </span>
          <span className="flex items-center space-x-1">
            <span>🤔</span>
            <span>{bucketCounts.considering}</span>
          </span>
        </div>
      </div>
    </div>
  )
}