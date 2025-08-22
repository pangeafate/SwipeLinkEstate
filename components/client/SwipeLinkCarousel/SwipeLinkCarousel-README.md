# SwipeLinkCarousel Component Module

## Purpose
Property carousel component with bucket management, session persistence, and responsive navigation for the SwipeLink platform.

## Current Status
⚠️ **WARNING**: This component exceeds the 200-line limit (257 lines). It needs to be refactored into smaller components.

## Architecture Position
Part of the client interface module, this component provides the main carousel experience with integrated bucket management.

## Module Structure
```
SwipeLinkCarousel/
├── index.tsx           # Main carousel component (257 lines)
├── PropertyCard.tsx    # Individual property card
├── PropertyModal.tsx   # Property detail modal
├── BucketNavigation.tsx # Bucket navigation tabs
└── types.ts           # Shared type definitions
```

## Functionality
- Horizontal scrolling carousel
- Bucket-based property organization
- Session storage persistence
- Property modal display
- Responsive navigation arrows
- Touch-friendly scrolling
- State management

## Data Flow
```
Properties Array → SwipeLinkCarousel
                    ├── State Management
                    ├── Session Storage
                    ├── PropertyCard (multiple)
                    ├── PropertyModal
                    └── BucketNavigation
```

## Props
```typescript
interface SwipeLinkCarouselProps {
  properties: Property[]    // Array of properties to display
  linkCode: string         // Unique link identifier
  className?: string       // Additional CSS classes
}
```

## State Management

### Carousel State
```typescript
interface CarouselState {
  properties: Property[]
  currentIndex: number
  selectedProperty: Property | null
  isModalOpen: boolean
  buckets: Record<BucketType, Bucket>
  activeBucket: BucketType
}
```

### Bucket System
- **new**: New/unviewed properties
- **liked**: Liked properties (❤️)
- **disliked**: Disliked properties (👎)
- **scheduled**: Visit scheduled (📅)

### Session Persistence
- Saves bucket state to sessionStorage
- Key format: `swipelink-${linkCode}`
- Restores state on component mount
- Persists across page refreshes

## Key Features

### Navigation
- Desktop arrow buttons (hidden on mobile)
- Smooth horizontal scrolling
- Touch-friendly on mobile
- Scroll by single card width

### Responsive Design
- **Mobile**: Full width cards
- **Tablet**: 2 cards (50% - 12px)
- **Desktop**: 4 cards (25% - 18px)
- Max card width: 343px

### Property Actions
- **like**: Move to liked bucket
- **dislike**: Move to disliked bucket
- **schedule**: Move to scheduled bucket
- **consider**: Keep in current bucket (marked)

## Usage Example

```tsx
import SwipeLinkCarousel from '@/components/client/SwipeLinkCarousel'

function PropertyBrowser() {
  return (
    <SwipeLinkCarousel
      properties={propertyList}
      linkCode="ABC123"
      className="my-carousel"
    />
  )
}
```

## Component Dependencies
1. **PropertyCard**: Individual card display
2. **PropertyModal**: Detailed property view
3. **BucketNavigation**: Bucket switching UI
4. **types**: Shared type definitions

## Styling Details
- **Gap**: 24px between cards
- **Arrow Size**: 32x32px circular
- **Arrow Offset**: -16px margin
- **Scroll Behavior**: Smooth
- **Scrollbar**: Hidden on all platforms

## Performance Optimizations
- Conditional arrow rendering (>4 properties)
- Efficient bucket filtering
- Optimized re-renders
- Session storage caching

## Known Issues
- **Line Count**: Exceeds 200-line limit (257 lines)
- Complex state management
- Needs component extraction

## Refactoring Plan
1. Extract state management to custom hook
2. Extract scroll logic to separate utility
3. Extract bucket management logic
4. Create separate NavigationArrows component
5. Simplify main component

## Accessibility Features
- Semantic HTML structure
- Aria labels for navigation
- Keyboard support
- Screen reader compatible
- Focus management

## Browser Compatibility
- Modern browsers with CSS Grid
- Safari requires -webkit prefixes
- Touch scrolling on mobile
- Session storage support required

## Testing Checklist
- [ ] Carousel scrolling works
- [ ] Bucket filtering correct
- [ ] Session persistence works
- [ ] Modal opens/closes
- [ ] Property actions update buckets
- [ ] Responsive breakpoints work
- [ ] Arrow navigation functions
- [ ] Empty state displays

## Future Improvements
- Virtual scrolling for large lists
- Swipe gestures for mobile
- Keyboard navigation
- Infinite scroll
- Lazy loading
- Animation transitions
- Drag and drop support
- Multi-select mode

---
*Status: Needs Refactoring*
*Priority: MEDIUM*