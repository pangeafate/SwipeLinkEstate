/**
 * @jest-environment jsdom
 */

import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import SwipeInterfaceV2 from '../SwipeInterfaceV2'
import { SwipeService } from '../../swipe.service'
import { setupTest } from '@/test/utils/testSetup'
import { fixtures } from '@/test/fixtures'
import { ComponentMockFactory } from '@/test/mocks'
import type { PropertyCardData, SwipeState } from '../../types'

// Use shared mock factories
ComponentMockFactory.mockFramerMotion()
jest.mock('../../swipe.service')
const mockSwipeService = SwipeService as jest.Mocked<typeof SwipeService>

// Mock Navigator.vibrate
Object.defineProperty(global.navigator, 'vibrate', {
  value: jest.fn(),
  writable: true
})

// Mock window dimensions
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 375
})

Object.defineProperty(window, 'innerHeight', {
  writable: true,
  configurable: true,
  value: 812
})

const mockProperties: PropertyCardData[] = fixtures.properties.slice(0, 3).map(p => ({
  id: p.id,
  address: p.address,
  price: p.price,
  bedrooms: p.bedrooms,
  bathrooms: p.bathrooms,
  area_sqft: p.area_sqft,
  property_type: p.property_type,
  status: p.status,
  cover_image: p.cover_image,
  images: p.images,
  features: p.features,
  created_at: p.created_at,
  updated_at: p.updated_at
}))

const mockInitialState: SwipeState = {
  liked: [],
  disliked: [],
  considering: [],
  viewed: []
}

describe('SwipeInterfaceV2', () => {
  setupTest({ suppressConsoleErrors: true })

  const defaultProps = {
    properties: mockProperties,
    sessionId: 'test-session',
    onSwipeComplete: jest.fn(),
    onSwipe: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockSwipeService.getSwipeState.mockResolvedValue(mockInitialState)
    mockSwipeService.handleSwipe.mockResolvedValue({
      success: true,
      newState: {
        ...mockInitialState,
        liked: ['1'],
        viewed: ['1']
      }
    })
  })

  describe('Initialization', () => {
    it('should render without crashing', async () => {
      await act(async () => {
        render(<SwipeInterfaceV2 {...defaultProps} />)
      })

      expect(screen.getByText('1 of 3')).toBeInTheDocument()
    })

    it('should load initial swipe state on mount', async () => {
      await act(async () => {
        render(<SwipeInterfaceV2 {...defaultProps} />)
      })

      await waitFor(() => {
        expect(mockSwipeService.getSwipeState).toHaveBeenCalledWith('test-session')
      })
    })

    it('should display multiple cards in stack', async () => {
      await act(async () => {
        render(<SwipeInterfaceV2 {...defaultProps} />)
      })

      // Should show property information from the cards
      expect(screen.getByText('$500,000')).toBeInTheDocument()
      expect(screen.getByText('123 Test Street, Test City')).toBeInTheDocument()
    })
  })

  describe('Empty State', () => {
    it('should show empty state when no properties', async () => {
      await act(async () => {
        render(<SwipeInterfaceV2 {...defaultProps} properties={[]} />)
      })

      expect(screen.getByText('No properties available')).toBeInTheDocument()
      expect(screen.getByText('Check back later for new listings')).toBeInTheDocument()
    })
  })

  describe('Completion State', () => {
    it('should show completion state when all properties viewed', async () => {
      mockSwipeService.getSwipeState.mockResolvedValue({
        liked: ['1', '2'],
        disliked: ['3'],
        considering: [],
        viewed: ['1', '2', '3']
      })

      await act(async () => {
        render(<SwipeInterfaceV2 {...defaultProps} />)
      })

      await waitFor(() => {
        expect(screen.getByText("You've viewed all properties!")).toBeInTheDocument()
        expect(screen.getByText('2')).toBeInTheDocument() // Liked count
        expect(screen.getByText('1')).toBeInTheDocument() // Disliked count
      })
    })
  })

  describe('Action Buttons', () => {
    it('should handle like button click', async () => {
      await act(async () => {
        render(<SwipeInterfaceV2 {...defaultProps} />)
      })

      const likeButton = screen.getByLabelText('Like (swipe right)')
      
      await act(async () => {
        fireEvent.click(likeButton)
      })

      await waitFor(() => {
        expect(mockSwipeService.handleSwipe).toHaveBeenCalledWith('right', '1', 'test-session')
      })
    })

    it('should handle pass button click', async () => {
      await act(async () => {
        render(<SwipeInterfaceV2 {...defaultProps} />)
      })

      const passButton = screen.getByLabelText('Pass (swipe left)')
      
      await act(async () => {
        fireEvent.click(passButton)
      })

      await waitFor(() => {
        expect(mockSwipeService.handleSwipe).toHaveBeenCalledWith('left', '1', 'test-session')
      })
    })

    it('should handle consider button click', async () => {
      await act(async () => {
        render(<SwipeInterfaceV2 {...defaultProps} />)
      })

      const considerButton = screen.getByLabelText('Consider (swipe down)')
      
      await act(async () => {
        fireEvent.click(considerButton)
      })

      await waitFor(() => {
        expect(mockSwipeService.handleSwipe).toHaveBeenCalledWith('down', '1', 'test-session')
      })
    })

    it('should disable buttons when processing', async () => {
      await act(async () => {
        render(<SwipeInterfaceV2 {...defaultProps} />)
      })

      const likeButton = screen.getByLabelText('Like (swipe right)')
      
      await act(async () => {
        fireEvent.click(likeButton)
      })

      // Buttons should be disabled while processing
      expect(likeButton).toBeDisabled()
    })
  })

  describe('Progress Tracking', () => {
    it('should display correct progress', async () => {
      await act(async () => {
        render(<SwipeInterfaceV2 {...defaultProps} />)
      })

      expect(screen.getByText('1 of 3')).toBeInTheDocument()
    })

    it('should update progress after swipe', async () => {
      await act(async () => {
        render(<SwipeInterfaceV2 {...defaultProps} />)
      })

      const likeButton = screen.getByLabelText('Like (swipe right)')
      
      await act(async () => {
        fireEvent.click(likeButton)
      })

      await waitFor(() => {
        expect(screen.getByText('2 of 3')).toBeInTheDocument()
      })
    })

    it('should display bucket counts', async () => {
      mockSwipeService.getSwipeState.mockResolvedValue({
        liked: ['1'],
        disliked: ['2'],
        considering: ['3'],
        viewed: ['1', '2', '3']
      })

      await act(async () => {
        render(<SwipeInterfaceV2 {...defaultProps} />)
      })

      await waitFor(() => {
        // Should show counts in the header
        const bucketElements = screen.getAllByText('1')
        expect(bucketElements.length).toBeGreaterThan(0) // Each bucket should show count of 1
      })
    })
  })

  describe('Undo Functionality', () => {
    it('should handle undo action', async () => {
      mockSwipeService.resetProperty.mockResolvedValue()
      mockSwipeService.getSwipeState.mockResolvedValue({
        liked: [],
        disliked: [],
        considering: [],
        viewed: []
      })

      await act(async () => {
        render(<SwipeInterfaceV2 {...defaultProps} />)
      })

      // First make a swipe to have something to undo
      const likeButton = screen.getByLabelText('Like (swipe right)')
      await act(async () => {
        fireEvent.click(likeButton)
      })

      await waitFor(() => {
        const undoButton = screen.getByText('↶ Undo')
        expect(undoButton).not.toBeDisabled()
      })

      const undoButton = screen.getByText('↶ Undo')
      await act(async () => {
        fireEvent.click(undoButton)
      })

      await waitFor(() => {
        expect(mockSwipeService.resetProperty).toHaveBeenCalledWith('1', 'test-session')
      })
    })

    it('should disable undo when at start', async () => {
      await act(async () => {
        render(<SwipeInterfaceV2 {...defaultProps} />)
      })

      const undoButton = screen.getByText('↶ Undo')
      expect(undoButton).toBeDisabled()
    })
  })

  describe('Error Handling', () => {
    it('should handle swipe service errors', async () => {
      mockSwipeService.handleSwipe.mockRejectedValue(new Error('Network error'))

      await act(async () => {
        render(<SwipeInterfaceV2 {...defaultProps} />)
      })

      const likeButton = screen.getByLabelText('Like (swipe right)')
      
      await act(async () => {
        fireEvent.click(likeButton)
      })

      await waitFor(() => {
        expect(screen.getByText('Something went wrong. Please try again.')).toBeInTheDocument()
      })
    })

    it('should handle already reviewed property', async () => {
      mockSwipeService.handleSwipe.mockResolvedValue({
        success: false,
        newState: mockInitialState
      })

      await act(async () => {
        render(<SwipeInterfaceV2 {...defaultProps} />)
      })

      const likeButton = screen.getByLabelText('Like (swipe right)')
      
      await act(async () => {
        fireEvent.click(likeButton)
      })

      await waitFor(() => {
        expect(screen.getByText('This property has already been reviewed')).toBeInTheDocument()
      })
    })
  })

  describe('Drag Gesture Handling', () => {
    it('should handle drag end with sufficient distance', async () => {
      await act(async () => {
        render(<SwipeInterfaceV2 {...defaultProps} />)
      })

      // Find the draggable card
      const cards = screen.getAllByText('$500,000')
      const card = cards[0].closest('[data-testid]') || cards[0].parentElement

      if (card) {
        // Simulate drag end with sufficient offset
        fireEvent.dragEnd(card, {
          offset: { x: 200, y: 0 }, // Sufficient for right swipe
          velocity: { x: 0, y: 0 }
        })

        await waitFor(() => {
          expect(mockSwipeService.handleSwipe).toHaveBeenCalledWith('right', '1', 'test-session')
        })
      }
    })

    it('should handle drag end with insufficient distance', async () => {
      await act(async () => {
        render(<SwipeInterfaceV2 {...defaultProps} />)
      })

      const cards = screen.getAllByText('$500,000')
      const card = cards[0].closest('[data-testid]') || cards[0].parentElement

      if (card) {
        // Simulate drag end with insufficient offset
        fireEvent.dragEnd(card, {
          offset: { x: 50, y: 0 }, // Insufficient for swipe
          velocity: { x: 0, y: 0 }
        })

        // Should snap back, no swipe service call
        expect(mockSwipeService.handleSwipe).not.toHaveBeenCalled()
      }
    })
  })

  describe('Callbacks', () => {
    it('should call onSwipe callback', async () => {
      const onSwipe = jest.fn()
      
      await act(async () => {
        render(<SwipeInterfaceV2 {...defaultProps} onSwipe={onSwipe} />)
      })

      const likeButton = screen.getByLabelText('Like (swipe right)')
      
      await act(async () => {
        fireEvent.click(likeButton)
      })

      await waitFor(() => {
        expect(onSwipe).toHaveBeenCalledWith('right', '1')
      })
    })

    it('should call onSwipeComplete when finished', async () => {
      const onSwipeComplete = jest.fn()
      
      // Mock that we're on the last property
      const singleProperty = [mockProperties[0]]
      
      await act(async () => {
        render(<SwipeInterfaceV2 {...defaultProps} properties={singleProperty} onSwipeComplete={onSwipeComplete} />)
      })

      const likeButton = screen.getByLabelText('Like (swipe right)')
      
      await act(async () => {
        fireEvent.click(likeButton)
      })

      await waitFor(() => {
        expect(onSwipeComplete).toHaveBeenCalledWith({
          ...mockInitialState,
          liked: ['1'],
          viewed: ['1']
        })
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels on buttons', async () => {
      await act(async () => {
        render(<SwipeInterfaceV2 {...defaultProps} />)
      })

      expect(screen.getByLabelText('Pass (swipe left)')).toBeInTheDocument()
      expect(screen.getByLabelText('Consider (swipe down)')).toBeInTheDocument()
      expect(screen.getByLabelText('Like (swipe right)')).toBeInTheDocument()
      expect(screen.getByLabelText('Undo last swipe')).toBeInTheDocument()
    })

    it('should have proper button states for screen readers', async () => {
      await act(async () => {
        render(<SwipeInterfaceV2 {...defaultProps} />)
      })

      const undoButton = screen.getByLabelText('Undo last swipe')
      expect(undoButton).toHaveAttribute('disabled')
    })
  })

  describe('Haptic Feedback', () => {
    it('should trigger vibration on successful swipe', async () => {
      const vibrateSpy = jest.spyOn(navigator, 'vibrate')

      await act(async () => {
        render(<SwipeInterfaceV2 {...defaultProps} />)
      })

      const likeButton = screen.getByLabelText('Like (swipe right)')
      
      await act(async () => {
        fireEvent.click(likeButton)
      })

      await waitFor(() => {
        expect(vibrateSpy).toHaveBeenCalledWith(50)
      })
    })
  })
})