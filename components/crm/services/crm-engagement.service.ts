import type { Deal, DealStage, DealFilters } from '../types'
import { DealService } from '../deal.service'
import { TaskService } from '../task.service'
import { ScoringService } from '../scoring.service'

/**
 * CRMEngagementService - Client Engagement Tracking and Processing
 * 
 * Handles processing of client engagement events, score updates,
 * and automated task generation based on engagement patterns.
 */
export class CRMEngagementService {

  /**
   * Process engagement event and update deal accordingly
   */
  static async processEngagementEvent(
    dealId: string,
    engagementData: {
      action: string
      metadata?: any
      clientId?: string
    }
  ): Promise<{
    deal: Deal | null
    scoreUpdated: boolean
    newTasks: number
    stageChanged: boolean
  }> {
    
    // Get current deal
    let deal = await DealService.getDealById(dealId)
    if (!deal) {
      return { deal: null, scoreUpdated: false, newTasks: 0, stageChanged: false }
    }
    
    // Update engagement score
    const updatedMetrics = await ScoringService.updateEngagementScore(
      dealId, 
      engagementData.action, 
      engagementData.metadata
    )
    
    // Check if deal stage should progress
    const newStage = this.determineNewStageFromEngagement(deal, engagementData.action)
    let stageChanged = false
    
    if (newStage !== deal.dealStage) {
      deal = await DealService.progressDealStage(deal.id, newStage, engagementData.metadata)
      stageChanged = true
    }
    
    // Generate new tasks if significant engagement
    let newTasksCount = 0
    if (updatedMetrics.totalScore > deal!.engagementScore + 10 || stageChanged) {
      const newTasks = await TaskService.generateAutomatedTasks(deal!.id, engagementData.action, deal!)
      
      for (const task of newTasks) {
        await TaskService.createTask({
          dealId: deal!.id,
          agentId: deal!.agentId,
          title: task.title,
          description: task.description,
          type: task.type,
          priority: task.priority,
          dueDate: task.dueDate || undefined
        })
      }
      
      newTasksCount = newTasks.length
    }
    
    return {
      deal,
      scoreUpdated: updatedMetrics.totalScore !== deal!.engagementScore,
      newTasks: newTasksCount,
      stageChanged
    }
  }

  /**
   * Get deals requiring immediate attention (hot leads)
   */
  static async getHotLeads(agentId?: string): Promise<Deal[]> {
    const filters: DealFilters = {
      ...(agentId && { agentId })
    }
    
    const dealsResponse = await DealService.getDeals(filters, 1, 50)
    
    // Filter for hot leads (high engagement score, recent activity)
    return dealsResponse.data
      .filter(deal => 
        deal.engagementScore >= 70 || 
        deal.clientTemperature === 'hot' ||
        (deal.lastActivityAt && this.isRecentActivity(deal.lastActivityAt))
      )
      .sort((a, b) => b.engagementScore - a.engagementScore)
      .slice(0, 10)
  }

  /**
   * Analyze engagement patterns for a deal
   */
  static async analyzeEngagementPatterns(dealId: string): Promise<{
    engagementTrend: 'increasing' | 'decreasing' | 'stable'
    mostActiveTimeOfDay: string
    preferredContentTypes: string[]
    engagementFrequency: number
    lastEngagementGap: number
  }> {
    // This would typically analyze actual engagement data from the database
    // For now, return mock analysis
    return {
      engagementTrend: 'increasing',
      mostActiveTimeOfDay: '2-4 PM',
      preferredContentTypes: ['property photos', 'virtual tours'],
      engagementFrequency: 3.2, // times per week
      lastEngagementGap: 2 // days since last engagement
    }
  }

  /**
   * Get engagement insights for multiple deals
   */
  static async getBatchEngagementInsights(dealIds: string[]): Promise<{
    [dealId: string]: {
      riskLevel: 'low' | 'medium' | 'high'
      nextBestAction: string
      urgency: number
    }
  }> {
    const insights: { [dealId: string]: any } = {}
    
    for (const dealId of dealIds) {
      const deal = await DealService.getDealById(dealId)
      if (!deal) continue
      
      insights[dealId] = {
        riskLevel: this.calculateRiskLevel(deal),
        nextBestAction: this.suggestNextAction(deal),
        urgency: this.calculateUrgency(deal)
      }
    }
    
    return insights
  }

  /**
   * Schedule automated engagement follow-ups
   */
  static async scheduleEngagementFollowUps(agentId?: string): Promise<{
    scheduled: number
    skipped: number
    errors: number
  }> {
    let scheduled = 0
    let skipped = 0
    let errors = 0
    
    try {
      // Get deals that need follow-up
      const deals = await this.getDealsNeedingFollowUp(agentId)
      
      for (const deal of deals) {
        try {
          const followUpType = this.determineFollowUpType(deal)
          if (followUpType) {
            await TaskService.generateAutomatedTasks(deal.id, followUpType, deal)
            scheduled++
          } else {
            skipped++
          }
        } catch (error) {
          console.error(`Error scheduling follow-up for deal ${deal.id}:`, error)
          errors++
        }
      }
    } catch (error) {
      console.error('Error in batch follow-up scheduling:', error)
      errors++
    }
    
    return { scheduled, skipped, errors }
  }

  /**
   * Private helper methods
   */
  private static determineNewStageFromEngagement(deal: Deal, action: string): DealStage {
    // Progress stages based on engagement actions
    switch (action) {
      case 'view':
        return deal.dealStage === 'created' ? 'accessed' : deal.dealStage
      case 'like':
      case 'consider':
        return ['created', 'shared', 'accessed'].includes(deal.dealStage) ? 'engaged' : deal.dealStage
      case 'detail':
        return deal.dealStage === 'engaged' ? 'qualified' : deal.dealStage
      default:
        return deal.dealStage
    }
  }

  private static isRecentActivity(lastActivityAt: string): boolean {
    const now = new Date()
    const activity = new Date(lastActivityAt)
    const hoursDiff = (now.getTime() - activity.getTime()) / (1000 * 60 * 60)
    return hoursDiff <= 24 // Activity within last 24 hours
  }

  private static calculateRiskLevel(deal: Deal): 'low' | 'medium' | 'high' {
    if (deal.engagementScore < 30) return 'high'
    if (deal.engagementScore < 60) return 'medium'
    return 'low'
  }

  private static suggestNextAction(deal: Deal): string {
    if (deal.engagementScore >= 80) return 'Schedule immediate call'
    if (deal.engagementScore >= 50) return 'Send personalized follow-up'
    if (deal.engagementScore >= 20) return 'Share additional properties'
    return 'Add to nurture sequence'
  }

  private static calculateUrgency(deal: Deal): number {
    // Urgency score from 1-10
    let urgency = 1
    
    if (deal.clientTemperature === 'hot') urgency += 4
    else if (deal.clientTemperature === 'warm') urgency += 2
    
    if (deal.engagementScore >= 80) urgency += 3
    else if (deal.engagementScore >= 50) urgency += 2
    
    if (deal.lastActivityAt) {
      const daysSinceActivity = this.daysSinceLastActivity(deal.lastActivityAt)
      if (daysSinceActivity <= 1) urgency += 2
      else if (daysSinceActivity <= 3) urgency += 1
    }
    
    return Math.min(urgency, 10)
  }

  private static async getDealsNeedingFollowUp(agentId?: string): Promise<Deal[]> {
    const filters: DealFilters = {
      ...(agentId && { agentId })
    }
    
    const dealsResponse = await DealService.getDeals(filters, 1, 100)
    
    // Filter deals that need follow-up (no recent activity, specific stages, etc.)
    return dealsResponse.data.filter(deal => {
      if (!deal.lastActivityAt) return true // No activity yet
      
      const daysSinceActivity = this.daysSinceLastActivity(deal.lastActivityAt)
      
      // Different follow-up criteria based on deal stage
      switch (deal.dealStage) {
        case 'created':
        case 'shared':
          return daysSinceActivity >= 2
        case 'accessed':
        case 'engaged':
          return daysSinceActivity >= 1
        case 'qualified':
          return daysSinceActivity >= 0.5
        default:
          return daysSinceActivity >= 3
      }
    })
  }

  private static determineFollowUpType(deal: Deal): string | null {
    if (!deal.lastActivityAt) return 'initial_follow_up'
    
    const daysSinceActivity = this.daysSinceLastActivity(deal.lastActivityAt)
    
    if (deal.clientTemperature === 'hot' && daysSinceActivity >= 1) {
      return 'urgent_follow_up'
    }
    
    if (daysSinceActivity >= 7) {
      return 'nurture_sequence'
    }
    
    if (daysSinceActivity >= 3) {
      return 'regular_follow_up'
    }
    
    return null
  }

  private static daysSinceLastActivity(lastActivityAt: string): number {
    const now = new Date()
    const lastActivity = new Date(lastActivityAt)
    return (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
  }
}