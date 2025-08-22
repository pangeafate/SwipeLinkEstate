// Dashboard Link Creation Modal Tests
// Following TESTING-GUIDELINES.md - TDD approach with shared infrastructure

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { setupTest, createMockProperty } from '@/test'
import { SupabaseMockFactory } from '@/test/mocks'
import AgentDashboard from '../page'

// Setup shared test utilities
const { getWrapper } = setupTest()

// Mock Next.js navigation
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Mock PropertyService
jest.mock('@/components/property', () => ({
  PropertyService: {
    getAllProperties: jest.fn()
  }
}))

// Mock the query hooks to return our mock data  
jest.mock('@/lib/query/usePropertiesQuery', () => ({
  usePropertiesQuery: () => ({
    data: [
      {
        id: 'prop-1',
        address: '123 Ocean Drive',
        price: 500000,
        bedrooms: 3,
        bathrooms: 2,
        area_sqft: 1500,
        status: 'active',
        description: 'Test property 1',
        features: ['parking', 'garden'],
        cover_image: '/test1.jpg',
        images: ['/test1.jpg'],
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z'
      },
      {
        id: 'prop-2', 
        address: '456 Beach Ave',
        price: 750000,
        bedrooms: 3,
        bathrooms: 2,
        area_sqft: 1500,
        status: 'active',
        description: 'Test property 2',
        features: ['parking', 'garden'],
        cover_image: '/test2.jpg',
        images: ['/test2.jpg'],
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z'
      },
      {
        id: 'prop-3',
        address: '789 Coast Blvd',
        price: 900000,
        bedrooms: 3,
        bathrooms: 2,
        area_sqft: 1500,
        status: 'active',
        description: 'Test property 3',
        features: ['parking', 'garden'],
        cover_image: '/test3.jpg',
        images: ['/test3.jpg'],
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z'
      }
    ],
    isLoading: false,
    error: null,
    refetch: jest.fn()
  })
}))

jest.mock('@/lib/query/useLinksQuery', () => ({
  useLinksQuery: () => ({
    data: [],
    isLoading: false,
    error: null
  })
}))

jest.mock('@/lib/query/useAnalyticsQuery', () => ({
  useDashboardAnalytics: () => ({
    data: {
      overview: {
        totalProperties: 3,
        activeProperties: 3,
        totalLinks: 0,
        totalViews: 0,
        totalSessions: 0,
        avgSessionDuration: 0
      }
    },
    isLoading: false,
    error: null
  })
}))

describe('Dashboard Link Creation Modal (UX Improvement)', () => {
  beforeEach(() => {
    mockPush.mockClear()
  })

  describe('Dashboard-Integrated Modal', () => {
    it('should show link creation modal when "Create Link" button is clicked with selections', async () => {
      // ARRANGE
      render(<AgentDashboard />, { wrapper: getWrapper() })
      
      // Wait for properties to load
      await waitFor(() => {
        expect(screen.getByText('123 Ocean Drive')).toBeInTheDocument()
      })

      // Select a property
      const propertyCard = screen.getByTestId('property-card-prop-1')
      fireEvent.click(propertyCard)

      // ACT - Click Create Link button
      const createLinkButton = screen.getByRole('button', { name: /create link/i })
      fireEvent.click(createLinkButton)

      // ASSERT - Modal should open with pre-selected properties
      expect(screen.getByTestId('link-creation-modal')).toBeInTheDocument()
      expect(screen.getByText('Create Property Link')).toBeInTheDocument()
      expect(screen.getByTestId('modal-overlay')).toBeInTheDocument()
    })

    it('should preserve dashboard context when modal is open', async () => {
      // ARRANGE
      render(<AgentDashboard />, { wrapper: getWrapper() })
      
      await waitFor(() => {
        expect(screen.getByText('123 Ocean Drive')).toBeInTheDocument()
      })

      // Select multiple properties
      const propertyCard1 = screen.getByTestId('property-card-prop-1')
      const propertyCard2 = screen.getByTestId('property-card-prop-2')
      fireEvent.click(propertyCard1)
      fireEvent.click(propertyCard2)

      // ACT - Open modal
      const createLinkButton = screen.getByRole('button', { name: /create link/i })
      fireEvent.click(createLinkButton)

      // ASSERT - Dashboard should still be visible behind modal
      expect(screen.getByText('Agent Dashboard')).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: /properties/i })).toBeInTheDocument()
      
      // Property grid should still be visible (dimmed/blurred)
      expect(screen.getByTestId('properties-grid')).toBeInTheDocument()
      expect(screen.getByTestId('properties-grid')).toHaveClass('modal-backdrop-blur')
    })

    it('should close modal when clicking overlay or cancel button', async () => {
      // ARRANGE
      render(<AgentDashboard />, { wrapper: getWrapper() })
      
      await waitFor(() => {
        expect(screen.getByText('123 Ocean Drive')).toBeInTheDocument()
      })

      // Select property and open modal
      const propertyCard = screen.getByTestId('property-card-prop-1')
      fireEvent.click(propertyCard)
      const createLinkButton = screen.getByRole('button', { name: /create link/i })
      fireEvent.click(createLinkButton)

      // ACT & ASSERT - Close via cancel button
      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      fireEvent.click(cancelButton)
      
      await waitFor(() => {
        expect(screen.queryByTestId('link-creation-modal')).not.toBeInTheDocument()
      })

      // Re-open modal
      fireEvent.click(createLinkButton)
      expect(screen.getByTestId('link-creation-modal')).toBeInTheDocument()

      // ACT & ASSERT - Close via overlay click
      const modalOverlay = screen.getByTestId('modal-overlay')
      fireEvent.click(modalOverlay)
      
      await waitFor(() => {
        expect(screen.queryByTestId('link-creation-modal')).not.toBeInTheDocument()
      })
    })

    it('should not navigate away from dashboard when creating links', async () => {
      // ARRANGE
      const mockPush = jest.fn()
      jest.mock('next/navigation', () => ({
        useRouter: () => ({ push: mockPush })
      }))

      render(<AgentDashboard />, { wrapper: getWrapper() })
      
      await waitFor(() => {
        expect(screen.getByText('123 Ocean Drive')).toBeInTheDocument()
      })

      // Select property and create link
      const propertyCard = screen.getByTestId('property-card-prop-1')
      fireEvent.click(propertyCard)
      const createLinkButton = screen.getByRole('button', { name: /create link/i })
      fireEvent.click(createLinkButton)

      // ASSERT - Should not have called router.push to navigate away
      expect(mockPush).not.toHaveBeenCalled()
      expect(screen.getByTestId('link-creation-modal')).toBeInTheDocument()
    })
  })

  describe('Context Preservation', () => {
    it('should pre-populate modal with dashboard-selected properties', async () => {
      // ARRANGE
      render(<AgentDashboard />, { wrapper: getWrapper() })
      
      await waitFor(() => {
        expect(screen.getByText('123 Ocean Drive')).toBeInTheDocument()
      })

      // Select specific properties in dashboard
      const propertyCard1 = screen.getByTestId('property-card-prop-1')
      const propertyCard2 = screen.getByTestId('property-card-prop-3')
      fireEvent.click(propertyCard1)
      fireEvent.click(propertyCard2)

      // Verify selection count in dashboard
      expect(screen.getByText('2 selected')).toBeInTheDocument()

      // ACT - Open link creation modal
      const createLinkButton = screen.getByRole('button', { name: /create link/i })
      fireEvent.click(createLinkButton)

      // ASSERT - Modal should show pre-selected properties
      expect(screen.getByTestId('selected-properties-preview')).toBeInTheDocument()
      expect(screen.getByText('2 properties selected')).toBeInTheDocument()
      
      // Specific properties should be marked as selected
      expect(screen.getByTestId('selected-property-prop-1')).toBeInTheDocument()
      expect(screen.getByTestId('selected-property-prop-3')).toBeInTheDocument()
      expect(screen.queryByTestId('selected-property-prop-2')).not.toBeInTheDocument()
    })

    it('should maintain visual connection to dashboard property grid', async () => {
      // ARRANGE
      render(<AgentDashboard />, { wrapper: getWrapper() })
      
      await waitFor(() => {
        expect(screen.getByText('123 Ocean Drive')).toBeInTheDocument()
      })

      // Select properties and open modal
      const propertyCard1 = screen.getByTestId('property-card-prop-1')
      fireEvent.click(propertyCard1)
      const createLinkButton = screen.getByRole('button', { name: /create link/i })
      fireEvent.click(createLinkButton)

      // ASSERT - Dashboard elements should be visible but dimmed
      const propertiesGrid = screen.getByTestId('properties-grid')
      expect(propertiesGrid).toBeInTheDocument()
      expect(propertiesGrid).toHaveClass('modal-backdrop-blur')
      
      // Selected properties should have visual indicator connection
      const selectedProperty = screen.getByTestId('property-card-prop-1')
      expect(selectedProperty).toHaveClass('selected', 'modal-highlighted')
    })

    it('should sync property selection changes between modal and dashboard', async () => {
      // ARRANGE
      render(<AgentDashboard />, { wrapper: getWrapper() })
      
      await waitFor(() => {
        expect(screen.getByText('123 Ocean Drive')).toBeInTheDocument()
      })

      // Pre-select one property in dashboard
      const propertyCard1 = screen.getByTestId('property-card-prop-1')
      fireEvent.click(propertyCard1)
      
      // Open modal
      const createLinkButton = screen.getByRole('button', { name: /create link/i })
      fireEvent.click(createLinkButton)

      // ACT - Add another property selection within modal (will be available once modal is implemented)
      // This test expects the modal to have property selection functionality
      // For now, this will fail as the modal doesn't exist yet

      // ASSERT - Dashboard should reflect the change
      expect(screen.getByText('2 selected')).toBeInTheDocument()
      
      // Dashboard property card should show as selected
      const dashboardPropertyCard2 = screen.getByTestId('property-card-prop-2')
      expect(dashboardPropertyCard2).toHaveClass('selected')
    })
  })

  describe('One-Click Creation Flow', () => {
    it('should offer one-click link creation for simple scenarios', async () => {
      // ARRANGE
      render(<AgentDashboard />, { wrapper: getWrapper() })
      
      await waitFor(() => {
        expect(screen.getByText('123 Ocean Drive')).toBeInTheDocument()
      })

      // Select 2-3 properties (optimal range for one-click)
      const propertyCard1 = screen.getByTestId('property-card-prop-1')
      const propertyCard2 = screen.getByTestId('property-card-prop-2')
      fireEvent.click(propertyCard1)
      fireEvent.click(propertyCard2)

      // Open modal
      const createLinkButton = screen.getByRole('button', { name: /create link/i })
      fireEvent.click(createLinkButton)

      // ASSERT - One-click creation should be available
      expect(screen.getByRole('button', { name: /quick create/i })).toBeInTheDocument()
      expect(screen.getByText('Create link instantly with smart defaults')).toBeInTheDocument()
    })

    it('should create link immediately with smart defaults on quick create', async () => {
      // ARRANGE
      const user = userEvent.setup()
      render(<AgentDashboard />, { wrapper: getWrapper() })
      
      await waitFor(() => {
        expect(screen.getByText('123 Ocean Drive')).toBeInTheDocument()
      })

      // Select properties and open modal
      const propertyCard1 = screen.getByTestId('property-card-prop-1')
      const propertyCard2 = screen.getByTestId('property-card-prop-2')
      fireEvent.click(propertyCard1)
      fireEvent.click(propertyCard2)
      
      const createLinkButton = screen.getByRole('button', { name: /create link/i })
      fireEvent.click(createLinkButton)

      // ACT - Use one-click creation
      const quickCreateButton = screen.getByRole('button', { name: /quick create/i })
      await user.click(quickCreateButton)

      // ASSERT - Link should be created with smart defaults
      await waitFor(() => {
        expect(screen.getByTestId('link-success-message')).toBeInTheDocument()
        expect(screen.getByText('Link created successfully!')).toBeInTheDocument()
      })

      // Should show copyable link immediately
      expect(screen.getByTestId('copyable-link')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /copy link/i })).toBeInTheDocument()
    })
  })

  describe('Smart Defaults and Enhanced UX', () => {
    it('should suggest intelligent link names based on property data', async () => {
      // ARRANGE
      const oceanProperties = [
        createMockProperty({ 
          id: 'prop-1', 
          address: '123 Ocean Drive, Miami Beach', 
          price: 800000 
        }),
        createMockProperty({ 
          id: 'prop-2', 
          address: '456 Ocean View Blvd, Miami Beach', 
          price: 900000 
        })
      ]

      SupabaseMockFactory.createSuccessMock(oceanProperties)
      render(<AgentDashboard />, { wrapper: getWrapper() })
      
      await waitFor(() => {
        expect(screen.getByText('123 Ocean Drive, Miami Beach')).toBeInTheDocument()
      })

      // Select ocean properties
      const propertyCard1 = screen.getByTestId('property-card-prop-1')
      const propertyCard2 = screen.getByTestId('property-card-prop-2')
      fireEvent.click(propertyCard1)
      fireEvent.click(propertyCard2)

      // Open modal
      const createLinkButton = screen.getByRole('button', { name: /create link/i })
      fireEvent.click(createLinkButton)

      // ASSERT - Should suggest intelligent name based on common attributes
      const nameInput = screen.getByLabelText(/collection name/i)
      expect(nameInput).toHaveValue('Ocean Properties Collection')
      
      // Should show suggestion alternatives
      expect(screen.getByTestId('name-suggestions')).toBeInTheDocument()
      expect(screen.getByText('Miami Beach Properties')).toBeInTheDocument()
      expect(screen.getByText('Waterfront Collection')).toBeInTheDocument()
    })

    it('should provide real-time property count and selection preview', async () => {
      // ARRANGE
      render(<AgentDashboard />, { wrapper: getWrapper() })
      
      await waitFor(() => {
        expect(screen.getByText('123 Ocean Drive')).toBeInTheDocument()
      })

      // Start with no selection
      expect(screen.queryByRole('button', { name: /create link/i })).not.toBeInTheDocument()

      // ACT - Select first property
      const propertyCard1 = screen.getByTestId('property-card-prop-1')
      fireEvent.click(propertyCard1)

      // ASSERT - Should show real-time feedback
      expect(screen.getByText('1 selected')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /create link/i })).toBeInTheDocument()

      // ACT - Select second property
      const propertyCard2 = screen.getByTestId('property-card-prop-2')
      fireEvent.click(propertyCard2)

      // ASSERT - Counter should update
      expect(screen.getByText('2 selected')).toBeInTheDocument()
      
      // Button should show enhanced state for optimal count
      const createLinkButton = screen.getByRole('button', { name: /create link/i })
      expect(createLinkButton).toHaveClass('btn-primary-enhanced')
      expect(screen.getByTestId('optimal-count-indicator')).toBeInTheDocument()
    })

    it('should provide immediate success feedback within dashboard context', async () => {
      // ARRANGE
      const user = userEvent.setup()
      render(<AgentDashboard />, { wrapper: getWrapper() })
      
      await waitFor(() => {
        expect(screen.getByText('123 Ocean Drive')).toBeInTheDocument()
      })

      // Select properties and create link
      const propertyCard1 = screen.getByTestId('property-card-prop-1')
      fireEvent.click(propertyCard1)
      
      const createLinkButton = screen.getByRole('button', { name: /create link/i })
      fireEvent.click(createLinkButton)

      const quickCreateButton = screen.getByRole('button', { name: /quick create/i })
      await user.click(quickCreateButton)

      // ASSERT - Success feedback should appear within dashboard
      await waitFor(() => {
        expect(screen.getByTestId('inline-success-toast')).toBeInTheDocument()
        expect(screen.getByText('Link created and copied to clipboard!')).toBeInTheDocument()
      })

      // Should show immediate sharing options
      expect(screen.getByRole('button', { name: /share via email/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /share via sms/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /view link/i })).toBeInTheDocument()
    })
  })
})