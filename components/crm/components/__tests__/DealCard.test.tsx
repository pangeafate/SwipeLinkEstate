/**
 * DealCard Component Tests
 * 
 * Testing the individual deal display component with TDD approach.
 * Tests cover temperature indicators, engagement scoring, and deal stage visualization.
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { TestSetup } from '@/test/utils/testSetup'
import { createMockDeal } from '@/test/utils/mockData'
import { DealCard } from '../DealCard'

// Setup test suite with shared infrastructure
const { getWrapper } = TestSetup.setupTestSuite({
  suppressConsoleErrors: true,
  mockSupabase: true
})

describe('DealCard Component', () => {
  describe('Deal Information Display', () => {
    it('should display deal name and client information', () => {
      const mockDeal = createMockDeal({
        dealName: 'Downtown Luxury Collection',
        clientName: 'Sarah Johnson',
        clientEmail: 'sarah.johnson@example.com'
      })

      render(<DealCard deal={mockDeal} />, { wrapper: getWrapper() })

      expect(screen.getByText('Downtown Luxury Collection')).toBeInTheDocument()
      expect(screen.getByText('Sarah Johnson')).toBeInTheDocument()
      expect(screen.getByText('sarah.johnson@example.com')).toBeInTheDocument()
    })

    it('should display deal value formatted as currency', () => {
      const mockDeal = createMockDeal({
        dealValue: 45000
      })

      render(<DealCard deal={mockDeal} />, { wrapper: getWrapper() })

      expect(screen.getByText('$45,000')).toBeInTheDocument()
    })

    it('should display property count', () => {
      const mockDeal = createMockDeal({
        propertyCount: 5,
        propertyIds: ['prop-1', 'prop-2', 'prop-3', 'prop-4', 'prop-5']
      })

      render(<DealCard deal={mockDeal} />, { wrapper: getWrapper() })

      expect(screen.getByText('5 properties')).toBeInTheDocument()
    })

    it('should display deal stage with appropriate styling', () => {
      const mockDeal = createMockDeal({
        dealStage: 'qualified'
      })

      render(<DealCard deal={mockDeal} />, { wrapper: getWrapper() })

      const stageElement = screen.getByTestId('deal-stage')
      expect(stageElement).toBeInTheDocument()
      expect(stageElement).toHaveTextContent('qualified')
      expect(stageElement).toHaveClass('stage-qualified')
    })
  })

  describe('Temperature Indicator', () => {
    it('should display hot temperature with red indicator', () => {
      const mockDeal = createMockDeal({
        clientTemperature: 'hot',
        engagementScore: 85
      })

      render(<DealCard deal={mockDeal} />, { wrapper: getWrapper() })

      const temperatureIndicator = screen.getByTestId('temperature-indicator')
      expect(temperatureIndicator).toBeInTheDocument()
      expect(temperatureIndicator).toHaveClass('temperature-hot')
      expect(temperatureIndicator).toHaveAttribute('aria-label', 'Hot lead')
    })

    it('should display warm temperature with orange indicator', () => {
      const mockDeal = createMockDeal({
        clientTemperature: 'warm',
        engagementScore: 65
      })

      render(<DealCard deal={mockDeal} />, { wrapper: getWrapper() })

      const temperatureIndicator = screen.getByTestId('temperature-indicator')
      expect(temperatureIndicator).toHaveClass('temperature-warm')
      expect(temperatureIndicator).toHaveAttribute('aria-label', 'Warm lead')
    })

    it('should display cold temperature with blue indicator', () => {
      const mockDeal = createMockDeal({
        clientTemperature: 'cold',
        engagementScore: 25
      })

      render(<DealCard deal={mockDeal} />, { wrapper: getWrapper() })

      const temperatureIndicator = screen.getByTestId('temperature-indicator')
      expect(temperatureIndicator).toHaveClass('temperature-cold')
      expect(temperatureIndicator).toHaveAttribute('aria-label', 'Cold lead')
    })
  })

  describe('Engagement Score Display', () => {
    it('should display engagement score as a percentage', () => {
      const mockDeal = createMockDeal({
        engagementScore: 78
      })

      render(<DealCard deal={mockDeal} />, { wrapper: getWrapper() })

      expect(screen.getByText('78%')).toBeInTheDocument()
      expect(screen.getByTestId('engagement-score')).toBeInTheDocument()
    })

    it('should apply high score styling for scores >= 80', () => {
      const mockDeal = createMockDeal({
        engagementScore: 92
      })

      render(<DealCard deal={mockDeal} />, { wrapper: getWrapper() })

      const scoreElement = screen.getByTestId('engagement-score')
      expect(scoreElement).toHaveClass('score-high')
    })

    it('should apply medium score styling for scores 50-79', () => {
      const mockDeal = createMockDeal({
        engagementScore: 65
      })

      render(<DealCard deal={mockDeal} />, { wrapper: getWrapper() })

      const scoreElement = screen.getByTestId('engagement-score')
      expect(scoreElement).toHaveClass('score-medium')
    })

    it('should apply low score styling for scores < 50', () => {
      const mockDeal = createMockDeal({
        engagementScore: 30
      })

      render(<DealCard deal={mockDeal} />, { wrapper: getWrapper() })

      const scoreElement = screen.getByTestId('engagement-score')
      expect(scoreElement).toHaveClass('score-low')
    })
  })

  describe('Deal Stage Visualization', () => {
    it('should display correct stage colors based on deal stage', () => {
      const stages = [
        { stage: 'created', expectedClass: 'stage-created' },
        { stage: 'shared', expectedClass: 'stage-shared' },
        { stage: 'accessed', expectedClass: 'stage-accessed' },
        { stage: 'engaged', expectedClass: 'stage-engaged' },
        { stage: 'qualified', expectedClass: 'stage-qualified' },
        { stage: 'advanced', expectedClass: 'stage-advanced' },
        { stage: 'closed', expectedClass: 'stage-closed' }
      ]

      stages.forEach(({ stage, expectedClass }) => {
        const mockDeal = createMockDeal({ dealStage: stage })
        
        const { unmount } = render(<DealCard deal={mockDeal} />, { wrapper: getWrapper() })
        
        const stageElement = screen.getByTestId('deal-stage')
        expect(stageElement).toHaveClass(expectedClass)
        
        // Clean up for next iteration
        unmount()
      })
    })

    it('should display stage progress indicator', () => {
      const mockDeal = createMockDeal({
        dealStage: 'qualified'
      })

      render(<DealCard deal={mockDeal} />, { wrapper: getWrapper() })

      const stageIndicator = screen.getByTestId('stage-indicator')
      expect(stageIndicator).toBeInTheDocument()
      expect(stageIndicator).toHaveClass('stage-indicator')
    })
  })

  describe('Pipedrive-Style Design', () => {
    it('should apply Pipedrive card styling classes', () => {
      const mockDeal = createMockDeal()

      render(<DealCard deal={mockDeal} />, { wrapper: getWrapper() })

      const card = screen.getByTestId('deal-card')
      expect(card).toHaveClass('deal-card')
      expect(card).toHaveClass('pipedrive-card')
    })

    it('should have hover effects', () => {
      const mockDeal = createMockDeal()

      render(<DealCard deal={mockDeal} />, { wrapper: getWrapper() })

      const card = screen.getByTestId('deal-card')
      fireEvent.mouseEnter(card)
      
      expect(card).toHaveClass('deal-card--hover')
    })

    it('should display client avatar with initials', () => {
      const mockDeal = createMockDeal({
        clientName: 'John Doe'
      })

      render(<DealCard deal={mockDeal} />, { wrapper: getWrapper() })

      const avatar = screen.getByTestId('client-avatar')
      expect(avatar).toBeInTheDocument()
      expect(avatar).toHaveTextContent('JD')
    })
  })

  describe('Last Activity Display', () => {
    it('should display last activity timestamp', () => {
      const mockDeal = createMockDeal({
        lastActivityAt: '2024-01-21T14:30:00Z'
      })

      render(<DealCard deal={mockDeal} />, { wrapper: getWrapper() })

      expect(screen.getByText(/Last activity/)).toBeInTheDocument()
      expect(screen.getByTestId('last-activity')).toBeInTheDocument()
    })

    it('should display "No activity" when lastActivityAt is null', () => {
      const mockDeal = createMockDeal({
        lastActivityAt: null
      })

      render(<DealCard deal={mockDeal} />, { wrapper: getWrapper() })

      expect(screen.getByText('No activity')).toBeInTheDocument()
    })
  })

  describe('Interaction Handling', () => {
    it('should call onClick handler when card is clicked', () => {
      const mockDeal = createMockDeal()
      const onClickMock = jest.fn()

      render(<DealCard deal={mockDeal} onClick={onClickMock} />, { wrapper: getWrapper() })

      const card = screen.getByTestId('deal-card')
      fireEvent.click(card)

      expect(onClickMock).toHaveBeenCalledWith(mockDeal)
    })

    it('should be keyboard accessible', () => {
      const mockDeal = createMockDeal()
      const onClickMock = jest.fn()

      render(<DealCard deal={mockDeal} onClick={onClickMock} />, { wrapper: getWrapper() })

      const card = screen.getByTestId('deal-card')
      expect(card).toHaveAttribute('tabindex', '0')
      expect(card).toHaveAttribute('role', 'button')

      fireEvent.keyDown(card, { key: 'Enter' })
      expect(onClickMock).toHaveBeenCalledWith(mockDeal)
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes when clickable', () => {
      const mockDeal = createMockDeal({
        dealName: 'Test Deal',
        clientName: 'John Doe'
      })
      const onClickMock = jest.fn()

      render(<DealCard deal={mockDeal} onClick={onClickMock} />, { wrapper: getWrapper() })

      const card = screen.getByTestId('deal-card')
      expect(card).toHaveAttribute('aria-label', 'Deal: Test Deal for John Doe')
      expect(card).toHaveAttribute('role', 'button')
      expect(card).toHaveAttribute('tabindex', '0')
    })

    it('should have proper ARIA attributes when not clickable', () => {
      const mockDeal = createMockDeal({
        dealName: 'Test Deal',
        clientName: 'John Doe'
      })

      render(<DealCard deal={mockDeal} />, { wrapper: getWrapper() })

      const card = screen.getByTestId('deal-card')
      expect(card).toHaveAttribute('aria-label', 'Deal: Test Deal for John Doe')
      expect(card).toHaveAttribute('role', 'article')
      expect(card).toHaveAttribute('tabindex', '-1')
    })

    it('should have semantic HTML structure', () => {
      const mockDeal = createMockDeal()

      render(<DealCard deal={mockDeal} showActions={false} />, { wrapper: getWrapper() })

      expect(screen.getByRole('heading')).toBeInTheDocument()
      expect(screen.getByRole('article')).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('should handle missing deal data gracefully', () => {
      const incompleteDeal = {
        id: 'deal-1',
        dealName: 'Test Deal'
        // Missing other required properties
      }

      render(<DealCard deal={incompleteDeal as any} />, { wrapper: getWrapper() })

      expect(screen.getByText('Test Deal')).toBeInTheDocument()
      expect(screen.getByTestId('temperature-indicator')).toBeInTheDocument() // Should show cold by default
      expect(screen.getByText('Unknown Client')).toBeInTheDocument()
    })

    it('should display fallback values for missing optional data', () => {
      const minimalDeal = createMockDeal({
        clientName: null,
        clientEmail: null,
        engagementScore: null
      })

      render(<DealCard deal={minimalDeal} />, { wrapper: getWrapper() })

      expect(screen.getByText('Unknown Client')).toBeInTheDocument()
      expect(screen.getByText('0%')).toBeInTheDocument()
    })
  })
})