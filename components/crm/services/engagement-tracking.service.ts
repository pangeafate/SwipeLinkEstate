import { supabase } from '@/lib/supabase/client'
import { ScoringService } from '../scoring.service'
import { LinkDealIntegrationService } from './link-deal-integration.service'
import type { SessionData, EngagementMetrics } from '../types'

/**
 * EngagementTrackingService - Real-time Session & Swipe Tracking
 * 
 * This service bridges the gap between the swipe interface and CRM by
 * tracking user engagement in real-time and converting it to CRM data.
 * It's the core component that makes the "swipe-to-CRM" workflow possible.
 */
export class EngagementTrackingService {

  /**
   * Start tracking a new client session
   */
  static async startSession(
    linkId: string,
    sessionId: string,
    clientInfo?: {
      userAgent?: string
      ip?: string
      referrer?: string
    }
  ): Promise<void> {
    try {
      console.log(`🚀 CRM: Starting engagement tracking for session ${sessionId}`)
      
      // Create session record
      await supabase
        .from('sessions')
        .insert({
          id: sessionId,
          link_id: linkId,
          device_info: clientInfo ? JSON.stringify(clientInfo) : null
        })
      
      // Notify CRM integration layer
      await LinkDealIntegrationService.onLinkAccessed(linkId, sessionId, clientInfo)
      
    } catch (error) {
      console.error('Error starting session tracking:', error)
    }
  }

  /**
   * Track a swipe action in real-time
   */
  static async trackSwipeAction(
    sessionId: string,
    linkId: string,
    action: {
      propertyId: string
      action: 'view' | 'like' | 'dislike' | 'consider' | 'detail'
      timestamp: string
      duration?: number
      metadata?: any
    }
  ): Promise<void> {
    try {
      // Record the activity
      await supabase
        .from('activities')
        .insert({
          session_id: sessionId,
          link_id: linkId,
          property_id: action.propertyId,
          action: action.action,
          created_at: action.timestamp,
          metadata: action.metadata ? JSON.stringify(action.metadata) : null
        })
      
      // Update session last active
      await supabase
        .from('sessions')
        .update({ last_active: action.timestamp })
        .eq('id', sessionId)
      
      // Calculate real-time engagement score
      await this.updateRealTimeEngagementScore(sessionId, linkId, action.action)
      
    } catch (error) {
      console.error('Error tracking swipe action:', error)
    }
  }

  /**
   * Update engagement score in real-time based on session activities
   */
  static async updateRealTimeEngagementScore(
    sessionId: string,
    linkId: string,
    latestAction: string
  ): Promise<void> {
    try {
      // Get current session data
      const sessionData = await this.getSessionData(sessionId, linkId)
      if (!sessionData) return
      
      // Calculate engagement score
      const metrics = await ScoringService.calculateEngagementScore(sessionData)
      
      // Update deal with new engagement score
      await LinkDealIntegrationService.onClientEngagement(linkId, {
        sessionId,
        propertiesViewed: sessionData.propertiesViewed,
        propertiesLiked: sessionData.propertiesLiked,
        propertiesConsidered: sessionData.propertiesConsidered,
        sessionDuration: sessionData.duration,
        engagementScore: metrics.totalScore
      })
      
      // Check for engagement milestones
      await this.checkEngagementMilestones(linkId, metrics, latestAction)
      
    } catch (error) {
      console.error('Error updating real-time engagement score:', error)
    }
  }

  /**
   * End session and create comprehensive engagement summary
   */
  static async endSession(
    sessionId: string,
    linkId: string,
    clientFeedback?: {
      rating?: number
      comments?: string
      interestedProperties?: string[]
    }
  ): Promise<EngagementMetrics | null> {
    try {
      console.log(`🏁 CRM: Ending engagement tracking for session ${sessionId}`)
      
      // Get final session data
      const sessionData = await this.getSessionData(sessionId, linkId)
      if (!sessionData) return null
      
      // Calculate final engagement metrics
      const metrics = await ScoringService.calculateEngagementScore(sessionData)
      
      // Create engagement insights
      const insights = ScoringService.generateEngagementInsights(metrics)
      
      // Notify CRM integration layer with session completion
      await LinkDealIntegrationService.onSessionCompleted(linkId, {
        sessionId,
        duration: sessionData.duration,
        propertiesViewed: sessionData.propertiesViewed,
        propertiesLiked: sessionData.propertiesLiked,
        propertiesConsidered: sessionData.propertiesConsidered,
        completionRate: sessionData.totalProperties > 0 ? 
          sessionData.propertiesViewed / sessionData.totalProperties : 0,
        engagementScore: metrics.totalScore
      })
      
      // Update session as ended
      await supabase
        .from('sessions')
        .update({ 
          last_active: new Date().toISOString(),
          device_info: clientFeedback ? 
            JSON.stringify({ ...JSON.parse(sessionData.deviceInfo || '{}'), feedback: clientFeedback }) :
            sessionData.deviceInfo
        })
        .eq('id', sessionId)
      
      console.log(`✅ CRM: Session ${sessionId} ended with score ${metrics.totalScore}/100 (${insights.temperature})`)
      
      return metrics
      
    } catch (error) {
      console.error('Error ending session tracking:', error)
      return null
    }
  }

  /**
   * Get aggregated session data for scoring
   */
  static async getSessionData(sessionId: string, linkId: string): Promise<SessionData | null> {
    try {
      // Get session info
      const { data: session } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', sessionId)
        .single()
      
      if (!session) return null
      
      // Get all activities for this session
      const { data: activities } = await supabase
        .from('activities')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })
      
      // Get link info for total properties
      const { data: link } = await supabase
        .from('links')
        .select('property_ids')
        .eq('id', linkId)
        .single()
      
      const totalProperties = Array.isArray(link?.property_ids) ? link.property_ids.length : 0
      
      // Calculate session metrics
      const sessionStart = new Date(session.started_at)
      const sessionEnd = session.last_active ? new Date(session.last_active) : new Date()
      const duration = Math.floor((sessionEnd.getTime() - sessionStart.getTime()) / 1000)
      
      const viewedProperties = new Set()
      let propertiesLiked = 0
      let propertiesConsidered = 0
      let propertiesPassed = 0
      let detailViewsOpened = 0
      
      activities?.forEach(activity => {
        viewedProperties.add(activity.property_id)
        
        switch (activity.action) {
          case 'like':
            propertiesLiked++
            break
          case 'consider':
            propertiesConsidered++
            break
          case 'dislike':
            propertiesPassed++
            break
          case 'detail':
            detailViewsOpened++
            break
        }
      })
      
      // Check if this is a return visit
      const { data: previousSessions } = await supabase
        .from('sessions')
        .select('id')
        .eq('link_id', linkId)
        .neq('id', sessionId)
      
      const isReturnVisit = (previousSessions?.length || 0) > 0
      
      const sessionData: SessionData = {
        sessionId,
        linkId,
        startTime: session.started_at,
        endTime: session.last_active || new Date().toISOString(),
        duration,
        totalProperties,
        propertiesViewed: viewedProperties.size,
        propertiesLiked,
        propertiesConsidered,
        propertiesPassed,
        detailViewsOpened,
        averageTimePerProperty: viewedProperties.size > 0 ? duration / viewedProperties.size : 0,
        isCompleted: viewedProperties.size >= totalProperties,
        isReturnVisit
      }
      
      return sessionData
      
    } catch (error) {
      console.error('Error getting session data:', error)
      return null
    }
  }

  /**
   * Check for engagement milestones and trigger appropriate actions
   */
  static async checkEngagementMilestones(
    linkId: string,
    metrics: EngagementMetrics,
    latestAction: string
  ): Promise<void> {
    try {
      const score = metrics.totalScore
      
      // First engagement milestone (score reaches 25)
      if (score >= 25) {
        await this.triggerEngagementMilestone(linkId, 'first_engagement', score)
      }
      
      // Moderate engagement milestone (score reaches 50)
      if (score >= 50) {
        await this.triggerEngagementMilestone(linkId, 'moderate_engagement', score)
      }
      
      // High engagement milestone (score reaches 80)
      if (score >= 80) {
        await this.triggerEngagementMilestone(linkId, 'high_engagement', score)
      }
      
      // Property like milestone
      if (latestAction === 'like') {
        await this.triggerEngagementMilestone(linkId, 'property_liked', score)
      }
      
    } catch (error) {
      console.error('Error checking engagement milestones:', error)
    }
  }

  /**
   * Trigger milestone-based actions
   */
  static async triggerEngagementMilestone(
    linkId: string,
    milestone: string,
    score: number
  ): Promise<void> {
    try {
      // Log milestone for analytics
      console.log(`🎯 CRM: Engagement milestone reached - ${milestone} (score: ${score}) for link ${linkId}`)
      
      // Check if we've already triggered this milestone to avoid duplicates
      const { data: existingTasks } = await supabase
        .from('tasks')
        .select('id')
        .eq('deal_id', linkId)
        .like('automation_trigger', `%${milestone}%`)
        .limit(1)
      
      if (existingTasks && existingTasks.length > 0) {
        // Milestone already triggered
        return
      }
      
      // Create milestone activity record
      await supabase
        .from('activities')
        .insert({
          link_id: linkId,
          action: 'milestone' as any, // May need to expand activity_action enum
          metadata: JSON.stringify({
            milestone,
            score,
            timestamp: new Date().toISOString()
          })
        })
      
      // This would trigger additional business logic if needed
      // For now, the LinkDealIntegrationService handles the task generation
      
    } catch (error) {
      console.error('Error triggering engagement milestone:', error)
    }
  }

  /**
   * Get real-time engagement analytics for a link/deal
   */
  static async getRealtimeEngagementAnalytics(linkId: string): Promise<{
    currentScore: number
    temperature: 'hot' | 'warm' | 'cold'
    activeSessions: number
    todayMetrics: {
      totalSessions: number
      totalEngagement: number
      propertiesViewed: number
      propertiesLiked: number
    }
  } | null> {
    try {
      // Get current deal engagement score
      const { data: deal } = await supabase
        .from('links')
        .select('engagement_score, temperature')
        .eq('id', linkId)
        .single()
      
      // Get today's sessions
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const { data: todaySessions } = await supabase
        .from('sessions')
        .select('id, started_at, last_active')
        .eq('link_id', linkId)
        .gte('started_at', today.toISOString())
      
      // Get today's activities
      const { data: todayActivities } = await supabase
        .from('activities')
        .select('action, property_id')
        .eq('link_id', linkId)
        .gte('created_at', today.toISOString())
      
      // Count active sessions (last active within 5 minutes)
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
      const activeSessions = todaySessions?.filter(session => 
        new Date(session.last_active || session.started_at) > fiveMinutesAgo
      ).length || 0
      
      // Calculate today's metrics
      const uniquePropertiesViewed = new Set(todayActivities?.map(a => a.property_id)).size
      const propertiesLiked = todayActivities?.filter(a => a.action === 'like').length || 0
      
      return {
        currentScore: deal?.engagement_score || 0,
        temperature: deal?.temperature || 'cold',
        activeSessions,
        todayMetrics: {
          totalSessions: todaySessions?.length || 0,
          totalEngagement: deal?.engagement_score || 0,
          propertiesViewed: uniquePropertiesViewed,
          propertiesLiked
        }
      }
      
    } catch (error) {
      console.error('Error getting realtime engagement analytics:', error)
      return null
    }
  }

  /**
   * Batch process inactive sessions to finalize their engagement scores
   * Should be called periodically (e.g., every hour) to clean up stale sessions
   */
  static async processInactiveSessions(inactiveThresholdMinutes: number = 30): Promise<{
    processed: number
    errors: number
  }> {
    try {
      console.log('🧹 CRM: Processing inactive sessions...')
      
      const thresholdTime = new Date(Date.now() - inactiveThresholdMinutes * 60 * 1000)
      
      // Get sessions that have been inactive for more than threshold
      const { data: inactiveSessions } = await supabase
        .from('sessions')
        .select('id, link_id, last_active, started_at')
        .lt('last_active', thresholdTime.toISOString())
        .is('last_active', null) // Sessions that haven't been formally ended
      
      let processed = 0
      let errors = 0
      
      for (const session of inactiveSessions || []) {
        try {
          await this.endSession(session.id, session.link_id)
          processed++
        } catch (error) {
          console.error(`Error processing inactive session ${session.id}:`, error)
          errors++
        }
      }
      
      console.log(`✅ CRM: Processed ${processed} inactive sessions, ${errors} errors`)
      
      return { processed, errors }
      
    } catch (error) {
      console.error('Error in processInactiveSessions:', error)
      return { processed: 0, errors: 1 }
    }
  }
}