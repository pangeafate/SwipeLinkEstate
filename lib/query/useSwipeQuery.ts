import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from './queryKeys'
import type { SwipeState } from '@/components/swipe/types'

// Mock SwipeService (this would be implemented later or replaced with actual service)
const SwipeService = {
  getSwipeSession: async (sessionId: string) => {
    // Placeholder implementation
    return {
      id: sessionId,
      link_code: 'mock',
      swipe_state: {
        liked: [],
        disliked: [],
        considering: [],
        viewed: [],
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  },
  
  createSwipeSession: async (linkCode: string) => {
    return {
      id: 'new-session',
      link_code: linkCode,
      swipe_state: {
        liked: [],
        disliked: [],
        considering: [],
        viewed: [],
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  },
  
  updateSwipeState: async (sessionId: string, swipeState: SwipeState) => {
    return {
      id: sessionId,
      link_code: 'mock',
      swipe_state: swipeState,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  },
  
  getSwipeAnalytics: async (sessionId: string) => {
    return {
      totalSwipes: 0,
      likedCount: 0,
      dislikedCount: 0,
      consideringCount: 0,
    }
  },
}

// Hook for fetching a swipe session
export function useSwipeSessionQuery(sessionId: string) {
  return useQuery({
    queryKey: queryKeys.swipe.session(sessionId),
    queryFn: () => SwipeService.getSwipeSession(sessionId),
    enabled: !!sessionId && sessionId.trim() !== '',
    staleTime: 30 * 1000, // 30 seconds - swipe sessions are more dynamic
  })
}

// Hook for creating a swipe session
export function useCreateSwipeSessionMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (linkCode: string) => SwipeService.createSwipeSession(linkCode),
    onSuccess: (newSession) => {
      // Cache the new session
      queryClient.setQueryData(
        queryKeys.swipe.session(newSession.id),
        newSession
      )
    },
  })
}

// Hook for updating swipe state
export function useSwipeStateMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ sessionId, swipeState }: { sessionId: string; swipeState: SwipeState }) =>
      SwipeService.updateSwipeState(sessionId, swipeState),
    onSuccess: (updatedSession) => {
      // Update the session in cache
      queryClient.setQueryData(
        queryKeys.swipe.session(updatedSession.id),
        updatedSession
      )

      // Also update the swipe state cache
      queryClient.setQueryData(
        queryKeys.swipe.state(updatedSession.id),
        updatedSession.swipe_state
      )
    },
  })
}

// Hook for fetching swipe analytics
export function useSwipeAnalyticsQuery(sessionId: string) {
  return useQuery({
    queryKey: queryKeys.analytics.swipeAnalytics(sessionId),
    queryFn: () => SwipeService.getSwipeAnalytics(sessionId),
    enabled: !!sessionId && sessionId.trim() !== '',
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}