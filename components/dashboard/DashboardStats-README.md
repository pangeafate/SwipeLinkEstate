# DashboardStats Component

## Purpose
Displays key metrics and statistics overview on the agent dashboard.

## Overview
The DashboardStats component presents a grid of metric cards showing property counts, link statistics, view counts, and session information. It provides agents with a quick overview of their portfolio performance.

## Visual Structure

```
┌────────────────────────────────────────────────┐
│              DashboardStats Grid               │
├─────────────┬─────────────┬─────────────┬────┤
│   Total     │   Active    │   Total     │Total│
│ Properties  │   Links     │   Views     │Sessions│
│     25      │     12      │    458      │  34 │
│  (20 active)│             │             │(45s avg)│
└─────────────┴─────────────┴─────────────┴────┘
```

## Props Interface

- **analytics**: Analytics data object containing overview metrics
- **properties**: Array of property objects for fallback counting
- **links**: Array of link objects for fallback counting

## Data Flow

The component uses a fallback strategy for displaying metrics:
1. Primary: Use analytics data from React Query
2. Fallback: Count from local arrays if analytics unavailable
3. Default: Show 0 if no data available

## Metric Cards

### Total Properties
- Shows total property count
- Displays active property count as subtitle
- Uses analytics.overview.totalProperties or counts properties array

### Active Links
- Shows count of active share links
- Uses analytics.overview.totalLinks or counts links array

### Total Views
- Shows cumulative property views
- Uses analytics.overview.totalViews
- No fallback (server-side metric only)

### Total Sessions
- Shows total client sessions
- Displays average session duration as subtitle
- Uses analytics.overview.totalSessions and avgSessionDuration

## Styling

- Responsive grid layout (1 column mobile, 4 columns desktop)
- White cards with subtle shadows
- Consistent spacing and typography
- Gray color scheme for labels and values

## Integration

Used in the Agent Dashboard as the top-level metrics display. Updates automatically when underlying data changes through React Query.