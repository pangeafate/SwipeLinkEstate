# PipelineDealCard Component

## Purpose
Specialized deal card component optimized for pipeline view display, showing essential deal information in a compact format with quick actions and visual indicators suitable for kanban-style interfaces.

## Architecture Context
PipelineDealCard is a focused version of the general DealCard, specifically designed for pipeline stage columns with space-optimized layout and pipeline-specific interactions.

```
PipelineStage → PipelineDealCard → Deal Information Display
                                → Client Temperature Badge  
                                → Quick Action Buttons
                                → Status Indicators
```

## Core Functionality

### Compact Information Display
- Deal name with truncation for long titles
- Property count and engagement score
- Deal value with formatted currency
- Last activity date for recency tracking

### Visual Indicators
- Client temperature dot indicator (red/orange/gray)
- Status badge with color-coded classification
- Engagement score progress indication
- Priority and urgency visual cues

### Quick Actions
- "Add Task" button for immediate task creation
- "Contact" button for client communication
- Click-to-expand for detailed modal view
- Event propagation prevention for nested actions

## Component Dependencies

### Internal Utilities
- Temperature color mapping functions
- Status color classification system
- Currency and date formatting helpers
- Event handling utilities

### Props Interface
- **deal**: Complete Deal object with all properties
- **onStageChange**: Callback for deal stage progression
- **onStatusChange**: Callback for deal status updates  
- **onClick**: Callback for detail view activation

### Data Requirements
- Client temperature classification
- Deal status and stage information
- Engagement metrics and scores
- Activity timestamps and history

## Key Features

### Space Optimization
- Compact layout for pipeline columns
- Essential information prioritization
- Responsive design for narrow spaces
- Mobile-touch friendly sizing

### Interaction Design
- Hover effects for better usability
- Clear visual hierarchy
- Accessible click targets
- Keyboard navigation support

### Performance Features
- Optimized rendering for large lists
- Memoized color calculations
- Efficient event handling
- Minimal re-render triggers

## Visual Design System

### Temperature Indicators
- **Hot** (Red): High engagement, priority attention
- **Warm** (Orange): Moderate engagement, regular follow-up
- **Cold** (Gray): Low engagement, nurture sequence

### Status Classification
- **Active** (Blue): Currently being worked
- **Qualified** (Green): Verified and progressing
- **Nurturing** (Yellow): Long-term relationship building
- **Closed-Won** (Emerald): Successfully completed
- **Closed-Lost** (Red): Unsuccessful completion

## Usage Patterns

PipelineDealCard is specifically used in:
1. **Pipeline Columns**: Primary use case for deal stages
2. **Compact Lists**: Space-constrained deal displays  
3. **Mobile Pipeline**: Touch-optimized deal interaction
4. **Quick Overview**: Essential information at-a-glance

## Integration Points

### Event Flow
```
PipelineDealCard → User Click → onClick handler → Parent component
                → Quick Action → Service call → Optimistic update
                → Hover/Focus → Visual feedback → Enhanced UX
```

### Data Updates
- Real-time deal information updates
- Optimistic UI responses to user actions
- Error handling with visual feedback
- Progressive enhancement for offline scenarios

## Accessibility Features

### Keyboard Support
- Tab navigation through interactive elements
- Enter/Space activation for buttons
- Focus management and visual indicators
- Screen reader friendly content

### Visual Accessibility
- High contrast color combinations
- Sufficient touch target sizes
- Clear visual hierarchy
- Alternative text for visual indicators