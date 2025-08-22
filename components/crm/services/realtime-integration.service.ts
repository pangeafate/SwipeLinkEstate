import { supabase } from '@/lib/supabase/client'
import { RealtimeChannel } from '@supabase/supabase-js'
import { LinkService } from '../../link/link.service'
import { DealService } from '../deal.service'
import { ScoringService } from '../scoring.service'
import { EngagementTrackingService } from './engagement-tracking.service'
import { LinkDealIntegrationService } from './link-deal-integration.service'
import { TaskAutomationService } from './task-automation.service'
import type { Deal, DealStage } from '../types'

/**
 * RealTimeIntegrationService - Real-time CRM Integration Hub
 * 
 * This service orchestrates real-time data flow between all CRM components:
 * - Link creation -> Deal creation
 * - Client swipes -> Engagement scoring -> Deal stage updates  
 * - Stage changes -> Task automation
 * - Real-time dashboard updates via WebSocket
 * 
 * Complete Phase 1 Foundation integration layer.
 */
export class RealTimeIntegrationService {
  private static channels: Map<string, RealtimeChannel> = new Map()
  private static subscribers: Map<string, Set<(data: any) => void>> = new Map()

  /**
   * Initialize real-time integration system
   */
  static async initialize(): Promise<void> {
    console.log('🚀 Initializing Real-time CRM Integration...')
    
    try {
      // Set up global real-time channels
      await this.setupGlobalChannels()
      
      // Set up database triggers (if not already done)
      await this.setupDatabaseTriggers()
      
      console.log('✅ Real-time CRM Integration initialized successfully')
    } catch (error) {
      console.error('❌ Failed to initialize real-time integration:', error)
      throw error
    }
  }

  /**
   * Enhanced Link Creation with Auto-Deal Creation
   * Replaces LinkService.createLink() with CRM integration
   */
  static async createLinkWithDeal(
    propertyIds: string[], 
    linkName?: string,
    agentId?: string,
    clientInfo?: {
      name?: string
      email?: string
      phone?: string
    }
  ): Promise<{
    link: any
    deal: Deal
    tasks: any[]
  }> {
    console.log('🔗 Creating link with automatic deal creation...')
    
    try {
      // 1. Create the link using existing LinkService
      const link = await LinkService.createLink(propertyIds, linkName)
      console.log(`✅ Link created: ${link.code}`)
      
      // 2. Auto-create corresponding deal
      const deal = await LinkDealIntegrationService.onLinkCreated(
        link.id,
        agentId || 'system',
        clientInfo
      )
      
      if (!deal) {
        throw new Error('Failed to create deal from link')
      }
      
      console.log(`✅ Deal auto-created: ${deal.id} - ${deal.dealName}`)
      
      // 3. Generate initial tasks
      const tasks = await TaskAutomationService.generateTasks(
        deal.id,
        'link_created',
        deal
      )
      
      // 4. Broadcast real-time update
      await this.broadcastDealUpdate(deal.id, {
        type: 'deal_created',
        deal,
        link,
        tasks
      })
      
      console.log(`🎯 Link-to-Deal integration complete for ${link.code}`)
      
      return {
        link,
        deal,
        tasks
      }
      
    } catch (error) {
      console.error('❌ Error in createLinkWithDeal:', error)
      throw error
    }
  }

  /**
   * Real-time Swipe Action Handler
   * Connects client swipes to engagement scoring and deal updates
   */
  static async handleSwipeAction(
    sessionId: string,
    linkId: string,
    action: {
      propertyId: string
      action: 'view' | 'like' | 'dislike' | 'consider' | 'detail'
      timestamp: string
      duration?: number
      metadata?: any
    }
  ): Promise<{
    engagementScore: number
    dealStage: DealStage
    newTasks: any[]
    milestones: string[]
  }> {
    console.log(`👆 Processing real-time swipe: ${action.action} on ${action.propertyId}`)
    
    try {
      // 1. Track the swipe action
      await EngagementTrackingService.trackSwipeAction(sessionId, linkId, action)
      
      // 2. Get updated session data and calculate new engagement score
      const sessionData = await EngagementTrackingService.getSessionData(sessionId, linkId)
      if (!sessionData) {
        throw new Error('Session data not found')
      }
      
      const engagementMetrics = await ScoringService.calculateEngagementScore(sessionData)
      const newScore = engagementMetrics.totalScore
      
      // 3. Determine if deal stage should change based on engagement thresholds
      const currentDeal = await DealService.getDealById(linkId)
      if (!currentDeal) {
        throw new Error('Deal not found for link')
      }
      
      const newStage = this.calculateStageFromEngagement(newScore, action.action)
      let stagChanged = false
      
      // 4. Update deal stage if threshold crossed
      if (newStage !== currentDeal.dealStage) {
        await DealService.updateDealStage(linkId, newStage)
        stagChanged = true
        console.log(`📈 Deal stage updated: ${currentDeal.dealStage} → ${newStage}`)
      }
      
      // 5. Generate automated tasks if stage changed or high engagement reached
      const newTasks = []
      if (stagChanged || newScore >= 80) {
        const tasks = await TaskAutomationService.generateTasks(linkId, `stage_${newStage}`, currentDeal)
        newTasks.push(...tasks)
      }
      
      // 6. Check for engagement milestones
      const milestones = this.checkMilestones(newScore, action.action, currentDeal.engagementScore || 0)
      
      // 7. Broadcast real-time updates
      await this.broadcastEngagementUpdate(linkId, {
        type: 'engagement_update',
        sessionId,
        engagementScore: newScore,
        dealStage: newStage,
        action: action.action,
        propertyId: action.propertyId,
        milestones,
        timestamp: action.timestamp
      })
      
      console.log(`✅ Swipe processed: Score ${newScore}/100, Stage: ${newStage}`)
      
      return {
        engagementScore: newScore,
        dealStage: newStage,
        newTasks,
        milestones
      }
      
    } catch (error) {
      console.error('❌ Error handling swipe action:', error)
      throw error
    }
  }

  /**
   * Real-time Deal Stage Progression
   * Updates deal stage and triggers automation
   */
  static async progressDealStage(
    dealId: string, 
    newStage: DealStage,
    triggeredBy: string = 'manual'
  ): Promise<{
    deal: Deal
    tasks: any[]
    notifications: any[]
  }> {
    console.log(`📊 Progressing deal ${dealId} to stage: ${newStage}`)
    
    try {
      // 1. Update deal stage
      const updatedDeal = await DealService.updateDealStage(dealId, newStage)
      
      // 2. Generate stage-specific automated tasks
      const tasks = await TaskAutomationService.generateTasks(dealId, `stage_${newStage}`, updatedDeal)
      
      // 3. Create notifications for agent
      const notifications = await this.createStageProgressionNotifications(updatedDeal, newStage, triggeredBy)
      
      // 4. Broadcast real-time update
      await this.broadcastDealUpdate(dealId, {
        type: 'stage_progression',
        deal: updatedDeal,
        newStage,
        triggeredBy,
        tasks,
        notifications
      })
      
      console.log(`✅ Deal progressed successfully: ${newStage}`)
      
      return {
        deal: updatedDeal,
        tasks,
        notifications
      }
      
    } catch (error) {
      console.error('❌ Error progressing deal stage:', error)
      throw error
    }
  }

  /**
   * Real-time Dashboard Data Subscriptions
   * Subscribe to live deal pipeline updates
   */
  static subscribeToDeals(
    agentId: string,
    callback: (update: {
      type: string
      dealId: string
      data: any
    }) => void
  ): () => void {
    const channelName = `deals:agent:${agentId}`
    
    // Get or create channel
    let channel = this.channels.get(channelName)
    if (!channel) {
      channel = supabase
        .channel(channelName)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'links',
          filter: `agent_id=eq.${agentId}`
        }, (payload) => {
          callback({
            type: `deal_${payload.eventType}`,
            dealId: payload.new?.id || payload.old?.id,
            data: payload
          })
        })
        .subscribe()
        
      this.channels.set(channelName, channel)
    }
    
    // Add callback to subscribers
    const subscribers = this.subscribers.get(channelName) || new Set()
    subscribers.add(callback)
    this.subscribers.set(channelName, subscribers)
    
    // Return unsubscribe function
    return () => {
      const subs = this.subscribers.get(channelName)
      if (subs) {
        subs.delete(callback)
        if (subs.size === 0) {
          channel?.unsubscribe()
          this.channels.delete(channelName)
          this.subscribers.delete(channelName)
        }
      }
    }
  }

  /**
   * Subscribe to real-time engagement updates for a specific link/deal
   */
  static subscribeToEngagement(
    linkId: string,
    callback: (update: {
      type: string
      engagementScore: number
      dealStage: string
      activity: any
    }) => void
  ): () => void {
    const channelName = `engagement:link:${linkId}`
    
    let channel = this.channels.get(channelName)
    if (!channel) {
      channel = supabase
        .channel(channelName)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'activities',
          filter: `link_id=eq.${linkId}`
        }, async (payload) => {
          // Get updated engagement score
          const analytics = await EngagementTrackingService.getRealtimeEngagementAnalytics(linkId)
          if (analytics) {
            callback({
              type: 'engagement_activity',
              engagementScore: analytics.currentScore,
              dealStage: 'engaged', // Would be calculated from current deal
              activity: payload.new
            })
          }
        })
        .subscribe()
        
      this.channels.set(channelName, channel)
    }
    
    return () => {
      channel?.unsubscribe()
      this.channels.delete(channelName)
    }
  }

  /**
   * Private helper methods
   */
  private static async setupGlobalChannels(): Promise<void> {
    // Set up global channels for system-wide updates
    const globalChannel = supabase
      .channel('crm_global')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'links'
      }, (payload) => {
        console.log('📡 Global CRM update:', payload.eventType, payload.new?.id)
      })
      .subscribe()
      
    this.channels.set('global', globalChannel)
  }

  private static async setupDatabaseTriggers(): Promise<void> {
    // Note: In a production app, these triggers would be set up via migrations
    // This is a conceptual implementation showing what the triggers would do
    
    console.log('🔧 Database triggers would be set up here via migrations')
    console.log('   - Link creation → Deal creation trigger')
    console.log('   - Activity insertion → Engagement score update trigger')
    console.log('   - Deal stage change → Task generation trigger')
  }

  private static calculateStageFromEngagement(score: number, action: string): DealStage {
    // Logic to determine deal stage based on engagement score and actions
    if (score >= 80) return 'qualified'
    if (score >= 50) return 'engaged'  
    if (action === 'like' || action === 'consider') return 'engaged'
    if (score >= 25) return 'interested'
    if (score > 0) return 'accessed'
    return 'created'
  }

  private static checkMilestones(
    newScore: number, 
    action: string, 
    previousScore: number
  ): string[] {
    const milestones = []
    
    // Score milestones
    if (previousScore < 25 && newScore >= 25) milestones.push('first_engagement')
    if (previousScore < 50 && newScore >= 50) milestones.push('moderate_engagement')  
    if (previousScore < 80 && newScore >= 80) milestones.push('high_engagement')
    
    // Action milestones
    if (action === 'like') milestones.push('property_liked')
    if (action === 'consider') milestones.push('property_considered')
    
    return milestones
  }

  private static async createStageProgressionNotifications(
    deal: Deal, 
    newStage: DealStage, 
    triggeredBy: string
  ): Promise<any[]> {
    const notifications = []
    
    // Create notification for agent
    notifications.push({
      type: 'stage_progression',
      dealId: deal.id,
      dealName: deal.dealName,
      newStage,
      triggeredBy,
      message: `Deal "${deal.dealName}" progressed to ${newStage}`,
      timestamp: new Date().toISOString()
    })
    
    // Add stage-specific notifications
    switch (newStage) {
      case 'engaged':
        notifications.push({
          type: 'action_required',
          message: 'Client showing engagement - consider follow-up call',
          priority: 'medium'
        })
        break
      case 'qualified':
        notifications.push({
          type: 'action_required', 
          message: 'High-value lead detected - immediate action required',
          priority: 'high'
        })
        break
    }
    
    return notifications
  }

  private static async broadcastDealUpdate(dealId: string, data: any): Promise<void> {
    // Broadcast to all subscribers of this deal
    const channel = supabase.channel(`deal:${dealId}`)
    await channel.send({
      type: 'broadcast',
      event: 'deal_update',
      payload: data
    })
  }

  private static async broadcastEngagementUpdate(linkId: string, data: any): Promise<void> {
    // Broadcast engagement updates
    const channel = supabase.channel(`engagement:${linkId}`)
    await channel.send({
      type: 'broadcast',
      event: 'engagement_update', 
      payload: data
    })
  }

  /**
   * Cleanup method to unsubscribe from all channels
   */
  static async cleanup(): Promise<void> {
    console.log('🧹 Cleaning up real-time integration channels...')
    
    for (const [name, channel] of this.channels) {
      await channel.unsubscribe()
      console.log(`   Unsubscribed from ${name}`)
    }
    
    this.channels.clear()
    this.subscribers.clear()
    
    console.log('✅ Real-time integration cleanup complete')
  }

  /**
   * Get current integration status and metrics
   */
  static getStatus(): {
    activeChannels: number
    totalSubscribers: number
    channels: string[]
  } {
    const totalSubscribers = Array.from(this.subscribers.values())
      .reduce((sum, subscribers) => sum + subscribers.size, 0)
      
    return {
      activeChannels: this.channels.size,
      totalSubscribers,
      channels: Array.from(this.channels.keys())
    }
  }
}