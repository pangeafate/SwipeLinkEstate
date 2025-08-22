# PipelineStage Component

## Purpose
Individual column component representing a single stage in the deal pipeline, displaying all deals in that stage with visual indicators, deal counts, and stage-specific styling.

## Architecture Context
PipelineStage is a child component of DealPipeline that handles the display and organization of deals within a specific pipeline stage.

```
DealPipeline → PipelineStage → PipelineDealCard (multiple)
                            → Stage Header
                            → Deal Count Badge
```

## Core Functionality

### Stage Visualization
- Color-coded stage representation with semantic meaning
- Stage icon and title display
- Deal count badge showing active deals in stage
- Empty state messaging when no deals present

### Deal Organization
- Vertical list of deals within the stage
- Maintains deal order and grouping
- Responsive layout for different screen sizes
- Smooth transitions for deal movements

### Interactive Elements
- Click handlers for deal interactions
- Drag-and-drop support for deal movement (future enhancement)
- Stage-specific actions and operations
- Visual feedback for user interactions

## Component Dependencies

### Internal Components
- **PipelineDealCard**: Individual deal display within the stage
- Receives deal objects and interaction handlers

### Props Interface
- **stage**: DealStage enum value (created, shared, accessed, etc.)
- **deals**: Array of Deal objects for this stage
- **onStageChange**: Handler for deal stage progression
- **onStatusChange**: Handler for deal status updates
- **onDealClick**: Handler for deal detail interactions

## Key Features

### Stage Configuration
- Predefined stage colors and styling
- Stage-specific icons and labels
- Configurable stage progression rules
- Visual hierarchy and spacing

### Visual Design System
- Consistent color palette across stages
- Progressive stage indicators
- Responsive grid layout
- Touch-friendly mobile design

### Deal Management
- Efficient rendering of multiple deals
- Proper key handling for React optimization
- Event delegation for performance
- Lazy loading for large deal sets

## Stage Definitions

### Stage Colors and Meanings
- **Created** (Gray): Initial deal creation
- **Shared** (Blue): Link shared with client
- **Accessed** (Yellow): Client accessed the link
- **Engaged** (Orange): Client showing engagement
- **Qualified** (Green): Deal qualified and progressing
- **Advanced** (Purple): Advanced negotiation stage
- **Closed** (Emerald): Successfully closed deal

### Stage Icons
- Each stage has a semantic emoji/icon
- Visual progression indicators
- Consistent iconography system
- Accessibility-friendly alternatives

## Usage Patterns

PipelineStage is used within:
1. **Deal Pipeline**: Main pipeline visualization
2. **Stage-specific Views**: Focused single-stage displays
3. **Dashboard Widgets**: Compact stage summaries
4. **Mobile Pipeline**: Touch-optimized stage navigation

## Integration Points

### Data Flow
```
PipelineStage → Receives deals array → Maps to PipelineDealCard
            → User interactions → Bubbles events to parent
            → Real-time updates → Re-renders with new data
```

### Event Handling
- Deal click events propagated to parent
- Stage change requests handled by parent
- Status updates processed through parent handlers
- Optimistic UI updates for immediate feedback

## Performance Considerations

### Optimization Strategies
- React.memo for preventing unnecessary re-renders
- Efficient deal filtering and sorting
- Minimal DOM manipulations
- Optimized event handler patterns