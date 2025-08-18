# Agent PropertyCard Component - README

## Overview

The Agent PropertyCard is a specialized version of the PropertyCard component designed specifically for real estate agent interfaces. It extends the base PropertyCard with agent-focused features like edit buttons, selection states, and management controls while maintaining the same visual design and user experience.

## Purpose

This component serves as the primary property display interface for agent-facing tools, providing quick access to property management functions while preserving the clean, professional appearance that agents can confidently show to clients. It bridges the gap between property viewing and property management.

## Architecture Position

```
┌─────────────────────────────────────────────────┐
│                AGENT LAYER                       │
│  ┌─────────────┐  ┌─────────────┐              │
│  │   Agent     │  │ Property    │              │
│  │ Dashboard   │  │ Management  │              │
│  └─────────────┘  └─────────────┘              │
│                                                 │
│  ┌─────────────┐  ┌─────────────┐              │
│  │ LinkCreator │  │ Portfolio   │              │
│  │ Selection   │  │ Manager     │              │
│  └─────────────┘  └─────────────┘              │
├─────────────────────────────────────────────────┤
│              COMPONENT LAYER                     │
│  ┌─────────────────────────────────────────────┐ │
│  │        Agent PropertyCard (THIS)            │ │
│  │  • Base PropertyCard features               │ │
│  │  • Agent-specific controls                  │ │
│  │  • Edit button with hover reveal            │ │
│  │  • Selection state management               │ │
│  │  • Management action integration            │ │
│  └─────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────┤
│               UTILITY LAYER                      │
│  ┌─────────────────────────────────────────────┐ │
│  │      Shared Formatting Utils               │ │
│  │  • formatPrice()                            │ │
│  │  • formatBedsBaths()                        │ │
│  │  • formatArea()                             │ │
│  │  • formatShortAddress()                     │ │
│  │  • formatFeatures()                         │ │
│  └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

## Key Differences from Base PropertyCard

### 1. Agent-Specific Features

**Edit Button Integration**:
```
Standard PropertyCard:                Agent PropertyCard:
┌─────────────────────┐              ┌─────────────────────┐
│  ● Status   $850K   │              │  ● Status   $850K   │
│                     │              │                     │
│   Property Image    │              │   Property Image    │
│                     │              │              [Edit] │ ← Hover reveal
│                     │              │                     │
└─────────────────────┘              └─────────────────────┘
```

**Selection State Management**:
```css
/* Visual selection feedback for agents */
.agent-property-card.selected {
  ring: 2px solid #3b82f6;    /* Blue selection ring */
  ring-opacity: 0.5;
  background: #eff6ff;         /* Subtle blue background */
}
```

**Off-Market Handling**:
```css
/* Dimmed appearance for off-market properties */
.agent-property-card.off-market {
  opacity: 0.75;              /* Reduced opacity */
  filter: grayscale(20%);     /* Subtle desaturation */
}
```

### 2. Enhanced Props Interface

```typescript
interface AgentPropertyCardProps {
  property: Property                    // Required property data
  selected?: boolean                   // Selection state (for multi-select)
  onClick?: (property: Property) => void    // Card click handler  
  onEdit?: (property: Property) => void     // Edit button handler
}
```

**New Props Explained**:

**selected**: 
- Boolean flag for multi-select interfaces
- Adds visual selection indicators
- Used in LinkCreator and bulk operations

**onEdit**:
- Agent-specific callback for property editing
- Triggers edit modal or navigation
- Prevents event bubbling to main onClick

## Core Functions

### 1. handleCardClick()

**Purpose**: Handles main card clicks while preserving agent workflow.

**Implementation**:
```typescript
const handleCardClick = () => {
  if (onClick) {
    onClick(property)  // Selection, navigation, or detail view
  }
}
```

**Agent Use Cases**:
- **Property Selection**: Toggle in LinkCreator interface
- **Quick View**: Open property details in modal
- **Status Changes**: Quick status update workflows
- **Bulk Operations**: Multi-select for batch actions

### 2. handleEditClick(e)

**Purpose**: Handles edit button clicks with proper event management.

**Event Handling Logic**:
```typescript
const handleEditClick = (e: React.MouseEvent) => {
  e.stopPropagation()  // Prevent card click from firing
  if (onEdit) {
    onEdit(property)   // Open edit interface
  }
}
```

**Why Event Stop Propagation?**:
```
Without stopPropagation():
Edit Click → Card Click → Unwanted selection/navigation

With stopPropagation(): 
Edit Click → Only edit action triggered ✓
```

**Agent Edit Workflows**:
- **Inline Editing**: Edit price/status without page navigation
- **Full Edit Modal**: Complete property editing interface  
- **Quick Actions**: Status updates, feature flags, etc.

### 3. getStatusColor() - Enhanced

**Purpose**: Maps property status to visual indicators with agent context awareness.

**Current Implementation** (Updated to match database schema):
```typescript
const getStatusColor = () => {
  switch (property.status) {
    case 'active':
      return 'bg-green-500'     // Good to show clients
    case 'pending':  
      return 'bg-yellow-500'    // Needs attention
    case 'sold':
      return 'bg-blue-500'      // Archive/reference only
    case 'off-market':
      return 'bg-orange-500'    // Agent decision - FIXED from gray
    default:
      return 'bg-gray-400'      // Unknown/other status
  }
}
```

**IMPORTANT ARCHITECTURAL UPDATE**:
- ✅ Status values now match database: `'active' | 'pending' | 'sold' | 'off-market'`
- ✅ Off-market properties show **orange** indicator (not gray)
- ✅ Consistent with centralized PropertyStatus type system
- ✅ All status colors align across generic and agent PropertyCards

**Agent Status Meanings**:
- **Green (Active)**: Ready for client presentations
- **Yellow (Pending)**: Requires follow-up actions  
- **Blue (Sold)**: Success metrics, reference material
- **Orange (Off-Market)**: Strategic agent decision - temporarily unavailable
- **Gray (Other)**: Unknown status, needs agent review

## Agent-Specific Visual Features

### Edit Button Design

**Hover Reveal Pattern**:
```css
/* Hidden by default */
.edit-button {
  position: absolute;
  bottom: 12px;
  right: 12px;
  opacity: 0;
  transition: opacity 200ms ease;
}

/* Revealed on card hover */
.property-card:hover .edit-button {
  opacity: 1;
}

/* Button styling */
.edit-button {
  background: #2563eb;        /* Professional blue */
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
}

.edit-button:hover {
  background: #1d4ed8;        /* Darker on hover */
}
```

**Accessibility Considerations**:
```html
<!-- Always accessible via keyboard -->
<button
  onClick={handleEditClick}
  aria-label={`Edit property at ${property.address}`}
  className="edit-button"
>
  Edit
</button>
```

### Selection State Indicators

**Visual Selection Feedback**:
```css
/* Selected state styling */
.agent-property-card.selected {
  box-shadow: 0 0 0 2px #3b82f6;  /* Blue ring */
  background-color: #eff6ff;       /* Light blue background */
  position: relative;
}

/* Selection checkmark (optional enhancement) */
.agent-property-card.selected::after {
  content: "✓";
  position: absolute;
  top: 8px;
  right: 8px;
  background: #3b82f6;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}
```

### Off-Market Property Handling

**Reduced Emphasis**:
```typescript
// Conditional styling based on property status
className={`
  bg-white rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer group
  ${selected ? 'ring-2 ring-primary-500' : ''}
  ${property.status === 'off-market' ? 'opacity-75' : ''}
`}
```

**Agent Context**:
- Off-market properties still visible to agents
- Reduced visual emphasis indicates unavailable to clients
- Agents can still edit, manage, and potentially reactivate

## Agent Workflow Integration

### Property Management Dashboard

```typescript
const AgentDashboard = () => {
  const [properties, setProperties] = useState<Property[]>([])
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  
  const handlePropertyClick = (property: Property) => {
    setSelectedProperty(property)
    // Show property details panel
  }
  
  const handlePropertyEdit = (property: Property) => {
    setEditingProperty(property)
    setShowEditModal(true)
  }
  
  return (
    <div className="agent-dashboard">
      <div className="properties-grid">
        {properties.map(property => (
          <PropertyCard
            key={property.id}
            property={property}
            onClick={handlePropertyClick}
            onEdit={handlePropertyEdit}
            selected={selectedProperty?.id === property.id}
          />
        ))}
      </div>
      
      {/* Edit Modal */}
      {showEditModal && (
        <PropertyEditModal 
          property={editingProperty}
          onSave={handlePropertySave}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  )
}
```

### LinkCreator Integration

```typescript
const LinkCreator = () => {
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<string[]>([])
  
  const handlePropertyToggle = (property: Property) => {
    setSelectedPropertyIds(prev =>
      prev.includes(property.id)
        ? prev.filter(id => id !== property.id)  // Deselect
        : [...prev, property.id]                 // Select
    )
  }
  
  return (
    <div className="link-creator-step-1">
      <h2>Select Properties for Link</h2>
      
      <div className="property-selection-grid">
        {properties.map(property => (
          <PropertyCard
            key={property.id}
            property={property}
            selected={selectedPropertyIds.includes(property.id)}
            onClick={handlePropertyToggle}
            // No onEdit in selection mode
          />
        ))}
      </div>
      
      <div className="selection-summary">
        {selectedPropertyIds.length} properties selected
      </div>
    </div>
  )
}
```

## Performance Considerations for Agents

### Bulk Operations Optimization

```typescript
// Efficient selection state management
const usePropertySelection = (properties: Property[]) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  
  const toggleSelection = useCallback((propertyId: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(propertyId)) {
        newSet.delete(propertyId)
      } else {
        newSet.add(propertyId)
      }
      return newSet
    })
  }, [])
  
  const isSelected = useCallback((propertyId: string) => 
    selectedIds.has(propertyId), [selectedIds]
  )
  
  return { toggleSelection, isSelected, selectedCount: selectedIds.size }
}
```

### Agent-Specific Caching

```typescript
// Cache frequently accessed agent data
const useAgentProperties = () => {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    // Agent-specific property loading with caching
    const loadProperties = async () => {
      const cached = sessionStorage.getItem('agent-properties')
      if (cached) {
        setProperties(JSON.parse(cached))
        setLoading(false)
      }
      
      try {
        const fresh = await PropertyService.getAllProperties()
        setProperties(fresh)
        sessionStorage.setItem('agent-properties', JSON.stringify(fresh))
      } catch (error) {
        console.error('Failed to load properties:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadProperties()
  }, [])
  
  return { properties, loading }
}
```

## Agent Testing Coverage

The Agent PropertyCard extends base testing with agent-specific scenarios:

### Agent-Specific Tests
- ✅ Edit button appears on hover
- ✅ Edit button fires onEdit callback
- ✅ Edit button prevents card click event
- ✅ Selection state visual feedback works
- ✅ Selected prop controls visual state
- ✅ Off-market properties show reduced opacity

### Workflow Integration Tests
- ✅ Property management dashboard integration
- ✅ LinkCreator selection workflow
- ✅ Multi-select state management
- ✅ Bulk operations compatibility

### Accessibility Tests
- ✅ Edit button has proper ARIA labels
- ✅ Selection state announced to screen readers
- ✅ Keyboard navigation includes edit button
- ✅ Focus management during edit operations

**20/20 tests passing** (15 base + 5 agent-specific)

## Agent UX Patterns

### Progressive Disclosure

```
Initial View:
┌─────────────────────┐
│  Clean property     │  ← Professional, client-ready
│  presentation       │
└─────────────────────┘

On Hover:
┌─────────────────────┐
│  Clean property     │
│  presentation [Edit]│  ← Agent controls revealed
└─────────────────────┘

On Selection:
┌─────────────────────┐
│✓ Selected property  │  ← Clear selection feedback
│  presentation [Edit]│
└─────────────────────┘
```

### Context-Sensitive Actions

**Client Presentation Mode**:
- Clean, distraction-free display
- No agent controls visible
- Focus on property appeal

**Management Mode**:  
- Edit buttons revealed
- Status indicators prominent
- Selection states active
- Bulk operation support

**Mixed Mode** (LinkCreator):
- Selection functionality enabled
- Professional appearance maintained
- Quick property evaluation supported

## Future Agent Enhancements

### Planned Agent Features
1. **Quick Status Updates**: Click status dot to change status
2. **Inline Price Editing**: Click price to edit in place
3. **Drag & Drop**: Reorder properties in collections
4. **Right-Click Menus**: Context menus with agent actions
5. **Batch Editing**: Multi-select property updates

### Advanced Agent Tools
1. **Performance Indicators**: Views, likes, inquiries per property
2. **Market Insights**: Price recommendations, market trends
3. **Client Matching**: AI suggestions for property-client fits
4. **Tour Scheduling**: Calendar integration for property visits
5. **Document Management**: Contracts, disclosures, photos

### Integration Enhancements
1. **CRM Connectivity**: Link to client management systems
2. **MLS Synchronization**: Two-way MLS data sync
3. **Marketing Tools**: Social media post generation
4. **Analytics Dashboard**: Property performance metrics
5. **Mobile App Sync**: Cross-platform agent tools

## Related Agent Components

- **PropertyEditModal**: Edit interface triggered by edit button
- **BulkActionToolbar**: Multi-select property operations
- **AgentDashboard**: Primary container for agent property management
- **LinkCreator**: Property selection interface for link generation
- **PropertyAnalytics**: Performance metrics for agent properties

## Agent-Specific Dependencies

### Internal Dependencies
- Base PropertyCard functionality
- Agent authentication context
- Property management permissions
- Agent-specific styling overrides

### External Dependencies
- Agent role verification
- Permission-based feature flags
- Agent dashboard routing
- Multi-select state management

The Agent PropertyCard successfully extends the base PropertyCard with professional tools while maintaining the clean, client-ready appearance that agents can confidently use in all contexts.