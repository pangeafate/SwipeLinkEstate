/**
 * Integration tests for property browsing user flow
 * Tests the complete property discovery and viewing experience
 */

import React from 'react'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Import pages involved in property browsing flow
import HomePage from '@/app/page'
import PropertiesPage from '@/app/properties/page'
import ClientLinkPage from '@/app/link/[code]/page'

// Mock Next.js components
jest.mock('next/link', () => {
  const MockLink = ({ children, href, ...props }: { children: React.ReactNode; href: string }) => {
    return <a href={href} {...props}>{children}</a>
  }
  MockLink.displayName = 'MockLink'
  return MockLink
})

jest.mock('next/navigation', () => ({
  useParams: () => ({ code: 'BROWSE123' })
}))

// Mock services
jest.mock('@/components/property', () => ({
  PropertyService: {
    getAllProperties: jest.fn()
  },
  PropertyCard: ({ property, onClick }: { property: any; onClick: (property: any) => void }) => (
    <div data-testid={`browse-property-card-${property.id}`} onClick={() => onClick(property)}>
      <h3>{property.address}</h3>
      <p>${property.price?.toLocaleString()}</p>
      <p>{property.bedrooms}bd, {property.bathrooms}ba</p>
    </div>
  )
}))

jest.mock('@/components/link', () => ({
  LinkService: {
    getLink: jest.fn()
  }
}))

import { PropertyService } from '@/components/property'
import { LinkService } from '@/components/link'

const mockProperties = [
  {
    id: 'browse-prop-1',
    address: '789 Sunset Boulevard',
    price: 950000,
    bedrooms: 3,
    bathrooms: 2.5,
    area_sqft: 1500,
    description: 'Stunning sunset views from every room',
    cover_image: 'sunset1.jpg',
    status: 'active'
  },
  {
    id: 'browse-prop-2',
    address: '321 Marina Way',
    price: 1750000,
    bedrooms: 4,
    bathrooms: 3.0,
    area_sqft: 2200,
    description: 'Luxury marina-front penthouse',
    cover_image: 'marina1.jpg', 
    status: 'active'
  },
  {
    id: 'browse-prop-3',
    address: '555 Beach Club Drive',
    price: 650000,
    bedrooms: 2,
    bathrooms: 2.0,
    area_sqft: 1100,
    description: 'Cozy beachside retreat',
    cover_image: 'beach1.jpg',
    status: 'active'
  }
]

const mockLinkData = {
  id: 'browse-link-1',
  code: 'BROWSE123',
  name: 'Curated Beach Properties',
  property_ids: '["browse-prop-1", "browse-prop-3"]',
  created_at: '2024-01-01T00:00:00Z',
  expires_at: null,
  properties: [mockProperties[0], mockProperties[2]]
}

describe('Property Browsing Integration Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(PropertyService.getAllProperties as jest.Mock).mockResolvedValue(mockProperties)
    ;(LinkService.getLink as jest.Mock).mockResolvedValue(mockLinkData)
  })

  it('should complete the full property discovery flow from homepage', async () => {
    const user = userEvent.setup()
    
    // STEP 1: User starts at homepage
    const { rerender } = render(<HomePage />)
    
    expect(screen.getByText('SwipeLink Estate')).toBeInTheDocument()
    expect(screen.getByText('Discover your dream property with a simple swipe')).toBeInTheDocument()
    
    // STEP 2: Navigate to properties page
    expect(screen.getByText('Browse Properties')).toBeInTheDocument()
    
    // Simulate navigation to properties page
    rerender(<PropertiesPage />)
    
    // STEP 3: Properties page loads with listings
    expect(screen.getByText('Loading...')).toBeInTheDocument()
    
    await waitFor(() => {
      expect(screen.getByText('3 Properties Available')).toBeInTheDocument()
    })
    
    // Verify all properties are displayed
    expect(screen.getByText('789 Sunset Boulevard')).toBeInTheDocument()
    expect(screen.getByText('321 Marina Way')).toBeInTheDocument()
    expect(screen.getByText('555 Beach Club Drive')).toBeInTheDocument()
    
    // STEP 4: User clicks on a property to view details
    await act(async () => {
      await user.click(screen.getByTestId('browse-property-card-browse-prop-1'))
    })
    
    // STEP 5: Property modal should open with details
    expect(screen.getAllByText('789 Sunset Boulevard')).toHaveLength(2) // Card + Modal
    expect(screen.getByText('Stunning sunset views from every room')).toBeInTheDocument()
    expect(screen.getByText('Schedule a Viewing')).toBeInTheDocument()
    
    // Verify property details in modal
    const modalContent = document.querySelector('.fixed.inset-0 .bg-white')
    expect(modalContent).toContainHTML('$950,000')
    expect(screen.getByText('1,500 sq ft')).toBeInTheDocument()
  })

  it('should handle property link sharing flow', async () => {
    // STEP 1: User accesses a shared property link
    render(<ClientLinkPage />)
    
    // Should show loading initially
    expect(screen.getByText('Loading property collection...')).toBeInTheDocument()
    
    // STEP 2: Link data loads
    await waitFor(() => {
      expect(screen.getByText('Curated Beach Properties')).toBeInTheDocument()
    })
    
    // Verify collection information
    expect(screen.getByText('2 properties curated for you')).toBeInTheDocument()
    expect(screen.getByText('Link Code: BROWSE123')).toBeInTheDocument()
    
    // STEP 3: Properties from the link are displayed
    expect(screen.getByText('789 Sunset Boulevard')).toBeInTheDocument()
    expect(screen.getByText('555 Beach Club Drive')).toBeInTheDocument()
    
    // Should not show the marina property (not in this link)
    expect(screen.queryByText('321 Marina Way')).not.toBeInTheDocument()
    
    // STEP 4: User can interact with properties
    const user = userEvent.setup()
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
    
    await act(async () => {
      await user.click(screen.getByTestId('browse-property-card-browse-prop-1'))
    })
    
    expect(consoleSpy).toHaveBeenCalledWith('Property clicked:', 'browse-prop-1')
    consoleSpy.mockRestore()
  })

  it('should handle empty property collections gracefully', async () => {
    // ARRANGE - Mock empty property collection
    const emptyLinkData = {
      ...mockLinkData,
      properties: []
    }
    ;(LinkService.getLink as jest.Mock).mockResolvedValue(emptyLinkData)
    
    // ACT
    render(<ClientLinkPage />)
    
    // ASSERT
    await waitFor(() => {
      expect(screen.getByText('Curated Beach Properties')).toBeInTheDocument()
    })
    
    expect(screen.getByText('0 properties curated for you')).toBeInTheDocument()
    expect(screen.getByText('No Properties Available')).toBeInTheDocument()
    expect(screen.getByText('This property collection is currently empty.')).toBeInTheDocument()
  })

  it('should handle network errors gracefully in property browsing', async () => {
    // ARRANGE - Mock service failure
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    ;(PropertyService.getAllProperties as jest.Mock).mockRejectedValue(new Error('Network error'))
    
    // ACT
    render(<PropertiesPage />)
    
    // ASSERT - Should handle error gracefully
    await waitFor(() => {
      expect(screen.getByText('0 Properties Available')).toBeInTheDocument()
    })
    
    expect(screen.getByText('No properties match your criteria')).toBeInTheDocument()
    expect(consoleSpy).toHaveBeenCalledWith('Error loading properties:', expect.any(Error))
    
    consoleSpy.mockRestore()
  })

  it('should handle invalid property link gracefully', async () => {
    // ARRANGE - Mock link service failure
    ;(LinkService.getLink as jest.Mock).mockRejectedValue(new Error('Link not found'))
    
    // ACT  
    render(<ClientLinkPage />)
    
    // ASSERT - Should show error state
    await waitFor(() => {
      expect(screen.getByText('Link Not Found')).toBeInTheDocument()
    })
    
    expect(screen.getByText('Link not found or expired. Please check the link code and try again.')).toBeInTheDocument()
    expect(screen.getByText('Return to Homepage')).toBeInTheDocument()
    
    // Verify return link
    const returnLink = screen.getByText('Return to Homepage')
    expect(returnLink.closest('a')).toHaveAttribute('href', '/')
  })

  it('should handle property modal interactions correctly', async () => {
    const user = userEvent.setup()
    render(<PropertiesPage />)
    
    await waitFor(() => {
      expect(screen.getByText('789 Sunset Boulevard')).toBeInTheDocument()
    })
    
    // Open modal
    await act(async () => {
      await user.click(screen.getByTestId('browse-property-card-browse-prop-1'))
    })
    
    // Modal should be open
    expect(screen.getAllByText('789 Sunset Boulevard')).toHaveLength(2)
    
    // Close modal by clicking backdrop
    const modalOverlay = document.querySelector('.fixed.inset-0.bg-black.bg-opacity-50')
    expect(modalOverlay).toBeInTheDocument()
    
    await act(async () => {
      await user.click(modalOverlay!)
    })
    
    // Modal should be closed
    expect(screen.getAllByText('789 Sunset Boulevard')).toHaveLength(1)
    
    // Open modal again
    await act(async () => {
      await user.click(screen.getByTestId('browse-property-card-browse-prop-2'))
    })
    
    // Close with X button
    await act(async () => {
      await user.click(screen.getByText('✕'))
    })
    
    // Modal should be closed
    expect(screen.getAllByText('321 Marina Way')).toHaveLength(1)
  })

  it('should maintain filter state during property browsing', async () => {
    render(<PropertiesPage />)
    
    await waitFor(() => {
      expect(screen.getByText('3 Properties Available')).toBeInTheDocument()
    })
    
    // Verify filter controls are present
    expect(screen.getByDisplayValue('All Types')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Any Price')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Any Beds')).toBeInTheDocument()
    expect(screen.getByText('Apply Filters')).toBeInTheDocument()
    
    // Verify sorting controls
    expect(screen.getByDisplayValue('Sort by: Newest')).toBeInTheDocument()
    
    // All properties should be visible initially
    expect(screen.getByText('789 Sunset Boulevard')).toBeInTheDocument()
    expect(screen.getByText('321 Marina Way')).toBeInTheDocument()
    expect(screen.getByText('555 Beach Club Drive')).toBeInTheDocument()
  })

  it('should provide consistent navigation throughout the flow', async () => {
    // Test homepage navigation
    const { rerender } = render(<HomePage />)
    
    const agentDashboardLink = screen.getByText('Agent Dashboard')
    expect(agentDashboardLink.closest('a')).toHaveAttribute('href', '/dashboard')
    
    const browsePropertiesLink = screen.getByText('Browse Properties')
    expect(browsePropertiesLink.closest('a')).toHaveAttribute('href', '/properties')
    
    // Test properties page navigation
    rerender(<PropertiesPage />)
    
    await waitFor(() => {
      expect(screen.getByText('SwipeLink Estate')).toBeInTheDocument()
    })
    
    const homeLink = screen.getByText('Home')
    expect(homeLink.closest('a')).toHaveAttribute('href', '/')
    
    const agentPortalLink = screen.getByText('Agent Portal')
    expect(agentPortalLink.closest('a')).toHaveAttribute('href', '/dashboard')
    
    // Test client link page navigation
    rerender(<ClientLinkPage />)
    
    await waitFor(() => {
      expect(screen.getByText('SwipeLink Estate')).toBeInTheDocument()
    })
    
    const logoLink = screen.getByText('SwipeLink Estate')
    expect(logoLink.closest('a')).toHaveAttribute('href', '/')
    
    const discoverMoreLink = screen.getByText('Discover More Properties →')
    expect(discoverMoreLink.closest('a')).toHaveAttribute('href', '/')
  })
})