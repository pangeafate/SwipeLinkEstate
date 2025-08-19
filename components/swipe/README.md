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
├── index.ts          # Public exports only
├── types.ts          # TypeScript interfaces
├── swipe.service.ts  # Business logic
├── components/       # UI components
│   ├── SwipeInterface.tsx
│   ├── PropertySwipeCard.tsx
│   ├── BucketBar.tsx
│   └── SwipeGestures.tsx
└── __tests__/       # Module tests
```

## State Management
Uses React Query for server state and local React state for swipe animations and gestures.

## Performance Considerations
- Preloads next 2-3 property cards for smooth animations
- Optimistic UI updates for swipe actions
- Image optimization with Next.js Image component
- Gesture throttling to prevent rapid swipes