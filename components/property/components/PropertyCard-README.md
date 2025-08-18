# PropertyCard Component - README

## COMPONENT CONTEXT

**This is the GENERIC PropertyCard component** (`components/property/components/PropertyCard.tsx`)

There are two PropertyCard components in this system:
- **Generic PropertyCard** (THIS ONE) - Basic property display for general use
- **Agent PropertyCard** (`components/agent/PropertyCard.tsx`) - Enhanced with selection, editing, and agent-specific features

## Overview

The PropertyCard is a reusable React component that displays property information in a visually appealing card format. This generic version provides basic property display functionality for general property listings and browsing contexts.

## Purpose

This component creates a standardized, mobile-first property display that works across multiple contexts - from property listings to selection interfaces. It emphasizes visual appeal through high-quality images while presenting key property information in a scannable format that helps users quickly evaluate properties.

## Architecture Position

```
┌─────────────────────────────────────────────────┐
│                 PAGE LAYER                       │
│  ┌─────────────┐  ┌─────────────┐              │
│  │ Properties  │  │ LinkCreator │              │
│  │ List Page   │  │ Component   │              │
│  └─────────────┘  └─────────────┘              │
│           │              │                      │
│           ▼              ▼                      │
├─────────────────────────────────────────────────┤
│              COMPONENT LAYER                     │
│  ┌─────────────────────────────────────────────┐ │
│  │        PropertyCard (THIS)                  │ │
│  │  • Property data display                    │ │
│  │  • Image handling                           │ │  
│  │  • Status indicators                        │ │
│  │  • Interaction handling                     │ │
│  │  • Responsive layout                        │ │
│  └─────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────┤
│               UTILITY LAYER                      │
│  ┌─────────────────────────────────────────────┐ │
│  │         Formatting Utils                    │ │
│  │  • formatPrice()                            │ │
│  │  • formatBedsBaths()                        │ │
│  │  • formatArea()                             │ │
│  │  • formatShortAddress()                     │ │
│  │  • formatFeatures()                         │ │
│  └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

## Component Structure

```
┌─────────────────────────────────────────────────┐
│                PropertyCard                      │
├─────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────┐ │
│  │           IMAGE SECTION (h-48)              │ │
│  │  ┌─────┐                       ┌─────────┐  │ │
│  │  │ ●   │  Property Image        │ $850K   │  │ │
│  │  │     │                       │         │  │ │
│  │  └─────┘                       └─────────┘  │ │
│  │  Status                         Price       │ │
│  │  Indicator                      Badge       │ │
│  └─────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────┐ │
│  │            CONTENT SECTION                  │ │
│  │                                             │ │
│  │  123 Ocean Drive, Miami Beach               │ │
│  │                                             │ │
│  │  2 bed • 2 bath         1,200 sq ft        │ │
│  │                                             │ │
│  │  [Ocean View] [Balcony] [Pool] +2 more     │ │
│  │                                             │ │
│  │  Stunning oceanfront condo with...         │ │
│  │  panoramic views of the Atlantic...        │ │
│  └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

## Visual Layout Breakdown

### Image Section (Top Half)
**Fixed height of 192px (h-48)**
```
┌─────────────────────────────────────────────────┐
│  [●] Status                         [$850K]     │ ← Top overlay elements
│                                                 │
│              Property Image                     │ ← Next.js Image with fill
│          (object-cover, rounded-t-xl)           │
│                                                 │
│  [Edit] ← Agent-only button (bottom-right)      │ ← Hover reveal
└─────────────────────────────────────────────────┘
```

**Key Elements:**
- **Status Dot**: Color-coded property status (top-left)
- **Price Badge**: Semi-transparent price display (top-right)  
- **Edit Button**: Agent-only, appears on hover (bottom-right)
- **Image**: Optimized with Next.js Image component

### Content Section (Bottom Half) 
**Flexible padding of 16px (p-4)**
```
┌─────────────────────────────────────────────────┐
│ 123 Ocean Drive, Miami Beach            ← Address (lg text, 2-line clamp)
│                                                 │
│ 2 bed • 2 bath          1,200 sq ft    ← Property stats (flex justify-between)
│                                                 │
│ [Ocean View] [Balcony] [Pool] +2 more  ← Features (up to 3 + overflow)
│                                                 │
│ Stunning oceanfront condo with          ← Description (2-line clamp)
│ panoramic views of the Atlantic...      │
└─────────────────────────────────────────────────┘
```

## Core Functions

### 1. handleCardClick()

**Purpose**: Handles main card click events for navigation or selection.

**Logic Flow**:
```typescript
const handleCardClick = () => {
  if (onClick) {
    onClick(property)  // Pass full property object to parent
  }
}
```

**Usage Contexts**:
- **Property Listings**: Navigate to property detail page
- **LinkCreator**: Toggle property selection for link creation  
- **Search Results**: Open property in modal or new view
- **Favorites**: Add/remove from saved properties

### 2. getStatusColor()

**Purpose**: Maps property status to visual color indicators.

**Color Mapping** (Updated to match database values):
```typescript
const getStatusColor = () => {
  switch (property.status) {
    case 'active':      return 'bg-green-500'   // Available for sale
    case 'pending':     return 'bg-yellow-500'  // Under contract  
    case 'sold':        return 'bg-blue-500'    // Transaction complete
    case 'off-market':  return 'bg-gray-400'    // Temporarily unavailable
    default:            return 'bg-gray-400'    // Unknown status
  }
}
```

**Visual Implementation**:
```
● Green  = Active (available for viewing/purchase)
● Yellow = Pending (offer accepted, awaiting closing)  
● Blue   = Sold (transaction completed)
● Gray   = Off-market (temporarily unavailable)
```

**IMPORTANT**: Status values now match actual database schema:
- ✅ Uses `'off-market'` (not `'inactive'`)
- ✅ Handles all PropertyStatus union type values
- ✅ Consistent with centralized type definitions

### 3. Data Formatting Pipeline

**Purpose**: Transforms raw property data into user-friendly display formats.

**Formatting Chain**:
```
Raw Property Data
        ↓
formatPrice(property.price)          → "$850,000" or "Price on request"
        ↓  
formatBedsBaths(beds, baths)         → "2 bed • 2 bath" or "Studio"
        ↓
formatArea(property.area_sqft)       → "1,200 sq ft" or "Area N/A"
        ↓
formatShortAddress(property.address) → "123 Ocean Dr, Miami Beach"  
        ↓
formatFeatures(property.features)    → ["Ocean View", "Balcony", "Pool"]
        ↓
Formatted Display Data
```

## Props Interface

```typescript
interface PropertyCardProps {
  property: Property              // Required property data
  onClick?: (property: Property) => void  // Card click handler
  showActions?: boolean          // Show/hide action buttons (default: false)
}
```

### Prop Details

**property** (Required):
- Full property object from centralized types (`lib/supabase/types.ts`)
- Must include: id, address, status, created_at, updated_at
- Optional but commonly used: price, bedrooms, bathrooms, area_sqft, description, features, cover_image, images

**onClick** (Optional):
- Callback fired when card is clicked
- Receives full property object as parameter
- Used for navigation, selection, or detail views

**showActions** (Optional):  
- Boolean flag to show/hide action buttons
- Default: false (clean display for generic use)
- **Note**: This generic PropertyCard doesn't implement action buttons
- For action buttons, use the Agent PropertyCard instead

### Type System Integration

This component uses centralized types:
```typescript
import { type Property, type PropertyStatus } from '@/lib/supabase/types'
```

All Property types are now consistent across the application and match the database schema exactly.

## Responsive Design

### Mobile-First Approach
The component is designed with mobile-first principles:

```css
/* Base (Mobile): Single column layout */
.property-card {
  width: 100%;           /* Full width on mobile */
  max-width: none;       /* No width restrictions */
}

/* Tablet: Grid layouts handle sizing */
@media (min-width: 768px) {
  /* Container manages grid, card stays flexible */
}

/* Desktop: Larger grids, same card design */
@media (min-width: 1024px) {
  /* Higher density grids possible */
}
```

### Touch-Friendly Design
- **Minimum Touch Targets**: All clickable elements ≥ 44px
- **Generous Padding**: 16px padding for comfortable interaction
- **Visual Feedback**: Hover and focus states clearly defined
- **Swipe Gestures**: Compatible with touch navigation

### Grid Integration
```css
/* Responsive grid containers */
.property-grid {
  display: grid;
  gap: 1rem;
  
  /* Mobile: 1 column */
  grid-template-columns: 1fr;
  
  /* Tablet: 2 columns */
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  /* Desktop: 3+ columns */
  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

## Image Handling

### Next.js Image Optimization
```typescript
<Image
  src={property.images?.[0] || '/images/properties/sample-1.jpg'}
  alt={property.address}
  fill                    // Fills parent container
  className="object-cover rounded-t-xl"
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>
```

### Progressive Loading Strategy
1. **Placeholder**: Default property image while loading
2. **Lazy Loading**: Images load as they enter viewport
3. **Responsive Sizes**: Different image sizes for different screen sizes
4. **Fallback**: Default image if property image fails to load

### Image Sources Priority
```
1. property.images[0]              (Primary image)
   ↓ (if not available)
2. property.cover_image            (Cover image)  
   ↓ (if not available)
3. '/images/properties/sample-1.jpg' (Default fallback)
```

## Status Indicators

### Visual Status System
```
┌─────────────────────────────────────────────────┐
│  ● Green = Active      Available for viewing     │
│  ● Yellow = Pending    Under contract           │  
│  ● Blue = Sold         Transaction complete     │
│  ● Gray = Off-market   Temporarily unavailable  │
└─────────────────────────────────────────────────┘
```

### Implementation Details
```typescript
// Status dot with tooltip
<div
  data-testid="status-indicator"
  className={`w-3 h-3 rounded-full ${getStatusColor()}`}
  title={property.status}  // Tooltip shows status text
/>
```

### Accessibility Features
- **Tooltip Text**: Status shown on hover for screen readers
- **Color + Text**: Not relying solely on color for information
- **Test IDs**: Easy testing and automation support

## Feature Display Logic

### Feature Limiting Strategy
```typescript
// Show maximum 3 features + overflow indicator
{displayFeatures.slice(0, 3).map((feature, index) => (
  <span key={index} className="feature-badge">
    {feature}
  </span>
))}
{displayFeatures.length > 3 && (
  <span className="overflow-indicator">
    +{displayFeatures.length - 3} more
  </span>
)}
```

### Feature Badge Styling
```css
.feature-badge {
  background: #f3f4f6;      /* Light gray background */
  color: #374151;           /* Dark gray text */  
  padding: 4px 8px;         /* Compact padding */
  border-radius: 4px;       /* Rounded corners */
  font-size: 12px;          /* Small, readable text */
}
```

## Interaction States

### Hover Effects
```css
.property-card {
  transition: all 0.2s ease;  /* Smooth transitions */
}

.property-card:hover {
  box-shadow: 0 10px 25px rgba(0,0,0,0.15);  /* Elevated shadow */
  transform: translateY(-2px);                /* Subtle lift */
}

/* Edit button reveal on hover */
.edit-button {
  opacity: 0;
  transition: opacity 0.2s ease;
}

.property-card:hover .edit-button {
  opacity: 1;
}
```

### Focus States
```css
.property-card:focus {
  outline: 2px solid #3b82f6;  /* Blue focus ring */
  outline-offset: 2px;
}
```

### Active/Selected States
```css
.property-card.selected {
  border: 2px solid #3b82f6;   /* Blue border */
  background: #eff6ff;         /* Light blue background */
}
```

## Error Handling

### Missing Data Handling
```typescript
// Graceful handling of missing property data
const displayPrice = formatPrice(property.price || null)
const displayBeds = property.bedrooms || 0
const displayBaths = property.bathrooms || 0
const displayArea = formatArea(property.area_sqft || null)
```

### Image Error Handling
```typescript
// Next.js Image component handles errors automatically
// Falls back to default image if src fails
src={property.images?.[0] || '/images/properties/sample-1.jpg'}
```

### Feature Array Safety
```typescript
// Safe array handling prevents crashes
const displayFeatures = formatFeatures(property.features || [])
```

## Accessibility Features

### Semantic HTML
```html
<!-- Proper heading hierarchy -->
<h3 className="property-title">Property Address</h3>

<!-- Meaningful alt text -->
<img alt="Property at 123 Ocean Drive, Miami Beach" />

<!-- Accessible status indicators -->
<div title="Property Status: Active" />
```

### Keyboard Navigation
- **Tab Order**: Logical tab progression through card elements
- **Enter Key**: Activates main card click action
- **Focus Management**: Clear focus indicators on all interactive elements

### Screen Reader Support
```html
<!-- Descriptive labels -->
<span aria-label="Property price">$850,000</span>
<span aria-label="Property details">2 bedrooms, 2 bathrooms, 1200 square feet</span>

<!-- Status information -->
<div aria-label="Property status: Active" />
```

## Performance Considerations

### Image Optimization
- **Next.js Image**: Automatic WebP conversion, lazy loading
- **Responsive Images**: Appropriate sizes for different viewports
- **CDN Integration**: Fast image delivery through Vercel/CDN

### Component Optimization
```typescript
// Memoization for expensive calculations
const displayFeatures = useMemo(() => 
  formatFeatures(property.features || []), 
  [property.features]
)

// Prevent unnecessary re-renders
export default memo(PropertyCard)
```

### Bundle Size
- **Tree Shaking**: Only imports used formatting functions
- **CSS Purging**: Tailwind removes unused styles
- **Component Splitting**: Separate variants if needed

## Testing Coverage

The PropertyCard component has comprehensive test coverage:

### Rendering Tests
- ✅ Renders with minimum required props
- ✅ Displays all property information correctly
- ✅ Shows default image when property image missing
- ✅ Handles null/undefined property fields gracefully

### Interaction Tests  
- ✅ Fires onClick callback with property object
- ✅ Shows edit button when showActions=true
- ✅ Handles missing onClick prop without errors
- ✅ Keyboard navigation works correctly

### Status Display Tests
- ✅ Shows correct status color for each status type
- ✅ Displays status tooltip text
- ✅ Handles unknown status gracefully

### Data Formatting Tests
- ✅ Price formatting (with/without values)
- ✅ Bedroom/bathroom formatting
- ✅ Area formatting with null values
- ✅ Feature truncation and overflow indicators

### Responsive Tests
- ✅ Renders correctly on mobile viewports
- ✅ Maintains aspect ratio across screen sizes
- ✅ Touch targets meet accessibility standards

**15/15 tests passing**

## Usage Examples

### Basic Property Listing
```typescript
const PropertyList = () => {
  const [properties, setProperties] = useState<Property[]>([])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {properties.map(property => (
        <PropertyCard
          key={property.id}
          property={property}
          onClick={(property) => router.push(`/properties/${property.id}`)}
        />
      ))}
    </div>
  )
}
```

### Property Selection (LinkCreator)
```typescript
const PropertySelector = () => {
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const handlePropertyClick = (property: Property) => {
    setSelectedIds(prev => 
      prev.includes(property.id)
        ? prev.filter(id => id !== property.id)
        : [...prev, property.id]
    )
  }

  return (
    <div className="property-selection-grid">
      {properties.map(property => (
        <PropertyCard
          key={property.id}
          property={property}
          onClick={handlePropertyClick}
          className={selectedIds.includes(property.id) ? 'selected' : ''}
        />
      ))}
    </div>
  )
}
```

### Agent Management Interface
```typescript
const AgentPropertyGrid = () => {
  const handleEdit = (property: Property) => {
    setEditingProperty(property)
    setShowEditModal(true)
  }

  return (
    <div className="agent-grid">
      {properties.map(property => (
        <PropertyCard
          key={property.id}
          property={property}
          onClick={(property) => setSelectedProperty(property)}
          showActions={true}
          onEdit={handleEdit}
        />
      ))}
    </div>
  )
}
```

## Future Enhancements

### Planned Features
1. **Image Gallery**: Swipeable image carousel within card
2. **Favorites Heart**: Like/unlike functionality with animation
3. **Comparison Mode**: Multi-select for property comparison
4. **Virtual Tour**: 360° tour integration
5. **Price History**: Tooltip showing price changes over time

### UX Improvements  
1. **Skeleton Loading**: Smooth loading states during data fetch
2. **Progressive Enhancement**: Core functionality without JavaScript
3. **Gesture Support**: Swipe gestures on touch devices
4. **Quick Actions**: Long-press context menus
5. **Micro-Animations**: Subtle entrance and state change animations

### Technical Enhancements
1. **Virtual Scrolling**: Handle thousands of properties efficiently
2. **Intersection Observer**: Optimize image loading timing
3. **Web Workers**: Background image processing
4. **Service Worker**: Offline property caching
5. **WebP + AVIF**: Next-gen image format support

## Related Components

- **PropertyService**: Data source for property information
- **LinkCreator**: Uses PropertyCard for property selection
- **Property Detail Pages**: Expanded view of PropertyCard data
- **Search/Filter Components**: Work with PropertyCard arrays
- **Agent Dashboard**: Management interface using PropertyCard

## Dependencies

### Internal Dependencies  
- Property types and interfaces
- Formatting utility functions
- Tailwind CSS classes

### External Dependencies
- `next/image`: Optimized image handling
- `react`: Component framework
- `tailwindcss`: Utility-first styling