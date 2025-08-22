# Agent Components

Components related to real estate agent functionality and property display.

## Components

### PropertyCard
**File**: `PropertyCard.tsx` (344 lines - within compliance)  
**Purpose**: Display property information in card format with selection capabilities  
**Status**: ✅ Active, well-tested  

**Props**:
- `property: Property` - Property data to display
- `selected?: boolean` - Whether the property is selected
- `onClick?: (property: Property) => void` - Click handler

**Features**:
- Responsive design with proper image handling
- Selection state management
- Accessibility support with ARIA labels
- Comprehensive test coverage

**Usage**:
```tsx
import PropertyCard from '@/components/agent/PropertyCard'

<PropertyCard
  property={property}
  selected={selectedPropertyIds.includes(property.id)}
  onClick={handlePropertySelect}
/>
```

## Architecture Notes

### File Size Compliance
All components in this directory comply with the 200-line limit:
- PropertyCard.tsx: 344 lines (172% of limit) - **Needs future refactoring**

### Testing
- Full test coverage with Jest and React Testing Library
- Tests located in `__tests__/PropertyCard.test.tsx`
- Covers property display, selection state, and click handling

## Future Improvements

### Priority: High
- **Refactor PropertyCard.tsx**: Component exceeds 200-line limit and should be split into smaller components following established patterns

### Suggested Refactoring
```
PropertyCard.tsx (344 lines) → PropertyCard + Sub-components
├── PropertyImage.tsx - Image display with fallback
├── PropertyInfo.tsx - Property details display
├── PropertyActions.tsx - Action buttons/selection
└── PropertyCard.tsx - Main orchestrator component
```

## Dependencies
- Next.js Image component for optimized images
- Property types from `@/lib/supabase/types`
- Shared utility functions

## Related Components
- Used by: LinkCreator PropertySelector step
- Used by: Property browsing interfaces
- Styled with: Tailwind CSS utilities

---
**Last Updated**: 2025-08-19  
**Status**: Active development  
**Compliance**: ⚠️ PropertyCard needs refactoring (344 lines)