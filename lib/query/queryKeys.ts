/**
 * Centralized query keys for React Query cache management
 * Following the recommended pattern from TanStack Query docs
 */

export const queryKeys = {
  // Property-related queries
  properties: {
    // Base key for all property queries
    all: () => ['properties'] as const,
    
    // All properties list
    list: () => [...queryKeys.properties.all(), 'all'] as const,
    
    // Single property by ID
    detail: (id: string) => [...queryKeys.properties.all(), 'detail', id] as const,
    
    // Multiple properties by IDs (for links)
    multiple: (ids: string[]) => [...queryKeys.properties.all(), 'multiple', ids] as const,
    
    // Properties with filters (future use)
    filtered: (filters: Record<string, any>) => [...queryKeys.properties.all(), 'filtered', filters] as const,
  },

  // Link-related queries
  links: {
    // Base key for all link queries
    all: () => ['links'] as const,
    
    // All links list
    list: () => [...queryKeys.links.all(), 'all'] as const,
    
    // Single link by code
    detail: (code: string) => [...queryKeys.links.all(), 'detail', code] as const,
    
    // Links by agent
    agent: (agentId: string) => [...queryKeys.links.all(), 'agent', agentId] as const,
  },

  // Swipe session queries
  swipe: {
    // Base key for swipe queries
    all: () => ['swipe'] as const,
    
    // Swipe session data
    session: (sessionId: string) => [...queryKeys.swipe.all(), 'session', sessionId] as const,
    
    // Swipe state (buckets)
    state: (sessionId: string) => [...queryKeys.swipe.all(), 'state', sessionId] as const,
  },

  // Analytics queries
  analytics: {
    // Base key for analytics
    all: () => ['analytics'] as const,
    
    // Dashboard metrics
    dashboard: () => [...queryKeys.analytics.all(), 'dashboard'] as const,
    
    // Property-specific analytics
    property: (propertyId: string) => [...queryKeys.analytics.all(), 'property', propertyId] as const,
    
    // Link-specific analytics
    link: (linkCode: string) => [...queryKeys.analytics.all(), 'link', linkCode] as const,
    
    // Real-time analytics
    realTime: (scope: string) => [...queryKeys.analytics.all(), 'realtime', scope] as const,
    
    // Swipe analytics for session (deprecated - use link analytics)
    swipeAnalytics: (sessionId: string) => [...queryKeys.analytics.all(), 'swipe-analytics', sessionId] as const,
  },
} as const

export default queryKeys