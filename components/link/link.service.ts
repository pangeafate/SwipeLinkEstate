import { createClient } from '@/lib/supabase/client'
import type { Link, LinkWithProperties, LinkInsert } from '@/lib/supabase/types'

export class LinkService {
  private static getSupabase() {
    return createClient()
  }

  /**
   * Generate 8-character alphanumeric link code
   */
  static generateLinkCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  /**
   * Create a new shareable link with property IDs
   */
  static async createLink(propertyIds: string[], name?: string): Promise<Link> {
    if (!propertyIds || propertyIds.length === 0) {
      throw new Error('Property IDs cannot be empty')
    }

    const linkData: LinkInsert = {
      code: this.generateLinkCode(),
      name: name || null,
      property_ids: JSON.stringify(propertyIds) // Store as JSON string
    }

    const { data, error } = await this.getSupabase()
      .from('links')
      .insert(linkData)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create link: ${error.message}`)
    }

    return data
  }

  /**
   * Retrieve link with properties by code (optimized single query)
   */
  static async getLink(code: string): Promise<LinkWithProperties> {
    // Get the link first
    const { data: link, error: linkError } = await this.getSupabase()
      .from('links')
      .select('*')
      .eq('code', code)
      .single()

    if (linkError) {
      throw new Error(`Link not found`)
    }

    // Parse property_ids from JSON and get properties in single batch
    const propertyIds = JSON.parse(link.property_ids as string) as string[]
    
    if (propertyIds.length === 0) {
      return {
        ...link,
        properties: []
      } as LinkWithProperties
    }

    const { data: properties, error: propertiesError } = await this.getSupabase()
      .from('properties')
      .select('*')
      .in('id', propertyIds)
      // Remove status filter - get all properties associated with the link
      // This fixes the issue where properties without explicit status='active' were being filtered out

    if (propertiesError) {
      throw new Error(`Failed to load properties: ${propertiesError.message}`)
    }

    // Preserve the order based on property_ids array
    const orderedProperties = propertyIds
      .map(id => properties?.find(prop => prop.id === id))
      .filter(Boolean) // Remove undefined entries

    return {
      ...link,
      properties: orderedProperties || []
    } as LinkWithProperties
  }

  /**
   * Copy link URL to clipboard
   */
  static async copyLinkUrl(code: string): Promise<void> {
    if (!navigator.clipboard) {
      throw new Error('Clipboard not available')
    }

    const url = `${window.location.origin}/link/${code}`
    await navigator.clipboard.writeText(url)
  }

  /**
   * Get all links for agent dashboard with pagination
   */
  static async getAgentLinks(options: {
    page?: number
    limit?: number
  } = {}): Promise<{
    data: Link[]
    count: number
    hasMore: boolean
  }> {
    const { page = 0, limit = 20 } = options
    const from = page * limit
    const to = from + limit - 1

    const { data, error, count } = await this.getSupabase()
      .from('links')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) {
      throw new Error(`Failed to fetch links: ${error.message}`)
    }

    return {
      data: data || [],
      count: count || 0,
      hasMore: (data?.length || 0) === limit
    }
  }

  /**
   * Get links with basic info (without properties) for listing
   */
  static async getAgentLinksSimple(): Promise<Link[]> {
    const { data, error } = await this.getSupabase()
      .from('links')
      .select('id, code, name, created_at, property_ids')
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch links: ${error.message}`)
    }

    return data || []
  }

  /**
   * Delete a link
   */
  static async deleteLink(code: string): Promise<void> {
    const { error } = await this.getSupabase()
      .from('links')
      .delete()
      .eq('code', code)

    if (error) {
      throw new Error(`Failed to delete link: ${error.message}`)
    }
  }

  /**
   * Update link name or property IDs
   */
  static async updateLink(code: string, updates: {
    name?: string
    property_ids?: string[]
  }): Promise<Link> {
    const updateData: any = {}
    
    if (updates.name !== undefined) {
      updateData.name = updates.name
    }
    
    if (updates.property_ids !== undefined) {
      updateData.property_ids = JSON.stringify(updates.property_ids)
    }

    const { data, error } = await this.getSupabase()
      .from('links')
      .update(updateData)
      .eq('code', code)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update link: ${error.message}`)
    }

    return data
  }

  /**
   * Get link analytics (view count, etc.)
   */
  static async getLinkAnalytics(code: string): Promise<{
    totalViews: number
    uniqueViews: number
    totalSwipes: number
    totalLikes: number
    totalDislikes: number
    recentActivity: any[]
  }> {
    // Import analytics service dynamically to avoid circular dependencies
    const { AnalyticsService } = await import('@/lib/analytics/analytics.service')
    
    try {
      const analytics = await AnalyticsService.getLinkAnalytics(code)
      return {
        totalViews: analytics.totalViews,
        uniqueViews: analytics.uniqueViews,
        totalSwipes: analytics.totalSwipes,
        totalLikes: analytics.totalLikes,
        totalDislikes: analytics.totalDislikes,
        recentActivity: analytics.recentActivity
      }
    } catch (error) {
      // Fallback to empty data if analytics fail
      console.error('Failed to fetch link analytics:', error)
      return {
        totalViews: 0,
        uniqueViews: 0,
        totalSwipes: 0,
        totalLikes: 0,
        totalDislikes: 0,
        recentActivity: []
      }
    }
  }
}