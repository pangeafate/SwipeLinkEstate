# BucketManager Component

## Purpose
The BucketManager provides an organized interface for clients to view, manage, and review their property assignments across different preference categories (Liked, Considering, Disliked, Book Visit). It offers both overview and detailed management capabilities for property collections.

## Component Responsibility
This component manages the organization and display of properties assigned to different preference buckets, providing intuitive tools for review, reorganization, and batch actions on property collections.

## Public API

| Prop | Type | Required | Default | Purpose |
|------|------|----------|---------|---------|
| buckets | BucketData | Yes | - | Object containing all bucket assignments |
| properties | Property[] | Yes | - | Complete array of properties for reference |
| onPropertyMove | (propertyId: string, fromBucket: BucketType, toBucket: BucketType) => void | Yes | - | Handle property movement between buckets |
| onBucketClear | (bucketType: BucketType) => void | Yes | - | Clear all properties from a bucket |
| onPropertyView | (propertyId: string) => void | Yes | - | Open property in detailed modal view |
| onBatchAction | (action: BatchAction, propertyIds: string[]) => void | No | - | Handle batch operations on multiple properties |
| currentView | BucketType \| 'all' | No | 'all' | Currently active bucket view |
| onViewChange | (view: BucketType \| 'all') => void | No | - | Handle bucket view changes |

## Architecture Position

```
┌─────────────────────────────────────────────────┐
│                 CLIENT LINK APP                 │
│  ┌─────────────────────────────────────────────┐ │
│  │            Property Carousel                │ │
│  │  • Primary property browsing               │ │
│  │  • Initial bucket assignments              │ │
│  └─────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────┤
│              BUCKET MANAGER ⭐                   │
│  ┌─────────────────────────────────────────────┐ │
│  │            Bucket Navigation                │ │
│  │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐  │ │
│  │  │ All │ │Liked│ │Cons │ │ No  │ │Visit│  │ │
│  │  │ (12)│ │ (5) │ │ (3) │ │ (2) │ │ (2) │  │ │
│  │  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘  │ │
│  └─────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────┐ │
│  │            Active Bucket View               │ │
│  │  ┌─────────────────────────────────────────┐ │ │
│  │  │         Bucket Summary                  │ │ │
│  │  │  • Property count & statistics         │ │ │
│  │  │  • Average price & type distribution   │ │ │
│  │  │  • Quick actions (clear, share, etc.)  │ │ │
│  │  └─────────────────────────────────────────┘ │ │
│  │  ┌─────────────────────────────────────────┐ │ │
│  │  │         Property Grid                   │ │ │
│  │  │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐      │ │ │
│  │  │  │Prop │ │Prop │ │Prop │ │Prop │      │ │ │
│  │  │  │ 1   │ │ 2   │ │ 3   │ │ 4   │      │ │ │
│  │  │  └─────┘ └─────┘ └─────┘ └─────┘      │ │ │
│  │  │  • Drag & drop between buckets        │ │ │
│  │  │  • Batch selection mode               │ │ │
│  │  │  • Quick actions per property         │ │ │
│  │  └─────────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────┐ │
│  │            Bucket Actions                   │ │
│  │  • Download/Print Summary                  │ │
│  │  • Share with Agent                        │ │
│  │  • Schedule Group Viewing                  │ │
│  │  • Export Property List                    │ │
│  └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

## Bucket Types & Management

### Bucket Categories
```typescript
// Bucket Type Definitions
type BucketType = 'love' | 'maybe' | 'pass' | 'book_visit';

interface BucketConfig {
  love: {
    icon: '❤️',
    color: '#EF4444',
    label: 'Liked',
    description: 'Properties you love and want to explore further'
  },
  maybe: {
    icon: '🔖',
    color: '#F59E0B', 
    label: 'Considering',
    description: 'Properties you might be interested in'
  },
  pass: {
    icon: '❌',
    color: '#6B7280',
    label: 'Disliked', 
    description: 'Properties that don't match your preferences'
  },
  book_visit: {
    icon: '📅',
    color: '#10B981',
    label: 'Book Visit',
    description: 'Properties you want to schedule a viewing for'
  }
}
```

### Bucket Data Structure
```typescript
interface BucketData {
  love: string[];        // Array of property IDs
  maybe: string[];       // Array of property IDs  
  pass: string[];        // Array of property IDs
  book_visit: string[];  // Array of property IDs
}

interface BucketStats {
  count: number;
  averagePrice: number;
  priceRange: { min: number; max: number };
  propertyTypes: Record<string, number>;
  locations: string[];
  totalValue: number;
}
```

## Interaction Patterns

### Bucket Navigation Flow
```
Bucket Selection Flow:
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  Bucket Tab      │────▶│  View Change     │────▶│  Content Update  │
│ • Tab click      │     │ • Validate view  │     │ • Filter props   │
│ • Keyboard nav   │     │ • Update state   │     │ • Update stats   │
│ • Quick counts   │     │ • Track event    │     │ • Update UI      │
└──────────────────┘     └──────────────────┘     └──────────────────┘

Property Movement Flow:
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  Move Trigger    │────▶│  Validation      │────▶│  State Update    │
│ • Drag & drop    │     │ • Check source   │     │ • Update buckets │
│ • Action button  │     │ • Validate target│     │ • Visual feedback│
│ • Batch action   │     │ • Conflict check │     │ • Analytics track│
└──────────────────┘     └──────────────────┘     └──────────────────┘

Batch Operations Flow:
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  Selection Mode  │────▶│  Batch Action    │────▶│  Confirmation    │
│ • Multi-select   │     │ • Move all       │     │ • Success toast  │
│ • Select all     │     │ • Clear selected │     │ • Undo option    │
│ • Action menu    │     │ • Bulk export    │     │ • State sync     │
└──────────────────┘     └──────────────────┘     └──────────────────┘
```

## Visual Components

### Bucket Navigation Bar
```
Navigation Bar Layout:
├── All Properties Tab (badge: total count)
├── Loved Tab (❤️ + count, red indicator)
├── Considering Tab (🔖 + count, amber indicator) 
├── Passed Tab (❌ + count, gray indicator)
├── Book Visit Tab (📅 + count, green indicator)
└── Actions Menu (⋮ - batch actions, settings)

Active State Indicators:
├── Active tab highlighted with bucket color
├── Underline or background color change
├── Badge count dynamically updated
├── Loading states during transitions
└── Error states for failed operations
```

### Property Grid Display
```
Grid Layout Options:
├── Grid View (default)
│   ├── 1 column on mobile
│   ├── 2 columns on tablet
│   ├── 3-4 columns on desktop
│   └── Masonry layout for varying heights
├── List View (compact)
│   ├── Single column with horizontal cards
│   ├── Detailed information displayed
│   ├── Quick actions on right side
│   └── Sort options at top
└── Comparison View (side-by-side)
    ├── Max 3-4 properties at once
    ├── Feature-by-feature comparison
    ├── Highlight differences
    └── Export comparison table
```

### Bucket Summary Section
```
Summary Information:
├── Header Section
│   ├── Bucket name and icon
│   ├── Property count
│   ├── Last updated timestamp
│   └── Quick actions (clear, share)
├── Statistics Panel
│   ├── Average price display
│   ├── Price range (min - max)
│   ├── Property type breakdown
│   ├── Location distribution
│   └── Total portfolio value
├── Insights Section
│   ├── Common features found
│   ├── Price comparison to market
│   ├── Location preference analysis
│   └── Recommendation prompts
└── Action Buttons
    ├── Schedule group viewing
    ├── Share with agent
    ├── Download summary
    └── Clear bucket
```

## Drag & Drop Functionality

### Drag Operations
```javascript
// Drag & Drop Configuration
const DRAG_CONFIG = {
  // Enable drag between buckets
  enableCrossBucket: true,
  
  // Visual feedback during drag
  dragPreview: {
    opacity: 0.8,
    scale: 0.95,
    elevation: 4
  },
  
  // Drop zone highlighting
  dropZones: {
    highlight: true,
    showPreview: true,
    animateOnHover: true
  },
  
  // Touch device optimization
  touch: {
    longPressDuration: 500,
    feedbackIntensity: 'medium'
  }
}
```

### Drop Validation
- **Source Validation**: Ensure property exists in source bucket
- **Target Validation**: Check if target bucket is valid destination
- **Duplicate Prevention**: Prevent duplicate assignments
- **Conflict Resolution**: Handle edge cases gracefully

## Responsive Behavior

### Mobile Layout (320-767px)
```
Mobile Optimizations:
├── Horizontal scrolling bucket tabs
├── Single column property grid
├── Swipe gestures for bucket switching
├── Bottom sheet for property actions
├── Simplified batch operations
├── Touch-optimized drag handles
└── Collapsible summary sections
```

### Tablet Layout (768-1023px)
```
Tablet Optimizations:
├── Two-column property grid
├── Enhanced drag & drop areas
├── Split view for bucket comparison
├── Larger touch targets
├── Contextual menus on long press
└── Hybrid touch/mouse interactions
```

### Desktop Layout (1024px+)
```
Desktop Optimizations:
├── Multi-column property grid
├── Advanced sorting and filtering
├── Keyboard shortcuts for actions
├── Right-click context menus
├── Bulk selection with checkboxes
├── Detailed hover states
└── Advanced batch operations
```

## Accessibility Features

### Navigation Support
- **Keyboard Navigation**: Tab through buckets, arrow keys for grid navigation
- **Screen Reader**: Comprehensive bucket and property descriptions
- **Focus Management**: Clear focus indicators and logical tab order
- **Shortcuts**: Quick keys for common actions (D for delete, M for move)

### Visual Accessibility
- **High Contrast**: Bucket colors meet WCAG contrast requirements
- **Color Independence**: Icons and text labels supplement color coding
- **Motion Preferences**: Respect reduced motion preferences
- **Text Scaling**: Support up to 200% text scaling

## Performance Optimizations

### Data Management
```javascript
// Performance Strategies
const PERFORMANCE_CONFIG = {
  // Virtual scrolling for large property lists
  virtualization: {
    threshold: 50,        // Enable for >50 properties
    overscan: 5,          // Render 5 extra items
    itemHeight: 'dynamic' // Support variable heights
  },
  
  // Memoization for expensive calculations
  memoization: {
    bucketStats: true,    // Cache bucket statistics
    priceAnalysis: true,  // Cache price calculations
    sortedResults: true   // Cache sorted property arrays
  },
  
  // Lazy loading for property images
  lazyLoading: {
    threshold: '200px',   // Load 200px before visible
    placeholder: 'blur',  // Show blur placeholder
    fadeIn: true         // Smooth fade-in animation
  }
}
```

### Memory Management
- **Cleanup**: Remove unused property data and event listeners
- **Caching**: Intelligent caching of bucket statistics and property data
- **Debouncing**: Debounce rapid bucket changes and batch operations
- **Garbage Collection**: Proper cleanup of drag/drop event handlers

## Analytics & Insights

### User Behavior Tracking
```typescript
interface BucketAnalytics {
  // Bucket usage patterns
  bucketInteractions: {
    mostUsedBucket: BucketType;
    averagePropertiesPerBucket: number;
    bucketChangeFrequency: number;
  };
  
  // Property organization insights
  organizationPatterns: {
    timeToDecision: number;
    reassignmentRate: number;
    batchOperationUsage: number;
  };
  
  // User preferences
  preferences: {
    preferredViewMode: 'grid' | 'list' | 'comparison';
    averageSessionDuration: number;
    mostViewedProperties: string[];
  };
}
```

## Integration Points

### Parent Component Integration
```typescript
// Usage example in client link app
const [buckets, setBuckets] = useState<BucketData>({
  love: [],
  maybe: [],
  pass: [],
  book_visit: []
});

<BucketManager
  buckets={buckets}
  properties={allProperties}
  onPropertyMove={handlePropertyMove}
  onBucketClear={handleBucketClear}
  onPropertyView={openPropertyModal}
  onBatchAction={handleBatchOperations}
  currentView={activeBucketView}
  onViewChange={setActiveBucketView}
/>
```

### Service Integrations
- **Bucket Service**: Persistent storage of bucket assignments
- **Property Service**: Property data and metadata retrieval
- **Analytics Service**: Track bucket usage and user patterns
- **Export Service**: Generate summaries and reports

## Testing Strategy

### Unit Testing Focus
- Bucket assignment logic
- Property movement validation  
- Statistics calculations
- Drag and drop functionality
- Batch operation handling

### Integration Testing Focus
- Bucket persistence across sessions
- Property data synchronization
- Analytics event tracking
- Export functionality
- Cross-component communication

### Accessibility Testing Focus
- Keyboard navigation flow
- Screen reader announcements
- Focus management
- Color contrast validation
- Motion preference handling

## Dependencies

### Internal Dependencies
- Property and bucket type definitions
- Shared UI components (cards, buttons, icons)
- Analytics utilities
- Export and sharing utilities

### External Dependencies
- React DnD or React Beautiful DnD for drag and drop
- React Virtualized for large lists
- Date formatting utilities
- Export libraries (CSV, PDF generation)

This README establishes the BucketManager as a sophisticated property organization tool that enhances user engagement and provides valuable insights for both clients and agents within the CLIENT-LINK-DESIGN architecture.