'use client'

import React from 'react'

/**
 * EngagementScore Component
 * 
 * Displays client engagement score as a circular progress indicator
 * with color-coded visualization following Pipedrive design patterns.
 * 
 * Features:
 * - Circular progress ring with smooth animations
 * - Color-coded scoring (High: Green, Medium: Yellow, Low: Gray)
 * - Multiple size variants (small, medium, large)
 * - Accessibility support with ARIA attributes
 * - Real-time score updates with smooth transitions
 * - Customizable labels and percentage display
 */

export interface EngagementScoreProps {
  /** Score value (0-100) */
  score: number
  /** Component size variant */
  size?: 'small' | 'medium' | 'large'
  /** Custom CSS classes */
  className?: string
  /** Custom label text */
  label?: string
  /** Whether to show the label */
  showLabel?: boolean
  /** Whether to show percentage text in center */
  showPercentage?: boolean
}

// Helper function to clamp score between 0 and 100
const clampScore = (score: number | undefined | null): number => {
  if (typeof score !== 'number' || isNaN(score)) return 0
  return Math.max(0, Math.min(100, score))
}

// Helper function to get score classification
const getScoreClass = (score: number): string => {
  if (score >= 80) return 'score-high'
  if (score >= 50) return 'score-medium'
  return 'score-low'
}

// Helper function to get progress ring color
const getRingColor = (score: number): string => {
  if (score >= 80) return 'stroke-green-500'
  if (score >= 50) return 'stroke-yellow-500'
  return 'stroke-gray-400'
}

// Helper function to get size classes
const getSizeClasses = (size: string): { container: string; svg: string; text: string } => {
  const sizeMap = {
    small: {
      container: 'w-8 h-8',
      svg: 'w-8 h-8',
      text: 'text-xs'
    },
    medium: {
      container: 'w-12 h-12',
      svg: 'w-12 h-12', 
      text: 'text-sm'
    },
    large: {
      container: 'w-16 h-16',
      svg: 'w-16 h-16',
      text: 'text-base'
    }
  }
  return sizeMap[size as keyof typeof sizeMap] || sizeMap.medium
}

export const EngagementScore: React.FC<EngagementScoreProps> = ({
  score,
  size = 'medium',
  className = '',
  label,
  showLabel = false,
  showPercentage = true
}) => {
  const clampedScore = clampScore(score)
  const scoreClass = getScoreClass(clampedScore)
  const ringColor = getRingColor(clampedScore)
  const sizeClasses = getSizeClasses(size)
  
  // Circle calculations
  const radius = 45 // SVG radius
  const circumference = 2 * Math.PI * radius
  const strokeDasharray = (clampedScore / 100) * circumference
  const strokeDashoffset = circumference
  
  const displayLabel = label || 'Engagement'

  return (
    <div 
      data-testid="engagement-score-container"
      className={`relative flex flex-col items-center ${sizeClasses.container} ${className}`}
    >
      {/* Circular Progress Indicator */}
      <div 
        data-testid="progress-circle"
        className="relative"
        role="progressbar"
        aria-valuenow={clampedScore}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Engagement score: ${clampedScore}%`}
      >
        <svg 
          className={`${sizeClasses.svg} transform -rotate-90`}
          viewBox="0 0 100 100"
        >
          {/* Background ring */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke="rgb(229 231 235)" // gray-200
            strokeWidth="6"
          />
          
          {/* Progress ring */}
          <circle
            data-testid="progress-ring"
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
            className={`transition-all duration-600 ease-out ${ringColor}`}
            style={{
              strokeDasharray: `${strokeDasharray} ${circumference}`,
              strokeDashoffset: 0
            }}
          />
        </svg>
        
        {/* Score percentage text */}
        {showPercentage && (
          <div 
            data-testid="engagement-score"
            className={`
              absolute inset-0 flex items-center justify-center
              font-semibold ${sizeClasses.text} ${scoreClass}
            `}
          >
            {clampedScore}%
          </div>
        )}
      </div>
      
      {/* Label */}
      {showLabel && (
        <span className={`mt-1 text-xs text-gray-600 text-center ${sizeClasses.text}`}>
          {displayLabel}
        </span>
      )}
    </div>
  )
}