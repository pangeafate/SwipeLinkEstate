/**
 * CRM Navigation Sidebar Component
 * Pipedrive-inspired navigation following CRM Master Specification
 * 
 * Features:
 * - 240px fixed width (desktop), collapsible to 60px
 * - Hierarchical menu following sales funnel flow
 * - Active/inactive states with visual indicators
 * - Responsive behavior (hidden on mobile, collapsible on tablet)
 * - Accessibility compliant with keyboard navigation
 * - Proper ARIA labels and screen reader support
 */

'use client'

import React, { useState } from 'react'
import { 
  BarChart3,
  Target, 
  Briefcase,
  Users,
  CheckSquare,
  Mail,
  Calendar,
  TrendingUp,
  Building,
  MoreHorizontal,
  Link,
  Settings,
  FileText,
  HelpCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

interface CRMNavigationSidebarProps {
  activeItem?: string
  isCollapsed?: boolean
  isMobile?: boolean
  isTablet?: boolean
  onItemClick?: (itemId: string) => void
  onToggle?: () => void
}

interface MenuItem {
  id: string
  label: string
  icon: React.ComponentType<any>
  priority: number
  href?: string
  submenu?: MenuItem[]
}

interface SubMenuItem {
  id: string
  label: string
  icon: React.ComponentType<any>
}

const MENU_ITEMS: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3, priority: 1 },
  { id: 'leads', label: 'Leads', icon: Target, priority: 2 },
  { id: 'deals', label: 'Deals', icon: Briefcase, priority: 3 },
  { id: 'contacts', label: 'Contacts', icon: Users, priority: 4 },
  { id: 'activities', label: 'Activities', icon: CheckSquare, priority: 5 },
  { id: 'email', label: 'Email', icon: Mail, priority: 6 },
  { id: 'calendar', label: 'Calendar', icon: Calendar, priority: 7 },
  { id: 'insights', label: 'Insights', icon: TrendingUp, priority: 8 },
  { id: 'properties', label: 'Properties', icon: Building, priority: 9 },
  { 
    id: 'more', 
    label: 'More', 
    icon: MoreHorizontal, 
    priority: 10,
    submenu: [
      { id: 'link-builder', label: 'Link Builder', icon: Link },
      { id: 'settings', label: 'Settings', icon: Settings },
      { id: 'reports', label: 'Reports', icon: FileText },
      { id: 'help', label: 'Help & Training', icon: HelpCircle }
    ]
  }
]

export default function CRMNavigationSidebar({
  activeItem,
  isCollapsed = false,
  isMobile = false,
  isTablet = false,
  onItemClick,
  onToggle
}: CRMNavigationSidebarProps) {
  const [moreExpanded, setMoreExpanded] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  // Hide on mobile - replaced by bottom navigation
  if (isMobile) {
    return (
      <div 
        data-testid="crm-navigation-sidebar" 
        className="hidden"
        aria-hidden="true"
      />
    )
  }

  const handleItemClick = (itemId: string) => {
    if (itemId === 'more') {
      setMoreExpanded(!moreExpanded)
    } else {
      onItemClick?.(itemId)
      // Collapse More menu when other items are clicked
      setMoreExpanded(false)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent, itemId: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleItemClick(itemId)
    }
  }

  const renderMenuItem = (item: MenuItem, isSubmenu = false) => {
    const isActive = activeItem === item.id
    const isHovered = hoveredItem === item.id
    const Icon = item.icon
    const hasSubmenu = item.submenu && item.submenu.length > 0
    
    return (
      <div key={item.id}>
        <button
          data-testid={`nav-${item.id}`}
          data-active-item={isActive ? item.id : undefined}
          className={`
            nav-item w-full flex items-center transition-all duration-200 ease-in-out
            ${isCollapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3'}
            ${isSubmenu ? 'ml-8 text-sm' : ''}
            ${isActive 
              ? 'nav-item--active bg-blue-50 text-blue-600 border-l-3 border-blue-600 font-medium' 
              : isHovered 
                ? 'bg-blue-25 text-blue-600'
                : 'text-gray-600 hover:bg-blue-25 hover:text-blue-600'
            }
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset
          `}
          onClick={() => handleItemClick(item.id)}
          onKeyDown={(e) => handleKeyDown(e, item.id)}
          onMouseEnter={() => setHoveredItem(item.id)}
          onMouseLeave={() => setHoveredItem(null)}
          tabIndex={0}
          aria-label={`Navigate to ${item.label}`}
          aria-current={isActive ? 'page' : undefined}
          aria-expanded={hasSubmenu ? moreExpanded : undefined}
          role="button"
        >
          <Icon 
            className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'}`}
            aria-hidden="true"
          />
          {!isCollapsed && (
            <>
              <span className="flex-1 text-left">{item.label}</span>
              {hasSubmenu && (
                <ChevronRight 
                  className={`w-4 h-4 transition-transform ${moreExpanded ? 'rotate-90' : ''}`}
                  aria-hidden="true"
                />
              )}
            </>
          )}
        </button>
        
        {/* Tooltip for collapsed state - hidden from screen readers during tests */}
        {isCollapsed && !isSubmenu && (
          <div 
            role="tooltip" 
            className="absolute opacity-0 pointer-events-none"
            data-tooltip={item.label}
          >
            {item.label}
          </div>
        )}

        {/* Submenu items */}
        {hasSubmenu && moreExpanded && !isCollapsed && (
          <div className="py-1">
            {item.submenu!.map((subItem) => (
              <button
                key={subItem.id}
                data-testid={`nav-${subItem.id}`}
                className={`
                  w-full flex items-center px-12 py-2 text-sm transition-all duration-200
                  ${activeItem === subItem.id 
                    ? 'bg-blue-50 text-blue-600 font-medium' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset
                `}
                onClick={() => handleItemClick(subItem.id)}
                onKeyDown={(e) => handleKeyDown(e, subItem.id)}
                tabIndex={0}
                aria-label={`Navigate to ${subItem.label}`}
                aria-current={activeItem === subItem.id ? 'page' : undefined}
              >
                <subItem.icon 
                  className="w-4 h-4 mr-3"
                  aria-hidden="true"
                />
                {subItem.label}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <nav
      data-testid="crm-navigation-sidebar"
      className={`
        nav-menu bg-white border-r border-gray-200 h-screen overflow-y-auto transition-all duration-300
        ${isCollapsed ? 'w-15' : 'w-60'}
        flex flex-col
      `}
      role="navigation"
      aria-label="CRM Navigation"
    >
      {/* Toggle button for tablet/desktop */}
      {(isTablet || onToggle) && (
        <div className="flex justify-end p-2 border-b border-gray-100">
          <button
            data-testid="sidebar-toggle-button"
            onClick={onToggle}
            className="p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={`Toggle sidebar ${isCollapsed ? '(collapsed)' : ''}`}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>
      )}

      {/* Menu Items */}
      <div className="flex-1 py-4">
        {MENU_ITEMS.map((item) => renderMenuItem(item))}
      </div>

      {/* Collapsed state tooltips */}
      {isCollapsed && (
        <style jsx>{`
          .nav-item:hover [data-tooltip] {
            position: fixed;
            left: 60px;
            background: #374151;
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 14px;
            z-index: 1000;
            white-space: nowrap;
            opacity: 1;
            visibility: visible;
          }
          [data-tooltip] {
            opacity: 0;
            visibility: hidden;
            transition: all 200ms;
          }
        `}</style>
      )}
    </nav>
  )
}