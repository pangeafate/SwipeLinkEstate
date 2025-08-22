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
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') onSwipe && onSwipe('left')
          if (e.key === 'ArrowRight') onSwipe && onSwipe('right')
          if (e.key === 'ArrowUp') onSwipe && onSwipe('up')
          if (e.key === 'ArrowDown') onSwipe && onSwipe('down')
        }}
        data-prevent-swipe={preventSwipe}
        tabIndex={0}
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

describe('SwipeInterface - Gestures', () => {
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

  describe('Swipe Right (Like)', () => {
    it('should handle swipe right action', async () => {
      render(<SwipeInterface {...mockProps} />)
      const card = screen.getByTestId('tinder-card')
      
      fireEvent.click(card)
      
      await waitFor(() => {
        expect(mockSwipeService.handleSwipe).toHaveBeenCalledWith(
          'right',
          mockProperties[0].id,
          'session-123'
        )
      })
      
      expect(mockProps.onSwipe).toHaveBeenCalledWith('right', mockProperties[0].id)
    })

    it('should handle keyboard swipe right', async () => {
      render(<SwipeInterface {...mockProps} />)
      const card = screen.getByTestId('tinder-card')
      
      fireEvent.keyDown(card, { key: 'ArrowRight' })
      
      await waitFor(() => {
        expect(mockSwipeService.handleSwipe).toHaveBeenCalledWith(
          'right',
          mockProperties[0].id,
          'session-123'
        )
      })
    })

    it('should show next property after swipe right', async () => {
      render(<SwipeInterface {...mockProps} />)
      const card = screen.getByTestId('tinder-card')
      
      fireEvent.click(card)
      
      await waitFor(() => {
        expect(screen.getByText(new RegExp(mockProperties[1].address))).toBeInTheDocument()
      })
    })
  })

  describe('Swipe Left (Dislike)', () => {
    it('should handle swipe left action', async () => {
      render(<SwipeInterface {...mockProps} />)
      const card = screen.getByTestId('tinder-card')
      
      fireEvent.keyDown(card, { key: 'ArrowLeft' })
      
      await waitFor(() => {
        expect(mockSwipeService.handleSwipe).toHaveBeenCalledWith(
          'left',
          mockProperties[0].id,
          'session-123'
        )
      })
      
      expect(mockProps.onSwipe).toHaveBeenCalledWith('left', mockProperties[0].id)
    })

    it('should show next property after swipe left', async () => {
      render(<SwipeInterface {...mockProps} />)
      const card = screen.getByTestId('tinder-card')
      
      fireEvent.keyDown(card, { key: 'ArrowLeft' })
      
      await waitFor(() => {
        expect(screen.getByText(new RegExp(mockProperties[1].address))).toBeInTheDocument()
      })
    })
  })

  describe('Swipe Up (Super Like)', () => {
    it('should handle swipe up action', async () => {
      render(<SwipeInterface {...mockProps} />)
      const card = screen.getByTestId('tinder-card')
      
      fireEvent.keyDown(card, { key: 'ArrowUp' })
      
      await waitFor(() => {
        expect(mockSwipeService.handleSwipe).toHaveBeenCalledWith(
          'up',
          mockProperties[0].id,
          'session-123'
        )
      })
      
      expect(mockProps.onSwipe).toHaveBeenCalledWith('up', mockProperties[0].id)
    })
  })

  describe('Swipe Down (Maybe)', () => {
    it('should handle swipe down action', async () => {
      render(<SwipeInterface {...mockProps} />)
      const card = screen.getByTestId('tinder-card')
      
      fireEvent.keyDown(card, { key: 'ArrowDown' })
      
      await waitFor(() => {
        expect(mockSwipeService.handleSwipe).toHaveBeenCalledWith(
          'down',
          mockProperties[0].id,
          'session-123'
        )
      })
      
      expect(mockProps.onSwipe).toHaveBeenCalledWith('down', mockProperties[0].id)
    })
  })

  describe('Swipe Prevention', () => {
    it('should prevent swipes during loading', async () => {
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

      // Should prevent all swipe directions during processing
      expect(card).toHaveAttribute('data-prevent-swipe', 'left,right,up,down')
    })

    it('should not prevent swipes when not loading', () => {
      render(<SwipeInterface {...mockProps} />)
      const card = screen.getByTestId('tinder-card')
      
      // Should not have prevent-swipe attribute when not loading
      expect(card).not.toHaveAttribute('data-prevent-swipe')
    })
  })

  describe('Multiple Rapid Swipes', () => {
    it('should handle multiple rapid swipes gracefully', async () => {
      render(<SwipeInterface {...mockProps} />)
      const card = screen.getByTestId('tinder-card')
      
      // Perform multiple rapid clicks
      fireEvent.click(card)
      fireEvent.click(card)
      fireEvent.click(card)
      
      // Should only process one swipe at a time
      await waitFor(() => {
        expect(mockSwipeService.handleSwipe).toHaveBeenCalledTimes(1)
      })
    })

    it('should queue swipes when processing', async () => {
      let resolvePromise: (value: any) => void
      const swipePromise = new Promise((resolve) => {
        resolvePromise = resolve
      })
      
      mockSwipeService.handleSwipe.mockReturnValue(swipePromise)

      render(<SwipeInterface {...mockProps} />)
      const card = screen.getByTestId('tinder-card')
      
      // Start first swipe
      fireEvent.click(card)
      
      // Try second swipe while first is processing
      fireEvent.click(card)
      
      // Should be in loading state
      expect(card).toHaveAttribute('data-prevent-swipe', 'left,right,up,down')
      
      // Resolve first promise
      resolvePromise({
        success: true,
        newState: { liked: [], disliked: [], considering: [], viewed: [] }
      })
      
      await waitFor(() => {
        expect(mockSwipeService.handleSwipe).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('Touch Gestures', () => {
    it('should handle touch start events', () => {
      render(<SwipeInterface {...mockProps} />)
      const card = screen.getByTestId('tinder-card')
      
      fireEvent.touchStart(card, {
        touches: [{ clientX: 100, clientY: 100 }]
      })
      
      // Should not throw errors
      expect(card).toBeInTheDocument()
    })

    it('should handle touch move events', () => {
      render(<SwipeInterface {...mockProps} />)
      const card = screen.getByTestId('tinder-card')
      
      // Start touch
      fireEvent.touchStart(card, {
        touches: [{ clientX: 100, clientY: 100 }]
      })
      
      // Move touch
      fireEvent.touchMove(card, {
        touches: [{ clientX: 200, clientY: 100 }]
      })
      
      expect(card).toBeInTheDocument()
    })

    it('should handle touch end events', async () => {
      render(<SwipeInterface {...mockProps} />)
      const card = screen.getByTestId('tinder-card')
      
      // Simulate a touch swipe sequence
      fireEvent.touchStart(card, {
        touches: [{ clientX: 100, clientY: 100 }]
      })
      
      fireEvent.touchEnd(card, {
        changedTouches: [{ clientX: 300, clientY: 100 }]
      })
      
      // Mock implementation should have fired
      expect(card).toBeInTheDocument()
    })
  })

  describe('Gesture Feedback', () => {
    it('should provide visual feedback during swipe', async () => {
      render(<SwipeInterface {...mockProps} />)
      const card = screen.getByTestId('tinder-card')
      
      fireEvent.click(card)
      
      // During swipe processing, card should show loading state
      await waitFor(() => {
        expect(card).toHaveAttribute('data-prevent-swipe')
      })
    })

    it('should reset visual state after swipe completes', async () => {
      render(<SwipeInterface {...mockProps} />)
      const card = screen.getByTestId('tinder-card')
      
      fireEvent.click(card)
      
      await waitFor(() => {
        // After swipe completes, should show next card without prevent-swipe
        const nextCard = screen.getByTestId('tinder-card')
        expect(nextCard).not.toHaveAttribute('data-prevent-swipe')
      })
    })
  })
})