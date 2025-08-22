# PipelineStageHeader Component

## Purpose
Displays professional Pipedrive-style stage headers with deal counts and monetary totals for CRM pipeline visualization.

## Component Architecture

```
PipelineStageHeader/
├── Visual Display Layer
│   ├── Stage name (prominent)
│   ├── Monetary total with currency
│   └── Deal count with proper pluralization
├── Interaction Layer
│   ├── Collapse/expand functionality
│   └── Hover states for additional info
└── Data Layer
    ├── Real-time metric updates
    └── Currency formatting logic
```

## Visual Design Specifications

### Layout Structure
```
┌─────────────────────────────────────┐
│ Stage Name                          │
│ $125,000 · 4 deals                  │
└─────────────────────────────────────┘
```

### Design Tokens
- **Height**: 48px fixed
- **Background**: Transparent (inherits from parent)
- **Border**: 2px solid bottom (#e0e0e0)
- **Typography**:
  - Stage name: 14px medium weight, color #333
  - Metrics: 13px regular weight, color #666
- **Spacing**: 12px vertical, 16px horizontal padding
- **Hover State**: Subtle background tint (rgba(0,0,0,0.02))

## Component Integration

### Parent Components
- `DealPipeline.tsx` - Main pipeline container that renders multiple stage headers
- `PipelineStage.tsx` - Individual stage container that includes header

### Child Components
- `StageMetrics.tsx` - Handles monetary and count display formatting
- `StageHeaderSkeleton.tsx` - Loading state placeholder

### Data Flow
```
DealPipeline
    ↓ (stage data)
PipelineStageHeader
    ├── StageMetrics (formatting)
    └── StageHeaderSkeleton (loading)
```

## Props Interface

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| stageName | string | Yes | - | Display name of the pipeline stage |
| stageKey | string | Yes | - | Unique identifier for the stage |
| dealCount | number | Yes | - | Number of deals in this stage |
| totalValue | number | Yes | - | Sum of all deal values in stage |
| currency | string | No | 'USD' | Currency code for formatting |
| color | string | No | - | Optional accent color for stage |
| isCollapsible | boolean | No | false | Enable collapse/expand functionality |
| onCollapse | function | No | - | Callback when collapse state changes |
| isLoading | boolean | No | false | Show skeleton loading state |

## State Management

The component maintains minimal internal state:
- `isCollapsed` - Boolean for collapse/expand state (if collapsible)
- `isHovered` - Boolean for hover state styling

External state (deal counts, values) is managed by the parent pipeline component and passed as props.

## Behavior Patterns

### Currency Formatting
- Uses `Intl.NumberFormat` for locale-aware formatting
- Abbreviates large numbers (e.g., $1.2M instead of $1,200,000)
- Handles multiple currency symbols correctly

### Deal Count Display
- Singular: "1 deal"
- Plural: "X deals"
- Zero state: "No deals"
- Loading state: Shows skeleton placeholder

### Collapse Interaction
When `isCollapsible` is true:
1. Chevron icon appears on the right
2. Click toggles collapsed state
3. Parent receives callback with new state
4. Smooth animation for height transition

## Performance Considerations

- **Memoization**: Component is wrapped in `React.memo` to prevent unnecessary re-renders
- **Number Formatting**: Cached formatter instances to avoid recreation
- **Animation**: CSS transitions instead of JavaScript for smooth performance
- **Skeleton Loading**: Prevents layout shift during data loading

## Accessibility Features

- **ARIA Labels**: Proper labeling for screen readers
- **Keyboard Navigation**: Space/Enter to toggle collapse
- **Focus Indicators**: Visible focus ring for keyboard users
- **Color Contrast**: Meets WCAG AA standards (4.5:1 ratio)
- **Semantic HTML**: Uses appropriate heading levels

## Testing Approach

### Unit Tests
- Renders stage name correctly
- Formats currency values properly
- Handles pluralization of deal count
- Collapse/expand functionality works
- Loading state displays skeleton

### Integration Tests
- Updates when pipeline data changes
- Maintains state during re-renders
- Handles missing or invalid data gracefully

### Visual Tests
- Matches Pipedrive design specifications
- Hover states work correctly
- Responsive at different viewport sizes

## Usage Example

```typescript
// Basic usage
<PipelineStageHeader
  stageName="Qualified"
  stageKey="qualified"
  dealCount={4}
  totalValue={125000}
  currency="USD"
/>

// With collapse functionality
<PipelineStageHeader
  stageName="Contact Made"
  stageKey="contact_made"
  dealCount={12}
  totalValue={450000}
  currency="EUR"
  isCollapsible={true}
  onCollapse={(isCollapsed) => handleStageCollapse('contact_made', isCollapsed)}
  color="#4ECDC4"
/>

// Loading state
<PipelineStageHeader
  stageName=""
  stageKey="loading"
  dealCount={0}
  totalValue={0}
  isLoading={true}
/>
```

## Error Handling

- **Invalid Numbers**: Defaults to 0 for NaN values
- **Missing Currency**: Falls back to USD
- **Null Props**: Handles gracefully with default values
- **Format Errors**: Logs warning and shows raw value

## Browser Compatibility

- Modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Progressive enhancement for older browsers
- Graceful degradation of animations in IE11

## Related Components

- `PipelineStage.tsx` - Container for stage content
- `DealCard.tsx` - Individual deal cards within stages
- `PipelineFilters.tsx` - Filtering controls above pipeline
- `StageMetrics.tsx` - Reusable metrics formatting component

## Future Enhancements

- [ ] Drag handle for reordering stages
- [ ] Inline editing of stage names
- [ ] Custom color themes per stage
- [ ] Export stage data functionality
- [ ] Stage-specific quick actions menu