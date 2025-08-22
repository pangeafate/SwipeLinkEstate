# Swipe Module

## Purpose
Implements the core Tinder-like property browsing interface for client-facing link pages.

## Public API

| Function | Input | Output | Purpose |
|----------|-------|--------|---------|
| SwipeService.initializeSession | linkCode | SwipeSession | Start new client session |
| SwipeService.handleSwipe | direction, propertyId, sessionId | SwipeResult | Process swipe action |
| SwipeService.getSwipeState | sessionId | SwipeState | Get current buckets |
| SwipeService.resetProperty | propertyId, sessionId | void | Undo swipe action |
| SwipeInterface | SwipeProps | JSX.Element | Main swipe UI component |

## Dependencies

### Internal
- Property module (types, services)
- Link module (link validation)
- Supabase client (for activity tracking)

### External
- react-tinder-card
- framer-motion
- @tanstack/react-query

## File Structure
```
swipe/
├── index.ts              # Public exports only
├── types.ts              # TypeScript interfaces
├── swipe.service.ts      # Business logic
├── components/           # UI components
│   ├── SwipeInterface.tsx       # Original interface (291 lines - DEPRECATED)
│   ├── SwipeInterfaceV2.tsx     # V2 interface (174 lines - ACTIVE)
│   ├── SwipeInterfaceV3.tsx     # V3 orchestrator (92 lines) ✅
│   ├── SwipeHeader.tsx          # Progress/controls (69 lines) ✅
│   ├── SwipeCard.tsx            # Main swipe area (57 lines) ✅
│   ├── SwipeCompleted.tsx       # Completion state (54 lines) ✅
│   ├── SwipeEmptyState.tsx      # Empty state (18 lines) ✅
│   ├── SwipeHints.tsx           # User guidance (25 lines) ✅
│   ├── PropertySwipeCard.tsx    # Property display
│   ├── BucketBar.tsx           # Status indicators
│   ├── ActionButtons.tsx       # Swipe actions
│   ├── SwipeGestures.tsx       # Gesture handling
│   ├── CompletionScreen.tsx    # Results display
│   ├── SwipeContainer.tsx      # Container layout
│   ├── hooks/
│   │   └── useSwipeLogic.ts    # State management (163 lines) ✅
│   └── __tests__/              # Component tests
└── __tests__/                  # Module tests
```

## State Management
Uses React Query for server state and local React state for swipe animations and gestures.

## Performance Considerations
- Preloads next 2-3 property cards for smooth animations
- Optimistic UI updates for swipe actions
- Image optimization with Next.js Image component
- Gesture throttling to prevent rapid swipes

## Refactored Components (2025-08-19)

### SwipeInterfaceV3 Architecture
Following TDD methodology, the original 291-line SwipeInterface.tsx was refactored into focused UI section components:

#### SwipeInterfaceV3.tsx (92 lines) ✅
**Purpose**: Main orchestrator component coordinating all swipe UI sections
**Features**:
- Integrates all swipe UI components
- Uses existing useSwipeLogic hook for state management
- Handles empty state and completion state routing
- Maintains all original functionality

```tsx
import SwipeInterfaceV3 from '@/components/swipe/components/SwipeInterfaceV3'

<SwipeInterfaceV3
  properties={properties}
  sessionId={sessionId}
  onSwipeComplete={handleComplete}
  onSwipe={handleSwipe}
/>
```

#### SwipeHeader.tsx (69 lines) ✅
**Purpose**: Progress bar, undo button, and bucket counts display
**Features**:
- Progress bar with current position
- Undo functionality with proper state management
- Real-time bucket count updates
- Disabled states for processing

```tsx
import SwipeHeader from '@/components/swipe/components/SwipeHeader'

<SwipeHeader
  currentIndex={currentIndex}
  totalProperties={properties.length}
  bucketCounts={bucketCounts}
  canUndo={currentIndex > 0}
  isProcessing={isProcessing}
  onUndo={handleUndo}
/>
```

#### SwipeCard.tsx (57 lines) ✅
**Purpose**: Main swipe interaction area with TinderCard integration
**Features**:
- TinderCard wrapper with proper configuration
- Loading overlay for processing states
- PropertySwipeCard integration
- Swipe gesture handling

```tsx
import SwipeCard from '@/components/swipe/components/SwipeCard'

<SwipeCard
  currentProperty={currentProperty}
  isProcessing={isProcessing}
  onSwipe={handleSwipe}
  onCardLeftScreen={handleCardLeftScreen}
/>
```

#### SwipeCompleted.tsx (54 lines) ✅
**Purpose**: Completion screen with results summary
**Features**:
- Animated completion celebration
- Bucket counts visualization
- Start over functionality
- Results summary display

```tsx
import SwipeCompleted from '@/components/swipe/components/SwipeCompleted'

<SwipeCompleted
  bucketCounts={bucketCounts}
  onStartOver={handleStartOver}
/>
```

#### SwipeEmptyState.tsx (18 lines) ✅
**Purpose**: Empty state when no properties available
**Features**:
- Friendly empty state message
- Consistent styling with app theme
- Proper accessibility attributes

```tsx
import SwipeEmptyState from '@/components/swipe/components/SwipeEmptyState'

<SwipeEmptyState />
```

#### SwipeHints.tsx (25 lines) ✅
**Purpose**: Bottom hints panel with swipe direction guidance
**Features**:
- Visual swipe direction indicators
- Consistent hint messaging
- Mobile-optimized layout

```tsx
import SwipeHints from '@/components/swipe/components/SwipeHints'

<SwipeHints />
```

#### useSwipeLogic.ts (163 lines) ✅ - Existing Hook
**Purpose**: Centralized state management for swipe functionality
**Features**:
- Complete swipe workflow management
- Bucket count calculations
- Optimistic UI updates
- Error handling and recovery
- Undo functionality

```tsx
import useSwipeLogic from '@/components/swipe/components/hooks/useSwipeLogic'

const {
  currentIndex,
  isProcessing,
  error,
  bucketCounts,
  currentProperty,
  isComplete,
  decideSwipe,
  handleUndo
} = useSwipeLogic({
  properties,
  sessionId,
  onSwipeComplete,
  onSwipe
})
```

### Component Evolution
- **SwipeInterface.tsx** (291 lines): Original monolithic component - DEPRECATED
- **SwipeInterfaceV2.tsx** (174 lines): Intermediate refactor - ACTIVE
- **SwipeInterfaceV3.tsx** (92 lines): Final component-based architecture - RECOMMENDED

### Migration Strategy
- ✅ **SwipeInterfaceV3**: Use for all new swipe implementations
- ✅ **SwipeInterfaceV2**: Continue using existing implementations
- ⚠️ **SwipeInterface**: Original deprecated, migrate when possible
- ✅ **Component Library**: Reuse UI components for other interfaces

### Testing Coverage
All refactored components include comprehensive test suites:
- Unit tests for individual UI components
- Integration tests with useSwipeLogic hook
- Gesture and interaction testing
- State management testing
- Error boundary testing
- Accessibility compliance testing

### Performance Benefits
The refactored architecture provides:
- **Smaller Bundle Chunks**: Components can be lazy-loaded individually
- **Better Re-render Optimization**: Isolated component updates
- **Improved Maintainability**: Focused, single-purpose components
- **Enhanced Testability**: Easier to test individual UI sections
- **Reusability**: Components can be reused in other contexts