# Link Management Module

## Purpose
Handles creation, sharing, and management of property collection links for the SwipeLink Estate platform. This module provides a complete system for agents to create shareable property collections and for clients to browse properties through shareable links.

## Architecture Integration

This module works with the centralized Property system:
- **Types**: Uses centralized types from `lib/supabase/types.ts`
- **Property Data**: Integrates with centralized PropertyService
- **Database**: Stores JSON property_ids arrays in PostgreSQL
- **Link Structure**: Generates 8-character alphanumeric codes for easy sharing

## Public API

| Function | Input | Output | Purpose |
|----------|-------|--------|---------|
| **LinkService.createLink** | propertyIds[], name? | Link | Generate shareable link with property collection |
| **LinkService.getLink** | code | LinkWithProperties | Retrieve link with full property data |
| **LinkService.generateLinkCode** | - | string | Generate unique 8-char alphanumeric code |
| **LinkService.copyLinkUrl** | code | void | Copy complete URL to clipboard |
| **LinkService.getAgentLinks** | - | Link[] | List all agent's created links |

## Type System

All types are integrated with the centralized type system:

```typescript
// From lib/supabase/types.ts
export type Link = Database['public']['Tables']['links']['Row']
export type LinkInsert = Database['public']['Tables']['links']['Insert']
export type LinkUpdate = Database['public']['Tables']['links']['Update']

// Enhanced type for UI
export interface LinkWithProperties extends Link {
  properties: Property[]  // Populated property data
}
```

## Dependencies

### Internal
- **lib/supabase/property.service.ts** - For property data retrieval
- **lib/supabase/types.ts** - Centralized type definitions
- **components/property** - Property display components

### External
- @supabase/supabase-js
- Clipboard API (for link sharing)
- React (for UI components)

## File Structure
```
link/
├── index.ts                      # Public exports
├── link.service.ts               # Business logic & database operations
├── components/                   # UI components
│   ├── LinkCreator.tsx          # Original wizard (348 lines - DEPRECATED)
│   ├── LinkCreatorV2.tsx        # New compliant orchestrator (106 lines) ✅
│   ├── PropertySelector.tsx     # Step 1: Property selection (111 lines) ✅
│   ├── LinkDetails.tsx          # Step 2: Link configuration (111 lines) ✅
│   ├── LinkSuccess.tsx          # Step 3: Success state (100 lines) ✅
│   ├── LinkCreator-README.md    # Detailed component documentation
│   ├── hooks/
│   │   └── useLinkCreation.ts   # State management hook (104 lines) ✅
│   └── __tests__/               # Component tests
│       ├── LinkCreator.test.tsx
│       ├── LinkCreatorV2.test.tsx
│       ├── PropertySelector.test.tsx
│       ├── LinkDetails.test.tsx
│       ├── LinkSuccess.test.tsx
│       └── useLinkCreation.test.tsx
└── __tests__/                   # Service tests
    └── link.service.test.ts
```

## Database Schema Integration

Links are stored with JSON property_ids for flexibility:

```sql
-- Links table schema
CREATE TABLE links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(8) UNIQUE NOT NULL,           -- Generated alphanumeric code
  name VARCHAR(255),                         -- Optional collection name
  property_ids JSON NOT NULL,                -- Array of property UUIDs as JSON
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP                       -- Optional expiration
);
```

**JSON Field Handling**:
```typescript
// Service stores property IDs as JSON string
const linkData: LinkInsert = {
  code: this.generateLinkCode(),
  name: name || null,
  property_ids: JSON.stringify(propertyIds)  // Store as JSON
}

// Service parses JSON when retrieving
const propertyIds = JSON.parse(link.property_ids as string) as string[]
```

## State Management
- **Server-Side Storage**: All links stored in Supabase PostgreSQL
- **Client-Side State**: React components manage UI state only
- **Property Integration**: Uses centralized PropertyService for property data
- **Real-Time Updates**: Can leverage Supabase real-time subscriptions

## Performance Considerations
- **Short Codes**: 8-character codes for easy sharing and fast lookups
- **Batch Property Loading**: Efficient `getPropertiesByIds()` for multiple properties
- **On-Demand Loading**: Property data loaded only when link is accessed
- **JSON Storage**: Flexible property_ids storage without additional tables
- **Database Indexes**: Unique index on code field for fast retrieval

## Test Coverage

### Service Layer Tests (`link.service.test.ts`)
- ✅ Link creation with/without names
- ✅ Property ID validation (empty arrays rejected)
- ✅ Database error handling and recovery
- ✅ Link retrieval with properties populated
- ✅ Code generation uniqueness and format
- ✅ Clipboard operations and browser compatibility
- ✅ Agent links listing and filtering

### Component Tests (`LinkCreator.test.tsx`)
- ✅ 3-step wizard flow (selection → details → success)
- ✅ Property selection and multi-select functionality
- ✅ Link name input and validation
- ✅ Error handling and loading states
- ✅ Navigation between steps
- ✅ Success state with link sharing
- ✅ Cancel and reset functionality

**Comprehensive test coverage implemented** (link module tests working with core functionality)

## Component Architecture

### LinkCreator Wizard Flow
```
Step 1: Property Selection
┌─────────────────────────────────────┐
│ Select Properties for Your Link     │
│                                     │
│ [PropertyCard] [PropertyCard]       │ ← Agent PropertyCard with selection
│ [PropertyCard] [PropertyCard]       │
│                                     │
│           [Next →]                  │
└─────────────────────────────────────┘

Step 2: Link Details  
┌─────────────────────────────────────┐
│ Link Details                        │
│                                     │
│ Collection Name: [____________]     │ ← Optional name input
│                                     │
│ Selected: 3 properties             │ ← Selection summary
│                                     │
│ [← Back]     [Create Link]          │
└─────────────────────────────────────┘

Step 3: Success
┌─────────────────────────────────────┐
│ Link Created Successfully! ✅       │
│                                     │
│ Code: ABC12345                      │
│ URL: swiplinkestate.com/link/ABC... │
│                                     │
│ [Copy Link] [Create Another]        │
└─────────────────────────────────────┘
```

## Usage Examples

### Basic Link Creation
```typescript
import { LinkService } from '@/components/link'

// Create a new link
const link = await LinkService.createLink(
  ['property-uuid-1', 'property-uuid-2'], 
  'Waterfront Collection'
)

console.log(`Link created: ${link.code}`) // e.g., "ABC12345"
```

### Complete LinkCreator Integration
```typescript
import { LinkCreator } from '@/components/link'

const AgentDashboard = () => {
  const [showLinkCreator, setShowLinkCreator] = useState(false)
  
  const handleLinkCreated = (link: Link) => {
    console.log('New link created:', link)
    setShowLinkCreator(false)
    // Refresh links list or show success message
  }
  
  return (
    <div>
      <button onClick={() => setShowLinkCreator(true)}>
        Create Property Link
      </button>
      
      {showLinkCreator && (
        <LinkCreator
          onLinkCreated={handleLinkCreated}
          onCancel={() => setShowLinkCreator(false)}
        />
      )}
    </div>
  )
}
```

### Link Retrieval for Clients
```typescript
// Client-side link access
const ClientLinkPage = ({ linkCode }: { linkCode: string }) => {
  const [linkData, setLinkData] = useState<LinkWithProperties | null>(null)
  
  useEffect(() => {
    const loadLink = async () => {
      try {
        const data = await LinkService.getLink(linkCode)
        setLinkData(data)
      } catch (error) {
        console.error('Link not found or expired')
      }
    }
    
    loadLink()
  }, [linkCode])
  
  return (
    <div>
      <h1>{linkData?.name || 'Property Collection'}</h1>
      <div className="property-grid">
        {linkData?.properties.map(property => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </div>
  )
}
```

## Error Handling Patterns

### Service Layer Error Handling
```typescript
try {
  const link = await LinkService.createLink(propertyIds, name)
  // Success handling
} catch (error) {
  if (error.message.includes('Property IDs cannot be empty')) {
    // Handle validation error
  } else if (error.message.includes('Failed to create link')) {
    // Handle database error
  } else {
    // Handle unexpected error
  }
}
```

### Component Error Boundaries
```typescript
// LinkCreator handles errors gracefully
const [error, setError] = useState<string | null>(null)

const handleCreateLink = async () => {
  try {
    setLoading(true)
    setError(null)
    const link = await LinkService.createLink(selectedPropertyIds, linkName)
    onLinkCreated(link)
  } catch (err) {
    setError('Failed to create link. Please try again.')
  } finally {
    setLoading(false)
  }
}
```

## Refactored Components (2025-08-19)

### LinkCreatorV2 Architecture
Following TDD methodology, the original 348-line LinkCreator.tsx was refactored into a multi-step wizard pattern:

#### LinkCreatorV2.tsx (106 lines) ✅
**Purpose**: Main orchestrator component for the 3-step wizard
**Features**:
- Coordinates step components and state management
- Handles property loading and error states
- Maintains all original functionality
- Complies with 200-line limit

```tsx
import LinkCreatorV2 from '@/components/link/components/LinkCreatorV2'

<LinkCreatorV2
  onLinkCreated={handleLinkCreated}
  onCancel={handleCancel}
/>
```

#### PropertySelector.tsx (111 lines) ✅
**Purpose**: Step 1 - Property selection with grid display
**Features**:
- Loads and displays properties using PropertyCard
- Multi-select functionality with visual feedback
- Selection count display
- Next/Cancel navigation

```tsx
import PropertySelector from '@/components/link/components/PropertySelector'

<PropertySelector
  selectedPropertyIds={selectedIds}
  onPropertySelect={handlePropertySelect}
  onNext={handleNext}
  onCancel={handleCancel}
/>
```

#### LinkDetails.tsx (111 lines) ✅
**Purpose**: Step 2 - Link configuration and naming
**Features**:
- Selected properties summary display
- Optional collection name input
- Back/Create navigation
- Loading states during link creation

```tsx
import LinkDetails from '@/components/link/components/LinkDetails'

<LinkDetails
  properties={properties}
  selectedPropertyIds={selectedIds}
  linkName={linkName}
  loading={loading}
  error={error}
  onBack={handleBack}
  onCreateLink={handleCreateLink}
  onLinkNameChange={handleLinkNameChange}
/>
```

#### LinkSuccess.tsx (100 lines) ✅
**Purpose**: Step 3 - Success state with sharing options
**Features**:
- Link creation success confirmation
- Shareable URL display and copy functionality
- Link details summary
- Create another link option

```tsx
import LinkSuccess from '@/components/link/components/LinkSuccess'

<LinkSuccess
  link={createdLink}
  selectedPropertyCount={selectedIds.length}
  copySuccess={copySuccess}
  onCopyLink={handleCopyLink}
  onCreateAnother={handleCreateAnother}
/>
```

#### useLinkCreation.ts (104 lines) ✅
**Purpose**: Custom hook for centralized state management
**Features**:
- Step navigation logic
- Property selection state
- Link creation workflow
- Error and loading state management

```tsx
import useLinkCreation from '@/components/link/components/hooks/useLinkCreation'

const {
  step,
  selectedPropertyIds,
  linkName,
  createdLink,
  loading,
  error,
  copySuccess,
  handlePropertySelect,
  handleNext,
  handleBack,
  handleLinkNameChange,
  handleCreateLink,
  handleCopyLink,
  handleCreateAnother
} = useLinkCreation()
```

### Migration Strategy
- ✅ **LinkCreatorV2**: Use for all new link creation workflows
- ⚠️ **LinkCreator**: Original deprecated, remove after migration complete
- ✅ **Step Components**: Reusable for other multi-step workflows
- ✅ **useLinkCreation**: Extend for other link-related functionality

### Testing Coverage
All refactored components include comprehensive test suites:
- Unit tests for individual step components
- Integration tests for complete wizard flow
- State management hook testing
- Error handling and edge cases
- User interaction testing

## Related Documentation

- **[LinkService README](./LinkService-README.md)** - Detailed service documentation
- **[LinkCreator README](./components/LinkCreator-README.md)** - Component implementation guide
- **[Property Module](../property/README.md)** - Property system integration
- **[Database Schema](../../lib/supabase/types.ts)** - Type definitions and schema
- **[MEMORY.md](../../MEMORY.md)** - Architectural decisions and patterns