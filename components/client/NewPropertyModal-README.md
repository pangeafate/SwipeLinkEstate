# PropertyModal Component

An expanded property view modal that opens when a property card is tapped. Features a responsive layout with image gallery, detailed property information, and 4 action buttons for bucket management.

## Overview

The PropertyModal component provides a full-screen (mobile) or centered (desktop) modal view for displaying comprehensive property details. It integrates seamlessly with the PropertyCard and PropertyCarousel components to create a cohesive property browsing experience.

## Features

- **Responsive Layout** - Full-screen on mobile, centered modal on desktop
- **Image Gallery** - Multiple images with thumbnail navigation and keyboard support
- **Detailed Information** - Complete property specs, description, and features
- **4 Action Buttons** - Like, Dislike, Consider, Schedule Visit
- **Accessibility Compliant** - Focus management, ARIA labels, keyboard navigation
- **Touch-Friendly** - Optimized for mobile interactions
- **Smooth Animations** - Fade in/out transitions with proper timing

## Usage

### Basic Usage

```tsx
import { PropertyModal } from '@/components/client/PropertyModal'
import { createMockProperty } from '@/test/utils'

const [isOpen, setIsOpen] = useState(false)
const property = createMockProperty({
  id: 'property-1',
  address: '123 Main Street, Miami, FL',
  price: 450000,
  images: ['/images/prop-1.jpg', '/images/prop-2.jpg'],
  description: 'Beautiful waterfront property'
})

<PropertyModal
  isOpen={isOpen}
  property={property}
  onActionClick={(propertyId, action) => {
    console.log(`${action} action on ${propertyId}`)
    handleBucketAction(propertyId, action)
  }}
  onClose={() => setIsOpen(false)}
/>
```

### With Loading State

```tsx
<PropertyModal
  isOpen={isOpen}
  property={property}
  onActionClick={handleAction}
  onClose={handleClose}
  loading={isLoadingPropertyDetails}
/>
```

### With Context Information

```tsx
<PropertyModal
  isOpen={isOpen}
  property={property}
  onActionClick={handleAction}
  onClose={handleClose}
  currentBucket="new_properties"
  openedFrom="property-card"
/>
```

### Typical Integration Pattern

```tsx
const PropertyBrowser = () => {
  const [selectedProperty, setSelectedProperty] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleCardClick = (property) => {
    setSelectedProperty(property)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedProperty(null)
  }

  return (
    <>
      <PropertyCarousel
        properties={properties}
        onCardClick={handleCardClick}
        onActionClick={handlePropertyAction}
      />
      
      {selectedProperty && (
        <PropertyModal
          isOpen={isModalOpen}
          property={selectedProperty}
          onActionClick={handlePropertyAction}
          onClose={handleModalClose}
        />
      )}
    </>
  )
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | `boolean` | required | Whether modal is visible |
| `property` | `Property` | required | Property data to display |
| `onActionClick` | `(propertyId: string, action: PropertyAction) => void` | required | Action button handler |
| `onClose` | `() => void` | required | Modal close handler |
| `loading` | `boolean` | `false` | Show loading state |
| `currentBucket` | `BucketType` | `undefined` | Current bucket context |
| `openedFrom` | `string` | `undefined` | Context about modal trigger |
| `className` | `string` | `''` | Additional CSS classes |

## Action Buttons

### The 4 Standard Actions

1. **Like** (=M) - Move to Liked Properties bucket
2. **Dislike** (=N) - Move to Disliked Properties bucket  
3. **Consider** (>) - Move to Considering bucket
4. **Schedule Visit** (=Å) - Move to Schedule Visit bucket

### Touch-Friendly Design
- **Minimum 44px height** for all buttons
- **Clear visual feedback** on hover/press
- **Adequate spacing** between buttons
- **High contrast** text and backgrounds

## Accessibility Features

### Focus Management
- Stores previous focus on modal open
- Moves focus to close button
- Traps focus within modal
- Restores focus on modal close

### ARIA Support
- `role="dialog"` for modal container
- `aria-modal="true"` for modal behavior
- `aria-labelledby` pointing to property address
- `aria-describedby` pointing to property details
- Proper heading hierarchy

### Keyboard Navigation
- **Escape**: Close modal
- **Tab/Shift+Tab**: Navigate focusable elements
- **Arrow keys**: Navigate image gallery
- **Enter/Space**: Activate buttons

## Testing

### Running Tests
```bash
npm test NewPropertyModal.test.tsx
```

### Key Test Scenarios
- Modal open/close behavior
- Image gallery navigation
- Action button functionality  
- Keyboard accessibility
- Screen reader compatibility
- Responsive behavior
- Error state handling

## Related Components

- [`PropertyCard`](./PropertyCard-README.md) - Triggers the modal
- [`PropertyCarousel`](./PropertyCarousel-README.md) - Container for cards
- [`BucketNavigation`](./BucketNavigation-README.md) - Manages bucket state