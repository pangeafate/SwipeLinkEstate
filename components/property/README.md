# Property Module

## Purpose
Handles property management operations including CRUD, display, and status management. This module provides a centralized architecture for all property-related functionality with consolidated types and services.

## Architecture Changes (Latest)
**IMPORTANT:** This module now uses a centralized architecture:
- **Types**: All Property types are re-exported from `lib/supabase/types.ts` (single source of truth)
- **Service**: PropertyService is re-exported from `lib/supabase/property.service.ts` (centralized business logic)
- **Status Values**: PropertyStatus uses database values: `'active' | 'pending' | 'sold' | 'off-market'`

## Public API

| Function | Input | Output | Purpose |
|----------|-------|--------|---------|
| PropertyCard | Property, onClick | React.Component | Display property card (generic version) |
| PropertyService.getAllProperties | - | Property[] | List all active properties |
| PropertyService.createProperty | PropertyInsert | Property | Create new property |
| PropertyService.updateProperty | id, PropertyUpdate | Property | Update existing property |
| PropertyService.togglePropertyStatus | id | Property | Toggle between active/off-market |
| PropertyService.getProperty | id | Property | Get single property by ID |
| PropertyService.getPropertiesByIds | ids[] | Property[] | Get multiple properties for links |

## Type System

```typescript
// All types re-exported from lib/supabase/types.ts
export type Property = Database['public']['Tables']['properties']['Row']
export type PropertyInsert = Database['public']['Tables']['properties']['Insert']
export type PropertyUpdate = Database['public']['Tables']['properties']['Update']
export type PropertyStatus = 'active' | 'pending' | 'sold' | 'off-market'

// Component-specific interfaces
export interface PropertyCardProps {
  property: Property
  onClick?: (property: Property) => void
  showActions?: boolean
}
```

## Dependencies

### Internal
- **lib/supabase/property.service.ts** (centralized business logic)
- **lib/supabase/types.ts** (centralized type definitions)
- lib/utils/formatters (price, text formatting)
- lib/utils/validators (property validation)

### External
- @supabase/supabase-js
- React
- Next.js

## File Structure
```
property/
├── index.ts              # Re-exports centralized service and types
├── types.ts              # Re-exports from lib/supabase/types.ts
├── property.service.ts   # Re-exports from lib/supabase/property.service.ts
├── components/           # UI components
│   ├── PropertyCard.tsx      # Generic property card component
│   ├── PropertyForm.tsx      # Original form (380 lines - DEPRECATED)
│   ├── PropertyFormV2.tsx    # New compliant form (185 lines) ✅
│   ├── FormInput.tsx         # Reusable form input (48 lines) ✅
│   ├── hooks/
│   │   └── usePropertyValidation.ts  # Validation hook (146 lines) ✅
│   └── __tests__/           # Component tests
│       ├── PropertyForm.test.tsx
│       ├── PropertyFormV2.test.tsx
│       ├── FormInput.test.tsx
│       └── usePropertyValidation.test.tsx
└── __tests__/           # Module tests
```

## Component Usage

### Generic PropertyCard
```typescript
import { PropertyService, PropertyCard, type Property } from '@/components/property'

// For general property display
<PropertyCard 
  property={property} 
  onClick={(property) => handleClick(property)} 
/>
```

### Agent-Specific PropertyCard
```typescript
import PropertyCard from '@/components/agent/PropertyCard'

// For agent dashboard with selection and edit capabilities
<PropertyCard 
  property={property}
  selected={isSelected}
  onClick={(property) => handleSelection(property)}
  onEdit={(property) => handleEdit(property)}
/>
```

## Status Management
- **Database Values**: Uses actual database enum values (`'active'`, `'pending'`, `'sold'`, `'off-market'`)
- **Toggle Operation**: `togglePropertyStatus()` switches between `'active'` ↔ `'off-market'`
- **Color Coding**: 
  - Active: Green (`bg-green-500`)
  - Pending: Yellow (`bg-yellow-500`) 
  - Sold: Blue (`bg-blue-500`)
  - Off-market: Orange (`bg-orange-500`)

## State Management
- Server Components for data fetching via centralized PropertyService
- Client state via React useState for interactions
- Optimistic updates for status changes

## Performance Considerations
- Images optimized with Next.js Image component
- Lazy loading for property grids
- Debounced search filtering
- Cached property status updates
- JSON field handling for features and images arrays

## Refactored Components (2025-08-19)

### PropertyFormV2 Architecture
Following TDD methodology, the original 380-line PropertyForm.tsx was refactored into:

#### PropertyFormV2.tsx (185 lines) ✅
**Purpose**: Main form orchestrator component
**Features**:
- Integrates FormInput and usePropertyValidation
- Handles form submission and error states
- Maintains all original functionality
- Complies with 200-line limit

```tsx
import PropertyFormV2 from '@/components/property/components/PropertyFormV2'

<PropertyFormV2 
  onPropertyCreated={handlePropertyCreated}
  onCancel={handleCancel}
/>
```

#### FormInput.tsx (48 lines) ✅
**Purpose**: Reusable form input component with validation
**Features**:
- Consistent styling and behavior
- Error state display
- Required field indicators
- Accessibility support

```tsx
import FormInput from '@/components/property/components/FormInput'

<FormInput
  id="address"
  label="Property Address"
  value={formData.address}
  onChange={handleInputChange}
  error={errors.address}
  required={true}
/>
```

#### usePropertyValidation.ts (146 lines) ✅
**Purpose**: Custom hook for form validation business logic
**Features**:
- Field-specific validation rules
- Real-time validation feedback
- Centralized error management
- Reusable across forms

```tsx
import usePropertyValidation from '@/components/property/components/hooks/usePropertyValidation'

const { errors, validateField, validateAll, clearErrors } = usePropertyValidation()
```

### Migration Strategy
- ✅ **PropertyFormV2**: Use for all new property creation
- ⚠️ **PropertyForm**: Original deprecated, remove after migration complete
- ✅ **FormInput**: Reuse for other form implementations
- ✅ **usePropertyValidation**: Extend for other property-related forms

### Testing Coverage
All refactored components include comprehensive test suites:
- Unit tests for individual components
- Integration tests for form workflows
- Validation logic testing
- Error state handling
- Accessibility compliance testing