import { supabase } from '@/lib/supabase/client'
import { MetricsService } from './MetricsService'
import { DatabaseError } from '@/lib/errors/ErrorTypes'

// Import interfaces from separate types file
export type {
  AnalyticsData,
  ActivityWithContext,
  LinkAnalytics,
  PropertyAnalytics,
  DashboardAnalytics
} from './types'

/**
 * Service responsible for generating analytics reports
 * Extracted from analytics.service.ts to maintain single responsibility
 */
export class ReportService {
  /**
   * Generate comprehensive link analytics report
   */
  static async getLinkAnalytics(linkCode: string): Promise<LinkAnalytics> {
    try {
      // Get basic metrics
      const metrics = await MetricsService.getLinkMetrics(linkCode)

      // Get link details
      const { data: link, error: linkError } = await supabase
        .from('links')
        .select('id, code')
        .eq('code', linkCode)
        .single()

      if (linkError) {
        throw new DatabaseError(`Failed to find link: ${linkError.message}`, 'getLinkAnalytics', linkError)
      }

      // Get recent activity with context
      const { data: recentActivity, error: activityError } = await supabase
        .from('activities')
        .select(`
          id, action, created_at,
          properties:property_id(id, address, price)
        `)
        .eq('link_id', link.id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (activityError) {
        throw new DatabaseError(`Failed to fetch activities: ${activityError.message}`, 'getLinkAnalytics', activityError)
      }

      return {
        linkId: link.id,
        linkCode: link.code,
        ...metrics,
        sessionCount: 0, // To be implemented
        avgSessionDuration: 0, // To be implemented
        popularProperties: [], // To be implemented
        recentActivity: recentActivity || []
      }
    } catch (error) {
      console.error('ReportService.getLinkAnalytics error:', error)
      throw error
    }
  }

  /**
   * Generate comprehensive property analytics report
   */
  static async getPropertyAnalytics(propertyId: string): Promise<PropertyAnalytics> {
    try {
      // Get basic metrics
      const metrics = await MetricsService.getPropertyMetrics(propertyId)

      return {
        propertyId,
        ...metrics,
        topPerformingLinks: [] // To be implemented
      }
    } catch (error) {
      console.error('ReportService.getPropertyAnalytics error:', error)
      throw error
    }
  }

  /**
   * Generate comprehensive dashboard analytics report
   */
  static async getDashboardAnalytics(): Promise<DashboardAnalytics> {
    try {
      // Get overview metrics
      const overview = await MetricsService.getDashboardMetrics()

      // Get recent activity
      const { data: recentActivity, error: activityError } = await supabase
        .from('activities')
        .select(`
          id, action, created_at,
          properties:property_id(id, address, price),
          links:link_id(id, code, name)
        `)
        .order('created_at', { ascending: false })
        .limit(10)

      if (activityError) {
        throw new DatabaseError(`Failed to fetch recent activity: ${activityError.message}`, 'getDashboardAnalytics', activityError)
      }

      return {
        overview,
        recentActivity: recentActivity || [],
        topProperties: [], // To be implemented
        linkPerformance: [] // To be implemented
      }
    } catch (error) {
      console.error('ReportService.getDashboardAnalytics error:', error)
      throw error
    }
  }
}