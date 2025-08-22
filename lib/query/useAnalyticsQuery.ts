/**
 * React Query hooks for Analytics
 * Provides data fetching and caching for analytics functionality
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AnalyticsService, type DashboardAnalytics, type LinkAnalytics, type PropertyAnalytics } from '@/lib/analytics/analytics.service'
import { queryKeys } from './queryKeys'
import { useErrorHandler } from '@/lib/errors/useErrorHandler'

export interface UseAnalyticsOptions {
  enabled?: boolean
  refetchInterval?: number
  staleTime?: number
}

/**
 * Hook to fetch dashboard analytics with overview stats and recent activity
 */
export function useDashboardAnalytics(options: UseAnalyticsOptions = {}) {
  const { enabled = true, refetchInterval = 30000, staleTime = 15000 } = options
  const { handleError } = useErrorHandler({
    context: { component: 'useDashboardAnalytics' }
  })

  return useQuery({
    queryKey: queryKeys.analytics.dashboard(),
    queryFn: () => AnalyticsService.getDashboardAnalytics(),
    enabled,
    staleTime,
    refetchInterval,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    onError: (error: unknown) => {
      handleError(error, { operation: 'fetchDashboardAnalytics' })
    }
  })
}

/**
 * Hook to fetch analytics for a specific link
 */
export function useLinkAnalytics(linkCode: string, options: UseAnalyticsOptions = {}) {
  const { enabled = true, refetchInterval = 30000, staleTime = 15000 } = options
  const { handleError } = useErrorHandler({
    context: { component: 'useLinkAnalytics' }
  })

  return useQuery({
    queryKey: queryKeys.analytics.link(linkCode),
    queryFn: () => AnalyticsService.getLinkAnalytics(linkCode),
    enabled: enabled && !!linkCode,
    staleTime,
    refetchInterval,
    onError: (error: unknown) => {
      handleError(error, { operation: 'fetchLinkAnalytics' })
    }
  })
}

/**
 * Hook to fetch analytics for a specific property
 */
export function usePropertyAnalytics(propertyId: string, options: UseAnalyticsOptions = {}) {
  const { enabled = true, staleTime = 30000 } = options
  const { handleError } = useErrorHandler({
    context: { component: 'usePropertyAnalytics' }
  })

  return useQuery({
    queryKey: queryKeys.analytics.property(propertyId),
    queryFn: () => AnalyticsService.getPropertyAnalytics(propertyId),
    enabled: enabled && !!propertyId,
    staleTime,
    onError: (error: unknown) => {
      handleError(error, { operation: 'fetchPropertyAnalytics' })
    }
  })
}

/**
 * Hook to track activities (views, swipes, etc.)
 */
export function useTrackActivity() {
  const queryClient = useQueryClient()
  const { handleError } = useErrorHandler({
    context: { component: 'useTrackActivity' }
  })

  return useMutation({
    mutationFn: (data: {
      linkId?: string
      propertyId?: string
      action: string
      sessionId?: string
      metadata?: Record<string, any>
    }) => AnalyticsService.trackActivity(data),
    onSuccess: (_, variables) => {
      // Invalidate related analytics queries
      if (variables.linkId) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.analytics.link(variables.linkId) 
        })
      }
      if (variables.propertyId) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.analytics.property(variables.propertyId) 
        })
      }
      // Invalidate dashboard analytics
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.analytics.dashboard() 
      })
    },
    onError: (error: unknown) => {
      handleError(error, { operation: 'trackActivity' })
    }
  })
}

/**
 * Hook to create/update sessions
 */
export function useCreateSession() {
  const { handleError } = useErrorHandler({
    context: { component: 'useCreateSession' }
  })

  return useMutation({
    mutationFn: (data: {
      sessionId: string
      linkId?: string
      deviceInfo?: Record<string, any>
    }) => AnalyticsService.createSession(data),
    onError: (error: unknown) => {
      handleError(error, { operation: 'createSession' })
    }
  })
}

/**
 * Hook to update session activity
 */
export function useUpdateSessionActivity() {
  const { handleError } = useErrorHandler({
    context: { component: 'useUpdateSessionActivity' }
  })

  return useMutation({
    mutationFn: (sessionId: string) => AnalyticsService.updateSessionActivity(sessionId),
    onError: (error: unknown) => {
      handleError(error, { operation: 'updateSessionActivity' })
    }
  })
}

/**
 * Convenience hook to track a swipe action
 */
export function useTrackSwipe() {
  const trackActivity = useTrackActivity()
  
  return useMutation({
    mutationFn: (data: {
      linkId: string
      propertyId: string
      action: 'like' | 'dislike'
      sessionId: string
      metadata?: Record<string, any>
    }) => AnalyticsService.trackSwipe(data),
    onSuccess: (_, variables) => {
      // Also trigger the activity tracking invalidation
      trackActivity.mutate({
        linkId: variables.linkId,
        propertyId: variables.propertyId,
        action: variables.action,
        sessionId: variables.sessionId,
        metadata: variables.metadata
      })
    }
  })
}

/**
 * Convenience hook to track a property view
 */
export function useTrackView() {
  const trackActivity = useTrackActivity()
  
  return useMutation({
    mutationFn: (data: {
      linkId?: string
      propertyId: string
      sessionId: string
      metadata?: Record<string, any>
    }) => AnalyticsService.trackView(data),
    onSuccess: (_, variables) => {
      // Also trigger the activity tracking invalidation
      trackActivity.mutate({
        linkId: variables.linkId,
        propertyId: variables.propertyId,
        action: 'view',
        sessionId: variables.sessionId,
        metadata: variables.metadata
      })
    }
  })
}

/**
 * Hook for real-time analytics updates
 * Provides more frequent updates for live dashboards
 */
export function useRealTimeAnalytics(linkCode?: string, options: UseAnalyticsOptions = {}) {
  const { enabled = true, refetchInterval = 5000 } = options
  
  // Always call both hooks, but conditionally enable them
  const linkQuery = useLinkAnalytics(linkCode || '', {
    ...options,
    enabled: enabled && !!linkCode,
    refetchInterval,
    staleTime: 1000 // Very short stale time for real-time feel
  })
  
  const dashboardQuery = useDashboardAnalytics({
    ...options,
    enabled: enabled && !linkCode,
    refetchInterval,
    staleTime: 1000
  })
  
  // Return the appropriate query based on linkCode presence
  return linkCode ? linkQuery : dashboardQuery
}