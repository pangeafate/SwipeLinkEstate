/**
 * @jest-environment jsdom
 */

import React from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { useLinksQuery, useLinkQuery, useCreateLinkMutation } from '../useLinksQuery'
import { LinkService } from '@/components/link'
import { setupTest } from '@/test/utils/testSetup'
import { fixtures } from '@/test/fixtures'

// Mock LinkService
jest.mock('@/components/link', () => ({
  LinkService: {
    getAgentLinksSimple: jest.fn(),
    getLink: jest.fn(),
    createLink: jest.fn(),
  }
}))

const mockLinks = fixtures.links.slice(0, 1)
const mockLinkWithProperties = {
  ...mockLinks[0],
  properties: fixtures.properties.slice(0, 2),
}

describe('useLinksQuery', () => {
  const { getWrapper } = setupTest({ createQueryClient: true, suppressConsoleErrors: true })

  it('should fetch all links successfully', async () => {
    // ARRANGE
    ;(LinkService.getAgentLinksSimple as jest.Mock).mockResolvedValue(mockLinks)

    // ACT
    const { result } = renderHook(() => useLinksQuery(), {
      wrapper: getWrapper(),
    })

    // ASSERT
    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toEqual(mockLinks)
    expect(result.current.isError).toBe(false)
    expect(LinkService.getAgentLinksSimple).toHaveBeenCalledTimes(1)
  })

  it('should handle error when fetching links', async () => {
    // ARRANGE
    const error = new Error('Failed to fetch links')
    ;(LinkService.getAgentLinksSimple as jest.Mock).mockRejectedValue(error)

    // ACT
    const { result } = renderHook(() => useLinksQuery(), {
      wrapper: getWrapper(),
    })

    // ASSERT
    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toBe(error)
    expect(result.current.data).toBeUndefined()
  })
})

describe('useLinkQuery', () => {
  const { getWrapper } = setupTest({ createQueryClient: true, suppressConsoleErrors: true })

  it('should fetch single link successfully', async () => {
    // ARRANGE
    const linkCode = 'ABC123'
    ;(LinkService.getLink as jest.Mock).mockResolvedValue(mockLinkWithProperties)

    // ACT
    const { result } = renderHook(() => useLinkQuery(linkCode), {
      wrapper: getWrapper(),
    })

    // ASSERT
    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toEqual(mockLinkWithProperties)
    expect(LinkService.getLink).toHaveBeenCalledWith(linkCode)
  })

  it('should not fetch when linkCode is not provided', () => {
    // ARRANGE - Clear mocks first
    jest.clearAllMocks()
    
    // ACT
    const { result } = renderHook(() => useLinkQuery(''), {
      wrapper: getWrapper(),
    })

    // ASSERT
    expect(result.current.isLoading).toBe(false)
    expect(result.current.data).toBeUndefined()
    expect(LinkService.getLink).not.toHaveBeenCalled()
  })
})

describe('useCreateLinkMutation', () => {
  const { getWrapper } = setupTest({ createQueryClient: true, suppressConsoleErrors: true })

  it('should create link successfully', async () => {
    // ARRANGE
    const newLink = mockLinks[0]
    ;(LinkService.createLink as jest.Mock).mockResolvedValue(newLink)

    const { result } = renderHook(() => useCreateLinkMutation(), {
      wrapper: getWrapper(),
    })

    // ACT
    result.current.mutate({
      propertyIds: ['prop1', 'prop2'],
      name: 'Test Link',
    })

    // ASSERT
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(newLink)
    expect(LinkService.createLink).toHaveBeenCalledWith(['prop1', 'prop2'], 'Test Link')
  })

  it('should handle error when creating link', async () => {
    // ARRANGE
    const error = new Error('Failed to create link')
    ;(LinkService.createLink as jest.Mock).mockRejectedValue(error)

    const { result } = renderHook(() => useCreateLinkMutation(), {
      wrapper: getWrapper(),
    })

    // ACT
    result.current.mutate({
      propertyIds: ['prop1'],
      name: 'Test Link',
    })

    // ASSERT
    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toBe(error)
  })
})