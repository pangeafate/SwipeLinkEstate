import { useState, useEffect } from 'react'
import type { ClientProfile } from '../types'
import { ClientService } from '../client.service'

/**
 * useClientInsights - React Hook for Client Intelligence
 * 
 * Provides comprehensive client insights, behavior analysis,
 * and AI-powered recommendations.
 */
export const useClientInsights = (clientId: string) => {
  const [profile, setProfile] = useState<ClientProfile | null>(null)
  const [insights, setInsights] = useState<string[]>([])
  const [recommendations, setRecommendations] = useState<string[]>([])
  const [nextActions, setNextActions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadClientInsights = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const clientInsights = await ClientService.getClientInsights(clientId)
      setProfile(clientInsights.profile)
      setInsights(clientInsights.insights)
      setRecommendations(clientInsights.recommendations)
      setNextActions(clientInsights.nextActions)
      
    } catch (err) {
      console.error('Error loading client insights:', err)
      setError(err instanceof Error ? err.message : 'Failed to load client insights')
    } finally {
      setLoading(false)
    }
  }

  const refresh = () => {
    loadClientInsights()
  }

  useEffect(() => {
    if (clientId) {
      loadClientInsights()
    }
  }, [clientId])

  return {
    profile,
    insights,
    recommendations,
    nextActions,
    loading,
    error,
    refresh
  }
}

/**
 * useClientProfile - Hook for Basic Client Profile
 */
export const useClientProfile = (clientId: string) => {
  const [profile, setProfile] = useState<ClientProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadProfile = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const clientProfile = await ClientService.getClientProfile(clientId)
      setProfile(clientProfile)
      
    } catch (err) {
      console.error('Error loading client profile:', err)
      setError(err instanceof Error ? err.message : 'Failed to load client profile')
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (engagementData: {
    sessionId: string
    linkId: string
    activities: Array<{
      propertyId: string
      action: string
      timestamp: string
    }>
  }) => {
    try {
      const updatedProfile = await ClientService.updateClientProfile(clientId, engagementData)
      if (updatedProfile) {
        setProfile(updatedProfile)
      }
      return updatedProfile
    } catch (err) {
      console.error('Error updating client profile:', err)
      throw err
    }
  }

  useEffect(() => {
    if (clientId) {
      loadProfile()
    }
  }, [clientId])

  return {
    profile,
    loading,
    error,
    updateProfile,
    refresh: loadProfile
  }
}

/**
 * useClientSimilarity - Hook for Finding Similar Clients
 */
export const useClientSimilarity = (targetClientId: string) => {
  const [similarClients, setSimilarClients] = useState<ClientProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const findSimilarClients = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const targetProfile = await ClientService.getClientProfile(targetClientId)
      if (targetProfile) {
        const similar = await ClientService.findSimilarClients(targetProfile, 5)
        setSimilarClients(similar)
      }
      
    } catch (err) {
      console.error('Error finding similar clients:', err)
      setError(err instanceof Error ? err.message : 'Failed to find similar clients')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (targetClientId) {
      findSimilarClients()
    }
  }, [targetClientId])

  return {
    similarClients,
    loading,
    error,
    refresh: findSimilarClients
  }
}

/**
 * useClientEngagement - Hook for Real-time Client Engagement
 */
export const useClientEngagement = (clientId: string) => {
  const [engagementScore, setEngagementScore] = useState<number>(0)
  const [temperature, setTemperature] = useState<'hot' | 'warm' | 'cold'>('cold')
  const [lastActivity, setLastActivity] = useState<string | null>(null)
  const [sessionCount, setSessionCount] = useState<number>(0)

  const updateEngagement = (activity: {
    action: string
    timestamp: string
    score?: number
  }) => {
    // Real-time engagement updates
    if (activity.score !== undefined) {
      setEngagementScore(activity.score)
      
      // Update temperature based on new score
      if (activity.score >= 80) {
        setTemperature('hot')
      } else if (activity.score >= 50) {
        setTemperature('warm')
      } else {
        setTemperature('cold')
      }
    }
    
    setLastActivity(activity.timestamp)
  }

  const { profile } = useClientProfile(clientId)
  
  useEffect(() => {
    if (profile) {
      setEngagementScore(profile.engagementScore)
      setTemperature(profile.temperature)
      setLastActivity(profile.lastSeen)
      // Would need to get session count from profile or separate query
    }
  }, [profile])

  return {
    engagementScore,
    temperature,
    lastActivity,
    sessionCount,
    updateEngagement
  }
}

/**
 * useClientPreferences - Hook for Client Property Preferences
 */
export const useClientPreferences = (clientId: string) => {
  const { profile, loading, error } = useClientProfile(clientId)

  const preferences = profile ? {
    propertyTypes: profile.preferredPropertyTypes,
    priceRange: profile.priceRange,
    features: profile.preferredFeatures,
    locations: profile.preferredLocations,
    hasPreferences: (
      profile.preferredPropertyTypes.length > 0 ||
      profile.preferredFeatures.length > 0 ||
      profile.preferredLocations.length > 0 ||
      profile.priceRange.min !== null ||
      profile.priceRange.max !== null
    )
  } : null

  return {
    preferences,
    loading,
    error
  }
}

/**
 * useClientBehavior - Hook for Client Behavior Analysis
 */
export const useClientBehavior = (clientId: string) => {
  const { profile, loading, error } = useClientProfile(clientId)

  const behavior = profile ? {
    averageSessionTime: profile.averageSessionTime,
    decisionSpeed: profile.decisionSpeed,
    likeRate: profile.likeRate,
    engagementPattern: getEngagementPattern(profile),
    activityLevel: getActivityLevel(profile),
    buyingSignals: getBuyingSignals(profile)
  } : null

  return {
    behavior,
    loading,
    error
  }
}

/**
 * Helper Functions
 */
const getEngagementPattern = (profile: ClientProfile): 'consistent' | 'sporadic' | 'declining' => {
  // Simple heuristic - in real implementation would analyze historical data
  if (profile.engagementScore >= 70 && profile.totalDeals > 1) {
    return 'consistent'
  } else if (profile.engagementScore < 30) {
    return 'declining'
  }
  return 'sporadic'
}

const getActivityLevel = (profile: ClientProfile): 'high' | 'medium' | 'low' => {
  const totalActivity = profile.totalDeals + (profile.averageSessionTime / 300) // Normalize session time
  
  if (totalActivity >= 5) return 'high'
  if (totalActivity >= 2) return 'medium'
  return 'low'
}

const getBuyingSignals = (profile: ClientProfile): Array<{
  signal: string
  strength: 'strong' | 'moderate' | 'weak'
  description: string
}> => {
  const signals = []

  if (profile.temperature === 'hot') {
    signals.push({
      signal: 'High Engagement',
      strength: 'strong' as const,
      description: 'Client shows strong interest and engagement'
    })
  }

  if (profile.likeRate > 0.3) {
    signals.push({
      signal: 'Selective Preferences',
      strength: 'moderate' as const,
      description: 'Client has clear preferences and is selective'
    })
  }

  if (profile.decisionSpeed === 'fast') {
    signals.push({
      signal: 'Quick Decision Making',
      strength: 'strong' as const,
      description: 'Client makes decisions quickly'
    })
  }

  if (profile.totalDeals > 2) {
    signals.push({
      signal: 'Repeat Engagement',
      strength: 'moderate' as const,
      description: 'Client has engaged multiple times'
    })
  }

  return signals
}