import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PropertyService } from '@/components/property'
import { queryKeys } from './queryKeys'
import type { Property, PropertyFormData } from '@/components/property/types'

// Hook for fetching all properties
export function usePropertiesQuery() {
  return useQuery({
    queryKey: queryKeys.properties.list(),
    queryFn: () => PropertyService.getAllProperties(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Hook for fetching a single property
export function usePropertyQuery(propertyId: string) {
  return useQuery({
    queryKey: queryKeys.properties.detail(propertyId),
    queryFn: () => PropertyService.getProperty(propertyId),
    enabled: !!propertyId && propertyId.trim() !== '', // Only run query if propertyId exists and is not empty
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Hook for creating a property
export function useCreatePropertyMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: PropertyFormData) => PropertyService.createProperty(data),
    onSuccess: (newProperty: Property) => {
      // Invalidate properties list to refetch
      queryClient.invalidateQueries({
        queryKey: queryKeys.properties.all()
      })

      // Optionally add the new property to the cache
      queryClient.setQueryData(
        queryKeys.properties.detail(newProperty.id),
        newProperty
      )
    },
  })
}

// Hook for updating a property
export function useUpdatePropertyMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PropertyFormData> }) =>
      PropertyService.updateProperty(id, data),
    onSuccess: (updatedProperty: Property) => {
      // Update the specific property in cache
      queryClient.setQueryData(
        queryKeys.properties.detail(updatedProperty.id),
        updatedProperty
      )

      // Invalidate properties list to refetch
      queryClient.invalidateQueries({
        queryKey: queryKeys.properties.all()
      })
    },
  })
}

// Hook for deleting a property
export function useDeletePropertyMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (propertyId: string) => PropertyService.deleteProperty(propertyId),
    onSuccess: (_, propertyId) => {
      // Remove from cache
      queryClient.removeQueries({
        queryKey: queryKeys.properties.detail(propertyId)
      })

      // Invalidate properties list to refetch
      queryClient.invalidateQueries({
        queryKey: queryKeys.properties.all()
      })
    },
  })
}

// Hook for fetching properties with pagination and filtering
export function usePropertiesOptimizedQuery(options: {
  page?: number
  limit?: number
  status?: 'active' | 'off-market' | 'deleted'
  sortBy?: 'created_at' | 'price' | 'updated_at'
  sortOrder?: 'asc' | 'desc'
} = {}) {
  return useQuery({
    queryKey: [...queryKeys.properties.all(), 'optimized', options],
    queryFn: () => PropertyService.getPropertiesOptimized(options),
    staleTime: 5 * 60 * 1000, // 5 minutes
    keepPreviousData: true, // Keep previous page data while loading new page
  })
}

// Hook for fetching multiple properties by IDs (batch operation)
export function usePropertiesBatchQuery(propertyIds: string[]) {
  return useQuery({
    queryKey: queryKeys.properties.multiple(propertyIds),
    queryFn: () => PropertyService.getPropertiesBatch(propertyIds),
    enabled: propertyIds.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Hook for fetching property statistics
export function usePropertyStatsQuery() {
  return useQuery({
    queryKey: [...queryKeys.properties.all(), 'stats'],
    queryFn: () => PropertyService.getPropertyStats(),
    staleTime: 10 * 60 * 1000, // 10 minutes - stats don't change often
  })
}

// Hook for searching properties
export function useSearchPropertiesQuery(query: string) {
  return useQuery({
    queryKey: [...queryKeys.properties.all(), 'search', query],
    queryFn: () => PropertyService.searchProperties(query),
    enabled: query.trim().length > 2, // Only search if query is at least 3 characters
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}