'use client'

import React from 'react'
import { motion } from 'framer-motion'
import type { BucketCounts } from '../types'

interface SwipeCompletedProps {
  bucketCounts: BucketCounts
  onStartOver: () => void
}

export default function SwipeCompleted({ bucketCounts, onStartOver }: SwipeCompletedProps) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center max-w-md mx-auto"
      >
        <div className="text-6xl mb-6">🎉</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          You've viewed all properties!
        </h2>
        <p className="text-gray-600 mb-6">
          Great job exploring the listings. Here's what you decided:
        </p>
        
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl mb-1">❤️</div>
            <div className="font-semibold">{bucketCounts.liked}</div>
            <div className="text-sm text-gray-600">Liked</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl mb-1">🤔</div>
            <div className="font-semibold">{bucketCounts.considering}</div>
            <div className="text-sm text-gray-600">Considering</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl mb-1">❌</div>
            <div className="font-semibold">{bucketCounts.disliked}</div>
            <div className="text-sm text-gray-600">Passed</div>
          </div>
        </div>

        <button
          onClick={onStartOver}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Start Over
        </button>
      </motion.div>
    </div>
  )
}