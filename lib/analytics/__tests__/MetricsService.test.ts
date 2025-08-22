import { MetricsService } from '../MetricsService'
import { supabase } from '@/lib/supabase/client'

// Mock Supabase
jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({
            data: { id: 'link-1' },
            error: null
          })),
          gte: jest.fn(() => Promise.resolve({
            data: [{ count: 10 }],
            error: null
          })),
          lte: jest.fn(() => Promise.resolve({
            data: [{ count: 5 }],
            error: null
          }))
        }))
      }))
    }))
  }
}))

describe('MetricsService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Module Import', () => {
    it('should import MetricsService successfully', () => {
      // ACT & ASSERT
      expect(MetricsService).toBeDefined()
      expect(typeof MetricsService.getLinkMetrics).toBe('function')
    })
  })

  describe('getLinkMetrics', () => {
    it('should have getLinkMetrics method', () => {
      // ASSERT
      expect(MetricsService.getLinkMetrics).toBeDefined()
      expect(typeof MetricsService.getLinkMetrics).toBe('function')
    })

    it('should get metrics for a specific link', async () => {
      // ARRANGE
      const linkCode = 'test-link-123'

      // ACT
      const result = await MetricsService.getLinkMetrics(linkCode)

      // ASSERT
      expect(result).toBeDefined()
      expect(supabase.from).toHaveBeenCalled()
    })
  })

  describe('getPropertyMetrics', () => {
    it('should have getPropertyMetrics method', () => {
      // ASSERT
      expect(MetricsService.getPropertyMetrics).toBeDefined()
      expect(typeof MetricsService.getPropertyMetrics).toBe('function')
    })

    it('should get metrics for a specific property', async () => {
      // ARRANGE
      const propertyId = 'prop-123'

      // ACT
      const result = await MetricsService.getPropertyMetrics(propertyId)

      // ASSERT
      expect(result).toBeDefined()
      expect(supabase.from).toHaveBeenCalled()
    })
  })

  describe('getDashboardMetrics', () => {
    it('should have getDashboardMetrics method', () => {
      // ASSERT
      expect(MetricsService.getDashboardMetrics).toBeDefined()
      expect(typeof MetricsService.getDashboardMetrics).toBe('function')
    })

    it('should get dashboard metrics', async () => {
      // ACT
      const result = await MetricsService.getDashboardMetrics()

      // ASSERT
      expect(result).toBeDefined()
      expect(supabase.from).toHaveBeenCalled()
    })
  })
})