import { supabase } from '@/lib/supabase/client'
import { DealService } from '../deal.service'
import { TaskAutomationService } from './task-automation.service'
import type { Link, Property } from '@/lib/supabase/types'
import type { Deal } from '../types'

/**
 * LinkDealIntegrationService - Link-as-Deal Integration Layer
 * 
 * This service implements the core "Link-as-Deal" paradigm by automatically
 * creating CRM deals whenever property links are created or shared.
 * It bridges the link creation workflow with CRM deal management.
 */
export class LinkDealIntegrationService {

  /**
   * Automatically create a deal when a new link is created
   * This is the core of the "Link-as-Deal" paradigm
   */
  static async onLinkCreated(
    linkId: string, 
    agentId: string,
    clientInfo?: {
      name?: string
      email?: string
      phone?: string
    }
  ): Promise<Deal | null> {
    try {
      console.log(`🔗 Link-as-Deal: Creating deal for link ${linkId}`)
      
      // Get the link and its properties
      const { data: link, error: linkError } = await supabase
        .from('links')
        .select('*')
        .eq('id', linkId)
        .single()
      
      if (linkError || !link) {
        console.error('Failed to fetch link for deal creation:', linkError)
        return null
      }
      
      // Get associated properties
      const propertyIds = Array.isArray(link.property_ids) ? link.property_ids : []
      const { data: properties } = await supabase
        .from('properties')
        .select('*')
        .in('id', propertyIds)
      
      // Create deal from link
      const deal = await DealService.createDealFromLink(
        link,
        properties || [],
        clientInfo
      )
      
      // Update the link with deal information in database
      await this.updateLinkWithDealData(linkId, deal, agentId)
      
      // Generate initial automated tasks for the new deal
      await TaskAutomationService.generateTasks(
        deal.id,
        'link_created',
        deal
      )
      
      console.log(`✅ Deal created successfully for link ${linkId}:`, {
        dealId: deal.id,
        dealName: deal.dealName,
        dealValue: deal.dealValue
      })
      
      return deal
      
    } catch (error) {
      console.error('Error in onLinkCreated:', error)
      return null
    }
  }

  /**
   * Handle link sharing event - update deal stage
   */
  static async onLinkShared(
    linkId: string,
    sharedWith?: {
      email?: string
      phone?: string
      name?: string
    }
  ): Promise<void> {
    try {
      console.log(`📤 Link-as-Deal: Link ${linkId} shared`)
      
      // Progress deal to 'shared' stage
      await this.progressDealStage(linkId, 'shared')
      
      // Update client information if provided
      if (sharedWith) {
        await this.updateOrCreateClientFromSharing(linkId, sharedWith)
      }
      
      // Generate follow-up tasks
      await TaskAutomationService.generateTasks(linkId, 'link_shared')
      
    } catch (error) {
      console.error('Error in onLinkShared:', error)
    }
  }

  /**
   * Handle link access event - first time client opens link
   */
  static async onLinkAccessed(
    linkId: string,
    sessionId: string,
    clientInfo?: {
      userAgent?: string
      ip?: string
      referrer?: string
    }
  ): Promise<void> {
    try {
      console.log(`👁️ Link-as-Deal: Link ${linkId} accessed by client`)
      
      // Progress deal to 'accessed' stage
      await this.progressDealStage(linkId, 'accessed')
      
      // Update last activity
      await supabase
        .from('links')
        .update({ 
          last_activity: new Date().toISOString()
        })
        .eq('id', linkId)
      
      // Generate access-based tasks
      await TaskAutomationService.generateTasks(linkId, 'link_accessed')
      
    } catch (error) {
      console.error('Error in onLinkAccessed:', error)
    }
  }

  /**
   * Handle client engagement during session
   */
  static async onClientEngagement(
    linkId: string,
    engagementData: {
      sessionId: string
      propertiesViewed: number
      propertiesLiked: number
      propertiesConsidered: number
      sessionDuration: number
      engagementScore: number
    }
  ): Promise<void> {
    try {
      console.log(`🎯 Link-as-Deal: Client engagement detected for link ${linkId}`)
      
      const { engagementScore } = engagementData
      
      // Determine new stage based on engagement
      let newStage = 'accessed' // Default
      if (engagementScore >= 50) {
        newStage = 'engaged'
      }
      if (engagementScore >= 80) {
        newStage = 'qualified'
      }
      
      // Update deal with engagement data
      await supabase
        .from('links')
        .update({
          engagement_score: engagementScore,
          temperature: this.getTemperatureFromScore(engagementScore),
          deal_stage: newStage,
          last_activity: new Date().toISOString()
        })
        .eq('id', linkId)
      
      // Generate engagement-based tasks
      if (engagementScore >= 80) {
        await TaskAutomationService.generateTasks(linkId, 'high_engagement')
      } else if (engagementScore >= 50) {
        await TaskAutomationService.generateTasks(linkId, 'moderate_engagement')
      }
      
      // If properties were liked, generate showing tasks
      if (engagementData.propertiesLiked > 0) {
        await TaskAutomationService.generateTasks(linkId, 'property_liked')
      }
      
    } catch (error) {
      console.error('Error in onClientEngagement:', error)
    }
  }

  /**
   * Handle session completion
   */
  static async onSessionCompleted(
    linkId: string,
    sessionSummary: {
      sessionId: string
      duration: number
      propertiesViewed: number
      propertiesLiked: number
      propertiesConsidered: number
      completionRate: number
      engagementScore: number
    }
  ): Promise<void> {
    try {
      console.log(`🏁 Link-as-Deal: Session completed for link ${linkId}`)
      
      const { engagementScore, completionRate } = sessionSummary
      
      // Update deal metrics
      await supabase
        .from('links')
        .update({
          engagement_score: Math.max(engagementScore, 0), // Ensure positive score
          temperature: this.getTemperatureFromScore(engagementScore),
          last_activity: new Date().toISOString()
        })
        .eq('id', linkId)
      
      // Create engagement session record
      await supabase
        .from('engagement_sessions')
        .insert({
          session_id: sessionSummary.sessionId,
          deal_id: linkId,
          duration_seconds: sessionSummary.duration,
          properties_viewed: sessionSummary.propertiesViewed,
          properties_liked: sessionSummary.propertiesLiked,
          properties_considered: sessionSummary.propertiesConsidered,
          completion_rate: completionRate,
          engagement_score: engagementScore
        })
      
      // Generate completion-based tasks
      if (completionRate >= 0.8) { // 80% completion
        await TaskAutomationService.generateTasks(linkId, 'session_completed')
      }
      
    } catch (error) {
      console.error('Error in onSessionCompleted:', error)
    }
  }

  /**
   * Private helper methods
   */
  private static async updateLinkWithDealData(
    linkId: string, 
    deal: Deal, 
    agentId: string
  ): Promise<void> {
    const { error } = await supabase
      .from('links')
      .update({
        agent_id: agentId,
        deal_status: deal.dealStatus,
        deal_stage: deal.dealStage,
        deal_value: deal.dealValue,
        engagement_score: deal.engagementScore,
        temperature: deal.clientTemperature,
        notes: deal.notes,
        tags: JSON.stringify(deal.tags || [])
      })
      .eq('id', linkId)
    
    if (error) {
      console.error('Failed to update link with deal data:', error)
    }
  }

  private static async progressDealStage(linkId: string, stage: string): Promise<void> {
    const { error } = await supabase
      .from('links')
      .update({
        deal_stage: stage,
        last_activity: new Date().toISOString()
      })
      .eq('id', linkId)
    
    if (error) {
      console.error('Failed to progress deal stage:', error)
    }
  }

  private static async updateOrCreateClientFromSharing(
    linkId: string,
    sharedWith: {
      email?: string
      phone?: string
      name?: string
    }
  ): Promise<void> {
    try {
      // Check if client already exists
      let existingClient = null
      
      if (sharedWith.email) {
        const { data } = await supabase
          .from('clients')
          .select('*')
          .eq('email', sharedWith.email)
          .single()
        existingClient = data
      } else if (sharedWith.phone) {
        const { data } = await supabase
          .from('clients')
          .select('*')
          .eq('phone', sharedWith.phone)
          .single()
        existingClient = data
      }
      
      let clientId: string
      
      if (existingClient) {
        // Update existing client
        clientId = existingClient.id
        await supabase
          .from('clients')
          .update({
            name: sharedWith.name || existingClient.name,
            email: sharedWith.email || existingClient.email,
            phone: sharedWith.phone || existingClient.phone,
            last_interaction: new Date().toISOString()
          })
          .eq('id', clientId)
      } else {
        // Create new client
        const { data: newClient } = await supabase
          .from('clients')
          .insert({
            name: sharedWith.name,
            email: sharedWith.email,
            phone: sharedWith.phone,
            source: 'link'
          })
          .select()
          .single()
        
        clientId = newClient?.id
      }
      
      // Link client to deal
      if (clientId) {
        await supabase
          .from('links')
          .update({ client_id: clientId })
          .eq('id', linkId)
      }
      
    } catch (error) {
      console.error('Error updating/creating client:', error)
    }
  }

  private static getTemperatureFromScore(score: number): 'hot' | 'warm' | 'cold' {
    if (score >= 80) return 'hot'
    if (score >= 50) return 'warm'
    return 'cold'
  }

  /**
   * Public utility method to manually sync existing links to CRM deals
   * Useful for migrating existing data or fixing inconsistencies
   */
  static async syncExistingLinksToDeals(agentId?: string): Promise<{
    synced: number
    errors: number
    details: Array<{ linkId: string, success: boolean, error?: string }>
  }> {
    try {
      console.log('🔄 Starting link-to-deal sync process...')
      
      // Get all links that don't have deal data
      let query = supabase
        .from('links')
        .select('*')
        .is('deal_status', null)
      
      if (agentId) {
        query = query.eq('agent_id', agentId)
      }
      
      const { data: links, error } = await query
      
      if (error) throw error
      
      const results = {
        synced: 0,
        errors: 0,
        details: [] as Array<{ linkId: string, success: boolean, error?: string }>
      }
      
      for (const link of links || []) {
        try {
          await this.onLinkCreated(link.id, link.agent_id || agentId || 'unknown')
          results.synced++
          results.details.push({ linkId: link.id, success: true })
        } catch (error) {
          results.errors++
          results.details.push({ 
            linkId: link.id, 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error'
          })
        }
      }
      
      console.log(`✅ Sync completed: ${results.synced} synced, ${results.errors} errors`)
      return results
      
    } catch (error) {
      console.error('Error in syncExistingLinksToDeals:', error)
      throw error
    }
  }

  /**
   * Get deal metrics for a specific link
   */
  static async getDealMetricsForLink(linkId: string): Promise<{
    deal: Deal | null
    engagementSummary: any
    tasksSummary: any
  } | null> {
    try {
      // Get deal data
      const deal = await DealService.getDealById(linkId)
      
      // Get engagement sessions
      const { data: sessions } = await supabase
        .from('engagement_sessions')
        .select('*')
        .eq('deal_id', linkId)
      
      // Get tasks
      const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('deal_id', linkId)
      
      const engagementSummary = {
        totalSessions: sessions?.length || 0,
        totalDuration: sessions?.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) || 0,
        avgEngagementScore: sessions?.length ? 
          sessions.reduce((sum, s) => sum + (s.engagement_score || 0), 0) / sessions.length : 0,
        propertiesViewed: sessions?.reduce((sum, s) => sum + (s.properties_viewed || 0), 0) || 0,
        propertiesLiked: sessions?.reduce((sum, s) => sum + (s.properties_liked || 0), 0) || 0
      }
      
      const tasksSummary = {
        totalTasks: tasks?.length || 0,
        pendingTasks: tasks?.filter(t => t.status === 'pending').length || 0,
        completedTasks: tasks?.filter(t => t.status === 'completed').length || 0,
        automatedTasks: tasks?.filter(t => t.is_automated).length || 0
      }
      
      return {
        deal,
        engagementSummary,
        tasksSummary
      }
      
    } catch (error) {
      console.error('Error getting deal metrics for link:', error)
      return null
    }
  }
}