# AI Agent Implementation Plan - Real Estate Platform Prototype

## Project Overview for AI Agent

Build a prototype real estate platform with Airbnb-style carousel property browsing. The platform allows agents to create shareable links containing property collections that clients can browse using an intuitive horizontal carousel interface with button-based categorization and visit booking capabilities, all without authentication.

## Technology Stack

```yaml
Backend: Supabase
  - PostgreSQL database
  - Real-time subscriptions
  - Storage for images
  - Auto-generated APIs
  - Edge Functions

Frontend: Next.js 14 (App Router)
  - React 18
  - TypeScript
  - Tailwind CSS
  - embla-carousel-react (for Airbnb-style carousel)
  - Framer Motion (for animations)
  - Zustand (state management)
  - React Query (data fetching)

Deployment: Vercel
```

## Project Structure

```
real-estate-platform/
├── app/
│   ├── (agent)/
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── properties/
│   │   │   └── page.tsx
│   │   └── links/
│   │       └── page.tsx
│   ├── link/
│   │   └── [code]/
│   │       └── page.tsx
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── agent/
│   │   ├── PropertyCard.tsx
│   │   ├── LinkCreator.tsx
│   │   └── EngagementMetrics.tsx
│   ├── client/
│   │   ├── ClientLinkInterface.tsx
│   │   ├── PropertyCarousel.tsx
│   │   ├── PropertyCard.tsx
│   │   ├── PropertyModal.tsx
│   │   ├── BucketManager.tsx
│   │   ├── VisitBooking.tsx
│   │   └── CollectionOverview.tsx
│   └── shared/
│       ├── ImageGallery.tsx
│       └── LoadingStates.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── queries.ts
│   │   └── mutations.ts
│   └── utils/
│       ├── formatters.ts
│       └── validators.ts
├── stores/
│   ├── agentStore.ts
│   ├── linkStore.ts
│   ├── carouselStore.ts
│   ├── bucketStore.ts
│   └── bookingStore.ts
└── styles/
    └── globals.css
```

## Database Schema

```sql
-- Minimal schema for prototype
CREATE TABLE properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  address TEXT NOT NULL,
  price DECIMAL(12,2),
  bedrooms INTEGER,
  bathrooms DECIMAL(3,1),
  area_sqft INTEGER,
  description TEXT,
  features JSONB DEFAULT '[]',
  cover_image TEXT,
  images JSONB DEFAULT '[]',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT,
  property_ids JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

CREATE TABLE activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  link_id UUID REFERENCES links(id),
  property_id UUID REFERENCES properties(id),
  action TEXT CHECK (action IN ('view', 'like', 'dislike', 'consider', 'detail', 'book_visit', 'expand', 'assign_bucket')),
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  link_id UUID REFERENCES links(id),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_active TIMESTAMPTZ DEFAULT NOW(),
  device_info JSONB
);
```

## Module 1: Property Management

### Functions to Implement

```yaml
PropertyService:
  - getAllProperties()
    Returns: Array of properties with images
    Purpose: Display in agent dashboard
  
  - getProperty(id)
    Returns: Single property with all details
    Purpose: View/edit property
  
  - createProperty(data)
    Input: Property details + images
    Returns: Created property
    Purpose: Add new property
  
  - updateProperty(id, data)
    Input: Property ID and updates
    Returns: Updated property
    Purpose: Edit existing property
  
  - togglePropertyStatus(id)
    Input: Property ID
    Action: Toggle active/off-market
    Purpose: Mark property availability
  
  - uploadPropertyImages(propertyId, files)
    Input: Property ID and image files
    Returns: Image URLs
    Purpose: Add photos to property
```

### UI Components

```yaml
PropertyCard:
  Visual: 
    - 3:2 aspect ratio image
    - Price badge (top-right corner)
    - Address and key stats below
    - Status indicator (dot)
  States:
    - Default (white background)
    - Selected (blue border)
    - Off-market (grayed out)
  Actions:
    - Click to select/deselect
    - Edit button (hover state)

PropertyGrid:
  Layout: Responsive grid
    - Mobile: 1 column
    - Tablet: 2 columns
    - Desktop: 3-4 columns
  Features:
    - Select multiple with checkboxes
    - Bulk actions bar when items selected
    - Search/filter bar at top

PropertyDetailModal:
  Sections:
    - Image gallery (swipeable)
    - Price and address
    - Features grid
    - Description
    - Action buttons
```

## Module 2: Link Management

### Functions to Implement

```yaml
LinkService:
  - createLink(propertyIds, name)
    Input: Array of property IDs, optional name
    Returns: Link object with unique code
    Purpose: Generate shareable link
    Logic: Generate 8-character alphanumeric code
  
  - getAgentLinks()
    Returns: Array of links with metrics
    Purpose: Show in dashboard
  
  - getLink(code)
    Input: Link code from URL
    Returns: Link with properties
    Purpose: Load for client view
  
  - getLinkAnalytics(linkId)
    Input: Link ID
    Returns: Engagement metrics
    Purpose: Show performance
  
  - copyLinkUrl(code)
    Input: Link code
    Action: Copy URL to clipboard
    Purpose: Share with client
```

### UI Components

```yaml
LinkCreator:
  Step 1: Property Selection
    - Show property grid
    - Multi-select with checkboxes
    - Selected count badge
    - "Next" button
  
  Step 2: Link Details
    - Name input (optional)
    - Expiration date (optional)
    - Preview selected properties
    - "Create Link" button
  
  Step 3: Success Screen
    - Generated link URL
    - Copy button (with success feedback)
    - QR code display
    - "Create Another" button

LinkCard:
  Visual:
    - Link name/code
    - Created date
    - Property count badge
    - Engagement metrics (views, likes)
    - Mini property previews (3 images)
  Actions:
    - Copy link
    - View analytics
    - Edit properties
```

## Module 3: Client Link Interface (Airbnb-Style Carousel)

### Functions to Implement

```yaml
CarouselService:
  - initializeSession(linkCode)
    Input: Link code from URL
    Returns: Session ID, properties array
    Purpose: Start client session
    Side effect: Create session record
  
  - handleAction(action, propertyId, sessionId)
    Input: action type (like/dislike/consider), property ID, session
    Action: Record activity
    Purpose: Track engagement
    Returns: Updated bucket state
  
  - getBucketState(sessionId)
    Returns: Current buckets state
    Purpose: Show liked/disliked/considering
  
  - resetProperty(propertyId, sessionId)
    Input: Property ID to reset
    Action: Remove from buckets
    Purpose: Undo action
  
  - getPropertyDetails(propertyId)
    Returns: Full property details
    Purpose: Show on expand click
```

### UI Components

```yaml
ClientLinkInterface:
  Layout:
    - Responsive grid system
    - Collection overview header
    - Carousel-based property browsing
    - Modal-based expanded views
  
  Structure:
    ┌────────────────────────────────────┐
    │  Agent Info | Collection Title  │ <- Header
    │  12 Properties | $300K-$2M      │
    ├────────────────────────────────────┤
    │  [<] [┌───────────┐] [>]       │ <- Carousel
    │      │  Property  │             │
    │      │    Card     │             │
    │      │  [❤️][📝][X]  │             │
    │      └───────────┘             │
    │  • • • ● • • • •               │ <- Position
    ├────────────────────────────────────┤
    │ Liked(3) | Considering(2) | All │ <- Buckets
    └────────────────────────────────────┘

PropertyCard (Airbnb-Style):
  Visual Design:
    - Card shadow: 0 4px 6px rgba(0,0,0,0.1)
    - Border radius: 12px
    - Background: white
    - Image aspect ratio: 16:9
    - Content padding: 16px
  
  Compact Card Structure:
    - Hero image with image counter badge
    - Price tag (prominent)
    - Address (truncated)
    - Key stats (beds, baths, sqft)
    - Action buttons (like, consider, dislike, details)
    - Clear button labels and hover states
  
  Expanded Modal Structure:
    - Full-screen overlay
    - Image gallery with thumbnails
    - Complete property details
    - Interactive map
    - Visit booking interface
    - Agent notes section
    - Related properties
  
  Interactions:
    - Click/tap to expand
    - Smooth carousel navigation
    - Button hover states
    - Loading states for images

BucketManager:
  Visual:
    - Tab-based navigation bar
    - Badge counters for each bucket
    - Color-coded bucket indicators
    - Smooth transitions between views
  
  Bucket Categories:
    - Liked (heart icon, red)
    - Considering (bookmark, amber)
    - Disliked (x icon, gray)
    - Booked Visits (calendar, green)
  
  Bucket Views:
    - Grid layout (responsive columns)
    - Property cards with key info
    - Drag & drop between buckets
    - Sort and filter options
    - Bulk actions support
    - Download/share bucket summary
```

### Carousel & Interaction Configuration

```yaml
Carousel Settings:
  - Navigation: Horizontal scroll, click arrows, keyboard
  - Snap points: Each property card
  - Transition duration: 300ms ease-out
  - Preload: Next 2-3 properties
  - Loop: Optional end-to-end navigation
  - Smooth scrolling: Enabled on all devices
  
Interaction Patterns:
  - Desktop: Click arrows, horizontal scroll, keyboard
  - Mobile: Horizontal swipe, tap navigation
  - Tablet: Hybrid touch and precision
  - Accessibility: Full keyboard support
  
Performance:
  - Lazy loading images
  - Progressive enhancement
  - Smooth 60fps animations
  - Optimistic UI updates
```

## Module 4: Analytics Dashboard

### Functions to Implement

```yaml
AnalyticsService:
  - getLinkMetrics(linkId)
    Returns: {views, uniqueVisitors, totalSwipes, breakdown}
    Purpose: Show engagement summary
  
  - getPropertyMetrics(linkId)
    Returns: Array of {property, views, likes, dislikes}
    Purpose: Show per-property performance
  
  - getSessionTimeline(linkId)
    Returns: Array of sessions with activities
    Purpose: Show engagement timeline
  
  - getRealtimeActivity()
    Returns: Live activity stream
    Purpose: Show current users
    Implementation: Supabase subscription
```

### UI Components

```yaml
EngagementDashboard:
  Layout: Grid of metric cards
  
  MetricCard Types:
    - Big Number (views, likes)
    - Percentage (engagement rate)
    - Timeline chart (activity over time)
    - Property ranking (most liked)
  
  Visual Style:
    - White cards with subtle shadow
    - Colored accent for metrics
    - Smooth number animations
    - Live indicator for real-time data

ActivityFeed:
  Format: Timeline
  Entry Types:
    - "Client viewed link" (gray)
    - "Property liked" (green)
    - "Property disliked" (red)
    - "Considering property" (blue)
  Real-time: New items slide in from top
```

## Visual Design System

### Color Palette

```yaml
Primary:
  - Blue: #3B82F6 (primary actions)
  - Blue Light: #93C5FD (hover states)
  - Blue Dark: #1E40AF (active states)

Semantic:
  - Green: #10B981 (like/success)
  - Red: #EF4444 (dislike/error)
  - Orange: #F59E0B (consider)
  - Purple: #8B5CF6 (details/special)

Neutral:
  - Gray 900: #111827 (text)
  - Gray 600: #4B5563 (secondary text)
  - Gray 300: #D1D5DB (borders)
  - Gray 100: #F3F4F6 (backgrounds)
  - White: #FFFFFF (cards)

Shadows:
  - sm: 0 1px 2px rgba(0,0,0,0.05)
  - md: 0 4px 6px rgba(0,0,0,0.07)
  - lg: 0 10px 15px rgba(0,0,0,0.1)
  - xl: 0 20px 40px rgba(0,0,0,0.15)
```

### Typography

```yaml
Font Family: 
  - Headers: Inter or system-ui
  - Body: Inter or system-ui

Font Sizes:
  - xs: 12px
  - sm: 14px
  - base: 16px
  - lg: 18px
  - xl: 20px
  - 2xl: 24px
  - 3xl: 30px
  - 4xl: 36px

Font Weights:
  - normal: 400
  - medium: 500
  - semibold: 600
  - bold: 700
```

### Spacing System

```yaml
Base: 4px
Scale:
  - 1: 4px
  - 2: 8px
  - 3: 12px
  - 4: 16px
  - 5: 20px
  - 6: 24px
  - 8: 32px
  - 10: 40px
  - 12: 48px
  - 16: 64px
```

### Component Patterns

```yaml
Cards:
  - Background: white
  - Border radius: 12px
  - Padding: 20px
  - Shadow: shadow-md
  - Hover: shadow-lg transition

Buttons:
  Primary:
    - Background: blue-600
    - Text: white
    - Padding: 12px 24px
    - Border radius: 8px
    - Hover: blue-700
  
  Secondary:
    - Background: gray-100
    - Text: gray-900
    - Border: 1px gray-300
    - Hover: gray-200

Forms:
  - Input border: gray-300
  - Focus ring: blue-500
  - Border radius: 6px
  - Padding: 10px 12px
  - Error state: red-500 border

Mobile First:
  - Touch targets: min 44x44px
  - Gesture areas: generous padding
  - Font size: min 16px (prevent zoom)
  - Contrast ratio: min 4.5:1
```

## Implementation Order

### Phase 1: Setup (Day 1)

1. Initialize Next.js project with TypeScript
2. Set up Supabase project
3. Create database schema
4. Configure Tailwind CSS
5. Install required packages
6. Set up project structure

### Phase 2: Agent Backend (Days 2-3)

1. Implement PropertyService functions
2. Create property management API routes
3. Build PropertyCard component
4. Build PropertyGrid component
5. Seed database with demo properties (10-15)

### Phase 3: Link System (Days 4-5)

1. Implement LinkService functions
2. Build LinkCreator component
3. Create link generation flow
4. Build link sharing UI
5. Test link creation and copying

### Phase 4: Client Link Interface (Days 6-8)

1. Implement CarouselService functions
2. Install and configure embla-carousel-react
3. Build PropertyCarousel component (Airbnb-style)
4. Build PropertyCard component with action buttons
5. Implement PropertyModal for expanded view
6. Build BucketManager component
7. Add VisitBooking system
8. Build CollectionOverview
9. Test responsive design on all devices

### Phase 5: Analytics (Days 9-10)

1. Implement AnalyticsService functions
2. Build dashboard components
3. Add real-time subscriptions
4. Create activity feed
5. Polish animations

### Phase 6: Polish & Deploy (Days 11-12)

1. Add loading states
2. Add error handling
3. Polish animations
4. Mobile optimization
5. Deploy to Vercel
6. Test complete flow

## Key Implementation Notes for AI

### Critical Success Factors

1. **Mobile-First**: Test everything on mobile first
2. **Carousel Performance**: Must be smooth, < 16ms per frame
3. **Image Optimization**: Use Next.js Image component, lazy load
4. **Real-time Updates**: Use Supabase subscriptions for live data
5. **Error States**: Always handle loading and error states
6. **Accessibility**: Ensure WCAG 2.1 AA compliance
7. **Progressive Enhancement**: Core functionality works without JavaScript

### Common Pitfalls to Avoid

1. Don't fetch all properties at once - paginate
2. Preload next 2-3 property images in carousel
3. Use optimistic updates for bucket assignments
4. Debounce real-time updates to prevent flicker
5. Test on slow 3G to ensure good experience
6. Ensure touch targets are at least 44x44px
7. Implement proper focus management for modals

### Demo Data Requirements

- 10-15 high-quality property photos per property
- Variety of price ranges ($300k - $2M)
- Mix of property types (condos, houses, luxury)
- Professional photography (use Unsplash if needed)
- Realistic descriptions and features

### Performance Targets

- Initial load: < 2 seconds  
- Carousel navigation: < 100ms
- Modal open/close: < 250ms
- Image load: < 1 second
- Link generation: < 500ms
- Analytics update: < 2 seconds
- Bucket assignment: < 50ms feedback

## Testing Checklist

### Functional Tests

- [ ] Properties display correctly
- [ ] Link generation works
- [ ] Link copying works
- [ ] Carousel navigation smooth
- [ ] Property expansion works
- [ ] Bucket assignments persist
- [ ] Visit booking functional
- [ ] Analytics track accurately
- [ ] Images load progressively
- [ ] Mobile responsive design

### User Experience Tests

- [ ] Carousel navigation intuitive
- [ ] Visual feedback is clear
- [ ] Loading states present
- [ ] Error messages helpful
- [ ] Touch gestures work
- [ ] Keyboard navigation works
- [ ] Modal transitions smooth
- [ ] Bucket management easy
- [ ] Analytics are real-time
- [ ] Copy feedback works

## Success Metrics

The prototype is successful when:

1. Client can browse properties via Airbnb-style horizontal carousel
2. Property details are easily accessible via expand button
3. Button-based categorization helps decision-making  
4. Visit booking converts interest to action
5. Engagement is tracked accurately
6. Agent receives meaningful insights
7. Works perfectly on all devices
8. Loads in under 2 seconds
9. Accessible to all users
10. Zero authentication friction for clients
11. Clear value proposition in 30 seconds