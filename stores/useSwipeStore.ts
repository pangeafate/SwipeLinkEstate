import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { SwipeState, SwipeDirection, BucketCounts } from '@/components/swipe/types'

interface SwipeStoreState {
  // Session management
  currentSessionId: string | null
  
  // Swipe state
  swipeState: SwipeState
  currentIndex: number
  
  // UI state
  isProcessing: boolean
  error: string | null

  // Actions
  initializeSession: (sessionId: string) => void
  setSwipeState: (state: SwipeState) => void
  setCurrentIndex: (index: number) => void
  
  // Swipe actions
  handleSwipeDecision: (propertyId: string, direction: SwipeDirection) => void
  handleUndo: (propertyId: string) => void
  
  // UI state actions
  setProcessing: (processing: boolean) => void
  setError: (error: string | null) => void
  
  // Computed values
  getBucketCounts: () => Omit<BucketCounts, 'remaining'>
  isComplete: (totalProperties: number) => boolean
  
  // Reset
  reset: () => void
}

const initialState = {
  currentSessionId: null,
  swipeState: {
    liked: [],
    disliked: [],
    considering: [],
    viewed: []
  },
  currentIndex: 0,
  isProcessing: false,
  error: null,
}

export const useSwipeStore = create<SwipeStoreState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Initialize swipe session
      initializeSession: (sessionId) =>
        set(
          {
            currentSessionId: sessionId,
            currentIndex: 0,
            error: null,
          },
          false,
          'initializeSession'
        ),

      // Set complete swipe state
      setSwipeState: (state) =>
        set({ swipeState: state }, false, 'setSwipeState'),

      // Set current property index
      setCurrentIndex: (index) =>
        set({ currentIndex: index }, false, 'setCurrentIndex'),

      // Handle swipe decision
      handleSwipeDecision: (propertyId, direction) =>
        set(
          (state) => {
            const newState = { ...state.swipeState }
            
            // Add to appropriate bucket based on direction
            switch (direction) {
              case 'right':
                if (!newState.liked.includes(propertyId)) {
                  newState.liked = [...newState.liked, propertyId]
                }
                break
              case 'left':
                if (!newState.disliked.includes(propertyId)) {
                  newState.disliked = [...newState.disliked, propertyId]
                }
                break
              case 'down':
                if (!newState.considering.includes(propertyId)) {
                  newState.considering = [...newState.considering, propertyId]
                }
                break
              case 'up':
                // Optional: handle up swipe if needed
                break
            }

            // Add to viewed if not already there
            if (!newState.viewed.includes(propertyId)) {
              newState.viewed = [...newState.viewed, propertyId]
            }

            return {
              swipeState: newState,
              currentIndex: state.currentIndex + 1,
            }
          },
          false,
          'handleSwipeDecision'
        ),

      // Handle undo action
      handleUndo: (propertyId) =>
        set(
          (state) => {
            const newState = { ...state.swipeState }
            
            // Remove from all buckets
            newState.liked = newState.liked.filter(id => id !== propertyId)
            newState.disliked = newState.disliked.filter(id => id !== propertyId)
            newState.considering = newState.considering.filter(id => id !== propertyId)
            newState.viewed = newState.viewed.filter(id => id !== propertyId)

            return {
              swipeState: newState,
              currentIndex: Math.max(0, state.currentIndex - 1),
            }
          },
          false,
          'handleUndo'
        ),

      // Set processing state
      setProcessing: (processing) =>
        set({ isProcessing: processing }, false, 'setProcessing'),

      // Set error state
      setError: (error) =>
        set({ error }, false, 'setError'),

      // Get bucket counts
      getBucketCounts: () => {
        const { swipeState } = get()
        return {
          liked: swipeState.liked.length,
          disliked: swipeState.disliked.length,
          considering: swipeState.considering.length,
        }
      },

      // Check if swipe session is complete
      isComplete: (totalProperties) => {
        const { currentIndex } = get()
        return currentIndex >= totalProperties
      },

      // Reset store to initial state
      reset: () =>
        set(initialState, false, 'reset'),
    }),
    {
      name: 'swipe-store',
    }
  )
)