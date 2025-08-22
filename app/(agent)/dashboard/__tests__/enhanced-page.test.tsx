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

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/dashboard')
}))

// Mock AgentNavigation component
jest.mock('@/components/shared/AgentNavigation', () => {
  const MockAgentNavigation = () => {
    return (
      <nav className="flex space-x-4">
        <a href="/dashboard" className="text-gray-900">Dashboard</a>
        <a href="/links" className="text-gray-500">Links</a>
        <a href="/analytics" className="text-gray-500">Analytics</a>
      </nav>
    )
  }
  MockAgentNavigation.displayName = 'MockAgentNavigation'
  return { AgentNavigation: MockAgentNavigation }
})

// Mock React Query hooks
jest.mock('@/lib/query/useAnalyticsQuery', () => ({
  useDashboardAnalytics: jest.fn()
}))

jest.mock('@/lib/query/usePropertiesQuery', () => ({
  usePropertiesQuery: jest.fn()
}))

jest.mock('@/lib/query/useLinksQuery', () => ({
  useLinksQuery: jest.fn()
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

// Mock PropertyDebug component
jest.mock('@/components/debug/PropertyDebug', () => {
  const MockPropertyDebug = () => <div data-testid="property-debug">Debug Component</div>
  MockPropertyDebug.displayName = 'MockPropertyDebug'
  return MockPropertyDebug
})

// Mock ErrorBoundary
jest.mock('@/lib/errors/ErrorBoundary', () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}))

// Import mocked functions
import { useDashboardAnalytics } from '@/lib/query/useAnalyticsQuery'
import { usePropertiesQuery } from '@/lib/query/usePropertiesQuery'
import { useLinksQuery } from '@/lib/query/useLinksQuery'

const mockUseDashboardAnalytics = useDashboardAnalytics as jest.MockedFunction<typeof useDashboardAnalytics>
const mockUsePropertiesQuery = usePropertiesQuery as jest.MockedFunction<typeof usePropertiesQuery>
const mockUseLinksQuery = useLinksQuery as jest.MockedFunction<typeof useLinksQuery>

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

const mockAnalyticsData = {
  overview: {
    totalProperties: 3,
    activeProperties: 2,
    totalLinks: 5,
    totalViews: 248,
    totalSessions: 42,
    avgSessionDuration: 145
  },
  recentActivity: [],
  topProperties: [],
  linkPerformance: []
}

const mockLinks = [
  { id: 'link-1', code: 'ABC123', name: 'Test Link 1' },
  { id: 'link-2', code: 'XYZ789', name: 'Test Link 2' }
]

// Test wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
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

describe('Enhanced AgentDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Setup default mocks
    mockUseDashboardAnalytics.mockReturnValue({
      data: mockAnalyticsData,
      isLoading: false,
      error: null
    })
    
    mockUsePropertiesQuery.mockReturnValue({
      data: mockProperties,
      isLoading: false,
      error: null,
      refetch: jest.fn()
    })
    
    mockUseLinksQuery.mockReturnValue({
      data: mockLinks,
      isLoading: false,
      error: null
    })
  })

  describe('Rendering and Layout', () => {
    it('should render header with correct navigation', () => {
      render(<AgentDashboard />, { wrapper: createWrapper() })

      expect(screen.getByText('SwipeLink Estate')).toBeInTheDocument()
      expect(screen.getByText('Agent Dashboard')).toBeInTheDocument()
      expect(screen.getAllByText('Properties')).toHaveLength(2) // One in nav, one as section heading
      expect(screen.getByText('Links')).toBeInTheDocument()
      expect(screen.getByText('Analytics')).toBeInTheDocument()
    })

    it('should have correct navigation link destinations', () => {
      render(<AgentDashboard />, { wrapper: createWrapper() })

      const logoLink = screen.getByText('SwipeLink Estate')
      expect(logoLink.closest('a')).toHaveAttribute('href', '/')

      const linksLink = screen.getByText('Links')
      expect(linksLink.closest('a')).toHaveAttribute('href', '/links')

      const analyticsLink = screen.getByText('Analytics')
      expect(analyticsLink.closest('a')).toHaveAttribute('href', '/analytics')
    })

    it('should render debug component', () => {
      render(<AgentDashboard />, { wrapper: createWrapper() })

      expect(screen.getByTestId('property-debug')).toBeInTheDocument()
    })
  })

  describe('Analytics Dashboard', () => {
    it('should display analytics statistics correctly', () => {
      render(<AgentDashboard />, { wrapper: createWrapper() })

      expect(screen.getByText('Total Properties')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument() // Total properties count

      expect(screen.getByText('Active Links')).toBeInTheDocument()
      expect(screen.getByText('5')).toBeInTheDocument() // Total links count

      expect(screen.getByText('Total Views')).toBeInTheDocument()
      expect(screen.getByText('248')).toBeInTheDocument()

      expect(screen.getByText('Total Sessions')).toBeInTheDocument()
      expect(screen.getByText('42')).toBeInTheDocument()
      expect(screen.getByText('145s avg')).toBeInTheDocument()
    })

    it('should fallback to property data when analytics is unavailable', () => {
      mockUseDashboardAnalytics.mockReturnValue({
        data: null,
        isLoading: false,
        error: null
      })

      render(<AgentDashboard />, { wrapper: createWrapper() })

      // Should show property count from properties data
      expect(screen.getByText('3')).toBeInTheDocument() // Properties length
      expect(screen.getByText('2 active')).toBeInTheDocument() // Active properties count
    })

    it('should handle analytics loading state', () => {
      mockUseDashboardAnalytics.mockReturnValue({
        data: null,
        isLoading: true,
        error: null
      })

      render(<AgentDashboard />, { wrapper: createWrapper() })

      expect(screen.getByText('Loading properties...')).toBeInTheDocument()
    })

    it('should handle analytics error state', () => {
      mockUseDashboardAnalytics.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Analytics failed')
      })

      render(<AgentDashboard />, { wrapper: createWrapper() })

      // Should still show fallback data
      expect(screen.getByText('3')).toBeInTheDocument()
    })
  })

  describe('Properties Management', () => {
    it('should display properties correctly', () => {
      render(<AgentDashboard />, { wrapper: createWrapper() })

      expect(screen.getByText('123 Ocean Drive')).toBeInTheDocument()
      expect(screen.getByText('456 Beach Ave')).toBeInTheDocument()
      expect(screen.getByText('789 Park Lane')).toBeInTheDocument()

      expect(screen.getByTestId('agent-property-card-prop-1')).toBeInTheDocument()
      expect(screen.getByTestId('agent-property-card-prop-2')).toBeInTheDocument()
      expect(screen.getByTestId('agent-property-card-prop-3')).toBeInTheDocument()
    })

    it('should show loading state for properties', () => {
      mockUsePropertiesQuery.mockReturnValue({
        data: [],
        isLoading: true,
        error: null,
        refetch: jest.fn()
      })

      render(<AgentDashboard />, { wrapper: createWrapper() })

      expect(screen.getByText('Loading properties...')).toBeInTheDocument()
    })

    it('should show empty state when no properties', () => {
      mockUsePropertiesQuery.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
        refetch: jest.fn()
      })

      render(<AgentDashboard />, { wrapper: createWrapper() })

      expect(screen.getByText('No properties found')).toBeInTheDocument()
      expect(screen.getByText('Add Your First Property')).toBeInTheDocument()
    })

    it('should handle properties error state', () => {
      mockUsePropertiesQuery.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Properties load failed'),
        refetch: jest.fn()
      })

      render(<AgentDashboard />, { wrapper: createWrapper() })

      // Should show empty state
      expect(screen.getByText('No properties found')).toBeInTheDocument()
    })
  })

  describe('Property Selection', () => {
    it('should handle single property selection', async () => {
      const user = userEvent.setup()
      render(<AgentDashboard />, { wrapper: createWrapper() })

      await act(async () => {
        await user.click(screen.getByTestId('agent-property-card-prop-1'))
      })

      expect(screen.getByText('1 selected')).toBeInTheDocument()
      expect(screen.getByText('Create Link')).toBeInTheDocument()
    })

    it('should handle multiple property selection', async () => {
      const user = userEvent.setup()
      render(<AgentDashboard />, { wrapper: createWrapper() })

      await act(async () => {
        await user.click(screen.getByTestId('agent-property-card-prop-1'))
        await user.click(screen.getByTestId('agent-property-card-prop-2'))
      })

      expect(screen.getByText('2 selected')).toBeInTheDocument()
      expect(screen.getByText('Create Link')).toBeInTheDocument()
    })

    it('should handle property deselection', async () => {
      const user = userEvent.setup()
      render(<AgentDashboard />, { wrapper: createWrapper() })

      // Select two properties
      await act(async () => {
        await user.click(screen.getByTestId('agent-property-card-prop-1'))
        await user.click(screen.getByTestId('agent-property-card-prop-2'))
      })
      expect(screen.getByText('2 selected')).toBeInTheDocument()

      // Deselect one
      await act(async () => {
        await user.click(screen.getByTestId('agent-property-card-prop-1'))
      })
      expect(screen.getByText('1 selected')).toBeInTheDocument()

      // Deselect all
      await act(async () => {
        await user.click(screen.getByTestId('agent-property-card-prop-2'))
      })
      expect(screen.queryByText('selected')).not.toBeInTheDocument()
      expect(screen.queryByText('Create Link')).not.toBeInTheDocument()
    })

    it('should maintain selection state correctly', async () => {
      const user = userEvent.setup()
      render(<AgentDashboard />, { wrapper: createWrapper() })

      const card1 = screen.getByTestId('agent-property-card-prop-1')
      const card2 = screen.getByTestId('agent-property-card-prop-2')

      // Select property 1
      await act(async () => {
        await user.click(card1)
      })
      expect(card1).toHaveClass('selected')
      expect(card2).not.toHaveClass('selected')

      // Select property 2
      await act(async () => {
        await user.click(card2)
      })
      expect(card1).toHaveClass('selected')
      expect(card2).toHaveClass('selected')

      // Deselect property 1
      await act(async () => {
        await user.click(card1)
      })
      expect(card1).not.toHaveClass('selected')
      expect(card2).toHaveClass('selected')
    })
  })

  describe('Property Form Modal', () => {
    it('should open modal when Add Property button is clicked', async () => {
      const user = userEvent.setup()
      render(<AgentDashboard />, { wrapper: createWrapper() })

      expect(screen.queryByTestId('property-form-modal')).not.toBeInTheDocument()

      await user.click(screen.getByText('Add Property'))

      expect(screen.getByTestId('property-form-modal')).toBeInTheDocument()
      expect(screen.getByText('Add New Property')).toBeInTheDocument()
    })

    it('should open modal when Add Your First Property button is clicked', async () => {
      mockUsePropertiesQuery.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
        refetch: jest.fn()
      })

      const user = userEvent.setup()
      render(<AgentDashboard />, { wrapper: createWrapper() })

      await user.click(screen.getByText('Add Your First Property'))

      expect(screen.getByTestId('property-form-modal')).toBeInTheDocument()
    })

    it('should close modal when Cancel is clicked', async () => {
      const user = userEvent.setup()
      render(<AgentDashboard />, { wrapper: createWrapper() })

      await user.click(screen.getByText('Add Property'))
      expect(screen.getByTestId('property-form-modal')).toBeInTheDocument()

      await user.click(screen.getByText('Cancel'))
      expect(screen.queryByTestId('property-form-modal')).not.toBeInTheDocument()
    })

    it('should handle property creation and refetch', async () => {
      const mockRefetch = jest.fn()
      mockUsePropertiesQuery.mockReturnValue({
        data: mockProperties,
        isLoading: false,
        error: null,
        refetch: mockRefetch
      })

      const user = userEvent.setup()
      render(<AgentDashboard />, { wrapper: createWrapper() })

      await user.click(screen.getByText('Add Property'))
      await user.click(screen.getByText('Create Property'))

      expect(mockRefetch).toHaveBeenCalled()
      expect(screen.queryByTestId('property-form-modal')).not.toBeInTheDocument()
    })
  })

  describe('Property Edit Functionality', () => {
    it('should handle edit property action', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      const user = userEvent.setup()
      render(<AgentDashboard />, { wrapper: createWrapper() })

      const editButtons = screen.getAllByText('Edit')
      await user.click(editButtons[0])

      expect(consoleSpy).toHaveBeenCalledWith('Edit property:', 'prop-1')
      consoleSpy.mockRestore()
    })
  })

  describe('Data Integration', () => {
    it('should correctly integrate properties and links data', () => {
      render(<AgentDashboard />, { wrapper: createWrapper() })

      // Should show correct counts based on integrated data
      expect(screen.getByText('5')).toBeInTheDocument() // Links count from analytics
      expect(screen.getByText('3')).toBeInTheDocument() // Properties count
    })

    it('should handle mixed loading states correctly', () => {
      mockUseDashboardAnalytics.mockReturnValue({
        data: null,
        isLoading: true,
        error: null
      })
      
      mockUsePropertiesQuery.mockReturnValue({
        data: mockProperties,
        isLoading: false,
        error: null,
        refetch: jest.fn()
      })

      render(<AgentDashboard />, { wrapper: createWrapper() })

      // Should show loading because analytics is loading
      expect(screen.getByText('Loading properties...')).toBeInTheDocument()
    })

    it('should handle partial data correctly', () => {
      mockUseDashboardAnalytics.mockReturnValue({
        data: { overview: { totalProperties: 5, activeProperties: 3 } },
        isLoading: false,
        error: null
      })

      render(<AgentDashboard />, { wrapper: createWrapper() })

      // Should gracefully handle partial analytics data
      expect(screen.getByText('5')).toBeInTheDocument() // From analytics
      expect(screen.getByText('3 active')).toBeInTheDocument() // From analytics
      expect(screen.getAllByText('0')).toHaveLength(3) // Fallback for missing data (views, sessions, links)
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('should handle null analytics data gracefully', () => {
      mockUseDashboardAnalytics.mockReturnValue({
        data: null,
        isLoading: false,
        error: null
      })

      render(<AgentDashboard />, { wrapper: createWrapper() })

      // Should fallback to properties data
      expect(screen.getByText('3')).toBeInTheDocument()
      expect(screen.getByText('2 active')).toBeInTheDocument()
    })

    it('should handle null properties data gracefully', () => {
      mockUsePropertiesQuery.mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
        refetch: jest.fn()
      })

      render(<AgentDashboard />, { wrapper: createWrapper() })

      expect(screen.getByText('No properties found')).toBeInTheDocument()
    })

    it('should handle null links data gracefully', () => {
      mockUseLinksQuery.mockReturnValue({
        data: null,
        isLoading: false,
        error: null
      })

      render(<AgentDashboard />, { wrapper: createWrapper() })

      // Should show 0 links from analytics, fallback to 0
      expect(screen.getByText('5')).toBeInTheDocument() // From analytics
    })

    it('should handle all data being null', () => {
      mockUseDashboardAnalytics.mockReturnValue({
        data: null,
        isLoading: false,
        error: null
      })
      
      mockUsePropertiesQuery.mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
        refetch: jest.fn()
      })
      
      mockUseLinksQuery.mockReturnValue({
        data: null,
        isLoading: false,
        error: null
      })

      render(<AgentDashboard />, { wrapper: createWrapper() })

      expect(screen.getByText('No properties found')).toBeInTheDocument()
      expect(screen.getAllByText('0')).toHaveLength(4) // All stats should show 0
    })
  })
})