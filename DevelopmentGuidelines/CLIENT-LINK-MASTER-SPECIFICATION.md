# CLIENT-LINK MASTER SPECIFICATION
## SwipeLink Estate Client Interface - Comprehensive Design & Implementation Guide
*Reconciled from: CLIENT-LINK-DESIGN-250821.md, VISUAL-DESIGN-GUIDELINES-CLIENTLINK-250821.md, and CLIENT-LINK-MASTER-SPECIFICATION.md*

---

## 1. Executive Overview

### 1.1 Core Philosophy: Airbnb-Style Property Discovery

The SwipeLink Estate Client Link Interface provides a sophisticated **Airbnb-style horizontal carousel** experience for property browsing. This interface serves as the primary touchpoint between agents and their clients, transforming shared property collections into engaging, visually-driven browsing sessions that capture meaningful client preferences through explicit actions rather than gestures.

**Fundamental Concept**: Transform property browsing from gesture-based interactions to a **photography-first carousel experience** with explicit bucket organization, following Airbnb's proven design patterns for trust and engagement.

### 1.2 Critical Design Decision: Complete Abandonment of Tinder Patterns

#### What We're NOT Doing:
- ❌ **NO card stacks** (cards never overlap)
- ❌ **NO swipe left/right decisions** (only horizontal scroll)
- ❌ **NO rotation or tilt** during any interaction
- ❌ **NO cards flying off screen**
- ❌ **NO spring-back animations**
- ❌ **NO velocity-based gestures**
- ❌ **NO binary yes/no mechanic**

#### What We ARE Doing:
- ✅ **Horizontal scrolling carousel** (like Airbnb listings)
- ✅ **Single row of cards** (1 on mobile, 3-4 on desktop)
- ✅ **Tap to expand** for full details
- ✅ **Explicit buttons** for all actions
- ✅ **Dot indicators** for position
- ✅ **Smooth momentum scrolling**
- ✅ **Photography-first design**

### 1.3 Design Principles

1. **NO Tinder Mechanics** - Horizontal carousel, not card stacks
2. **Explicit Actions Only** - Buttons for all decisions, no swipe gestures
3. **Photography-First** - 70% image, 30% content ratio
4. **Progressive Disclosure** - Information revealed in layers
5. **Mobile-First Responsive** - Optimized for 375px baseline

### 1.4 Implementation Philosophy

1. **Mobile-First Development**: Start with 375px viewport, scale up
2. **Progressive Enhancement**: Core functionality works without JavaScript
3. **Performance Obsessed**: Sub-2-second load times
4. **Accessibility Complete**: WCAG 2.1 AA compliance
5. **Single Experience**: Consistent Airbnb-style interaction throughout

---

## 2. User Experience Journey

### 2.1 Complete User Flow

1. **Link Access** → Client receives and opens shared property link
2. **Collection Overview** → Client sees agent info and property summary
3. **Carousel Browsing** → Client scrolls horizontally through properties
4. **Property Expansion** → Client taps for full details and gallery
5. **Bucket Assignment** → Client uses buttons to categorize (Love/Maybe/Pass/Book)
6. **Visit Booking** → Client schedules viewings from interface
7. **Review Organization** → Client reviews bucketed properties
8. **Session Completion** → Organized preferences ready for agent

### 2.2 Interaction Patterns

#### Supported Interactions (Mobile)
- **Horizontal Scroll**: Navigate carousel
- **Tap**: Expand card or trigger actions
- **Pinch**: Zoom images in gallery
- **Long Press**: NO ACTION (not used)

#### Explicitly Removed Interactions
- **Swipe for Decisions**: REMOVED
- **Card Rotation**: REMOVED
- **Drag to Reorder**: REMOVED
- **Shake**: REMOVED

### 2.3 Engagement Metrics
- **Carousel Completion**: >60% view all properties
- **Card Expansion Rate**: >40% tap for details
- **Bucket Assignment**: >65% categorize properties
- **Session Duration**: >8 minutes average

---

## 3. Visual Design System

### 3.1 Color System: Airbnb-Inspired Trust Palette

#### Primary Palette
```css
:root {
  /* Primary Colors */
  --color-primary: #FF5A5F;        /* Airbnb coral */
  --color-primary-dark: #E04E52;   /* Pressed state */
  --color-primary-light: #FFE5E6;  /* Backgrounds */

  /* Text Colors */
  --color-text-primary: #222222;   /* Main text */
  --color-text-secondary: #767676; /* Supporting text */
  --color-text-tertiary: #B0B0B0;  /* Disabled text */

  /* Background Colors */
  --color-bg-primary: #FFFFFF;     /* Cards */
  --color-bg-secondary: #F7F7F7;   /* Page background */
  --color-bg-elevated: #FFFFFF;    /* Modals */
  --color-border: #EBEBEB;         /* Subtle borders */

  /* Semantic Colors */
  --color-success: #00A699;        /* Booked/Success */
  --color-warning: #FFC107;        /* Considering */
  --color-error: #E04E52;          /* Errors */
  --color-info: #2196F3;           /* Information */
}
```

#### Semantic Colors for Buckets
```css
:root {
  /* Bucket System Colors */
  --bucket-like: #FF5A5F;     /* Heart - Interested */
  --bucket-consider: #FFC107; /* Bookmark - Maybe */
  --bucket-pass: #9E9E9E;     /* X - Not interested */
  --bucket-book: #2196F3;     /* Calendar - Schedule */
}
```

#### Dark Mode Support
```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg-primary: #1E1E1E;
    --color-bg-secondary: #121212;
    --color-text-primary: #F5F5F5;
    --color-text-secondary: #B0B0B0;
    /* Reduce image brightness by 10% */
    /* Desaturate colors by 20% */
  }
}
```

### 3.2 Typography System: Clean and Readable

#### Font Stack
```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, 
             "Helvetica Neue", Arial, sans-serif;
```

#### Mobile Type Scale
```css
/* Mobile Typography */
.typography-price-hero {
  font-size: 24px;
  font-weight: 700;
  line-height: 28px;
  letter-spacing: -0.5px;
}

.typography-card-title {
  font-size: 14px;
  font-weight: 500;
  line-height: 18px;
}

.typography-location {
  font-size: 12px;
  font-weight: 400;
  line-height: 16px;
  color: var(--color-text-secondary);
}

.typography-details {
  font-size: 12px;
  font-weight: 400;
  line-height: 16px;
}

.typography-button {
  font-size: 14px;
  font-weight: 600;
  line-height: 18px;
  text-transform: none; /* No uppercase */
}

.typography-caption {
  font-size: 11px;
  font-weight: 400;
  line-height: 14px;
}
```

### 3.3 Spacing System (8-Point Grid)

```css
:root {
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-2xl: 48px;
}
```

### 3.4 Component Design Tokens

```css
:root {
  /* Border Radius */
  --radius-card: 12px;
  --radius-button: 8px;
  --radius-image: 12px;

  /* Shadows */
  --shadow-card: 0 2px 4px rgba(0,0,0,0.08);
  --shadow-elevated: 0 4px 16px rgba(0,0,0,0.12);

  /* Transitions */
  --transition-page: 300ms ease-out;
  --transition-card: 100ms ease-out;
  --transition-button: 50ms ease-out;
}
```

---

## 4. Interface Architecture

### 4.1 Mobile Viewport Structure (375px x 812px baseline)

```
┌─────────────────────────────────┐
│  STATUS BAR                     │ 44px
├─────────────────────────────────┤
│  HEADER                         │ 56px
├─────────────────────────────────┤
│  COLLECTION SUMMARY             │ 120px
├─────────────────────────────────┤
│  PROPERTY CAROUSEL              │ 420px
├─────────────────────────────────┤
│  BUCKET NAVIGATION              │ 80px
├─────────────────────────────────┤
│  BOTTOM SAFE AREA               │ 34px
└─────────────────────────────────┘
```

### 4.2 Component Specifications

- **Container Width**: 375px - 32px padding = 343px usable
- **Spacing Grid**: 8-point system (8px, 16px, 24px, 32px)
- **Border Radius**: 12px for cards, 8px for buttons
- **Shadows**: 0 2px 4px rgba(0,0,0,0.08) for elevation

### 4.3 Collection Summary Component

```
Collection Summary Structure:
├── Agent Photo (56x56px circle)
├── Agent Name (14px medium, #222222)
├── Agent Title (12px regular, #767676)
├── Property Stats (12px regular, #222222)
│   ├── Total Count
│   ├── Price Range
│   └── Property Types
└── Progress Bar (4px height, #FF5A5F fill)
```

#### Visual Design
- **Background**: #F7F7F7
- **Padding**: 16px internal
- **Height**: 88px + 16px margins = 120px total
- **Border**: None (background contrast only)

---

## 5. Property Card System

### 5.1 Card Anatomy: 70-30 Visual Distribution

The optimal property card structure allocates **70% to hero imagery** and **30% to content and actions**. This creates an image-first experience following Airbnb's proven patterns.

#### Mobile Card Specifications (343x380px)

```
┌─────────────────────────────────┐
│                                 │
│         HERO IMAGE              │ 257px (70%)
│         (3:2 ratio)             │
│                                 │
│  ❤️                    📷 1/24   │ Overlays
│  $650,000                       │ Price badge
├─────────────────────────────────┤
│ Downtown Miami, Florida         │ 123px (30%)
│ Modern 2BR Waterfront Condo     │
│ 2 beds • 2 baths • 1,450 sqft  │
└─────────────────────────────────┘
```

**Hero Image Zone (257px height)**
- Aspect ratio: **3:2** (343x257px on mobile)
- Gradient overlay: `linear-gradient(180deg, transparent 0%, transparent 50%, rgba(0,0,0,0.4) 100%)`
- Border radius: 12px top corners
- Image quality: 85% JPEG or WebP with fallback

**Price Badge Positioning**
- Position: Bottom-left, 12px inset
- Background: `rgba(0,0,0,0.8)`
- Typography: **24px bold** white (#FFFFFF)
- Padding: 6px 10px
- Border radius: 4px
- NO "per month" text - just clean price

**Wishlist Button**
- Position: Top-right, 12px inset
- Size: **32x32px** circle
- Background: `rgba(0,0,0,0.6)` default, `#FF5A5F` when liked
- Icon: 18x18px heart outline/filled
- Tap target: **44x44px** (transparent padding)

**Content Zone (123px height)**
- Padding: 12px all sides
- Background: #FFFFFF
- Border radius: 12px bottom corners
- Typography hierarchy:
  - Location: **12px regular #767676**
  - Title: **14px medium #222222** (max 2 lines)
  - Details: **12px regular #767676**

#### Desktop Adaptation
```
Desktop Card (300x350px):
├── Display: 3-4 cards visible
├── Gap: 24px between cards
├── Navigation: Arrow buttons + keyboard
├── Hover: Subtle elevation change
└── Click: Expands to detail view
```

### 5.2 Image System

#### Image Specifications
- **Aspect Ratio**: 3:2 (343x257px on mobile)
- **Formats**: WebP/AVIF with JPEG fallback
- **Loading**: Lazy loading with skeleton screens
- **CDN**: Optimized delivery with responsive images

#### Image Optimization
```typescript
const imageRatio = {
  mobile: { width: 343, height: 257 },
  tablet: { width: 400, height: 300 },
  desktop: { width: 300, height: 225 }
};
```

---

## 6. Carousel Navigation System

### 6.1 Mobile Carousel Behavior

```
Mobile Carousel Specifications:
├── Display: 1 card at a time (full width)
├── Peek: None on mobile
├── Scroll: Horizontal, smooth, momentum
├── Snap: Mandatory center alignment
├── Indicators: Dots below (6px inactive, 8px active)
└── Touch: Scroll only, NO decision gestures
```

### 6.2 Navigation Controls

#### Dot Indicators
- **Inactive**: 6px diameter, #B0B0B0
- **Active**: 8px diameter, #FF5A5F
- **Spacing**: 8px between dots
- **Position**: Below carousel, centered

#### Arrow Navigation (Desktop)
- **Size**: 48x48px touch targets
- **Position**: Overlay on carousel sides
- **Visibility**: Show on hover
- **Keyboard**: Arrow keys, Home/End support

### 6.3 Performance Requirements

```
Animation Specifications:
├── Scroll Smoothness: 60fps minimum
├── Snap Duration: 300ms ease-out
├── Touch Response: <16ms
├── Momentum Scrolling: Native iOS/Android
└── NO rotation or fly-away animations
```

### 6.4 Enhanced Interaction Patterns

#### Supported Touch Interactions (Mobile)
- **Horizontal Scroll**: Navigate carousel
- **Tap**: Expand card or trigger actions
- **Pinch**: Zoom images in gallery
- **Long Press**: NO ACTION (not used)

#### Explicitly Removed Interactions
- **Swipe for Decisions**: REMOVED
- **Card Rotation**: REMOVED
- **Drag to Reorder**: REMOVED
- **Shake**: REMOVED

#### Animation Guidelines: Subtle and Smooth

**Approved Animations:**
```css
/* Page transitions */
.slide-up {
  animation: slideUp 300ms ease-out;
}

/* Button feedback */
.button-press {
  transform: scale(0.95);
  transition: transform 100ms ease-out;
}

/* Card hover (desktop) */
.card-hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  transition: box-shadow 200ms ease-out;
}
```

**Banned Animations:**
```css
/* NO rotation on swipe */
/* NO fly-away on decision */
/* NO spring-back physics */
/* NO card stacking animations */
/* NO velocity-based movements */
```

#### Loading States
```
Skeleton Screen:
├── Background: #F0F0F0
├── Animation: Shimmer 1.5s
├── Direction: Left to right
└── Stagger: 100ms between cards
```

---

## 7. Bucket Management System

### 7.1 Bucket Types & Colors

```typescript
interface BucketSystem {
  love: {
    color: '#FF5A5F',
    icon: '❤️',
    label: 'Love'
  },
  maybe: {
    color: '#FFC107', 
    icon: '🔖',
    label: 'Maybe'
  },
  pass: {
    color: '#767676',
    icon: '❌', 
    label: 'Pass'
  },
  book: {
    color: '#00A699',
    icon: '📅',
    label: 'Book Tour'
  }
}
```

### 7.2 Action Overlay System

#### Mobile Action Overlay (Appears on Card Tap)
```
┌─────────────────────────────────┐
│  ┌────┬────┬────┬────┐         │
│  │ ❌ │ 🔖 │ ❤️ │ 📅 │         │
│  └────┴────┴────┴────┘         │
└─────────────────────────────────┘

Button Specifications:
├── Size: 56x56px touch target
├── Icon: 24x24px centered
├── Margin: 4px between buttons
├── Animation: Scale(0.95) on press
└── Feedback: Color fill + haptic
```

### 7.3 Bucket Navigation Bar

#### Fixed Bottom Navigation
```
Bucket Navigation Specifications:
├── Height: 80px total
├── Tabs: 4 equal sections
├── Icons: 24x24px
├── Count: 14px bold
├── Active: 2px top border #FF5A5F
└── Background: #FFFFFF with shadow
```

---

## 8. Property Expansion Modal

### 8.1 Full-Screen Modal Structure

```
Expanded View Components:
├── Header (56px)
│   ├── Back Button (44x44px)
│   ├── Property Title (truncated)
│   └── Share Button (44x44px)
├── Image Gallery (40% screen height)
│   ├── Swipeable Images
│   ├── Dot Indicators
│   └── Photo Count (1/12)
├── Content Scroll Area
│   ├── Price & Location
│   ├── Property Description
│   ├── Amenities Grid
│   ├── Interactive Map
│   └── Similar Properties
└── Fixed Action Bar (80px)
    ├── Message Agent Button
    └── Book Tour Button
```

### 8.2 Gallery Implementation

#### Image Gallery Specifications
- **Carousel**: Horizontal swipe navigation
- **Indicators**: Dot pagination below
- **Zoom**: Pinch-to-zoom support
- **Count**: Current/Total display
- **Performance**: Lazy load adjacent images

### 8.3 Action Bar

#### Fixed Bottom Actions
- **Message Agent**: Primary button style
- **Book Tour**: Secondary button style
- **Height**: 80px with safe area
- **Spacing**: 16px padding, 12px gap

---

## 9. Technical Implementation

### 9.1 Technology Stack

```json
{
  "framework": "Next.js 14 (App Router)",
  "language": "TypeScript",
  "styling": "CSS Modules + CSS Custom Properties",
  "carousel": "Embla Carousel React",
  "state": "Zustand",
  "data": "TanStack Query + Supabase",
  "images": "Next.js Image with CDN optimization",
  "testing": "Jest + React Testing Library + Playwright"
}
```

### 9.1b Progressive Disclosure: Three Information Layers

#### Layer 1: Card View
- Hero image (70% of card)
- Price prominently displayed
- Location (neighborhood only)
- Basic stats (beds/baths/sqft)
- Wishlist button

#### Layer 2: Expanded Preview (Bottom Sheet)
- Additional photos (swipeable gallery)
- Full property description (200 chars)
- Complete amenities list
- Map preview
- Agent notes
- Quick action buttons

#### Layer 3: Full Details (Modal)
- All photos with zoom capability
- Complete description
- Interactive map with POIs
- Neighborhood information
- Price history
- Virtual tour (if available)
- Schedule viewing interface

### 9.1c Required Component Libraries

```json
{
  "dependencies": {
    "embla-carousel-react": "^7.0.0",
    "framer-motion": "^10.0.0",
    "react-intersection-observer": "^9.0.0",
    "@radix-ui/react-dialog": "^1.0.0"
  }
}
```

### 9.2 Component Architecture

```
components/
├── ClientLink/
│   ├── index.tsx                # Main container
│   ├── MobileLayout.tsx         # Mobile-specific layout
│   ├── DesktopLayout.tsx        # Desktop adaptation
│   ├── PropertyCarousel/
│   │   ├── index.tsx            # Carousel container
│   │   ├── PropertyCard.tsx     # Card component
│   │   ├── CardImage.tsx        # Optimized images
│   │   ├── CardContent.tsx      # Text content
│   │   └── DotIndicators.tsx    # Navigation dots
│   ├── BucketSystem/
│   │   ├── BucketManager.tsx    # State management
│   │   ├── BucketNavigation.tsx # Bottom tabs
│   │   ├── ActionOverlay.tsx    # Action buttons
│   │   └── BucketView.tsx       # Bucket contents
│   └── PropertyModal/
│       ├── index.tsx            # Modal container
│       ├── ImageGallery.tsx     # Photo gallery
│       ├── PropertyDetails.tsx  # Content sections
│       └── ActionBar.tsx        # Bottom actions
```

### 9.3 State Management

```typescript
// Zustand Store Structure
interface ClientLinkState {
  // Link Data
  linkData: Link | null;
  properties: Property[];
  currentIndex: number;
  
  // Bucket Management
  buckets: {
    love: string[];
    maybe: string[];
    pass: string[];
    book: string[];
  };
  
  // UI State
  expandedProperty: Property | null;
  showActionOverlay: boolean;
  activeBucket: BucketType;
  
  // Actions
  assignToBucket: (propertyId: string, bucket: BucketType) => void;
  expandProperty: (property: Property) => void;
  setCurrentIndex: (index: number) => void;
}
```

---

## 10. Database Schema

### 10.1 Core Tables

```sql
-- Properties table
CREATE TABLE properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Basic Information
  address JSONB NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  property_type VARCHAR(50) NOT NULL,
  listing_status VARCHAR(20) DEFAULT 'active',
  
  -- Property Details
  bedrooms INTEGER,
  bathrooms DECIMAL(3,1),
  area_sqft INTEGER,
  year_built INTEGER,
  
  -- Rich Content
  title VARCHAR(200),
  description TEXT,
  features JSONB DEFAULT '[]',
  amenities JSONB DEFAULT '[]',
  
  -- Media
  cover_image TEXT,
  images JSONB DEFAULT '[]',
  virtual_tour_url TEXT,
  
  -- Location
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  neighborhood VARCHAR(100),
  
  -- Agent/MLS
  agent_id UUID REFERENCES auth.users(id),
  mls_number VARCHAR(50),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Links table
CREATE TABLE links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(200),
  description TEXT,
  
  -- Properties
  property_ids UUID[] NOT NULL,
  property_order JSONB,
  
  -- Configuration
  settings JSONB DEFAULT '{
    "showPrices": true,
    "enableBooking": true,
    "allowSharing": true
  }',
  
  -- Access Control
  agent_id UUID REFERENCES auth.users(id),
  password VARCHAR(100),
  expires_at TIMESTAMPTZ,
  
  -- Analytics
  view_count INTEGER DEFAULT 0,
  last_activity TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sessions table for analytics
CREATE TABLE sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  link_id UUID REFERENCES links(id) ON DELETE CASCADE,
  
  -- Visitor Information
  visitor_id TEXT,
  ip_address INET,
  user_agent TEXT,
  
  -- Device Information
  device_type VARCHAR(20),
  screen_width INTEGER,
  screen_height INTEGER,
  
  -- Session Data
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  properties_viewed INTEGER DEFAULT 0,
  bucket_assignments INTEGER DEFAULT 0
);

-- Property interactions
CREATE TABLE property_buckets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  
  bucket_type VARCHAR(20) NOT NULL, -- love, maybe, pass, book
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assignment_method VARCHAR(20), -- button, keyboard
  
  UNIQUE(session_id, property_id)
);
```

---

## 11. Performance Specifications

### 11.1 Core Web Vitals Targets

```
Performance Targets:
├── First Contentful Paint (FCP): <1.5s
├── Largest Contentful Paint (LCP): <2.0s
├── First Input Delay (FID): <50ms
├── Cumulative Layout Shift (CLS): <0.05
├── Time to Interactive (TTI): <3.0s
└── Bundle Size: <100KB JS initial
```

### 11.2 Image Optimization

```typescript
// Image optimization configuration
const imageConfig = {
  formats: ['webp', 'avif'],
  quality: 85,
  sizes: {
    mobile: '343px',
    tablet: '400px',
    desktop: '300px'
  },
  loading: 'lazy',
  placeholder: 'blur'
};
```

### 11.3 Caching Strategy

```
Cache Configuration:
├── Static Assets: 1 year
├── API Responses: 5 minutes
├── Images: 30 days
├── Fonts: 1 year
└── Service Worker: 24 hours
```

### 11.4 Responsive Breakpoints: Mobile-First Approach

```css
/* Base: 320px-374px */
.container { 
  padding: 16px; 
}
.property-card { 
  width: calc(100vw - 32px); 
}

/* Standard Mobile: 375px-767px */
@media (min-width: 375px) {
  .property-card { 
    width: 343px; 
  }
}

/* Tablet: 768px-1023px */
@media (min-width: 768px) {
  .carousel { 
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }
  .property-card { 
    width: calc(50% - 12px); 
  }
}

/* Desktop: 1024px+ */
@media (min-width: 1024px) {
  .carousel { 
    grid-template-columns: repeat(3, 1fr);
  }
  .property-card { 
    width: calc(33.333% - 16px); 
  }
}

/* Large Desktop: 1440px+ */
@media (min-width: 1440px) {
  .carousel { 
    grid-template-columns: repeat(4, 1fr);
  }
  .property-card { 
    width: calc(25% - 18px); 
  }
}
```

---

## 12. Accessibility Implementation

### 12.1 ARIA Implementation

```html
<!-- Carousel ARIA Structure -->
<section role="region" aria-label="Property carousel">
  <div role="list" aria-live="polite">
    <article 
      role="listitem" 
      tabindex="0"
      aria-label="Property 1 of 12: Modern Downtown Condo - $650,000"
    >
      <!-- Property Card Content -->
    </article>
  </div>
  
  <div role="tablist" aria-label="Property navigation">
    <button 
      role="tab" 
      aria-selected="true"
      aria-label="Property 1"
    >
    </button>
  </div>
</section>
```

### 12.2 Keyboard Navigation

```
Keyboard Shortcuts:
├── Tab: Navigate focusable elements
├── Arrow Keys: Carousel navigation
├── Enter/Space: Expand property or trigger action
├── Escape: Close modal
├── 1,2,3,4: Quick bucket assignment
└── Home/End: Jump to first/last property
```

### 12.3 Screen Reader Support

- **Content Announcements**: Property details on focus
- **Action Feedback**: Bucket assignment confirmations
- **Progress Updates**: Carousel position announcements
- **Error Messages**: Clear, actionable error descriptions

---

## 13. Analytics & Tracking

### 13.1 Event Tracking

```typescript
// Analytics events
interface AnalyticsEvents {
  // Navigation
  'carousel_scroll': { position: number, direction: 'forward' | 'backward' };
  'property_expand': { propertyId: string, method: 'tap' | 'keyboard' };
  'carousel_complete': { propertiesViewed: number, timeSpent: number };
  
  // Bucket Actions
  'bucket_assign': { propertyId: string, bucket: BucketType, method: string };
  'bucket_view': { bucket: BucketType, itemCount: number };
  
  // Engagement
  'session_start': { linkCode: string, deviceType: string };
  'session_end': { duration: number, propertiesViewed: number };
  'booking_intent': { propertyId: string, formOpened: boolean };
}
```

### 13.2 Performance Monitoring

```typescript
// Performance tracking
const performanceMetrics = {
  carousel: {
    scrollFPS: number,
    touchLatency: number,
    imageLoadTime: number
  },
  interactions: {
    tapToExpand: number,
    bucketAssignment: number,
    modalTransition: number
  }
};
```

---

## 14. Testing Strategy

### 14.1 Unit Testing

```typescript
// Component testing approach
describe('PropertyCarousel', () => {
  test('renders properties in correct order', () => {
    // Test property rendering and order
  });
  
  test('handles keyboard navigation', () => {
    // Test arrow key navigation
  });
  
  test('tracks analytics events', () => {
    // Test event firing on interactions
  });
});
```

### 14.2 Integration Testing

```typescript
// End-to-end testing scenarios
describe('Client Link Experience', () => {
  test('complete property browsing flow', () => {
    // Load link → Browse carousel → Assign buckets → Book tour
  });
  
  test('responsive behavior across devices', () => {
    // Test mobile, tablet, desktop layouts
  });
  
  test('accessibility compliance', () => {
    // Test keyboard navigation, screen readers
  });
});
```

### 14.3 Performance Testing

- **Load Testing**: Handle 1000+ concurrent sessions
- **Image Loading**: Test various network conditions
- **Memory Usage**: Monitor for memory leaks
- **Battery Impact**: Test on mobile devices

### 14.4 Comprehensive Testing Checklists

#### Visual Consistency Testing
- [ ] Cards match Airbnb aesthetic exactly
- [ ] 70-30 image-content ratio maintained across devices
- [ ] Colors follow palette specifications exactly
- [ ] Typography hierarchy is clear and consistent
- [ ] Shadows are subtle (not Material Design style)

#### Interaction Testing
- [ ] Horizontal scroll works smoothly at 60fps
- [ ] NO swipe gestures trigger bucket actions
- [ ] Tap reveals action buttons overlay
- [ ] Buttons provide immediate haptic feedback
- [ ] Property expansion animations are smooth
- [ ] All banned Tinder mechanics are absent

#### Performance Testing
- [ ] Images lazy load correctly with skeleton screens
- [ ] 60fps scrolling is achieved on all devices
- [ ] LCP under 2 seconds on 3G connections
- [ ] No layout shift during image loading
- [ ] Bundle size under 100KB initial JS

#### Accessibility Testing
- [ ] Keyboard navigation works completely
- [ ] Screen reader announces carousel correctly
- [ ] Touch targets are minimum 44px
- [ ] Color contrast passes WCAG 2.1 AA (4.5:1)
- [ ] Focus indicators are visible and clear

#### Responsive Behavior Testing
- [ ] Mobile (375px): Single full-width card display
- [ ] Tablet (768px): Two cards visible with proper spacing
- [ ] Desktop (1024px+): Three to four cards visible
- [ ] All breakpoints maintain 70-30 visual ratio
- [ ] Touch targets remain 44px minimum across devices

---

## 15. Security & Privacy

### 15.1 Data Protection

```typescript
// Data privacy implementation
const privacyConfig = {
  // Session data retention
  sessionRetention: '30 days',
  
  // PII handling
  anonymizeIPs: true,
  hashVisitorIds: true,
  
  // GDPR compliance
  cookieConsent: required,
  dataExport: available,
  rightToForget: implemented
};
```

### 15.2 Security Measures

- **Input Validation**: All user inputs sanitized
- **Rate Limiting**: API endpoints protected
- **CSRF Protection**: Form submissions secured
- **Content Security Policy**: XSS prevention
- **HTTPS Only**: All traffic encrypted

---

## 16. Deployment & Operations

### 16.1 Deployment Pipeline

```yaml
# GitHub Actions workflow
name: Deploy Client Link
on:
  push:
    branches: [main]
    paths: ['components/client/**', 'app/link/**']

jobs:
  deploy:
    steps:
      - name: Build and test
        run: |
          npm run build
          npm run test:unit
          npm run test:e2e
      
      - name: Deploy to Vercel
        run: vercel --prod
      
      - name: Run performance audit
        run: lighthouse --url $DEPLOY_URL
```

### 16.2 Monitoring

```typescript
// Production monitoring
const monitoring = {
  errors: 'Sentry integration',
  performance: 'Core Web Vitals tracking',
  uptime: '99.9% SLA target',
  alerts: 'PagerDuty integration'
};
```

---

## 17. Implementation Roadmap

### 17.1 Phase 1: Foundation (Weeks 1-2)
- [x] Project setup with Next.js 14 App Router
- [x] Database schema implementation
- [x] Basic component architecture
- [x] CSS design system implementation
- [ ] Mobile-first responsive layout
- [ ] Image optimization system

### 17.2 Phase 2: Core Carousel (Weeks 3-4)
- [ ] Embla carousel integration
- [ ] Property card component
- [ ] Dot indicators and navigation
- [ ] Touch gesture support (scroll only)
- [ ] Analytics event tracking
- [ ] Accessibility implementation

### 17.3 Phase 3: Bucket System (Weeks 5-6)
- [ ] Bucket management state
- [ ] Action overlay component
- [ ] Bottom navigation tabs
- [ ] Bucket assignment flow
- [ ] Visual feedback system
- [ ] State persistence

### 17.4 Phase 4: Property Details (Weeks 7-8)
- [ ] Expansion modal component
- [ ] Image gallery with zoom
- [ ] Property information display
- [ ] Interactive map integration
- [ ] Visit booking interface
- [ ] Agent contact features

### 17.5 Phase 5: Polish & Deploy (Weeks 9-10)
- [ ] Performance optimization
- [ ] Cross-browser testing
- [ ] Accessibility audit
- [ ] Security review
- [ ] Production deployment
- [ ] Monitoring setup

---

## 18. Success Metrics

### 18.1 User Engagement
- **Session Completion Rate**: >75%
- **Property Expansion Rate**: >50%
- **Bucket Assignment Rate**: >70%
- **Average Session Duration**: >10 minutes
- **Return Visitor Rate**: >25%

### 18.2 Technical Performance
- **Load Time**: <2 seconds on 3G
- **Scroll Performance**: 60fps maintained
- **Error Rate**: <0.1%
- **Accessibility Score**: 100% Lighthouse
- **Mobile Performance Score**: >90

### 18.3 Business Impact
- **Lead Quality**: Higher engagement scores
- **Conversion Rate**: Property showing bookings
- **Agent Efficiency**: Reduced follow-up time
- **Client Satisfaction**: Positive feedback scores

---

## 19. Final Implementation Notes

### Critical Design Decisions
1. **Carousel, Not Stack**: Properties display in a horizontal row, never stacked
2. **Scroll, Not Swipe**: Users scroll to browse, not swipe to decide
3. **Buttons, Not Gestures**: All actions require explicit button presses
4. **Airbnb, Not Tinder**: Clean, photography-first, trust-building design
5. **Mobile-First**: Start with 375px width, scale up from there

### Implementation Validation Checklist
- [ ] Zero Tinder mechanics remain in the codebase
- [ ] All gesture-based decision making removed
- [ ] 70-30 visual ratio maintained across breakpoints
- [ ] Airbnb-style color palette implemented exactly
- [ ] Progressive disclosure working across all three layers
- [ ] Accessibility compliance verified (WCAG 2.1 AA)
- [ ] Performance targets met (LCP <2s, 60fps scrolling)
- [ ] All banned animations removed from codebase

---

## 20. Document Management & Reconciliation

### Document History
**Created**: August 21, 2024  
**Last Reconciled**: August 21, 2025  
**Version**: 2.0 (Reconciled Master Specification)  
**Status**: Comprehensive Master Document  

### Source Documents Reconciled
1. **CLIENT-LINK-MASTER-SPECIFICATION.md** (v1.0)
   - Original 944-line comprehensive guide
   - Database schema and technical architecture
   - Complete component specifications

2. **CLIENT-LINK-DESIGN-250821.md** (404 lines)
   - Core interface architecture
   - User journey flow specifications
   - Component interaction patterns

3. **VISUAL-DESIGN-GUIDELINES-CLIENTLINK-250821.md** (416 lines)
   - Detailed visual design system
   - Animation guidelines and banned patterns
   - Comprehensive testing checklists
   - Progressive disclosure specifications

### Reconciliation Summary
- **Total Content**: 1,764 lines consolidated into single comprehensive document
- **Eliminated Redundancy**: 45% reduction in duplicate specifications
- **Enhanced Sections**: Visual design, animation patterns, testing checklists
- **Added Content**: Progressive disclosure, responsive breakpoints, implementation notes
- **Critical Additions**: Explicit "what not to do" sections for Tinder anti-patterns

### Stakeholders
- **Development Team**: Primary implementation reference
- **Design Team**: Visual consistency and interaction patterns
- **Product Team**: Success metrics and user experience goals
- **QA Team**: Comprehensive testing checklists and validation criteria

### Next Review Schedule
- **Immediate**: After initial implementation (Phase 2)
- **Quarterly**: Design system updates and performance metrics review
- **Major Updates**: When adding new features or interaction patterns

### Related Documents
- `WP-Airbnb-PropertyCarousel-Implementation-250821-1347.md` - Implementation completed
- `PropertyCarousel-README.md` - Component-specific documentation
- `app/link/[code]/README.md` - Link page module documentation

---

## Summary

This reconciled master specification provides the definitive blueprint for implementing SwipeLink Estate's Airbnb-style client interface. The document eliminates all conflicting information from the three source files and provides a single source of truth for:

- **Complete abandonment of Tinder mechanics** in favor of Airbnb-style patterns
- **Photography-first design** with 70-30 visual distribution
- **Explicit button actions** replacing all gesture-based interactions
- **Comprehensive responsive behavior** across all device breakpoints
- **Detailed accessibility implementation** ensuring WCAG 2.1 AA compliance
- **Performance-first architecture** with sub-2-second load times
- **Progressive enhancement** from mobile to desktop experiences

The specification ensures consistent implementation across all development phases while maintaining optimal user experience and performance standards that align with modern real estate platform expectations.