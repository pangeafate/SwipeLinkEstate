import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { LinkService } from '@/components/link'
import { queryKeys } from './queryKeys'
import type { Link, LinkWithProperties } from '@/components/link'

// Hook for fetching all links (agent links) - simple version for listing
export function useLinksQuery() {
  return useQuery({
    queryKey: queryKeys.links.list(),
    queryFn: () => LinkService.getAgentLinksSimple(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Hook for fetching links with pagination
export function useLinksQueryPaginated(options: { page?: number; limit?: number } = {}) {
  return useQuery({
    queryKey: [...queryKeys.links.list(), 'paginated', options],
    queryFn: () => LinkService.getAgentLinks(options),
    staleTime: 5 * 60 * 1000, // 5 minutes
    keepPreviousData: true, // Keep previous page data while loading new page
  })
}

// Hook for fetching a single link by code (with properties)
export function useLinkQuery(linkCode: string) {
  return useQuery({
    queryKey: queryKeys.links.detail(linkCode),
    queryFn: () => LinkService.getLink(linkCode),
    enabled: !!linkCode && linkCode.trim() !== '', // Only run query if linkCode exists and is not empty
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Hook for creating a link
export function useCreateLinkMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ propertyIds, name }: { propertyIds: string[]; name?: string }) => 
      LinkService.createLink(propertyIds, name),
    onSuccess: (newLink: Link) => {
      // Invalidate links list to refetch
      queryClient.invalidateQueries({
        queryKey: queryKeys.links.all()
      })

      // Add the new link to the cache
      queryClient.setQueryData(
        queryKeys.links.detail(newLink.code),
        newLink
      )
    },
  })
}

// Hook for copying link URL
export function useCopyLinkMutation() {
  return useMutation({
    mutationFn: (linkCode: string) => LinkService.copyLinkUrl(linkCode),
  })
}