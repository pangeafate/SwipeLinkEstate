# PipelineFilters Component

## Purpose
Advanced filtering interface for the deal pipeline that provides search, status filtering, and client temperature filtering capabilities with real-time updates and clear visual feedback for active filters.

## Architecture Context
PipelineFilters sits above the pipeline view, providing powerful filtering capabilities that dynamically update the displayed deals across all pipeline stages.

```
DealPipeline → PipelineFilters → Search Input
                              → Status Filter Buttons
                              → Temperature Filter Buttons
                              → Active Filter Summary
                              → Clear All Actions
```

## Core Functionality

### Multi-dimensional Filtering
- Text search across deal names and client information
- Multiple status selection with toggle behavior
- Single temperature selection with visual indicators
- Combined filter logic for precise deal targeting

### Real-time Updates
- Immediate filter application without page refresh
- Live search with optimized debouncing
- Dynamic deal count updates as filters change
- Smooth transitions for filter state changes

### Filter Management
- Active filter visualization and summary
- Individual filter removal capability
- "Clear All" functionality for quick reset
- Filter state persistence across sessions

## Component Dependencies

### Props Interface
- **filters**: Current DealFilters state object
- **onFiltersChange**: Callback for filter updates
- **onRefresh**: Callback for manual data refresh

### Data Types
- **DealFilters**: Search, status array, client temperature
- **DealStatus**: Active, qualified, nurturing, closed states
- **ClientTemperature**: Hot, warm, cold classifications

### Internal State
- Manages filter UI state and interactions
- Handles temporary input states before applying
- Controls expansion/collapse of filter sections

## Key Features

### Search Functionality
- Real-time text search across deal properties
- Placeholder guidance for search behavior
- Search term highlighting and feedback
- Optimized search performance

### Status Filtering
- Multi-select status filter buttons
- Visual indication of selected statuses
- Toggle behavior for easy selection/deselection
- Status-specific color coding

### Temperature Filtering
- Single-select temperature filtering
- Visual temperature indicators (fire, lightning, snowflake)
- Exclusive selection behavior
- Temperature-based color themes

### Filter Summary
- Clear display of active filters
- Individual filter removal options
- Filter count and summary statistics
- One-click clear all functionality

## Visual Design System

### Interactive Elements
- Button states: default, hover, selected, disabled
- Consistent spacing and alignment
- Touch-friendly sizing for mobile use
- Clear visual hierarchy

### Filter Indicators
- **Selected**: Blue background with darker border
- **Default**: Gray background with hover effects
- **Active Summary**: Colored badges for filter types
- **Clear Actions**: Red accent for removal options

## Usage Patterns

PipelineFilters is used for:
1. **Deal Refinement**: Narrowing down large deal sets
2. **Focus Sessions**: Working on specific deal types
3. **Performance Analysis**: Filtering by status for metrics
4. **Client Segmentation**: Temperature-based deal grouping

## Integration Points

### Data Flow
```
PipelineFilters → User Input → Filter State Update → Parent Callback
               → API Request → Updated Deal Data → Pipeline Refresh
```

### Performance Optimization
- Debounced search input to prevent excessive API calls
- Efficient filter comparison and state management
- Optimized re-render patterns
- Memory-efficient filter logic

## Responsive Behavior

### Layout Adaptation
- Single column layout on mobile devices
- Collapsible sections for space efficiency
- Touch-optimized button sizing
- Readable typography across screen sizes

### Mobile Considerations
- Swipe-friendly filter toggles
- Appropriate touch targets (44px minimum)
- Scroll-aware positioning
- Thumb-friendly interaction zones

## Accessibility Features

### Keyboard Navigation
- Tab order through filter controls
- Enter/Space activation for buttons
- Arrow key navigation for button groups
- Focus management and visual indicators

### Screen Reader Support
- Semantic button roles and labels
- Filter state announcements
- Clear action descriptions
- Status change notifications