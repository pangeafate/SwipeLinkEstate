/**
 * BucketControls Component
 * Sort and filter controls for bucket properties
 */

import React from 'react'
import { BucketControlsProps } from './types'

export const BucketControls: React.FC<BucketControlsProps> = ({
  sortBy,
  sortOrder,
  onSortChange
}) => {
  return (
    <div className="bucket-controls">
      <div data-testid="bucket-sort-options" className="sort-options">
        <label htmlFor="bucket-sort-select">Sort by:</label>
        <select
          id="bucket-sort-select"
          data-testid="bucket-sort-select"
          value={`${sortBy}-${sortOrder}`}
          onChange={(e) => onSortChange(e.target.value)}
          aria-label="Sort properties"
        >
          <option value="date-desc">Date Added (Newest)</option>
          <option value="date-asc">Date Added (Oldest)</option>
          <option value="price-desc">Price (High to Low)</option>
          <option value="price-asc">Price (Low to High)</option>
          <option value="location-asc">Location (A-Z)</option>
          <option value="location-desc">Location (Z-A)</option>
        </select>
      </div>

      <div data-testid="bucket-filter-options" className="filter-options">
        <select 
          data-testid="filter-property-type"
          aria-label="Filter by property type"
          defaultValue=""
        >
          <option value="">All Property Types</option>
          <option value="house">House</option>
          <option value="condo">Condo</option>
          <option value="townhouse">Townhouse</option>
        </select>
        
        <select 
          data-testid="filter-price-range"
          aria-label="Filter by price range"
          defaultValue=""
        >
          <option value="">All Price Ranges</option>
          <option value="0-500000">Under $500K</option>
          <option value="500000-1000000">$500K - $1M</option>
          <option value="1000000-">Over $1M</option>
        </select>
      </div>
    </div>
  )
}

export default BucketControls