/**
 * @jest-environment jsdom
 */
import { AnalyticsService } from '@/lib/analytics/analytics.service'
import { setupTest } from '@/test/utils/testSetup'
import { fixtures } from '@/test/fixtures'
import { SupabaseMockFactory } from '@/test/mocks/supabase'

// Mock Supabase for testing using shared factory
jest.mock('@/lib/supabase/client', () => ({
  supabase: SupabaseMockFactory.create({
    analytics: fixtures.analytics,
    properties: fixtures.properties,
    links: fixtures.links
  })
}))

describe('Analytics Flow Integration', () => {
  setupTest({ suppressConsoleErrors: true })
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Session Management', () => {
    it('should create a session with device info', async () => {
      const sessionData = {
        sessionId: 'test-session-123',
        linkId: 'test-link',
        deviceInfo: AnalyticsService.getDeviceInfo()
      }

      const session = await AnalyticsService.createSession(sessionData)

      expect(session).toBeDefined()
      expect(session.id).toBe('test-session-123')
      expect(supabase.from).toHaveBeenCalledWith('sessions')
    })

    it('should update session activity', async () => {
      await AnalyticsService.updateSessionActivity('test-session-123')

      expect(supabase.from).toHaveBeenCalledWith('sessions')
    })
  })

  describe('Activity Tracking', () => {
    it('should track property view activity', async () => {
      const viewData = {
        linkId: 'test-link',
        propertyId: 'test-property-123',
        sessionId: 'test-session-123',
        metadata: {
          viewType: 'card_display',
          timestamp: new Date().toISOString()
        }
      }

      const activity = await AnalyticsService.trackView(viewData)

      expect(activity).toBeDefined()
      expect(supabase.from).toHaveBeenCalledWith('activities')
    })

    it('should track swipe activity', async () => {
      const swipeData = {
        linkId: 'test-link',
        propertyId: 'test-property-123',
        action: 'like' as const,
        sessionId: 'test-session-123',
        metadata: {
          swipeDirection: 'right',
          timestamp: new Date().toISOString()
        }
      }

      const activity = await AnalyticsService.trackSwipe(swipeData)

      expect(activity).toBeDefined()
      expect(supabase.from).toHaveBeenCalledWith('activities')
    })

    it('should generate valid session ID', () => {
      const sessionId = AnalyticsService.generateSessionId()

      expect(sessionId).toBeDefined()
      expect(sessionId).toMatch(/^session-\d+-[a-z0-9]+$/)
    })

    it('should get device info', () => {
      const deviceInfo = AnalyticsService.getDeviceInfo()

      expect(deviceInfo).toBeDefined()
      expect(typeof deviceInfo).toBe('object')
      // In Node.js environment, most browser APIs won't be available
      // but the function should still return an object
    })
  })

  describe('Analytics Retrieval', () => {
    it('should get dashboard analytics', async () => {
      // Mock the complex dashboard analytics response
      const mockSupabase = supabase as any
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'properties') {
          return {
            select: jest.fn(() => ({
              count: 5,
              head: true
            }))
          }
        }
        if (table === 'links') {
          return {
            select: jest.fn(() => ({
              count: 3
            }))
          }
        }
        if (table === 'activities') {
          return {
            select: jest.fn(() => ({
              count: 25,
              order: jest.fn(() => ({
                limit: jest.fn(() => Promise.resolve({
                  data: [],
                  error: null
                }))
              }))
            }))
          }
        }
        if (table === 'sessions') {
          return {
            select: jest.fn(() => ({
              order: jest.fn(() => ({
                limit: jest.fn(() => Promise.resolve({
                  data: [],
                  error: null
                }))
              }))
            }))
          }
        }
        return {
          select: jest.fn(() => Promise.resolve({ data: [], error: null }))
        }
      })

      const analytics = await AnalyticsService.getDashboardAnalytics()

      expect(analytics).toBeDefined()
      expect(analytics.overview).toBeDefined()
      expect(analytics.recentActivity).toBeDefined()
      expect(analytics.topProperties).toBeDefined()
      expect(analytics.linkPerformance).toBeDefined()
    })
  })

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      // Mock database error
      const mockSupabase = supabase as any
      mockSupabase.from.mockReturnValue({
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({
              data: null,
              error: { message: 'Database error' }
            }))
          }))
        }))
      })

      await expect(
        AnalyticsService.trackActivity({
          propertyId: 'test-property',
          action: 'view',
          sessionId: 'test-session'
        })
      ).rejects.toThrow('Failed to track activity')
    })
  })
})