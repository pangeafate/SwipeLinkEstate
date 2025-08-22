# MetricCard Component

## Purpose
Specialized metric display component that presents numerical data and KPIs with color-coded styling to highlight important client engagement statistics and performance indicators within the CRM dashboard.

## Architecture Context
MetricCard is a key data visualization component within the ClientProfile ecosystem that transforms raw metrics into visually appealing, color-coded cards for quick performance assessment.

```
Client Metrics → MetricCard → Color-Coded Display
                           → Large Number Emphasis
                           → Label Description
```

## Core Functionality

### Metric Presentation
- Displays numerical values in large, prominent typography
- Provides descriptive labels for context and clarity
- Implements color coding for different metric types
- Maintains consistent card layout across all metrics

### Visual Hierarchy
- Large bold numbers (text-2xl font-bold) for primary data
- Smaller descriptive labels with reduced opacity
- Color-coordinated background and text combinations
- Border styling to reinforce color themes

## Component Dependencies

### Props Interface
- **label**: String describing the metric purpose
- **value**: String representing the numerical or text value
- **color**: Color theme ('blue' | 'green' | 'yellow' | 'red')

### Styling System
- Color mapping object for consistent theme application
- Background, text, and border color coordination
- Typography system for metric emphasis
- Padding and border radius for card consistency

## Key Features

### Color Theme System
- Blue: Default metrics, engagement scores, general KPIs
- Green: Positive metrics, like rates, successful outcomes
- Yellow: Warning or attention metrics, moderate performance
- Red: Critical metrics, issues requiring attention

### Data Emphasis
- Primary value displayed in 2xl bold typography
- Secondary label with reduced opacity (opacity-75)
- High contrast for readability across all color themes
- Clear visual hierarchy between value and description

### Consistent Styling
- Rounded corners (rounded-lg) for modern card design
- Consistent padding (p-4) across all color variations
- Border styling that complements background colors
- Responsive design for different screen sizes

## Usage Patterns

MetricCard is used in:
1. **Overview Tab**: Key metrics display (engagement score, active deals, like rate)
2. **Dashboard Widgets**: Performance indicators and KPIs
3. **Analytics Sections**: Statistical data presentation
4. **Client Summaries**: Important metric highlights
5. **Comparative Displays**: Side-by-side metric comparisons

## Integration Points

### Data Sources
- ClientProfile metrics (engagementScore, activeDeals, likeRate)
- CRM analytics and performance calculations
- Real-time data updates from client interactions
- Calculated fields and derived metrics

### Metric Types
- Engagement Score: Blue theme for neutral performance metrics
- Active Deals: Blue theme for activity-based metrics
- Like Rate: Green theme for positive performance indicators
- Conversion Rates: Color varies based on performance thresholds

## Design System Integration

### Color Palette Implementation
- Blue: bg-blue-50 text-blue-800 border-blue-200
- Green: bg-green-50 text-green-800 border-green-200
- Yellow: bg-yellow-50 text-yellow-800 border-yellow-200
- Red: bg-red-50 text-red-800 border-red-200

### Typography System
- Value text: text-2xl font-bold for maximum impact
- Label text: text-sm opacity-75 for supporting information
- High contrast combinations for accessibility compliance
- Consistent font family inheritance from system defaults

### Layout Consistency
- Fixed padding (p-4) for uniform card dimensions
- Border styling coordinated with color themes
- Rounded corners for cohesive design language
- Proper spacing for touch-friendly interactions

## Performance Considerations

### Optimization Features
- Static color mapping for efficient style application
- Minimal re-rendering with pure component behavior
- Lightweight DOM structure with essential elements only
- No complex calculations or side effects

### Accessibility Features
- High contrast color combinations for all themes
- Clear typography hierarchy for screen readers
- Semantic HTML structure for assistive technologies
- Color-coded information supplemented with text labels

## Metric Formatting

### Value Display
- Supports various data formats (numbers, percentages, ratios)
- Handles string formatting for different metric types
- Accommodates both absolute and relative values
- Maintains consistent display regardless of value length

### Context Awareness
- Color selection based on metric type and importance
- Label descriptions provide clear metric context
- Visual emphasis appropriate for each metric's significance
- Integration with overall dashboard color scheme

## Extensibility

### Future Enhancements
- Trend indicators (up/down arrows) for metric changes
- Click interactions for detailed metric drill-downs
- Animated transitions for value updates
- Tooltip support for additional metric context