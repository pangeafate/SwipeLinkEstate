// Re-export centralized types
export type { 
  Link, 
  LinkWithProperties,
  Property,
  LinkInsert as CreateLinkData
} from '@/lib/supabase/types'

export interface LinkAnalytics {
  views: number
  uniqueVisitors: number
  totalSwipes: number
  propertiesLiked: number
  propertiesDisliked: number
  breakdown: {
    propertyId: string
    views: number
    likes: number
    dislikes: number
    considers: number
  }[]
}