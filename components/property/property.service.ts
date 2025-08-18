// Property Service - Business Logic Layer
import { supabase } from '@/lib/supabase/client'
import type { Property, PropertyFormData, PropertyStatus } from './types'

export class PropertyService {
  static async getAllProperties(): Promise<Property[]> {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch properties: ${error.message}`)
    }

    return data || []
  }

  static async getProperty(id: string): Promise<Property | null> {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Property not found
      }
      throw new Error(`Failed to fetch property: ${error.message}`)
    }

    return data
  }

  static async createProperty(propertyData: PropertyFormData): Promise<Property> {
    const { data, error } = await supabase
      .from('properties')
      .insert({
        ...propertyData,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create property: ${error.message}`)
    }

    return data
  }

  static async updateProperty(id: string, updates: Partial<PropertyFormData>): Promise<Property> {
    const { data, error } = await supabase
      .from('properties')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update property: ${error.message}`)
    }

    return data
  }

  static async updatePropertyStatus(id: string, status: PropertyStatus): Promise<Property> {
    const { data, error } = await supabase
      .from('properties')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update property status: ${error.message}`)
    }

    return data
  }

  static async deleteProperty(id: string): Promise<boolean> {
    // Soft delete - set status to inactive
    const { error } = await supabase
      .from('properties')
      .update({
        status: 'inactive',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to delete property: ${error.message}`)
    }

    return true
  }

  static async getPropertiesByIds(ids: string[]): Promise<Property[]> {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .in('id', ids)
      .eq('status', 'active')

    if (error) {
      throw new Error(`Failed to fetch properties by IDs: ${error.message}`)
    }

    return data || []
  }
}