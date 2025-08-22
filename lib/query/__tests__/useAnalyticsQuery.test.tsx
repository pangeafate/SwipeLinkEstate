import React from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useDashboardAnalytics, useLinkAnalytics, usePropertyAnalytics, useTrackActivity } from '../useAnalyticsQuery'
import { AnalyticsService } from '@/lib/analytics/analytics.service'

// Mock the analytics service
jest.mock('@/lib/analytics/analytics.service', () => ({
  AnalyticsService: {
    getDashboardAnalytics: jest.fn(),
    getLinkAnalytics: jest.fn(),
    getPropertyAnalytics: jest.fn(),
    trackActivity: jest.fn()
  }
}))

// Mock error handler
jest.mock('@/lib/errors/useErrorHandler', () => ({
  useErrorHandler: jest.fn(() => ({
    handleError: jest.fn()
  }))
}))

const MockedAnalyticsService = AnalyticsService as jest.Mocked<typeof AnalyticsService>

describe('useAnalyticsQuery', () => {
  let queryClient: QueryClient
  let wrapper: React.FC<{ children: React.ReactNode }>

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    })
    wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    jest.clearAllMocks()
  })

  describe('useDashboardAnalytics', () => {
    it('should fetch dashboard analytics successfully', async () => {
      // ARRANGE
      const mockData = {
        properties: { total: 10, active: 8 },
        links: { total: 5, active: 3 },
        sessions: { total: 100, avgDuration: 300 },
        views: { total: 500 },
        recentActivity: []
      }
      MockedAnalyticsService.getDashboardAnalytics.mockResolvedValue(mockData)

      // ACT
      const { result } = renderHook(() => useDashboardAnalytics(), { wrapper })

      // ASSERT
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockData)
      expect(MockedAnalyticsService.getDashboardAnalytics).toHaveBeenCalledTimes(1)
    })

    it('should use custom options', async () => {
      // ARRANGE
      const options = {
        enabled: false,
        refetchInterval: 60000,
        staleTime: 30000
      }

      // ACT
      const { result } = renderHook(() => useDashboardAnalytics(options), { wrapper })

      // ASSERT
      expect(result.current.fetchStatus).toBe('idle')
      expect(MockedAnalyticsService.getDashboardAnalytics).not.toHaveBeenCalled()
    })

    it('should handle errors correctly', async () => {
      // ARRANGE
      const error = new Error('Analytics fetch failed')
      MockedAnalyticsService.getDashboardAnalytics.mockRejectedValue(error)

      // ACT
      const { result } = renderHook(() => useDashboardAnalytics(), { wrapper })

      // ASSERT
      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toBe(error)
    })
  })

  describe('useLinkAnalytics', () => {
    it('should fetch link analytics successfully', async () => {
      // ARRANGE
      const linkCode = 'test-link-123'
      const mockData = {
        linkCode,
        totalViews: 50,
        uniqueViews: 30,
        sessions: 25,
        avgSessionDuration: 180,
        viewsByDay: [],
        deviceTypes: { mobile: 20, desktop: 10 },
        locations: { 'US': 25, 'CA': 5 }
      }
      MockedAnalyticsService.getLinkAnalytics.mockResolvedValue(mockData)

      // ACT
      const { result } = renderHook(() => useLinkAnalytics(linkCode), { wrapper })

      // ASSERT
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockData)
      expect(MockedAnalyticsService.getLinkAnalytics).toHaveBeenCalledWith(linkCode)
    })

    it('should not fetch when linkCode is empty', () => {
      // ACT
      const { result } = renderHook(() => useLinkAnalytics(''), { wrapper })

      // ASSERT
      expect(result.current.fetchStatus).toBe('idle')
      expect(MockedAnalyticsService.getLinkAnalytics).not.toHaveBeenCalled()
    })
  })

  describe('usePropertyAnalytics', () => {
    it('should fetch property analytics successfully', async () => {
      // ARRANGE
      const propertyId = 'property-456'
      const mockData = {
        propertyId,
        totalViews: 75,
        uniqueViews: 45,
        likes: 30,
        dislikes: 5,
        viewsByDay: [],
        avgTimeViewed: 60,
        conversionRate: 0.15
      }
      MockedAnalyticsService.getPropertyAnalytics.mockResolvedValue(mockData)

      // ACT
      const { result } = renderHook(() => usePropertyAnalytics(propertyId), { wrapper })

      // ASSERT
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockData)
      expect(MockedAnalyticsService.getPropertyAnalytics).toHaveBeenCalledWith(propertyId)
    })

    it('should not fetch when propertyId is empty', () => {
      // ACT
      const { result } = renderHook(() => usePropertyAnalytics(''), { wrapper })

      // ASSERT
      expect(result.current.fetchStatus).toBe('idle')
      expect(MockedAnalyticsService.getPropertyAnalytics).not.toHaveBeenCalled()
    })
  })

  describe('useTrackActivity', () => {
    it('should track activity successfully', async () => {
      // ARRANGE
      const mockActivity = { id: 'activity-123' }
      MockedAnalyticsService.trackActivity.mockResolvedValue(mockActivity)

      // ACT
      const { result } = renderHook(() => useTrackActivity(), { wrapper })

      await waitFor(() => {
        expect(result.current.mutate).toBeDefined()
      })

      const activityData = {
        type: 'property_view' as const,
        propertyId: 'prop-123',
        sessionId: 'session-456'
      }

      result.current.mutate(activityData)

      // ASSERT
      await waitFor(() => {
        expect(MockedAnalyticsService.trackActivity).toHaveBeenCalledWith(activityData)
      })
    })

    it('should handle tracking errors', async () => {
      // ARRANGE
      const error = new Error('Tracking failed')
      MockedAnalyticsService.trackActivity.mockRejectedValue(error)

      // ACT
      const { result } = renderHook(() => useTrackActivity(), { wrapper })

      const activityData = {
        type: 'link_view' as const,
        linkCode: 'link-123',
        sessionId: 'session-456'
      }

      result.current.mutate(activityData)

      // ASSERT
      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })
    })

    it('should invalidate queries on successful tracking', async () => {
      // ARRANGE
      const mockActivity = { id: 'activity-123' }
      MockedAnalyticsService.trackActivity.mockResolvedValue(mockActivity)
      const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries')

      // ACT
      const { result } = renderHook(() => useTrackActivity(), { wrapper })

      const activityData = {
        type: 'property_like' as const,
        propertyId: 'prop-123',
        sessionId: 'session-456'
      }

      result.current.mutate(activityData)

      // ASSERT
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(invalidateQueriesSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: expect.arrayContaining(['analytics'])
        })
      )
    })
  })

  describe('Hook Options', () => {
    it('should use default options when none provided', async () => {
      // ARRANGE
      const mockData = { properties: { total: 0 } }
      MockedAnalyticsService.getDashboardAnalytics.mockResolvedValue(mockData)

      // ACT
      const { result } = renderHook(() => useDashboardAnalytics(), { wrapper })

      // ASSERT
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      // Default enabled should be true
      expect(MockedAnalyticsService.getDashboardAnalytics).toHaveBeenCalled()
    })

    it('should respect disabled option', () => {
      // ACT
      const { result } = renderHook(() => useDashboardAnalytics({ enabled: false }), { wrapper })

      // ASSERT
      expect(result.current.fetchStatus).toBe('idle')
      expect(MockedAnalyticsService.getDashboardAnalytics).not.toHaveBeenCalled()
    })
  })
})