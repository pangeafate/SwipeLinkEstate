/**
 * Analytics type definitions
 * Extracted to maintain file size limits
 */

export interface AnalyticsData {
  totalViews: number
  uniqueViews: number
  totalSwipes: number
  totalLikes: number
  totalDislikes: number
  recentActivity: ActivityWithContext[]
}

export interface ActivityWithContext {
  id: string
  action: string
  created_at: string
  property?: {
    id: string
    address: string
    price: number | null
  }
  link?: {
    id: string
    code: string
    name: string | null
  }
}

export interface LinkAnalytics extends AnalyticsData {
  linkId: string
  linkCode: string
  sessionCount: number
  avgSessionDuration: number
  popularProperties: Array<{
    propertyId: string
    address: string
    viewCount: number
    likeCount: number
    dislikeCount: number
  }>
}

export interface PropertyAnalytics {
  propertyId: string
  totalViews: number
  totalLikes: number
  totalDislikes: number
  likeRate: number
  viewsFromLinks: number
  topPerformingLinks: Array<{
    linkCode: string
    linkName: string | null
    viewCount: number
    likeCount: number
  }>
}

export interface DashboardAnalytics {
  overview: {
    totalProperties: number
    activeProperties: number
    totalLinks: number
    totalViews: number
    totalSessions: number
    avgSessionDuration: number
  }
  recentActivity: ActivityWithContext[]
  topProperties: Array<{
    property: {
      id: string
      address: string
      price: number | null
    }
    stats: {
      views: number
      likes: number
      dislikes: number
      likeRate: number
    }
  }>
  linkPerformance: Array<{
    link: {
      id: string
      code: string
      name: string | null
    }
    stats: {
      views: number
      sessions: number
      avgDuration: number
    }
  }>
}