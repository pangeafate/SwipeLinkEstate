# Link Page Module

## Purpose
Server-rendered page for displaying property collections via shareable links. Implements the core "Tinder for Real Estate" swipe experience with SSR/ISR for optimal performance.

## Architecture Context
Part of the client-facing link experience. Follows Next.js 14 App Router patterns with server/client component separation for optimal performance and SEO.

## Core Functionality
- **Server-side data fetching** with ISR (1-hour revalidation)
- **Session management** for tracking client interactions
- **Property carousel** with swipe/bucket functionality
- **Analytics tracking** for engagement metrics
- **Completion summary** with preference breakdown

## Module Structure
```
app/link/[code]/
├── page.tsx                  # Route entry point (12 lines)
├── page.server.tsx          # SSR/ISR wrapper (91 lines)
├── ClientLinkView.tsx       # Client component (151 lines)
├── hooks/
│   └── useSwipeSession.ts   # Session management (173 lines)
└── components/
    ├── LoadingView.tsx      # Loading state (14 lines)
    ├── ErrorView.tsx        # Error state (34 lines)
    ├── EmptyView.tsx        # Empty state (35 lines)
    └── CompletionView.tsx   # Completion summary (89 lines)
```

## Key Dependencies
- `@/components/link` - Link service for data fetching
- `@/components/client` - PropertyCarousel and PropertyModal
- `@/lib/analytics` - Analytics tracking service
- `next/navigation` - Next.js routing utilities

## Data Flow
1. **Server Component** (`page.server.tsx`)
   - Fetches link data at request time
   - Validates link status and expiration
   - Generates stable session ID
   - Passes hydrated props to client

2. **Client Component** (`ClientLinkView.tsx`)
   - Manages UI state (current index, buckets)
   - Renders property carousel
   - Handles modal interactions
   - Shows completion summary

3. **Session Hook** (`useSwipeSession.ts`)
   - Initializes analytics session
   - Tracks property views and interactions
   - Updates session activity periodically
   - Completes session on finish

## Component Boundaries
- **Server**: Data fetching, validation, session generation
- **Client**: User interactions, state management, tracking
- **Hook**: Analytics and session lifecycle
- **UI Components**: Presentational, stateless views

## Testing Approach
```typescript
// Test server component data fetching
describe('LinkPage Server', () => {
  it('fetches and validates link data')
  it('handles expired links')
  it('generates session ID')
})

// Test client interactions
describe('ClientLinkView', () => {
  it('renders property carousel')
  it('handles bucket assignments')
  it('shows completion summary')
})

// Test session management
describe('useSwipeSession', () => {
  it('initializes analytics session')
  it('tracks property interactions')
  it('completes session on finish')
})
```

## Performance Optimizations
- **ISR** with 1-hour revalidation for fresh data
- **Server-side session ID** generation for consistency
- **Lazy loading** of modal component
- **Debounced** activity tracking (30s intervals)

## Error Handling
- Invalid link codes → 404 page
- Expired links → Error message with agent contact
- Failed analytics → Silent failure with console logging
- Network errors → User-friendly error view

## Future Enhancements
- [ ] Implement visit booking functionality
- [ ] Add property comparison view
- [ ] Support link password protection
- [ ] Add social sharing for liked properties
- [ ] Implement progressive enhancement for no-JS