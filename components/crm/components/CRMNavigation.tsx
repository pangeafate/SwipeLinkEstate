'use client'

import React, { useState, useEffect } from 'react'

/**
 * CRMNavigation Component
 * 
 * Pipedrive-inspired sidebar navigation for the CRM interface.
 * Provides hierarchical navigation with collapsible functionality.
 * 
 * Features:
 * - Pipedrive-style design with clean icons and typography
 * - Collapsible sidebar with smooth transitions
 * - Active state management with visual indicators  
 * - Keyboard navigation support
 * - Responsive behavior for mobile devices
 * - Grouped navigation sections (Sales, Activities, etc.)
 * - Accessibility compliant with ARIA attributes
 */

export interface CRMNavigationProps {
  /** Currently active navigation item */
  activeItem?: string
  /** Whether the navigation is collapsed */
  isCollapsed?: boolean
  /** Whether in mobile view */
  isMobile?: boolean
  /** Additional CSS classes */
  className?: string
  /** Callback when navigation item is clicked */
  onNavigate?: (item: string) => void
  /** Callback when navigation is collapsed/expanded */
  onCollapse?: (collapsed: boolean) => void
}

// Navigation structure with icons and groupings
const NAVIGATION_STRUCTURE = {
  sales: {
    title: 'Sales',
    items: [
      { key: 'home', label: 'Home', icon: '🏠' },
      { key: 'deals', label: 'Deals', icon: '💰' },
      { key: 'contacts', label: 'Contacts', icon: '👥' },
      { key: 'leads', label: 'Leads', icon: '🎯' }
    ]
  },
  activities: {
    title: 'Activities', 
    items: [
      { key: 'activities', label: 'Activities', icon: '📋' },
      { key: 'campaigns', label: 'Campaigns', icon: '📢' }
    ]
  },
  insights: {
    title: 'Insights',
    items: [
      { key: 'insights', label: 'Insights', icon: '📊' }
    ]
  },
  tools: {
    title: 'Tools',
    items: [
      { key: 'properties', label: 'Properties', icon: '🏘️' },
      { key: 'link-builder', label: 'Link Builder', icon: '🔗' }
    ]
  }
}

export const CRMNavigation: React.FC<CRMNavigationProps> = ({
  activeItem = '',
  isCollapsed = false,
  isMobile = false,
  className = '',
  onNavigate,
  onCollapse
}) => {
  const [collapsed, setCollapsed] = useState(isCollapsed || isMobile)

  useEffect(() => {
    setCollapsed(isCollapsed || isMobile)
  }, [isCollapsed, isMobile])

  const handleToggle = () => {
    const newCollapsed = !collapsed
    setCollapsed(newCollapsed)
    onCollapse?.(newCollapsed)
  }

  const handleNavigate = (itemKey: string) => {
    onNavigate?.(itemKey)
  }

  const handleKeyDown = (e: React.KeyboardEvent, itemKey: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleNavigate(itemKey)
    }
  }

  const handleArrowNavigation = (e: React.KeyboardEvent, currentIndex: number, totalItems: number) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      const nextIndex = (currentIndex + 1) % totalItems
      const nextItem = document.querySelector(`[data-nav-index="${nextIndex}"]`) as HTMLElement
      nextItem?.focus()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const prevIndex = currentIndex === 0 ? totalItems - 1 : currentIndex - 1
      const prevItem = document.querySelector(`[data-nav-index="${prevIndex}"]`) as HTMLElement
      prevItem?.focus()
    }
  }

  // Get all navigation items for keyboard navigation
  const allItems = Object.values(NAVIGATION_STRUCTURE).flatMap(section => section.items)

  return (
    <nav
      data-testid="crm-navigation"
      className={`
        pipedrive-nav bg-white border-r border-gray-200
        ${collapsed ? 'nav--collapsed w-16' : 'w-64'}
        ${isMobile ? 'nav--mobile' : ''}
        transition-all duration-300 ease-in-out
        h-full overflow-y-auto
        ${className}
      `}
      role="navigation"
      aria-label="CRM Navigation"
    >
      {/* Logo/Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div 
          data-testid="navigation-logo"
          className="flex items-center space-x-3"
        >
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            SE
          </div>
          <span className={`font-semibold text-gray-900 ${collapsed ? 'hidden' : 'block'}`}>
            SwipeLink Estate
          </span>
        </div>
        
        <button
          data-testid="nav-toggle"
          onClick={handleToggle}
          className="p-1 rounded hover:bg-gray-100 transition-colors"
          aria-label="Toggle navigation menu"
        >
          <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            {collapsed ? (
              <path d="M9 18l6-6-6-6" />
            ) : (
              <path d="M15 18l-6-6 6-6" />
            )}
          </svg>
        </button>
      </div>

      {/* Navigation Sections */}
      <div className="py-4">
        {Object.entries(NAVIGATION_STRUCTURE).map(([sectionKey, section]) => (
          <div key={sectionKey} data-testid={`nav-section-${sectionKey}`} className="mb-6">
            {/* Section Title */}
            <h3 className={`
              px-4 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider
              ${collapsed ? 'hidden' : 'block'}
            `}>
              {section.title}
            </h3>

            {/* Section Items */}
            <ul className="space-y-1 px-2">
              {section.items.map((item, index) => {
                const globalIndex = allItems.findIndex(globalItem => globalItem.key === item.key)
                const isActive = activeItem === item.key
                
                return (
                  <li key={item.key}>
                    <button
                      data-testid={`nav-item-${item.key}`}
                      data-nav-index={globalIndex}
                      onClick={() => handleNavigate(item.key)}
                      onKeyDown={(e) => {
                        handleKeyDown(e, item.key)
                        handleArrowNavigation(e, globalIndex, allItems.length)
                      }}
                      title={collapsed ? item.label : undefined}
                      className={`
                        nav-item w-full flex items-center px-3 py-2 rounded-lg
                        transition-colors duration-200 text-left
                        ${isActive 
                          ? 'nav-item--active bg-blue-50 text-blue-700 border-l-4 border-blue-600' 
                          : 'text-gray-700 hover:bg-gray-50'
                        }
                        ${collapsed ? 'justify-center' : 'justify-start'}
                      `}
                      aria-current={isActive ? 'page' : undefined}
                      tabIndex={0}
                    >
                      {/* Active indicator */}
                      {isActive && (
                        <div 
                          data-testid="active-indicator"
                          className="absolute left-0 w-1 h-8 bg-blue-600 rounded-r"
                        />
                      )}
                      
                      {/* Icon */}
                      <span 
                        data-testid="nav-icon"
                        className={`text-lg ${collapsed ? '' : 'mr-3'} flex-shrink-0`}
                      >
                        {item.icon}
                      </span>
                      
                      {/* Label */}
                      <span className={`font-medium ${collapsed ? 'hidden' : 'block'}`}>
                        {item.label}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  )
}