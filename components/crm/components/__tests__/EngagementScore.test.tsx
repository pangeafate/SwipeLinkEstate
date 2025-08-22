/**
 * EngagementScore Component Tests
 * 
 * Testing the engagement score visualization component with TDD approach.
 * Tests cover circular progress indicator, color coding, and real-time updates.
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { TestSetup } from '@/test/utils/testSetup'
import { EngagementScore } from '../EngagementScore'

// Setup test suite with shared infrastructure
const { getWrapper } = TestSetup.setupTestSuite({
  suppressConsoleErrors: true,
  mockSupabase: true
})

describe('EngagementScore Component', () => {
  describe('Score Display', () => {
    it('should display score as percentage', () => {
      render(<EngagementScore score={75} />, { wrapper: getWrapper() })

      expect(screen.getByTestId('engagement-score')).toBeInTheDocument()
      expect(screen.getByText('75%')).toBeInTheDocument()
    })

    it('should handle zero score', () => {
      render(<EngagementScore score={0} />, { wrapper: getWrapper() })

      expect(screen.getByText('0%')).toBeInTheDocument()
      expect(screen.getByTestId('engagement-score')).toHaveClass('score-low')
    })

    it('should handle maximum score', () => {
      render(<EngagementScore score={100} />, { wrapper: getWrapper() })

      expect(screen.getByText('100%')).toBeInTheDocument()
      expect(screen.getByTestId('engagement-score')).toHaveClass('score-high')
    })

    it('should clamp scores above 100', () => {
      render(<EngagementScore score={150} />, { wrapper: getWrapper() })

      expect(screen.getByText('100%')).toBeInTheDocument()
    })

    it('should clamp negative scores to 0', () => {
      render(<EngagementScore score={-10} />, { wrapper: getWrapper() })

      expect(screen.getByText('0%')).toBeInTheDocument()
    })
  })

  describe('Circular Progress Indicator', () => {
    it('should render circular progress element', () => {
      render(<EngagementScore score={65} />, { wrapper: getWrapper() })

      const progressCircle = screen.getByTestId('progress-circle')
      expect(progressCircle).toBeInTheDocument()
      expect(progressCircle).toHaveAttribute('role', 'progressbar')
    })

    it('should have correct progress value', () => {
      render(<EngagementScore score={65} />, { wrapper: getWrapper() })

      const progressCircle = screen.getByTestId('progress-circle')
      expect(progressCircle).toHaveAttribute('aria-valuenow', '65')
      expect(progressCircle).toHaveAttribute('aria-valuemin', '0')
      expect(progressCircle).toHaveAttribute('aria-valuemax', '100')
    })

    it('should display progress ring with correct stroke-dasharray', () => {
      render(<EngagementScore score={50} />, { wrapper: getWrapper() })

      const progressRing = screen.getByTestId('progress-ring')
      expect(progressRing).toBeInTheDocument()
      
      // Check that the stroke-dasharray is approximately correct for 50% 
      const style = window.getComputedStyle(progressRing)
      const strokeDasharray = style.getPropertyValue('stroke-dasharray')
      expect(strokeDasharray).toMatch(/^141\.\d+\s+282\.\d+$/) // Allows for floating point precision
    })
  })

  describe('Color Coding', () => {
    it('should apply high score styling (80-100)', () => {
      render(<EngagementScore score={85} />, { wrapper: getWrapper() })

      const scoreElement = screen.getByTestId('engagement-score')
      expect(scoreElement).toHaveClass('score-high')
      expect(screen.getByTestId('progress-ring')).toHaveClass('stroke-green-500')
    })

    it('should apply medium score styling (50-79)', () => {
      render(<EngagementScore score={65} />, { wrapper: getWrapper() })

      const scoreElement = screen.getByTestId('engagement-score')
      expect(scoreElement).toHaveClass('score-medium')
      expect(screen.getByTestId('progress-ring')).toHaveClass('stroke-yellow-500')
    })

    it('should apply low score styling (0-49)', () => {
      render(<EngagementScore score={30} />, { wrapper: getWrapper() })

      const scoreElement = screen.getByTestId('engagement-score')
      expect(scoreElement).toHaveClass('score-low')
      expect(screen.getByTestId('progress-ring')).toHaveClass('stroke-gray-400')
    })

    it('should handle edge cases for scoring thresholds', () => {
      // Test threshold boundaries
      const testCases = [
        { score: 49, expectedClass: 'score-low' },
        { score: 50, expectedClass: 'score-medium' },
        { score: 79, expectedClass: 'score-medium' },
        { score: 80, expectedClass: 'score-high' }
      ]

      testCases.forEach(({ score, expectedClass }) => {
        const { unmount } = render(<EngagementScore score={score} />, { wrapper: getWrapper() })
        
        expect(screen.getByTestId('engagement-score')).toHaveClass(expectedClass)
        
        unmount()
      })
    })
  })

  describe('Size Variants', () => {
    it('should apply small size styling', () => {
      render(<EngagementScore score={75} size="small" />, { wrapper: getWrapper() })

      const container = screen.getByTestId('engagement-score-container')
      expect(container).toHaveClass('w-8', 'h-8')
    })

    it('should apply medium size styling (default)', () => {
      render(<EngagementScore score={75} />, { wrapper: getWrapper() })

      const container = screen.getByTestId('engagement-score-container')
      expect(container).toHaveClass('w-12', 'h-12')
    })

    it('should apply large size styling', () => {
      render(<EngagementScore score={75} size="large" />, { wrapper: getWrapper() })

      const container = screen.getByTestId('engagement-score-container')
      expect(container).toHaveClass('w-16', 'h-16')
    })
  })

  describe('Animation and Transitions', () => {
    it('should have transition classes for animations', () => {
      render(<EngagementScore score={75} />, { wrapper: getWrapper() })

      const progressRing = screen.getByTestId('progress-ring')
      expect(progressRing).toHaveClass('transition-all', 'duration-600')
    })

    it('should have smooth rotation animation class', () => {
      render(<EngagementScore score={75} />, { wrapper: getWrapper() })

      const svg = screen.getByTestId('progress-circle').querySelector('svg')
      expect(svg).toHaveClass('transform', '-rotate-90')
    })
  })

  describe('Label and Accessibility', () => {
    it('should have proper ARIA label', () => {
      render(<EngagementScore score={75} />, { wrapper: getWrapper() })

      const progressCircle = screen.getByTestId('progress-circle')
      expect(progressCircle).toHaveAttribute('aria-label', 'Engagement score: 75%')
    })

    it('should display custom label when provided', () => {
      render(<EngagementScore score={75} label="Client Interest" showLabel={true} />, { wrapper: getWrapper() })

      expect(screen.getByText('Client Interest')).toBeInTheDocument()
    })

    it('should not display label when showLabel is false', () => {
      render(<EngagementScore score={75} label="Client Interest" showLabel={false} />, { wrapper: getWrapper() })

      expect(screen.queryByText('Client Interest')).not.toBeInTheDocument()
    })

    it('should have default label when none provided and showLabel is true', () => {
      render(<EngagementScore score={75} showLabel={true} />, { wrapper: getWrapper() })

      expect(screen.getByText('Engagement')).toBeInTheDocument()
    })
  })

  describe('Real-time Updates', () => {
    it('should update score when prop changes', () => {
      const { rerender } = render(<EngagementScore score={50} />, { wrapper: getWrapper() })

      expect(screen.getByText('50%')).toBeInTheDocument()
      expect(screen.getByTestId('engagement-score')).toHaveClass('score-medium')

      rerender(<EngagementScore score={85} />)

      expect(screen.getByText('85%')).toBeInTheDocument()
      expect(screen.getByTestId('engagement-score')).toHaveClass('score-high')
    })

    it('should update progress ring when score changes', () => {
      const { rerender } = render(<EngagementScore score={25} />, { wrapper: getWrapper() })

      let progressRing = screen.getByTestId('progress-ring')
      let style = window.getComputedStyle(progressRing)
      let strokeDasharray = style.getPropertyValue('stroke-dasharray')
      expect(strokeDasharray).toMatch(/^70\.\d+\s+282\.\d+$/) // 25% ≈ 70.x

      rerender(<EngagementScore score={75} />)

      progressRing = screen.getByTestId('progress-ring')
      style = window.getComputedStyle(progressRing)
      strokeDasharray = style.getPropertyValue('stroke-dasharray')
      expect(strokeDasharray).toMatch(/^212\.\d+\s+282\.\d+$/) // 75% ≈ 212.x
    })
  })

  describe('Customization Props', () => {
    it('should accept custom className', () => {
      render(<EngagementScore score={75} className="custom-class" />, { wrapper: getWrapper() })

      const container = screen.getByTestId('engagement-score-container')
      expect(container).toHaveClass('custom-class')
    })

    it('should allow hiding the percentage text', () => {
      render(<EngagementScore score={75} showPercentage={false} />, { wrapper: getWrapper() })

      expect(screen.queryByText('75%')).not.toBeInTheDocument()
      expect(screen.getByTestId('progress-circle')).toBeInTheDocument()
    })

    it('should show percentage by default', () => {
      render(<EngagementScore score={75} />, { wrapper: getWrapper() })

      expect(screen.getByText('75%')).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('should handle undefined score gracefully', () => {
      render(<EngagementScore score={undefined as any} />, { wrapper: getWrapper() })

      expect(screen.getByText('0%')).toBeInTheDocument()
      expect(screen.getByTestId('engagement-score')).toHaveClass('score-low')
    })

    it('should handle null score gracefully', () => {
      render(<EngagementScore score={null as any} />, { wrapper: getWrapper() })

      expect(screen.getByText('0%')).toBeInTheDocument()
    })

    it('should handle non-numeric score gracefully', () => {
      render(<EngagementScore score={'invalid' as any} />, { wrapper: getWrapper() })

      expect(screen.getByText('0%')).toBeInTheDocument()
    })
  })

  describe('Performance', () => {
    it('should render without memory leaks', () => {
      const { unmount } = render(<EngagementScore score={75} />, { wrapper: getWrapper() })

      expect(screen.getByTestId('engagement-score')).toBeInTheDocument()

      // Should unmount cleanly
      unmount()
    })

    it('should handle rapid score changes without issues', () => {
      const { rerender } = render(<EngagementScore score={0} />, { wrapper: getWrapper() })

      // Simulate rapid updates
      for (let i = 0; i <= 100; i += 10) {
        rerender(<EngagementScore score={i} />)
      }

      expect(screen.getByText('100%')).toBeInTheDocument()
      expect(screen.getByTestId('engagement-score')).toHaveClass('score-high')
    })
  })
})