import { supabase } from '@/lib/supabase/client'
import type { Link, Property } from '@/lib/supabase/types'
import type { Deal, DealStage, DealStatus, ClientTemperature } from '../types'

/**
 * DealAnalyticsService - Deal Analytics and Metrics
 * 
 * Handles engagement data calculation, link enrichment,
 * and deal metrics analysis.
 */
export class DealAnalyticsService {

  /**
   * Get engagement data for a specific link
   */
  static async getEngagementDataForLink(linkId: string): Promise<{
    engagementScore: number
    sessionCount: number
    totalTimeSpent: number
    lastActivityAt: string | null
  }> {
    try {
      // Get session data
      const { data: sessions } = await supabase
        .from('sessions')
        .select('*')
        .eq('link_id', linkId)
      
      // Get activity data
      const { data: activities } = await supabase
        .from('activities')
        .select('*')
        .eq('link_id', linkId)
      
      const sessionCount = sessions?.length || 0
      const totalTimeSpent = sessions?.reduce((total, session) => 
        total + (session.duration_seconds || 0), 0) || 0
      
      // Calculate engagement score based on activities and time spent
      const engagementScore = this.calculateEngagementScore(activities || [], totalTimeSpent)
      
      // Get last activity timestamp
      const lastActivityAt = activities && activities.length > 0
        ? activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at
        : null
      
      return {
        engagementScore,
        sessionCount,
        totalTimeSpent,
        lastActivityAt
      }
    } catch (error) {
      console.error('Error fetching engagement data:', error)
      return {
        engagementScore: 0,
        sessionCount: 0,
        totalTimeSpent: 0,
        lastActivityAt: null
      }
    }
  }

  /**
   * Enrich link data with deal information
   */
  static enrichLinkWithDealData(link: any, properties: Property[], engagementData: any): Deal {
    const dealValue = this.calculateEstimatedDealValue(properties)
    const { dealStage, dealStatus } = this.determineDealStageAndStatus(engagementData)
    const clientTemperature = this.determineClientTemperature(engagementData.engagementScore)
    
    return {
      id: link.id,
      linkId: link.id,
      agentId: 'current-agent',
      
      // Deal Information
      dealName: link.name || `Property Collection - ${properties.length} properties`,
      dealStatus,
      dealStage,
      dealValue,
      
      // Client Information
      clientId: null,
      clientName: null,
      clientEmail: null,
      clientPhone: null,
      clientTemperature,
      
      // Property Portfolio
      propertyIds: Array.isArray(link.property_ids) ? link.property_ids as string[] : [],
      propertyCount: properties.length,
      
      // Timestamps
      createdAt: link.created_at,
      updatedAt: link.updated_at || link.created_at,
      lastActivityAt: engagementData.lastActivityAt,
      
      // Engagement Metrics
      engagementScore: engagementData.engagementScore,
      sessionCount: engagementData.sessionCount,
      totalTimeSpent: engagementData.totalTimeSpent,
      
      // CRM Specific
      nextFollowUp: this.calculateNextFollowUp(engagementData),
      notes: null,
      tags: this.generateTags(properties, engagementData)
    }
  }

  /**
   * Calculate engagement score based on activities and time spent
   */
  static calculateEngagementScore(activities: any[], totalTimeSpent: number): number {
    let score = 0
    
    // Base score from time spent (max 40 points)
    score += Math.min(totalTimeSpent / 300, 40) // 5 minutes = max time score
    
    // Activity-based scoring (max 60 points)
    const activityScores: Record<string, number> = {
      'link_accessed': 10,
      'property_viewed': 5,
      'property_liked': 15,
      'property_shared': 20,
      'contact_form_submitted': 25,
      'phone_clicked': 20,
      'email_clicked': 15
    }
    
    activities.forEach(activity => {
      const points = activityScores[activity.action] || 0
      score += points
    })
    
    return Math.min(Math.round(score), 100)
  }

  /**
   * Determine deal stage and status based on engagement
   */
  static determineDealStageAndStatus(engagementData: any): {
    dealStage: DealStage
    dealStatus: DealStatus
  } {
    const { engagementScore, sessionCount, lastActivityAt } = engagementData
    
    let dealStage: DealStage = 'created'
    let dealStatus: DealStatus = 'active'
    
    if (!lastActivityAt) {
      dealStage = 'shared'
    } else if (engagementScore >= 80) {
      dealStage = 'qualified'
      dealStatus = 'qualified'
    } else if (engagementScore >= 50) {
      dealStage = 'engaged'
    } else if (sessionCount > 0) {
      dealStage = 'accessed'
    } else {
      dealStage = 'shared'
    }
    
    return { dealStage, dealStatus }
  }

  /**
   * Determine client temperature based on engagement score
   */
  static determineClientTemperature(engagementScore: number): ClientTemperature {
    if (engagementScore >= 70) return 'hot'
    if (engagementScore >= 30) return 'warm'
    return 'cold'
  }

  /**
   * Calculate estimated deal value based on properties
   */
  static calculateEstimatedDealValue(properties: Property[]): number {
    const totalValue = properties.reduce((sum, property) => {
      return sum + (property.price || 0)
    }, 0)
    
    // Estimate 3% commission on total property value
    return Math.round(totalValue * 0.03)
  }

  /**
   * Calculate next follow-up date based on engagement
   */
  static calculateNextFollowUp(engagementData: any): string | null {
    const { engagementScore, lastActivityAt } = engagementData
    
    if (!lastActivityAt) return null
    
    const now = new Date()
    let followUpDate: Date
    
    if (engagementScore >= 80) {
      // Hot leads - follow up within 2 hours
      followUpDate = new Date(now.getTime() + 2 * 60 * 60 * 1000)
    } else if (engagementScore >= 50) {
      // Warm leads - follow up within 24 hours
      followUpDate = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    } else if (engagementScore > 0) {
      // Cold leads - follow up in 3 days
      followUpDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
    } else {
      // No engagement - follow up in 1 week
      followUpDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    }
    
    return followUpDate.toISOString()
  }

  /**
   * Generate tags based on properties and engagement
   */
  static generateTags(properties: Property[], engagementData: any): string[] {
    const tags: string[] = []
    
    // Property-based tags
    if (properties.length > 5) tags.push('large-portfolio')
    if (properties.some(p => (p.price || 0) > 1000000)) tags.push('luxury')
    if (properties.some(p => p.bedrooms && p.bedrooms >= 4)) tags.push('family')
    
    // Engagement-based tags
    if (engagementData.engagementScore >= 80) tags.push('hot-lead')
    if (engagementData.sessionCount > 3) tags.push('highly-engaged')
    if (engagementData.totalTimeSpent > 1800) tags.push('serious-buyer')
    
    return tags
  }

  /**
   * Get deal analytics summary
   */
  static async getDealAnalyticsSummary(agentId?: string): Promise<{
    totalDeals: number
    activeDeals: number
    hotLeads: number
    avgEngagementScore: number
    conversionRate: number
  }> {
    // This would typically fetch from database
    // For now, return mock analytics
    return {
      totalDeals: 25,
      activeDeals: 18,
      hotLeads: 5,
      avgEngagementScore: 65,
      conversionRate: 0.22
    }
  }
}