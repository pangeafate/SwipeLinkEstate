import { supabase } from './client'
import type { Property, PropertyInsert, PropertyUpdate, PropertyStatus } from './types'

export class PropertyService {
  /**
   * Get all active properties
   */
  static async getAllProperties(): Promise<Property[]> {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    return data
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
      throw new Error(error.message)
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
      throw new Error(error.message)
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
      throw new Error(error.message)
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
      throw new Error(fetchError.message)
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
      throw new Error(error.message)
    }

    return data
  }

  /**
   * Upload property images
   */
  static async uploadPropertyImages(propertyId: string, files: File[]): Promise<string[]> {
    const uploadPromises = files.map(async (file, index) => {
      const fileName = `${propertyId}/${Date.now()}-${index}-${file.name}`
      
      const { data, error } = await supabase.storage
        .from('property-images')
        .upload(fileName, file)

      if (error) {
        throw new Error(`Failed to upload ${file.name}: ${error.message}`)
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
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .in('id', ids)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    return data
  }

  /**
   * Search properties by address or description
   */
  static async searchProperties(query: string): Promise<Property[]> {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .or(`address.ilike.%${query}%,description.ilike.%${query}%`)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    return data
  }
}