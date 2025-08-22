import { SwipeService } from '../swipe.service'
import { SwipeDirection } from '../types'

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: { id: '1' }, error: null }))
        }))
      })),
      upsert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: { id: 'session-1' }, error: null }))
        }))
      })),
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: { link_id: 'test-link' }, error: null }))
        }))
      }))
    }))
  }
}))

describe('SwipeService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset localStorage for each test
    localStorage.clear()
  })

  describe('initializeSession', () => {
    it('should create a new session for valid link code', async () => {
      // ARRANGE
      const linkCode = 'test-link-123'
      
      // ACT
      const session = await SwipeService.initializeSession(linkCode)
      
      // ASSERT
      expect(session).toBeDefined()
      expect(session.id).toBeDefined()
      expect(session.linkId).toBe(linkCode)
      expect(session.startedAt).toBeInstanceOf(Date)
    })

    it('should include device info when available', async () => {
      // ARRANGE
      const linkCode = 'test-link-123'
      Object.defineProperty(window, 'navigator', {
        value: { userAgent: 'test-agent' },
        writable: true
      })
      Object.defineProperty(window, 'screen', {
        value: { width: 1920, height: 1080 },
        writable: true
      })
      
      // ACT
      const session = await SwipeService.initializeSession(linkCode)
      
      // ASSERT
      expect(session.deviceInfo).toEqual({
        userAgent: 'test-agent',
        screen: { width: 1920, height: 1080 }
      })
    })

    it('should throw error for invalid link code', async () => {
      // ARRANGE
      const invalidLinkCode = ''
      
      // ACT & ASSERT
      await expect(SwipeService.initializeSession(invalidLinkCode))
        .rejects.toThrow('Link code is required')
    })
  })

  describe('handleSwipe', () => {
    it('should process right swipe as like action', async () => {
      // ARRANGE
      const direction: SwipeDirection = 'right'
      const propertyId = 'prop-123'
      const sessionId = 'session-456'
      
      // ACT
      const result = await SwipeService.handleSwipe(direction, propertyId, sessionId)
      
      // ASSERT
      expect(result.success).toBe(true)
      expect(result.newState.liked).toContain(propertyId)
      expect(result.newState.viewed).toContain(propertyId)
    })

    it('should process left swipe as dislike action', async () => {
      // ARRANGE
      const direction: SwipeDirection = 'left'
      const propertyId = 'prop-123'
      const sessionId = 'session-456'
      
      // ACT
      const result = await SwipeService.handleSwipe(direction, propertyId, sessionId)
      
      // ASSERT
      expect(result.success).toBe(true)
      expect(result.newState.disliked).toContain(propertyId)
      expect(result.newState.viewed).toContain(propertyId)
    })

    it('should process down swipe as consider action', async () => {
      // ARRANGE
      const direction: SwipeDirection = 'down'
      const propertyId = 'prop-123'
      const sessionId = 'session-456'
      
      // ACT
      const result = await SwipeService.handleSwipe(direction, propertyId, sessionId)
      
      // ASSERT
      expect(result.success).toBe(true)
      expect(result.newState.considering).toContain(propertyId)
      expect(result.newState.viewed).toContain(propertyId)
    })

    it('should handle up swipe as detail view without state change', async () => {
      // ARRANGE
      const direction: SwipeDirection = 'up'
      const propertyId = 'prop-123'
      const sessionId = 'session-456'
      
      // ACT
      const result = await SwipeService.handleSwipe(direction, propertyId, sessionId)
      
      // ASSERT
      expect(result.success).toBe(true)
      expect(result.newState.viewed).toContain(propertyId)
      // Property should not be in any bucket for up swipe
      expect(result.newState.liked).not.toContain(propertyId)
      expect(result.newState.disliked).not.toContain(propertyId)
      expect(result.newState.considering).not.toContain(propertyId)
    })

    it('should not allow swiping same property twice', async () => {
      // ARRANGE
      const direction: SwipeDirection = 'right'
      const propertyId = 'prop-123'
      const sessionId = 'session-456'
      
      // First swipe
      await SwipeService.handleSwipe(direction, propertyId, sessionId)
      
      // ACT - Second swipe on same property
      const result = await SwipeService.handleSwipe('left', propertyId, sessionId)
      
      // ASSERT
      expect(result.success).toBe(false)
    })
  })

  describe('getSwipeState', () => {
    it('should return current swipe state for session', async () => {
      // ARRANGE
      const sessionId = 'session-456'
      
      // Perform some swipes first
      await SwipeService.handleSwipe('right', 'prop-1', sessionId)
      await SwipeService.handleSwipe('left', 'prop-2', sessionId)
      await SwipeService.handleSwipe('down', 'prop-3', sessionId)
      
      // ACT
      const state = await SwipeService.getSwipeState(sessionId)
      
      // ASSERT
      expect(state.liked).toEqual(['prop-1'])
      expect(state.disliked).toEqual(['prop-2'])
      expect(state.considering).toEqual(['prop-3'])
      expect(state.viewed).toEqual(['prop-1', 'prop-2', 'prop-3'])
    })

    it('should return empty state for new session', async () => {
      // ARRANGE
      const sessionId = 'new-session'
      
      // ACT
      const state = await SwipeService.getSwipeState(sessionId)
      
      // ASSERT
      expect(state.liked).toEqual([])
      expect(state.disliked).toEqual([])
      expect(state.considering).toEqual([])
      expect(state.viewed).toEqual([])
    })
  })

  describe('resetProperty', () => {
    it('should remove property from all buckets', async () => {
      // ARRANGE
      const sessionId = 'session-456'
      const propertyId = 'prop-123'
      
      // Add property to liked bucket
      await SwipeService.handleSwipe('right', propertyId, sessionId)
      
      // ACT
      await SwipeService.resetProperty(propertyId, sessionId)
      
      // ASSERT
      const state = await SwipeService.getSwipeState(sessionId)
      expect(state.liked).not.toContain(propertyId)
      expect(state.viewed).not.toContain(propertyId)
    })

    it('should handle resetting non-swiped property gracefully', async () => {
      // ARRANGE
      const sessionId = 'session-456'
      const propertyId = 'prop-non-existent'
      
      // ACT & ASSERT - Should not throw
      await expect(SwipeService.resetProperty(propertyId, sessionId))
        .resolves.not.toThrow()
    })
  })

  describe('Error Handling', () => {
    it('should handle empty property ID', async () => {
      // ARRANGE
      const direction: SwipeDirection = 'right'
      const propertyId = ''
      const sessionId = 'session-456'
      
      // ACT & ASSERT
      await expect(SwipeService.handleSwipe(direction, propertyId, sessionId))
        .rejects.toThrow('Property ID is required')
    })

    it('should handle empty session ID', async () => {
      // ARRANGE
      const direction: SwipeDirection = 'right'
      const propertyId = 'prop-123'
      const sessionId = ''
      
      // ACT & ASSERT
      await expect(SwipeService.handleSwipe(direction, propertyId, sessionId))
        .rejects.toThrow('Session ID is required')
    })
  })
})