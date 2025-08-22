# NewPropertyCard Component

## Purpose
Mobile-first property card component providing comprehensive property display with action buttons for bucket management.

## Current Status
⚠️ **WARNING**: This component exceeds the 200-line limit (228 lines). It needs to be refactored into smaller components.

## Architecture Position
Part of the client interface module, this component serves as the primary property display card with interactive actions.

## Functionality
- Property information display
- Action buttons (like/dislike/consider/visit)
- Image display with fallback
- Loading skeleton state
- Keyboard navigation support
- Price and area formatting
- Feature tags display
- Carousel position indicators

## Component Structure
Single component file that should be split into:
- Main card container
- Action buttons component
- Property details display
- Image display component

## Data Flow
```
Property Data → NewPropertyCard
                 ├── Image Display
                 ├── Property Details
                 ├── Feature Tags
                 └── Action Buttons
```

## Props
```typescript
interface PropertyCardProps {
  property: Property              // Property data to display
  onActionClick: Function        // Handler for action buttons
  onCardClick: Function          // Handler for card selection
  showActions?: boolean          // Show/hide action buttons
  loading?: boolean              // Loading state
  carouselIndex?: number         // Position in carousel
  totalCards?: number            // Total cards in carousel
  currentBucket?: BucketType     // Current bucket assignment
  className?: string             // Additional CSS classes
}
```

## Key Features

### Visual Design
- Card-based layout with shadow
- Hover and active states
- Rounded corners
- Responsive image display
- Clean typography
- Action button color coding

### Interactive Elements
- **Card Click**: Opens property details
- **Action Buttons**: 
  - 👎 Dislike (red)
  - 🤔 Consider (yellow)
  - 👍 Like (green)
  - 📅 Visit (blue)
- **Keyboard Navigation**: Enter/Space keys

### Content Display
- Price (formatted with currency)
- Address (truncated with ellipsis)
- Bed/bath/sqft details
- Property type badge
- Feature tags (max 3 shown)
- Carousel position indicator

## Usage Example

```tsx
import PropertyCard from '@/components/client/NewPropertyCard'

function PropertyList() {
  return (
    <PropertyCard
      property={propertyData}
      onActionClick={handleAction}
      onCardClick={handleCardClick}
      showActions={true}
      loading={false}
      carouselIndex={0}
      totalCards={5}
    />
  )
}
```

## Formatting Functions
- **formatPrice**: Currency formatting with Intl.NumberFormat
- **formatSquareFootage**: Number formatting with commas
- **formatPropertyType**: Capitalizes property type
- **formatFeature**: Formats feature names

## Accessibility Features
- Semantic HTML with button role
- Comprehensive aria-labels
- Keyboard navigation support
- Focus indicators
- Screen reader friendly
- 44px minimum touch targets

## Performance Optimizations
- React.memo for memoization
- Next.js Image optimization
- Responsive image sizing
- Conditional rendering
- Event delegation

## Styling Details
- **Card Width**: max-w-sm (24rem)
- **Image Height**: h-48 (12rem)
- **Touch Targets**: min-h-[44px]
- **Hover Effect**: scale-105
- **Active Effect**: scale-95
- **Shadow**: shadow-md to shadow-lg on hover

## Dependencies
- React
- Next.js Image component
- Property types
- Tailwind CSS

## Known Issues
- **Line Count**: Exceeds 200-line limit (228 lines)
- Needs refactoring into smaller components

## Refactoring Plan
1. Extract ActionButtons component
2. Extract PropertyImage component
3. Extract PropertyDetails component
4. Extract FeatureTags component
5. Keep main card as orchestrator

## Future Improvements
- Virtual tour indicator
- Favorite/save functionality
- Share button
- Map preview
- Price history
- Comparison checkbox
- Quick view modal
- Agent contact button

## Testing Checklist
- [ ] All action buttons trigger correctly
- [ ] Card click opens details
- [ ] Loading skeleton displays
- [ ] Image fallback works
- [ ] Keyboard navigation functional
- [ ] Price formatting correct
- [ ] Feature tags truncate properly
- [ ] Accessibility compliance

---
*Status: Needs Refactoring*
*Priority: MEDIUM*