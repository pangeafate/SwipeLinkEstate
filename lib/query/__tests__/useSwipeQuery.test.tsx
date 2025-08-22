/**
 * @jest-environment jsdom
 */

import React from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useSwipeSessionQuery, useSwipeStateMutation } from '../useSwipeQuery'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  const MockProvider = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
  MockProvider.displayName = 'MockProvider'
  return MockProvider
}

describe('useSwipeSessionQuery', () => {
  it('should fetch swipe session successfully with valid sessionId', async () => {
    // ARRANGE
    const sessionId = 'session-123'

    // ACT
    const { result } = renderHook(() => useSwipeSessionQuery(sessionId), {
      wrapper: createWrapper(),
    })

    // ASSERT
    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toBeDefined()
    expect(result.current.data?.id).toBe(sessionId)
    expect(result.current.data?.swipe_state).toEqual({
      liked: [],
      disliked: [],
      considering: [],
      viewed: [],
    })
    expect(result.current.isError).toBe(false)
  })

  it('should not fetch when sessionId is not provided', () => {
    // ACT
    const { result } = renderHook(() => useSwipeSessionQuery(''), {
      wrapper: createWrapper(),
    })

    // ASSERT
    expect(result.current.isLoading).toBe(false)
    expect(result.current.data).toBeUndefined()
    expect(result.current.fetchStatus).toBe('idle')
  })

  it('should not fetch when sessionId is whitespace', () => {
    // ACT
    const { result } = renderHook(() => useSwipeSessionQuery('   '), {
      wrapper: createWrapper(),
    })

    // ASSERT
    expect(result.current.isLoading).toBe(false)
    expect(result.current.data).toBeUndefined()
    expect(result.current.fetchStatus).toBe('idle')
  })
})

describe('useSwipeStateMutation', () => {
  it('should update swipe state successfully', async () => {
    // ARRANGE
    const { result } = renderHook(() => useSwipeStateMutation(), {
      wrapper: createWrapper(),
    })

    const swipeState = {
      liked: ['prop1', 'prop2'],
      disliked: ['prop3'],
      considering: ['prop4'],
      viewed: ['prop1', 'prop2', 'prop3', 'prop4'],
    }

    // ACT
    result.current.mutate({
      sessionId: 'session-123',
      swipeState: swipeState,
    })

    // ASSERT
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toBeDefined()
    expect(result.current.data?.id).toBe('session-123')
    expect(result.current.data?.swipe_state).toEqual(swipeState)
    expect(result.current.isError).toBe(false)
  })

  it('should handle mutation with empty swipe state', async () => {
    // ARRANGE
    const { result } = renderHook(() => useSwipeStateMutation(), {
      wrapper: createWrapper(),
    })

    const emptySwipeState = {
      liked: [],
      disliked: [],
      considering: [],
      viewed: [],
    }

    // ACT
    result.current.mutate({
      sessionId: 'empty-session',
      swipeState: emptySwipeState,
    })

    // ASSERT
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toBeDefined()
    expect(result.current.data?.swipe_state).toEqual(emptySwipeState)
  })
})