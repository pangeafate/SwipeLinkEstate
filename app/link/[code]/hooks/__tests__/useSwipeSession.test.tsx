/**
 * useSwipeSession Hook Tests
 * Testing session management and analytics tracking
 */

import { renderHook, waitFor } from '@testing-library/react'
import { useSwipeSession } from '../useSwipeSession'
import { AnalyticsService } from '@/lib/analytics/analytics.service'
import { setupTest, createMockLink } from '@/test'

// Setup shared utilities
const { getWrapper } = setupTest()

// Mock AnalyticsService
jest.mock('@/lib/analytics/analytics.service', () => ({
  AnalyticsService: {
    createSession: jest.fn(() => Promise.resolve()),
    updateSessionActivity: jest.fn(() => Promise.resolve()),
    trackActivity: jest.fn(() => Promise.resolve()),
    trackView: jest.fn(() => Promise.resolve()),
    completeSession: jest.fn(() => Promise.resolve()),
    getDeviceInfo: jest.fn(() => ({ browser: 'test', os: 'test' }))
  }
}))

const mockLinkData = createMockLink({
  id: 'link-1',
  code: 'TEST123',
  name: 'Test Collection',
  properties: [
    { id: 'prop-1', address: '123 Test St' },
    { id: 'prop-2', address: '456 Test Ave' }
  ]
})

describe('useSwipeSession Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should initialize session when link data is provided', async () => {
    // ARRANGE
    const props = {
      linkData: mockLinkData,
      sessionId: 'session-123',
      completedReview: false,
      currentIndex: 0,
      buckets: {}
    }

    // ACT
    const { result } = renderHook(
      () => useSwipeSession(props),
      { wrapper: getWrapper() }
    )

    // ASSERT
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    expect(AnalyticsService.createSession).toHaveBeenCalledWith({
      sessionId: 'session-123',
      linkId: 'link-1',
      deviceInfo: { browser: 'test', os: 'test' }
    })
  })

  it('should not initialize session without link data', () => {
    // ARRANGE
    const props = {
      linkData: null,
      sessionId: 'session-123',
      completedReview: false,
      currentIndex: 0,
      buckets: {}
    }

    // ACT
    renderHook(
      () => useSwipeSession(props),
      { wrapper: getWrapper() }
    )

    // ASSERT
    expect(AnalyticsService.createSession).not.toHaveBeenCalled()
  })

  it('should update session activity periodically', async () => {
    // ARRANGE
    const props = {
      linkData: mockLinkData,
      sessionId: 'session-123',
      completedReview: false,
      currentIndex: 0,
      buckets: {}
    }

    // ACT
    renderHook(
      () => useSwipeSession(props),
      { wrapper: getWrapper() }
    )

    // Wait for initial session creation
    await waitFor(() => {
      expect(AnalyticsService.createSession).toHaveBeenCalled()
    })

    // Fast-forward 30 seconds
    jest.advanceTimersByTime(30000)

    // ASSERT
    expect(AnalyticsService.updateSessionActivity).toHaveBeenCalledWith('session-123')
  })

  it('should stop updating activity when review is completed', async () => {
    // ARRANGE
    const props = {
      linkData: mockLinkData,
      sessionId: 'session-123',
      completedReview: false,
      currentIndex: 0,
      buckets: {}
    }

    // ACT
    const { rerender } = renderHook(
      (p) => useSwipeSession(p),
      { 
        wrapper: getWrapper(),
        initialProps: props
      }
    )

    // Complete the review
    rerender({ ...props, completedReview: true })

    // Fast-forward 30 seconds
    jest.advanceTimersByTime(30000)

    // ASSERT
    expect(AnalyticsService.updateSessionActivity).not.toHaveBeenCalled()
  })

  it('should track bucket assignments', async () => {
    // ARRANGE
    const props = {
      linkData: mockLinkData,
      sessionId: 'session-123',
      completedReview: false,
      currentIndex: 0,
      buckets: {}
    }

    // ACT
    const { rerender } = renderHook(
      (p) => useSwipeSession(p),
      {
        wrapper: getWrapper(),
        initialProps: props
      }
    )

    // Wait for initialization
    await waitFor(() => {
      expect(AnalyticsService.createSession).toHaveBeenCalled()
    })

    // Add bucket assignment
    rerender({
      ...props,
      buckets: { 'prop-1': 'love' }
    })

    // ASSERT
    await waitFor(() => {
      expect(AnalyticsService.trackActivity).toHaveBeenCalledWith({
        linkId: 'link-1',
        propertyId: 'prop-1',
        action: 'like',
        sessionId: 'session-123',
        metadata: { bucket: 'love' }
      })
    })
  })

  it('should track property views when index changes', async () => {
    // ARRANGE
    const props = {
      linkData: mockLinkData,
      sessionId: 'session-123',
      completedReview: false,
      currentIndex: 0,
      buckets: {}
    }

    // ACT
    const { rerender } = renderHook(
      (p) => useSwipeSession(p),
      {
        wrapper: getWrapper(),
        initialProps: props
      }
    )

    // Wait for initialization
    await waitFor(() => {
      expect(AnalyticsService.createSession).toHaveBeenCalled()
    })

    // Change index
    rerender({ ...props, currentIndex: 1 })

    // ASSERT
    await waitFor(() => {
      expect(AnalyticsService.trackView).toHaveBeenCalledWith({
        linkId: 'link-1',
        propertyId: 'prop-2',
        sessionId: 'session-123'
      })
    })
  })

  it('should complete session when review is finished', async () => {
    // ARRANGE
    const props = {
      linkData: mockLinkData,
      sessionId: 'session-123',
      completedReview: false,
      currentIndex: 0,
      buckets: {
        'prop-1': 'love' as const,
        'prop-2': 'maybe' as const
      }
    }

    // ACT
    const { rerender } = renderHook(
      (p) => useSwipeSession(p),
      {
        wrapper: getWrapper(),
        initialProps: props
      }
    )

    // Wait for initialization
    await waitFor(() => {
      expect(AnalyticsService.createSession).toHaveBeenCalled()
    })

    // Complete review
    rerender({ ...props, completedReview: true })

    // ASSERT
    await waitFor(() => {
      expect(AnalyticsService.completeSession).toHaveBeenCalledWith('session-123', {
        totalViewed: 2,
        totalLiked: 1,
        totalConsidered: 1,
        totalPassed: 0
      })
    })
  })

  it('should handle session creation errors', async () => {
    // ARRANGE
    ;(AnalyticsService.createSession as jest.Mock).mockRejectedValue(new Error('Network error'))
    
    const props = {
      linkData: mockLinkData,
      sessionId: 'session-123',
      completedReview: false,
      currentIndex: 0,
      buckets: {}
    }

    // ACT
    const { result } = renderHook(
      () => useSwipeSession(props),
      { wrapper: getWrapper() }
    )

    // ASSERT
    await waitFor(() => {
      expect(result.current.error).toBe('Failed to start tracking session')
      expect(result.current.loading).toBe(false)
    })
  })

  it('should provide trackInteraction function', async () => {
    // ARRANGE
    const props = {
      linkData: mockLinkData,
      sessionId: 'session-123',
      completedReview: false,
      currentIndex: 0,
      buckets: {}
    }

    // ACT
    const { result } = renderHook(
      () => useSwipeSession(props),
      { wrapper: getWrapper() }
    )

    // Wait for initialization
    await waitFor(() => {
      expect(AnalyticsService.createSession).toHaveBeenCalled()
    })

    // Call trackInteraction
    await result.current.trackInteraction('prop-1', 'view_details', { source: 'modal' })

    // ASSERT
    expect(AnalyticsService.trackActivity).toHaveBeenCalledWith({
      linkId: 'link-1',
      propertyId: 'prop-1',
      action: 'view_details',
      sessionId: 'session-123',
      metadata: { source: 'modal' }
    })
  })

  it('should provide trackView function', async () => {
    // ARRANGE
    const props = {
      linkData: mockLinkData,
      sessionId: 'session-123',
      completedReview: false,
      currentIndex: 0,
      buckets: {}
    }

    // ACT
    const { result } = renderHook(
      () => useSwipeSession(props),
      { wrapper: getWrapper() }
    )

    // Wait for initialization
    await waitFor(() => {
      expect(AnalyticsService.createSession).toHaveBeenCalled()
    })

    // Call trackView
    await result.current.trackView('prop-1')

    // ASSERT
    expect(AnalyticsService.trackView).toHaveBeenCalledWith({
      linkId: 'link-1',
      propertyId: 'prop-1',
      sessionId: 'session-123'
    })
  })

  it('should clean up interval on unmount', async () => {
    // ARRANGE
    const props = {
      linkData: mockLinkData,
      sessionId: 'session-123',
      completedReview: false,
      currentIndex: 0,
      buckets: {}
    }

    // ACT
    const { unmount } = renderHook(
      () => useSwipeSession(props),
      { wrapper: getWrapper() }
    )

    // Wait for initialization
    await waitFor(() => {
      expect(AnalyticsService.createSession).toHaveBeenCalled()
    })

    // Unmount
    unmount()

    // Fast-forward 30 seconds
    jest.advanceTimersByTime(30000)

    // ASSERT - updateSessionActivity should not be called after unmount
    expect(AnalyticsService.updateSessionActivity).not.toHaveBeenCalled()
  })
})