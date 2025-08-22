import { TrackingService } from '../TrackingService'
import { supabase } from '@/lib/supabase/client'

// Mock Supabase
jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: jest.fn((tableName) => {
      if (tableName === 'sessions') {
        return {
          insert: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({
                data: { id: 'session-1' },
                error: null
              }))
            }))
          })),
          upsert: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({
                data: { id: 'session-1' },
                error: null
              }))
            }))
          })),
          update: jest.fn(() => ({
            eq: jest.fn(() => Promise.resolve({
              data: { id: 'session-1' },
              error: null
            }))
          }))
        }
      } else {
        // activities table
        return {
          insert: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({
                data: { id: '1', action: 'test' },
                error: null
              }))
            }))
          }))
        }
      }
    })
  }
}))

describe('TrackingService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('trackActivity', () => {
    it('should track user activity', async () => {
      // ARRANGE
      const activityData = {
        linkId: 'link-123',
        propertyId: 'prop-456',
        action: 'view',
        sessionId: 'session-789',
        metadata: { test: 'data' }
      }

      // ACT
      const result = await TrackingService.trackActivity(activityData)

      // ASSERT
      expect(result).toEqual({ id: '1', action: 'test' })
      expect(supabase.from).toHaveBeenCalledWith('activities')
    })
  })

  describe('createSession', () => {
    it('should create a new session', async () => {
      // ARRANGE
      const sessionData = {
        sessionId: 'session-123',
        linkId: 'link-456',
        deviceInfo: { userAgent: 'test-agent' }
      }

      // ACT
      const result = await TrackingService.createSession(sessionData)

      // ASSERT
      expect(result).toEqual({ id: 'session-1' })
      expect(supabase.from).toHaveBeenCalledWith('sessions')
    })
  })

  describe('updateSessionActivity', () => {
    it('should update session activity', async () => {
      // ARRANGE
      const sessionId = 'session-123'

      // ACT
      await TrackingService.updateSessionActivity(sessionId)

      // ASSERT
      expect(supabase.from).toHaveBeenCalledWith('sessions')
    })
  })

  describe('trackSwipe', () => {
    it('should track swipe activity', async () => {
      // ARRANGE
      const swipeData = {
        propertyId: 'prop-123',
        action: 'like' as const,
        sessionId: 'session-456',
        linkId: 'link-789',
        metadata: { direction: 'right' }
      }

      // ACT
      const result = await TrackingService.trackSwipe(swipeData)

      // ASSERT
      expect(result).toEqual({ id: '1', action: 'test' })
      expect(supabase.from).toHaveBeenCalledWith('activities')
    })
  })

  describe('trackView', () => {
    it('should track view activity', async () => {
      // ARRANGE
      const viewData = {
        propertyId: 'prop-123',
        linkId: 'link-456',
        sessionId: 'session-789'
      }

      // ACT
      const result = await TrackingService.trackView(viewData)

      // ASSERT
      expect(result).toEqual({ id: '1', action: 'test' })
      expect(supabase.from).toHaveBeenCalledWith('activities')
    })
  })
})