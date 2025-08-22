/**
 * ActionBar Component
 * Displays bucket summary, session progress, and action buttons
 */

import React from 'react'
import { ActionBarProps } from './types'

export const ActionBar: React.FC<ActionBarProps> = ({
  buckets,
  sessionProgress,
  agent,
  onContactAgent,
  onHelpToggle,
  showHelp
}) => {
  const formatTime = (startedAt: string): string => {
    return new Date(startedAt).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <div data-testid="action-bar" className="action-bar" role="toolbar">
      {/* Bucket Quick Access */}
      <div data-testid="bucket-quick-access" className="bucket-summary">
        <span className="bucket-count">
          ❤️ Liked: {buckets?.love?.length || 0}
        </span>
        <span className="bucket-count">
          🔖 Considering: {buckets?.maybe?.length || 0}
        </span>
        <span className="bucket-count">
          ❌ Disliked: {buckets?.pass?.length || 0}
        </span>
      </div>

      {/* Session Progress Tracker */}
      <div data-testid="session-progress-tracker" className="session-info">
        {sessionProgress?.startedAt && (
          <span>Started {formatTime(sessionProgress.startedAt)}</span>
        )}
        {sessionProgress?.timeSpent && (
          <span className="time-spent">
            Time spent: {Math.round(sessionProgress.timeSpent / 60)} min
          </span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button
          data-testid="help-toggle-btn"
          className="action-btn"
          onClick={onHelpToggle}
          aria-pressed={showHelp}
          aria-label={showHelp ? 'Close help' : 'Open help'}
        >
          💡 Help
        </button>

        <button
          data-testid="contact-agent-btn"
          className="action-btn primary"
          onClick={() => onContactAgent(agent)}
          aria-label={`Contact ${agent.name}`}
        >
          📞 Contact Agent
        </button>
      </div>
    </div>
  )
}

export default ActionBar