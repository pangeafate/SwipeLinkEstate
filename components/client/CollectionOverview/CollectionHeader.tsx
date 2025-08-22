/**
 * CollectionHeader Component
 * Displays collection title, agent branding, and progress information
 */

import React from 'react'
import { CollectionHeaderProps } from './types'

export const CollectionHeader: React.FC<CollectionHeaderProps> = ({
  collection,
  agent,
  statistics,
  sessionProgress,
  propertyCount
}) => {
  const progressPercentage = sessionProgress?.totalProperties 
    ? (sessionProgress.propertiesViewed / sessionProgress.totalProperties) * 100
    : 0

  return (
    <header data-testid="collection-header" className="collection-header" role="banner">
      {/* Agent Branding */}
      <div data-testid="agent-branding" className="agent-branding">
        <img 
          src={agent?.avatar || '/api/placeholder/48/48'} 
          alt={agent?.name || 'Agent'}
          className="agent-avatar"
          loading="eager"
        />
        <div className="agent-info">
          <h1>{agent?.name || 'Agent'}</h1>
          {agent?.company && <p className="company">{agent.company}</p>}
          {agent?.phone && <p className="contact">{agent.phone}</p>}
          {agent?.email && <p className="email">{agent.email}</p>}
          {agent?.license && <p className="license">License: {agent.license}</p>}
        </div>
      </div>

      {/* Collection Title & Description */}
      {collection && (
        <div data-testid="collection-title" className="collection-title">
          <h2>{collection.title}</h2>
          <p className="description">{collection.description}</p>
        </div>
      )}

      {/* Property Count & Value Range Summary */}
      <div className="header-stats">
        <div data-testid="property-count-summary" className="stat">
          <span className="stat-text">{propertyCount} Properties</span>
        </div>
        
        <div data-testid="value-range-summary" className="stat">
          <span className="stat-text">
            ${statistics.priceRange.min.toLocaleString()} - ${statistics.priceRange.max.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Progress Indicator */}
      <div data-testid="progress-indicator" className="progress-section">
        <div className="progress-text">
          {sessionProgress?.propertiesViewed || 0} of {sessionProgress?.totalProperties || propertyCount} viewed
        </div>
        <div 
          className="progress-bar"
          role="progressbar"
          aria-valuenow={sessionProgress?.propertiesViewed || 0}
          aria-valuemin="0"
          aria-valuemax={sessionProgress?.totalProperties || propertyCount}
        >
          <div 
            className="progress-fill"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
    </header>
  )
}

export default CollectionHeader