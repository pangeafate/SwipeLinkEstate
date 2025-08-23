# Property Services

This directory contains service modules for property-related operations.

## PropertyDeletionService

Handles safe property deletion with impact analysis and cascade operations.

### Features

- **Impact Analysis**: Analyzes deletion impact before execution
- **Safe Deletion**: Prevents deletion of properties with active links
- **Soft/Hard Delete**: Automatically determines deletion type based on data relationships
- **Undo Support**: Creates snapshots for undo operations (30-minute window)
- **Cascade Operations**: Handles related data cleanup

### Usage

```typescript
import { PropertyDeletionService } from './propertyDeletionService'

// Analyze deletion impact
const impact = await PropertyDeletionService.analyzeDeletionImpact('property-id')

// Delete property
const result = await PropertyDeletionService.deleteProperty('property-id', {
  reason: 'Property sold',
  createUndoSnapshot: true
})

// Check if property can be deleted
const canDelete = await PropertyDeletionService.canDeleteProperty('property-id')
```

### API

#### `analyzeDeletionImpact(propertyId: string): Promise<DeletionImpact>`

Analyzes the impact of deleting a property.

Returns:
- `linkedCollections`: Number of related collections
- `activeLinks`: Array of active link IDs
- `totalActivities`: Number of activities
- `safeForHardDelete`: Boolean indicating if hard delete is safe
- `estimatedDataLoss`: Array of data loss descriptions
- `canUndo`: Whether undo is available
- `undoTimeLimit`: Time limit for undo in minutes

#### `deleteProperty(propertyId: string, options?: DeleteOptions): Promise<DeletionResult>`

Deletes a property with safety checks.

Options:
- `reason`: Optional reason for deletion
- `createUndoSnapshot`: Whether to create undo snapshot
- `forceDelete`: Force deletion even with active links

Returns:
- `success`: Boolean indicating success
- `type`: 'hard_delete' or 'soft_delete'
- `undoId`: Undo snapshot ID (if created)

#### `canDeleteProperty(propertyId: string): Promise<boolean>`

Quick check if property can be deleted (no active links).

### Error Handling

- Throws error if deletion is already in progress
- Throws error if property has active links (unless force delete)
- Handles Supabase errors gracefully
- Provides detailed error messages

### Testing

Tests cover:
- Impact analysis accuracy
- Safe deletion validation
- Error handling scenarios
- Undo snapshot creation
- Concurrent deletion prevention

Run tests: `npm test propertyService.Deletion.test.ts`