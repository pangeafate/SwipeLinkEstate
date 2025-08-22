# InfoCard Component

## Purpose
Standardized information display component that presents labeled data with accompanying icons in a consistent card format for client contact details and key attributes throughout the CRM interface.

## Architecture Context
InfoCard serves as a fundamental data presentation component within the ClientProfile ecosystem, ensuring consistent styling and layout for all client information displays.

```
Client Data → InfoCard → Icon + Label Display
                      → Value Presentation
                      → Consistent Card Styling
```

## Core Functionality

### Information Display
- Presents labeled information in a structured format
- Combines icons, labels, and values in a cohesive layout
- Maintains consistent visual hierarchy across all instances
- Handles various data types (email, phone, location, etc.)

### Visual Structure
- Icon-first layout for visual scanning
- Clear label-value relationship
- Gray background for subtle card separation
- Rounded corners for modern design aesthetic

## Component Dependencies

### Props Interface
- **label**: String for the field description
- **value**: String for the actual data value
- **icon**: String emoji for visual identification

### Styling System
- Fixed layout with flexbox for consistent alignment
- Gray background (bg-gray-50) for card differentiation
- Typography hierarchy with different weights and colors
- Consistent padding and spacing throughout

## Key Features

### Flexible Content Display
- Accommodates various types of client information
- Handles missing or "Not provided" data gracefully
- Consistent icon sizing and placement
- Scalable layout for different content lengths

### Visual Consistency
- Standardized card design across all usage contexts
- Consistent icon-text spacing (space-x-3)
- Typography differentiation: small gray labels, medium black values
- Rounded corners (rounded-lg) for cohesive design language

### Data Presentation
- Clear visual hierarchy with label above value
- Icon provides immediate context and visual interest
- Accommodates both short and long data values
- Maintains readability across all data types

## Usage Patterns

InfoCard is used in:
1. **Overview Tab**: Contact information display (email, phone, location)
2. **Client Details**: Basic information presentation
3. **Contact Sections**: Communication details layout
4. **Profile Summary**: Key client attributes display
5. **Quick Info Panels**: Essential client data at-a-glance

## Integration Points

### Data Sources
- ClientProfile properties (email, phone, location, source)
- Dynamic data from CRM system
- Form inputs and user-provided information
- System-generated client attributes

### Context Integration
- Grid layouts in responsive information sections
- Consistent styling with other profile components
- Integration with data validation and display logic
- Supports null/undefined value handling

## Design System Integration

### Layout System
- Flexbox-based internal structure (flex items-center space-x-3)
- Consistent padding (p-3) for uniform spacing
- Background color coordination with overall theme
- Responsive design considerations for mobile layouts

### Typography Hierarchy
- Label: text-sm text-gray-600 for secondary information
- Value: font-medium text-gray-900 for primary data emphasis
- Icon: text-xl for appropriate visual weight
- Consistent line heights and text alignment

### Color Palette
- Background: bg-gray-50 for subtle card separation
- Label text: text-gray-600 for secondary information
- Value text: text-gray-900 for primary data emphasis
- Maintains accessibility standards for contrast ratios

## Performance Considerations

### Optimization Features
- Lightweight component with minimal DOM structure
- No state management or complex calculations
- Static styling for efficient rendering
- Optimized for list rendering in information grids

### Accessibility Features
- Semantic HTML structure with proper hierarchy
- High contrast text for readability
- Icon supplemented with text for screen readers
- Proper spacing for touch targets on mobile devices

## Content Flexibility

### Data Type Support
- Email addresses with appropriate icons (📧)
- Phone numbers with mobile icons (📱)
- Location data with map pins (📍)
- Source attribution with link icons (🔗)
- Extensible for additional data types as needed

### Error Handling
- Graceful handling of missing data ("Not provided")
- Consistent display format regardless of data availability
- No breaking changes when data is null or undefined
- Maintains layout integrity with placeholder content