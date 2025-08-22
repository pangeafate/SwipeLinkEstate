# CRM Module - Link-as-Deal Architecture

## Purpose
Transform SwipeLink Estate's property link sharing into a comprehensive Customer Relationship Management system where every shared link represents a potential real estate deal opportunity.

## Core Philosophy: Link-as-Deal
Every shared property link becomes a deal in the CRM pipeline. The system captures, analyzes, and manages the entire client journey from initial link creation through deal closure.

## Public API

| Function | Input | Output | Purpose |
|----------|-------|--------|---------|
| getDealsByStatus | status: DealStatus | Promise<Deal[]> | Retrieve deals by status |
| createDeal | linkData: LinkData, clientInfo?: ClientInfo | Promise<Deal> | Convert link to deal |
| updateDealStage | dealId: string, stage: DealStage | Promise<Deal> | Progress deal through stages |
| calculateEngagementScore | sessionData: SessionData | Promise<number> | Score client engagement 0-100 |
| getClientInsights | clientId: string | Promise<ClientProfile> | Get AI-powered client insights |
| generateAutomatedTasks | dealId: string | Promise<Task[]> | Create follow-up tasks |
| getDealPipeline | agentId?: string | Promise<PipelineMetrics> | Get pipeline analytics |

## Link Lifecycle to Deal Stages

```
Link Created → Deal Initiated (Active)
Link Shared → Prospect Contacted (Active)
Link Accessed → Lead Qualified (Qualified)
Properties Swiped → Client Engaged (Qualified)
Follow-up Actions → Deal Progressed (Nurturing)
Property Showing → Deal Advanced (Nurturing)
Purchase/Rental → Deal Closed Won (Closed-Won)
```

## Dependencies

### Internal
- /components/link (Link management and tracking)
- /components/analytics (Session and engagement data)
- /components/swipe (Client behavior data)

### External
- @supabase/supabase-js (Database operations)
- react-query (Data fetching and caching)
- date-fns (Date calculations for scoring)

## File Structure
```
crm/
├── index.ts                    # Public exports only
├── types.ts                   # TypeScript interfaces
├── crm.service.ts            # Core CRM business logic
├── deal.service.ts           # Deal management operations
├── client.service.ts         # Client profiling and insights
├── scoring.service.ts        # Engagement scoring algorithms
├── task.service.ts          # Automated task generation
├── components/              # CRM UI components
│   ├── DealPipeline.tsx    # Pipeline visualization
│   ├── DealCard.tsx        # Individual deal display
│   ├── ClientProfile.tsx   # Client insights dashboard
│   ├── TaskAutomation.tsx  # Task management interface
│   └── CRMAnalytics.tsx    # Analytics dashboard
└── __tests__/              # Module tests
    ├── crm.service.test.ts
    ├── deal.service.test.ts
    ├── scoring.service.test.ts
    └── components/
```

## State Management
Uses React Query for server state management with optimistic updates for deal stage changes. Local component state for UI interactions. Supabase real-time subscriptions for live pipeline updates.

## 7-Stage Deal Pipeline Architecture

The CRM implements a comprehensive 7-stage pipeline that mirrors the real estate sales process:

### Stage 1: Created (Active)
Link is generated with selected properties, automatically creating a deal record. Deal value calculated from property prices. Initial engagement score set to 0.

### Stage 2: Shared (Active)
Link has been shared with client via email, SMS, or direct link. System begins tracking sharing method and timestamp for follow-up automation.

### Stage 3: Accessed (Qualified)
Client has opened the link and initiated their property browsing session. Deal stage auto-progresses when first page view is recorded.

### Stage 4: Engaged (Qualified)
Client has interacted with properties through swiping, liking, or viewing details. Engagement score begins accumulating based on behavior patterns.

### Stage 5: Interested (Nurturing)
Client has shown strong interest through multiple return visits, high engagement score (50+), or bucket assignments. Automated high-priority tasks generated.

### Stage 6: Qualified (Nurturing)
Client meets qualification criteria through booking requests, contact form submissions, or sustained high engagement. Direct agent intervention triggered.

### Stage 7: Closed (Closed-Won/Lost)
Final outcome recorded - either successful transaction (Closed-Won) or lost opportunity (Closed-Lost) with reason tracking.

## Engagement Scoring Algorithm
See CRM-MASTER-SPECIFICATION.md Section 3.1 for the authoritative scoring algorithm.
Base score 0-100 calculated from:
- Session Completion (0-25 points): Percentage of properties viewed
- Property Interaction (0-35 points): Likes, considerations, detail views
- Behavioral Indicators (0-25 points): Return visits, session duration
- Recency Factor (0-15 points): Time since last activity

## Performance Considerations
- Engagement scores cached for 1 hour to reduce computation
- Deal pipeline data fetched with pagination (20 deals per page)
- Real-time updates debounced to 500ms to prevent excessive re-renders
- Client insights generated asynchronously and cached for 24 hours
- Task automation triggers are queued for background processing

## Implementation Phases

### Phase 1: Foundation (Current)
- Deal status tracking system
- Client engagement scoring
- Basic task automation  
- Simple analytics dashboard

### Phase 2: Intelligence (Future)
- Advanced client profiling
- AI-powered property recommendations
- Communication management hub
- Pipeline forecasting

### Phase 3: Optimization (Future)
- Predictive deal scoring
- Advanced automation workflows
- Integration with external services
- Mobile CRM interface

## Temperature Classification System

The CRM automatically classifies clients based on their engagement scores to prioritize agent attention:

### Hot Leads (80-100 Score)
- Immediate high-priority task generation
- Phone call tasks scheduled within 2 hours
- Direct agent notification triggered
- Priority booking requests and responses

### Warm Leads (50-79 Score)
- Follow-up email tasks scheduled within 24 hours
- Medium-priority task classification
- Regular engagement monitoring
- Automated nurturing sequence activation

### Cold Leads (0-49 Score)
- Long-term nurturing sequence
- Low-priority task generation
- Weekly follow-up scheduling
- Re-engagement campaign triggers

## Progressive Client Profiling

The system builds comprehensive client profiles through behavioral analysis:

### Initial Profile (Link Access)
- Basic session information
- Device and location data
- Referral source tracking
- Initial property preferences

### Behavioral Profiling (During Session)
- Property preference patterns
- Price range indicators  
- Location preferences
- Feature priority analysis

### Advanced Profiling (Multiple Sessions)
- Property type preferences
- Budget range refinement
- Timeline indicators
- Decision-making patterns

## Automated Task Generation Rules

The CRM generates tasks automatically based on predefined trigger conditions:

### Immediate Triggers (0-2 hours)
- Hot lead identification (score > 80)
- Property booking requests
- Contact form submissions
- Return visit within 24 hours

### Scheduled Triggers (24-48 hours)
- First link access follow-up
- No activity after 24 hours
- Incomplete session follow-up
- Property inquiry responses

### Long-term Triggers (Weekly/Monthly)
- Cold lead re-engagement
- Market update communications
- New property notifications
- Seasonal campaign activations

## Key Business Rules
- Every link automatically becomes a deal upon creation
- Deal stages progress automatically based on client engagement  
- Engagement scores update in real-time during client sessions
- Tasks are generated automatically based on configurable triggers
- Commission estimates calculated from property values in deal
- Client temperature determines task priority and urgency
- Progressive profiling enhances client understanding over time

## Module Integration Diagrams

### CRM Data Flow Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Link Module   │    │  Client Session │    │  CRM Pipeline   │
│                 │────│                 │────│                 │
│ • Link Creation │    │ • Property Views│    │ • Deal Tracking │
│ • Link Sharing  │    │ • Swipe Actions │    │ • Score Updates │
│ • Link Access   │    │ • Session Data  │    │ • Stage Changes │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         └──────────────│  Analytics Hub  │──────────────┘
                        │                 │
                        │ • Engagement    │
                        │ • Behavioral    │
                        │ • Performance   │
                        └─────────────────┘
```

### Deal Lifecycle Integration Points
```
Link Created ────────► Deal Created (Stage 1)
     │                      │
     ▼                      ▼
Link Shared ─────────► Deal Shared (Stage 2)
     │                      │
     ▼                      ▼
Client Access ────────► Deal Accessed (Stage 3)
     │                      │
     ▼                      ▼
Property Swipes ──────► Deal Engaged (Stage 4)
     │                      │
     ▼                      ▼
High Engagement ──────► Deal Interested (Stage 5)
     │                      │
     ▼                      ▼
Qualification Met ────► Deal Qualified (Stage 6)
     │                      │
     ▼                      ▼
Transaction/Loss ──────► Deal Closed (Stage 7)
```

### Real-time Data Synchronization
```
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Real-time Layer                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Links Table    Clients Table    Deals Table    Tasks Table │
│      │              │               │              │       │
│      └──────┐       │       ┌───────┘              │       │
│             │       │       │                      │       │
│             ▼       ▼       ▼                      ▼       │
│        ┌─────────────────────────────────────────────────┐  │
│        │         CRM Service Layer                      │  │
│        │                                               │  │
│        │  • Deal Management   • Client Profiling      │  │
│        │  • Scoring Engine    • Task Automation       │  │
│        └─────────────────────────────────────────────────┘  │
│                             │                               │
│                             ▼                               │
│        ┌─────────────────────────────────────────────────┐  │
│        │           React Query Cache                    │  │
│        │                                               │  │
│        │  • Deal Pipeline     • Client Insights        │  │
│        │  • Task Queue        • Analytics Data         │  │
│        └─────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Performance Optimization Strategy
```
┌────────────────┐    ┌────────────────┐    ┌────────────────┐
│   Data Layer   │    │  Service Layer │    │    UI Layer    │
├────────────────┤    ├────────────────┤    ├────────────────┤
│                │    │                │    │                │
│ • Query Cache  │◄───│ • Score Cache  │◄───│ • Optimistic  │
│   (1 hour)     │    │   (1 hour)     │    │   Updates      │
│                │    │                │    │                │
│ • Real-time    │◄───│ • Batch        │◄───│ • Debounced    │
│   Subscriptions│    │   Processing   │    │   Rendering    │
│                │    │                │    │   (500ms)      │
│ • Paginated    │◄───│ • Background   │◄───│ • Virtual      │
│   Queries      │    │   Tasks        │    │   Scrolling    │
│   (20 items)   │    │                │    │                │
└────────────────┘    └────────────────┘    └────────────────┘
```

## Security & Privacy
- All client data encrypted at rest and in transit
- GDPR-compliant data retention policies
- Role-based access controls for agent data
- Audit logging for all CRM operations
- Client consent management for data processing
- Secure API endpoints with authentication
- Data anonymization for analytics
- Regular security audits and compliance checks