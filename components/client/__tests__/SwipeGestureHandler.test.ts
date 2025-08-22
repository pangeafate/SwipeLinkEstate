import { renderHook, act } from '@testing-library/react'
import { useSwipeGestureHandler } from '../SwipeGestureHandler'

describe('useSwipeGestureHandler', () => {
  const mockOnNavigate = jest.fn()
  
  const defaultProps = {
    isTransitioning: false,
    onNavigate: mockOnNavigate,
    currentIndex: 1,
    propertiesLength: 3
  }

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock window.innerWidth for swipe calculations
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1000, // 1000px screen width for testing
    })
  })

  describe('Initial State', () => {
    it('should initialize with default swipe state', () => {
      // ARRANGE & ACT
      const { result } = renderHook(() => useSwipeGestureHandler(defaultProps))

      // ASSERT
      expect(result.current.swipeState).toEqual({
        touchStartX: null,
        touchStartTime: null,
        dragOffset: 0,
        isDragging: false,
        swipeDirection: null,
        swipeProgress: 0
      })
    })

    it('should provide touch event handlers', () => {
      // ARRANGE & ACT
      const { result } = renderHook(() => useSwipeGestureHandler(defaultProps))

      // ASSERT
      expect(typeof result.current.handleTouchStart).toBe('function')
      expect(typeof result.current.handleTouchMove).toBe('function')
      expect(typeof result.current.handleTouchEnd).toBe('function')
      expect(typeof result.current.smoothNavigate).toBe('function')
    })
  })

  describe('Touch Start', () => {
    it('should set touch start coordinates and time', () => {
      // ARRANGE
      const { result } = renderHook(() => useSwipeGestureHandler(defaultProps))
      const mockTouchEvent = {
        touches: [{ clientX: 500 }]
      } as React.TouchEvent

      // ACT
      act(() => {
        result.current.handleTouchStart(mockTouchEvent)
      })

      // ASSERT
      expect(result.current.swipeState.touchStartX).toBe(500)
      expect(result.current.swipeState.touchStartTime).toBeGreaterThan(0)
      expect(result.current.swipeState.isDragging).toBe(true)
    })

    it('should not set state if transitioning', () => {
      // ARRANGE
      const transitioningProps = { ...defaultProps, isTransitioning: true }
      const { result } = renderHook(() => useSwipeGestureHandler(transitioningProps))
      const mockTouchEvent = {
        touches: [{ clientX: 500 }]
      } as React.TouchEvent

      // ACT
      act(() => {
        result.current.handleTouchStart(mockTouchEvent)
      })

      // ASSERT
      expect(result.current.swipeState.touchStartX).toBe(null)
      expect(result.current.swipeState.isDragging).toBe(false)
    })
  })

  describe('Touch Move', () => {
    it('should update drag offset and direction during move', () => {
      // ARRANGE
      const { result } = renderHook(() => useSwipeGestureHandler(defaultProps))
      
      const startEvent = {
        touches: [{ clientX: 500 }]
      } as React.TouchEvent

      const moveEvent = {
        touches: [{ clientX: 300 }] // 200px left swipe
      } as React.TouchEvent

      // ACT
      act(() => {
        result.current.handleTouchStart(startEvent)
      })
      
      act(() => {
        result.current.handleTouchMove(moveEvent)
      })

      // ASSERT
      expect(result.current.swipeState.dragOffset).toBe(200) // 500 - 300
      expect(result.current.swipeState.swipeDirection).toBe('left')
      expect(result.current.swipeState.swipeProgress).toBe(0.2) // 200px / 1000px screen
    })

    it('should detect right swipe direction', () => {
      // ARRANGE
      const { result } = renderHook(() => useSwipeGestureHandler(defaultProps))
      
      const startEvent = {
        touches: [{ clientX: 300 }]
      } as React.TouchEvent

      const moveEvent = {
        touches: [{ clientX: 500 }] // 200px right swipe
      } as React.TouchEvent

      // ACT
      act(() => {
        result.current.handleTouchStart(startEvent)
      })
      
      act(() => {
        result.current.handleTouchMove(moveEvent)
      })

      // ASSERT
      expect(result.current.swipeState.dragOffset).toBe(-200) // 300 - 500
      expect(result.current.swipeState.swipeDirection).toBe('right')
    })

    it('should limit drag offset to prevent over-scrolling', () => {
      // ARRANGE
      const { result } = renderHook(() => useSwipeGestureHandler(defaultProps))
      
      const startEvent = {
        touches: [{ clientX: 500 }]
      } as React.TouchEvent

      const moveEvent = {
        touches: [{ clientX: -200 }] // 700px swipe (should be limited to 500px max)
      } as React.TouchEvent

      // ACT
      act(() => {
        result.current.handleTouchStart(startEvent)
      })
      
      act(() => {
        result.current.handleTouchMove(moveEvent)
      })

      // ASSERT
      expect(result.current.swipeState.dragOffset).toBe(500) // Limited to maxOffset (50% of screen)
      expect(result.current.swipeState.swipeProgress).toBe(0.7) // 700px / 1000px (before limiting)
    })

    it('should not update if not dragging', () => {
      // ARRANGE
      const { result } = renderHook(() => useSwipeGestureHandler(defaultProps))
      
      const moveEvent = {
        touches: [{ clientX: 300 }]
      } as React.TouchEvent

      // ACT - Try to move without starting
      act(() => {
        result.current.handleTouchMove(moveEvent)
      })

      // ASSERT
      expect(result.current.swipeState.dragOffset).toBe(0)
      expect(result.current.swipeState.swipeDirection).toBe(null)
    })
  })

  describe('Touch End', () => {
    it('should navigate on distance threshold (35% of screen)', () => {
      // ARRANGE
      const { result } = renderHook(() => useSwipeGestureHandler(defaultProps))
      
      const startEvent = {
        touches: [{ clientX: 500 }]
      } as React.TouchEvent

      const endEvent = {
        changedTouches: [{ clientX: 150 }] // 350px left swipe (350px distance)
      } as React.TouchEvent

      // ACT
      act(() => {
        result.current.handleTouchStart(startEvent)
      })
      
      act(() => {
        result.current.handleTouchEnd(endEvent)
      })

      // ASSERT
      // Left swipe (positive distance) should go backward (direction -1)
      // currentIndex 1 + (-1) = 0
      expect(mockOnNavigate).toHaveBeenCalledWith(0)
    })

    it('should navigate on velocity threshold (300px/s)', () => {
      // ARRANGE
      const startTime = Date.now()
      jest.spyOn(Date, 'now')
        .mockReturnValueOnce(startTime) // touchstart time
        .mockReturnValueOnce(startTime + 100) // touchend time

      const { result } = renderHook(() => useSwipeGestureHandler(defaultProps))
      
      const startEvent = {
        touches: [{ clientX: 500 }]
      } as React.TouchEvent

      const endEvent = {
        changedTouches: [{ clientX: 460 }] // 40px left swipe in 100ms = 400px/s velocity
      } as React.TouchEvent

      // ACT
      act(() => {
        result.current.handleTouchStart(startEvent)
      })
      
      act(() => {
        result.current.handleTouchEnd(endEvent)
      })

      // ASSERT
      // Left swipe (positive distance) should go backward (direction -1)
      // currentIndex 1 + (-1) = 0
      expect(mockOnNavigate).toHaveBeenCalledWith(0)
      
      // Cleanup
      jest.restoreAllMocks()
    })

    it('should not navigate below both thresholds', () => {
      // ARRANGE
      const startTime = Date.now()
      jest.spyOn(Date, 'now')
        .mockReturnValueOnce(startTime) // touchstart time
        .mockReturnValueOnce(startTime + 200) // touchend time (slow)

      const { result } = renderHook(() => useSwipeGestureHandler(defaultProps))
      
      const startEvent = {
        touches: [{ clientX: 500 }]
      } as React.TouchEvent

      const endEvent = {
        changedTouches: [{ clientX: 450 }] // 50px in 200ms = 250px/s (below thresholds)
      } as React.TouchEvent

      // ACT
      act(() => {
        result.current.handleTouchStart(startEvent)
      })
      
      act(() => {
        result.current.handleTouchEnd(endEvent)
      })

      // ASSERT
      expect(mockOnNavigate).not.toHaveBeenCalled()
      
      // Cleanup
      jest.restoreAllMocks()
    })

    it('should handle right swipe to go to next property', () => {
      // ARRANGE
      const { result } = renderHook(() => useSwipeGestureHandler(defaultProps))
      
      const startEvent = {
        touches: [{ clientX: 200 }]
      } as React.TouchEvent

      const endEvent = {
        changedTouches: [{ clientX: 550 }] // 350px right swipe (negative distance)
      } as React.TouchEvent

      // ACT
      act(() => {
        result.current.handleTouchStart(startEvent)
      })
      
      act(() => {
        result.current.handleTouchEnd(endEvent)
      })

      // ASSERT
      // Right swipe (negative distance) should go forward (direction +1)
      // currentIndex 1 + 1 = 2
      expect(mockOnNavigate).toHaveBeenCalledWith(2)
    })

    it('should not navigate beyond boundaries (at first index)', () => {
      // ARRANGE
      const firstIndexProps = { ...defaultProps, currentIndex: 0 }
      const { result } = renderHook(() => useSwipeGestureHandler(firstIndexProps))
      
      const startEvent = {
        touches: [{ clientX: 500 }]
      } as React.TouchEvent

      const endEvent = {
        changedTouches: [{ clientX: 150 }] // 350px left swipe (would go to -1)
      } as React.TouchEvent

      // ACT
      act(() => {
        result.current.handleTouchStart(startEvent)
      })
      
      act(() => {
        result.current.handleTouchEnd(endEvent)
      })

      // ASSERT
      expect(mockOnNavigate).not.toHaveBeenCalled()
    })

    it('should not navigate beyond boundaries (at last index)', () => {
      // ARRANGE
      const lastIndexProps = { ...defaultProps, currentIndex: 2 }
      const { result } = renderHook(() => useSwipeGestureHandler(lastIndexProps))
      
      const startEvent = {
        touches: [{ clientX: 200 }]
      } as React.TouchEvent

      const endEvent = {
        changedTouches: [{ clientX: 550 }] // 350px right swipe (would go to 3)
      } as React.TouchEvent

      // ACT
      act(() => {
        result.current.handleTouchStart(startEvent)
      })
      
      act(() => {
        result.current.handleTouchEnd(endEvent)
      })

      // ASSERT
      expect(mockOnNavigate).not.toHaveBeenCalled()
    })

    it('should reset swipe state after touch end', () => {
      // ARRANGE
      const { result } = renderHook(() => useSwipeGestureHandler(defaultProps))
      
      const startEvent = {
        touches: [{ clientX: 500 }]
      } as React.TouchEvent

      const endEvent = {
        changedTouches: [{ clientX: 450 }] // Small swipe that won't navigate
      } as React.TouchEvent

      // ACT
      act(() => {
        result.current.handleTouchStart(startEvent)
      })
      
      act(() => {
        result.current.handleTouchEnd(endEvent)
      })

      // ASSERT - State should be reset
      expect(result.current.swipeState).toEqual({
        touchStartX: null,
        touchStartTime: null,
        dragOffset: 0,
        isDragging: false,
        swipeDirection: null,
        swipeProgress: 0
      })
    })

    it('should handle missing touch data gracefully', () => {
      // ARRANGE
      const { result } = renderHook(() => useSwipeGestureHandler(defaultProps))
      
      // Set up invalid state (no touchStartX)
      const endEvent = {
        changedTouches: [{ clientX: 450 }]
      } as React.TouchEvent

      // ACT - End touch without proper start
      act(() => {
        result.current.handleTouchEnd(endEvent)
      })

      // ASSERT - Should not crash or navigate
      expect(mockOnNavigate).not.toHaveBeenCalled()
      expect(result.current.swipeState.isDragging).toBe(false)
    })
  })

  describe('Smooth Navigate', () => {
    it('should call onNavigate when not transitioning', () => {
      // ARRANGE
      const { result } = renderHook(() => useSwipeGestureHandler(defaultProps))

      // ACT
      act(() => {
        result.current.smoothNavigate(2)
      })

      // ASSERT
      expect(mockOnNavigate).toHaveBeenCalledWith(2)
    })

    it('should not navigate when transitioning', () => {
      // ARRANGE
      const transitioningProps = { ...defaultProps, isTransitioning: true }
      const { result } = renderHook(() => useSwipeGestureHandler(transitioningProps))

      // ACT
      act(() => {
        result.current.smoothNavigate(2)
      })

      // ASSERT
      expect(mockOnNavigate).not.toHaveBeenCalled()
    })
  })

  describe('Swipe Physics Calculations', () => {
    it('should calculate correct velocity for momentum scrolling', () => {
      // ARRANGE
      const startTime = Date.now()
      jest.spyOn(Date, 'now')
        .mockReturnValueOnce(startTime) // touchstart
        .mockReturnValueOnce(startTime + 50) // touchend (50ms duration)

      const { result } = renderHook(() => useSwipeGestureHandler(defaultProps))
      
      const startEvent = {
        touches: [{ clientX: 500 }]
      } as React.TouchEvent

      const endEvent = {
        changedTouches: [{ clientX: 350 }] // 150px left swipe in 50ms = 3000px/s velocity
      } as React.TouchEvent

      // ACT
      act(() => {
        result.current.handleTouchStart(startEvent)
      })
      
      act(() => {
        result.current.handleTouchEnd(endEvent)
      })

      // ASSERT - Should navigate due to high velocity despite moderate distance
      // Left swipe (positive distance) should go backward (direction -1)
      // currentIndex 1 + (-1) = 0
      expect(mockOnNavigate).toHaveBeenCalledWith(0)
      
      jest.restoreAllMocks()
    })

    it('should use distance threshold when velocity is low', () => {
      // ARRANGE
      const startTime = Date.now()
      jest.spyOn(Date, 'now')
        .mockReturnValueOnce(startTime) // touchstart
        .mockReturnValueOnce(startTime + 1000) // touchend (1 second duration = slow)

      const { result } = renderHook(() => useSwipeGestureHandler(defaultProps))
      
      const startEvent = {
        touches: [{ clientX: 500 }]
      } as React.TouchEvent

      const endEvent = {
        changedTouches: [{ clientX: 150 }] // 350px left swipe in 1000ms = 350px/s (above distance threshold)
      } as React.TouchEvent

      // ACT
      act(() => {
        result.current.handleTouchStart(startEvent)
      })
      
      act(() => {
        result.current.handleTouchEnd(endEvent)
      })

      // ASSERT - Should navigate due to distance despite low velocity  
      // Left swipe (positive distance) should go backward (direction -1)
      // currentIndex 1 + (-1) = 0
      expect(mockOnNavigate).toHaveBeenCalledWith(0)
      
      jest.restoreAllMocks()
    })

    it('should respect 35% screen width distance threshold', () => {
      // ARRANGE
      const { result } = renderHook(() => useSwipeGestureHandler(defaultProps))
      
      const startEvent = {
        touches: [{ clientX: 500 }]
      } as React.TouchEvent

      // Test exactly 35% (350px on 1000px screen)
      const endEvent = {
        changedTouches: [{ clientX: 150 }] // Exactly 350px left swipe = 35%
      } as React.TouchEvent

      // ACT
      act(() => {
        result.current.handleTouchStart(startEvent)
      })
      
      act(() => {
        result.current.handleTouchEnd(endEvent)
      })

      // ASSERT
      // Left swipe (positive distance) should go backward (direction -1)
      // currentIndex 1 + (-1) = 0
      expect(mockOnNavigate).toHaveBeenCalledWith(0)
    })

    it('should respect 300px/s velocity threshold', () => {
      // ARRANGE
      const startTime = Date.now()
      jest.spyOn(Date, 'now')
        .mockReturnValueOnce(startTime) // touchstart
        .mockReturnValueOnce(startTime + 100) // touchend

      const { result } = renderHook(() => useSwipeGestureHandler(defaultProps))
      
      const startEvent = {
        touches: [{ clientX: 500 }]
      } as React.TouchEvent

      // Test above 300px/s threshold (31px left swipe in 100ms = 310px/s)
      const endEvent = {
        changedTouches: [{ clientX: 469 }] // 31px left swipe in 100ms = 310px/s (above threshold)
      } as React.TouchEvent

      // ACT
      act(() => {
        result.current.handleTouchStart(startEvent)
      })
      
      act(() => {
        result.current.handleTouchEnd(endEvent)
      })

      // ASSERT
      // Left swipe (positive distance) should go backward (direction -1)  
      // currentIndex 1 + (-1) = 0
      expect(mockOnNavigate).toHaveBeenCalledWith(0)
      
      jest.restoreAllMocks()
    })
  })
})