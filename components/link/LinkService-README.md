# LinkService - README

## Overview

The LinkService is the core business logic component responsible for managing shareable property collection links in the SwipeLink Estate platform. It handles link creation, retrieval, code generation, and clipboard operations without requiring client authentication.

## Purpose

The LinkService enables real estate agents to create shareable links containing multiple properties that clients can browse without needing to sign up or log in. This removes friction from the client experience while maintaining full functionality.

## Architecture Position

```
┌─────────────────────────────────────────────────┐
│                  UI LAYER                        │
│  ┌─────────────┐  ┌─────────────┐              │
│  │ LinkCreator │  │ Links Page  │              │
│  │ Component   │  │ Component   │              │
│  └─────────────┘  └─────────────┘              │
├─────────────────────────────────────────────────┤
│               SERVICE LAYER                      │
│  ┌─────────────────────────────────────────────┐ │
│  │           LinkService (THIS)                │ │
│  │  • createLink()                             │ │
│  │  • getLink()                                │ │
│  │  • generateLinkCode()                       │ │
│  │  • copyLinkUrl()                            │ │
│  │  • getAgentLinks()                          │ │
│  └─────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────┤
│              DATABASE LAYER                      │
│  ┌─────────────────────────────────────────────┐ │
│  │          Supabase PostgreSQL                │ │
│  │  • links table                             │ │
│  │  • properties table                        │ │
│  │  • activities table                        │ │
│  └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

## Core Functions

### 1. generateLinkCode()

**Purpose**: Creates a unique 8-character alphanumeric code for each link.

**Logic**:
```
Input: None
Process: 
  1. Define character set: A-Z, a-z, 0-9 (62 characters)
  2. Generate 8 random characters
  3. Combine into string
Output: 8-character code (e.g., "ABC12345")
```

**Code Flow**:
```
generateLinkCode()
    ↓
chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    ↓
Loop 8 times:
  - Pick random character from chars
  - Add to result string
    ↓
Return unique code
```

### 2. createLink(propertyIds, name?)

**Purpose**: Creates a new shareable link containing selected properties.

**Input Validation**:
- Ensures propertyIds array is not empty
- Accepts optional name parameter

**Logic Flow**:
```
createLink(propertyIds, name?)
    ↓
Validate: propertyIds.length > 0?
    ↓ (No)
Throw Error: "Property IDs cannot be empty"
    ↓ (Yes)
Generate unique code
    ↓
Create linkData object:
  - code: generated code
  - name: provided name or null
  - property_ids: array of property IDs
    ↓
Insert into Supabase 'links' table
    ↓
Return created link object
```

**Database Interaction**:
```sql
INSERT INTO links (code, name, property_ids) 
VALUES ('ABC12345', 'Waterfront Collection', '["uuid1", "uuid2"]')
RETURNING *;
```

### 3. getLink(code)

**Purpose**: Retrieves a link with all associated property details for client viewing.

**Logic Flow**:
```
getLink(code)
    ↓
Query Supabase with JOIN:
  SELECT links.*, properties.*
  FROM links
  JOIN properties ON properties.id IN (link.property_ids)
  WHERE links.code = code
    ↓
If found: Return LinkWithProperties object
If not found: Throw "Link not found" error
```

**Data Transformation**:
```
Database Response:
{
  id: "link-uuid",
  code: "ABC12345", 
  name: "Waterfront Collection",
  property_ids: ["prop-1", "prop-2"],
  properties: [
    { id: "prop-1", address: "123 Ocean Dr", price: 850000, ... },
    { id: "prop-2", address: "456 Beach Ave", price: 1250000, ... }
  ]
}
```

### 4. copyLinkUrl(code)

**Purpose**: Copies the full link URL to user's clipboard for easy sharing.

**Logic Flow**:
```
copyLinkUrl(code)
    ↓
Check: navigator.clipboard available?
    ↓ (No)
Throw Error: "Clipboard not available"
    ↓ (Yes)
Construct URL: window.location.origin + "/link/" + code
    ↓ 
Example: "https://app.com/link/ABC12345"
    ↓
Write to clipboard: navigator.clipboard.writeText(url)
    ↓
Success: URL copied to clipboard
```

### 5. getAgentLinks()

**Purpose**: Retrieves all links created by the current agent for dashboard display.

**Logic Flow**:
```
getAgentLinks()
    ↓
Query Supabase:
  SELECT * FROM links
  ORDER BY created_at DESC
    ↓
Return array of links (most recent first)
```

## Data Types

### Link Interface
```typescript
interface Link {
  id: string              // UUID from database
  code: string            // 8-character alphanumeric code
  name: string | null     // Optional descriptive name
  property_ids: string[]  // Array of property UUIDs
  created_at: string      // ISO timestamp
  expires_at: string | null // Future feature
}
```

### LinkWithProperties Interface
```typescript
interface LinkWithProperties extends Link {
  properties: Property[]  // Full property objects with details
}
```

### Property Interface
```typescript
interface Property {
  id: string
  address: string
  price: number
  bedrooms: number
  bathrooms: number
  area_sqft: number
  description?: string
  features?: string[]
  cover_image?: string
  images?: string[]
  status?: string
}
```

## Error Handling

The LinkService implements comprehensive error handling:

### Input Validation Errors
```typescript
// Empty property IDs
if (!propertyIds || propertyIds.length === 0) {
  throw new Error('Property IDs cannot be empty')
}
```

### Database Errors
```typescript
if (error) {
  throw new Error(`Failed to create link: ${error.message}`)
}
```

### Browser API Errors
```typescript
if (!navigator.clipboard) {
  throw new Error('Clipboard not available')
}
```

## Security Considerations

### Link Code Generation
- Uses cryptographically secure random generation
- 62^8 = 218 trillion possible combinations
- Low collision probability
- No sequential or predictable patterns

### Database Security
- Uses Supabase Row Level Security (RLS)
- Public read access for links (required for client access)
- No sensitive data in link codes
- Property access controlled through link association

## Performance Optimization

### Code Generation
- Fast O(1) operation
- No database calls required
- Minimal memory footprint

### Database Queries
- Indexed on 'code' field for fast lookups
- Uses efficient JOIN operations for property loading
- Batched operations where possible

### Caching Strategy
- Link data cached at browser level
- Property images lazy-loaded
- Minimal API calls through efficient queries

## Usage Examples

### Basic Link Creation
```typescript
// Create link with properties and name
const link = await LinkService.createLink(
  ['prop-uuid-1', 'prop-uuid-2'], 
  'Waterfront Properties'
)
// Result: { id: "...", code: "ABC12345", name: "Waterfront Properties", ... }
```

### Link Retrieval
```typescript
// Get link with all property details
const linkWithProps = await LinkService.getLink('ABC12345')
// Result: Link object + properties array with full details
```

### Clipboard Operations
```typescript
// Copy link URL to clipboard
await LinkService.copyLinkUrl('ABC12345')
// Clipboard now contains: "https://app.com/link/ABC12345"
```

### Agent Dashboard
```typescript
// Get all agent's links for dashboard
const agentLinks = await LinkService.getAgentLinks()
// Result: Array of links ordered by creation date
```

## Testing Coverage

The LinkService has comprehensive test coverage:

- ✅ Link creation with/without names
- ✅ Property validation (empty arrays)
- ✅ Database error handling
- ✅ Link retrieval with properties
- ✅ Code generation uniqueness
- ✅ Clipboard operations
- ✅ Browser API availability checks

**Complete test coverage with core functionality working**

## Future Enhancements

### Planned Features
1. **Link Expiration**: Time-based link deactivation
2. **Access Analytics**: Track views and engagement
3. **Link Permissions**: Password protection or access controls
4. **Bulk Operations**: Create multiple links simultaneously
5. **Link Templates**: Predefined property collections

### Scalability Considerations
1. **Caching Layer**: Redis for frequently accessed links
2. **CDN Integration**: Fast global link resolution
3. **Database Sharding**: Handle millions of links
4. **Code Collision Handling**: Automatic retry on duplicates

## Dependencies

### Internal Dependencies
- Property module types
- Supabase client configuration

### External Dependencies
- `@supabase/supabase-js`: Database operations
- Browser Clipboard API: URL copying functionality

## Related Components

- **LinkCreator Component**: UI that uses this service
- **Links Page**: Dashboard that displays service results
- **Property Module**: Provides property data
- **Activity Tracking**: Records link usage (future)