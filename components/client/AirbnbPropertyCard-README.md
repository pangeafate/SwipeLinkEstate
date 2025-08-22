# AirbnbPropertyCard Component

## Purpose
Provides an Airbnb-style property card with clean design, wishlist functionality, and guest favorite badges.

## Current Status
✅ **COMPLIANT**: This component is within the 200-line limit (161 lines).

## Architecture Position
Part of the client interface module, this component displays individual properties in the Airbnb visual style.

## Functionality
- Property image display with hover effects
- Wishlist heart icon functionality
- Guest favorite badge display
- Location extraction from address
- Price calculation (monthly to nightly)
- Multiple image indicators
- Click to select property

## Component Structure
Single component file implementing complete card functionality.

## Data Flow
```
Property Data → AirbnbPropertyCard
                 ├── Image Display
                 ├── Wishlist Button
                 ├── Guest Favorite Badge
                 └── Property Details
```

## Props
```typescript
interface AirbnbPropertyCardProps {
  property: Property              // Property data to display
  isActive?: boolean             // Active state for eager loading
  onPropertySelect: Function     // Handler for property selection
  onBucketAssign?: Function      // Handler for wishlist/bucket assignment
  isVisible?: boolean            // Visibility state
  showGuestFavorite?: boolean    // Show guest favorite badge
}
```

## Key Features

### Visual Design
- Square aspect ratio images (1:1)
- Rounded corners (rounded-xl)
- White outlined heart icon
- Clean typography
- No card shadows
- Hover scale effect on images

### Interactive Elements
- **Heart Icon**: Toggle wishlist state
- **Card Click**: Select property
- **Image Hover**: Subtle zoom effect
- **Photo Dots**: Multiple image indicators

### Content Display
- Location (city, state extracted)
- Property type ("Individual host")
- Bed/bath count
- Nightly price (calculated from monthly)

## Usage Example

```tsx
import AirbnbPropertyCard from '@/components/client/AirbnbPropertyCard'

function PropertyGrid() {
  return (
    <AirbnbPropertyCard
      property={propertyData}
      isActive={isFirstCard}
      onPropertySelect={handlePropertySelect}
      onBucketAssign={handleWishlist}
      showGuestFavorite={true}
    />
  )
}
```

## Styling Details
- **Image**: Square aspect ratio with rounded-xl corners
- **Heart Icon**: 32x32 SVG with white stroke
- **Guest Badge**: White background with shadow
- **Text Sizes**: 15px for content
- **Hover Effect**: 5% scale on image

## State Management
- **isWishlisted**: Local state for heart icon
- Updates bucket assignment on wishlist toggle
- Converts between 'like' and 'pass' buckets

## Calculations
- **Nightly Price**: Monthly price ÷ 30
- **Location**: Extracts city and state from full address
- **Fallback**: "Miami, FL" if parsing fails

## Accessibility Features
- Semantic HTML with article role
- Aria labels for interactive elements
- Keyboard accessible buttons
- Screen reader friendly
- Proper focus management

## Performance Optimizations
- Lazy loading for non-active cards
- Eager loading for active card
- Optimized image rendering
- Minimal re-renders

## Dependencies
- React
- Property types
- Tailwind CSS for styling

## Known Issues
- None currently identified

## Future Improvements
- Image carousel functionality
- Superhost badge support
- Rating display
- Instant book indicator
- Availability calendar preview
- Virtual tour support
- Price breakdown tooltip

## Testing Checklist
- [ ] Wishlist toggle works correctly
- [ ] Property selection triggers handler
- [ ] Guest favorite badge displays
- [ ] Location parsing works
- [ ] Price calculation accurate
- [ ] Image loading optimization
- [ ] Hover effects smooth
- [ ] Accessibility compliance

---
*Status: Production Ready*
*Priority: HIGH*