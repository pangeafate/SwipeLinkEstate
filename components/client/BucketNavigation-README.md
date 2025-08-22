# BucketNavigation Component

A responsive navigation bar for switching between property buckets in the SwipeLink Estate client interface.

## Overview

The BucketNavigation component provides a fixed bottom navigation on mobile and static navigation on desktop for organizing properties into 5 distinct buckets: New Properties, Liked, Disliked, Considering, and Schedule Visit.

## Features

- **5 Property Buckets**: New Properties, Liked, Disliked, Considering, Schedule Visit
- **Dynamic Count Badges**: Real-time counters showing number of properties in each bucket
- **Responsive Design**: Fixed bottom navigation on mobile, static on desktop
- **Accessibility**: Full ARIA support, keyboard navigation, screen reader friendly
- **Visual Feedback**: Active state highlighting and smooth transitions
- **Touch Friendly**: Optimized touch targets for mobile devices

## Bucket Configuration

```typescript
const bucketConfig = {
  new_properties: { icon: '📦', label: 'New Properties', shortLabel: 'New' },
  liked: { icon: '❤️', label: 'Liked', shortLabel: 'Liked' },
  disliked: { icon: '👎', label: 'Disliked', shortLabel: 'Disliked' },
  considering: { icon: '🤔', label: 'Considering', shortLabel: 'Consider' },
  schedule_visit: { icon: '📅', label: 'Schedule Visit', shortLabel: 'Visit' }
}
```

## Props

```typescript
interface BucketNavigationProps {
  currentBucket: BucketType        // Currently selected bucket
  bucketCounts: Record<BucketType, number>  // Count of properties in each bucket
  onBucketChange: (bucket: BucketType) => void  // Callback when bucket changes
  className?: string               // Optional CSS classes
}
```

## Usage

### Basic Usage

```tsx
import BucketNavigation from './BucketNavigation'

function ClientInterface() {
  const [currentBucket, setCurrentBucket] = useState<BucketType>('new_properties')
  const bucketCounts = {
    new_properties: 12,
    liked: 3,
    disliked: 2,
    considering: 5,
    schedule_visit: 1
  }

  return (
    <BucketNavigation
      currentBucket={currentBucket}
      bucketCounts={bucketCounts}
      onBucketChange={setCurrentBucket}
    />
  )
}
```

### With Zustand Store

```tsx
import BucketNavigation from './BucketNavigation'
import { useBucketCounts, useCurrentBucket } from '../../stores/bucketStore'

function ClientInterface() {
  const bucketCounts = useBucketCounts()
  const { currentBucket, setCurrentBucket } = useCurrentBucket()

  return (
    <BucketNavigation
      currentBucket={currentBucket}
      bucketCounts={bucketCounts}
      onBucketChange={setCurrentBucket}
    />
  )
}
```

## Responsive Behavior

### Mobile (< 768px)
- Fixed position at bottom of screen
- Full width with equal spacing
- Abbreviated labels (e.g., "New", "Visit")
- Smaller icons and text
- Safe area padding for devices with notches

### Desktop (≥ 768px)
- Static positioning
- Centered with gap spacing
- Full labels (e.g., "New Properties", "Schedule Visit")
- Larger icons and text

## Visual Design

```
Mobile Layout:
┌────────────────────────────────────────────────────┐
│ [📦 New(12)] [❤️ Liked(3)] [👎 Disliked(2)] [🤔 Consider(5)] [📅 Visit(1)] │
└────────────────────────────────────────────────────┘

Desktop Layout:
    ┌─────────────────────────────────────────────────┐
    │  📦 New Properties(12)  ❤️ Liked(3)  👎 Disliked(2)  │
    │         🤔 Considering(5)  📅 Schedule Visit(1)        │
    └─────────────────────────────────────────────────┘
```

## Accessibility Features

### ARIA Support
- `role="navigation"` with descriptive label
- Individual button labels with counts
- `aria-current="true"` for active bucket
- Live region announcements for state changes

### Keyboard Navigation
- Tab navigation between buckets
- Enter and Space key activation
- Focus indicators with custom ring styling

### Screen Reader Support
- Descriptive button labels: "Liked bucket, 3 properties"
- Live region updates: "Liked selected, 3 properties"
- Proper semantic structure

## Badge Counter Features

### Count Display
- Shows actual count for numbers 1-99
- Shows "99+" for counts over 99
- Hides badge when count is 0

### Visual States
- Red background with white text
- Positioned at top-right of button
- Smooth opacity transitions
- Minimum width for single digits

## Component Structure

```
BucketNavigation/
├── index.tsx           # Main component
└── __tests__/
    └── BucketNavigation.test.tsx  # Test suite
```

## Testing

The component includes comprehensive tests covering:

- **Rendering**: All buckets, counts, and labels
- **Interactions**: Click and keyboard navigation
- **Responsive**: Mobile vs desktop behavior
- **Accessibility**: ARIA attributes and screen reader support
- **Badge Counters**: Zero counts, high counts, dynamic updates

### Running Tests

```bash
npm test -- --testPathPattern=BucketNavigation
```

## Styling

The component uses Tailwind CSS with responsive modifiers:

### Key Classes
- `fixed bottom-0` - Mobile positioning
- `bg-white border-t` - Navigation bar styling
- `text-red-500 bg-red-500` - Count badge styling
- `focus:ring-2 focus:ring-blue-500` - Accessibility focus states

### Custom CSS Variables (if using)
```css
:root {
  --bucket-nav-height: 80px;
  --bucket-nav-bg: #ffffff;
  --bucket-badge-color: #ef4444;
}
```

## Integration with Other Components

### PropertyCarousel
```tsx
// PropertyCarousel passes bucket assignments to BucketNavigation
<PropertyCarousel
  onBucketAssign={handleBucketAssign}
  selectedBuckets={selectedBuckets}
/>
<BucketNavigation
  bucketCounts={bucketCounts}
  currentBucket={currentBucket}
  onBucketChange={handleBucketChange}
/>
```

### PropertyModal
```tsx
// PropertyModal also handles bucket assignments
<PropertyModal
  onBucketAssign={handleBucketAssign}
  currentBucket={currentBucket}
/>
```

## Performance Considerations

- **Memoization**: Use React.memo if parent re-renders frequently
- **Event Handlers**: Stable callback references to prevent re-renders
- **State Updates**: Batched updates for bucket count changes

```tsx
// Optimized usage
const BucketNavigationMemo = React.memo(BucketNavigation)

const handleBucketChange = useCallback(
  (bucket: BucketType) => setCurrentBucket(bucket),
  [setCurrentBucket]
)
```

## Common Issues & Solutions

### Issue: Badge not updating
**Solution**: Ensure bucketCounts object reference changes when counts update

### Issue: Mobile navigation not fixed
**Solution**: Check viewport width detection and CSS classes

### Issue: Accessibility warnings
**Solution**: Verify all buttons have proper aria-label attributes

## Future Enhancements

- [ ] Drag and drop support for bucket organization
- [ ] Customizable bucket colors and icons
- [ ] Gesture-based navigation on mobile
- [ ] Bucket filtering and search
- [ ] Export/import bucket configurations

## Dependencies

- React 18+
- Tailwind CSS 3+
- @testing-library/react (for tests)
- @testing-library/jest-dom (for tests)