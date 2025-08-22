/**
 * HelpOverlay Component
 * Displays help instructions and interactive hotspots for user guidance
 */

import React, { useState, useCallback, useEffect } from 'react'
import { HelpOverlayProps } from './types'

export const HelpOverlay: React.FC<HelpOverlayProps> = ({
  isOpen,
  onClose
}) => {
  const [activeHelpHotspot, setActiveHelpHotspot] = useState<string | null>(null)

  const handleHelpHotspotClick = useCallback((hotspot: string) => {
    setActiveHelpHotspot(activeHelpHotspot === hotspot ? null : hotspot)
  }, [activeHelpHotspot])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div 
      data-testid="help-overlay" 
      className="help-overlay"
      role="dialog"
      aria-labelledby="help-title"
      aria-modal="true"
    >
      <div data-testid="help-instructions" className="help-content">
        <h3 id="help-title">How to Use This Collection</h3>
        
        <div className="help-steps">
          <div className="help-step">
            <h4>1. Browse Properties</h4>
            <p>Navigate through properties using the carousel or click individual cards</p>
          </div>
          
          <div className="help-step">
            <h4>2. Like Properties</h4>
            <p>Use the heart button to save properties you love</p>
          </div>
          
          <div className="help-step">
            <h4>3. Book Visits</h4>
            <p>Schedule property visits directly from the liked properties</p>
          </div>
        </div>

        {/* Interactive Hotspots */}
        <div className="help-hotspots">
          <button
            data-testid="help-hotspot-carousel"
            className="help-hotspot"
            onClick={() => handleHelpHotspotClick('carousel')}
            style={{ top: '40%', left: '50%' }}
            aria-label="Learn about carousel navigation"
          >
            ?
          </button>
          
          {activeHelpHotspot === 'carousel' && (
            <div 
              data-testid="help-tooltip-carousel" 
              className="help-tooltip"
              style={{ top: '45%', left: '50%' }}
            >
              <p>Swipe or use arrows to navigate properties</p>
            </div>
          )}

          <button
            data-testid="help-hotspot-buckets"
            className="help-hotspot"
            onClick={() => handleHelpHotspotClick('buckets')}
            style={{ top: '60%', left: '30%' }}
            aria-label="Learn about property buckets"
          >
            ?
          </button>
          
          {activeHelpHotspot === 'buckets' && (
            <div 
              data-testid="help-tooltip-buckets" 
              className="help-tooltip"
              style={{ top: '65%', left: '30%' }}
            >
              <p>Organize properties into Liked, Considering, or Disliked buckets</p>
            </div>
          )}

          <button
            data-testid="help-hotspot-contact"
            className="help-hotspot"
            onClick={() => handleHelpHotspotClick('contact')}
            style={{ top: '80%', left: '70%' }}
            aria-label="Learn about contacting agent"
          >
            ?
          </button>
          
          {activeHelpHotspot === 'contact' && (
            <div 
              data-testid="help-tooltip-contact" 
              className="help-tooltip"
              style={{ top: '85%', left: '70%' }}
            >
              <p>Contact your agent directly for any questions</p>
            </div>
          )}
        </div>

        <div className="help-tips">
          <h4>Pro Tips:</h4>
          <ul>
            <li>Use keyboard shortcuts: Arrow keys to navigate, Enter to select</li>
            <li>Double-tap to quickly like a property</li>
            <li>Swipe left/right on mobile for quick decisions</li>
            <li>Click the stats to see detailed breakdowns</li>
          </ul>
        </div>

        <button
          className="close-help-btn"
          onClick={onClose}
          aria-label="Close help"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

export default HelpOverlay