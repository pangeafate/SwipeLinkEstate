# PropertyDeletionHandler Module

## Purpose
Encapsulates property deletion logic and user interaction flow for the dashboard.

## Overview
The PropertyDeletionHandler manages the complete deletion workflow including impact analysis, user confirmation, deletion execution, and UI updates. It acts as a bridge between the UI layer and the PropertyDeletionService.

## Architecture Position

```
Dashboard Component
        │
        ▼
PropertyDeletionHandler
        │
        ├──> User Confirmation Dialog
        ├──> PropertyDeletionService
        └──> UI State Updates
```

## Core Functionality

### handleDeleteProperty Method
Main entry point for property deletion from the UI.

**Flow:**
1. Receives property ID from UI interaction
2. Calls PropertyDeletionService.analyzeDeletionImpact
3. Shows appropriate confirmation dialog based on impact
4. Executes deletion if confirmed
5. Updates UI state on success
6. Handles errors gracefully

## User Interaction Flow

```
Delete Button Click
        │
        ▼
Analyze Impact
        │
        ├─> Has Related Data?
        │         │
        │         ▼
        │   Show Detailed Warning
        │   "This will delete:
        │    - X activities
        │    - Remove from Y links"
        │         │
        └─> No Related Data
                  │
                  ▼
            Simple Confirmation
            "Are you sure?"
                  │
                  ▼
            User Decision
            /           \
        Cancel        Confirm
          │              │
        Return       Delete Property
                         │
                    Update UI
```

## Hook Usage

The module exports a `usePropertyDeletion` hook for easy integration:

```typescript
const { handleDeleteProperty } = usePropertyDeletion(
  refetchProperties,  // Called on successful deletion
  updateSelection,    // Updates selection state
  selectedProperties  // Current selection set
)
```

## Error Handling

- Network failures: Shows alert to user
- Validation errors: Logged and user notified
- Concurrent deletions: Prevented by service layer
- User cancellation: Gracefully exits flow

## State Management

### Props Interface
- **onDeletionComplete**: Callback to refresh property list
- **onSelectionUpdate**: Callback to update selection state
- **selectedProperties**: Current selection for cleanup

### Side Effects
- Triggers property list refresh after deletion
- Removes deleted property from selection
- Shows confirmation dialogs
- Displays error alerts

## Integration Points

### Dependencies
- PropertyDeletionService for business logic
- Window.confirm for user confirmation
- Console logging for debugging

### Used By
- Agent Dashboard component
- PropertyCard delete button handler

## Design Decisions

1. **Class + Hook Pattern**: Provides both class-based logic and hook interface
2. **Confirmation Dialogs**: Native window.confirm for simplicity
3. **Impact-Based Warnings**: Different messages based on data relationships
4. **Force Delete Option**: Allows deletion with active links if user confirms
5. **Selection Cleanup**: Automatically removes deleted items from selection

## Future Enhancements

- Replace window.confirm with custom modal component
- Add undo notification with timer
- Batch deletion support
- Deletion history tracking
- Custom confirmation messages per property type