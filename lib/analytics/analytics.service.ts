/**
 * Main Analytics Service - Refactored to use split services
 * This maintains backward compatibility while using smaller, focused services
 */
import { TrackingService } from './TrackingService'
import { MetricsService } from './MetricsService'
import { ReportService } from './ReportService'

// Re-export types for backward compatibility
export type {
  AnalyticsData,
  ActivityWithContext,
  LinkAnalytics,
  PropertyAnalytics,
  DashboardAnalytics
} from './types'

/**
 * Main AnalyticsService class - now a facade over split services
 * Maintains backward compatibility while using composition
 */
export class AnalyticsService {
  // Tracking methods - delegate to TrackingService
  static async trackActivity(data: {
    linkId?: string
    propertyId?: string
    action: string
    sessionId?: string
    metadata?: Record<string, any>
  }) {
    return TrackingService.trackActivity(data)
  }

  static async createSession(data: {
    sessionId: string
    linkId?: string
    deviceInfo?: Record<string, any>
  }) {
    return TrackingService.createSession(data)
  }

  static async updateSessionActivity(sessionId: string) {
    return TrackingService.updateSessionActivity(sessionId)
  }

  static async trackSwipe(data: {
    propertyId: string
    action: 'like' | 'dislike'
    sessionId?: string
    linkId?: string
  }) {
    return TrackingService.trackSwipe(data)
  }

  static async trackView(data: {
    propertyId?: string
    linkId?: string
    sessionId?: string
  }) {
    return TrackingService.trackView(data)
  }

  // Report methods - delegate to ReportService
  static async getLinkAnalytics(linkCode: string) {
    return ReportService.getLinkAnalytics(linkCode)
  }

  static async getPropertyAnalytics(propertyId: string) {
    return ReportService.getPropertyAnalytics(propertyId)
  }

  static async getDashboardAnalytics() {
    return ReportService.getDashboardAnalytics()
  }

  // Utility methods
  static generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  static getDeviceInfo(): Record<string, any> {
    if (typeof window === 'undefined') {
      return { server: true }
    }
    
    return {
      userAgent: window.navigator.userAgent,
      language: window.navigator.language,
      platform: window.navigator.platform,
      screen: {
        width: window.screen.width,
        height: window.screen.height
      },
      timestamp: new Date().toISOString()
    }
  }
}