import React from 'react'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AgentDashboard from '../page'

// Mock Next.js Link component
jest.mock('next/link', () => {
  const MockLink = ({ children, href, ...props }: { children: React.ReactNode; href: string }) => {
    return <a href={href} {...props}>{children}</a>
  }
  MockLink.displayName = 'MockLink'
  return MockLink
})

// Mock Next.js useRouter hook
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    back: jest.fn(),
  }),
}))

// Mock PropertyService
jest.mock('@/components/property', () => ({
  PropertyService: {
    getAllProperties: jest.fn()
  }
}))

// Mock PropertyCard component
jest.mock('@/components/agent/PropertyCard', () => {
  const MockPropertyCard = ({ 
    property, 
    selected, 
    onClick, 
    onEdit 
  }: { 
    property: any; 
    selected: boolean; 
    onClick: () => void; 
    onEdit: (property: any) => void 
  }) => {
    return (
      <div 
        data-testid={`agent-property-card-${property.id}`}
        className={selected ? 'selected' : ''}
        onClick={onClick}
      >
        <h3>{property.address}</h3>
        <p>${property.price?.toLocaleString()}</p>
        <p>Status: {property.status}</p>
        <button onClick={() => onEdit(property)}>Edit</button>
      </div>
    )
  }
  MockPropertyCard.displayName = 'MockPropertyCard'
  return MockPropertyCard
})

// Mock PropertyForm component
jest.mock('@/components/property/components/PropertyForm', () => {
  const MockPropertyForm = ({ 
    onPropertyCreated, 
    onCancel 
  }: { 
    onPropertyCreated: (property: any) => void; 
    onCancel: () => void 
  }) => {
    return (
      <div data-testid="property-form-modal">
        <h2>Add New Property</h2>
        <button onClick={onCancel}>Cancel</button>
        <button onClick={() => onPropertyCreated({ id: 'new-prop', address: 'Test Address' })}>
          Create Property
        </button>
      </div>
    )
  }
  MockPropertyForm.displayName = 'MockPropertyForm'
  return MockPropertyForm
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
    status: 'active',
    cover_image: 'image1.jpg'
  },
  {
    id: 'prop-2',
    address: '456 Beach Ave',
    price: 1250000,
    bedrooms: 3,
    bathrooms: 2.5,
    area_sqft: 1800,
    status: 'active',
    cover_image: 'image2.jpg'
  },
  {
    id: 'prop-3',
    address: '789 Park Lane',
    price: 650000,
    bedrooms: 1,
    bathrooms: 1.0,
    area_sqft: 900,
    status: 'inactive',
    cover_image: 'image3.jpg'
  }
]

// Test wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
      },
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

describe('AgentDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(PropertyService.getAllProperties as jest.Mock).mockResolvedValue(mockProperties)
  })

  it('should render header with navigation correctly', async () => {
    // ACT
    render(<AgentDashboard />)

    // ASSERT - Header elements
    expect(screen.getByText('SwipeLink Estate')).toBeInTheDocument()
    expect(screen.getByText('Agent Dashboard')).toBeInTheDocument()

    // ASSERT - Navigation links  
    const nav = screen.getByRole('navigation')
    expect(nav).toBeInTheDocument()
    expect(screen.getByText('Links')).toBeInTheDocument()
    expect(screen.getByText('Analytics')).toBeInTheDocument()
  })

  it('should show loading state initially', () => {
    // ACT
    render(<AgentDashboard />)

    // ASSERT
    expect(screen.getByText('Loading properties...')).toBeInTheDocument()
  })

  it('should display statistics after properties load', async () => {
    // ACT
    await act(async () => {
      render(<AgentDashboard />)
    })

    // ASSERT - Wait for properties to load and stats to update
    await waitFor(() => {
      expect(screen.getByText('Total Properties')).toBeInTheDocument()
    })

    expect(screen.getByText('Total Properties')).toBeInTheDocument()
    expect(screen.getByText('Active Listings')).toBeInTheDocument()
    expect(screen.getByText('Total Views')).toBeInTheDocument()
    expect(screen.getByText('248')).toBeInTheDocument() // This should be unique
    expect(screen.getByText('Active Links')).toBeInTheDocument()
    
    // Check for the specific stats values using more targeted approach
    // Get all elements with the statistics class and check their content
    const statCards = document.querySelectorAll('.bg-white.rounded-lg.shadow.p-6')
    expect(statCards).toHaveLength(4)
    
    // Find the Total Properties card and verify its count
    const totalPropertiesCard = Array.from(statCards).find(card => 
      card.textContent?.includes('Total Properties')
    )
    expect(totalPropertiesCard?.querySelector('.text-2xl')?.textContent).toBe('3')
    
    // Find the Active Listings card and verify its count  
    const activeListingsCard = Array.from(statCards).find(card => 
      card.textContent?.includes('Active Listings')
    )
    expect(activeListingsCard?.querySelector('.text-2xl')?.textContent).toBe('2')
  })

  it('should display properties in grid after loading', async () => {
    // ACT
    await act(async () => {
      render(<AgentDashboard />)
    })

    // ASSERT - Properties loaded
    await waitFor(() => {
      expect(screen.getByText('123 Ocean Drive')).toBeInTheDocument()
    })

    expect(screen.getByText('456 Beach Ave')).toBeInTheDocument()
    expect(screen.getByText('789 Park Lane')).toBeInTheDocument()
    
    // Check property cards are rendered
    expect(screen.getByTestId('agent-property-card-prop-1')).toBeInTheDocument()
    expect(screen.getByTestId('agent-property-card-prop-2')).toBeInTheDocument()
    expect(screen.getByTestId('agent-property-card-prop-3')).toBeInTheDocument()
  })

  it('should handle property selection correctly', async () => {
    // ARRANGE
    const user = userEvent.setup()
    await act(async () => {
      render(<AgentDashboard />)
    })

    await waitFor(() => {
      expect(screen.getByText('123 Ocean Drive')).toBeInTheDocument()
    })

    // ACT - Select first property
    await act(async () => {
      await user.click(screen.getByTestId('agent-property-card-prop-1'))
    })

    // ASSERT - Selection UI appears
    expect(screen.getByText('1 selected')).toBeInTheDocument()
    expect(screen.getByText('Create Link')).toBeInTheDocument()

    // ACT - Select second property
    await act(async () => {
      await user.click(screen.getByTestId('agent-property-card-prop-2'))
    })

    // ASSERT - Selection count updates
    expect(screen.getByText('2 selected')).toBeInTheDocument()

    // ACT - Deselect first property
    await act(async () => {
      await user.click(screen.getByTestId('agent-property-card-prop-1'))
    })

    // ASSERT - Selection count decreases
    expect(screen.getByText('1 selected')).toBeInTheDocument()
  })

  it('should hide selection UI when no properties selected', async () => {
    // ARRANGE
    const user = userEvent.setup()
    await act(async () => {
      render(<AgentDashboard />)
    })

    await waitFor(() => {
      expect(screen.getByText('123 Ocean Drive')).toBeInTheDocument()
    })

    // Initially no selection UI
    expect(screen.queryByText('selected')).not.toBeInTheDocument()
    expect(screen.queryByText('Create Link')).not.toBeInTheDocument()

    // Select and deselect a property
    await act(async () => {
      await user.click(screen.getByTestId('agent-property-card-prop-1'))
    })
    
    expect(screen.getByText('1 selected')).toBeInTheDocument()

    await act(async () => {
      await user.click(screen.getByTestId('agent-property-card-prop-1'))
    })

    // Selection UI should be hidden again
    expect(screen.queryByText('selected')).not.toBeInTheDocument()
    expect(screen.queryByText('Create Link')).not.toBeInTheDocument()
  })

  it('should show empty state when no properties available', async () => {
    // ARRANGE
    ;(PropertyService.getAllProperties as jest.Mock).mockResolvedValue([])

    // ACT
    await act(async () => {
      render(<AgentDashboard />)
    })

    // ASSERT
    await waitFor(() => {
      expect(screen.getByText('No properties found')).toBeInTheDocument()
    })

    expect(screen.getByText('Add Your First Property')).toBeInTheDocument()
    
    // Stats should show zero - find the Total Properties card specifically
    const statCards = document.querySelectorAll('.bg-white.rounded-lg.shadow.p-6')
    const totalPropertiesCard = Array.from(statCards).find(card => 
      card.textContent?.includes('Total Properties')
    )
    expect(totalPropertiesCard?.querySelector('.text-2xl')?.textContent).toBe('0')
  })

  it('should handle property loading error gracefully', async () => {
    // ARRANGE
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    ;(PropertyService.getAllProperties as jest.Mock).mockRejectedValue(new Error('Load failed'))

    // ACT
    await act(async () => {
      render(<AgentDashboard />)
    })

    // ASSERT
    await waitFor(() => {
      const statCards = document.querySelectorAll('.bg-white.rounded-lg.shadow.p-6')
      const totalPropertiesCard = Array.from(statCards).find(card => 
        card.textContent?.includes('Total Properties')
      )
      expect(totalPropertiesCard?.querySelector('.text-2xl')?.textContent).toBe('0')
    })

    expect(consoleSpy).toHaveBeenCalledWith('Error loading properties:', expect.any(Error))
    consoleSpy.mockRestore()
  })

  it('should handle edit property action', async () => {
    // ARRANGE
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
    const user = userEvent.setup()
    await act(async () => {
      render(<AgentDashboard />)
    })

    await waitFor(() => {
      expect(screen.getByText('123 Ocean Drive')).toBeInTheDocument()
    })

    // ACT - Click edit button on first property
    const editButtons = screen.getAllByText('Edit')
    await act(async () => {
      await user.click(editButtons[0])
    })

    // ASSERT
    expect(consoleSpy).toHaveBeenCalledWith('Edit property:', 'prop-1')
    consoleSpy.mockRestore()
  })

  it('should have correct navigation link destinations', () => {
    // ACT
    render(<AgentDashboard />)

    // ASSERT - Check link hrefs
    const logoLink = screen.getByText('SwipeLink Estate')
    expect(logoLink.closest('a')).toHaveAttribute('href', '/')

    const linksLink = screen.getByText('Links')
    expect(linksLink.closest('a')).toHaveAttribute('href', '/links')

    const analyticsLink = screen.getByText('Analytics')
    expect(analyticsLink.closest('a')).toHaveAttribute('href', '/analytics')
  })

  it('should display action buttons', async () => {
    // ACT
    await act(async () => {
      render(<AgentDashboard />)
    })

    // ASSERT
    await waitFor(() => {
      expect(screen.getByText('Add Property')).toBeInTheDocument()
    })

    // Use getAllByText since "Properties" appears in nav and section heading
    const propertiesTexts = screen.getAllByText('Properties')
    expect(propertiesTexts).toHaveLength(2) // One in nav, one as section heading
  })

  it('should show PropertyForm modal when Add Property button is clicked', async () => {
    // ARRANGE
    const user = userEvent.setup()
    await act(async () => {
      render(<AgentDashboard />)
    })

    await waitFor(() => {
      expect(screen.getByText('Add Property')).toBeInTheDocument()
    })

    // Verify modal is not initially visible
    expect(screen.queryByTestId('property-form-modal')).not.toBeInTheDocument()

    // ACT - Click Add Property button
    const addPropertyButton = screen.getByText('Add Property')
    await act(async () => {
      await user.click(addPropertyButton)
    })

    // ASSERT - Modal should appear
    expect(screen.getByTestId('property-form-modal')).toBeInTheDocument()
    expect(screen.getByText('Add New Property')).toBeInTheDocument()
  })

  it('should show PropertyForm modal when Add Your First Property button is clicked', async () => {
    // ARRANGE - Mock empty properties to show empty state
    ;(PropertyService.getAllProperties as jest.Mock).mockResolvedValue([])
    const user = userEvent.setup()
    
    await act(async () => {
      render(<AgentDashboard />)
    })

    await waitFor(() => {
      expect(screen.getByText('Add Your First Property')).toBeInTheDocument()
    })

    // Verify modal is not initially visible
    expect(screen.queryByTestId('property-form-modal')).not.toBeInTheDocument()

    // ACT - Click Add Your First Property button
    const addFirstPropertyButton = screen.getByText('Add Your First Property')
    await act(async () => {
      await user.click(addFirstPropertyButton)
    })

    // ASSERT - Modal should appear
    expect(screen.getByTestId('property-form-modal')).toBeInTheDocument()
    expect(screen.getByText('Add New Property')).toBeInTheDocument()
  })

  it('should close PropertyForm modal when Cancel is clicked', async () => {
    // ARRANGE
    const user = userEvent.setup()
    await act(async () => {
      render(<AgentDashboard />)
    })

    await waitFor(() => {
      expect(screen.getByText('Add Property')).toBeInTheDocument()
    })

    // ACT - Open modal
    const addPropertyButton = screen.getByText('Add Property')
    await act(async () => {
      await user.click(addPropertyButton)
    })

    expect(screen.getByTestId('property-form-modal')).toBeInTheDocument()

    // ACT - Cancel modal
    const cancelButton = screen.getByText('Cancel')
    await act(async () => {
      await user.click(cancelButton)
    })

    // ASSERT - Modal should be hidden
    expect(screen.queryByTestId('property-form-modal')).not.toBeInTheDocument()
  })

  it('should add new property and close modal when property is created', async () => {
    // ARRANGE
    const user = userEvent.setup()
    await act(async () => {
      render(<AgentDashboard />)
    })

    await waitFor(() => {
      expect(screen.getByText('Add Property')).toBeInTheDocument()
    })

    // Verify initial property count
    expect(screen.getByText('123 Ocean Drive')).toBeInTheDocument()
    expect(screen.getByText('456 Beach Ave')).toBeInTheDocument()
    expect(screen.getByText('789 Park Lane')).toBeInTheDocument()

    // ACT - Open modal
    const addPropertyButton = screen.getByText('Add Property')
    await act(async () => {
      await user.click(addPropertyButton)
    })

    expect(screen.getByTestId('property-form-modal')).toBeInTheDocument()

    // ACT - Create property
    const createButton = screen.getByText('Create Property')
    await act(async () => {
      await user.click(createButton)
    })

    // ASSERT - Modal should be hidden and new property added
    expect(screen.queryByTestId('property-form-modal')).not.toBeInTheDocument()
    expect(screen.getByText('Test Address')).toBeInTheDocument()
  })

  it('should navigate to links page with selected properties when Create Link button is clicked', async () => {
    // ARRANGE
    const user = userEvent.setup()
    
    // Clear previous mock calls
    mockPush.mockClear()
    
    await act(async () => {
      render(<AgentDashboard />, { wrapper: createWrapper() })
    })

    await waitFor(() => {
      expect(screen.getByText('123 Ocean Drive')).toBeInTheDocument()
    })

    // ACT - Select first property
    await act(async () => {
      await user.click(screen.getByTestId('agent-property-card-prop-1'))
    })

    // Verify first selection
    expect(screen.getByText('1 selected')).toBeInTheDocument()
    expect(screen.getByText('Create Link')).toBeInTheDocument()

    // ACT - Select second property  
    await act(async () => {
      await user.click(screen.getByTestId('agent-property-card-prop-2'))
    })

    // Verify both selections
    expect(screen.getByText('2 selected')).toBeInTheDocument()
    expect(screen.getByText('Create Link')).toBeInTheDocument()

    // ACT - Click Create Link button
    const createLinkButton = screen.getByText('Create Link')
    await act(async () => {
      await user.click(createLinkButton)
    })

    // ASSERT - Should navigate to links page with selected property IDs
    expect(mockPush).toHaveBeenCalledWith('/links?selected=prop-1,prop-2')
  })
})