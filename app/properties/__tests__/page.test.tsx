import React from 'react'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PropertiesPage from '../page'

// Mock Next.js Link component
jest.mock('next/link', () => {
  const MockLink = ({ children, href, ...props }: { children: React.ReactNode; href: string }) => {
    return <a href={href} {...props}>{children}</a>
  }
  MockLink.displayName = 'MockLink'
  return MockLink
})

// Mock PropertyService
jest.mock('@/components/property', () => {
  const MockPropertyCard = ({ property, onClick }: { property: any; onClick: (p: any) => void }) => (
    <div data-testid={`property-card-${property.id}`} onClick={() => onClick(property)}>
      <h3>{property.address}</h3>
      <p data-testid={`property-price-${property.id}`}>${property.price?.toLocaleString()}</p>
    </div>
  )
  MockPropertyCard.displayName = 'MockPropertyCard'
  
  return {
    PropertyService: {
      getAllProperties: jest.fn()
    },
    PropertyCard: MockPropertyCard
  }
})

import { PropertyService } from '@/components/property'

const mockProperties = [
  {
    id: 'prop-1',
    address: '123 Ocean Drive',
    price: 850000,
    bedrooms: 2,
    bathrooms: 2.0,
    area_sqft: 1200,
    description: 'Beautiful oceanfront apartment',
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
    description: 'Luxury beachside condo',
    cover_image: 'image2.jpg',
    status: 'active'
  }
]

describe('PropertiesPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(PropertyService.getAllProperties as jest.Mock).mockResolvedValue(mockProperties)
  })

  it('should render page header and navigation correctly', async () => {
    // ACT
    render(<PropertiesPage />)

    // ASSERT - Header elements
    expect(screen.getByText('SwipeLink Estate')).toBeInTheDocument()
    expect(screen.getByText('Discover Your Dream Property')).toBeInTheDocument()
    expect(screen.getByText('Browse through our curated collection of premium properties in Miami Beach')).toBeInTheDocument()

    // ASSERT - Navigation links
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Browse')).toBeInTheDocument()
    expect(screen.getByText('Agent Portal')).toBeInTheDocument()
  })

  it('should show loading state initially and then display properties', async () => {
    // Use a slow mock to capture loading state
    ;(PropertyService.getAllProperties as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(mockProperties), 100))
    )

    // ACT
    render(<PropertiesPage />)

    // ASSERT - Loading state should be visible immediately
    expect(screen.getByText('Loading amazing properties...')).toBeInTheDocument()
    expect(screen.queryByText('123 Ocean Drive')).not.toBeInTheDocument()

    // ASSERT - Properties loaded after loading completes
    await waitFor(() => {
      expect(screen.getByText('2 Properties Available')).toBeInTheDocument()
    }, { timeout: 3000 })

    expect(screen.getByText('123 Ocean Drive')).toBeInTheDocument()
    expect(screen.getByText('456 Beach Ave')).toBeInTheDocument()
    expect(screen.queryByText('Loading amazing properties...')).not.toBeInTheDocument()
  })

  it('should handle property loading error gracefully', async () => {
    // ARRANGE
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    ;(PropertyService.getAllProperties as jest.Mock).mockRejectedValue(new Error('Load failed'))

    // ACT
    await act(async () => {
      render(<PropertiesPage />)
    })

    // ASSERT
    await waitFor(() => {
      expect(screen.getByText('0 Properties Available')).toBeInTheDocument()
    })

    expect(consoleSpy).toHaveBeenCalledWith('Error loading properties:', expect.any(Error))
    consoleSpy.mockRestore()
  })

  it('should show empty state when no properties available', async () => {
    // ARRANGE
    ;(PropertyService.getAllProperties as jest.Mock).mockResolvedValue([])

    // ACT
    await act(async () => {
      render(<PropertiesPage />)
    })

    // ASSERT
    await waitFor(() => {
      expect(screen.getByText('0 Properties Available')).toBeInTheDocument()
    })

    expect(screen.getByText('No properties match your criteria')).toBeInTheDocument()
    expect(screen.getByText('Reset Filters')).toBeInTheDocument()
  })

  it('should render filter controls', async () => {
    // ACT
    render(<PropertiesPage />)

    // ASSERT - Filter dropdowns
    expect(screen.getByDisplayValue('All Types')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Any Price')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Any Beds')).toBeInTheDocument()
    expect(screen.getByText('Apply Filters')).toBeInTheDocument()

    // ASSERT - Sort dropdown
    expect(screen.getByDisplayValue('Sort by: Newest')).toBeInTheDocument()
  })

  it('should open property detail modal when property clicked', async () => {
    // ARRANGE
    const user = userEvent.setup()
    await act(async () => {
      render(<PropertiesPage />)
    })

    await waitFor(() => {
      expect(screen.getByText('123 Ocean Drive')).toBeInTheDocument()
    })

    // ACT - Click on first property
    await act(async () => {
      await user.click(screen.getByTestId('property-card-prop-1'))
    })

    // ASSERT - Modal should be visible
    expect(screen.getAllByText('123 Ocean Drive')).toHaveLength(2) // One in card, one in modal
    expect(screen.getByText('Beautiful oceanfront apartment')).toBeInTheDocument()
    expect(screen.getByText('Schedule a Viewing')).toBeInTheDocument()

    // ASSERT - Property details in modal  
    // Use getAllByText for price that appears in both card and modal
    const priceElements = screen.getAllByText('$850,000')
    expect(priceElements).toHaveLength(2) // One in card, one in modal
    
    // Use more specific selectors for modal content
    const modalContent = document.querySelector('.fixed.inset-0 .bg-white')
    expect(modalContent).toBeInTheDocument()
    expect(screen.getByText('1,200 sq ft')).toBeInTheDocument()
    
    // Verify modal-specific content exists
    expect(modalContent).toContainHTML('Bedrooms:')
    expect(modalContent).toContainHTML('Bathrooms:')
  })

  it('should close property detail modal when close button clicked', async () => {
    // ARRANGE
    const user = userEvent.setup()
    await act(async () => {
      render(<PropertiesPage />)
    })

    await waitFor(() => {
      expect(screen.getByText('123 Ocean Drive')).toBeInTheDocument()
    })

    // Open modal
    await act(async () => {
      await user.click(screen.getByTestId('property-card-prop-1'))
    })

    // ACT - Close modal
    await act(async () => {
      await user.click(screen.getByText('✕'))
    })

    // ASSERT - Modal should be closed
    expect(screen.getAllByText('123 Ocean Drive')).toHaveLength(1) // Only in card
    expect(screen.queryByText('Beautiful oceanfront apartment')).not.toBeInTheDocument()
  })

  it('should close modal when clicking backdrop', async () => {
    // ARRANGE
    const user = userEvent.setup()
    await act(async () => {
      render(<PropertiesPage />)
    })

    await waitFor(() => {
      expect(screen.getByText('123 Ocean Drive')).toBeInTheDocument()
    })

    // Open modal
    await act(async () => {
      await user.click(screen.getByTestId('property-card-prop-1'))
    })

    // ACT - Click backdrop (the modal overlay)
    const modalOverlay = document.querySelector('.fixed.inset-0.bg-black.bg-opacity-50')
    expect(modalOverlay).toBeInTheDocument()
    
    await act(async () => {
      await user.click(modalOverlay!)
    })

    // ASSERT - Modal should be closed
    expect(screen.getAllByText('123 Ocean Drive')).toHaveLength(1) // Only in card
  })

  it('should have correct navigation link destinations', () => {
    // ACT
    render(<PropertiesPage />)

    // ASSERT - Check link hrefs
    const homeLink = screen.getByText('Home')
    expect(homeLink.closest('a')).toHaveAttribute('href', '/')

    const logoLink = screen.getByText('SwipeLink Estate')
    expect(logoLink.closest('a')).toHaveAttribute('href', '/')

    const agentPortalLink = screen.getByText('Agent Portal')
    expect(agentPortalLink.closest('a')).toHaveAttribute('href', '/dashboard')
  })

  it('should render footer with copyright', () => {
    // ACT
    render(<PropertiesPage />)

    // ASSERT
    expect(screen.getByText('© 2024 SwipeLink Estate. Built with Next.js & Supabase.')).toBeInTheDocument()
  })
})