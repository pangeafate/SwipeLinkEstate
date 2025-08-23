# PropertyDeletionService Module

## Purpose
Manages safe deletion of properties with impact analysis, cascade operations, and data integrity protection.

## Overview
The PropertyDeletionService provides a comprehensive solution for deleting properties while maintaining referential integrity across the system. It analyzes the impact of deletion, handles cascade operations for linked data, and provides both soft and hard delete capabilities.

## Architecture Position

```
┌─────────────────────────────────────────────────┐
│                 Dashboard UI                     │
│              (Deletion Request)                  │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│           PropertyDeletionService                │
│  ┌──────────────┐  ┌──────────────┐            │
│  │   Impact     │  │   Cascade    │            │
│  │  Analysis    │  │  Operations  │            │
│  └──────────────┘  └──────────────┘            │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│              Supabase Database                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │Properties│  │  Links   │  │Activities│     │
│  └──────────┘  └──────────┘  └──────────┘     │
└─────────────────────────────────────────────────┘
```

## Core Functions

### deleteProperty(propertyId, options)
Main entry point for property deletion. Orchestrates the entire deletion process including validation, impact analysis, cascade operations, and the actual deletion.

**Flow:**
1. Prevents concurrent deletion attempts
2. Validates ownership if agentId provided
3. Analyzes deletion impact
4. Checks for active links
5. Requires confirmation for data loss
6. Performs cascade operations
7. Executes soft or hard delete
8. Returns comprehensive result

### analyzeDeletionImpact(propertyId)
Analyzes what will be affected by deleting a property.

**Process:**
1. Queries all links in the database
2. Filters links containing the property (client-side due to JSONB complexity)
3. Counts related activities
4. Determines if soft delete is required
5. Calculates estimated data loss
6. Returns impact assessment

### cascadePropertyDeletion(propertyId)
Handles cleanup of related data when a property is deleted.

**Operations:**
1. Fetches all links from database
2. Identifies affected links (those containing the property)
3. Removes property ID from link arrays
4. Updates links in parallel for performance
5. Deletes related activities
6. Returns cascade operation results

## Deletion Types

### Soft Delete
Used when property has related data that shouldn't be lost:
- Sets property status to 'deleted'
- Preserves data for potential recovery
- Maintains referential integrity

### Hard Delete
Used when property has no dependencies:
- Permanently removes property from database
- Cannot be undone
- Faster execution

## Decision Logic

```
Property Deletion Request
         │
         ▼
    Has Related Data?
    /            \
   YES            NO
   /              \
  ▼                ▼
Soft Delete    Hard Delete
(status=deleted)  (DELETE)
```

## Data Flow

```
1. User initiates deletion
         │
         ▼
2. Dashboard calls handleDeleteProperty
         │
         ▼
3. PropertyDeletionService.analyzeDeletionImpact
         │
         ├─> Query Links (JSONB array)
         ├─> Query Activities
         └─> Calculate Impact
         │
         ▼
4. Show confirmation with warnings
         │
         ▼
5. PropertyDeletionService.deleteProperty
         │
         ├─> Validate ownership
         ├─> Skip/Run cascade operations
         └─> Execute deletion
         │
         ▼
6. Update UI (refetch properties)
```

## Performance Considerations

### Current Optimizations
- Parallel processing of link updates using Promise.all
- Client-side filtering for JSONB arrays (avoids complex SQL)
- Cascade operations temporarily disabled for speed

### Known Issues
- Cascade operations can be slow with many linked collections
- JSONB array queries require client-side filtering
- No batching for multiple property deletions

## Error Handling

The service handles several error scenarios:
- Concurrent deletion attempts (prevented via Set tracking)
- Unauthorized deletion (ownership validation)
- Database operation failures (proper error propagation)
- Invalid property IDs (graceful handling)

## Integration Points

### Dependencies
- Supabase client for database operations
- PropertyService for property operations
- Dashboard component for UI integration

### Used By
- Agent Dashboard (primary consumer)
- PropertyCard component (delete button)
- Future: Bulk operations, Admin tools

## Safety Features

1. **Deletion Tracking**: Prevents concurrent deletion of same property
2. **Impact Analysis**: Shows what will be affected before deletion
3. **Confirmation Required**: User must confirm when data will be lost
4. **Ownership Validation**: Optional check that agent owns the property
5. **Graceful Degradation**: Continues even if some operations fail

## Future Enhancements

- Implement undo functionality using snapshots
- Add audit logging for compliance
- Optimize cascade operations performance
- Support bulk property deletion
- Add soft delete recovery mechanism
- Implement deletion scheduling