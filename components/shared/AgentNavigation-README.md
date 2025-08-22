# Agent Navigation Component

## Purpose
Provides consistent top-level navigation across all agent-facing pages in the SwipeLink Estate platform, including seamless integration with the CRM module.

## Architecture Overview

```
Agent Navigation Bar
┌─────────────────────────────────────────────────┐
│  Dashboard  |  Links  |  CRM  |  Analytics      │
└─────────────────────────────────────────────────┘
     ↓            ↓         ↓          ↓
/dashboard    /links     /crm    /analytics
```

## Component Structure

### Navigation Items
```typescript
const navigationItems = [
  { name: 'Dashboard', href: '/dashboard' },  // Property management
  { name: 'Links', href: '/links' },          // Link/Deal management
  { name: 'CRM', href: '/crm' },              // CRM features
  { name: 'Analytics', href: '/analytics' }   // Performance metrics
]
```

## Features

### 1. Active State Detection
- Automatically highlights current page
- Supports sub-route detection (e.g., `/crm/contacts` activates CRM)
- Visual indicator with border and text color

### 2. Platform Integration
- **Dashboard**: Access property portfolio and management tools
- **Links**: View and manage property links (deals in CRM context)
- **CRM**: Complete CRM functionality with deal pipeline
- **Analytics**: Performance metrics and insights

### 3. Responsive Design
- Horizontal tab layout on desktop
- Maintains visibility on mobile devices
- Touch-friendly tap targets

## Navigation Flow

```
User Journey:
Dashboard → Select Properties → Links → Create Link → CRM → View as Deal
    ↑                              ↓                     ↓          ↓
    └──────────────────────────────────────────────────────────────┘
                        Seamless bidirectional navigation
```

## Usage

### Basic Implementation
```tsx
import { AgentNavigation } from '@/components/shared/AgentNavigation'

export function Layout({ children }) {
  return (
    <div>
      <AgentNavigation />
      <main>{children}</main>
    </div>
  )
}
```

### With Custom Styling
```tsx
<div className="sticky top-0 z-50 bg-white shadow-sm">
  <AgentNavigation />
</div>
```

## Styling

### CSS Classes
- Active item: `text-gray-900 border-b-2 border-blue-600`
- Inactive item: `text-gray-500`
- Hover state: `hover:text-blue-600`

### Customization
```css
/* Override default styles */
.agent-navigation {
  --nav-height: 48px;
  --nav-item-padding: 1rem;
  --active-color: #2563eb;
  --inactive-color: #6b7280;
}
```

## Active State Logic

The component uses intelligent path matching:
```typescript
const isActive = (href: string) => {
  // Exact match or sub-route match
  return pathname === href || pathname.startsWith(href + '/')
}
```

This ensures:
- `/crm` activates CRM tab
- `/crm/contacts` also activates CRM tab
- `/dashboard` only activates Dashboard tab

## Accessibility

- Semantic `<nav>` element with ARIA label
- Keyboard navigation support (Tab key)
- Focus visible indicators
- High contrast mode support

## Testing

### Unit Tests
```bash
npm test components/shared/__tests__/AgentNavigation.test.tsx
```

### Integration Tests
```bash
npm test __tests__/integration/crm-navigation.test.tsx
```

Test coverage includes:
- Navigation item rendering
- Active state detection
- CRM integration
- Sub-route handling
- Mobile responsiveness

## Integration with CRM

The navigation component works in tandem with the CRM sidebar:

1. **From Main Platform to CRM**: Click "CRM" tab → Navigate to `/crm`
2. **From CRM to Links**: Click "Current Deals" in sidebar → Navigate to `/links`
3. **From CRM to Properties**: Click "Properties" in sidebar → Navigate to `/dashboard`

This creates a unified navigation experience across the platform.

## Performance Considerations

- Uses Next.js Link for prefetching
- Minimal re-renders with pathname hook
- Lightweight component with no external dependencies

## Future Enhancements

- [ ] Notification badges for each section
- [ ] Dropdown menus for sub-navigation
- [ ] User role-based visibility
- [ ] Breadcrumb integration
- [ ] Quick actions menu
- [ ] Search integration

## Dependencies

- `next/link`: Client-side navigation
- `next/navigation`: Pathname detection
- React: Component framework
- Tailwind CSS: Styling

## Related Components

- `CRMSidebar`: CRM-specific navigation
- `UnifiedNavigation`: Future global header
- `BreadcrumbNav`: Contextual navigation (planned)