# PropertyCarousel Component

A mobile-first property carousel component that displays properties in a responsive layout optimized for touch interactions. Displays exactly 4 properties in a 2x2 grid on mobile or horizontal carousel on desktop.

## Overview

The PropertyCarousel component is the main container for displaying multiple PropertyCard components in the SwipeLink Estate client interface. It adapts its layout based on screen size and provides touch-friendly navigation.

## Features

- **Mobile-first responsive design** - 2x2 grid on mobile, horizontal carousel on desktop
- **Touch gesture support** - Swipe left/right navigation on touch devices
- **Keyboard accessibility** - Arrow key navigation with proper focus management
- **Loading states** - Skeleton loading for all 4 property slots
- **Empty state handling** - Graceful fallback when no properties available
- **Virtual scrolling** - Performance optimization for large property lists
- **Navigation dots** - Optional visual navigation indicators
- **Screen reader support** - Proper ARIA labels and live regions

## Usage

### Basic Usage

```tsx
import { PropertyCarousel } from '@/components/client/PropertyCarousel'
import { createMockProperty } from '@/test/utils'

const properties = Array.from({ length: 4 }, (_, i) => 
  createMockProperty({ id: `property-${i}` })
)

<PropertyCarousel 
  properties={properties}
  onActionClick={(propertyId, action) => {
    console.log(`${action} action on property ${propertyId}`)
  }}
  onCardClick={(property) => {
    console.log('Property selected:', property.address)
  }}
/>
```

### With Action Buttons

```tsx
<PropertyCarousel 
  properties={properties}
  onActionClick={handlePropertyAction}
  onCardClick={handlePropertySelect}
  showActions={true}
/>
```

### With Navigation

```tsx
<PropertyCarousel 
  properties={properties}
  onActionClick={handlePropertyAction}
  onCardClick={handlePropertySelect}
  showNavigation={true}
  activeIndex={0}
  onNavigate={(index) => console.log('Navigated to:', index)}
/>
```

### With Swipe Gestures

```tsx
<PropertyCarousel 
  properties={properties}
  onActionClick={handlePropertyAction}
  onCardClick={handlePropertySelect}
  onSwipe={(direction) => {
    console.log('Swiped:', direction)
    // Handle navigation based on swipe direction
  }}
/>
```

### With Loading State

```tsx
<PropertyCarousel 
  properties={[]}
  onActionClick={handlePropertyAction}
  onCardClick={handlePropertySelect}
  loading={true}
/>
```

### With Bucket Integration

```tsx
<PropertyCarousel 
  properties={properties}
  onActionClick={handlePropertyAction}
  onCardClick={handlePropertySelect}
  currentBucket="new_properties"
  bucketCounts={{
    new_properties: 4,
    liked: 0,
    disliked: 0,
    considering: 0,
    schedule_visit: 0
  }}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `properties` | `Property[]` | required | Array of property objects to display |
| `onActionClick` | `(propertyId: string, action: PropertyAction) => void` | required | Handler for property action clicks |
| `onCardClick` | `(property: Property) => void` | required | Handler for property card clicks |
| `showActions` | `boolean` | `false` | Show action buttons on property cards |
| `loading` | `boolean` | `false` | Show loading skeleton state |
| `currentBucket` | `BucketType` | `'new_properties'` | Current active bucket |
| `bucketCounts` | `Record<BucketType, number>` | `undefined` | Property counts per bucket |
| `showNavigation` | `boolean` | `false` | Show navigation dots |
| `activeIndex` | `number` | `0` | Currently active property index |
| `onNavigate` | `(index: number) => void` | `undefined` | Navigation handler |
| `onSwipe` | `(direction: 'left' \| 'right') => void` | `undefined` | Swipe gesture handler |
| `virtualScrolling` | `boolean` | `false` | Enable virtual scrolling for large lists |
| `className` | `string` | `''` | Additional CSS classes |

## Responsive Behavior

### Mobile (< 768px)
- **Layout**: 2x2 grid layout
- **Scrolling**: Vertical scroll when needed
- **Touch**: Swipe gestures enabled
- **Cards**: Full width within grid cells
- **Spacing**: Compact 8px gaps

```css
.property-carousel {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  overflow-y: auto;
  max-height: 80vh;
}
```

### Desktop (≥ 768px)
- **Layout**: Horizontal carousel
- **Scrolling**: Horizontal scroll
- **Hover**: Enhanced hover states
- **Cards**: Fixed width (320px)
- **Spacing**: Generous 16px gaps

```css
.property-carousel {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  scroll-behavior: smooth;
}
```

## Touch Interactions

### Supported Gestures
- **Horizontal Swipe**: Navigate between properties
- **Tap**: Select property card
- **Long Press**: Show action menu (if implemented)

### Implementation
```tsx
const handleTouchStart = (event: React.TouchEvent) => {
  const touch = event.touches[0]
  setTouchStart({ x: touch.clientX, y: touch.clientY })
}

const handleTouchMove = (event: React.TouchEvent) => {
  // Calculate swipe direction and distance
  // Trigger onSwipe callback for navigation
}
```

## Keyboard Accessibility

### Navigation Keys
- **Arrow Right**: Next property (horizontal)
- **Arrow Left**: Previous property (horizontal)
- **Arrow Down**: Next row (mobile 2x2 grid)
- **Arrow Up**: Previous row (mobile 2x2 grid)
- **Tab**: Navigate through interactive elements
- **Enter/Space**: Activate focused element

### Focus Management
```tsx
const handleKeyDown = (event: React.KeyboardEvent) => {
  const cards = carouselRef.current?.querySelectorAll('[role="button"]')
  // Handle arrow key navigation with proper focus management
}
```

## Loading States

### Skeleton Loading
Shows 4 skeleton cards while properties are loading:

```tsx
{Array.from({ length: 4 }).map((_, index) => (
  <PropertyCard
    key={`skeleton-${index}`}
    loading={true}
    // ... other props
  />
))}
```

### Empty State
Displays helpful message when no properties available:

```tsx
<div className="flex flex-col items-center justify-center">
  <div className="text-6xl mb-4">🏠</div>
  <h3>No properties available</h3>
  <p>Check back later for new property listings</p>
</div>
```

## Performance Optimizations

### Memoization
- Component wrapped with `React.memo`
- Callback handlers memoized with `useCallback`
- Prevents unnecessary re-renders

### Virtual Scrolling
For large property lists (100+ items):
```tsx
<PropertyCarousel 
  properties={largePropertyList}
  virtualScrolling={true}
  // Only renders visible + buffer items
/>
```

### Image Optimization
- Lazy loading for non-visible properties
- Responsive image sizing
- WebP format with fallbacks

## Navigation Controls

### Dot Navigation
```tsx
{showNavigation && (
  <div className="flex justify-center space-x-2 mt-4">
    {properties.map((_, index) => (
      <button
        className={`w-2 h-2 rounded-full ${
          index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
        }`}
        onClick={() => handleNavigate(index)}
        aria-label={`Go to property ${index + 1}`}
      />
    ))}
  </div>
)}
```

## Accessibility Features

### ARIA Support
- `role="region"` for carousel container
- `aria-label="Property carousel"` for context
- `aria-live="polite"` for dynamic updates
- Proper button roles and labels

### Screen Reader Announcements
```tsx
<div className="sr-only" aria-live="polite">
  Showing {properties.length} properties
</div>
```

### Keyboard Navigation
- Full keyboard accessibility
- Logical tab order
- Visual focus indicators
- Skip links for screen readers

## Error Handling

### Invalid Property Data
```tsx
const validProperties = properties.filter(property => 
  property && 
  property.id && 
  property.price !== null && 
  property.address !== null
)
```

### Graceful Degradation
- Handles missing images
- Manages incomplete property data
- Provides fallback states

## Testing

### Test Coverage
- Unit tests for all interactions
- Touch gesture simulation
- Keyboard navigation tests
- Responsive behavior verification
- Accessibility compliance tests

### Running Tests
```bash
npm test NewPropertyCarousel.test.tsx
```

### Key Test Scenarios
- 4 properties rendering correctly
- Mobile 2x2 grid layout
- Desktop horizontal carousel
- Touch swipe gestures
- Keyboard navigation
- Loading and empty states

## Integration Examples

### With State Management
```tsx
import { usePropertyStore } from '@/stores/propertyStore'

const MyComponent = () => {
  const { properties, currentBucket, moveProperty } = usePropertyStore()
  
  return (
    <PropertyCarousel
      properties={properties[currentBucket]}
      currentBucket={currentBucket}
      onActionClick={(id, action) => moveProperty(id, action)}
      onCardClick={handlePropertyExpand}
    />
  )
}
```

### With BucketNavigation
```tsx
<div className="flex flex-col h-screen">
  <PropertyCarousel 
    properties={bucketProperties}
    currentBucket={activeBucket}
    onActionClick={handlePropertyAction}
    onCardClick={handlePropertySelect}
    className="flex-1"
  />
  <BucketNavigation 
    buckets={buckets}
    activeBucket={activeBucket}
    onBucketChange={setActiveBucket}
  />
</div>
```

## Styling

### CSS Classes
The component uses Tailwind CSS with semantic classes:
- `.property-carousel-container` - Main container
- Responsive grid/flex layouts
- Smooth scroll behavior
- Touch-friendly spacing

### Custom Scrollbar (Desktop)
```css
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
```

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Touch devices (iOS Safari, Android Chrome)
- Proper fallbacks for older browsers
- Progressive enhancement approach

## Contributing

When modifying this component:

1. Run tests: `npm test NewPropertyCarousel.test.tsx`
2. Test on multiple screen sizes
3. Verify touch gestures on real devices
4. Test keyboard navigation
5. Validate screen reader functionality
6. Update this README for new features

## Related Components

- [`PropertyCard`](./PropertyCard-README.md) - Individual property display
- [`PropertyModal`](./PropertyModal-README.md) - Expanded property view
- [`BucketNavigation`](./BucketNavigation-README.md) - Bucket management interface