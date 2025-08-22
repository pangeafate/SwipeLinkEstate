/**
 * useSwipeSession Hook
 * Manages analytics session and interaction tracking
 * 
 * Architecture Notes:
 * - Initializes and manages analytics session
 * - Tracks property interactions and bucket assignments
 * - Handles session activity updates
 * - Provides loading and error states
 */

import { useEffect, useState, useCallback } from 'react'
import { AnalyticsService } from '@/lib/analytics/analytics.service'
import type { LinkWithProperties } from '@/lib/supabase/types'
import type { BucketType } from '@/components/client/types'

interface UseSwipeSessionProps {
  linkData: LinkWithProperties | null
  sessionId: string
  completedReview: boolean
  currentIndex: number
  buckets: Record<string, BucketType>
}

interface UseSwipeSessionReturn {
  loading: boolean
  error: string | null
  trackInteraction: (propertyId: string, action: string, metadata?: any) => Promise<void>
  trackView: (propertyId: string) => Promise<void>
}

export function useSwipeSession({
  linkData,
  sessionId,
  completedReview,
  currentIndex,
  buckets
}: UseSwipeSessionProps): UseSwipeSessionReturn {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sessionInitialized, setSessionInitialized] = useState(false)
  
  // Initialize session
  useEffect(() => {
    const initializeSession = async () => {
      if (!linkData || !sessionId || sessionInitialized) return
      
      try {
        setLoading(true)
        setError(null)
        
        await AnalyticsService.createSession({
          sessionId,
          linkId: linkData.id,
          deviceInfo: AnalyticsService.getDeviceInfo()
        })
        
        setSessionInitialized(true)
      } catch (err) {
        console.error('Failed to initialize session:', err)
        setError('Failed to start tracking session')
      } finally {
        setLoading(false)
      }
    }
    
    initializeSession()
  }, [linkData, sessionId, sessionInitialized])
  
  // Update session activity periodically
  useEffect(() => {
    if (!sessionId || !sessionInitialized || completedReview) return
    
    const interval = setInterval(() => {
      AnalyticsService.updateSessionActivity(sessionId)
        .catch(error => console.error('Failed to update session activity:', error))
    }, 30000) // Update every 30 seconds
    
    return () => clearInterval(interval)
  }, [sessionId, sessionInitialized, completedReview])
  
  // Track bucket assignments
  useEffect(() => {
    if (!linkData || !sessionId || !sessionInitialized) return
    
    // Track latest bucket assignment
    const propertyIds = Object.keys(buckets)
    if (propertyIds.length > 0) {
      const latestPropertyId = propertyIds[propertyIds.length - 1]
      const bucket = buckets[latestPropertyId]
      
      const action = bucket === 'love' ? 'like' : 
                     bucket === 'maybe' ? 'consider' : 
                     'dislike'
      
      AnalyticsService.trackActivity({
        linkId: linkData.id,
        propertyId: latestPropertyId,
        action,
        sessionId,
        metadata: { bucket }
      }).catch(error => console.error('Failed to track bucket assignment:', error))
    }
  }, [buckets, linkData, sessionId, sessionInitialized])
  
  // Track property views based on current index
  useEffect(() => {
    if (!linkData?.properties || !sessionId || !sessionInitialized) return
    
    const currentProperty = linkData.properties[currentIndex]
    if (currentProperty) {
      AnalyticsService.trackView({
        linkId: linkData.id,
        propertyId: currentProperty.id,
        sessionId
      }).catch(error => console.error('Failed to track property view:', error))
    }
  }, [currentIndex, linkData, sessionId, sessionInitialized])
  
  // Track completion
  useEffect(() => {
    if (!completedReview || !sessionId || !linkData) return
    
    AnalyticsService.completeSession(sessionId, {
      totalViewed: linkData.properties?.length || 0,
      totalLiked: Object.values(buckets).filter(b => b === 'love').length,
      totalConsidered: Object.values(buckets).filter(b => b === 'maybe').length,
      totalPassed: Object.values(buckets).filter(b => b === 'pass').length
    }).catch(error => console.error('Failed to complete session:', error))
  }, [completedReview, sessionId, linkData, buckets])
  
  // Tracking functions
  const trackInteraction = useCallback(async (
    propertyId: string,
    action: string,
    metadata?: any
  ) => {
    if (!linkData || !sessionId || !sessionInitialized) return
    
    try {
      await AnalyticsService.trackActivity({
        linkId: linkData.id,
        propertyId,
        action,
        sessionId,
        metadata
      })
    } catch (error) {
      console.error('Failed to track interaction:', error)
    }
  }, [linkData, sessionId, sessionInitialized])
  
  const trackView = useCallback(async (propertyId: string) => {
    if (!linkData || !sessionId || !sessionInitialized) return
    
    try {
      await AnalyticsService.trackView({
        linkId: linkData.id,
        propertyId,
        sessionId
      })
    } catch (error) {
      console.error('Failed to track view:', error)
    }
  }, [linkData, sessionId, sessionInitialized])
  
  return {
    loading,
    error,
    trackInteraction,
    trackView
  }
}