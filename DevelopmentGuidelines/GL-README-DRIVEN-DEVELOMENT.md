# Real Estate Platform - Modular Development Guidelines

## CORE RULES - ALWAYS FOLLOW
ALWAYS: when you create a code component - there should be a detailed README file in the same folder. It should be named as “name of the component”+”Readme” and should be placed in the folder with component. For example “PropertyCard-README.md” it should describe in plain and simple english the logic and code in the component (for exmple PropertyCard.tsx) and illustrate the place of this component in the architecture and its functions. Use flowcharts and diagrams where appropriate. Don't write code in the README files, just plain english and diagrams. ALWAYS: update README files when the code functionality changes. 

1. **NEVER create files > 200 lines** - Split into smaller modules (TypeScript files should be even smaller), markdown and readme files can be of any length
2. **NEVER mix concerns** - One file, one purpose (e.g., don't mix Supabase queries with UI logic)
3. **ALWAYS update README** - Document every new feature/module
4. **ALWAYS maintain module boundaries** - Use the defined public APIs
5. **ALWAYS follow the implementation plan** - Build modules in the specified order

## Project Structure for Real Estate Platform

```
real-estate-platform/
├── README.md                     # Quick start & overview
├── ARCHITECTURE.md              # System design (4 core modules)
├── DEVELOPMENT.md              # This file - guidelines
├── MEMORY.md                   # Decisions & lessons learned
├── docs/
│   ├── modules/               # Module specifications
│   │   ├── property-management.md
│   │   ├── link-management.md
│   │   ├── client-interface.md
│   │   └── analytics.md
│   └── demo/                  # Demo flow & scripts
├── app/                        # Next.js App Router
│   ├── (agent)/               # Agent routes (grouped)
│   │   ├── dashboard/
│   │   ├── properties/
│   │   └── links/
│   ├── link/                  # Public client routes
│   │   └── [code]/
│   └── api/                   # API routes (if needed)
├── components/
│   ├── property/              # Property module components
│   │   ├── README.md
│   │   ├── index.ts          # Public exports
│   │   └── [components]
│   ├── link/                  # Link module components
│   ├── client/                # Client link interface components
│   └── analytics/             # Analytics components
├── lib/
│   ├── supabase/             # Database layer
│   │   ├── README.md
│   │   └── [queries]
│   └── utils/                # Shared utilities
└── __tests__/
    ├── unit/
    ├── integration/
    └── e2e/
```

## Module Architecture

```
┌─────────────────────────────────────────────────┐
│                  APP LAYER                       │
│            (Next.js Pages & Routes)              │
├─────────────────────────────────────────────────┤
│                COMPONENT LAYER                   │
│     Property │ Link │ Client │ Analytics        │
├─────────────────────────────────────────────────┤
│                SERVICE LAYER                     │
│          Business Logic & Data Access            │
├─────────────────────────────────────────────────┤
│                DATABASE LAYER                    │
│              (Supabase + Storage)                │
└─────────────────────────────────────────────────┘
```

## Module Boundaries & Dependencies

```
                    ┌──────────────┐
                    │   Analytics  │
                    │    Module    │
                    └──────┬───────┘
                           │ Reads from
                    ┌──────▼───────┐
        ┌──────────►│     Link     │◄──────────┐
        │           │   Module     │           │
        │           └──────┬───────┘           │
        │                  │                   │
        │                  │ Contains          │ Creates
        │                  ▼                   │
┌───────┴──────┐   ┌──────────────┐   ┌───────┴──────┐
│   Property   │   │   Client     │   │    Agent     │
│    Module    │◄──│   Module     │   │  Dashboard   │
└──────────────┘   └──────────────┘   └──────────────┘
     Provides           Uses              Manages
   Properties to      Properties         Properties
```

## Module Creation Checklist

### For EVERY New Module:

```
Module: [NAME]
├── □ Create module folder structure
├── □ Write README.md with API specification
├── □ Define TypeScript interfaces
├── □ Create index.ts with public exports
├── □ Write test specifications
├── □ Implement core functions
├── □ Add UI components
├── □ Update main README
└── □ Update MEMORY.md with decisions
```

## Module README Template

```markdown
# [Module Name] Module

## Purpose
[Single sentence describing module responsibility]

## Public API

| Function | Input | Output | Purpose |
|----------|-------|--------|---------|
| getAllProperties | - | Property[] | List all properties |
| createLink | propertyIds, name | Link | Generate shareable link |

## Dependencies

### Internal
- [List internal module dependencies]

### External
- @supabase/supabase-js
- [Other npm packages]

## File Structure
\```
module-name/
├── index.ts          # Public exports only
├── types.ts          # TypeScript interfaces
├── [name].service.ts # Business logic
├── [name].queries.ts # Database queries
├── components/       # UI components
└── __tests__/       # Module tests
\```

## State Management
[Describe how this module manages state - Zustand store, React state, etc.]

## Performance Considerations
[List any performance optimizations or concerns]
```

## File Size Monitoring

```
┌─────────────────────────────────────────────┐
│           File Size Thresholds              │
├─────────────────────────────────────────────┤
│ TypeScript Files:                           │
│   ⚠️  Warning at:  150 lines               │
│   🛑 Must split at: 200 lines              │
│                                             │
│ React Components:                           │
│   ⚠️  Warning at:  100 lines               │
│   🛑 Must split at: 150 lines              │
│                                             │
│ CSS/Tailwind Files:                        │
│   ⚠️  Warning at:  200 lines               │
│   🛑 Must split at: 300 lines              │
└─────────────────────────────────────────────┘
```

## Module-Specific Guidelines

### Property Management Module

```
Structure:
├── PropertyService
│   ├── Property CRUD operations
│   ├── Image upload handling
│   └── Status management
├── PropertyComponents
│   ├── PropertyCard
│   ├── PropertyGrid
│   └── PropertyDetail
└── PropertyTypes
    ├── Property interface
    └── PropertyStatus enum

Max Complexity:
- Service functions: 30 lines each
- Components: 100 lines each
- No more than 5 functions per file
```

### Link Management Module

```
Structure:
├── LinkService
│   ├── Link generation
│   ├── Code validation
│   └── Link analytics
├── LinkComponents
│   ├── LinkCreator (multi-step)
│   ├── LinkCard
│   └── LinkShareModal
└── LinkTypes
    ├── Link interface
    └── LinkSession type

Key Rules:
- Link codes must be 8 characters
- Always validate link exists before access
- Track every link interaction
```

### Client Link Interface Module

```
Structure:
├── ClientLinkService
│   ├── Session management
│   ├── Carousel navigation
│   ├── Bucket operations
│   └── Visit booking
├── ClientComponents
│   ├── PropertyCarousel
│   ├── PropertyCard
│   ├── PropertyModal
│   ├── BucketManager
│   ├── VisitBooking
│   └── CollectionOverview
└── ClientTypes
    ├── NavigationTypes
    ├── ClientSession interface
    └── Bucket types

Critical Performance:
- Preload next 2-3 properties
- Navigation response < 100ms
- Modal transitions < 250ms
- Optimistic UI updates
- Progressive image loading
- No blocking operations
```

### Analytics Module

```
Structure:
├── AnalyticsService
│   ├── Metrics calculation
│   ├── Real-time subscriptions
│   └── Report generation
├── AnalyticsComponents
│   ├── MetricCard
│   ├── EngagementChart
│   └── ActivityFeed
└── AnalyticsTypes
    ├── Metric interfaces
    └── Activity types

Real-time Rules:
- Debounce updates (500ms)
- Batch metric calculations
- Cache computed values
```

## Development Workflow

```
Day 1: Setup
├── Initialize Next.js + TypeScript
├── Configure Supabase
├── Set up folder structure
└── Install dependencies

Days 2-3: Property Module
├── Create module structure
├── Implement PropertyService
├── Build PropertyCard component
├── Add seed data
└── Test property display

Days 4-5: Link Module
├── Create module structure
├── Implement LinkService
├── Build LinkCreator flow
├── Test link generation
└── Verify link sharing

Days 6-8: Client Link Interface ⭐ (Most Important)
├── Create module structure
├── Implement ClientLinkService
├── Configure carousel library
├── Build carousel interface
├── Add property expansion
├── Create bucket management
├── Add visit booking
└── Extensive responsive testing

Days 9-10: Analytics Module
├── Create module structure
├── Implement AnalyticsService
├── Build dashboard
├── Add real-time updates
└── Create activity feed

Days 11-12: Integration & Polish
├── Connect all modules
├── Add loading states
├── Polish animations
├── Mobile optimization
└── Deploy to Vercel
```

## Memory File Structure

```markdown
# MEMORY.md

## Architecture Decisions
| Date | Decision | Reasoning | Outcome |
|------|----------|-----------|---------|
| Day 1 | Use embla-carousel | Modern carousel library | Excellent performance |
| Day 2 | Supabase real-time | Built-in WebSockets | Easy implementation |

## Module Lessons
### Property Module
- Lesson: Image uploads slow
- Solution: Resize on client, lazy load

### Link Module
- Lesson: Code collisions possible
- Solution: Check uniqueness before save

### Client Interface Module
- Lesson: Touch navigation on mobile
- Solution: Multiple input methods

## Performance Optimizations
- Preload 2 cards ahead
- Debounce analytics updates
- Use optimistic UI updates

## Known Issues
- iOS Safari: Swipe needs adjustment
- Android: Image cache aggressive
```

## Module Communication Patterns

```
User Action Flow:
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Agent   │────▶│ Property │────▶│   Link   │────▶│ Analytics│
│Dashboard │     │  Module  │     │  Module  │     │  Module  │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
     │                 │                 │                │
     │                 ▼                 ▼                ▼
     │          [Properties]         [Links]        [Metrics]
     │                 │                 │                │
     └─────────────────┴─────────────────┴────────────────┘
                              │
                              ▼
                        [Supabase DB]

Client Action Flow:
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Client  │────▶│   Link   │────▶│ Carousel │────▶│ Analytics│
│  Opens   │     │ Validate │     │  Module  │     │  Track   │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
```

## Quality Checks Before Commit

```
Pre-Commit Checklist:
├── □ All files < 200 lines
├── □ Module READMEs updated
├── □ No circular dependencies
├── □ Tests cover new code
├── □ Mobile tested (if UI)
├── □ Loading states added
├── □ Error handling present
├── □ MEMORY.md updated
└── □ Main README current
```

## Common Pitfalls to Avoid

```
❌ DON'T:
- Mix Supabase queries with React components
- Create "utils" files > 100 lines
- Import from deep paths (use index exports)
- Skip loading states
- Forget mobile testing
- Use any instead of proper TypeScript types
- Make synchronous Supabase calls
- Store sensitive data in components

✅ DO:
- Keep components pure when possible
- Use proper TypeScript interfaces
- Test on real mobile devices
- Add proper error boundaries
- Use optimistic updates for bucket assignments
- Implement proper loading states
- Cache expensive computations
- Document unusual decisions
```

## Module Health Indicators

```
Healthy Module:
├── ✅ Clear single responsibility
├── ✅ Well-defined public API
├── ✅ No circular dependencies
├── ✅ All files < 200 lines
├── ✅ README up to date
├── ✅ Tests passing
└── ✅ Used by other modules via index

Unhealthy Module:
├── ❌ Multiple responsibilities
├── ❌ Exposes internals
├── ❌ Circular dependencies
├── ❌ Large files (> 200 lines)
├── ❌ Outdated documentation
├── ❌ Failing tests
└── ❌ Direct file imports from other modules
```

## Success Metrics for Modules

```
Property Module Success:
□ Displays grid of properties
□ Images load quickly
□ Status updates work
□ Card interactions smooth

Link Module Success:
□ Generates unique codes
□ Copy to clipboard works
□ Links are shareable
□ No authentication needed

Client Interface Module Success:
□ Smooth carousel navigation
□ Property expansion works
□ Bucket management intuitive
□ Visit booking functional
□ Works on all devices

Analytics Module Success:
□ Real-time updates work
□ Metrics are accurate
□ Dashboard loads fast
□ Activity tracked properly