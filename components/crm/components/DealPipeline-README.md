# DealPipeline Component

## Purpose
Visual kanban-style pipeline interface that displays deals across their lifecycle stages, allowing agents to manage and track deal progression through drag-and-drop interactions and quick actions.

## Architecture Context
The DealPipeline is the primary visualization component for deal management in the CRM module. It serves as the main dashboard view for agents to monitor and interact with their active deals.

```
Agent Dashboard → DealPipeline → PipelineStage → PipelineDealCard
                             → PipelineFilters
                             → DealModal
```

## Core Functionality

### Deal Stage Management
- Displays deals across 7 lifecycle stages: Created → Shared → Accessed → Engaged → Qualified → Advanced → Closed
- Each stage shows deal count and total pipeline value
- Supports stage progression through user interactions

### Filtering and Search
- Real-time filtering by deal status, client temperature, and search terms
- Active filter indicators with clear-all functionality
- Responsive filter panel that can be toggled

### Deal Interactions
- Click any deal card to view detailed information in modal
- Quick action buttons for common tasks
- Real-time updates when deals are modified

## Component Dependencies

### Internal Components
- **PipelineStage**: Individual column for each deal stage
- **PipelineFilters**: Search and filtering controls
- **DealModal**: Full deal details overlay
- **PipelineDealCard**: Individual deal display cards

### Services Used
- **DealService**: For fetching and updating deal data
- Handles pagination, filtering, and stage transitions

### State Management
- Local component state for deals, filters, loading states
- Real-time updates through service layer
- Optimistic UI updates for better user experience

## Key Features

### Performance Optimizations
- Efficient deal grouping by stage
- Optimized re-renders through proper key usage
- Loading states during data fetches

### Responsive Design
- Horizontal scrolling pipeline on mobile
- Collapsible filter section
- Touch-friendly interactions

### Error Handling
- Graceful error states with retry options
- Loading skeletons during data fetch
- Network error recovery

## Usage Patterns

The DealPipeline component is typically used in:
1. **Agent Dashboard**: Main deals overview
2. **CRM Analytics**: Pipeline performance monitoring  
3. **Deal Management**: Active deal tracking and updates

## Integration Points

### Data Flow
```
DealPipeline → DealService.getDeals() → Supabase → Deal Data
           → User Interactions → DealService.updateDeal() → Optimistic UI Update
```

### Event Handling
- Stage changes trigger deal service updates
- Status changes update deal progression
- Filter changes refetch matching deals
- Modal interactions for detailed views