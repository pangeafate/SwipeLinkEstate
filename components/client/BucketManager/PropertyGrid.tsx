/**
 * PropertyGrid Component
 * Displays grid of properties with drag and drop support
 */

import React, { useMemo } from 'react'
import { PropertyGridProps } from './types'
import { Property } from '../types'

export const PropertyGrid: React.FC<PropertyGridProps> = ({
  properties,
  buckets,
  bookedVisits,
  activeBucket,
  sortBy,
  sortOrder,
  dragging,
  onPropertyClick,
  onBookVisit,
  onDragStart,
  onDragEnd
}) => {
  // Sort properties
  const sortedProperties = useMemo(() => {
    const sorted = [...properties].sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return sortOrder === 'desc' ? b.price - a.price : a.price - b.price
        case 'location':
          return sortOrder === 'desc' 
            ? b.address.localeCompare(a.address)
            : a.address.localeCompare(b.address)
        case 'date':
        default:
          return sortOrder === 'desc' 
            ? b.id.localeCompare(a.id)
            : a.id.localeCompare(b.id)
      }
    })
    return sorted
  }, [properties, sortBy, sortOrder])

  const hasBookedVisit = (propertyId: string) => {
    return bookedVisits.some(visit => visit.propertyId === propertyId)
  }

  const getBucketForProperty = (propertyId: string): string => {
    const entry = Object.entries(buckets).find(([, ids]) => ids.includes(propertyId))
    return entry ? entry[0] : 'none'
  }

  if (sortedProperties.length === 0) {
    return (
      <div data-testid="bucket-empty-state" className="empty-state">
        <div className="empty-state-icon">
          {activeBucket === 'all' && properties.length === 0 
            ? '🏠' 
            : activeBucket === 'love' ? '❤️' 
            : activeBucket === 'maybe' ? '🔖' 
            : activeBucket === 'pass' ? '❌'
            : '📋'
          }
        </div>
        <h3>
          {activeBucket === 'all' && properties.length === 0
            ? 'No properties available'
            : 'No properties in this bucket'
          }
        </h3>
        <p>
          {activeBucket === 'all' && properties.length === 0
            ? 'Properties will appear here when they are added to the collection.'
            : 'Browse properties to add them to this bucket.'
          }
        </p>
      </div>
    )
  }

  const isVirtualized = sortedProperties.length > 50
  const displayProperties = isVirtualized 
    ? sortedProperties.slice(0, 15)
    : sortedProperties

  return (
    <div 
      data-testid="bucket-property-grid" 
      className={`property-grid ${isVirtualized ? 'virtualized' : ''}`}
    >
      {isVirtualized && (
        <div data-testid="bucket-virtual-list" className="virtual-list-indicator">
          Showing 15 of {sortedProperties.length} properties
        </div>
      )}
      
      {displayProperties.map((property) => (
        <div
          key={property.id}
          data-testid={`bucket-property-card-${property.id}`}
          data-property-id={property.id}
          className={`property-card bucket-assigned-${getBucketForProperty(property.id)} ${
            hasBookedVisit(property.id) ? 'visit-booked' : ''
          } ${dragging === property.id ? 'dragging' : ''}`}
          onClick={() => onPropertyClick(property)}
          draggable
          onDragStart={() => onDragStart(property.id)}
          onDragEnd={onDragEnd}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              onPropertyClick(property)
            }
          }}
        >
          <img 
            src={property.images[0]} 
            alt={property.address}
            loading="lazy"
            className="property-image"
          />
          
          <div className="property-info">
            <h3 className="property-address">{property.address}</h3>
            <p className="property-price">${property.price.toLocaleString()}</p>
            <p className="property-details">
              {property.bedrooms} bed • {property.bathrooms} bath • {property.area_sqft.toLocaleString()} sqft
            </p>
          </div>

          {/* Visit Booking Button for Liked Properties */}
          {buckets.love?.includes(property.id) && (
            <button
              data-testid={`book-visit-${property.id}`}
              className="book-visit-btn"
              onClick={(e) => {
                e.stopPropagation()
                onBookVisit(property)
              }}
              aria-label={`Book visit for ${property.address}`}
            >
              {hasBookedVisit(property.id) ? '✅ Visit Booked' : '📅 Book Visit'}
            </button>
          )}

          {hasBookedVisit(property.id) && (
            <div className="visit-status">
              Visit Booked
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default PropertyGrid