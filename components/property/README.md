# Property Module

## Purpose
Handles property management operations including CRUD, display, and status management.

## Public API

| Function | Input | Output | Purpose |
|----------|-------|--------|---------|
| PropertyCard | Property, onClick | React.Component | Display property card |
| PropertyGrid | Property[] | React.Component | Grid layout for properties |
| getAllProperties | - | Property[] | List all active properties |
| createProperty | PropertyData | Property | Create new property |
| updateProperty | id, PropertyData | Property | Update existing property |
| deleteProperty | id | boolean | Soft delete property |

## Dependencies

### Internal
- lib/supabase (database queries)
- lib/utils/formatters (price, text formatting)
- lib/utils/validators (property validation)

### External
- @supabase/supabase-js
- React
- Next.js

## File Structure
```
property/
├── index.ts          # Public exports only
├── types.ts          # Property interfaces
├── property.service.ts # Business logic
├── property.queries.ts # Database queries
├── components/       # UI components
│   ├── PropertyCard.tsx
│   ├── PropertyGrid.tsx
│   └── PropertyDetail.tsx
└── __tests__/       # Module tests
```

## State Management
- Server Components for data fetching
- Client state via React useState for interactions
- Optimistic updates for status changes

## Performance Considerations
- Images optimized with Next.js Image component
- Lazy loading for property grids
- Debounced search filtering
- Cached property status updates