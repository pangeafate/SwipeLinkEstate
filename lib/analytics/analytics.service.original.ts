import { supabase } from '@/lib/supabase/client'
import type { Activity, Session, ActivityInsert, SessionInsert } from '@/lib/supabase/types'
import { errorHandler } from '@/lib/errors/ErrorHandler'
import { DatabaseError } from '@/lib/errors/ErrorTypes'

export interface AnalyticsData {
  totalViews: number
  uniqueViews: number
  totalSwipes: number
  totalLikes: number
  totalDislikes: number
  recentActivity: ActivityWithContext[]
}

export interface ActivityWithContext extends Activity {
  property?: {
    id: string
    address: string
    price: number | null
  }
  link?: {
    id: string
    code: string
    name: string | null
  }
}

export interface LinkAnalytics extends AnalyticsData {
  linkId: string
  linkCode: string
  sessionCount: number
  avgSessionDuration: number
  popularProperties: Array<{
    propertyId: string
    address: string
    viewCount: number
    likeCount: number
    dislikeCount: number
  }>
}

export interface PropertyAnalytics {
  propertyId: string
  totalViews: number
  totalLikes: number
  totalDislikes: number
  likeRate: number
  viewsFromLinks: number
  topPerformingLinks: Array<{
    linkCode: string
    linkName: string | null
    viewCount: number
    likeCount: number
  }>
}

export interface DashboardAnalytics {
  overview: {
    totalProperties: number
    activeProperties: number
    totalLinks: number
    totalViews: number
    totalSessions: number
    avgSessionDuration: number
  }
  recentActivity: ActivityWithContext[]
  topProperties: Array<{
    property: {
      id: string
      address: string
      price: number | null
    }
    stats: {
      views: number
      likes: number
      dislikes: number
      likeRate: number
    }
  }>
  linkPerformance: Array<{
    link: {
      id: string
      code: string
      name: string | null
    }
    stats: {
      views: number
      sessions: number
      avgDuration: number
    }
  }>
}

export class AnalyticsService {
  /**
   * Track a user activity (view, swipe, etc.)
   */
  static async trackActivity(data: {
    linkId?: string
    propertyId?: string
    action: string
    sessionId?: string
    metadata?: Record<string, any>
  }): Promise<Activity> {
    try {
      const activityData: ActivityInsert = {
        link_id: data.linkId || null,
        property_id: data.propertyId || null,
        action: data.action,
        session_id: data.sessionId || null,
        metadata: data.metadata || null
      }

      const { data: activity, error } = await supabase
        .from('activities')
        .insert(activityData)
        .select()
        .single()

      if (error) {
        throw new DatabaseError(`Failed to track activity: ${error.message}`, 'trackActivity', error)
      }

      return activity
    } catch (error) {
      console.error('AnalyticsService.trackActivity error:', error)
      throw error
    }
  }

  /**
   * Create or update a user session
   */
  static async createSession(data: {
    sessionId: string
    linkId?: string
    deviceInfo?: Record<string, any>
  }): Promise<Session> {
    try {
      const sessionData: SessionInsert = {
        id: data.sessionId,
        link_id: data.linkId || null,
        device_info: data.deviceInfo || null
      }

      const { data: session, error } = await supabase
        .from('sessions')
        .upsert(sessionData, { onConflict: 'id' })
        .select()
        .single()

      if (error) {
        throw new DatabaseError(`Failed to create session: ${error.message}`, 'createSession', error)
      }

      return session
    } catch (error) {
      console.error('AnalyticsService.createSession error:', error)
      throw error
    }
  }

  /**
   * Update session last active timestamp
   */
  static async updateSessionActivity(sessionId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('sessions')
        .update({ last_active: new Date().toISOString() })
        .eq('id', sessionId)

      if (error) {
        throw new DatabaseError(`Failed to update session activity: ${error.message}`, 'updateSessionActivity', error)
      }
    } catch (error) {
      console.error('AnalyticsService.updateSessionActivity error:', error)
      throw error
    }
  }

  /**
   * Get comprehensive analytics for a specific link
   */
  static async getLinkAnalytics(linkCode: string): Promise<LinkAnalytics> {
    try {
    // Get link details first
    const { data: link, error: linkError } = await supabase
      .from('links')
      .select('id, code, name')
      .eq('code', linkCode)
      .single()

    if (linkError) {
      throw new DatabaseError(`Link not found: ${linkError.message}`, 'getLinkAnalytics', linkError)
    }

    // Get all activities for this link with property details
    const { data: activities, error: activitiesError } = await supabase
      .from('activities')
      .select(`
        *,
        properties!inner(id, address, price)
      `)
      .eq('link_id', link.id)
      .order('created_at', { ascending: false })

    if (activitiesError) {
      throw new DatabaseError(`Failed to fetch activities: ${activitiesError.message}`, 'getLinkAnalytics', activitiesError)
    }

    // Get session data for this link
    const { data: sessions, error: sessionsError } = await supabase
      .from('sessions')
      .select('*')
      .eq('link_id', link.id)

    if (sessionsError) {
      throw new DatabaseError(`Failed to fetch sessions: ${sessionsError.message}`, 'getLinkAnalytics', sessionsError)
    }

    // Calculate metrics
    const totalViews = activities?.filter(a => a.action === 'view').length || 0
    const uniqueViews = new Set(activities?.filter(a => a.action === 'view').map(a => a.session_id)).size
    const totalSwipes = activities?.filter(a => ['like', 'dislike'].includes(a.action)).length || 0
    const totalLikes = activities?.filter(a => a.action === 'like').length || 0
    const totalDislikes = activities?.filter(a => a.action === 'dislike').length || 0

    // Calculate average session duration
    const avgSessionDuration = sessions?.reduce((sum, session) => {
      const start = new Date(session.started_at).getTime()
      const end = new Date(session.last_active).getTime()
      return sum + (end - start)
    }, 0) / (sessions?.length || 1) / 1000 // Convert to seconds

    // Get popular properties for this link
    const propertyStats = activities?.reduce((acc, activity) => {
      if (!activity.property_id) return acc
      
      const propertyId = activity.property_id
      if (!acc[propertyId]) {
        acc[propertyId] = {
          propertyId,
          address: (activity as any).properties?.address || 'Unknown',
          viewCount: 0,
          likeCount: 0,
          dislikeCount: 0
        }
      }
      
      if (activity.action === 'view') acc[propertyId].viewCount++
      if (activity.action === 'like') acc[propertyId].likeCount++
      if (activity.action === 'dislike') acc[propertyId].dislikeCount++
      
      return acc
    }, {} as Record<string, any>) || {}

    const popularProperties = Object.values(propertyStats)
      .sort((a: any, b: any) => b.viewCount - a.viewCount)
      .slice(0, 10)

    return {
      linkId: link.id,
      linkCode: link.code,
      totalViews,
      uniqueViews,
      totalSwipes,
      totalLikes,
      totalDislikes,
      sessionCount: sessions?.length || 0,
      avgSessionDuration,
      recentActivity: activities?.slice(0, 20).map(a => ({
        ...a,
        property: (a as any).properties,
        link: { id: link.id, code: link.code, name: link.name }
      })) || [],
      popularProperties: popularProperties as any
    }
    } catch (error) {
      console.error('AnalyticsService.getLinkAnalytics error:', error)
      throw error
    }
  }

  /**
   * Get analytics for a specific property across all links
   */
  static async getPropertyAnalytics(propertyId: string): Promise<PropertyAnalytics> {
    try {
    // Get all activities for this property
    const { data: activities, error } = await supabase
      .from('activities')
      .select(`
        *,
        links!inner(id, code, name)
      `)
      .eq('property_id', propertyId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new DatabaseError(`Failed to fetch property analytics: ${error.message}`, 'getPropertyAnalytics', error)
    }

    const totalViews = activities?.filter(a => a.action === 'view').length || 0
    const totalLikes = activities?.filter(a => a.action === 'like').length || 0
    const totalDislikes = activities?.filter(a => a.action === 'dislike').length || 0
    const likeRate = totalLikes + totalDislikes > 0 ? totalLikes / (totalLikes + totalDislikes) : 0
    const viewsFromLinks = activities?.filter(a => a.link_id && a.action === 'view').length || 0

    // Get top performing links for this property
    const linkStats = activities?.reduce((acc, activity) => {
      if (!activity.link_id) return acc
      
      const linkId = activity.link_id
      if (!acc[linkId]) {
        acc[linkId] = {
          linkCode: (activity as any).links?.code || 'Unknown',
          linkName: (activity as any).links?.name,
          viewCount: 0,
          likeCount: 0
        }
      }
      
      if (activity.action === 'view') acc[linkId].viewCount++
      if (activity.action === 'like') acc[linkId].likeCount++
      
      return acc
    }, {} as Record<string, any>) || {}

    const topPerformingLinks = Object.values(linkStats)
      .sort((a: any, b: any) => b.viewCount - a.viewCount)
      .slice(0, 5)

    return {
      propertyId,
      totalViews,
      totalLikes,
      totalDislikes,
      likeRate,
      viewsFromLinks,
      topPerformingLinks: topPerformingLinks as any
    }
    } catch (error) {
      console.error('AnalyticsService.getPropertyAnalytics error:', error)
      throw error
    }
  }

  /**
   * Get comprehensive dashboard analytics
   */
  static async getDashboardAnalytics(): Promise<DashboardAnalytics> {
    try {
    // Get overview statistics using Promise.all for parallel execution
    const [propertyStats, linkStats, activityStats, sessionStats] = await Promise.all([
      // Property counts
      Promise.all([
        supabase.from('properties').select('id', { count: 'exact', head: true }),
        supabase.from('properties').select('id', { count: 'exact', head: true }).eq('status', 'active')
      ]),
      
      // Link count
      supabase.from('links').select('id', { count: 'exact', head: true }),
      
      // Activity statistics
      Promise.all([
        supabase.from('activities').select('id', { count: 'exact', head: true }),
        supabase.from('activities').select('id', { count: 'exact', head: true }).eq('action', 'view')
      ]),
      
      // Session statistics
      supabase.from('sessions').select('*').order('started_at', { ascending: false }).limit(100)
    ])

    // Calculate overview metrics
    const totalProperties = propertyStats[0].count || 0
    const activeProperties = propertyStats[1].count || 0
    const totalLinks = linkStats.count || 0
    const totalActivities = activityStats[0].count || 0
    const totalViews = activityStats[1].count || 0
    const totalSessions = sessionStats.data?.length || 0

    // Calculate average session duration
    const avgSessionDuration = sessionStats.data?.reduce((sum, session) => {
      const start = new Date(session.started_at).getTime()
      const end = new Date(session.last_active).getTime()
      return sum + (end - start)
    }, 0) / (totalSessions || 1) / 1000 // Convert to seconds

    // Get recent activity with context
    const { data: recentActivity } = await supabase
      .from('activities')
      .select(`
        *,
        properties(id, address, price),
        links(id, code, name)
      `)
      .order('created_at', { ascending: false })
      .limit(10)

    // Get top properties by views
    const { data: topPropertiesData } = await supabase
      .from('activities')
      .select(`
        property_id,
        properties!inner(id, address, price),
        action
      `)
      .not('property_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1000) // Get enough data to calculate stats

    // Process top properties
    const propertyViewStats = topPropertiesData?.reduce((acc, activity) => {
      const propertyId = activity.property_id!
      if (!acc[propertyId]) {
        acc[propertyId] = {
          property: (activity as any).properties,
          views: 0,
          likes: 0,
          dislikes: 0
        }
      }
      
      if (activity.action === 'view') acc[propertyId].views++
      if (activity.action === 'like') acc[propertyId].likes++
      if (activity.action === 'dislike') acc[propertyId].dislikes++
      
      return acc
    }, {} as Record<string, any>) || {}

    const topProperties = Object.values(propertyViewStats)
      .map((stats: any) => ({
        property: stats.property,
        stats: {
          views: stats.views,
          likes: stats.likes,
          dislikes: stats.dislikes,
          likeRate: stats.likes + stats.dislikes > 0 ? stats.likes / (stats.likes + stats.dislikes) : 0
        }
      }))
      .sort((a, b) => b.stats.views - a.stats.views)
      .slice(0, 5)

    // Get link performance data
    const { data: linkActivityData } = await supabase
      .from('activities')
      .select(`
        link_id,
        links!inner(id, code, name),
        action,
        session_id
      `)
      .not('link_id', 'is', null)
      .limit(1000)

    const linkViewStats = linkActivityData?.reduce((acc, activity) => {
      const linkId = activity.link_id!
      if (!acc[linkId]) {
        acc[linkId] = {
          link: (activity as any).links,
          views: 0,
          sessions: new Set(),
          avgDuration: 0
        }
      }
      
      if (activity.action === 'view') acc[linkId].views++
      if (activity.session_id) acc[linkId].sessions.add(activity.session_id)
      
      return acc
    }, {} as Record<string, any>) || {}

    const linkPerformance = Object.values(linkViewStats)
      .map((stats: any) => ({
        link: stats.link,
        stats: {
          views: stats.views,
          sessions: stats.sessions.size,
          avgDuration: 0 // TODO: Calculate from session durations
        }
      }))
      .sort((a, b) => b.stats.views - a.stats.views)
      .slice(0, 5)

    return {
      overview: {
        totalProperties,
        activeProperties,
        totalLinks,
        totalViews,
        totalSessions,
        avgSessionDuration
      },
      recentActivity: (recentActivity || []).map(activity => ({
        ...activity,
        property: (activity as any).properties,
        link: (activity as any).links
      })),
      topProperties: topProperties as any,
      linkPerformance: linkPerformance as any
    }
    } catch (error) {
      console.error('AnalyticsService.getDashboardAnalytics error:', error)
      throw error
    }
  }

  /**
   * Track a swipe action
   */
  static async trackSwipe(data: {
    linkId: string
    propertyId: string
    action: 'like' | 'dislike'
    sessionId: string
    metadata?: Record<string, any>
  }): Promise<Activity> {
    return this.trackActivity({
      linkId: data.linkId,
      propertyId: data.propertyId,
      action: data.action,
      sessionId: data.sessionId,
      metadata: data.metadata
    })
  }

  /**
   * Track a property view
   */
  static async trackView(data: {
    linkId?: string
    propertyId: string
    sessionId: string
    metadata?: Record<string, any>
  }): Promise<Activity> {
    return this.trackActivity({
      linkId: data.linkId,
      propertyId: data.propertyId,
      action: 'view',
      sessionId: data.sessionId,
      metadata: data.metadata
    })
  }

  /**
   * Generate a unique session ID
   */
  static generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Get device info for session tracking
   */
  static getDeviceInfo(): Record<string, any> {
    if (typeof window === 'undefined') return {}

    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screenWidth: window.screen?.width,
      screenHeight: window.screen?.height,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timestamp: new Date().toISOString()
    }
  }
}