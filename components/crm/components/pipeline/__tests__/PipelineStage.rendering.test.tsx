// PipelineStage.rendering.test.tsx - Tests for pipeline stage rendering issues
import { render, screen } from '@testing-library/react'
import { PipelineStage } from '../PipelineStage'
import type { Deal } from '../../../types'

describe('PipelineStage Rendering', () => {
  const mockDeal: Deal = {
    id: 'deal-1',
    linkId: 'link-1',
    agentId: 'agent-1',
    dealName: 'Test Deal',
    dealStatus: 'active',
    dealStage: 'engaged',
    dealValue: 100000,
    clientName: 'John Doe',
    clientEmail: 'john@example.com',
    clientPhone: '+1234567890',
    clientTemperature: 'warm',
    propertyIds: ['prop-1'],
    propertyCount: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastActivityAt: new Date().toISOString(),
    engagementScore: 75,
    sessionCount: 3,
    totalTimeSpent: 900
  }

  const mockHandlers = {
    onStageChange: jest.fn(),
    onStatusChange: jest.fn(),
    onDealClick: jest.fn()
  }

  describe('Background Color Consistency', () => {
    it('should have consistent background color for all empty stages', () => {
      const stages = ['accessed', 'engaged', 'qualified'] as const
      
      stages.forEach(stage => {
        const { container } = render(
          <PipelineStage
            stage={stage}
            deals={[]}
            {...mockHandlers}
          />
        )
        
        // Check that the main container has bg-gray-50
        const mainContainer = container.firstChild as HTMLElement
        expect(mainContainer).toHaveClass('bg-gray-50')
        
        // Check that the deals area has bg-white
        const dealsArea = container.querySelector('.min-h-32')
        expect(dealsArea).toHaveClass('bg-white')
      })
    })

    it('should maintain consistent background when deals are present', () => {
      const { container } = render(
        <PipelineStage
          stage="engaged"
          deals={[mockDeal]}
          {...mockHandlers}
        />
      )
      
      const mainContainer = container.firstChild as HTMLElement
      expect(mainContainer).toHaveClass('bg-gray-50')
      
      const dealsArea = container.querySelector('.min-h-32')
      expect(dealsArea).toHaveClass('bg-white')
    })
  })

  describe('Border Line Rendering', () => {
    it('should render uninterrupted border line for each stage', () => {
      const { container } = render(
        <PipelineStage
          stage="engaged"
          deals={[]}
          {...mockHandlers}
        />
      )
      
      // Check for the header with border
      const header = container.querySelector('[data-testid="pipeline-stage-header"]')
      expect(header).toBeInTheDocument()
      
      // Check that border is applied correctly
      const styles = window.getComputedStyle(header as HTMLElement)
      expect(styles.borderBottomWidth).toBe('2px')
    })

    it('should have correct border color for engaged stage', () => {
      const { container } = render(
        <PipelineStage
          stage="engaged"
          deals={[]}
          {...mockHandlers}
        />
      )
      
      const header = container.querySelector('[data-testid="pipeline-stage-header"]')
      const styles = window.getComputedStyle(header as HTMLElement)
      
      // Engaged stage should have orange border (#FB923C)
      expect(header).toHaveStyle({ borderColor: '#FB923C' })
    })
  })

  describe('Z-Index and Stacking Context', () => {
    it('should have proper z-index to prevent overlay interference', () => {
      const { container } = render(
        <PipelineStage
          stage="engaged"
          deals={[mockDeal]}
          {...mockHandlers}
        />
      )
      
      const mainContainer = container.firstChild as HTMLElement
      
      // Main container should have relative positioning for z-index context
      expect(mainContainer).toHaveStyle({ position: 'relative' })
      
      // Check if z-index is set appropriately
      const styles = window.getComputedStyle(mainContainer)
      expect(parseInt(styles.zIndex || '0')).toBeGreaterThanOrEqual(2)
    })
  })

  describe('No Duplicate Rendering', () => {
    it('should render stage only once without duplicates', () => {
      render(
        <PipelineStage
          stage="engaged"
          deals={[mockDeal]}
          {...mockHandlers}
        />
      )
      
      // Check that "Engaged" title appears only once
      const engagedTitles = screen.getAllByText('Engaged')
      expect(engagedTitles).toHaveLength(1)
      
      // Check that the stage header is rendered only once
      const headers = screen.getAllByTestId('pipeline-stage-header')
      expect(headers).toHaveLength(1)
    })
  })

  describe('Stage Isolation', () => {
    it('should not have visual artifacts from container pseudo-elements', () => {
      const { container } = render(
        <div className="pipelineScrollContainer">
          <div className="flex space-x-4">
            <PipelineStage
              stage="accessed"
              deals={[]}
              {...mockHandlers}
            />
            <PipelineStage
              stage="engaged"
              deals={[]}
              {...mockHandlers}
            />
            <PipelineStage
              stage="qualified"
              deals={[]}
              {...mockHandlers}
            />
          </div>
        </div>
      )
      
      // Check that each stage is properly isolated
      const stages = container.querySelectorAll('.flex-shrink-0')
      expect(stages).toHaveLength(3)
      
      stages.forEach(stage => {
        const element = stage as HTMLElement
        const styles = window.getComputedStyle(element)
        
        // Each stage should have its own stacking context
        expect(styles.position).toBe('relative')
        expect(styles.zIndex).not.toBe('auto')
      })
    })
  })
})