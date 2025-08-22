'use client'

import React from 'react'
import { BucketType, BucketData } from './types'

interface BucketNavigationProps {
  buckets: Record<BucketType, BucketData>
  activeBucket: BucketType
  onBucketChange: (bucket: BucketType) => void
}

export default function BucketNavigation({
  buckets,
  activeBucket,
  onBucketChange
}: BucketNavigationProps) {
  const bucketOrder: BucketType[] = ['new', 'liked', 'disliked', 'scheduled']

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40" data-testid="bucket-navigation">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-around py-2">
          {bucketOrder.map((bucketType) => {
            const bucket = buckets[bucketType]
            const isActive = activeBucket === bucketType
            
            return (
              <button
                key={bucketType}
                onClick={() => onBucketChange(bucketType)}
                className={`flex flex-col items-center justify-center py-2 px-4 rounded-lg transition-all ${
                  isActive 
                    ? 'bg-[#FF385C] text-white' 
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
                aria-label={`${bucket.label} bucket with ${bucket.count} properties`}
                data-testid={`bucket-${bucketType}`}
              >
                <div className="relative">
                  <span className="text-2xl">{bucket.icon}</span>
                  {bucket.count > 0 && (
                    <span className={`absolute -top-2 -right-2 min-w-[20px] h-5 flex items-center justify-center rounded-full text-xs font-semibold px-1 ${
                      isActive 
                        ? 'bg-white text-[#FF385C]' 
                        : 'bg-[#FF385C] text-white'
                    }`}>
                      {bucket.count}
                    </span>
                  )}
                </div>
                <span className="text-xs mt-1 font-medium">{bucket.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}