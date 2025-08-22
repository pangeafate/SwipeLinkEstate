# ClientTemperatureBadge Component

## Purpose
Visual indicator component that displays client engagement temperature (hot, warm, cold) with color-coded styling and contextual icons to help agents quickly assess client readiness and prioritize outreach efforts.

## Architecture Context
ClientTemperatureBadge is a specialized UI component within the ClientProfile ecosystem that provides instant visual feedback on client engagement levels for rapid decision-making.

```
Client Data → ClientTemperatureBadge → Temperature Display
                                    → Color-Coded Styling
                                    → Icon Representation
```

## Core Functionality

### Temperature Classification
- Displays three temperature states based on engagement scores (See CRM-MASTER-SPECIFICATION.md Section 3.2):
  - Hot: 80-100 engagement score
  - Warm: 50-79 engagement score
  - Cold: 0-49 engagement score
- Maps temperature values to appropriate visual representations
- Provides contextual icons for each temperature level
- Maintains consistent styling across all temperature states

### Visual Design System
- Hot: Red background with fire icon (🔥) indicating high engagement (80-100)
- Warm: Orange background with lightning icon (⚡) showing moderate engagement (50-79)
- Cold: Gray background with snowflake icon (❄️) representing low engagement (0-49)
- Rounded pill design with proper padding and typography

## Component Dependencies

### Props Interface
- **temperature**: ClientTemperature enum ('hot' | 'warm' | 'cold')
- **large**: Optional boolean for size variation (default: false)

### Styling System
- Color mapping for each temperature state
- Responsive sizing based on large prop
- Border and typography consistency
- Icon integration with text labels

## Key Features

### Temperature Mapping
- Consistent color scheme across the application
- Intuitive icon selection for each temperature level
- Uppercase text formatting for emphasis
- Proper contrast ratios for accessibility

### Size Variations
- Standard size: px-2 py-1 text-xs for compact display
- Large size: px-4 py-2 text-sm for prominent display
- Flexible sizing based on context requirements
- Maintains proportions across size variations

### Visual Consistency
- Border styling with matching color themes
- Inline-flex layout for proper alignment
- Space management between icon and text
- Font weight consistency (medium) for readability

## Usage Patterns

ClientTemperatureBadge is used in:
1. **Client Profile Headers**: Primary temperature display
2. **Deal Cards**: Quick client assessment in pipeline view
3. **Client Lists**: Temperature column in data tables
4. **Dashboard Widgets**: Hot leads identification
5. **Activity Feeds**: Client temperature in activity context

## Integration Points

### Data Sources
- ClientProfile.temperature property
- Deal.clientTemperature from CRM data
- Real-time engagement score calculations
- Temperature update triggers from client interactions

### Context Usage
- Large variant for profile headers and detailed views
- Standard variant for list items and compact displays
- Color coordination with other CRM status indicators
- Integration with filtering and sorting by temperature

## Design System Integration

### Color Palette
- Hot: bg-red-100 text-red-800 border-red-200
- Warm: bg-orange-100 text-orange-800 border-orange-200
- Cold: bg-gray-100 text-gray-800 border-gray-200
- Consistent with overall CRM color scheme

### Typography
- Font weight: medium for balanced readability
- Text transformation: uppercase for temperature labels
- Size responsive: xs for standard, sm for large variant
- Icon-text spacing: space-x-1 for optimal visual balance

## Performance Considerations

### Optimization Features
- Lightweight component with minimal re-renders
- Static color mapping for efficient styling
- No complex calculations or side effects
- Efficient icon rendering without external dependencies

### Accessibility Features
- High contrast color combinations for all temperatures
- Semantic HTML structure for screen readers
- Clear visual hierarchy with icons and text
- Color-blind friendly icon usage for temperature identification