import { useCallback, useEffect, useRef } from 'react'

// Generate UUID without external dependency
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

interface TrackingEvent {
  type: string
  data: Record<string, any>
  timestamp?: number
}

export function useSessionTracking(linkCode: string) {
  const sessionId = useRef<string>(generateUUID())
  const startTime = useRef<number>(Date.now())
  const events = useRef<TrackingEvent[]>([])
  
  // Track page load
  useEffect(() => {
    trackEvent({
      type: 'session_started',
      data: {
        linkCode,
        userAgent: navigator.userAgent,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        referrer: document.referrer
      }
    })
    
    // Track page unload
    const handleUnload = () => {
      const duration = Date.now() - startTime.current
      trackEvent({
        type: 'session_ended',
        data: {
          duration,
          eventCount: events.current.length
        }
      })
      
      // Send all events to server
      if (events.current.length > 0) {
        navigator.sendBeacon('/api/analytics/events', JSON.stringify({
          sessionId: sessionId.current,
          linkCode,
          events: events.current
        }))
      }
    }
    
    window.addEventListener('beforeunload', handleUnload)
    return () => window.removeEventListener('beforeunload', handleUnload)
  }, [linkCode])
  
  const trackEvent = useCallback((event: TrackingEvent) => {
    const trackedEvent = {
      ...event,
      timestamp: event.timestamp || Date.now()
    }
    
    events.current.push(trackedEvent)
    
    // Send event immediately for important actions
    if (['bucket_assign', 'visit_booking_submitted', 'property_viewed'].includes(event.type)) {
      fetch('/api/analytics/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionId.current,
          linkCode,
          event: trackedEvent
        })
      }).catch(console.error)
    }
  }, [linkCode])
  
  return {
    sessionId: sessionId.current,
    trackEvent
  }
}