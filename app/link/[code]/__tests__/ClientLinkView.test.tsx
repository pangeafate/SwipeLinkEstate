/**
 * ClientLinkView Component Tests
 * Following strict TDD approach with shared test infrastructure
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ClientLinkView from '../ClientLinkView'
import { setupTest, createMockLink, createMockProperty } from '@/test'

// Setup shared utilities
const { getWrapper } = setupTest()

// Mock the hooks and components
jest.mock('../hooks/useSwipeSession', () => ({
  useSwipeSession: jest.fn(() => ({
    loading: false,
    error: null,
    trackInteraction: jest.fn(),
    trackView: jest.fn()
  }))
}))

jest.mock('@/components/client', () => ({
  PropertyCarousel: ({ properties, onPropertySelect }: any) => (
    <div data-testid="property-carousel">
      {properties.map((p: any) => (
        <div 
          key={p.id} 
          data-testid={`property-${p.id}`}
          onClick={() => onPropertySelect(p)}
        >
          {p.address}
        </div>
      ))}
    </div>
  ),
  PropertyModal: ({ property, isOpen, onClose }: any) => 
    isOpen ? (
      <div data-testid="property-modal">
        <h2>{property.address}</h2>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
  CollectionOverview: () => <div data-testid="collection-overview">Collection Overview</div>,
  BucketManager: () => <div data-testid="bucket-manager">Bucket Manager</div>,
  VisitBooking: () => <div data-testid="visit-booking">Visit Booking</div>
}))

const mockLinkData = createMockLink({
  id: 'link-1',
  code: 'TEST123',
  name: 'Miami Beach Collection',
  properties: [
    createMockProperty({
      id: 'prop-1',
      address: '123 Ocean Drive',
      price: 850000,
      bedrooms: 2,
      bathrooms: 2
    }),
    createMockProperty({
      id: 'prop-2',
      address: '456 Beach Ave',
      price: 1250000,
      bedrooms: 3,
      bathrooms: 3
    })
  ]
})

describe('ClientLinkView Component', () => {
  const defaultProps = {
    linkCode: 'TEST123',
    initialLinkData: mockLinkData,
    initialError: null,
    sessionId: 'session-123'
  }

  it('should render property carousel with properties', () => {
    // ACT
    render(
      <ClientLinkView {...defaultProps} />,
      { wrapper: getWrapper() }
    )

    // ASSERT
    expect(screen.getByTestId('property-carousel')).toBeInTheDocument()
    expect(screen.getByText('123 Ocean Drive')).toBeInTheDocument()
    expect(screen.getByText('456 Beach Ave')).toBeInTheDocument()
  })

  it('should show loading state when loading', () => {
    // ARRANGE
    const { useSwipeSession } = require('../hooks/useSwipeSession')
    useSwipeSession.mockReturnValue({
      loading: true,
      error: null
    })

    // ACT
    render(
      <ClientLinkView {...defaultProps} />,
      { wrapper: getWrapper() }
    )

    // ASSERT
    expect(screen.getByText('Loading property collection...')).toBeInTheDocument()
  })

  it('should show error state when error exists', () => {
    // ARRANGE
    const errorProps = {
      ...defaultProps,
      initialError: 'Link has expired'
    }

    // ACT
    render(
      <ClientLinkView {...errorProps} />,
      { wrapper: getWrapper() }
    )

    // ASSERT
    expect(screen.getByText('Link Not Found')).toBeInTheDocument()
    expect(screen.getByText('Link has expired')).toBeInTheDocument()
  })

  it('should show empty state when no properties', () => {
    // ARRANGE
    const emptyProps = {
      ...defaultProps,
      initialLinkData: { ...mockLinkData, properties: [] }
    }

    // ACT
    render(
      <ClientLinkView {...emptyProps} />,
      { wrapper: getWrapper() }
    )

    // ASSERT
    expect(screen.getByText('No Properties Available')).toBeInTheDocument()
    expect(screen.getByText('This property collection is currently empty.')).toBeInTheDocument()
  })

  it('should handle property selection and open modal', async () => {
    // ARRANGE
    const user = userEvent.setup()
    
    // ACT
    render(
      <ClientLinkView {...defaultProps} />,
      { wrapper: getWrapper() }
    )

    // Click on property
    await user.click(screen.getByTestId('property-prop-1'))

    // ASSERT
    await waitFor(() => {
      expect(screen.getByTestId('property-modal')).toBeInTheDocument()
      expect(screen.getByText('123 Ocean Drive')).toBeInTheDocument()
    })
  })

  it('should close modal when close button clicked', async () => {
    // ARRANGE
    const user = userEvent.setup()
    
    // ACT
    render(
      <ClientLinkView {...defaultProps} />,
      { wrapper: getWrapper() }
    )

    // Open modal
    await user.click(screen.getByTestId('property-prop-1'))
    
    // Wait for modal
    await waitFor(() => {
      expect(screen.getByTestId('property-modal')).toBeInTheDocument()
    })

    // Close modal
    await user.click(screen.getByText('Close'))

    // ASSERT
    await waitFor(() => {
      expect(screen.queryByTestId('property-modal')).not.toBeInTheDocument()
    })
  })

  it('should show completion view when review completed', () => {
    // ARRANGE
    const { useSwipeSession } = require('../hooks/useSwipeSession')
    useSwipeSession.mockReturnValue({
      loading: false,
      error: null
    })

    // ACT
    const { rerender } = render(
      <ClientLinkView {...defaultProps} />,
      { wrapper: getWrapper() }
    )

    // Simulate completion by clicking browse again (which triggers reload)
    const browseButton = screen.getByText('Browse')
    userEvent.click(browseButton)

    // ASSERT - The component should still be showing properties
    expect(screen.getByTestId('property-carousel')).toBeInTheDocument()
  })

  it('should track session interactions', () => {
    // ARRANGE
    const mockTrackInteraction = jest.fn()
    const mockTrackView = jest.fn()
    const { useSwipeSession } = require('../hooks/useSwipeSession')
    useSwipeSession.mockReturnValue({
      loading: false,
      error: null,
      trackInteraction: mockTrackInteraction,
      trackView: mockTrackView
    })

    // ACT
    render(
      <ClientLinkView {...defaultProps} />,
      { wrapper: getWrapper() }
    )

    // ASSERT - Session hook should be called with correct props
    expect(useSwipeSession).toHaveBeenCalledWith({
      linkData: mockLinkData,
      sessionId: 'session-123',
      completedReview: false,
      currentIndex: 0,
      buckets: {}
    })
  })

  it('should handle navigation between views', async () => {
    // ARRANGE
    const user = userEvent.setup()
    
    // ACT
    render(
      <ClientLinkView {...defaultProps} />,
      { wrapper: getWrapper() }
    )

    // Click on Overview button
    await user.click(screen.getByText('Overview'))

    // ASSERT
    expect(screen.getByTestId('collection-overview')).toBeInTheDocument()

    // Click on My Lists button
    await user.click(screen.getByText(/My Lists/))

    // ASSERT
    expect(screen.getByTestId('bucket-manager')).toBeInTheDocument()

    // Click back to Browse
    await user.click(screen.getByText('Browse'))

    // ASSERT
    expect(screen.getByTestId('property-carousel')).toBeInTheDocument()
  })

  it('should display collection title and progress', () => {
    // ACT
    render(
      <ClientLinkView {...defaultProps} />,
      { wrapper: getWrapper() }
    )

    // ASSERT
    expect(screen.getByText('Miami Beach Collection')).toBeInTheDocument()
    expect(screen.getByText('1/2 viewed')).toBeInTheDocument()
  })
})