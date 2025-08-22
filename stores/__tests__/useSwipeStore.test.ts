/**
 * @jest-environment jsdom
 */

import { renderHook, act } from '@testing-library/react'
import { useSwipeStore } from '../useSwipeStore'
import type { SwipeState } from '@/components/swipe/types'

const mockSwipeState: SwipeState = {
  liked: ['prop1', 'prop2'],
  disliked: ['prop3'],
  considering: ['prop4'],
  viewed: ['prop1', 'prop2', 'prop3', 'prop4']
}

describe('useSwipeStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useSwipeStore.getState().reset()
  })

  it('should initialize with empty state', () => {
    // ARRANGE & ACT
    const { result } = renderHook(() => useSwipeStore())

    // ASSERT
    expect(result.current.currentSessionId).toBeNull()
    expect(result.current.swipeState).toEqual({
      liked: [],
      disliked: [],
      considering: [],
      viewed: []
    })
    expect(result.current.currentIndex).toBe(0)
    expect(result.current.isProcessing).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('should initialize session correctly', () => {
    // ARRANGE
    const { result } = renderHook(() => useSwipeStore())
    const sessionId = 'test-session-123'

    // ACT
    act(() => {
      result.current.initializeSession(sessionId)
    })

    // ASSERT
    expect(result.current.currentSessionId).toBe(sessionId)
    expect(result.current.currentIndex).toBe(0)
    expect(result.current.error).toBeNull()
  })

  it('should update swipe state correctly', () => {
    // ARRANGE
    const { result } = renderHook(() => useSwipeStore())

    // ACT
    act(() => {
      result.current.setSwipeState(mockSwipeState)
    })

    // ASSERT
    expect(result.current.swipeState).toEqual(mockSwipeState)
    expect(result.current.swipeState.liked).toHaveLength(2)
    expect(result.current.swipeState.viewed).toHaveLength(4)
  })

  it('should handle swipe decision correctly', () => {
    // ARRANGE
    const { result } = renderHook(() => useSwipeStore())
    
    act(() => {
      result.current.initializeSession('test-session')
    })

    // ACT
    act(() => {
      result.current.handleSwipeDecision('prop1', 'right')
    })

    // ASSERT
    expect(result.current.swipeState.liked).toContain('prop1')
    expect(result.current.swipeState.viewed).toContain('prop1')
    expect(result.current.currentIndex).toBe(1)
  })

  it('should handle different swipe directions', () => {
    // ARRANGE
    const { result } = renderHook(() => useSwipeStore())
    
    act(() => {
      result.current.initializeSession('test-session')
    })

    // ACT - Swipe right (like)
    act(() => {
      result.current.handleSwipeDecision('prop1', 'right')
    })

    // ACT - Swipe left (dislike)
    act(() => {
      result.current.handleSwipeDecision('prop2', 'left')
    })

    // ACT - Swipe down (considering)
    act(() => {
      result.current.handleSwipeDecision('prop3', 'down')
    })

    // ASSERT
    expect(result.current.swipeState.liked).toContain('prop1')
    expect(result.current.swipeState.disliked).toContain('prop2')
    expect(result.current.swipeState.considering).toContain('prop3')
    expect(result.current.swipeState.viewed).toEqual(['prop1', 'prop2', 'prop3'])
    expect(result.current.currentIndex).toBe(3)
  })

  it('should handle undo correctly', () => {
    // ARRANGE
    const { result } = renderHook(() => useSwipeStore())
    
    act(() => {
      result.current.initializeSession('test-session')
      result.current.handleSwipeDecision('prop1', 'right')
      result.current.handleSwipeDecision('prop2', 'left')
    })

    // ACT
    act(() => {
      result.current.handleUndo('prop2')
    })

    // ASSERT
    expect(result.current.swipeState.disliked).not.toContain('prop2')
    expect(result.current.swipeState.viewed).not.toContain('prop2')
    expect(result.current.currentIndex).toBe(1)
  })

  it('should handle processing state', () => {
    // ARRANGE
    const { result } = renderHook(() => useSwipeStore())

    // ACT
    act(() => {
      result.current.setProcessing(true)
    })

    // ASSERT
    expect(result.current.isProcessing).toBe(true)

    // ACT
    act(() => {
      result.current.setProcessing(false)
    })

    // ASSERT
    expect(result.current.isProcessing).toBe(false)
  })

  it('should handle error state', () => {
    // ARRANGE
    const { result } = renderHook(() => useSwipeStore())
    const error = 'Failed to process swipe'

    // ACT
    act(() => {
      result.current.setError(error)
    })

    // ASSERT
    expect(result.current.error).toBe(error)

    // ACT - Clear error
    act(() => {
      result.current.setError(null)
    })

    // ASSERT
    expect(result.current.error).toBeNull()
  })

  it('should calculate bucket counts correctly', () => {
    // ARRANGE
    const { result } = renderHook(() => useSwipeStore())

    act(() => {
      result.current.setSwipeState(mockSwipeState)
    })

    // ACT & ASSERT
    expect(result.current.getBucketCounts()).toEqual({
      liked: 2,
      disliked: 1,
      considering: 1,
    })
  })

  it('should check completion status correctly', () => {
    // ARRANGE
    const { result } = renderHook(() => useSwipeStore())

    // ACT & ASSERT - Not complete initially
    expect(result.current.isComplete(5)).toBe(false)

    // Set current index equal to total
    act(() => {
      result.current.setCurrentIndex(5)
    })

    // ACT & ASSERT - Complete when currentIndex >= total
    expect(result.current.isComplete(5)).toBe(true)
  })

  it('should reset store correctly', () => {
    // ARRANGE
    const { result } = renderHook(() => useSwipeStore())
    
    act(() => {
      result.current.initializeSession('test-session')
      result.current.setSwipeState(mockSwipeState)
      result.current.setCurrentIndex(5)
      result.current.setProcessing(true)
      result.current.setError('Some error')
    })

    // ACT
    act(() => {
      result.current.reset()
    })

    // ASSERT
    expect(result.current.currentSessionId).toBeNull()
    expect(result.current.swipeState).toEqual({
      liked: [],
      disliked: [],
      considering: [],
      viewed: []
    })
    expect(result.current.currentIndex).toBe(0)
    expect(result.current.isProcessing).toBe(false)
    expect(result.current.error).toBeNull()
  })
})