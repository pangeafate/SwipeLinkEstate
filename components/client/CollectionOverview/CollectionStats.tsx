/**
 * CollectionStats Component
 * Displays collection statistics including price, area, and property type distribution
 */

import React from 'react'
import { CollectionStatsProps } from './types'

export const CollectionStats: React.FC<CollectionStatsProps> = ({
  statistics,
  isMobile,
  expandedSummary,
  onToggleExpanded
}) => {
  return (
    <section 
      data-testid="collection-summary-card" 
      className={`summary-card ${isMobile && !expandedSummary ? 'collapsed' : ''}`}
    >
      {isMobile && (
        <div data-testid="collapsible-summary" className="collapsible-header">
          <button
            data-testid="expand-summary-btn"
            onClick={() => onToggleExpanded(!expandedSummary)}
            className="expand-btn"
            aria-expanded={expandedSummary}
            aria-controls="summary-content"
          >
            {expandedSummary ? '▼' : '▶'} Collection Summary
          </button>
        </div>
      )}

      <div 
        id="summary-content"
        className={`summary-content ${isMobile && !expandedSummary ? 'hidden' : ''}`}
      >
        {/* Key Statistics */}
        <div data-testid="key-statistics" className="statistics-grid">
          <div className="stat-item">
            <span className="stat-label">Average Price</span>
            <span className="stat-value">
              ${Math.round(statistics.averagePrice).toLocaleString()}
            </span>
          </div>
          
          <div data-testid="area-stats" className="stat-item">
            <span className="stat-label">Average Area</span>
            <span className="stat-value">
              {Math.round(statistics.averageArea).toLocaleString()} sq ft avg
            </span>
          </div>
          
          <div data-testid="bedrooms-distribution" className="stat-item">
            <span className="stat-label">Bedrooms</span>
            <span className="stat-value">
              {statistics.bedroomRange.min === statistics.bedroomRange.max 
                ? `${statistics.bedroomRange.min}` 
                : `${statistics.bedroomRange.min}-${statistics.bedroomRange.max}`} bedrooms
            </span>
          </div>
          
          <div className="stat-item">
            <span className="stat-label">Bathrooms</span>
            <span className="stat-value">
              {statistics.bathroomRange.min === statistics.bathroomRange.max 
                ? `${statistics.bathroomRange.min}` 
                : `${statistics.bathroomRange.min}-${statistics.bathroomRange.max}`} bathrooms
            </span>
          </div>
        </div>

        {/* Visual Property Type Distribution */}
        <div data-testid="property-type-distribution" className="property-types">
          <h4>Property Types</h4>
          <div className="type-tags">
            {Object.entries(statistics.propertyTypes).map(([type, count]) => (
              <span key={type} className="type-tag">
                {type} ({count})
              </span>
            ))}
          </div>
        </div>

        {/* Price Range Visualization */}
        <div data-testid="price-range-visualization" className="price-visualization">
          <h4>Price Distribution</h4>
          <div data-testid="price-range-chart" className="price-chart">
            <div className="chart-bar">
              <div className="price-segment" style={{ width: '100%' }}>
                ${statistics.priceRange.min.toLocaleString()} - 
                ${statistics.priceRange.max.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Location Map Overview */}
        <div data-testid="location-map-overview" className="location-overview">
          <h4>Locations Overview</h4>
          <div className="location-summary">
            <p>Properties located across prime Miami Beach areas</p>
            <div className="map-placeholder">
              📍 Interactive map coming soon
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CollectionStats