/**
 * @jest-environment jsdom
 */

import { renderHook, act } from '@testing-library/react'
import useSwipeLogic from '../hooks/useSwipeLogic'
import { SwipeService } from '../../swipe.service'

// Mock SwipeService
jest.mock('../../swipe.service', () => ({
  SwipeService: {
    getSwipeState: jest.fn(),
    handleSwipe: jest.fn(),
    resetProperty: jest.fn(),
    trackPropertyView: jest.fn().mockResolvedValue(undefined)
  }
}))

const mockProperties = [
  {
    id: '1',
    address: '123 Test St',
    price: 500000,
    bedrooms: 3,
    bathrooms: 2,
    area_sqft: 1500,
    property_type: 'house',
    status: 'active',
    cover_image: '/test.jpg',
    images: ['/test.jpg'],
    features: ['garage'],
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z'
  }
]

const mockSwipeState = {
  liked: [],
  disliked: [],
  considering: [],
  viewed: ['1']
}

describe('useSwipeLogic', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(SwipeService.getSwipeState as jest.Mock).mockResolvedValue(mockSwipeState)
    ;(SwipeService.handleSwipe as jest.Mock).mockResolvedValue({
      success: true,
      newState: mockSwipeState
    })
  })

  it('should initialize with default state', () => {
    // ARRANGE & ACT
    const { result } = renderHook(() =>
      useSwipeLogic({
        properties: mockProperties,
        sessionId: 'test-session'
      })
    )

    // ASSERT
    expect(result.current.currentIndex).toBe(0)
    expect(result.current.isProcessing).toBe(false)
    expect(result.current.error).toBe(null)
  })

  it('should handle swipe decision', async () => {
    // ARRANGE
    const onSwipe = jest.fn()
    const { result } = renderHook(() =>
      useSwipeLogic({
        properties: mockProperties,
        sessionId: 'test-session',
        onSwipe
      })
    )

    // ACT
    await act(async () => {
      await result.current.decideSwipe('right', '1')
    })

    // ASSERT
    expect(SwipeService.handleSwipe).toHaveBeenCalledWith('right', '1', 'test-session')
    expect(onSwipe).toHaveBeenCalledWith('right', '1')
  })

  it('should handle undo operation', async () => {
    // ARRANGE
    const { result } = renderHook(() =>
      useSwipeLogic({
        properties: mockProperties,
        sessionId: 'test-session'
      })
    )

    // Set current index to 1 so undo is possible
    act(() => {
      result.current.setCurrentIndex(1)
    })

    // ACT
    await act(async () => {
      await result.current.handleUndo()
    })

    // ASSERT
    expect(SwipeService.resetProperty).toHaveBeenCalledWith('1', 'test-session')
  })
})