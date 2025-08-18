# PropertyService - README

## IMPORTANT ARCHITECTURAL CHANGE

**This PropertyService is now a RE-EXPORT from the centralized service at `lib/supabase/property.service.ts`.**

The Property module has been restructured to use a centralized architecture to prevent code duplication and ensure consistency across the application.

## Current Implementation

```typescript
// components/property/property.service.ts
// Re-export the centralized PropertyService from lib/supabase
export { PropertyService } from '@/lib/supabase/property.service'
```

## Why This Change?

### Previous Issues (FIXED)
- ❌ **Duplicate Services**: Multiple PropertyService classes existed
- ❌ **Type Divergence**: Different Property types in different locations
- ❌ **Inconsistent Status Values**: Components used different enum values than database
- ❌ **Maintenance Overhead**: Changes required updates in multiple places

### Current Architecture (IMPROVED)
- ✅ **Single Source of Truth**: All PropertyService logic in `lib/supabase/property.service.ts`
- ✅ **Centralized Types**: All Property types from `lib/supabase/types.ts`
- ✅ **Database Alignment**: PropertyStatus matches actual database values
- ✅ **Easy Maintenance**: Changes made in one place automatically propagate

## Complete API Reference

For full documentation of the PropertyService methods, see:
**📖 [lib/supabase/property.service.ts](/lib/supabase/property.service.ts)**

### Available Methods

| Method | Purpose | Input | Output |
|--------|---------|-------|--------|
| `getAllProperties()` | Get all active properties | - | `Property[]` |
| `getProperty(id)` | Get single property | `string` | `Property` |
| `createProperty(data)` | Create new property | `PropertyInsert` | `Property` |
| `updateProperty(id, data)` | Update property | `string, PropertyUpdate` | `Property` |
| `togglePropertyStatus(id)` | Toggle active/off-market | `string` | `Property` |
| `getPropertiesByIds(ids)` | Get multiple properties | `string[]` | `Property[]` |
| `searchProperties(query)` | Search properties | `string` | `Property[]` |
| `uploadPropertyImages(id, files)` | Upload images | `string, File[]` | `string[]` |

## Type System

All types are centralized in `lib/supabase/types.ts`:

```typescript
// Database-generated types
export type Property = Database['public']['Tables']['properties']['Row']
export type PropertyInsert = Database['public']['Tables']['properties']['Insert']
export type PropertyUpdate = Database['public']['Tables']['properties']['Update']

// Business logic types
export type PropertyStatus = 'active' | 'pending' | 'sold' | 'off-market'
```

## Usage in Components

### Import the Service
```typescript
import { PropertyService, type Property } from '@/components/property'
// OR directly from centralized location
import { PropertyService } from '@/lib/supabase/property.service'
import type { Property } from '@/lib/supabase/types'
```

### Basic Operations
```typescript
// Get all properties
const properties = await PropertyService.getAllProperties()

// Create new property
const newProperty = await PropertyService.createProperty({
  address: "123 Ocean Drive",
  price: 850000,
  bedrooms: 2,
  bathrooms: 2
})

// Toggle status between active/off-market
const updatedProperty = await PropertyService.togglePropertyStatus(propertyId)
```

## Status Management

### Database Values (CORRECT)
- `'active'` - Property is available for viewing/selling
- `'pending'` - Property is under contract/review
- `'sold'` - Transaction completed
- `'off-market'` - Temporarily unavailable

### Status Colors in UI
- **Active**: Green (`bg-green-500`)
- **Pending**: Yellow (`bg-yellow-500`)
- **Sold**: Blue (`bg-blue-500`)
- **Off-market**: Orange (`bg-orange-500`)

### Toggle Operation
```typescript
// Toggles between 'active' ↔ 'off-market' only
const property = await PropertyService.togglePropertyStatus(id)
// If was 'active' → becomes 'off-market'
// If was 'off-market' → becomes 'active'
```

## JSON Field Handling

Properties with JSON database fields (features, images) are handled correctly:

```typescript
// Database stores as JSON, service handles parsing
const property = await PropertyService.getProperty(id)

// Features array
const features = Array.isArray(property.features) 
  ? property.features as string[]
  : (property.features ? JSON.parse(property.features as string) : [])

// Images array  
const images = Array.isArray(property.images)
  ? property.images as string[]
  : (property.images ? JSON.parse(property.images as string) : [])
```

## Error Handling

All methods throw descriptive errors:

```typescript
try {
  const property = await PropertyService.getProperty(id)
  // Handle success
} catch (error) {
  // Error format: "Failed to fetch property: [specific error]"
  console.error(error.message)
}
```

## Performance Features

- **Batch Operations**: `getPropertiesByIds()` for efficient multi-property queries
- **Filtered Queries**: Only active properties returned by default
- **Database Indexes**: Optimized queries on status and created_at fields
- **Type Safety**: Full TypeScript support prevents runtime errors

## Testing

The centralized PropertyService has comprehensive test coverage:
- ✅ CRUD operations
- ✅ Status management
- ✅ Batch operations  
- ✅ Error handling
- ✅ JSON field parsing

**All tests passing** - See `lib/supabase/__tests__/property.service.test.ts`

## Migration Guide

If you have existing code using the old PropertyService:

### Before (OLD)
```typescript
import { PropertyService } from '@/components/property/property.service'

// Status enum usage
const property = { status: PropertyStatus.ACTIVE }
```

### After (NEW) 
```typescript
import { PropertyService } from '@/components/property'
// OR import { PropertyService } from '@/lib/supabase/property.service'

// String literal usage
const property = { status: 'active' as PropertyStatus }
```

## Related Documentation

- **[Property Module README](./README.md)** - Overview of entire Property module
- **[PropertyCard README](./components/PropertyCard-README.md)** - Generic PropertyCard component
- **[Agent PropertyCard README](../agent/PropertyCard-README.md)** - Agent-specific PropertyCard
- **[Database Types](../../lib/supabase/types.ts)** - All type definitions
- **[Centralized Service](../../lib/supabase/property.service.ts)** - Complete service implementation