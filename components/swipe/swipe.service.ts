import { supabase } from '@/lib/supabase/client'
import type { 
  SwipeSession, 
  SwipeDirection, 
  SwipeResult, 
  SwipeState 
} from './types'

export class SwipeService {
  // Store session data in localStorage for client-side persistence
  private static getStorageKey(sessionId: string): string {
    return `swipe-session-${sessionId}`
  }

  static async initializeSession(linkCode: string): Promise<SwipeSession> {
    if (!linkCode?.trim()) {
      throw new Error('Link code is required')
    }

    const sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36)
    
    const session: SwipeSession = {
      id: sessionId,
      linkId: linkCode,
      startedAt: new Date()
    }

    // Add device info if available
    if (typeof window !== 'undefined') {
      session.deviceInfo = {
        userAgent: navigator.userAgent,
        screen: {
          width: screen.width,
          height: screen.height
        }
      }
    }

    // Track session in database
    await supabase
      .from('sessions')
      .insert({
        id: sessionId,
        link_id: linkCode,
        device_info: session.deviceInfo || null
      })

    // Initialize empty state in localStorage
    const initialState: SwipeState = {
      liked: [],
      disliked: [],
      considering: [],
      viewed: []
    }
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.getStorageKey(sessionId), JSON.stringify(initialState))
    }

    return session
  }

  static async handleSwipe(
    direction: SwipeDirection,
    propertyId: string,
    sessionId: string
  ): Promise<SwipeResult> {
    if (!propertyId?.trim()) {
      throw new Error('Property ID is required')
    }
    
    if (!sessionId?.trim()) {
      throw new Error('Session ID is required')
    }

    const currentState = await this.getSwipeState(sessionId)
    
    // Check if property was already swiped
    if (currentState.viewed.includes(propertyId)) {
      return {
        success: false,
        newState: currentState
      }
    }

    // Create new state based on swipe direction
    const newState: SwipeState = {
      liked: [...currentState.liked],
      disliked: [...currentState.disliked],
      considering: [...currentState.considering],
      viewed: [...currentState.viewed, propertyId]
    }

    // Add to appropriate bucket based on direction
    switch (direction) {
      case 'right':
        newState.liked.push(propertyId)
        break
      case 'left':
        newState.disliked.push(propertyId)
        break
      case 'down':
        newState.considering.push(propertyId)
        break
      case 'up':
        // Up swipe is just for detail view, don't add to any bucket
        break
    }

    // Save state to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.getStorageKey(sessionId), JSON.stringify(newState))
    }

    // Track activity in database
    await supabase
      .from('activities')
      .insert({
        session_id: sessionId,
        property_id: propertyId,
        action: this.getActionFromDirection(direction)
      })

    return {
      success: true,
      newState
    }
  }

  static async getSwipeState(sessionId: string): Promise<SwipeState> {
    if (typeof window === 'undefined') {
      // Return empty state for SSR
      return {
        liked: [],
        disliked: [],
        considering: [],
        viewed: []
      }
    }

    const stored = localStorage.getItem(this.getStorageKey(sessionId))
    
    if (stored) {
      return JSON.parse(stored)
    }

    // Return empty state for new sessions
    return {
      liked: [],
      disliked: [],
      considering: [],
      viewed: []
    }
  }

  static async resetProperty(propertyId: string, sessionId: string): Promise<void> {
    const currentState = await this.getSwipeState(sessionId)
    
    const newState: SwipeState = {
      liked: currentState.liked.filter(id => id !== propertyId),
      disliked: currentState.disliked.filter(id => id !== propertyId),
      considering: currentState.considering.filter(id => id !== propertyId),
      viewed: currentState.viewed.filter(id => id !== propertyId)
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(this.getStorageKey(sessionId), JSON.stringify(newState))
    }
  }

  private static getActionFromDirection(direction: SwipeDirection): string {
    switch (direction) {
      case 'right': return 'like'
      case 'left': return 'dislike'
      case 'down': return 'consider'
      case 'up': return 'detail'
      default: return 'view'
    }
  }
}