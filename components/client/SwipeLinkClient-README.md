# SwipeLinkClient Component

## Purpose
Main orchestrator component for the client-side property browsing experience, managing state, bucket navigation, and property interactions.

## Current Status
⚠️ **WARNING**: This component exceeds the 200-line limit (269 lines). It needs to be refactored into smaller components.

## Architecture Position
Core client interface component that coordinates between carousel, modal, navigation, and Zustand store for the property viewing experience.

## Functionality
- Property carousel orchestration
- Bucket navigation management
- Modal display control
- State synchronization with Zustand store
- Analytics event tracking
- Empty state handling
- Property filtering by bucket

## Component Structure
Main orchestrator that should be split into:
- Header component
- Empty state component
- Main content container
- Analytics handler
- State management logic

## Data Flow
```
Zustand Store → SwipeLinkClient
                 ├── PropertyCarousel
                 ├── PropertyModal
                 ├── BucketNavigation
                 └── Analytics Events
```

## Props
```typescript
interface SwipeLinkClientProps {
  linkCode: string               // Unique link identifier
  properties: Property[]         // Initial property list
  onAnalyticsEvent?: Function   // Analytics event handler
  className?: string            // Additional CSS classes
}
```

## State Management

### Zustand Store Integration
- **bucketCounts**: Property counts per bucket
- **currentBucket**: Active bucket selection
- **currentBucketProperties**: Properties in current bucket
- **initializeWithProperties**: Initial store setup
- **moveProperty**: Move property between buckets
- **getPropertiesForBucket**: Get property IDs for bucket
- **getPropertyFromCache**: Retrieve cached property

### Local State
- **currentIndex**: Current carousel position
- **selectedProperty**: Property for modal display
- **isModalOpen**: Modal visibility state
- **loading**: Loading state

## Key Features

### Bucket System
- 5 buckets: new_properties, liked, disliked, considering, schedule_visit
- Real-time count updates
- Property filtering by bucket
- Persistent state via Zustand

### Analytics Events
- `client_initialized`: Initial load
- `property_modal_opened`: Modal open
- `property_moved_to_bucket`: Bucket change
- `carousel_navigated`: Navigation
- `bucket_changed`: Bucket switch
- `property_modal_closed`: Modal close

### Empty States
- Custom icons per bucket
- Descriptive messages
- Navigation to browse properties
- Responsive design

## Usage Example

```tsx
import SwipeLinkClient from '@/components/client/SwipeLinkClient'

function ClientPage({ linkCode, properties }) {
  return (
    <SwipeLinkClient
      linkCode={linkCode}
      properties={properties}
      onAnalyticsEvent={trackEvent}
      className="custom-client"
    />
  )
}
```

## Component Dependencies
1. **PropertyCarousel**: Property display
2. **PropertyModal**: Detailed view
3. **BucketNavigation**: Bottom navigation
4. **Zustand Store**: State management

## Responsive Design
- Mobile-first approach
- Adaptive padding (pb-20 md:pb-8)
- Flexible layouts
- Touch-optimized interactions

## Performance Considerations
- Memoized callbacks with useCallback
- Efficient property filtering
- Optimized re-renders
- Lazy modal loading

## Known Issues
- **Line Count**: Exceeds 200-line limit (269 lines)
- Complex state management logic
- Needs component extraction

## Refactoring Plan
1. Extract EmptyState component
2. Extract ClientHeader component
3. Extract analytics logic to custom hook
4. Extract property filtering logic
5. Simplify main component to orchestrator only

## Testing Requirements
- [ ] Bucket navigation works correctly
- [ ] Properties filter by bucket
- [ ] Modal opens/closes properly
- [ ] Analytics events fire
- [ ] Empty states display
- [ ] State persists across navigation
- [ ] Carousel index resets on bucket change

## Accessibility Features
- Semantic HTML structure
- Keyboard navigation support
- Screen reader compatibility
- Focus management
- ARIA attributes

## Future Improvements
- Virtualized property lists
- Infinite scrolling
- Advanced filtering
- Batch operations
- Export functionality
- Share collections
- Comparison mode
- Map view integration

---
*Status: Needs Refactoring*
*Priority: HIGH*