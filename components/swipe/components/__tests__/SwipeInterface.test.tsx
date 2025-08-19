import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SwipeInterface from '../SwipeInterface'
import { SwipeService } from '../../swipe.service'
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

describe('SwipeInterface', () => {
  const mockProperties: PropertyCardData[] = [
    {
      id: 'prop-1',
      address: '123 Main St',
      price: 500000,
      bedrooms: 2,
      bathrooms: 1,
      property_type: 'house'
    },
    {
      id: 'prop-2', 
      address: '456 Oak Ave',
      price: 750000,
      bedrooms: 3,
      bathrooms: 2,
      property_type: 'condo'
    },
    {
      id: 'prop-3',
      address: '789 Pine Rd',
      price: 1000000,
      bedrooms: 4,
      bathrooms: 3,
      property_type: 'house'
    }
  ]

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

  it('should render the first property initially', () => {
    // ACT
    render(<SwipeInterface {...mockProps} />)

    // ASSERT
    expect(screen.getByText('123 Main St - $500000')).toBeInTheDocument()
  })

  it('should show progress indicator', () => {
    // ACT
    render(<SwipeInterface {...mockProps} />)

    // ASSERT
    expect(screen.getByText('1 of 3')).toBeInTheDocument()
  })

  it('should handle swipe right action', async () => {
    // ACT
    render(<SwipeInterface {...mockProps} />)
    const card = screen.getByTestId('tinder-card')
    
    fireEvent.click(card)
    
    // ASSERT
    await waitFor(() => {
      expect(mockSwipeService.handleSwipe).toHaveBeenCalledWith(
        'right',
        'prop-1',
        'session-123'
      )
    })
    
    expect(mockProps.onSwipe).toHaveBeenCalledWith('right', 'prop-1')
  })

  it('should show next property after swipe', async () => {
    // ACT
    render(<SwipeInterface {...mockProps} />)
    const card = screen.getByTestId('tinder-card')
    
    fireEvent.click(card)
    
    // ASSERT
    await waitFor(() => {
      expect(screen.getByText('456 Oak Ave - $750000')).toBeInTheDocument()
    })
  })

  it('should show completion message when all properties swiped', async () => {
    // ARRANGE - Properties with only one item
    const singlePropertyProps = {
      ...mockProps,
      properties: [mockProperties[0]]
    }

    // ACT
    render(<SwipeInterface {...singlePropertyProps} />)
    const card = screen.getByTestId('tinder-card')
    
    fireEvent.click(card)
    
    // ASSERT
    await waitFor(() => {
      expect(screen.getByText(/You've viewed all properties/)).toBeInTheDocument()
    })
    
    expect(mockProps.onSwipeComplete).toHaveBeenCalled()
  })

  it('should show bucket counts', () => {
    // ACT
    render(<SwipeInterface {...mockProps} />)

    // ASSERT - Each count is in separate spans
    expect(screen.getByText('❤️')).toBeInTheDocument()
    expect(screen.getByText('❌')).toBeInTheDocument()
    expect(screen.getByText('🤔')).toBeInTheDocument()
    
    // Check that there are multiple "0" counts visible
    const zeroCounts = screen.getAllByText('0')
    expect(zeroCounts).toHaveLength(3) // liked, disliked, considering
  })

  it('should handle undo action', async () => {
    const user = userEvent.setup()
    
    // ARRANGE - Start with the first property, then swipe it
    render(<SwipeInterface {...mockProps} />)
    
    // First swipe a card to move to next property
    const card = screen.getByTestId('tinder-card')
    fireEvent.click(card)
    
    // Now click undo - should undo the previous property (prop-1)
    await waitFor(() => {
      const undoButton = screen.getByLabelText('Undo last swipe')
      return user.click(undoButton)
    })

    // ASSERT - Should undo the first property that was swiped
    expect(mockSwipeService.resetProperty).toHaveBeenCalledWith('prop-1', 'session-123')
  })

  it('should handle empty properties list', () => {
    // ARRANGE
    const emptyProps = {
      ...mockProps,
      properties: []
    }

    // ACT
    render(<SwipeInterface {...emptyProps} />)

    // ASSERT
    expect(screen.getByText('No properties available')).toBeInTheDocument()
  })

  it('should show loading state during swipe action', async () => {
    // ARRANGE
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

    // ACT
    render(<SwipeInterface {...mockProps} />)
    const card = screen.getByTestId('tinder-card')
    
    fireEvent.click(card)

    // ASSERT - Should prevent all swipe directions during processing
    expect(screen.getByTestId('tinder-card')).toHaveAttribute('data-prevent-swipe', 'left,right,up,down')
  })

  it('should handle swipe service errors gracefully', async () => {
    // ARRANGE
    mockSwipeService.handleSwipe.mockRejectedValue(new Error('Network error'))

    // ACT
    render(<SwipeInterface {...mockProps} />)
    const card = screen.getByTestId('tinder-card')
    
    fireEvent.click(card)

    // ASSERT
    await waitFor(() => {
      expect(screen.getByText(/Something went wrong/)).toBeInTheDocument()
    })
  })

  it('should update bucket counts after swipes', async () => {
    // ARRANGE
    mockSwipeService.handleSwipe.mockResolvedValue({
      success: true,
      newState: {
        liked: ['prop-1'],
        disliked: [],
        considering: [],
        viewed: ['prop-1']
      }
    })

    // ACT
    render(<SwipeInterface {...mockProps} />)
    const card = screen.getByTestId('tinder-card')
    
    fireEvent.click(card)

    // ASSERT - Check that the liked count is updated
    await waitFor(() => {
      expect(screen.getByText('❤️')).toBeInTheDocument()
      // Should now have one "1" for liked count and two "0"s for other counts
      expect(screen.getByText('1')).toBeInTheDocument()
      const zeroCounts = screen.getAllByText('0')
      expect(zeroCounts).toHaveLength(2)
    })
  })
})