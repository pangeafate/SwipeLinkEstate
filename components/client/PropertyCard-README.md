# PropertyCard Component

A mobile-first property card component designed for the SwipeLink Estate client interface. Displays property information in a compact, tappable format with optional action buttons for bucket management.

## Overview

The PropertyCard component is the primary building block for displaying properties in the client carousel interface. It follows mobile-first design principles and provides accessible, touch-friendly interactions.

## Features

- **Mobile-first responsive design** - Optimized for mobile screens with proper touch targets
- **Action button integration** - 4 action buttons for bucket management (Like, Dislike, Consider, Schedule Visit)
- **Accessibility compliant** - Keyboard navigation, ARIA labels, screen reader support
- **Loading states** - Skeleton loading animation
- **Image optimization** - Next.js Image component with lazy loading
- **Performance optimized** - Memoized component to prevent unnecessary re-renders

## Usage

### Basic Usage

```tsx
import { PropertyCard } from '@/components/client/PropertyCard'
import { createMockProperty } from '@/test/utils'

const property = createMockProperty({
  id: 'property-1',
  address: '123 Main Street, Miami, FL',
  price: 450000,
  bedrooms: 3,
  bathrooms: 2,
  area_sqft: 1500,
  property_type: 'house',
  images: ['/images/property-1.jpg'],
  features: ['parking', 'garden']
})

<PropertyCard 
  property={property}
  onActionClick={(propertyId, action) => {
    console.log(`Action ${action} on property ${propertyId}`)
  }}
  onCardClick={(property) => {
    console.log('Card clicked:', property.address)
  }}
/>
```

### With Action Buttons

```tsx
<PropertyCard 
  property={property}
  onActionClick={handleAction}
  onCardClick={handleCardClick}
  showActions={true}
/>
```

### In Carousel Context

```tsx
<PropertyCard 
  property={property}
  onActionClick={handleAction}
  onCardClick={handleCardClick}
  carouselIndex={0}
  totalCards={4}
  currentBucket="new_properties"
/>
```

### Loading State

```tsx
<PropertyCard 
  property={property}
  onActionClick={handleAction}
  onCardClick={handleCardClick}
  loading={true}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `property` | `Property` | required | Property data object |
| `onActionClick` | `(propertyId: string, action: PropertyAction) => void` | required | Handler for action button clicks |
| `onCardClick` | `(property: Property) => void` | required | Handler for card tap/click |
| `showActions` | `boolean` | `false` | Whether to show action buttons |
| `loading` | `boolean` | `false` | Show loading skeleton |
| `carouselIndex` | `number` | `undefined` | Current index in carousel |
| `totalCards` | `number` | `undefined` | Total number of cards in carousel |
| `currentBucket` | `BucketType` | `undefined` | Current bucket context |
| `className` | `string` | `''` | Additional CSS classes |

## Property Actions

The component supports 4 predefined actions:

- `like` - Move to Liked Properties bucket
- `dislike` - Move to Disliked Properties bucket  
- `consider` - Move to Considering bucket
- `schedule_visit` - Move to Schedule Visit bucket

## Accessibility

### Keyboard Navigation
- **Tab**: Navigate to card
- **Enter/Space**: Activate card click
- **Tab**: Navigate through action buttons when visible

### Screen Reader Support
- Proper ARIA labels for all interactive elements
- Alt text for property images
- Semantic button roles

### Touch Targets
- Minimum 44px tap targets for action buttons
- Appropriate spacing between interactive elements
- Hover states for desktop users

## Mobile Design

### Responsive Behavior
- **Mobile (< 768px)**: Full width with optimized layout
- **Tablet (768px - 1024px)**: Constrained width with hover effects
- **Desktop (> 1024px)**: Card grid layout with enhanced interactions

### Touch Interactions
- Touch-friendly tap targets (min 44px)
- Appropriate hover states for non-touch devices
- Smooth transitions and micro-interactions

## Performance

### Optimizations
- Memoized with `React.memo`
- Lazy loading images with Next.js Image
- Efficient re-render prevention
- Optimized bundle size

### Image Handling
- WebP format support with fallbacks
- Responsive image sizing
- Proper loading priorities (eager for active cards)

## Testing

### Test Coverage
- Unit tests for all interactions
- Accessibility tests (keyboard, screen reader)
- Mobile responsiveness tests
- Performance tests (re-render prevention)
- Error state handling

### Running Tests
```bash
npm test PropertyCard.test.tsx
```

## Styling

### CSS Classes
The component uses Tailwind CSS with semantic class names:
- `.property-card` - Main card container
- Mobile-first responsive classes
- Hover and focus states
- Transition animations

### Customization
```tsx
<PropertyCard 
  className="custom-shadow border-2 border-blue-500"
  // ... other props
/>
```

## Integration

### With PropertyCarousel
```tsx
import { PropertyCarousel } from '@/components/client/PropertyCarousel'

<PropertyCarousel 
  properties={properties}
  onActionClick={handleAction}
  onCardClick={handleCardClick}
/>
```

### With BucketNavigation
```tsx
import { BucketNavigation } from '@/components/client/BucketNavigation'

<BucketNavigation 
  buckets={buckets}
  onBucketChange={handleBucketChange}
/>
```

## Error Handling

### Missing Images
- Graceful fallback to placeholder image
- Proper alt text for accessibility

### Invalid Property Data
- Defensive programming with default values
- Proper error boundaries in parent components

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Proper fallbacks for older browsers

## Contributing

When modifying this component:

1. Run tests: `npm test PropertyCard.test.tsx`
2. Test on mobile devices
3. Verify accessibility with screen readers
4. Update this README if adding new features

## Related Components

- [`PropertyCarousel`](./PropertyCarousel-README.md) - Container for multiple cards
- [`PropertyModal`](./PropertyModal-README.md) - Expanded property view
- [`BucketNavigation`](./BucketNavigation-README.md) - Bucket management interface