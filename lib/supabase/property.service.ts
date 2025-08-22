import { supabase } from './client'
import type { Property, PropertyInsert, PropertyUpdate, PropertyStatus } from './types'
import { DatabaseError, NotFoundError } from '@/lib/errors/ErrorTypes'

export class PropertyService {
  /**
   * Get all active properties
   */
  static async getAllProperties(): Promise<Property[]> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (error) {
        throw new DatabaseError(`Failed to fetch properties: ${error.message}`, 'getAllProperties', error)
      }

      return data || []
    } catch (error) {
      console.error('PropertyService.getAllProperties error:', error)
      throw error
    }
  }

  /**
   * Get a single property by ID
   */
  static async getProperty(id: string): Promise<Property> {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundError(`Property with ID ${id} not found`)
      }
      throw new DatabaseError(`Failed to fetch property: ${error.message}`, 'getProperty', error)
    }

    return data
  }

  /**
   * Create a new property
   */
  static async createProperty(propertyData: PropertyInsert): Promise<Property> {
    const { data, error } = await supabase
      .from('properties')
      .insert(propertyData)
      .select()
      .single()

    if (error) {
      throw new DatabaseError(`Failed to create property: ${error.message}`, 'createProperty', error)
    }

    return data
  }

  /**
   * Update an existing property
   */
  static async updateProperty(id: string, updateData: PropertyUpdate): Promise<Property> {
    const { data, error } = await supabase
      .from('properties')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundError(`Property with ID ${id} not found`)
      }
      throw new DatabaseError(`Failed to update property: ${error.message}`, 'updateProperty', error)
    }

    return data
  }

  /**
   * Toggle property status between active and off-market
   */
  static async togglePropertyStatus(id: string): Promise<Property> {
    // First get current status
    const { data: currentProperty, error: fetchError } = await supabase
      .from('properties')
      .select('status')
      .eq('id', id)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        throw new NotFoundError(`Property with ID ${id} not found`)
      }
      throw new DatabaseError(`Failed to fetch property status: ${fetchError.message}`, 'togglePropertyStatus', fetchError)
    }

    // Determine new status
    const newStatus: PropertyStatus = currentProperty.status === 'active' ? 'off-market' : 'active'

    // Update the property
    const { data, error } = await supabase
      .from('properties')
      .update({ status: newStatus })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new DatabaseError(`Failed to update property status: ${error.message}`, 'togglePropertyStatus', error)
    }

    return data
  }

  /**
   * Upload property images
   */
  static async uploadPropertyImages(propertyId: string, files: File[]): Promise<string[]> {
    if (!files.length) return []

    const uploadPromises = files.map(async (file, index) => {
      const fileName = `${propertyId}/${Date.now()}-${index}-${file.name}`
      
      const { data, error } = await supabase.storage
        .from('property-images')
        .upload(fileName, file)

      if (error) {
        throw new DatabaseError(`Failed to upload ${file.name}: ${error.message}`, 'uploadPropertyImages', error)
      }

      // Get public URL
      const { data: publicUrl } = supabase.storage
        .from('property-images')
        .getPublicUrl(data.path)

      return publicUrl.publicUrl
    })

    return Promise.all(uploadPromises)
  }

  /**
   * Get properties by multiple IDs (for links)
   */
  static async getPropertiesByIds(ids: string[]): Promise<Property[]> {
    if (!ids.length) return []

    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .in('id', ids)
      .order('created_at', { ascending: false })

    if (error) {
      throw new DatabaseError(`Failed to fetch properties by IDs: ${error.message}`, 'getPropertiesByIds', error)
    }

    return data || []
  }

  /**
   * Search properties by address or description
   */
  static async searchProperties(query: string): Promise<Property[]> {
    if (!query.trim()) return []

    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .or(`address.ilike.%${query}%,description.ilike.%${query}%`)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (error) {
      throw new DatabaseError(`Failed to search properties: ${error.message}`, 'searchProperties', error)
    }

    return data || []
  }

  /**
   * Delete a property (soft delete - set status to deleted)
   */
  static async deleteProperty(id: string): Promise<void> {
    const { error } = await supabase
      .from('properties')
      .update({ status: 'deleted' })
      .eq('id', id)

    if (error) {
      throw new DatabaseError(`Failed to delete property: ${error.message}`, 'deleteProperty', error)
    }
  }

  /**
   * Get properties with optimized query (includes pagination and filtering)
   */
  static async getPropertiesOptimized(options: {
    page?: number
    limit?: number
    status?: PropertyStatus
    sortBy?: 'created_at' | 'price' | 'updated_at'
    sortOrder?: 'asc' | 'desc'
  } = {}): Promise<{
    data: Property[]
    count: number
    hasMore: boolean
  }> {
    const {
      page = 0,
      limit = 20,
      status = 'active',
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = options

    const from = page * limit
    const to = from + limit - 1

    const query = supabase
      .from('properties')
      .select('*', { count: 'exact' })
      .eq('status', status)
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(from, to)

    const { data, error, count } = await query

    if (error) {
      throw new DatabaseError(`Failed to fetch optimized properties: ${error.message}`, 'getPropertiesOptimized', error)
    }

    return {
      data: data || [],
      count: count || 0,
      hasMore: (data?.length || 0) === limit
    }
  }

  /**
   * Batch get properties by IDs with single query
   */
  static async getPropertiesBatch(ids: string[]): Promise<Property[]> {
    if (!ids.length) return []

    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .in('id', ids)
      .order('created_at', { ascending: false })

    if (error) {
      throw new DatabaseError(`Failed to batch fetch properties: ${error.message}`, 'getPropertiesBatch', error)
    }

    return data || []
  }

  /**
   * Get property count by status (for dashboard analytics)
   */
  static async getPropertyStats(): Promise<{
    total: number
    active: number
    offMarket: number
    deleted: number
  }> {
    const [activeResult, offMarketResult, deletedResult] = await Promise.all([
      supabase
        .from('properties')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active'),
      supabase
        .from('properties')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'off-market'),
      supabase
        .from('properties')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'deleted')
    ])

    if (activeResult.error || offMarketResult.error || deletedResult.error) {
      const error = activeResult.error || offMarketResult.error || deletedResult.error
      throw new DatabaseError(`Failed to fetch property stats: ${error.message}`, 'getPropertyStats', error)
    }

    const active = activeResult.count || 0
    const offMarket = offMarketResult.count || 0
    const deleted = deletedResult.count || 0

    return {
      total: active + offMarket + deleted,
      active,
      offMarket,
      deleted
    }
  }
}