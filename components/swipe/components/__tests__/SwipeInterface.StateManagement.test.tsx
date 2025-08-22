import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

describe('SwipeInterface - State Management', () => {
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

  describe('Bucket State Updates', () => {
    it('should update bucket counts after swipes', async () => {
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

      // Check that the liked count is updated
      await waitFor(() => {
        expect(screen.getByText('❤️')).toBeInTheDocument()
        // Should now have one "1" for liked count and two "0"s for other counts
        expect(screen.getByText('1')).toBeInTheDocument()
        const zeroCounts = screen.getAllByText('0')
        expect(zeroCounts).toHaveLength(2)
      })
    })

    it('should show initial bucket counts', () => {
      render(<SwipeInterface {...mockProps} />)

      // Check that there are bucket icons
      expect(screen.getByText('❤️')).toBeInTheDocument()
      expect(screen.getByText('❌')).toBeInTheDocument()
      expect(screen.getByText('🤔')).toBeInTheDocument()
      
      // Check that there are multiple "0" counts visible initially
      const zeroCounts = screen.getAllByText('0')
      expect(zeroCounts).toHaveLength(3) // liked, disliked, considering
    })

    it('should update multiple bucket counts correctly', async () => {
      mockSwipeService.handleSwipe
        .mockResolvedValueOnce({
          success: true,
          newState: {
            liked: [mockProperties[0].id],
            disliked: [],
            considering: [],
            viewed: [mockProperties[0].id]
          }
        })
        .mockResolvedValueOnce({
          success: true,
          newState: {
            liked: [mockProperties[0].id],
            disliked: [mockProperties[1].id],
            considering: [],
            viewed: [mockProperties[0].id, mockProperties[1].id]
          }
        })

      render(<SwipeInterface {...mockProps} />)
      
      // First swipe - like
      const card = screen.getByTestId('tinder-card')
      fireEvent.click(card)

      await waitFor(() => {
        expect(screen.getByText('1')).toBeInTheDocument() // liked count
      })

      // Second swipe - dislike (simulate left swipe)
      mockSwipeService.handleSwipe.mockResolvedValue({
        success: true,
        newState: {
          liked: [mockProperties[0].id],
          disliked: [mockProperties[1].id],
          considering: [],
          viewed: [mockProperties[0].id, mockProperties[1].id]
        }
      })

      const nextCard = screen.getByTestId('tinder-card')
      fireEvent.click(nextCard)

      await waitFor(() => {
        const oneCounts = screen.getAllByText('1')
        expect(oneCounts).toHaveLength(2) // liked: 1, disliked: 1
      })
    })
  })

  describe('Progress State', () => {
    it('should show correct progress indicator', () => {
      render(<SwipeInterface {...mockProps} />)
      expect(screen.getByText('1 of 3')).toBeInTheDocument()
    })

    it('should update progress after swipe', async () => {
      render(<SwipeInterface {...mockProps} />)
      const card = screen.getByTestId('tinder-card')
      
      fireEvent.click(card)
      
      await waitFor(() => {
        expect(screen.getByText('2 of 3')).toBeInTheDocument()
      })
    })

    it('should handle progress at the end', async () => {
      const singlePropertyProps = {
        ...mockProps,
        properties: [mockProperties[0]]
      }

      render(<SwipeInterface {...singlePropertyProps} />)
      const card = screen.getByTestId('tinder-card')
      
      fireEvent.click(card)
      
      await waitFor(() => {
        expect(screen.queryByText(/of 1/)).not.toBeInTheDocument()
        expect(screen.getByText(/You've viewed all properties/)).toBeInTheDocument()
      })
    })
  })

  describe('Completion State', () => {
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
      
      expect(mockProps.onSwipeComplete).toHaveBeenCalled()
    })

    it('should not show completion message when properties remain', async () => {
      render(<SwipeInterface {...mockProps} />)
      const card = screen.getByTestId('tinder-card')
      
      fireEvent.click(card)
      
      await waitFor(() => {
        expect(screen.queryByText(/You've viewed all properties/)).not.toBeInTheDocument()
      })
    })
  })

  describe('Undo State Management', () => {
    it('should handle undo action', async () => {
      const user = userEvent.setup()
      
      render(<SwipeInterface {...mockProps} />)
      
      // First swipe a card to move to next property
      const card = screen.getByTestId('tinder-card')
      fireEvent.click(card)
      
      // Now click undo - should undo the previous property
      await waitFor(() => {
        const undoButton = screen.getByLabelText('Undo last swipe')
        return user.click(undoButton)
      })

      // Should call resetProperty with the previous property ID
      expect(mockSwipeService.resetProperty).toHaveBeenCalledWith(mockProperties[0].id, 'session-123')
    })

    it('should update state after undo', async () => {
      const user = userEvent.setup()
      
      // Mock undo to revert state
      mockSwipeService.resetProperty.mockResolvedValue()
      mockSwipeService.getSwipeState.mockResolvedValue({
        liked: [],
        disliked: [],
        considering: [],
        viewed: []
      })

      render(<SwipeInterface {...mockProps} />)
      
      // Swipe first
      const card = screen.getByTestId('tinder-card')
      fireEvent.click(card)
      
      // Then undo
      await waitFor(async () => {
        const undoButton = screen.getByLabelText('Undo last swipe')
        await user.click(undoButton)
      })

      // State should be refreshed after undo
      await waitFor(() => {
        expect(mockSwipeService.getSwipeState).toHaveBeenCalled()
      })
    })

    it('should disable undo when no swipes to undo', () => {
      render(<SwipeInterface {...mockProps} />)
      
      const undoButton = screen.getByLabelText('Undo last swipe')
      expect(undoButton).toBeDisabled()
    })
  })

  describe('Error State Management', () => {
    it('should handle swipe service errors gracefully', async () => {
      mockSwipeService.handleSwipe.mockRejectedValue(new Error('Network error'))

      render(<SwipeInterface {...mockProps} />)
      const card = screen.getByTestId('tinder-card')
      
      fireEvent.click(card)

      await waitFor(() => {
        expect(screen.getByText(/Something went wrong/)).toBeInTheDocument()
      })
    })

    it('should maintain state consistency after errors', async () => {
      mockSwipeService.handleSwipe.mockRejectedValue(new Error('Network error'))

      render(<SwipeInterface {...mockProps} />)
      const card = screen.getByTestId('tinder-card')
      
      fireEvent.click(card)

      await waitFor(() => {
        expect(screen.getByText(/Something went wrong/)).toBeInTheDocument()
      })

      // Should still show the same property (not advance)
      expect(screen.getByText(new RegExp(mockProperties[0].address))).toBeInTheDocument()
    })

    it('should allow retry after error', async () => {
      mockSwipeService.handleSwipe
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
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
      
      // First attempt fails
      fireEvent.click(card)
      await waitFor(() => {
        expect(screen.getByText(/Something went wrong/)).toBeInTheDocument()
      })

      // Second attempt succeeds
      fireEvent.click(card)
      await waitFor(() => {
        expect(screen.queryByText(/Something went wrong/)).not.toBeInTheDocument()
        expect(screen.getByText(new RegExp(mockProperties[1].address))).toBeInTheDocument()
      })
    })
  })

  describe('Loading State Management', () => {
    it('should show loading state during swipe action', async () => {
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

      // Should prevent swipes during loading
      expect(card).toHaveAttribute('data-prevent-swipe', 'left,right,up,down')
    })

    it('should clear loading state after swipe completes', async () => {
      render(<SwipeInterface {...mockProps} />)
      const card = screen.getByTestId('tinder-card')
      
      fireEvent.click(card)

      await waitFor(() => {
        const nextCard = screen.getByTestId('tinder-card')
        expect(nextCard).not.toHaveAttribute('data-prevent-swipe')
      })
    })
  })

  describe('Session State Persistence', () => {
    it('should load initial state for session', async () => {
      mockSwipeService.getSwipeState.mockResolvedValue({
        liked: ['prop-1'],
        disliked: ['prop-2'],
        considering: ['prop-3'],
        viewed: ['prop-1', 'prop-2', 'prop-3']
      })

      render(<SwipeInterface {...mockProps} />)

      // Should fetch initial state
      expect(mockSwipeService.getSwipeState).toHaveBeenCalledWith('session-123')

      await waitFor(() => {
        // Should show loaded counts
        const oneCounts = screen.getAllByText('1')
        expect(oneCounts).toHaveLength(3) // liked: 1, disliked: 1, considering: 1
      })
    })

    it('should handle session state loading errors', async () => {
      mockSwipeService.getSwipeState.mockRejectedValue(new Error('Failed to load state'))

      render(<SwipeInterface {...mockProps} />)

      // Should still render with default state
      await waitFor(() => {
        expect(screen.getByText('❤️')).toBeInTheDocument()
        expect(screen.getByText('❌')).toBeInTheDocument()
        expect(screen.getByText('🤔')).toBeInTheDocument()
      })
    })
  })
})