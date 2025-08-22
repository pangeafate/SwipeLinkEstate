import { ReportService } from '../ReportService'
import { supabase } from '@/lib/supabase/client'

// Mock Supabase
jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: jest.fn((tableName) => {
      if (tableName === 'links') {
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({
                data: { id: 'link-1', code: 'test-link-123' },
                error: null
              }))
            }))
          }))
        }
      } else if (tableName === 'activities') {
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              order: jest.fn(() => ({
                limit: jest.fn(() => Promise.resolve({
                  data: [
                    { action: 'view', count: 10, created_at: '2023-01-01' },
                    { action: 'like', count: 5, created_at: '2023-01-02' }
                  ],
                  error: null
                }))
              }))
            })),
            order: jest.fn(() => ({
              limit: jest.fn(() => Promise.resolve({
                data: [
                  { action: 'view', count: 10, created_at: '2023-01-01' },
                  { action: 'like', count: 5, created_at: '2023-01-02' }
                ],
                error: null
              }))
            }))
          }))
        }
      } else {
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              order: jest.fn(() => ({
                limit: jest.fn(() => Promise.resolve({
                  data: [],
                  error: null
                }))
              }))
            }))
          }))
        }
      }
    })
  }
}))

// Mock MetricsService
jest.mock('../MetricsService', () => ({
  MetricsService: {
    getLinkMetrics: jest.fn().mockResolvedValue({
      totalViews: 100,
      totalSwipes: 50,
      uniqueVisitors: 25
    }),
    getPropertyMetrics: jest.fn().mockResolvedValue({
      views: 20,
      likes: 10,
      dislikes: 5
    }),
    getDashboardMetrics: jest.fn().mockResolvedValue({
      totalLinks: 10,
      totalProperties: 50,
      totalActivities: 500
    })
  }
}))

describe('ReportService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset the mock implementation
    ;(supabase.from as jest.Mock).mockImplementation((tableName) => {
      if (tableName === 'links') {
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({
                data: { id: 'link-1', code: 'test-link-123' },
                error: null
              }))
            }))
          }))
        }
      } else if (tableName === 'activities') {
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              order: jest.fn(() => ({
                limit: jest.fn(() => Promise.resolve({
                  data: [
                    { action: 'view', count: 10, created_at: '2023-01-01' },
                    { action: 'like', count: 5, created_at: '2023-01-02' }
                  ],
                  error: null
                }))
              }))
            })),
            order: jest.fn(() => ({
              limit: jest.fn(() => Promise.resolve({
                data: [
                  { action: 'view', count: 10, created_at: '2023-01-01' },
                  { action: 'like', count: 5, created_at: '2023-01-02' }
                ],
                error: null
              }))
            }))
          }))
        }
      } else {
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              order: jest.fn(() => ({
                limit: jest.fn(() => Promise.resolve({
                  data: [],
                  error: null
                }))
              }))
            }))
          }))
        }
      }
    })
  })

  describe('getLinkAnalytics', () => {
    it('should generate link analytics report', async () => {
      // ARRANGE
      const linkCode = 'test-link-123'

      // ACT
      const result = await ReportService.getLinkAnalytics(linkCode)

      // ASSERT
      expect(result).toBeDefined()
      expect(result.linkCode).toBe(linkCode)
      expect(supabase.from).toHaveBeenCalled()
    })

    it('should handle link not found', async () => {
      // ARRANGE
      const linkCode = 'non-existent-link'
      
      // Override the mock for this specific test
      const mockSingle = jest.fn(() => Promise.resolve({
        data: null,
        error: { message: 'No rows found' }
      }))
      
      ;(supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: mockSingle
          }))
        }))
      })

      // ACT & ASSERT
      await expect(ReportService.getLinkAnalytics(linkCode)).rejects.toThrow()
    })
  })

  describe('getPropertyAnalytics', () => {
    it('should generate property analytics report', async () => {
      // ARRANGE
      const propertyId = 'prop-123'

      // ACT
      const result = await ReportService.getPropertyAnalytics(propertyId)

      // ASSERT
      expect(result).toBeDefined()
      expect(result.propertyId).toBe(propertyId)
      // This method calls MetricsService.getPropertyMetrics internally
      expect(result.views).toBe(20)
      expect(result.likes).toBe(10)
    })
  })

  describe('getDashboardAnalytics', () => {
    it('should generate dashboard analytics report', async () => {
      // ACT
      const result = await ReportService.getDashboardAnalytics()

      // ASSERT
      expect(result).toBeDefined()
      expect(result.overview).toBeDefined()
      expect(result.recentActivity).toBeDefined()
      expect(supabase.from).toHaveBeenCalled()
    })
  })
})