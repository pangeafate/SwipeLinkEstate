# PropertyModal Component

## Purpose
The PropertyModal provides an expanded, full-screen view of property details when users click on a property card in the carousel. It offers comprehensive property information including image galleries, interactive maps, detailed specifications, and direct bucket assignment actions.

## Component Responsibility
This component manages the immersive property exploration experience, displaying rich media content, detailed property data, and providing intuitive navigation between properties within the modal context.

## Public API

| Prop | Type | Required | Default | Purpose |
|------|------|----------|---------|---------|
| property | Property \| null | Yes | - | Currently displayed property (null closes modal) |
| isOpen | boolean | Yes | - | Controls modal visibility |
| onClose | () => void | Yes | - | Callback to close modal |
| onNavigate | (direction: 'prev' \| 'next') => void | Yes | - | Navigate to adjacent property within modal |
| onBucketAssign | (propertyId: string, bucket: BucketType) => void | Yes | - | Bucket assignment handler |
| selectedBucket | BucketType \| null | No | null | Current bucket assignment for this property |
| canNavigatePrev | boolean | No | false | Enable previous property navigation |
| canNavigateNext | boolean | No | false | Enable next property navigation |
| onBookVisit | (propertyId: string) => void | No | - | Callback for booking visit action |

## Architecture Position

```
┌─────────────────────────────────────────────────┐
│                 CLIENT LINK APP                 │
│  ┌─────────────────────────────────────────────┐ │
│  │            Property Carousel                │ │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐      │ │
│  │  │  Prev   │ │ Current │ │  Next   │      │ │
│  │  │  Card   │ │  Card   │ │  Card   │      │ │
│  │  └─────────┘ └────┬────┘ └─────────┘      │ │
│  └─────────────────────┼─────────────────────── │
├─────────────────────────┼─────────────────────────┤
│              PROPERTY MODAL ⭐ (Overlay)         │
│  ┌─────────────────────▼─────────────────────┐   │
│  │            Full-Screen Modal             │   │
│  │  ┌─────────────────────────────────────┐ │   │
│  │  │         Media Gallery               │ │   │
│  │  │  • Hero Image Display              │ │   │
│  │  │  • Image Carousel/Grid             │ │   │
│  │  │  • Zoom & Pan Capability           │ │   │
│  │  │  • Virtual Tour Integration        │ │   │
│  │  └─────────────────────────────────────┘ │   │
│  │  ┌─────────────────────────────────────┐ │   │
│  │  │         Property Details            │ │   │
│  │  │  • Address & Neighborhood          │ │   │
│  │  │  • Price & Market Info             │ │   │
│  │  │  • Features & Specifications       │ │   │
│  │  │  • Description & Agent Notes       │ │   │
│  │  └─────────────────────────────────────┘ │   │
│  │  ┌─────────────────────────────────────┐ │   │
│  │  │         Interactive Map             │ │   │
│  │  │  • Property Location               │ │   │
│  │  │  • Neighborhood Context            │ │   │
│  │  │  • Nearby Amenities               │ │   │
│  │  │  • Commute Calculator              │ │   │
│  │  └─────────────────────────────────────┘ │   │
│  │  ┌─────────────────────────────────────┐ │   │
│  │  │         Action Panel                │ │   │
│  │  │  • Bucket Assignment Buttons       │ │   │
│  │  │  • Book Visit (Primary CTA)        │ │   │
│  │  │  • Share & Save Options            │ │   │
│  │  │  • Contact Agent                   │ │   │
│  │  └─────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

## Modal Interaction Flow

```
Modal Opening Flow:
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   Card Click     │────▶│  Modal Trigger   │────▶│  Full-Screen     │
│ • Carousel card  │     │ • Prepare data   │     │ • Backdrop fade  │
│ • Expand button  │     │ • Set property   │     │ • Content slide  │
│ • Keyboard enter │     │ • Focus manage   │     │ • Focus trap     │
└──────────────────┘     └──────────────────┘     └──────────────────┘

Navigation Within Modal:
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  Nav Trigger     │────▶│  Data Update     │────▶│  Content Update  │
│ • Prev/Next      │     │ • New property   │     │ • Smooth trans   │
│ • Keyboard       │     │ • State sync     │     │ • Image preload  │
│ • Gesture swipe  │     │ • Validation     │     │ • Focus maintain │
└──────────────────┘     └──────────────────┘     └──────────────────┘

Modal Closing Flow:
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  Close Trigger   │────▶│  Cleanup Process │────▶│  Return Focus    │
│ • Close button   │     │ • Save state     │     │ • Carousel sync  │
│ • Escape key     │     │ • Stop media     │     │ • Memory cleanup │
│ • Backdrop click │     │ • Clear timers   │     │ • Animation out  │
└──────────────────┘     └──────────────────┘     └──────────────────┘
```

## Content Sections

### Media Gallery Section
```
Media Gallery Components:
├── Primary Image Display
│   ├── High-resolution property hero image
│   ├── Zoom controls (pinch/click to zoom)
│   ├── Pan navigation when zoomed
│   └── Loading states with LQIP
├── Image Carousel/Grid
│   ├── Thumbnail navigation strip
│   ├── Image counter (3/12 photos)
│   ├── Touch/swipe navigation
│   └── Keyboard accessibility
├── Media Controls
│   ├── Previous/Next image buttons
│   ├── Fullscreen toggle
│   ├── Share image functionality
│   └── Virtual tour button (if available)
└── Media Loading
    ├── Progressive image loading
    ├── Bandwidth optimization
    ├── Error handling with fallbacks
    └── Preloading next images
```

### Property Details Section
```
Property Information Layout:
├── Header Information
│   ├── Complete property address
│   ├── Formatted price display
│   ├── Property status (Active, Pending, etc.)
│   └── Days on market indicator
├── Key Features
│   ├── Bedrooms, bathrooms, square footage
│   ├── Property type (House, Condo, etc.)
│   ├── Year built and lot size
│   └── HOA information (if applicable)
├── Detailed Features
│   ├── Room-by-room descriptions
│   ├── Appliances and amenities checklist
│   ├── Parking and storage details
│   └── Recent updates/renovations
├── Market Information
│   ├── Price history and trends
│   ├── Neighborhood price comparison
│   ├── Property tax information
│   └── Market analysis insights
└── Agent Notes
    ├── Agent-provided highlights
    ├── Showing instructions
    ├── Special considerations
    └── Recent updates/notes
```

### Interactive Map Section
```
Map Features:
├── Property Location
│   ├── Precise property pin
│   ├── Street view integration
│   ├── Neighborhood boundaries
│   └── Nearby properties (if applicable)
├── Amenities & Services
│   ├── Schools (elementary, middle, high)
│   ├── Shopping centers and restaurants
│   ├── Public transportation stops
│   └── Parks and recreational facilities
├── Commute Analysis
│   ├── Commute time calculator
│   ├── Traffic pattern analysis
│   ├── Public transit options
│   └── Walking/biking distances
└── Map Controls
    ├── Zoom and pan controls
    ├── Layer toggles (amenities, transit)
    ├── Fullscreen map option
    └── Share location functionality
```

## Visual Design Patterns

### Modal Layout Structure
```
Responsive Modal Layout:
├── Mobile (< 768px)
│   ├── Full-screen overlay (100vh)
│   ├── Vertical scroll layout
│   ├── Stacked content sections
│   ├── Fixed action bar at bottom
│   └── Gesture-friendly controls
├── Tablet (768-1023px)
│   ├── Large overlay with margins
│   ├── Two-column layout for some sections
│   ├── Enhanced touch targets
│   ├── Sliding panel navigation
│   └── Optimized for both orientations
└── Desktop (1024px+)
    ├── Centered modal with backdrop
    ├── Multi-column layout optimization
    ├── Advanced hover interactions
    ├── Keyboard navigation indicators
    └── Right-click context menus
```

### Animation & Transitions
```javascript
// Animation Specifications
const MODAL_ANIMATIONS = {
  // Modal open/close
  modal: {
    open: { scale: [0.9, 1], opacity: [0, 1], duration: 250 },
    close: { scale: [1, 0.9], opacity: [1, 0], duration: 200 }
  },
  
  // Content transitions when navigating between properties
  content: {
    slideIn: { x: [50, 0], opacity: [0, 1], duration: 300 },
    slideOut: { x: [0, -50], opacity: [1, 0], duration: 200 }
  },
  
  // Image gallery transitions
  gallery: {
    fade: { opacity: [0, 1], duration: 200 },
    slide: { x: ['100%', '0%'], duration: 300 }
  }
}
```

## Accessibility Features

### Keyboard Navigation
- **Tab Order**: Logical progression through all interactive elements
- **Arrow Keys**: Navigate through image gallery
- **Enter/Space**: Activate buttons and controls
- **Escape**: Close modal and return focus to trigger element

### Screen Reader Support
- **Modal Announcements**: Announce modal opening with property title
- **Content Structure**: Proper heading hierarchy and landmarks
- **Image Descriptions**: Comprehensive alt text for all property images
- **Dynamic Updates**: Live region announcements for property changes

### Focus Management
- **Focus Trap**: Keep focus within modal when open
- **Initial Focus**: Set focus to first interactive element or close button
- **Return Focus**: Return focus to triggering element on close
- **Visual Indicators**: Clear focus indicators for all interactive elements

## Performance Optimizations

### Image Loading Strategy
```javascript
// Performance Configuration
const IMAGE_LOADING = {
  // Load immediately
  hero: { priority: 'high', loading: 'eager' },
  
  // Progressive loading
  gallery: { 
    priority: 'low', 
    loading: 'lazy',
    intersection: { threshold: 0.1 }
  },
  
  // Preload strategy
  preload: {
    next: 2,        // Preload next 2 images
    previous: 1,    // Preload previous 1 image
    quality: 'medium' // Use medium quality for preloading
  }
}
```

### Memory Management
- **Image Cleanup**: Remove unused images from memory
- **Event Cleanup**: Properly remove event listeners on unmount
- **Timer Management**: Clear all timers when modal closes
- **State Reset**: Reset internal state to prevent memory leaks

## Error Handling

### Content Loading Errors
- **Image Failures**: Graceful fallback to placeholder images
- **Map Loading**: Display static map image if interactive map fails
- **Property Data**: Show partial information with error indicators
- **Network Issues**: Provide retry mechanisms and offline fallbacks

### User Interaction Errors
- **Navigation Bounds**: Prevent navigation beyond available properties
- **Action Failures**: Display user-friendly error messages
- **Form Validation**: Real-time validation for any form inputs
- **Session Expiry**: Handle authentication errors gracefully

## Integration Points

### Parent Component Integration
```typescript
// Usage example in carousel or list component
const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

<PropertyModal
  property={selectedProperty}
  isOpen={!!selectedProperty}
  onClose={() => setSelectedProperty(null)}
  onNavigate={handleModalNavigation}
  onBucketAssign={handleBucketAssignment}
  selectedBucket={bucketAssignments[selectedProperty?.id]}
  canNavigatePrev={currentIndex > 0}
  canNavigateNext={currentIndex < properties.length - 1}
  onBookVisit={handleVisitBooking}
/>
```

### Service Integrations
- **Property Service**: Fetch additional property details and images
- **Bucket Service**: Handle property assignments to buckets
- **Visit Service**: Manage visit booking functionality
- **Analytics Service**: Track detailed property interactions

## Testing Strategy

### Unit Testing Focus
- Modal open/close functionality
- Property data rendering
- Image gallery navigation
- Bucket assignment actions
- Keyboard navigation handling

### Integration Testing Focus
- Property data loading from services
- Bucket assignment workflow
- Visit booking integration
- Navigation between properties within modal

### Accessibility Testing Focus
- Screen reader compatibility
- Keyboard-only navigation
- Focus management and trapping
- ARIA labels and announcements

### Performance Testing Focus
- Image loading optimization
- Memory usage monitoring
- Animation smoothness
- Network resilience

## Dependencies

### Internal Dependencies
- Property types and interfaces
- Bucket management types
- Shared UI components (buttons, inputs, icons)
- Animation utilities and hooks

### External Dependencies
- React (useState, useEffect, useCallback, useMemo, useRef)
- React Portal for modal rendering
- Framer Motion for animations
- React Image Gallery for media handling
- Map component library (Google Maps or Mapbox)

This README establishes the PropertyModal as a comprehensive, accessible, and performant component for detailed property exploration within the CLIENT-LINK-DESIGN architecture.