/**
 * BucketStatsDisplay Component
 * Displays statistics for the active bucket
 */

import React from 'react'
import { BucketStatsDisplayProps } from './types'

export const BucketStatsDisplay: React.FC<BucketStatsDisplayProps> = ({
  bucketStats,
  isVisible
}) => {
  if (!isVisible) return null

  return (
    <div data-testid="bucket-stats" className="bucket-stats">
      <div data-testid="bucket-stats-avg-price" className="stat-item">
        <span className="stat-label">Average Price:</span>
        <span className="stat-value">
          ${Math.round(bucketStats.averagePrice).toLocaleString()}
        </span>
      </div>
      
      <div data-testid="bucket-stats-property-types" className="stat-item">
        <span className="stat-label">Property Types:</span>
        <span className="stat-value">
          {Object.entries(bucketStats.propertyTypes).map(([type, count]) => (
            <span key={type} className="type-tag">
              {type} ({count})
            </span>
          ))}
        </span>
      </div>
      
      <div data-testid="bucket-stats-locations" className="stat-item">
        <span className="stat-label">Locations:</span>
        <span className="stat-value">
          {bucketStats.locations.length > 0 
            ? bucketStats.locations.join(', ')
            : 'No locations'
          }
        </span>
      </div>
      
      <div data-testid="bucket-stats-features" className="stat-item">
        <span className="stat-label">Common Features:</span>
        <span className="stat-value">
          {Object.entries(bucketStats.commonFeatures)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([feature, count]) => (
              <span key={feature} className="feature-tag">
                {feature} ({count})
              </span>
            ))}
        </span>
      </div>
    </div>
  )
}

export default BucketStatsDisplay