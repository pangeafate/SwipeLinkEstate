/**
 * Link Page Server Component Tests
 * Testing SSR/ISR functionality
 */

import { notFound } from 'next/navigation'
import LinkPage, { generateStaticParams } from '../page.server'
import { LinkService } from '@/components/link'
import { createMockLink, createMockProperty } from '@/test'

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  notFound: jest.fn()
}))

// Mock LinkService
jest.mock('@/components/link', () => ({
  LinkService: {
    getLink: jest.fn()
  }
}))

// Mock ClientLinkView component
jest.mock('../ClientLinkView', () => {
  return function MockClientLinkView(props: any) {
    return (
      <div data-testid="client-link-view">
        <div>{props.linkCode}</div>
        <div>{props.sessionId}</div>
        {props.initialError && <div>{props.initialError}</div>}
        {props.initialLinkData && <div>{props.initialLinkData.name}</div>}
      </div>
    )
  }
})

// Mock crypto for session ID generation
const mockRandomUUID = jest.fn(() => 'mock-uuid-123')
global.crypto = {
  randomUUID: mockRandomUUID
} as any

const mockLinkData = createMockLink({
  id: 'link-1',
  code: 'TEST123',
  name: 'Test Collection',
  status: 'active',
  expires_at: null,
  properties: [
    createMockProperty({ id: 'prop-1' }),
    createMockProperty({ id: 'prop-2' })
  ]
})

describe('LinkPage Server Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should fetch link data and render client component', async () => {
    // ARRANGE
    ;(LinkService.getLink as jest.Mock).mockResolvedValue(mockLinkData)

    // ACT
    const result = await LinkPage({
      params: { code: 'TEST123' }
    })

    // ASSERT
    expect(LinkService.getLink).toHaveBeenCalledWith('TEST123')
    expect(result).toBeTruthy()
    expect(result.props.linkCode).toBe('TEST123')
    expect(result.props.initialLinkData).toEqual(mockLinkData)
    expect(result.props.sessionId).toBe('mock-uuid-123')
    expect(result.props.initialError).toBeNull()
  })

  it('should call notFound for invalid link code', async () => {
    // ARRANGE & ACT
    await LinkPage({
      params: { code: '' }
    })

    // ASSERT
    expect(notFound).toHaveBeenCalled()
    expect(LinkService.getLink).not.toHaveBeenCalled()
  })

  it('should call notFound for short link code', async () => {
    // ARRANGE & ACT
    await LinkPage({
      params: { code: '123' } // Less than 6 characters
    })

    // ASSERT
    expect(notFound).toHaveBeenCalled()
    expect(LinkService.getLink).not.toHaveBeenCalled()
  })

  it('should call notFound when link not found', async () => {
    // ARRANGE
    ;(LinkService.getLink as jest.Mock).mockResolvedValue(null)

    // ACT
    await LinkPage({
      params: { code: 'NOTFOUND' }
    })

    // ASSERT
    expect(LinkService.getLink).toHaveBeenCalledWith('NOTFOUND')
    expect(notFound).toHaveBeenCalled()
  })

  it('should handle expired links', async () => {
    // ARRANGE
    const expiredLink = {
      ...mockLinkData,
      expires_at: new Date(Date.now() - 1000).toISOString() // Expired 1 second ago
    }
    ;(LinkService.getLink as jest.Mock).mockResolvedValue(expiredLink)

    // ACT
    const result = await LinkPage({
      params: { code: 'EXPIRED' }
    })

    // ASSERT
    expect(result.props.initialError).toBe('This link has expired. Please request a new one from your agent.')
    expect(result.props.initialLinkData).toEqual(expiredLink)
  })

  it('should handle inactive links', async () => {
    // ARRANGE
    const inactiveLink = {
      ...mockLinkData,
      status: 'inactive'
    }
    ;(LinkService.getLink as jest.Mock).mockResolvedValue(inactiveLink)

    // ACT
    const result = await LinkPage({
      params: { code: 'INACTIVE' }
    })

    // ASSERT
    expect(result.props.initialError).toBe('This link is no longer active. Please contact your agent for assistance.')
    expect(result.props.initialLinkData).toEqual(inactiveLink)
  })

  it('should handle LinkService errors gracefully', async () => {
    // ARRANGE
    ;(LinkService.getLink as jest.Mock).mockRejectedValue(new Error('Database error'))

    // ACT
    const result = await LinkPage({
      params: { code: 'ERROR123' }
    })

    // ASSERT
    expect(result.props.initialError).toBe('Unable to load property collection. Please try again later.')
    expect(result.props.initialLinkData).toBeNull()
  })

  it('should generate unique session IDs', async () => {
    // ARRANGE
    ;(LinkService.getLink as jest.Mock).mockResolvedValue(mockLinkData)
    let callCount = 0
    mockRandomUUID.mockImplementation(() => `uuid-${++callCount}`)

    // ACT
    const result1 = await LinkPage({ params: { code: 'TEST1' } })
    const result2 = await LinkPage({ params: { code: 'TEST2' } })

    // ASSERT
    expect(result1.props.sessionId).toBe('uuid-1')
    expect(result2.props.sessionId).toBe('uuid-2')
  })

  it('should have correct revalidation time', () => {
    // ASSERT
    const pageModule = require('../page.server')
    expect(pageModule.revalidate).toBe(3600) // 1 hour
  })

  it('should return empty array for generateStaticParams', async () => {
    // ACT
    const result = await generateStaticParams()

    // ASSERT
    expect(result).toEqual([])
  })

  it('should handle missing crypto API gracefully', async () => {
    // ARRANGE
    ;(LinkService.getLink as jest.Mock).mockResolvedValue(mockLinkData)
    
    // Remove crypto API
    const originalCrypto = global.crypto
    // @ts-ignore
    delete global.crypto

    // Mock require for Node.js crypto
    jest.doMock('crypto', () => ({
      randomUUID: () => 'node-crypto-uuid'
    }))

    // ACT
    const result = await LinkPage({
      params: { code: 'TEST123' }
    })

    // ASSERT
    expect(result.props.sessionId).toMatch(/^session-\d+-[a-z0-9]+$/)

    // Restore
    global.crypto = originalCrypto
  })
})