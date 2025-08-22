import { supabase } from '@/lib/supabase/client'
import { DatabaseError } from '@/lib/errors/ErrorTypes'

/**
 * Service responsible for calculating and aggregating metrics
 * Extracted from analytics.service.ts to maintain single responsibility
 */
export class MetricsService {
  /**
   * Get basic link metrics
   */
  static async getLinkMetrics(linkCode: string) {
    try {
      const { data: link, error: linkError } = await supabase
        .from('links')
        .select('id')
        .eq('code', linkCode)
        .single()

      if (linkError) {
        throw new DatabaseError(`Failed to find link: ${linkError.message}`, 'getLinkMetrics', linkError)
      }

      // Get activity counts
      const { data: activities, error: activitiesError } = await supabase
        .from('activities')
        .select('action, property_id')
        .eq('link_id', link.id)

      if (activitiesError) {
        throw new DatabaseError(`Failed to fetch activities: ${activitiesError.message}`, 'getLinkMetrics', activitiesError)
      }

      const totalViews = activities?.filter(a => a.action === 'view').length || 0
      const totalLikes = activities?.filter(a => a.action === 'like').length || 0
      const totalDislikes = activities?.filter(a => a.action === 'dislike').length || 0
      const totalSwipes = totalLikes + totalDislikes
      const uniqueViews = new Set(activities?.filter(a => a.action === 'view').map(a => a.property_id)).size

      return {
        totalViews,
        uniqueViews,
        totalSwipes,
        totalLikes,
        totalDislikes
      }
    } catch (error) {
      console.error('MetricsService.getLinkMetrics error:', error)
      throw error
    }
  }

  /**
   * Get basic property metrics
   */
  static async getPropertyMetrics(propertyId: string) {
    try {
      const { data: activities, error } = await supabase
        .from('activities')
        .select('action, link_id')
        .eq('property_id', propertyId)

      if (error) {
        throw new DatabaseError(`Failed to fetch property activities: ${error.message}`, 'getPropertyMetrics', error)
      }

      const totalViews = activities?.filter(a => a.action === 'view').length || 0
      const totalLikes = activities?.filter(a => a.action === 'like').length || 0
      const totalDislikes = activities?.filter(a => a.action === 'dislike').length || 0
      const viewsFromLinks = new Set(activities?.filter(a => a.action === 'view' && a.link_id).map(a => a.link_id)).size

      return {
        totalViews,
        totalLikes,
        totalDislikes,
        viewsFromLinks,
        likeRate: totalViews > 0 ? totalLikes / totalViews : 0
      }
    } catch (error) {
      console.error('MetricsService.getPropertyMetrics error:', error)
      throw error
    }
  }

  /**
   * Get dashboard overview metrics
   */
  static async getDashboardMetrics() {
    try {
      // Get property counts
      const { count: totalProperties, error: propertiesError } = await supabase
        .from('properties')
        .select('id', { count: 'exact', head: true })

      if (propertiesError) {
        throw new DatabaseError(`Failed to count properties: ${propertiesError.message}`, 'getDashboardMetrics', propertiesError)
      }

      // Get active properties count
      const { count: activeProperties, error: activeError } = await supabase
        .from('properties')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active')

      if (activeError) {
        throw new DatabaseError(`Failed to count active properties: ${activeError.message}`, 'getDashboardMetrics', activeError)
      }

      // Get link counts
      const { count: totalLinks, error: linksError } = await supabase
        .from('links')
        .select('id', { count: 'exact', head: true })

      if (linksError) {
        throw new DatabaseError(`Failed to count links: ${linksError.message}`, 'getDashboardMetrics', linksError)
      }

      // Get activity counts
      const { data: activities, error: activitiesError } = await supabase
        .from('activities')
        .select('action, session_id')

      if (activitiesError) {
        throw new DatabaseError(`Failed to fetch activities: ${activitiesError.message}`, 'getDashboardMetrics', activitiesError)
      }

      const totalViews = activities?.filter(a => a.action === 'view').length || 0
      const totalSessions = new Set(activities?.map(a => a.session_id).filter(Boolean)).size

      // Get session data for average duration
      const { data: sessions, error: sessionsError } = await supabase
        .from('sessions')
        .select('created_at, updated_at')

      if (sessionsError) {
        throw new DatabaseError(`Failed to fetch sessions: ${sessionsError.message}`, 'getDashboardMetrics', sessionsError)
      }

      const avgSessionDuration = sessions?.reduce((acc, session) => {
        const duration = new Date(session.updated_at).getTime() - new Date(session.created_at).getTime()
        return acc + duration
      }, 0) / Math.max(sessions?.length || 1, 1) / 1000 // Convert to seconds

      return {
        totalProperties: totalProperties || 0,
        activeProperties: activeProperties || 0,
        totalLinks: totalLinks || 0,
        totalViews,
        totalSessions,
        avgSessionDuration: Math.round(avgSessionDuration)
      }
    } catch (error) {
      console.error('MetricsService.getDashboardMetrics error:', error)
      throw error
    }
  }
}