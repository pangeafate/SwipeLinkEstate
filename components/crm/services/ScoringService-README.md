# Engagement Scoring Service Module

## Purpose
Calculates client engagement scores from 0-100 based on behavioral data to drive automated CRM actions, client temperature classification, and task generation priorities.

## Public API

| Function | Input | Output | Purpose |
|----------|-------|--------|---------|
| calculateEngagementScore | SessionData | Promise<EngagementMetrics> | Calculate comprehensive 0-100 score |
| getClientTemperature | engagementScore: number | ClientTemperature | Classify client as hot/warm/cold |
| calculateAggregateEngagementScore | SessionData[] | Promise<EngagementMetrics> | Score across multiple sessions |
| generateEngagementInsights | EngagementMetrics | InsightsObject | Generate AI-powered insights |
| updateEngagementScoreRealTime | currentScore, newActivity | Promise<EngagementMetrics> | Real-time score updates |

## Dependencies

### Internal
- /components/crm/types (SessionData, EngagementMetrics, ClientTemperature interfaces)
- /components/analytics (Session tracking data)
- /components/swipe (Property interaction data)

### External
- date-fns (Date calculations and comparisons)
- None (Pure TypeScript calculation service)

## File Structure
```
services/
├── scoring.service.ts          # Main scoring algorithms
├── scoring.types.ts           # Scoring-specific interfaces  
├── scoring.constants.ts       # Scoring weights and thresholds
└── __tests__/
    ├── scoring.service.test.ts
    ├── scoring.integration.test.ts
    └── scoring.performance.test.ts
```

## State Management
Stateless service class with pure calculation functions. No internal state management. Relies on passed SessionData and caches results at the service consumer level (CRM service layer).

## Scoring Algorithm Architecture

### 4-Component Scoring System (0-100 Total Points)

The engagement scoring system evaluates client behavior across four key dimensions:

#### 1. Session Completion Score (0-25 Points)
Measures how thoroughly the client reviewed the property collection.

**Calculation Logic:**
- Partial completion (1-50% properties): 5-15 points based on completion percentage
- Full completion (51-100% properties): 16-25 points with increasing rewards
- Return visit bonus: Additional 5 points for repeat engagement
- Maximum possible: 25 points

**Business Impact:**
- High scores indicate serious property search intent
- Completion patterns reveal client commitment level
- Return visits signal sustained interest

#### 2. Property Interaction Score (0-35 Points)
Evaluates depth of engagement with individual properties.

**Scoring Breakdown:**
- Properties liked: 2 points each (high engagement indicator)
- Properties considered: 1 point each (moderate interest)
- Detail views opened: 3 points each (deep engagement signal)
- Time spent per property: 1 point per 30 seconds (quality engagement)
- Maximum possible: 35 points

**Business Impact:**
- Indicates property preference clarity
- Measures engagement quality over quantity
- Signals readiness for property viewings

#### 3. Behavioral Indicators Score (0-25 Points)
Analyzes session quality and engagement patterns.

**Scoring Factors:**
- Return visits: 10 points per return (strong interest signal)
- Session duration > 5 minutes: 10 points (quality engagement)
- High like-to-view ratio (>20%): 15 points (selective, focused interest)
- Consistent preferences: 10 points (clear buying criteria)
- Maximum possible: 25 points

**Business Impact:**
- Reveals client decision-making style
- Indicates serious buyer versus casual browser
- Helps prioritize follow-up efforts

#### 4. Recency Factor Score (0-15 Points)
Time-decay factor maintaining score relevance.

**Time-Based Scoring:**
- Activity within 24 hours: 15 points (immediate follow-up priority)
- Activity within 1 week: 10 points (active search window)
- Activity within 1 month: 5 points (potential re-engagement)
- Older activity: 0 points (requires nurture campaign)
- Maximum possible: 15 points

**Business Impact:**
- Prevents stale leads from appearing active
- Prioritizes recent engagement for immediate action
- Maintains data relevance for decision-making

## Temperature Classification System

### Hot Leads (80-100 Points)
**Characteristics:**
- Completed property review sessions
- High property interaction rates
- Recent activity within 24-48 hours
- Multiple return visits or extended sessions

**Automated Actions:**
- Immediate high-priority task generation
- Phone call tasks scheduled within 2 hours
- Direct agent notification triggered
- Priority response to booking requests

### Warm Leads (50-79 Points)
**Characteristics:**
- Moderate property engagement
- Some property interactions and detail views
- Recent activity within 1 week
- Showing selective interest patterns

**Automated Actions:**
- Follow-up email tasks within 24 hours
- Medium-priority task classification
- Regular engagement monitoring
- Nurturing sequence activation

### Cold Leads (0-49 Points)
**Characteristics:**
- Limited property engagement
- Brief sessions with minimal interaction
- Older activity or lack of return visits
- Low completion rates

**Automated Actions:**
- Long-term nurturing campaigns
- Low-priority task generation
- Weekly follow-up scheduling
- Re-engagement campaign triggers

## Multi-Session Aggregation Strategy

For clients with multiple property browsing sessions, the scoring service implements a sophisticated aggregation approach:

### Weighted Average Calculation
**Session Weight Factors:**
- Recency weight (70% influence): Recent sessions have higher impact
- Quality weight (30% influence): Longer, more complete sessions valued more
- Single session handling: Full weight given to avoid dilution

### Aggregate Score Benefits
- Provides comprehensive client engagement picture
- Prevents single poor session from skewing assessment
- Maintains historical context while emphasizing recent behavior
- Enables trend analysis and engagement trajectory tracking

## Real-Time Score Updates

The scoring service supports real-time updates during active client sessions:

### Live Activity Tracking
- Property like/dislike actions: Immediate score adjustment
- Detail view openings: Enhanced engagement recognition
- Session duration tracking: Quality engagement measurement
- Consideration bucket additions: Interest level indication

### Performance Optimization
- Incremental score updates to avoid full recalculation
- Debounced updates to prevent excessive computation
- Cached intermediate results for efficiency
- Background aggregation for historical data

## Performance Considerations

### Caching Strategy
- Engagement scores cached for 1 hour to reduce computation overhead
- Component scores cached separately for faster partial updates
- Multi-session aggregates cached for 2 hours with invalidation triggers
- Real-time updates bypass cache for immediate accuracy

### Computational Efficiency
- Pure calculation functions with no side effects
- Minimal external dependencies for faster execution
- Optimized algorithms with early returns for edge cases
- Batch processing capabilities for bulk score updates

### Scalability Measures
- Stateless service design enables horizontal scaling
- Database query optimization for session data retrieval
- Asynchronous processing for non-critical score updates
- Memory-efficient session data handling

## Integration Points

### CRM Pipeline Integration
- Automatic deal stage progression based on score thresholds
- Temperature-based task priority assignment
- Commission forecasting using engagement probability
- Sales pipeline analytics and reporting

### Client Profiling Integration
- Behavioral pattern recognition for profile building
- Preference learning from interaction data
- Interest timeline construction
- Buying intent probability calculation

### Task Automation Integration
- Score-triggered task generation rules
- Priority-based task scheduling
- Follow-up timing optimization
- Automation workflow triggers

### Analytics Integration
- Engagement trend analysis
- Conversion rate optimization data
- Performance benchmarking metrics
- Client segmentation insights

## Business Intelligence Insights

### Engagement Pattern Recognition
The scoring service identifies meaningful patterns in client behavior:

**High-Intent Signals:**
- Consistent return visits with increasing engagement
- Deep property interaction with detail view exploration
- Selective liking patterns indicating clear preferences
- Extended session durations with thorough review

**Re-Engagement Opportunities:**
- Declining scores after initial high engagement
- Incomplete sessions with early abandonment
- Stale activity requiring nurture campaign activation
- Temperature drops indicating need for intervention

### Predictive Capabilities
- Deal closure probability estimation
- Optimal follow-up timing prediction
- Client readiness assessment for viewings
- Market interest trend identification

## Error Handling and Edge Cases

### Data Validation
- Comprehensive input validation for session data
- Graceful handling of incomplete or corrupted data
- Default value assignment for missing metrics
- Score boundary enforcement (0-100 range)

### Edge Case Management
- Zero-property sessions handled appropriately
- Extremely long or short sessions normalized
- Invalid timestamps and date ranges managed
- Concurrent session updates synchronized

### Fallback Mechanisms
- Default scoring when calculation fails
- Alternative scoring methods for incomplete data
- Historical fallback for missing recent activity
- Manual score override capabilities for exceptions

## Testing and Quality Assurance

### Test Coverage Requirements
- Unit tests for individual scoring components
- Integration tests with session data sources
- Performance tests for bulk scoring operations
- Edge case tests for data validation

### Quality Metrics
- Score accuracy validation against known outcomes
- Performance benchmarks for calculation speed
- Memory usage monitoring for large session datasets
- Real-time update latency measurements

### Monitoring and Alerts
- Score calculation failure alerts
- Performance degradation monitoring
- Data quality issue detection
- Cache hit rate optimization tracking