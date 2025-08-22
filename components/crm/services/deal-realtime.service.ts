/**
 * Real-time Deal Service
 * Uses actual data from links table instead of mock data
 */

import { supabase } from '@/lib/supabase/client'
import type { Deal, DealStatus, DealStage } from '../types'
import type { Link } from '@/lib/supabase/types'

export class DealRealtimeService {
  /**
   * Transform a link from database into a Deal object
   */
  static transformLinkToDeal(link: any): Deal {
    // Generate engagement score based on activity count
    const activityCount = link.activities?.[0]?.count || 0
    const sessionCount = link.sessions?.[0]?.count || 0
    const engagementScore = Math.min(100, activityCount * 10 + sessionCount * 20)
    
    // Determine temperature based on engagement
    let temperature: 'hot' | 'warm' | 'cold' = 'cold'
    if (engagementScore >= 80) temperature = 'hot'
    else if (engagementScore >= 50) temperature = 'warm'
    
    // Determine stage based on activity
    let stage: DealStage = 'created'
    if (sessionCount > 0) stage = 'accessed'
    if (activityCount > 5) stage = 'engaged'
    if (engagementScore > 50) stage = 'qualified'
    
    // Estimate deal value (could be based on property values)
    const dealValue = 500000 + (engagementScore * 5000)
    
    return {
      id: link.id,
      linkCode: link.code,
      name: link.name || `Deal ${link.code}`,
      status: 'active' as DealStatus,
      stage,
      value: dealValue,
      probability: engagementScore / 100,
      
      client: {
        id: `client-${link.id}`,
        name: link.name?.includes('for') 
          ? link.name.split('for')[1]?.trim() || 'Unknown Client'
          : 'Unknown Client',
        email: null,
        phone: null,
        temperature,
        engagementScore,
        lastActivity: link.last_viewed_at || link.created_at,
        totalInteractions: activityCount,
        preferences: {},
        behavioralData: {
          totalSessions: sessionCount,
          totalPropertiesViewed: activityCount,
          averageSessionDuration: 300
        }
      },
      
      properties: [],
      
      engagement: {
        score: engagementScore,
        lastActivity: link.last_viewed_at || link.created_at,
        totalSessions: sessionCount,
        totalPropertiesViewed: activityCount,
        propertiesLiked: Math.floor(activityCount * 0.3),
        propertiesDisliked: Math.floor(activityCount * 0.1),
        propertiesConsidered: Math.floor(activityCount * 0.2),
        averageSessionDuration: 300,
        returnVisitor: sessionCount > 1
      },
      
      timeline: [],
      tasks: [],
      notes: '',
      
      agentId: link.agent_id || null,
      createdAt: new Date(link.created_at),
      updatedAt: new Date(link.updated_at || link.created_at)
    }
  }
  
  /**
   * Get all deals from real database
   */
  static async getDeals(): Promise<Deal[]> {
    try {
      const { data: links, error } = await supabase
        .from('links')
        .select(`
          *,
          activities:activities(count),
          sessions:sessions(count)
        `)
        .order('created_at', { ascending: false })
        .limit(20)
      
      if (error) {
        console.error('Error fetching links:', error)
        return []
      }
      
      if (!links || links.length === 0) {
        return []
      }
      
      return links.map(link => this.transformLinkToDeal(link))
    } catch (error) {
      console.error('Error in getDeals:', error)
      return []
    }
  }
  
  /**
   * Get deal by ID
   */
  static async getDealById(id: string): Promise<Deal | null> {
    try {
      const { data: link, error } = await supabase
        .from('links')
        .select(`
          *,
          activities:activities(count),
          sessions:sessions(count)
        `)
        .eq('id', id)
        .single()
      
      if (error || !link) {
        return null
      }
      
      return this.transformLinkToDeal(link)
    } catch (error) {
      console.error('Error fetching deal:', error)
      return null
    }
  }
  
  /**
   * Get deals by status
   */
  static async getDealsByStatus(status: DealStatus): Promise<Deal[]> {
    // Since we don't have status in the database yet,
    // return all deals and filter in memory
    const allDeals = await this.getDeals()
    return allDeals.filter(deal => deal.status === status)
  }
  
  /**
   * Get hot leads (high engagement)
   */
  static async getHotLeads(): Promise<Deal[]> {
    const allDeals = await this.getDeals()
    return allDeals.filter(deal => deal.client.temperature === 'hot')
  }
  
  /**
   * Get deal statistics
   */
  static async getDealStats(): Promise<{
    total: number
    byStatus: Record<DealStatus, number>
    byStage: Record<DealStage, number>
    totalValue: number
  }> {
    const deals = await this.getDeals()
    
    const stats = {
      total: deals.length,
      byStatus: {
        active: 0,
        qualified: 0,
        nurturing: 0,
        'closed-won': 0,
        'closed-lost': 0
      } as Record<DealStatus, number>,
      byStage: {
        created: 0,
        shared: 0,
        accessed: 0,
        engaged: 0,
        qualified: 0,
        advanced: 0,
        closed: 0
      } as Record<DealStage, number>,
      totalValue: 0
    }
    
    deals.forEach(deal => {
      stats.byStatus[deal.status]++
      stats.byStage[deal.stage]++
      stats.totalValue += deal.value
    })
    
    return stats
  }
}