import { supabase } from '@/lib/supabase/client'
import type { Deal, DealStage, DealStatus } from '../types'

/**
 * DealProgressionService - Deal Stage and Status Management
 * 
 * Handles progression of deals through their lifecycle stages
 * and manages status changes with proper validation.
 */
export class DealProgressionService {

  /**
   * Progress deal to a new stage
   */
  static async progressDealStage(dealId: string, newStage: DealStage): Promise<Deal | null> {
    try {
      // Get current deal
      const deal = await this.getCurrentDeal(dealId)
      if (!deal) return null
      
      // Validate stage progression
      if (!this.isValidStageProgression(deal.dealStage, newStage)) {
        throw new Error(`Invalid stage progression from ${deal.dealStage} to ${newStage}`)
      }
      
      // Update deal with new stage
      const updatedDeal: Deal = {
        ...deal,
        dealStage: newStage,
        updatedAt: new Date().toISOString()
      }
      
      // Persist changes
      await this.persistDealChanges(updatedDeal)
      
      return updatedDeal
    } catch (error) {
      console.error('Error progressing deal stage:', error)
      return null
    }
  }

  /**
   * Update deal status
   */
  static async updateDealStatus(dealId: string, newStatus: DealStatus): Promise<Deal | null> {
    try {
      // Get current deal
      const deal = await this.getCurrentDeal(dealId)
      if (!deal) return null
      
      // Validate status change
      if (!this.isValidStatusChange(deal.dealStatus, newStatus)) {
        throw new Error(`Invalid status change from ${deal.dealStatus} to ${newStatus}`)
      }
      
      // Update deal with new status
      const updatedDeal: Deal = {
        ...deal,
        dealStatus: newStatus,
        updatedAt: new Date().toISOString()
      }
      
      // If closing deal, set appropriate stage
      if (newStatus === 'closed-won' || newStatus === 'closed-lost') {
        updatedDeal.dealStage = 'closed'
      }
      
      // Persist changes
      await this.persistDealChanges(updatedDeal)
      
      return updatedDeal
    } catch (error) {
      console.error('Error updating deal status:', error)
      return null
    }
  }

  /**
   * Auto-progress deal based on engagement
   */
  static async autoProgressDeal(dealId: string, engagementScore: number): Promise<Deal | null> {
    const deal = await this.getCurrentDeal(dealId)
    if (!deal) return null
    
    let newStage: DealStage = deal.dealStage
    
    // Auto-progression logic based on engagement
    if (engagementScore >= 80 && deal.dealStage === 'engaged') {
      newStage = 'qualified'
    } else if (engagementScore >= 50 && deal.dealStage === 'accessed') {
      newStage = 'engaged'
    } else if (engagementScore > 0 && deal.dealStage === 'shared') {
      newStage = 'accessed'
    }
    
    if (newStage !== deal.dealStage) {
      return this.progressDealStage(dealId, newStage)
    }
    
    return deal
  }

  /**
   * Private helper methods
   */
  private static async getCurrentDeal(dealId: string): Promise<Deal | null> {
    try {
      // Get link/deal from database
      const { data: link, error } = await supabase
        .from('links')
        .select(`
          *,
          clients:client_id(id, name, email, phone, engagement_score, temperature)
        `)
        .eq('id', dealId)
        .single()
      
      if (error || !link) {
        console.warn(`Deal ${dealId} not found:`, error?.message)
        return null
      }
      
      // Get associated properties
      const propertyIds = Array.isArray(link.property_ids) ? link.property_ids : []
      const { data: properties } = await supabase
        .from('properties')
        .select('*')
        .in('id', propertyIds)
      
      // Convert link to Deal format
      const deal: Deal = {
        id: link.id,
        linkId: link.id,
        agentId: link.agent_id || 'current-agent',
        
        // Deal Information
        dealName: link.name || `Property Collection - ${propertyIds.length} properties`,
        dealStatus: link.deal_status || 'active',
        dealStage: link.deal_stage || 'created',
        dealValue: link.deal_value || 0,
        
        // Client Information
        clientId: link.client_id || null,
        clientName: link.clients?.name || null,
        clientEmail: link.clients?.email || null,
        clientPhone: link.clients?.phone || null,
        clientTemperature: link.temperature || 'cold',
        
        // Property Portfolio
        propertyIds: propertyIds,
        propertyCount: propertyIds.length,
        
        // Timestamps
        createdAt: link.created_at,
        updatedAt: new Date().toISOString(),
        lastActivityAt: link.last_activity || null,
        
        // Engagement Metrics
        engagementScore: link.engagement_score || 0,
        sessionCount: 0, // TODO: Calculate from engagement_sessions
        totalTimeSpent: 0, // TODO: Calculate from engagement_sessions
        
        // CRM Specific
        nextFollowUp: null, // TODO: Get from tasks
        notes: link.notes || null,
        tags: Array.isArray(link.tags) ? link.tags : []
      }
      
      return deal
    } catch (error) {
      console.error('Error fetching current deal:', error)
      return null
    }
  }

  private static async persistDealChanges(deal: Deal): Promise<void> {
    try {
      // Update the links table with deal changes
      const { error } = await supabase
        .from('links')
        .update({
          deal_status: deal.dealStatus,
          deal_stage: deal.dealStage,
          deal_value: deal.dealValue,
          engagement_score: deal.engagementScore,
          temperature: deal.clientTemperature,
          last_activity: new Date().toISOString(),
          notes: deal.notes,
          tags: JSON.stringify(deal.tags)
        })
        .eq('id', deal.id)
      
      if (error) {
        throw error
      }
      
      // Update client record if exists
      if (deal.clientId) {
        await supabase
          .from('clients')
          .update({
            name: deal.clientName,
            email: deal.clientEmail,
            phone: deal.clientPhone,
            engagement_score: deal.engagementScore,
            temperature: deal.clientTemperature,
            last_interaction: new Date().toISOString()
          })
          .eq('id', deal.clientId)
      }
      
      console.log('Deal progression persisted:', {
        dealId: deal.id,
        stage: deal.dealStage,
        status: deal.dealStatus
      })
    } catch (error) {
      console.error('Error persisting deal changes:', error)
      throw error
    }
  }

  private static isValidStageProgression(currentStage: DealStage, newStage: DealStage): boolean {
    const stageOrder: DealStage[] = [
      'created',
      'shared',
      'accessed', 
      'engaged',
      'qualified',
      'advanced',
      'closed'
    ]
    
    const currentIndex = stageOrder.indexOf(currentStage)
    const newIndex = stageOrder.indexOf(newStage)
    
    // Can only progress forward or stay in same stage
    return newIndex >= currentIndex
  }

  private static isValidStatusChange(currentStatus: DealStatus, newStatus: DealStatus): boolean {
    // Define valid status transitions
    const validTransitions: Record<DealStatus, DealStatus[]> = {
      'active': ['qualified', 'nurturing', 'closed-lost'],
      'qualified': ['nurturing', 'closed-won', 'closed-lost'],
      'nurturing': ['qualified', 'closed-won', 'closed-lost'],
      'closed-won': [], // Terminal state
      'closed-lost': ['active'] // Can reactivate
    }
    
    return validTransitions[currentStatus]?.includes(newStatus) || currentStatus === newStatus
  }

  /**
   * Get next suggested stage based on current state
   */
  static getNextSuggestedStage(currentStage: DealStage, engagementScore: number): DealStage | null {
    switch (currentStage) {
      case 'created':
        return 'shared'
      case 'shared':
        return engagementScore > 0 ? 'accessed' : null
      case 'accessed':
        return engagementScore >= 30 ? 'engaged' : null
      case 'engaged':
        return engagementScore >= 60 ? 'qualified' : null
      case 'qualified':
        return 'advanced'
      case 'advanced':
        return 'closed'
      default:
        return null
    }
  }

  /**
   * Get stage completion requirements
   */
  static getStageRequirements(stage: DealStage): string[] {
    switch (stage) {
      case 'created':
        return ['Property collection prepared', 'Link generated']
      case 'shared':
        return ['Link shared with client', 'Initial contact made']
      case 'accessed':
        return ['Client accessed link', 'Properties viewed']
      case 'engaged':
        return ['Client engagement detected', 'Properties liked/considered']
      case 'qualified':
        return ['Client qualification confirmed', 'Budget verified']
      case 'advanced':
        return ['Property showing completed', 'Offer interest expressed']
      case 'closed':
        return ['Deal finalized', 'Commission secured']
      default:
        return []
    }
  }
}