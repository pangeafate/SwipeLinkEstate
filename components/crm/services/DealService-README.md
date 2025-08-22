# Deal Management Service Module

## Purpose
Orchestrates comprehensive deal lifecycle management in the Link-as-Deal architecture, transforming property link sharing into automated CRM deal tracking with stage progression, analytics, and business intelligence.

## Public API

| Function | Input | Output | Purpose |
|----------|-------|--------|---------|
| createDealFromLink | link, properties, clientInfo | Promise<Deal> | Transform link to CRM deal |
| getDeals | filters, page, limit | Promise<PaginatedResponse<Deal>> | Retrieve paginated deals |
| getDealById | dealId | Promise<Deal \| null> | Get single deal details |
| progressDealStage | dealId, newStage | Promise<Deal \| null> | Advance deal through pipeline |
| updateDealStatus | dealId, newStatus | Promise<Deal \| null> | Update deal business status |
| getDealsByStatus | status, agentId | Promise<Deal[]> | Filter deals by status |

## Dependencies

### Internal
- /components/crm/types (Deal, DealStatus, DealStage interfaces)
- /components/crm/services/deal-progression.service (Stage management)
- /components/crm/services/deal-analytics.service (Engagement enrichment)
- /components/crm/services/deal-mock.service (Development fallbacks)
- /components/link (Link entity integration)
- /components/analytics (Engagement data sourcing)

### External
- @supabase/supabase-js (Database operations)
- date-fns (Date calculations and formatting)

## File Structure
```
services/
├── deal.service.ts                # Main orchestration service
├── deal-progression.service.ts    # Stage transition logic
├── deal-analytics.service.ts      # Engagement data enrichment
├── deal-mock.service.ts          # Development data generation
├── deal-tdd.service.ts           # Test-driven implementations
└── __tests__/
    ├── deal.service.test.ts
    ├── deal.integration.test.ts
    └── deal.performance.test.ts
```

## State Management
Stateless service orchestrator delegating to specialized sub-services. Uses Supabase for persistence with React Query for client-side caching. No internal state management - all data operations are transactional with immediate consistency.

## Link-as-Deal Architecture

The Deal Service implements the core paradigm where every property link automatically becomes a tracked deal opportunity:

### Automatic Deal Creation Process
```
Link Creation Event
        ↓
Link Data Extraction
  ↓                ↓
Property Portfolio   Deal Metadata
Analysis            Generation
        ↓                ↓
Deal Value          Deal Record
Calculation         Creation
        ↓
Initial Stage Assignment
        ↓
Task Generation Trigger
```

### Deal Transformation Logic
When a property link is created, the system automatically:

1. **Deal Identification**
   - Generate unique deal number
   - Extract agent assignment from link creator
   - Set initial stage to "Created"
   - Initialize engagement score to 0

2. **Property Portfolio Analysis**
   - Calculate total portfolio value from property prices
   - Determine average property value
   - Identify property types and locations
   - Estimate commission potential (default 2.5%)

3. **Client Profile Initialization**
   - Create client record if provided
   - Set temperature classification to "Cold"
   - Initialize progressive profiling data structure
   - Establish engagement tracking baseline

4. **Timeline and Task Setup**
   - Set expected close date (default 90 days)
   - Calculate priority based on deal value
   - Generate initial follow-up tasks
   - Schedule automated progression checks

## 7-Stage Deal Pipeline Management

The Deal Service manages progression through the comprehensive real estate sales pipeline:

### Stage 1: Created (Active Status)
**Automatic Entry:** Link generation completes
**Characteristics:**
- Deal record established with property portfolio
- Initial commission calculations completed
- Agent assigned and notified
- Baseline task generation triggered

**Business Rules:**
- All new links automatically enter this stage
- Deal value calculated from property portfolio
- Initial priority assigned based on portfolio size
- Agent notification sent within 5 minutes

### Stage 2: Shared (Active Status)
**Progression Trigger:** Link sharing event detected
**Characteristics:**
- Sharing method tracked (email, SMS, direct)
- Share timestamp recorded for follow-up automation
- Client information captured if provided
- Sharing analytics initiated

**Business Rules:**
- Automatic progression when share event occurs
- Follow-up task scheduled for 24 hours post-share
- Client profile creation if information available
- Sharing channel optimization tracking begins

### Stage 3: Accessed (Qualified Status)
**Progression Trigger:** First client page view recorded
**Characteristics:**
- Client engagement tracking activated
- Session monitoring initialized
- Device and location data captured
- Initial behavioral profiling begins

**Business Rules:**
- Automatic progression on first link access
- Real-time engagement scoring activation
- Client temperature monitoring starts
- Access notification to agent (if enabled)

### Stage 4: Engaged (Qualified Status)
**Progression Trigger:** Client property interactions detected
**Characteristics:**
- Swipe actions, likes, considerations recorded
- Property preference patterns analyzed
- Engagement score accumulation begins
- Behavioral insights generation starts

**Business Rules:**
- Progression when interaction threshold met (5+ actions)
- Preference learning algorithms activated
- Engagement score updates in real-time
- Temperature classification may upgrade to "Warm"

### Stage 5: Interested (Nurturing Status)
**Progression Trigger:** High engagement score (50+) or return visits
**Characteristics:**
- Strong buying signals detected
- Property viewing readiness indicated
- High-priority task generation triggered
- Agent intervention recommendations generated

**Business Rules:**
- Automatic progression at 50+ engagement score
- Temperature likely upgraded to "Warm" or "Hot"
- Priority task scheduling (within 24 hours)
- Commission probability calculations refined

### Stage 6: Qualified (Nurturing Status)
**Progression Trigger:** Booking requests, contact forms, sustained high engagement
**Characteristics:**
- Direct client communication established
- Property viewing scheduled or requested
- Qualification criteria confirmed
- Transaction probability significantly increased

**Business Rules:**
- Manual or automatic progression based on agent criteria
- High-priority agent task assignment
- Temperature typically "Hot"
- Close date estimation refined based on activity

### Stage 7: Closed (Closed-Won/Lost Status)
**Progression Trigger:** Transaction completion or definitive loss
**Characteristics:**
- Final outcome recorded with reason codes
- Commission calculations finalized
- Performance analytics updated
- Client relationship status determined

**Business Rules:**
- Manual progression by agent required
- Detailed outcome reason recording
- Final commission tracking
- Client retention strategy activation

## Deal Status vs Stage Distinction

The system maintains separate Status and Stage classifications for comprehensive tracking:

### Deal Status (Business State)
- **Active:** Deal is progressing, client showing interest
- **Qualified:** Client engagement threshold met, viable opportunity
- **Nurturing:** Ongoing relationship building and follow-up required
- **Closed-Won:** Successful transaction completed
- **Closed-Lost:** Deal ended without transaction

### Deal Stage (Pipeline Position)
Specific position within the 7-stage sales process, providing granular tracking of client journey progression.

## Engagement Data Enrichment

The Deal Service continuously enriches deal records with behavioral intelligence:

### Real-Time Engagement Integration
```
Client Session Data
        ↓
Engagement Score Calculation
        ↓
Temperature Classification Update
        ↓
Deal Record Enrichment
        ↓
Task Generation Evaluation
        ↓
Agent Notification Assessment
```

### Behavioral Insights Generation
The service analyzes client behavior to provide actionable insights:

**Property Preference Analysis:**
- Liked property characteristics identification
- Price range preference calculation
- Location preference mapping
- Property type affinity scoring

**Engagement Pattern Recognition:**
- Session frequency and duration tracking
- Time-of-day activity pattern analysis
- Device usage patterns
- Return visit behavior analysis

**Decision-Making Style Assessment:**
- Quick vs. deliberate decision patterns
- Information-seeking behavior analysis
- Comparison shopping indicators
- Purchase timeline estimation

## Financial Calculations and Commission Tracking

### Deal Value Computation
The service automatically calculates and maintains financial projections:

**Portfolio Value Analysis:**
- Total property portfolio value summation
- Average property value calculation
- Price range analysis for client targeting
- Market value trend considerations

**Commission Calculations:**
- Default 2.5% commission rate application
- Customizable commission rates per agent/agency
- Co-agent commission splitting logic
- Commission probability estimation based on stage

**Financial Forecasting:**
- Expected closing value projection
- Timeline-based value adjustments
- Market condition impact assessment
- Risk-adjusted commission forecasting

## Advanced Filtering and Search Capabilities

The Deal Service provides comprehensive filtering for agent productivity:

### Multi-Dimensional Filtering
```
Status Filters     Stage Filters      Temperature Filters
     ↓                  ↓                      ↓
Agent Filters     Time-Range Filters   Value-Range Filters
     ↓                  ↓                      ↓
Engagement Filters   Property Filters    Text Search Filters
     ↓                  ↓                      ↓
            Unified Query Builder
                    ↓
            Optimized Database Query
                    ↓
              Paginated Results
```

### Performance-Optimized Queries
- Database query optimization with proper indexing
- Pagination to prevent memory overflow
- Lazy loading of related data (properties, activities)
- Caching strategies for frequently accessed filters

### Smart Search Functionality
- Full-text search across deal names, client names, notes
- Tag-based filtering with auto-completion
- Fuzzy matching for typo tolerance
- Search result ranking by relevance and recency

## Task Automation Integration

The Deal Service seamlessly integrates with the task automation system:

### Automatic Task Generation Triggers
**Stage Progression Tasks:**
- Stage entry tasks for agent guidance
- Timeline-based follow-up scheduling
- Milestone celebration and recognition
- Stage-specific checklist generation

**Engagement-Based Tasks:**
- Hot lead immediate contact tasks
- Warm lead scheduled follow-up tasks
- Cold lead nurturing sequence activation
- Re-engagement campaign triggers

**Time-Based Tasks:**
- Follow-up reminders after sharing
- Check-in tasks for inactive deals
- Deadline approaching notifications
- Stale deal reactivation prompts

### Task Priority Algorithm
```
Engagement Score + Deal Value + Time Factor = Task Priority

High Priority:
- Hot leads (80+ score) with high deal value
- Time-sensitive opportunities (recent high engagement)
- Large portfolio deals requiring immediate attention

Medium Priority:
- Warm leads (50-79 score) with moderate values
- Regular follow-up sequences
- Standard pipeline progression tasks

Low Priority:
- Cold leads (0-49 score) with small portfolios
- Long-term nurturing activities
- Administrative and maintenance tasks
```

## Analytics and Reporting Integration

### Deal Performance Metrics
The service provides comprehensive analytics for business intelligence:

**Individual Deal Analytics:**
- Stage velocity tracking (time in each stage)
- Engagement trend analysis (improving/declining/stable)
- Conversion probability estimation
- Risk factor identification

**Portfolio Analytics:**
- Deal pipeline value summation
- Conversion rate analysis by stage
- Agent performance comparisons
- Market trend impact assessment

**Predictive Analytics:**
- Close probability scoring based on historical data
- Estimated days to close calculation
- Revenue forecasting with confidence intervals
- Risk assessment and mitigation recommendations

## Performance Considerations

### Database Optimization
- Efficient indexing on commonly filtered fields
- Query optimization for complex filter combinations
- Connection pooling for high-concurrency scenarios
- Regular query performance monitoring and tuning

### Caching Strategy
- Deal summary data cached for 30 minutes
- Engagement scores cached for 1 hour with invalidation
- Property portfolio data cached for 4 hours
- Filter result caching for identical query parameters

### Scalability Measures
- Asynchronous processing for non-critical operations
- Database pagination to prevent memory issues
- Background processing for analytics calculations
- Horizontal scaling support through stateless design

### Error Handling and Resilience
- Graceful degradation with mock data fallbacks
- Comprehensive error logging and monitoring
- Automatic retry logic for transient failures
- Circuit breaker patterns for external dependencies

## Security and Compliance

### Data Protection
- Row-level security for agent data isolation
- Encrypted sensitive client information
- GDPR-compliant data handling and retention
- Audit logging for all deal modifications

### Access Control
- Role-based access control (RBAC) implementation
- Agent-specific deal visibility restrictions
- Team-based sharing and collaboration controls
- Administrative override capabilities for management

### Compliance Features
- Data retention policy enforcement
- Client consent tracking and management
- Right to be forgotten implementation
- Data portability support for client requests

## Integration Testing and Quality Assurance

### Test Coverage Requirements
- Unit tests for all core business logic
- Integration tests with database layer
- End-to-end tests for complete deal lifecycle
- Performance tests for high-load scenarios

### Quality Metrics
- Deal creation accuracy validation
- Stage progression logic verification
- Financial calculation precision testing
- Query performance benchmarking

### Monitoring and Alerting
- Deal creation failure alerts
- Stage progression anomaly detection
- Performance degradation monitoring
- Data consistency validation alerts