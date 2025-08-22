# CRM Sidebar Component

## Overview
A Pipedrive-style vertical navigation sidebar for the CRM dashboard that provides quick access to navigation, tasks, and hot leads. **Updated December 2024** to integrate with the main platform navigation system.

## Component Structure
```
CRMSidebar
├── Navigation Section
│   ├── Dashboard (CRM Overview) → /crm
│   ├── Current Deals (Links) → /links
│   ├── Properties (Portfolio) → /dashboard
│   ├── Contacts → /crm/contacts
│   ├── Activities → /crm/activities
│   └── Reports → /crm/reports
├── Quick Actions
│   ├── Add Deal
│   └── Add Contact
├── Upcoming Tasks
│   └── Task items with due dates
└── Hot Leads
    └── Lead cards with engagement scores
```

## Navigation Integration (Updated)

### Platform Integration
The sidebar now provides seamless navigation between CRM and main platform features:

1. **Current Deals** → Links to `/links` (Links Overview)
   - View all property links as potential deals
   - Each link represents a deal opportunity
   - Maintains context between link sharing and deal management

2. **Properties** → Links to `/dashboard` (Property Portfolio)
   - Direct access to property management
   - Select properties for new deals
   - Manage complete property inventory

This integration eliminates the navigation disconnect between CRM and property management modules.

## Props Interface
```typescript
interface CRMSidebarProps {
  currentPath: string
  upcomingTasks?: Task[]
  hotLeads?: Deal[]
  onNavigate?: (path: string) => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}
```

## Features
1. **Fixed Position**: Sidebar remains fixed on left side during scroll
2. **Collapsible**: Can be collapsed to icon-only view
3. **Active State**: Highlights current page in navigation
4. **Task Integration**: Shows upcoming tasks with due dates
5. **Hot Leads**: Displays high-priority leads with quick actions
6. **Responsive**: Adapts to different screen sizes

## Visual Specifications
- Width: 280px (expanded), 60px (collapsed)
- Background: White with subtle shadow
- Border: 1px right border (#e5e7eb)
- Typography: 14px navigation items, 12px metadata
- Colors: 
  - Active item: Blue background (#eff6ff)
  - Hover: Gray background (#f9fafb)
  - Icons: Gray (#6b7280)

## Behavior Patterns
1. **Navigation**: Clicking items navigates to respective pages
2. **Collapse**: Toggle button collapses to icon view
3. **Task Actions**: Click tasks to view details
4. **Lead Actions**: Quick "Contact" button on hot leads
5. **Scroll**: Content scrolls independently if overflow

## Usage Example
```tsx
<CRMSidebar
  currentPath="/crm"
  upcomingTasks={tasks}
  hotLeads={hotLeads}
  onNavigate={handleNavigation}
  isCollapsed={isSidebarCollapsed}
  onToggleCollapse={toggleSidebar}
/>
```

## Accessibility
- ARIA labels for navigation items
- Keyboard navigation support
- Focus indicators
- Screen reader announcements for state changes

## Testing Requirements
- Navigation item rendering
- Active state highlighting
- Collapse/expand functionality
- Task and lead data display
- Click handlers
- Responsive behavior
- Accessibility features