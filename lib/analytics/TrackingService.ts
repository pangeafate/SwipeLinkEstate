import { supabase } from '@/lib/supabase/client'
import type { Activity, Session, ActivityInsert, SessionInsert } from '@/lib/supabase/types'
import { DatabaseError } from '@/lib/errors/ErrorTypes'

/**
 * Service responsible for tracking user activities and sessions
 * Extracted from analytics.service.ts to maintain single responsibility
 */
export class TrackingService {
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
      console.error('TrackingService.trackActivity error:', error)
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
        .insert(sessionData)
        .select()
        .single()

      if (error) {
        throw new DatabaseError(`Failed to create session: ${error.message}`, 'createSession', error)
      }

      return session
    } catch (error) {
      console.error('TrackingService.createSession error:', error)
      throw error
    }
  }

  /**
   * Update session activity
   */
  static async updateSessionActivity(sessionId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('sessions')
        .update({
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId)

      if (error) {
        throw new DatabaseError(`Failed to update session: ${error.message}`, 'updateSessionActivity', error)
      }
    } catch (error) {
      console.error('TrackingService.updateSessionActivity error:', error)
      throw error
    }
  }

  /**
   * Track swipe activity - specialized tracking method
   */
  static async trackSwipe(data: {
    propertyId: string
    action: 'like' | 'dislike'
    sessionId?: string
    linkId?: string
  }): Promise<Activity> {
    return this.trackActivity({
      propertyId: data.propertyId,
      linkId: data.linkId,
      action: data.action,
      sessionId: data.sessionId,
      metadata: { type: 'swipe' }
    })
  }

  /**
   * Track view activity - specialized tracking method
   */
  static async trackView(data: {
    propertyId?: string
    linkId?: string
    sessionId?: string
  }): Promise<Activity> {
    return this.trackActivity({
      propertyId: data.propertyId,
      linkId: data.linkId,
      action: 'view',
      sessionId: data.sessionId,
      metadata: { type: 'view' }
    })
  }
}