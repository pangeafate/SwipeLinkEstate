'use client'

import React from 'react'

export default function SwipeEmptyState() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="text-center">
        <div className="text-6xl mb-4">🏠</div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">
          No properties available
        </h2>
        <p className="text-gray-500">
          Check back later for new listings
        </p>
      </div>
    </div>
  )
}