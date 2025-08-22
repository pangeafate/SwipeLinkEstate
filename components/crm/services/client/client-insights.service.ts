import type { ClientProfile } from '../../types'
import { ClientProfileService } from './client-profile.service'

export class ClientInsightsService {
  /**
   * Get comprehensive client insights and recommendations
   */
  static async getClientInsights(clientId: string): Promise<{
    profile: ClientProfile | null
    insights: string[]
    recommendations: string[]
    nextActions: string[]
  }> {
    const profile = await ClientProfileService.getClientProfile(clientId)
    
    if (!profile) {
      return {
        profile: null,
        insights: ['No client data available'],
        recommendations: ['Collect client engagement data'],
        nextActions: ['Wait for client to engage with properties']
      }
    }
    
    const insights = this.generateClientInsights(profile)
    const recommendations = this.generateRecommendations(profile)
    const nextActions = this.suggestNextActions(profile)
    
    return {
      profile,
      insights,
      recommendations,
      nextActions
    }
  }

  /**
   * Generate insights based on client profile
   */
  static generateClientInsights(profile: ClientProfile): string[] {
    const insights: string[] = []
    
    // Engagement insights
    if (profile.engagementScore >= 80) {
      insights.push('Highly engaged client with strong buying signals')
    } else if (profile.engagementScore >= 50) {
      insights.push('Moderately engaged client showing genuine interest')
    } else {
      insights.push('Low engagement - may need different approach or property types')
    }
    
    // Behavioral insights
    if (profile.decisionSpeed === 'fast') {
      insights.push('Quick decision-maker - ready to move fast on right property')
    } else if (profile.decisionSpeed === 'slow') {
      insights.push('Thoughtful decision-maker - needs time and detailed information')
    }
    
    // Activity pattern insights
    if (profile.totalDeals > 3) {
      insights.push('Repeat client - shows sustained interest in your services')
    }
    
    if (profile.likeRate > 0.3) {
      insights.push('Selective but decisive - high like rate indicates clear preferences')
    }
    
    return insights
  }

  /**
   * Generate recommendations based on client profile
   */
  static generateRecommendations(profile: ClientProfile): string[] {
    const recommendations: string[] = []
    
    // Temperature-based recommendations
    switch (profile.temperature) {
      case 'hot':
        recommendations.push('Contact immediately - schedule showing within 24 hours')
        recommendations.push('Prepare property details and financing options')
        break
      case 'warm':
        recommendations.push('Follow up within 2-3 days with targeted properties')
        recommendations.push('Provide market insights and neighborhood information')
        break
      case 'cold':
        recommendations.push('Add to nurture campaign with regular market updates')
        recommendations.push('Re-engage with different property types or price ranges')
        break
    }
    
    // Engagement-based recommendations
    if (profile.engagementScore < 30) {
      recommendations.push('Review property selection - may not match client preferences')
      recommendations.push('Consider different marketing approach or property types')
    }
    
    // Behavioral recommendations
    if (profile.decisionSpeed === 'fast' && profile.temperature === 'hot') {
      recommendations.push('Prepare multiple property options for immediate viewing')
    }
    
    return recommendations
  }

  /**
   * Suggest next actions based on client profile
   */
  static suggestNextActions(profile: ClientProfile): string[] {
    const actions: string[] = []
    
    // Immediate actions based on temperature
    if (profile.temperature === 'hot') {
      actions.push('Call client today')
      actions.push('Schedule property viewing')
      actions.push('Prepare property comparison sheet')
    } else if (profile.temperature === 'warm') {
      actions.push('Send follow-up email with new listings')
      actions.push('Schedule check-in call this week')
    } else {
      actions.push('Add to monthly newsletter')
      actions.push('Send market update in 2 weeks')
    }
    
    // Profile completion actions
    if (!profile.name) {
      actions.push('Collect client contact information')
    }
    
    if (profile.preferredPropertyTypes.length === 0) {
      actions.push('Conduct preference survey')
    }
    
    return actions
  }
}