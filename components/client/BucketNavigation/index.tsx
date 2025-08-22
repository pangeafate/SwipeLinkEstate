import React, { useEffect, useState } from 'react'
import { BucketType } from '../types'

interface BucketConfig {
  icon: string
  label: string
  shortLabel: string
  color: string
  activeColor: string
}

const bucketConfig: Record<BucketType, BucketConfig> = {
  new_properties: {
    icon: '📦',
    label: 'New Properties',
    shortLabel: 'New',
    color: 'text-gray-600',
    activeColor: 'text-blue-600'
  },
  liked: {
    icon: '❤️',
    label: 'Liked',
    shortLabel: 'Liked',
    color: 'text-gray-600',
    activeColor: 'text-red-500'
  },
  disliked: {
    icon: '👎',
    label: 'Disliked',
    shortLabel: 'Disliked',
    color: 'text-gray-600',
    activeColor: 'text-gray-800'
  },
  considering: {
    icon: '🤔',
    label: 'Considering',
    shortLabel: 'Consider',
    color: 'text-gray-600',
    activeColor: 'text-yellow-600'
  },
  schedule_visit: {
    icon: '📅',
    label: 'Schedule Visit',
    shortLabel: 'Visit',
    color: 'text-gray-600',
    activeColor: 'text-green-600'
  }
}

interface BucketNavigationProps {
  currentBucket: BucketType
  bucketCounts: Record<BucketType, number>
  onBucketChange: (bucket: BucketType) => void
  className?: string
}

export const BucketNavigation: React.FC<BucketNavigationProps> = ({
  currentBucket,
  bucketCounts,
  onBucketChange,
  className = ''
}) => {
  const [isMobile, setIsMobile] = useState(false)
  const [liveRegionText, setLiveRegionText] = useState('')

  // Handle viewport changes for responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Update live region when bucket changes
  useEffect(() => {
    const config = bucketConfig[currentBucket]
    const count = bucketCounts[currentBucket]
    setLiveRegionText(`${config.label} selected, ${count} properties`)
  }, [currentBucket, bucketCounts])

  const handleBucketClick = (bucket: BucketType) => {
    if (bucket !== currentBucket) {
      onBucketChange(bucket)
    }
  }

  const handleKeyDown = (bucket: BucketType, event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleBucketClick(bucket)
    }
  }

  const formatCount = (count: number): string => {
    return count > 99 ? '99+' : count.toString()
  }

  const buckets: BucketType[] = ['new_properties', 'liked', 'disliked', 'considering', 'schedule_visit']

  return (
    <nav
      className={`bucket-navigation ${
        isMobile ? 'fixed bottom-0 left-0 right-0 z-50' : 'relative'
      } bg-white border-t border-gray-200 ${className}`}
      role="navigation"
      aria-label="Property bucket navigation"
    >
      {/* Live region for screen reader announcements */}
      <div
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {liveRegionText}
      </div>

      <div className={`flex ${isMobile ? 'justify-around px-2 py-1' : 'justify-center gap-4 px-4 py-3'}`}>
        {buckets.map((bucket) => {
          const config = bucketConfig[bucket]
          const isActive = bucket === currentBucket
          const count = bucketCounts[bucket]
          const displayLabel = isMobile ? config.shortLabel : config.label

          return (
            <button
              key={bucket}
              data-testid={`bucket-${bucket}`}
              className={`bucket-button relative flex flex-col items-center justify-center min-w-0 ${
                isMobile ? 'flex-1 py-2 px-1' : 'px-4 py-2'
              } rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isActive
                  ? 'active bg-gray-100 shadow-sm'
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => handleBucketClick(bucket)}
              onKeyDown={(e) => handleKeyDown(bucket, e)}
              aria-label={`${config.label} bucket, ${count} properties`}
              aria-current={isActive ? 'true' : 'false'}
            >
              {/* Icon */}
              <div className={`flex items-center justify-center ${isMobile ? 'text-lg' : 'text-xl'} mb-1`}>
                <span
                  className={`${
                    isActive ? config.activeColor : config.color
                  } transition-colors duration-200`}
                >
                  {config.icon}
                </span>
              </div>

              {/* Label */}
              <span
                className={`${
                  isMobile ? 'text-xs' : 'text-sm'
                } font-medium text-center ${
                  isActive ? config.activeColor : config.color
                } transition-colors duration-200`}
              >
                {displayLabel}
              </span>

              {/* Count badge */}
              <div
                data-testid="count-badge"
                className={`absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 flex items-center justify-center text-xs font-semibold text-white bg-red-500 rounded-full transition-opacity duration-200 ${
                  count === 0 ? 'hidden opacity-0' : 'opacity-100'
                }`}
              >
                {formatCount(count)}
              </div>
            </button>
          )
        })}
      </div>

      {/* Safe area padding for mobile devices with notches */}
      {isMobile && (
        <div className="pb-safe-area-inset-bottom bg-white" />
      )}
    </nav>
  )
}

export default BucketNavigation