import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { setupTest } from '@/test'
import PipelineStageHeader from '../PipelineStageHeader'

// Setup shared test utilities
const { getWrapper } = setupTest()

describe('PipelineStageHeader', () => {
  const defaultProps = {
    stageName: 'Qualified',
    stageKey: 'qualified',
    dealCount: 4,
    totalValue: 125000,
    currency: 'USD'
  }

  describe('Stage Name Display', () => {
    it('should display stage name prominently', () => {
      render(<PipelineStageHeader {...defaultProps} />, { wrapper: getWrapper() })
      
      const stageName = screen.getByText('Qualified')
      expect(stageName).toBeInTheDocument()
      expect(stageName).toHaveClass('stage-header-title')
    })

    it('should handle long stage names gracefully', () => {
      const longNameProps = {
        ...defaultProps,
        stageName: 'Very Long Stage Name That Should Be Truncated'
      }
      
      render(<PipelineStageHeader {...longNameProps} />, { wrapper: getWrapper() })
      
      const stageName = screen.getByText('Very Long Stage Name That Should Be Truncated')
      expect(stageName).toHaveStyle({ textOverflow: 'ellipsis' })
    })
  })

  describe('Monetary Value Formatting', () => {
    it('should format monetary value with currency symbol', () => {
      render(<PipelineStageHeader {...defaultProps} />, { wrapper: getWrapper() })
      
      expect(screen.getByText(/\$125K/)).toBeInTheDocument()
    })

    it('should abbreviate large monetary values', () => {
      const largeValueProps = {
        ...defaultProps,
        totalValue: 1250000
      }
      
      render(<PipelineStageHeader {...largeValueProps} />, { wrapper: getWrapper() })
      
      expect(screen.getByText(/\$1\.25M/)).toBeInTheDocument()
    })

    it('should handle different currencies correctly', () => {
      const euroProps = {
        ...defaultProps,
        currency: 'EUR',
        totalValue: 95000
      }
      
      render(<PipelineStageHeader {...euroProps} />, { wrapper: getWrapper() })
      
      expect(screen.getByText(/€95K/)).toBeInTheDocument()
    })

    it('should display zero values appropriately', () => {
      const zeroProps = {
        ...defaultProps,
        totalValue: 0
      }
      
      render(<PipelineStageHeader {...zeroProps} />, { wrapper: getWrapper() })
      
      expect(screen.getByText(/\$0/)).toBeInTheDocument()
    })
  })

  describe('Deal Count Display', () => {
    it('should show deal count with proper pluralization for single deal', () => {
      const singleDealProps = {
        ...defaultProps,
        dealCount: 1
      }
      
      render(<PipelineStageHeader {...singleDealProps} />, { wrapper: getWrapper() })
      
      expect(screen.getByText(/1 deal/)).toBeInTheDocument()
      expect(screen.queryByText(/1 deals/)).not.toBeInTheDocument()
    })

    it('should show deal count with proper pluralization for multiple deals', () => {
      render(<PipelineStageHeader {...defaultProps} />, { wrapper: getWrapper() })
      
      expect(screen.getByText(/4 deals/)).toBeInTheDocument()
    })

    it('should handle zero deals with appropriate message', () => {
      const zeroDealsProps = {
        ...defaultProps,
        dealCount: 0
      }
      
      render(<PipelineStageHeader {...zeroDealsProps} />, { wrapper: getWrapper() })
      
      expect(screen.getByText(/No deals/)).toBeInTheDocument()
    })

    it('should display metrics in correct format', () => {
      render(<PipelineStageHeader {...defaultProps} />, { wrapper: getWrapper() })
      
      // Should show as "$125K · 4 deals"
      const metricsElement = screen.getByTestId('stage-metrics')
      expect(metricsElement).toHaveTextContent('$125K · 4 deals')
    })
  })

  describe('Collapse/Expand Functionality', () => {
    it('should not show collapse button when isCollapsible is false', () => {
      render(<PipelineStageHeader {...defaultProps} />, { wrapper: getWrapper() })
      
      expect(screen.queryByRole('button', { name: /collapse/i })).not.toBeInTheDocument()
    })

    it('should show collapse button when isCollapsible is true', () => {
      const collapsibleProps = {
        ...defaultProps,
        isCollapsible: true,
        onCollapse: jest.fn()
      }
      
      render(<PipelineStageHeader {...collapsibleProps} />, { wrapper: getWrapper() })
      
      expect(screen.getByRole('button', { name: /toggle stage/i })).toBeInTheDocument()
    })

    it('should call onCollapse callback when collapse button is clicked', async () => {
      const user = userEvent.setup()
      const onCollapseMock = jest.fn()
      const collapsibleProps = {
        ...defaultProps,
        isCollapsible: true,
        onCollapse: onCollapseMock
      }
      
      render(<PipelineStageHeader {...collapsibleProps} />, { wrapper: getWrapper() })
      
      const collapseButton = screen.getByRole('button', { name: /toggle stage/i })
      await user.click(collapseButton)
      
      expect(onCollapseMock).toHaveBeenCalledWith(true)
    })

    it('should toggle collapse state on repeated clicks', async () => {
      const user = userEvent.setup()
      const onCollapseMock = jest.fn()
      const collapsibleProps = {
        ...defaultProps,
        isCollapsible: true,
        onCollapse: onCollapseMock
      }
      
      render(<PipelineStageHeader {...collapsibleProps} />, { wrapper: getWrapper() })
      
      const collapseButton = screen.getByRole('button', { name: /toggle stage/i })
      
      await user.click(collapseButton)
      expect(onCollapseMock).toHaveBeenCalledWith(true)
      
      await user.click(collapseButton)
      expect(onCollapseMock).toHaveBeenCalledWith(false)
    })
  })

  describe('Custom Color Support', () => {
    it('should apply custom color when provided', () => {
      const colorProps = {
        ...defaultProps,
        color: '#4ECDC4'
      }
      
      render(<PipelineStageHeader {...colorProps} />, { wrapper: getWrapper() })
      
      const header = screen.getByTestId('pipeline-stage-header')
      expect(header).toHaveStyle({ borderColor: '#4ECDC4' })
    })

    it('should use default color when not provided', () => {
      render(<PipelineStageHeader {...defaultProps} />, { wrapper: getWrapper() })
      
      const header = screen.getByTestId('pipeline-stage-header')
      expect(header).toHaveStyle({ borderColor: '#e0e0e0' })
    })
  })

  describe('Loading State', () => {
    it('should display skeleton loader when isLoading is true', () => {
      const loadingProps = {
        ...defaultProps,
        isLoading: true
      }
      
      render(<PipelineStageHeader {...loadingProps} />, { wrapper: getWrapper() })
      
      expect(screen.getByTestId('stage-header-skeleton')).toBeInTheDocument()
      expect(screen.queryByText('Qualified')).not.toBeInTheDocument()
    })

    it('should display content when isLoading is false', () => {
      render(<PipelineStageHeader {...defaultProps} />, { wrapper: getWrapper() })
      
      expect(screen.queryByTestId('stage-header-skeleton')).not.toBeInTheDocument()
      expect(screen.getByText('Qualified')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<PipelineStageHeader {...defaultProps} />, { wrapper: getWrapper() })
      
      const header = screen.getByTestId('pipeline-stage-header')
      expect(header).toHaveAttribute('role', 'heading')
      expect(header).toHaveAttribute('aria-level', '3')
      expect(header).toHaveAttribute('aria-label', expect.stringContaining('Qualified stage'))
    })

    it('should be keyboard navigable when collapsible', async () => {
      const user = userEvent.setup()
      const onCollapseMock = jest.fn()
      const collapsibleProps = {
        ...defaultProps,
        isCollapsible: true,
        onCollapse: onCollapseMock
      }
      
      render(<PipelineStageHeader {...collapsibleProps} />, { wrapper: getWrapper() })
      
      const collapseButton = screen.getByRole('button', { name: /toggle stage/i })
      
      // Tab to button
      await user.tab()
      expect(collapseButton).toHaveFocus()
      
      // Press Enter to activate
      await user.keyboard('{Enter}')
      expect(onCollapseMock).toHaveBeenCalledWith(true)
      
      // Press Space to activate
      await user.keyboard(' ')
      expect(onCollapseMock).toHaveBeenCalledWith(false)
    })

    it('should have sufficient color contrast', () => {
      render(<PipelineStageHeader {...defaultProps} />, { wrapper: getWrapper() })
      
      const stageName = screen.getByText('Qualified')
      const styles = window.getComputedStyle(stageName)
      
      // Check that text color provides sufficient contrast
      expect(styles.color).toBe('rgb(51, 51, 51)') // #333
    })
  })

  describe('Hover States', () => {
    it('should apply hover styles on mouse enter', async () => {
      const user = userEvent.setup()
      
      render(<PipelineStageHeader {...defaultProps} />, { wrapper: getWrapper() })
      
      const header = screen.getByTestId('pipeline-stage-header')
      
      await user.hover(header)
      expect(header).toHaveClass('stage-header-hovered')
      
      await user.unhover(header)
      expect(header).not.toHaveClass('stage-header-hovered')
    })
  })

  describe('Error Handling', () => {
    it('should handle invalid numeric values gracefully', () => {
      const invalidProps = {
        ...defaultProps,
        totalValue: NaN,
        dealCount: -1
      }
      
      render(<PipelineStageHeader {...invalidProps} />, { wrapper: getWrapper() })
      
      expect(screen.getByText(/\$0/)).toBeInTheDocument()
      expect(screen.getByText(/No deals/)).toBeInTheDocument()
    })

    it('should handle missing currency gracefully', () => {
      const noCurrencyProps = {
        ...defaultProps,
        currency: undefined
      }
      
      render(<PipelineStageHeader {...noCurrencyProps} />, { wrapper: getWrapper() })
      
      // Should default to USD
      expect(screen.getByText(/\$125K/)).toBeInTheDocument()
    })
  })
})