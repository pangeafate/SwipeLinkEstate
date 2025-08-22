# PropertyCarousel Component

## Purpose
The PropertyCarousel is an Airbnb-style horizontal scrolling carousel that follows the updated VISUAL-DESIGN-CLIENT-LINK-RECONCILATION.md specifications. It implements a photography-first design with 70-30 visual distribution, explicit button actions, and responsive multi-card layouts for an intuitive property browsing experience.

## Component Responsibility
This component implements a modern carousel-based property browsing experience with:
- **70-30 Visual Distribution**: Hero images (70%), content zone (30%) - NO action zone in cards
- **Horizontal Scrolling**: Smooth CSS scroll-snap navigation, NO swipe gestures for decisions
- **Explicit Button Actions**: All categorization via buttons (Like/Consider/Pass/Book), NO gesture-based decisions
- **Multi-Card Display**: 1 card mobile, 2 cards tablet, 3-4 cards desktop
- **Clean Aesthetic**: Airbnb-style trust-building design with white space and subtle shadows
- **NO Tinder Mechanics**: No card stacks, no rotation, no cards flying off screen

## Architecture Components
The PropertyCarousel has been refactored into Airbnb-style components:
- **PropertyCarousel.tsx**: Main carousel container with horizontal scroll
- **PropertyCard.tsx**: Individual property card with 70-30 layout
- **DotIndicators.tsx**: Position indicators below carousel
- **NavigationArrows.tsx**: Desktop navigation controls
- **ActionOverlay.tsx**: Bucket assignment buttons on tap

## Public API

| Prop | Type | Required | Default | Purpose |
|------|------|----------|---------|---------|
| properties | Property[] | Yes | - | Array of properties to display in carousel |
| currentIndex | number | Yes | - | Currently active property index |
| onNavigate | (index: number) => void | Yes | - | Callback when user navigates to different property |
| onPropertySelect | (property: Property) => void | Yes | - | Callback when property card is clicked for expansion |
| onBucketAssign | (propertyId: string, bucket: BucketType) => void | Yes | - | Callback for bucket assignment actions |
| selectedBuckets | Record<string, BucketType> | No | {} | Currently assigned bucket per property |
| loading | boolean | No | false | Loading state for carousel |
| className | string | No | '' | Additional CSS classes |

## Architecture Position

```
┌─────────────────────────────────────────────────┐
│                 CLIENT LINK APP                 │
│  ┌─────────────────────────────────────────────┐ │
│  │            Collection Overview               │ │
│  │  • Shows collection metadata               │ │
│  │  • Displays progress indicator             │ │
│  └─────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────┤
│              PROPERTY CAROUSEL ⭐                │
│  ┌─────────────────────────────────────────────┐ │
│  │         Carousel Container                  │ │
│  │  • Horizontal property navigation          │ │
│  │  • Touch/mouse gesture handling           │ │
│  │  • Smooth animations & transitions        │ │
│  │  • Property card preview management       │ │
│  └─────────────────────────────────────────────┘ │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────────────────┐ │
│  │Prev  │ │Card  │ │Next  │ │ Action Buttons   │ │
│  │Card  │ │Focus │ │Card  │ │ • Like           │ │
│  │Peek  │ │(Main)│ │Peek  │ │ • Consider       │ │
│  └──────┘ └──────┘ └──────┘ │ • Dislike        │ │
│                             │ • Book Visit     │ │
│                             └──────────────────┘ │
├─────────────────────────────────────────────────┤
│               BUCKET MANAGER                     │
│  • Shows bucket counts and quick access         │
│  • Displays assignment feedback                │
└─────────────────────────────────────────────────┘
```

## Component Interaction Flow

```
User Navigation Flow:
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   User Gesture   │────▶│  Carousel Logic  │────▶│  Animation       │
│ • Swipe/Drag     │     │ • Validate move  │     │ • Smooth slide   │
│ • Arrow Click    │     │ • Update index   │     │ • Update focus   │
│ • Keyboard Nav   │     │ • Preload cards  │     │ • Visual feedback│
└──────────────────┘     └──────────────────┘     └──────────────────┘
          │                        │                        │
          ▼                        ▼                        ▼
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   Event Handler  │     │  State Updates   │     │  UI Updates      │
│ • onNavigate()   │     │ • currentIndex   │     │ • Active card    │
│ • Debounce calls │     │ • loading states │     │ • Position dots  │
│ • Performance    │     │ • error handling │     │ • Button states  │
└──────────────────┘     └──────────────────┘     └──────────────────┘

Property Interaction Flow:
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   Card Click     │────▶│  Action Handler  │────▶│  Parent Callback │
│ • Main area      │     │ • Validate click │     │ • onPropertySelect│
│ • Expand button  │     │ • Prepare data   │     │ • Open modal     │
└──────────────────┘     └──────────────────┘     └──────────────────┘

Bucket Assignment Flow:
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  Bucket Button   │────▶│  Assignment      │────▶│  Visual Update   │
│ • Like/Consider  │     │ • onBucketAssign │     │ • Button state   │
│ • Dislike/Visit  │     │ • Validate action│     │ • Success anim   │
└──────────────────┘     └──────────────────┘     └──────────────────┘
```

## Navigation Patterns

### Desktop Navigation
- **Mouse Wheel**: Horizontal scroll for carousel movement
- **Arrow Keys**: Left/Right navigation with keyboard focus management
- **Click Navigation**: Click previous/next arrows or dot indicators
- **Drag Gesture**: Click and drag for intuitive navigation

### Mobile/Touch Navigation
- **Touch Swipe**: Horizontal swipe gestures with momentum
- **Tap Navigation**: Tap arrows or dot indicators
- **Long Press**: Context menu for quick actions
- **Pinch Detection**: Prevent interference with zoom gestures

### Accessibility Navigation
- **Tab Order**: Logical tab progression through interactive elements
- **Screen Reader**: Proper ARIA labels and live region updates
- **Focus Management**: Clear focus indicators and skip links
- **Keyboard Shortcuts**: Quick navigation keys (Home/End for first/last)

## Visual Design Implementation

### 70-25-5 Layout Distribution (per VISUAL-DESIGN-GUIDELINES-CLIENTLINK.md)
```
Property Card (320×480px):
├── Hero Image Zone (70% - 336px height)
│   ├── Property Image (16:9 or 4:3 aspect ratio)
│   ├── Gradient Overlay (transparent → rgba(0,0,0,0.7))
│   ├── Price Overlay (bottom-left, 24px bold, white text)
│   ├── Status Badge (top-left, "New"/"Price Reduced")
│   └── Swipe Overlay (progressive color feedback)
├── Content Zone (25% - 120px height)
│   ├── Property Title (20px medium, SF Pro/Roboto)
│   ├── Location (16px regular, 70% opacity)
│   └── Amenities (bed/bath icons, 16px)
└── Action Zone (5% - 24px height)
    ├── Love Button (#4CAF50, heart icon)
    ├── Maybe Button (#FF9800, bookmark icon)
    └── Pass Button (#F44336, X icon)
```

### Semantic Color System
```
Status Colors (WCAG AA compliant):
├── Love/Liked: #4CAF50 (green - trust, positive)
├── Pass/Disliked: #F44336 (red - caution, negative)  
├── Maybe/Considering: #FF9800 (amber - attention, neutral)
└── Book Visit: #2196F3 (blue - action, professional)

Touch Target Specifications:
├── Minimum 44×44px for all interactive elements
├── 8px spacing between buttons
├── Ring focus indicators for accessibility
└── Hover states with 1.05x scale animation
```

### Spring Animation System
```
Framer Motion Configuration:
├── Damping Ratio: 0.8 (natural bounce)
├── Stiffness: 400 (responsive feel)
├── Mass: 1 (standard weight)
└── Duration: 400ms (spring-calculated)

Animation Triggers:
├── Card Navigation: Spring with momentum
├── Button Interactions: Scale + color transitions
├── Swipe Gestures: Rotation + translation
└── Status Changes: Smooth state transitions
```

### Card Visual States
```
Property Card States:
├── Default (clean, minimal design)
├── Hover (subtle elevation, action reveal)
├── Focus (accessibility outline, keyboard nav)
├── Active (centered, full attention)
├── Assigned (bucket indicator, color coding)
└── Loading (skeleton content, spinner)
```

## Performance Characteristics

### Optimization Features
- **Preloading**: Load current + 2 adjacent properties for smooth navigation
- **Image Lazy Loading**: Progressive image loading with LQIP (Low Quality Image Placeholder)
- **Virtual Scrolling**: Efficient rendering for large property collections (>50 items)
- **Gesture Debouncing**: Prevent rapid navigation causing performance issues
- **Memory Management**: Clean up unused property data and images

### Performance Targets
```
Performance Metrics:
├── Navigation Response: <100ms gesture to movement start
├── Animation Smoothness: 60fps during carousel transitions
├── Image Loading: <2s for hero images, progressive enhancement
├── Memory Usage: <50MB for 100+ property carousel
└── Battery Impact: Minimal impact on mobile devices
```

## Advanced Swipe Physics (per VISUAL-DESIGN-GUIDELINES-CLIENTLINK.md)

### Gesture Recognition Thresholds
```javascript
const SWIPE_PHYSICS = {
  // Position Thresholds
  DISTANCE_THRESHOLD: screenWidth * 0.35, // 30-40% of screen width
  
  // Velocity Thresholds  
  VELOCITY_THRESHOLD: 300, // pixels per second
  
  // Visual Feedback
  ROTATION_MAX: 15, // ±15 degrees maximum tilt
  PROGRESS_THRESHOLD: 0.2, // 20% before overlay shows
  
  // Spring Configuration
  SPRING_CONFIG: {
    type: "spring",
    damping: 0.8,    // Natural bounce feel
    stiffness: 400,  // Responsive interaction
    mass: 1          // Standard weight
  }
}
```

### Progressive Color Overlays
```javascript
const SWIPE_OVERLAYS = {
  // Right swipe (Love)
  love: {
    color: 'rgba(76, 175, 80, 0.2)', // Green with 20% opacity
    icon: '❤️',
    threshold: 0.2 // Show after 20% swipe progress
  },
  
  // Left swipe (Pass)
  pass: {
    color: 'rgba(244, 67, 54, 0.2)', // Red with 20% opacity  
    icon: '✕',
    threshold: 0.2 // Show after 20% swipe progress
  }
}
```

### Animation Specifications
```javascript
// Spring Animation Configuration (replaces ease-out)
const SPRING_CONFIG = {
  damping: 0.8,     // Natural bounce (per design guidelines)
  stiffness: 400,   // Responsive feel
  mass: 1,          // Standard weight
  duration: 400     // Calculated by spring physics
}
```

### Micro-interactions
- **Card Focus**: Scale (1.02x) + subtle shadow increase
- **Button Hover**: Background color transition + icon animation
- **Bucket Assignment**: Button press feedback + success pulse
- **Navigation**: Smooth slide with momentum-based easing

## Responsive Behavior

### Mobile (320-767px)
```
Mobile Layout:
├── Full-width property cards
├── Touch-optimized navigation (larger targets)
├── Collapsible action buttons (tap to expand)
├── Simplified UI (reduced visual complexity)
└── Swipe-first interaction model
```

### Tablet (768-1023px)
```
Tablet Layout:
├── Partial previous/next card preview
├── Hybrid touch/mouse interactions
├── Enhanced button visibility
├── Improved gesture recognition
└── Optimized for both portrait/landscape
```

### Desktop (1024px+)
```
Desktop Layout:
├── Full three-card preview (prev/current/next)
├── Mouse hover enhancements
├── Keyboard navigation indicators
├── Advanced control options
└── Detailed property information display
```

## Error Handling

### Navigation Errors
- **Invalid Index**: Gracefully handle out-of-bounds navigation
- **Missing Properties**: Display appropriate empty states
- **Network Issues**: Retry mechanisms with user feedback
- **Gesture Conflicts**: Prevent unintended navigation triggers

### Performance Errors
- **Memory Limits**: Implement cleanup and optimization warnings
- **Animation Lag**: Fallback to simplified animations on slower devices
- **Image Loading**: Graceful degradation with loading indicators
- **Touch Responsiveness**: Ensure 16ms response time targets

## Integration Points

### Parent Component Integration
```typescript
// Usage example in parent component
<PropertyCarousel
  properties={filteredProperties}
  currentIndex={activePropertyIndex}
  onNavigate={handlePropertyNavigation}
  onPropertySelect={openPropertyModal}
  onBucketAssign={handleBucketAssignment}
  selectedBuckets={userBucketAssignments}
/>
```

### Service Layer Integration
- **Property Loading**: Coordinate with PropertyService for data fetching
- **Bucket Management**: Integration with BucketService for assignments
- **Analytics**: Track navigation patterns and user engagement
- **Performance**: Monitor and report performance metrics

### State Management Integration
- **React Query**: Cache property data and handle background updates
- **Local State**: Manage carousel position and animation states
- **Global State**: Sync with application-wide bucket assignments
- **Session Storage**: Persist navigation position across page reloads

## Testing Strategy

### Unit Testing Focus
- Navigation logic (index updates, bounds checking)
- Gesture recognition (swipe detection, click handling)
- Animation triggers (state transitions, timing)
- Accessibility (keyboard navigation, screen reader support)

### Integration Testing Focus
- Property data loading and display
- Bucket assignment workflow
- Parent callback execution
- Error boundary behavior

### Performance Testing Focus
- Animation smoothness under load
- Memory usage with large datasets
- Touch responsiveness on various devices
- Network resilience and retry logic

## Dependencies

### Internal Dependencies
- Property type definitions from `@/types/property`
- Bucket management types from `@/types/buckets`
- Shared UI components from `@/components/shared`
- Performance utilities from `@/lib/performance`

### External Dependencies
- React (hooks: useState, useEffect, useCallback, useMemo)
- Framer Motion or React Spring for animations
- React Use Gesture for advanced touch handling
- Intersection Observer for performance optimization

## Future Enhancements

### Planned Features
1. **Smart Preloading**: ML-based prediction of user navigation patterns
2. **Accessibility Plus**: Enhanced screen reader navigation with spatial audio
3. **Performance Mode**: Ultra-lightweight version for low-end devices
4. **Customization**: User-configurable carousel behavior and appearance
5. **Analytics Integration**: Deep user behavior tracking and insights

### Technical Improvements
1. **Web Workers**: Offload heavy computation for large property sets
2. **Service Workers**: Advanced caching strategies for property images
3. **Progressive Enhancement**: Graceful degradation for unsupported features
4. **Micro-frontends**: Modular loading for different carousel variations

This README establishes the PropertyCarousel as a sophisticated, performant, and accessible navigation component that serves as the foundation for the new CLIENT-LINK-DESIGN architecture.