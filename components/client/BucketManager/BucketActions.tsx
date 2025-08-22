/**
 * BucketActions Component
 * Action buttons for bucket management (download, share, clear)
 */

import React from 'react'
import { BucketActionsProps } from './types'

export const BucketActions: React.FC<BucketActionsProps> = ({
  hasProperties,
  activeBucket,
  onDownload,
  onShare,
  onClear
}) => {
  if (!hasProperties || activeBucket === 'all') {
    return null
  }

  return (
    <div data-testid="bucket-actions" className="bucket-actions">
      <button
        data-testid="bucket-action-download"
        className="action-btn secondary"
        onClick={onDownload}
        aria-label="Download bucket summary"
      >
        📄 Download Summary
      </button>
      
      <button
        data-testid="bucket-action-share"
        className="action-btn secondary"
        onClick={onShare}
        aria-label="Share bucket with agent"
      >
        📤 Share with Agent
      </button>
      
      <button
        data-testid="bucket-action-clear"
        className="action-btn danger"
        onClick={onClear}
        aria-label={`Clear ${activeBucket} bucket`}
      >
        🗑️ Clear Bucket
      </button>
    </div>
  )
}

export default BucketActions