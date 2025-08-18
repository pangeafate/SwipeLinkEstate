import React from 'react'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ClientLinkPage from '../page'

// Mock Next.js useParams
const mockParams = { code: 'TEST123' }
jest.mock('next/navigation', () => ({
  useParams: () => mockParams
}))

// Mock LinkService
jest.mock('@/components/link', () => ({
  LinkService: {
    getLink: jest.fn()
  }
}))

// Mock PropertyCard
jest.mock('@/components/property', () => ({
  PropertyCard: ({ property, onClick }: { property: any; onClick: (property: any) => void }) => (
    <div data-testid={`property-card-${property.id}`} onClick={() => onClick(property)}>
      <h3>{property.address}</h3>
      <p>${property.price?.toLocaleString()}</p>
    </div>
  )
}))

import { LinkService } from '@/components/link'

const mockLinkData = {
  id: 'link-1',
  code: 'TEST123',
  name: 'Miami Beach Collection',
  property_ids: '["prop-1", "prop-2"]',
  created_at: '2024-01-01T00:00:00Z',
  expires_at: null,
  properties: [
    {
      id: 'prop-1',
      address: '123 Ocean Drive',
      price: 850000,
      bedrooms: 2,
      bathrooms: 2.0,
      area_sqft: 1200,
      cover_image: 'image1.jpg',
      status: 'active'
    },
    {
      id: 'prop-2',
      address: '456 Beach Ave',
      price: 1250000,
      bedrooms: 3,
      bathrooms: 2.5,
      area_sqft: 1800,
      cover_image: 'image2.jpg',
      status: 'active'
    }
  ]
}

describe('ClientLinkPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(LinkService.getLink as jest.Mock).mockResolvedValue(mockLinkData)
  })

  it('should show loading state initially', () => {
    // ACT
    render(<ClientLinkPage />)

    // ASSERT
    expect(screen.getByText('Loading property collection...')).toBeInTheDocument()
    // The spinner div doesn't have a role by default, let's check for the spinner element
    expect(document.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('should load and display link data successfully', async () => {
    // ACT
    render(<ClientLinkPage />)

    // ASSERT - Header should appear after loading
    await waitFor(() => {
      expect(screen.getByText('SwipeLink Estate')).toBeInTheDocument()
    })

    // Check for both instances of 'Property Collection' - one in header nav, one as heading
    expect(screen.getAllByText('Property Collection')).toHaveLength(1) // Only in header nav when name is provided
    expect(screen.getByText('Miami Beach Collection')).toBeInTheDocument()
    expect(screen.getByText('2 properties curated for you')).toBeInTheDocument()
    expect(screen.getByText('Link Code: TEST123')).toBeInTheDocument()

    // ASSERT - Properties should be displayed
    expect(screen.getByText('123 Ocean Drive')).toBeInTheDocument()
    expect(screen.getByText('456 Beach Ave')).toBeInTheDocument()
    expect(screen.getByText('$850,000')).toBeInTheDocument()
    expect(screen.getByText('$1,250,000')).toBeInTheDocument()
  })

  it('should display default collection name when no name provided', async () => {
    // ARRANGE
    const linkDataWithoutName = { ...mockLinkData, name: null }
    ;(LinkService.getLink as jest.Mock).mockResolvedValue(linkDataWithoutName)

    // ACT
    render(<ClientLinkPage />)

    // ASSERT
    await waitFor(() => {
      // Should have 'Property Collection' in both header nav and as the main title when no name is provided
      expect(screen.getAllByText('Property Collection')).toHaveLength(2)
    })
  })

  it('should handle singular property count correctly', async () => {
    // ARRANGE
    const linkDataWithOneProperty = {
      ...mockLinkData,
      properties: [mockLinkData.properties[0]]
    }
    ;(LinkService.getLink as jest.Mock).mockResolvedValue(linkDataWithOneProperty)

    // ACT
    render(<ClientLinkPage />)

    // ASSERT
    await waitFor(() => {
      expect(screen.getByText('1 property curated for you')).toBeInTheDocument()
    })
  })

  it('should show empty state when no properties in collection', async () => {
    // ARRANGE
    const emptyLinkData = {
      ...mockLinkData,
      properties: []
    }
    ;(LinkService.getLink as jest.Mock).mockResolvedValue(emptyLinkData)

    // ACT
    render(<ClientLinkPage />)

    // ASSERT
    await waitFor(() => {
      expect(screen.getByText('No Properties Available')).toBeInTheDocument()
    })

    expect(screen.getByText('This property collection is currently empty.')).toBeInTheDocument()
    expect(screen.getByText('0 properties curated for you')).toBeInTheDocument()
  })

  it('should show error state when link not found', async () => {
    // ARRANGE
    ;(LinkService.getLink as jest.Mock).mockRejectedValue(new Error('Not found'))

    // ACT
    render(<ClientLinkPage />)

    // ASSERT
    await waitFor(() => {
      expect(screen.getByText('Link Not Found')).toBeInTheDocument()
    })

    expect(screen.getByText('Link not found or expired. Please check the link code and try again.')).toBeInTheDocument()
    expect(screen.getByText('Return to Homepage')).toBeInTheDocument()

    // Check that the return link goes to homepage
    const returnLink = screen.getByText('Return to Homepage')
    expect(returnLink.closest('a')).toHaveAttribute('href', '/')
  })

  it('should handle property click events', async () => {
    // ARRANGE
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
    const user = userEvent.setup()
    render(<ClientLinkPage />)

    await waitFor(() => {
      expect(screen.getByText('123 Ocean Drive')).toBeInTheDocument()
    })

    // ACT - Click on first property
    await act(async () => {
      await user.click(screen.getByTestId('property-card-prop-1'))
    })

    // ASSERT
    expect(consoleSpy).toHaveBeenCalledWith('Property clicked:', 'prop-1')
    consoleSpy.mockRestore()
  })

  it('should call LinkService with correct code', () => {
    // ACT
    render(<ClientLinkPage />)

    // ASSERT
    expect(LinkService.getLink).toHaveBeenCalledWith('TEST123')
  })

  it('should handle different link codes from params', () => {
    // ARRANGE
    const originalParams = mockParams.code
    mockParams.code = 'DIFFERENT123'

    // ACT
    render(<ClientLinkPage />)

    // ASSERT
    expect(LinkService.getLink).toHaveBeenCalledWith('DIFFERENT123')

    // Restore original params
    mockParams.code = originalParams
  })

  it('should not make API call without link code', () => {
    // ARRANGE
    const originalCode = mockParams.code
    // @ts-ignore - Testing edge case
    mockParams.code = undefined

    // ACT
    render(<ClientLinkPage />)

    // ASSERT
    expect(LinkService.getLink).not.toHaveBeenCalled()

    // Restore
    mockParams.code = originalCode
  })

  it('should render footer with contact information', async () => {
    // ACT
    render(<ClientLinkPage />)

    // ASSERT
    await waitFor(() => {
      expect(screen.getByText('SwipeLink Estate')).toBeInTheDocument()
    })

    expect(screen.getByText('Interested in these properties? Contact your agent for more information.')).toBeInTheDocument()
    expect(screen.getByText('Discover More Properties →')).toBeInTheDocument()

    const discoverLink = screen.getByText('Discover More Properties →')
    expect(discoverLink.closest('a')).toHaveAttribute('href', '/')
  })

  it('should have correct page structure and accessibility', async () => {
    // ACT
    render(<ClientLinkPage />)

    // ASSERT
    await waitFor(() => {
      expect(screen.getByRole('banner')).toBeInTheDocument() // header
    })

    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('should apply correct CSS classes for styling', async () => {
    // ACT
    const { container } = render(<ClientLinkPage />)

    // ASSERT
    await waitFor(() => {
      expect(container.querySelector('.min-h-screen.bg-gray-50')).toBeInTheDocument()
    })

    expect(container.querySelector('header.bg-white.shadow-sm')).toBeInTheDocument()
    expect(container.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3')).toBeInTheDocument()
  })

  it('should handle loading state correctly', () => {
    // ARRANGE - Make the promise not resolve immediately
    let resolvePromise: (value: any) => void
    const promise = new Promise(resolve => {
      resolvePromise = resolve
    })
    ;(LinkService.getLink as jest.Mock).mockReturnValue(promise)

    // ACT
    render(<ClientLinkPage />)

    // ASSERT - Should be in loading state
    expect(screen.getByText('Loading property collection...')).toBeInTheDocument()
    expect(screen.queryByText('SwipeLink Estate')).not.toBeInTheDocument()

    // Clean up the hanging promise
    resolvePromise!(mockLinkData)
  })
})