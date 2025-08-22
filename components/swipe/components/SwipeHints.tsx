'use client'

import React from 'react'

export default function SwipeHints() {
  return (
    <div className="bg-white border-t p-4">
      <div className="max-w-sm mx-auto">
        <div className="grid grid-cols-3 gap-4 text-xs text-gray-500 text-center">
          <div>
            <div className="text-lg mb-1">👈</div>
            <div>Swipe left to pass</div>
          </div>
          <div>
            <div className="text-lg mb-1">👇</div>
            <div>Swipe down to consider</div>
          </div>
          <div>
            <div className="text-lg mb-1">👉</div>
            <div>Swipe right to like</div>
          </div>
        </div>
      </div>
    </div>
  )
}