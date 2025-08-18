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
   * Retrieve link with properties by code
   */
  static async getLink(code: string): Promise<LinkWithProperties> {
    // First get the link
    const { data: link, error: linkError } = await this.getSupabase()
      .from('links')
      .select('*')
      .eq('code', code)
      .single()

    if (linkError) {
      throw new Error(`Link not found`)
    }

    // Parse property_ids from JSON and get properties
    const propertyIds = JSON.parse(link.property_ids as string) as string[]
    
    const { data: properties, error: propertiesError } = await this.getSupabase()
      .from('properties')
      .select('*')
      .in('id', propertyIds)

    if (propertiesError) {
      throw new Error(`Failed to load properties: ${propertiesError.message}`)
    }

    return {
      ...link,
      properties: properties || []
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
   * Get all links for agent dashboard
   */
  static async getAgentLinks(): Promise<Link[]> {
    const { data, error } = await this.getSupabase()
      .from('links')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch links: ${error.message}`)
    }

    return data || []
  }
}