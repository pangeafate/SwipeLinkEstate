export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      properties: {
        Row: {
          id: string
          address: string
          price: number | null
          bedrooms: number | null
          bathrooms: number | null
          area_sqft: number | null
          description: string | null
          features: Json | null
          cover_image: string | null
          images: Json | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          address: string
          price?: number | null
          bedrooms?: number | null
          bathrooms?: number | null
          area_sqft?: number | null
          description?: string | null
          features?: Json | null
          cover_image?: string | null
          images?: Json | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          address?: string
          price?: number | null
          bedrooms?: number | null
          bathrooms?: number | null
          area_sqft?: number | null
          description?: string | null
          features?: Json | null
          cover_image?: string | null
          images?: Json | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      links: {
        Row: {
          id: string
          code: string
          name: string | null
          property_ids: Json
          created_at: string
          expires_at: string | null
        }
        Insert: {
          id?: string
          code: string
          name?: string | null
          property_ids: Json
          created_at?: string
          expires_at?: string | null
        }
        Update: {
          id?: string
          code?: string
          name?: string | null
          property_ids?: Json
          created_at?: string
          expires_at?: string | null
        }
      }
      activities: {
        Row: {
          id: string
          link_id: string | null
          property_id: string | null
          action: string
          session_id: string | null
          created_at: string
          metadata: Json | null
        }
        Insert: {
          id?: string
          link_id?: string | null
          property_id?: string | null
          action: string
          session_id?: string | null
          created_at?: string
          metadata?: Json | null
        }
        Update: {
          id?: string
          link_id?: string | null
          property_id?: string | null
          action?: string
          session_id?: string | null
          created_at?: string
          metadata?: Json | null
        }
      }
      sessions: {
        Row: {
          id: string
          link_id: string | null
          started_at: string
          last_active: string
          device_info: Json | null
        }
        Insert: {
          id: string
          link_id?: string | null
          started_at?: string
          last_active?: string
          device_info?: Json | null
        }
        Update: {
          id?: string
          link_id?: string | null
          started_at?: string
          last_active?: string
          device_info?: Json | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Derived types for easier use
export type Property = Database['public']['Tables']['properties']['Row']
export type PropertyInsert = Database['public']['Tables']['properties']['Insert']
export type PropertyUpdate = Database['public']['Tables']['properties']['Update']

export type Link = Database['public']['Tables']['links']['Row']
export type LinkInsert = Database['public']['Tables']['links']['Insert']
export type LinkUpdate = Database['public']['Tables']['links']['Update']

export type Activity = Database['public']['Tables']['activities']['Row']
export type ActivityInsert = Database['public']['Tables']['activities']['Insert']

export type Session = Database['public']['Tables']['sessions']['Row']
export type SessionInsert = Database['public']['Tables']['sessions']['Insert']

// Additional types for the application
export interface PropertyWithImages extends Property {
  imageUrls: string[]
}

export interface LinkWithProperties extends Link {
  properties: Property[]
}

export interface ActivityWithDetails extends Activity {
  property?: Property
  link?: Link
}

export type SwipeAction = 'like' | 'dislike' | 'consider' | 'view' | 'detail'
export type PropertyStatus = 'active' | 'pending' | 'sold' | 'off-market'