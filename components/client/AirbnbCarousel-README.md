# AirbnbCarousel Component

## Purpose
Provides an Airbnb-style horizontal scrolling carousel for displaying property cards with smooth navigation and responsive design.

## Current Status
✅ **COMPLIANT**: This component is within the 200-line limit (177 lines).

## Architecture Position
Part of the client interface module, this component provides a premium property browsing experience with Airbnb's design patterns.

## Functionality
- Horizontal scrolling property display
- Arrow navigation controls
- Smooth scroll animations
- Responsive grid layout
- Guest favorite indicators
- Loading skeleton states
- Scroll position detection

## Component Structure
Single component file implementing the complete carousel functionality.

## Data Flow
```
Properties Array → AirbnbCarousel
                    ├── Scroll Container
                    ├── Navigation Arrows
                    └── AirbnbPropertyCard (multiple)
```

## Props
```typescript
interface AirbnbCarouselProps {
  properties: Property[]           // Array of properties to display
  onPropertySelect: Function       // Handler for property selection
  onBucketAssign?: Function       // Handler for bucket assignment
  title?: string                  // Carousel title (default: "Popular homes")
  showGuestFavorites?: boolean    // Show guest favorite badges
  loading?: boolean               // Loading state
}
```

## Key Features

### Visual Design
- Clean, minimal Airbnb aesthetic
- 5 cards visible on desktop
- Responsive breakpoints for tablet/mobile
- Hidden scrollbar for cleaner look
- Subtle shadow effects on arrows

### Navigation
- Left/right arrow buttons
- Auto-hide arrows at scroll boundaries
- Smooth scroll animation
- Scroll by 3 cards at a time
- Keyboard accessible

### Performance
- Lazy loading support
- Efficient scroll position checking
- Event listener cleanup
- Optimized re-renders

## Usage Example

```tsx
import AirbnbCarousel from '@/components/client/AirbnbCarousel'

function HomePage() {
  return (
    <AirbnbCarousel
      properties={featuredProperties}
      onPropertySelect={handlePropertySelect}
      onBucketAssign={handleBucketAssign}
      title="Featured Properties"
      showGuestFavorites={true}
      loading={isLoading}
    />
  )
}
```

## Styling Details
- **Card Width**: 20% - 19.2px (for 5 cards with gaps)
- **Gap**: 24px (gap-6)
- **Arrow Size**: 32x32px circular buttons
- **Arrow Position**: 35% from top, outside container
- **Scroll Behavior**: Smooth with hidden scrollbar

## Accessibility Features
- Arrow buttons with aria-labels
- Keyboard navigation support
- Screen reader compatible
- Focus management
- Semantic HTML structure

## Browser Compatibility
- Modern browsers with CSS Grid support
- Smooth scroll polyfill may be needed for older browsers
- Custom scrollbar hiding for all browsers

## Dependencies
- React
- AirbnbPropertyCard component
- Property types
- Tailwind CSS for styling

## Known Issues
- None currently identified

## Future Improvements
- Touch gesture support for mobile
- Infinite scroll option
- Lazy loading for large datasets
- Customizable scroll distance
- Pagination indicators option
- Snap-to-card scrolling

## Testing Checklist
- [ ] Arrow navigation works correctly
- [ ] Scroll boundaries detected properly
- [ ] Responsive layout adjusts correctly
- [ ] Loading skeleton displays
- [ ] Guest favorites show correctly
- [ ] Keyboard navigation functional
- [ ] Smooth scrolling works

---
*Status: Production Ready*
*Priority: HIGH*