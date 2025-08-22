import type { ClientProfile } from '../../types'
import { ClientProfileService } from './client-profile.service'
import { ClientInsightsService } from './client-insights.service'
import { ClientSimilarityService } from './client-similarity.service'

/**
 * ClientService - Client Intelligence and Profiling
 * 
 * Builds comprehensive client profiles based on engagement behavior
 * and property preferences from swipe interactions.
 */
export class ClientService {
  /**
   * Get or create client profile from deal engagement
   */
  static async getClientProfile(clientId: string): Promise<ClientProfile | null> {
    return ClientProfileService.getClientProfile(clientId)
  }

  /**
   * Update client profile based on new engagement data
   */
  static async updateClientProfile(
    clientId: string,
    engagementData: {
      sessionId: string
      linkId: string
      activities: Array<{
        propertyId: string
        action: string
        timestamp: string
      }>
    }
  ): Promise<ClientProfile | null> {
    return ClientProfileService.updateClientProfile(clientId, engagementData)
  }

  /**
   * Get client insights and recommendations
   */
  static async getClientInsights(clientId: string): Promise<{
    profile: ClientProfile | null
    insights: string[]
    recommendations: string[]
    nextActions: string[]
  }> {
    return ClientInsightsService.getClientInsights(clientId)
  }

  /**
   * Identify similar clients for comparative analysis
   */
  static async findSimilarClients(
    targetProfile: ClientProfile,
    limit: number = 5
  ): Promise<ClientProfile[]> {
    return ClientSimilarityService.findSimilarClients(targetProfile, limit)
  }
}