import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SwipeInterface from '../SwipeInterface'
import { SwipeService } from '../../swipe.service'
import { setupTest } from '@/test/utils/testSetup'
import { fixtures } from '@/test/fixtures'
import type { PropertyCardData } from '../../types'

// Mock dependencies
jest.mock('../../swipe.service')
jest.mock('react-tinder-card', () => {
  return function MockTinderCard({ children, onSwipe, onCardLeftScreen, preventSwipe }: any) {
    return (
      <div
        data-testid="tinder-card"
        onClick={() => onSwipe && onSwipe('right')}
        data-prevent-swipe={preventSwipe}
      >
        {children}
      </div>
    )
  }
})

jest.mock('../PropertySwipeCard', () => {
  return function MockPropertySwipeCard({ property }: any) {
    return (
      <div data-testid="property-card">
        {property.address} - ${property.price}
      </div>
    )
  }
})

const mockSwipeService = SwipeService as jest.Mocked<typeof SwipeService>

describe('SwipeInterface - UI Components', () => {
  setupTest({ suppressConsoleErrors: true })

  const mockProperties: PropertyCardData[] = fixtures.properties.slice(0, 3).map(p => ({
    id: p.id,
    address: p.address,
    price: p.price,
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    property_type: p.property_type
  }))

  const mockProps = {
    properties: mockProperties,
    sessionId: 'session-123',
    onSwipeComplete: jest.fn(),
    onSwipe: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockSwipeService.handleSwipe.mockResolvedValue({
      success: true,
      newState: {
        liked: [],
        disliked: [],
        considering: [],
        viewed: []
      }
    })
    mockSwipeService.getSwipeState.mockResolvedValue({
      liked: [],
      disliked: [],
      considering: [],
      viewed: []
    })
    mockSwipeService.resetProperty.mockResolvedValue()
  })

  describe('Initial Rendering', () => {
    it('should render the first property initially', () => {
      render(<SwipeInterface {...mockProps} />)
      expect(screen.getByText(new RegExp(mockProperties[0].address))).toBeInTheDocument()
      expect(screen.getByText(new RegExp(mockProperties[0].price.toString()))).toBeInTheDocument()
    })

    it('should render property card component', () => {
      render(<SwipeInterface {...mockProps} />)
      expect(screen.getByTestId('property-card')).toBeInTheDocument()
      expect(screen.getByTestId('tinder-card')).toBeInTheDocument()
    })

    it('should render swipe controls', () => {
      render(<SwipeInterface {...mockProps} />)
      
      // Should have action buttons
      expect(screen.getByLabelText('Dislike property')).toBeInTheDocument()
      expect(screen.getByLabelText('Like property')).toBeInTheDocument()
      expect(screen.getByLabelText('Super like property')).toBeInTheDocument()
      expect(screen.getByLabelText('Maybe property')).toBeInTheDocument()
    })

    it('should render undo button', () => {
      render(<SwipeInterface {...mockProps} />)
      expect(screen.getByLabelText('Undo last swipe')).toBeInTheDocument()
    })
  })

  describe('Progress Indicator', () => {
    it('should show progress indicator', () => {
      render(<SwipeInterface {...mockProps} />)
      expect(screen.getByText('1 of 3')).toBeInTheDocument()
    })

    it('should update progress indicator after swipe', async () => {
      render(<SwipeInterface {...mockProps} />)
      const card = screen.getByTestId('tinder-card')
      
      fireEvent.click(card)
      
      await waitFor(() => {
        expect(screen.getByText('2 of 3')).toBeInTheDocument()
      })
    })

    it('should show progress bar', () => {
      render(<SwipeInterface {...mockProps} />)
      
      const progressBar = screen.getByRole('progressbar')
      expect(progressBar).toBeInTheDocument()
      expect(progressBar).toHaveAttribute('aria-valuenow', '1')
      expect(progressBar).toHaveAttribute('aria-valuemax', '3')
    })

    it('should update progress bar after swipe', async () => {
      render(<SwipeInterface {...mockProps} />)
      const card = screen.getByTestId('tinder-card')
      
      fireEvent.click(card)
      
      await waitFor(() => {
        const progressBar = screen.getByRole('progressbar')
        expect(progressBar).toHaveAttribute('aria-valuenow', '2')
      })
    })
  })

  describe('Bucket Display', () => {
    it('should show bucket counts with emojis', () => {
      render(<SwipeInterface {...mockProps} />)

      // Check that there are bucket icons and counts
      expect(screen.getByText('❤️')).toBeInTheDocument()
      expect(screen.getByText('❌')).toBeInTheDocument()
      expect(screen.getByText('🤔')).toBeInTheDocument()
      
      // Check initial counts
      const zeroCounts = screen.getAllByText('0')
      expect(zeroCounts).toHaveLength(3) // liked, disliked, considering
    })

    it('should have proper labels for bucket counts', () => {
      render(<SwipeInterface {...mockProps} />)

      expect(screen.getByLabelText(/liked properties/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/disliked properties/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/considering properties/i)).toBeInTheDocument()
    })

    it('should update bucket displays after swipes', async () => {
      mockSwipeService.handleSwipe.mockResolvedValue({
        success: true,
        newState: {
          liked: [mockProperties[0].id],
          disliked: [],
          considering: [],
          viewed: [mockProperties[0].id]
        }
      })

      render(<SwipeInterface {...mockProps} />)
      const card = screen.getByTestId('tinder-card')
      
      fireEvent.click(card)

      await waitFor(() => {
        expect(screen.getByText('1')).toBeInTheDocument() // liked count
        const zeroCounts = screen.getAllByText('0')
        expect(zeroCounts).toHaveLength(2) // disliked and considering should still be 0
      })
    })
  })

  describe('Empty States', () => {
    it('should handle empty properties list', () => {
      const emptyProps = {
        ...mockProps,
        properties: []
      }

      render(<SwipeInterface {...emptyProps} />)
      expect(screen.getByText('No properties available')).toBeInTheDocument()
    })

    it('should show empty state message styling', () => {
      const emptyProps = {
        ...mockProps,
        properties: []
      }

      render(<SwipeInterface {...emptyProps} />)
      const emptyMessage = screen.getByText('No properties available')
      expect(emptyMessage).toHaveClass('text-gray-500') // or appropriate empty state styling
    })

    it('should not show controls when no properties', () => {
      const emptyProps = {
        ...mockProps,
        properties: []
      }

      render(<SwipeInterface {...emptyProps} />)
      expect(screen.queryByLabelText('Like property')).not.toBeInTheDocument()
      expect(screen.queryByLabelText('Dislike property')).not.toBeInTheDocument()
    })
  })

  describe('Completion UI', () => {
    it('should show completion message when all properties swiped', async () => {
      const singlePropertyProps = {
        ...mockProps,
        properties: [mockProperties[0]]
      }

      render(<SwipeInterface {...singlePropertyProps} />)
      const card = screen.getByTestId('tinder-card')
      
      fireEvent.click(card)
      
      await waitFor(() => {
        expect(screen.getByText(/You've viewed all properties/)).toBeInTheDocument()
      })
    })

    it('should hide progress indicator when complete', async () => {
      const singlePropertyProps = {
        ...mockProps,
        properties: [mockProperties[0]]
      }

      render(<SwipeInterface {...singlePropertyProps} />)
      const card = screen.getByTestId('tinder-card')
      
      fireEvent.click(card)
      
      await waitFor(() => {
        expect(screen.queryByText(/1 of 1/)).not.toBeInTheDocument()
      })
    })

    it('should show action buttons in completion state', async () => {
      const singlePropertyProps = {
        ...mockProps,
        properties: [mockProperties[0]]
      }

      render(<SwipeInterface {...singlePropertyProps} />)
      const card = screen.getByTestId('tinder-card')
      
      fireEvent.click(card)
      
      await waitFor(() => {
        expect(screen.getByText(/View Results/)).toBeInTheDocument()
        expect(screen.getByText(/Start Over/)).toBeInTheDocument()
      })
    })
  })

  describe('Error UI', () => {
    it('should display error messages', async () => {
      mockSwipeService.handleSwipe.mockRejectedValue(new Error('Network error'))

      render(<SwipeInterface {...mockProps} />)
      const card = screen.getByTestId('tinder-card')
      
      fireEvent.click(card)

      await waitFor(() => {
        expect(screen.getByText(/Something went wrong/)).toBeInTheDocument()
      })
    })

    it('should style error messages appropriately', async () => {
      mockSwipeService.handleSwipe.mockRejectedValue(new Error('Network error'))

      render(<SwipeInterface {...mockProps} />)
      const card = screen.getByTestId('tinder-card')
      
      fireEvent.click(card)

      await waitFor(() => {
        const errorMessage = screen.getByText(/Something went wrong/)
        expect(errorMessage).toHaveClass('text-red-600') // or appropriate error styling
      })
    })

    it('should show retry button on error', async () => {
      mockSwipeService.handleSwipe.mockRejectedValue(new Error('Network error'))

      render(<SwipeInterface {...mockProps} />)
      const card = screen.getByTestId('tinder-card')
      
      fireEvent.click(card)

      await waitFor(() => {
        expect(screen.getByText(/Try Again/)).toBeInTheDocument()
      })
    })
  })

  describe('Loading UI', () => {
    it('should show loading indicators', async () => {
      mockSwipeService.handleSwipe.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          success: true,
          newState: {
            liked: [],
            disliked: [],
            considering: [],
            viewed: []
          }
        }), 100))
      )

      render(<SwipeInterface {...mockProps} />)
      const card = screen.getByTestId('tinder-card')
      
      fireEvent.click(card)

      // Should show loading state
      expect(screen.getByText(/Processing.../)).toBeInTheDocument()
    })

    it('should disable controls during loading', async () => {
      mockSwipeService.handleSwipe.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          success: true,
          newState: { liked: [], disliked: [], considering: [], viewed: [] }
        }), 100))
      )

      render(<SwipeInterface {...mockProps} />)
      const card = screen.getByTestId('tinder-card')
      
      fireEvent.click(card)

      // Action buttons should be disabled
      expect(screen.getByLabelText('Like property')).toBeDisabled()
      expect(screen.getByLabelText('Dislike property')).toBeDisabled()
    })
  })

  describe('Responsive Design', () => {
    it('should have responsive classes', () => {
      const { container } = render(<SwipeInterface {...mockProps} />)
      
      const mainContainer = container.firstChild
      expect(mainContainer).toHaveClass('flex', 'flex-col', 'h-full')
    })

    it('should handle mobile layout', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })
      
      render(<SwipeInterface {...mockProps} />)
      
      // Should still render all essential elements
      expect(screen.getByTestId('property-card')).toBeInTheDocument()
      expect(screen.getByText('❤️')).toBeInTheDocument()
      expect(screen.getByText('1 of 3')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<SwipeInterface {...mockProps} />)
      
      expect(screen.getByLabelText('Swipe interface')).toBeInTheDocument()
      expect(screen.getByLabelText('Property progress')).toBeInTheDocument()
      expect(screen.getByLabelText('Swipe actions')).toBeInTheDocument()
    })

    it('should have keyboard navigation support', () => {
      render(<SwipeInterface {...mockProps} />)
      
      const likeButton = screen.getByLabelText('Like property')
      const dislikeButton = screen.getByLabelText('Dislike property')
      
      expect(likeButton).toHaveAttribute('tabindex', '0')
      expect(dislikeButton).toHaveAttribute('tabindex', '0')
    })

    it('should announce swipe actions to screen readers', async () => {
      render(<SwipeInterface {...mockProps} />)
      const card = screen.getByTestId('tinder-card')
      
      fireEvent.click(card)
      
      await waitFor(() => {
        const announcement = screen.getByRole('status', { hidden: true })
        expect(announcement).toHaveTextContent(/Property liked/)
      })
    })
  })
})