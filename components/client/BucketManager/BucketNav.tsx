/**
 * BucketNav Component
 * Navigation tabs for switching between property buckets
 */

import React from 'react'
import { BucketNavProps } from './types'
import { BucketType } from '../types'

export const BucketNav: React.FC<BucketNavProps> = ({
  activeBucket,
  buckets,
  propertyCount,
  loading = false,
  dragging,
  onBucketClick,
  onDropOnBucket
}) => {
  const getBucketCount = (bucket: BucketType | 'all') => {
    if (bucket === 'all') return propertyCount
    return buckets[bucket]?.length || 0
  }

  const handleKeyDown = (e: React.KeyboardEvent, bucket: BucketType | 'all', nextTab: string, prevTab: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onBucketClick(bucket)
    } else if (e.key === 'ArrowRight' && nextTab) {
      e.preventDefault()
      const element = document.querySelector(`[data-testid="${nextTab}"]`) as HTMLElement
      element?.focus()
    } else if (e.key === 'ArrowLeft' && prevTab) {
      e.preventDefault()
      const element = document.querySelector(`[data-testid="${prevTab}"]`) as HTMLElement
      element?.focus()
    }
  }

  const handleDrop = (e: React.DragEvent, bucket: BucketType) => {
    e.preventDefault()
    if (dragging) {
      onDropOnBucket(bucket, dragging)
    }
  }

  return (
    <div 
      data-testid="bucket-nav" 
      className={`bucket-nav ${dragging ? 'drag-active' : ''}`}
      role="tablist"
    >
      <button
        data-testid="bucket-tab-love"
        className={`bucket-tab ${activeBucket === 'love' ? 'bucket-tab-active' : ''} ${getBucketCount('love') > 0 ? 'has-properties' : ''}`}
        onClick={() => onBucketClick('love')}
        onKeyDown={(e) => handleKeyDown(e, 'love', 'bucket-tab-maybe', 'bucket-tab-all')}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDrop(e, 'love')}
        disabled={loading}
        role="tab"
        aria-selected={activeBucket === 'love'}
        data-bucket="love"
      >
        ❤️ Liked ({getBucketCount('love')})
      </button>
      
      <button
        data-testid="bucket-tab-maybe"
        className={`bucket-tab ${activeBucket === 'maybe' ? 'bucket-tab-active' : ''} ${getBucketCount('maybe') > 0 ? 'has-properties' : ''}`}
        onClick={() => onBucketClick('maybe')}
        onKeyDown={(e) => handleKeyDown(e, 'maybe', 'bucket-tab-pass', 'bucket-tab-love')}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDrop(e, 'maybe')}
        disabled={loading}
        role="tab"
        aria-selected={activeBucket === 'maybe'}
        data-bucket="maybe"
      >
        🔖 Considering ({getBucketCount('maybe')})
      </button>
      
      <button
        data-testid="bucket-tab-pass"
        className={`bucket-tab ${activeBucket === 'pass' ? 'bucket-tab-active' : ''} ${getBucketCount('pass') > 0 ? 'has-properties' : ''}`}
        onClick={() => onBucketClick('pass')}
        onKeyDown={(e) => handleKeyDown(e, 'pass', 'bucket-tab-all', 'bucket-tab-maybe')}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDrop(e, 'pass')}
        disabled={loading}
        role="tab"
        aria-selected={activeBucket === 'pass'}
        data-bucket="pass"
      >
        ❌ Disliked ({getBucketCount('pass')})
      </button>
      
      <button
        data-testid="bucket-tab-all"
        className={`bucket-tab ${activeBucket === 'all' ? 'bucket-tab-active' : ''}`}
        onClick={() => onBucketClick('all')}
        onKeyDown={(e) => handleKeyDown(e, 'all', '', 'bucket-tab-pass')}
        disabled={loading}
        role="tab"
        aria-selected={activeBucket === 'all'}
      >
        📋 All Properties ({getBucketCount('all')})
      </button>
    </div>
  )
}

export default BucketNav