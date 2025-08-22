import type { ClientProfile } from '../../types'

export class ClientSimilarityService {
  /**
   * Identify similar clients for comparative analysis
   */
  static async findSimilarClients(
    targetProfile: ClientProfile,
    limit: number = 5
  ): Promise<ClientProfile[]> {
    // In full implementation, would use machine learning for similarity
    // For now, simple heuristic based on preferences and behavior
    
    // This is a placeholder - would need actual client database
    const allProfiles: ClientProfile[] = []
    
    return allProfiles
      .filter(profile => profile.id !== targetProfile.id)
      .map(profile => ({
        ...profile,
        similarityScore: this.calculateSimilarityScore(targetProfile, profile)
      }))
      .sort((a, b) => (b as any).similarityScore - (a as any).similarityScore)
      .slice(0, limit)
  }

  /**
   * Calculate similarity score between two client profiles
   */
  static calculateSimilarityScore(profile1: ClientProfile, profile2: ClientProfile): number {
    let score = 0
    
    // Engagement similarity (30% weight)
    const engagementDiff = Math.abs(profile1.engagementScore - profile2.engagementScore)
    score += Math.max(0, 100 - engagementDiff) * 0.3
    
    // Behavioral similarity
    if (profile1.decisionSpeed === profile2.decisionSpeed) score += 20
    
    const likeRateDiff = Math.abs(profile1.likeRate - profile2.likeRate)
    score += Math.max(0, 100 - likeRateDiff * 100) * 0.2
    
    // Preference similarity (simplified)
    const commonTypes = profile1.preferredPropertyTypes.filter(type => 
      profile2.preferredPropertyTypes.includes(type)
    ).length
    score += commonTypes * 10
    
    return Math.min(100, score)
  }

  /**
   * Get similarity factors between two profiles
   */
  static getSimilarityFactors(profile1: ClientProfile, profile2: ClientProfile): {
    factors: Array<{
      category: string
      similarity: number
      description: string
    }>
  } {
    const factors = []
    
    // Engagement similarity
    const engagementSimilarity = 100 - Math.abs(profile1.engagementScore - profile2.engagementScore)
    factors.push({
      category: 'Engagement',
      similarity: Math.max(0, engagementSimilarity),
      description: `Both clients show ${engagementSimilarity > 70 ? 'similar' : 'different'} engagement levels`
    })
    
    // Behavioral similarity
    const behaviorSimilarity = profile1.decisionSpeed === profile2.decisionSpeed ? 100 : 50
    factors.push({
      category: 'Behavior',
      similarity: behaviorSimilarity,
      description: `Decision speed: ${profile1.decisionSpeed} vs ${profile2.decisionSpeed}`
    })
    
    // Property type preferences
    const commonTypes = profile1.preferredPropertyTypes.filter(type => 
      profile2.preferredPropertyTypes.includes(type)
    ).length
    const totalTypes = new Set([...profile1.preferredPropertyTypes, ...profile2.preferredPropertyTypes]).size
    const typeSimilarity = totalTypes > 0 ? (commonTypes / totalTypes) * 100 : 0
    
    factors.push({
      category: 'Property Preferences',
      similarity: typeSimilarity,
      description: `${commonTypes} common property types out of ${totalTypes} total`
    })
    
    return { factors }
  }
}