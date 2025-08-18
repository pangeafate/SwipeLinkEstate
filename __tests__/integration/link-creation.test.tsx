/**
 * Integration tests for the complete link creation user flow
 * Tests the journey from agent dashboard through link creation to sharing
 */

import React from 'react'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Import the components involved in the flow
import AgentDashboard from '@/app/(agent)/dashboard/page'
import LinksPage from '@/app/(agent)/links/page'
import { LinkCreator } from '@/components/link'

// Mock Next.js components
jest.mock('next/link', () => {
  const MockLink = ({ children, href, ...props }: { children: React.ReactNode; href: string }) => {
    return <a href={href} {...props}>{children}</a>
  }
  MockLink.displayName = 'MockLink'
  return MockLink
})

// Mock the services
jest.mock('@/components/property', () => ({
  PropertyService: {
    getAllProperties: jest.fn()
  }
}))

jest.mock('@/components/link', () => {
  const MockLinkCreator = ({ onLinkCreated, onCancel }: { onLinkCreated: (link: any) => void; onCancel: () => void }) => (
    <div data-testid="link-creator-integration">
      <h2>Create Property Link - Integration</h2>
      <button 
        onClick={() => onLinkCreated({
          id: 'integration-link-1',
          code: 'INTEG123',
          name: 'Integration Test Collection',
          property_ids: '["prop-1", "prop-2"]',
          created_at: new Date().toISOString(),
          expires_at: null
        })}
      >
        Complete Link Creation
      </button>
      <button onClick={onCancel}>Cancel Creation</button>
    </div>
  )
  MockLinkCreator.displayName = 'MockLinkCreator'
  
  return {
    LinkService: {
      createLink: jest.fn()
    },
    LinkCreator: MockLinkCreator
  }
})

jest.mock('@/components/agent/PropertyCard', () => {
  const MockPropertyCard = ({ 
    property, 
    selected, 
    onClick 
  }: { 
    property: any; 
    selected: boolean; 
    onClick: () => void 
  }) => {
    return (
      <div 
        data-testid={`integration-property-card-${property.id}`}
        className={selected ? 'selected' : ''}
        onClick={onClick}
      >
        <h3>{property.address}</h3>
        <p>${property.price?.toLocaleString()}</p>
        <p>Status: {property.status}</p>
      </div>
    )
  }
  MockPropertyCard.displayName = 'MockPropertyCard'
  return MockPropertyCard
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
  }
]

describe('Link Creation Integration Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(PropertyService.getAllProperties as jest.Mock).mockResolvedValue(mockProperties)
  })

  it('should complete the full link creation workflow from dashboard', async () => {
    const user = userEvent.setup()
    
    // STEP 1: Agent starts at dashboard and selects properties
    const { rerender } = render(<AgentDashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('123 Ocean Drive')).toBeInTheDocument()
    })
    
    // Select properties in dashboard
    await act(async () => {
      await user.click(screen.getByTestId('integration-property-card-prop-1'))
    })
    await act(async () => {
      await user.click(screen.getByTestId('integration-property-card-prop-2'))
    })
    
    // Verify selection UI appears
    expect(screen.getByText('2 selected')).toBeInTheDocument()
    expect(screen.getByText('Create Link')).toBeInTheDocument()
    
    // STEP 2: Navigate to links management page (simulated)
    rerender(<LinksPage />)
    
    // Start link creation process
    await act(async () => {
      await user.click(screen.getByText('Create New Link'))
    })
    
    // STEP 3: Link creator should be shown
    expect(screen.getByTestId('link-creator-integration')).toBeInTheDocument()
    expect(screen.getByText('Create Property Link - Integration')).toBeInTheDocument()
    
    // STEP 4: Complete link creation
    await act(async () => {
      await user.click(screen.getByText('Complete Link Creation'))
    })
    
    // STEP 5: Verify link was created and displayed
    expect(screen.getByText('Integration Test Collection')).toBeInTheDocument()
    expect(screen.getByText('Code: INTEG123 • 2 properties')).toBeInTheDocument()
    expect(screen.getByText('Copy Link')).toBeInTheDocument()
    expect(screen.getByText('Preview')).toBeInTheDocument()
    
    // Verify empty state is no longer shown
    expect(screen.queryByText('No links created yet')).not.toBeInTheDocument()
  })

  it('should handle link creation cancellation gracefully', async () => {
    const user = userEvent.setup()
    
    // STEP 1: Start at links page
    render(<LinksPage />)
    
    // STEP 2: Start link creation
    await act(async () => {
      await user.click(screen.getByText('Create New Link'))
    })
    
    expect(screen.getByTestId('link-creator-integration')).toBeInTheDocument()
    
    // STEP 3: Cancel creation
    await act(async () => {
      await user.click(screen.getByText('Cancel Creation'))
    })
    
    // STEP 4: Should return to links list view
    expect(screen.queryByTestId('link-creator-integration')).not.toBeInTheDocument()
    expect(screen.getByText('No links created yet')).toBeInTheDocument()
    expect(screen.getByText('Create New Link')).toBeInTheDocument()
  })

  it('should handle property loading errors in dashboard', async () => {
    // ARRANGE - Mock property service to fail
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    ;(PropertyService.getAllProperties as jest.Mock).mockRejectedValue(new Error('Network error'))
    
    // ACT
    render(<AgentDashboard />)
    
    // ASSERT - Should handle error gracefully
    await waitFor(() => {
      // Find the Total Properties card specifically instead of looking for generic "0"
      const statCards = document.querySelectorAll('.bg-white.rounded-lg.shadow.p-6')
      const totalPropertiesCard = Array.from(statCards).find(card => 
        card.textContent?.includes('Total Properties')
      )
      expect(totalPropertiesCard?.querySelector('.text-2xl')?.textContent).toBe('0')
    })
    
    expect(screen.getByText('No properties found')).toBeInTheDocument()
    expect(screen.getByText('Add Your First Property')).toBeInTheDocument()
    expect(consoleSpy).toHaveBeenCalledWith('Error loading properties:', expect.any(Error))
    
    consoleSpy.mockRestore()
  })

  it('should maintain state consistency throughout the workflow', async () => {
    const user = userEvent.setup()
    
    // Start with dashboard
    const { rerender } = render(<AgentDashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('123 Ocean Drive')).toBeInTheDocument()
    })
    
    // Select one property
    await act(async () => {
      await user.click(screen.getByTestId('integration-property-card-prop-1'))
    })
    
    expect(screen.getByText('1 selected')).toBeInTheDocument()
    
    // Navigate to links page
    rerender(<LinksPage />)
    
    // Create a link
    await act(async () => {
      await user.click(screen.getByText('Create New Link'))
    })
    
    await act(async () => {
      await user.click(screen.getByText('Complete Link Creation'))
    })
    
    // Should have created the link
    expect(screen.getByText('Integration Test Collection')).toBeInTheDocument()
    
    // Navigate back to dashboard should show properties are no longer selected
    rerender(<AgentDashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('123 Ocean Drive')).toBeInTheDocument()
    })
    
    // No properties should be selected initially
    expect(screen.queryByText('selected')).not.toBeInTheDocument()
  })

  it('should support multiple link creation cycles', async () => {
    const user = userEvent.setup()
    
    render(<LinksPage />)
    
    // Create first link
    await act(async () => {
      await user.click(screen.getByText('Create New Link'))
    })
    await act(async () => {
      await user.click(screen.getByText('Complete Link Creation'))
    })
    
    expect(screen.getByText('Integration Test Collection')).toBeInTheDocument()
    
    // Create another link
    await act(async () => {
      await user.click(screen.getByText('Create New Link'))
    })
    
    // Should show link creator again
    expect(screen.getByTestId('link-creator-integration')).toBeInTheDocument()
    
    // Cancel this one
    await act(async () => {
      await user.click(screen.getByText('Cancel Creation'))
    })
    
    // Should return to list with first link still there
    expect(screen.getByText('Integration Test Collection')).toBeInTheDocument()
    expect(screen.queryByTestId('link-creator-integration')).not.toBeInTheDocument()
  })
})