import { supabase } from '@/lib/supabase/client'
import { DealProgressionService } from './services/deal-progression.service'
import { DealAnalyticsService } from './services/deal-analytics.service'
import { DealMockService } from './services/deal-mock.service'
import { DealTddService } from './services/deal-tdd.service'
import type { Link, Property } from '@/lib/supabase/types'
import type { 
  Deal, 
  DealStatus, 
  DealStage, 
  DealFilters,
  PaginatedResponse 
} from './types'

/**
 * DealService - Core Deal Management Operations
 * 
 * Handles CRUD operations for deals and delegates complex operations
 * to specialized services. Main entry point for deal management.
 */
export class DealService {
  
  /**
   * Convert a Link to a Deal entity
   * This is the core transformation that turns link sharing into deal management
   */
  static async createDealFromLink(
    link: Link, 
    properties: Property[],
    clientInfo?: {
      name?: string
      email?: string  
      phone?: string
    }
  ): Promise<Deal> {
    return DealTddService.createDealFromLink(link, properties, clientInfo)
  }

  /**
   * Get paginated deals with filters
   */
  static async getDeals(
    filters: DealFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<Deal>> {
    
    try {
      let query = supabase
        .from('links')
        .select(`
          *,
          activities:activities(count),
          sessions:sessions(count)
        `)
      
      // Apply filters
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%`)
      }
      
      if (filters.dateRange) {
        query = query
          .gte('created_at', filters.dateRange.start)
          .lte('created_at', filters.dateRange.end)
      }
      
      // Pagination
      const from = (page - 1) * limit
      const to = from + limit - 1
      
      const { data: links, error, count } = await query
        .range(from, to)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      // Transform links to deals
      const deals: Deal[] = await Promise.all(
        (links || []).map(async (link) => {
          const properties = await this.getPropertiesForLink(link.id)
          const engagementData = await DealAnalyticsService.getEngagementDataForLink(link.id)
          
          return DealAnalyticsService.enrichLinkWithDealData(link, properties, engagementData)
        })
      )
      
      return {
        data: deals,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      }
    } catch (error) {
      console.error('Error fetching deals:', error)
      
      // Return real-time deals from database
      const { DealRealtimeService } = await import('./services/deal-realtime.service')
      const realtimeDeals = await DealRealtimeService.getDeals()
      
      return {
        data: realtimeDeals,
        pagination: {
          page,
          limit,
          total: realtimeDeals.length,
          totalPages: Math.ceil(realtimeDeals.length / limit)
        }
      }
    }
  }

  /**
   * Get single deal by ID
   */
  static async getDealById(dealId: string): Promise<Deal | null> {
    try {
      const { data: link, error } = await supabase
        .from('links')
        .select('*')
        .eq('id', dealId)
        .single()
      
      if (error || !link) return null
      
      const properties = await this.getPropertiesForLink(link.id)
      const engagementData = await DealAnalyticsService.getEngagementDataForLink(link.id)
      
      return DealAnalyticsService.enrichLinkWithDealData(link, properties, engagementData)
    } catch (error) {
      console.error(`Error fetching deal ${dealId}:`, error)
      return null
    }
  }

  /**
   * Progress deal to next stage
   */
  static async progressDealStage(dealId: string, newStage: DealStage): Promise<Deal | null> {
    return DealProgressionService.progressDealStage(dealId, newStage)
  }

  /**
   * Update deal status
   */
  static async updateDealStatus(dealId: string, newStatus: DealStatus): Promise<Deal | null> {
    return DealProgressionService.updateDealStatus(dealId, newStatus)
  }

  /**
   * Get deals by status
   */
  static async getDealsByStatus(status: DealStatus, agentId?: string): Promise<Deal[]> {
    const filters: DealFilters = { status: [status] }
    if (agentId) filters.agentId = agentId
    
    const result = await this.getDeals(filters, 1, 100)
    return result.data
  }

  /**
   * Private helper methods
   */
  private static async getPropertiesForLink(linkId: string): Promise<Property[]> {
    const { data: link } = await supabase
      .from('links')
      .select('property_ids')
      .eq('id', linkId)
      .single()
    
    if (!link?.property_ids) return []
    
    const propertyIds = Array.isArray(link.property_ids) ? link.property_ids : []
    if (propertyIds.length === 0) return []
    
    const { data: properties } = await supabase
      .from('properties')
      .select('*')
      .in('id', propertyIds)
    
    return properties || []
  }


  /**
   * Create deal directly from link data (TDD implementation)
   */
  static async createDeal(linkData: {
    id: string
    name: string
    property_ids: string[]
    created_at: string
  }): Promise<Deal> {
    return DealTddService.createDeal(linkData)
  }

  /**
   * Update deal stage (TDD implementation)
   */
  static async updateDealStage(dealId: string, newStage: DealStage): Promise<Deal> {
    return DealTddService.updateDealStage(dealId, newStage)
  }
}