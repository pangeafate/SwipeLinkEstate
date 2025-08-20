import React from 'react'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LinkCreator from '../LinkCreator'

// Import shared infrastructure following TESTING-GUIDELINES.md
import { 
  setupTest, 
  createMockProperty, 
  createMockLink,
  SupabaseMockFactory 
} from '@/test'

// Setup shared utilities
const { getWrapper } = setupTest()

// Mock the LinkService using shared infrastructure
jest.mock('../../link.service', () => ({
  LinkService: {
    createLink: jest.fn(),
    copyLinkUrl: jest.fn()
  }
}))

// Mock property service using shared infrastructure  
jest.mock('../../../property', () => ({
  PropertyService: {
    getAllProperties: jest.fn()
  }
}))

import { LinkService } from '../../link.service'
import { PropertyService } from '../../../property'

describe('LinkCreator - Shared Infrastructure', () => {
  const mockOnLinkCreated = jest.fn()
  const mockOnCancel = jest.fn()

  // Use shared infrastructure for consistent test data
  const mockProperties = [
    createMockProperty({
      id: 'prop-1',
      address: '123 Ocean Drive',
      price: 850000,
      bedrooms: 2,
      bathrooms: 2.0
    }),
    createMockProperty({
      id: 'prop-2', 
      address: '456 Beach Ave',
      price: 1250000,
      bedrooms: 3,
      bathrooms: 2.5
    }),
    createMockProperty({
      id: 'prop-3',
      address: '789 Palm Street',
      price: 650000,
      bedrooms: 1,
      bathrooms: 1.0
    })
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    ;(PropertyService.getAllProperties as jest.Mock).mockResolvedValue(mockProperties)
  })

  describe('Property Selection', () => {
    it('should render property selection step initially', async () => {
      // ACT
      render(<LinkCreator onLinkCreated={mockOnLinkCreated} onCancel={mockOnCancel} />, {
        wrapper: getWrapper()
      })

      // ASSERT
      expect(screen.getByText('Create Property Link')).toBeInTheDocument()
      expect(screen.getByText('Step 1: Select Properties')).toBeInTheDocument()
      
      // Should show loading initially
      expect(screen.getByText('Loading properties...')).toBeInTheDocument()
      
      // Wait for properties to load
      await waitFor(() => {
        expect(screen.getByText('123 Ocean Drive')).toBeInTheDocument()
      })
      
      expect(screen.getByText('456 Beach Ave')).toBeInTheDocument()
      expect(screen.getByText('789 Palm Street')).toBeInTheDocument()
    })

    it('should allow selecting and deselecting properties', async () => {
      // ARRANGE
      const user = userEvent.setup()
      render(<LinkCreator onLinkCreated={mockOnLinkCreated} onCancel={mockOnCancel} />, {
        wrapper: getWrapper()
      })
      
      await waitFor(() => {
        expect(screen.getByText('123 Ocean Drive')).toBeInTheDocument()
      })

      // ACT - Select first property
      const firstPropertyCard = screen.getByTestId('property-card-prop-1')
      await act(async () => {
        await user.click(firstPropertyCard)
      })

      // ASSERT
      expect(firstPropertyCard).toHaveClass('border-blue-500') // Selected state
      expect(screen.getByText('1 property selected')).toBeInTheDocument()

      // ACT - Select second property
      const secondPropertyCard = screen.getByTestId('property-card-prop-2')
      await act(async () => {
        await user.click(secondPropertyCard)
      })

      // ASSERT
      expect(screen.getByText('2 properties selected')).toBeInTheDocument()

      // ACT - Deselect first property
      await act(async () => {
        await user.click(firstPropertyCard)
      })

      // ASSERT
      expect(firstPropertyCard).not.toHaveClass('border-blue-500')
      expect(screen.getByText('1 property selected')).toBeInTheDocument()
    })

    it('should enable Next button only when properties selected', async () => {
      // ARRANGE
      const user = userEvent.setup()
      render(<LinkCreator onLinkCreated={mockOnLinkCreated} onCancel={mockOnCancel} />, {
        wrapper: getWrapper()
      })
      
      await waitFor(() => {
        expect(screen.getByText('123 Ocean Drive')).toBeInTheDocument()
      })

      // ASSERT - Next button should be disabled initially
      const nextButton = screen.getByText('Next')
      expect(nextButton.closest('button')).toBeDisabled()

      // ACT - Select a property
      const firstPropertyCard = screen.getByTestId('property-card-prop-1')
      await act(async () => {
        await user.click(firstPropertyCard)
      })

      // ASSERT - Next button should be enabled
      expect(nextButton.closest('button')).toBeEnabled()
    })
  })

  describe('Link Details & Customization', () => {
    const setupLinkCustomizer = async () => {
      const user = userEvent.setup()
      render(<LinkCreator onLinkCreated={mockOnLinkCreated} onCancel={mockOnCancel} />, {
        wrapper: getWrapper()
      })
      
      await waitFor(() => {
        expect(screen.getByText('123 Ocean Drive')).toBeInTheDocument()
      })

      // Navigate to step 2
      await act(async () => {
        await user.click(screen.getByTestId('property-card-prop-1'))
      })
      await act(async () => {
        await user.click(screen.getByTestId('property-card-prop-2'))
      })
      await act(async () => {
        await user.click(screen.getByText('Next'))
      })

      return user
    }

    it('should show selected properties summary', async () => {
      // ARRANGE & ACT
      await setupLinkCustomizer()

      // ASSERT
      expect(screen.getByText('2 properties in this collection')).toBeInTheDocument()
      expect(screen.getByText('123 Ocean Drive')).toBeInTheDocument()
      expect(screen.getByText('456 Beach Ave')).toBeInTheDocument()
    })

    it('should create link when Create Link button clicked', async () => {
      // ARRANGE
      const user = await setupLinkCustomizer()
      
      // Use shared infrastructure for mock link creation
      const mockCreatedLink = createMockLink({
        id: 'link-123',
        code: 'ABC12345',
        name: 'My Collection',
        property_ids: ['prop-1', 'prop-2']
      })
      
      ;(LinkService.createLink as jest.Mock).mockResolvedValue(mockCreatedLink)

      // ACT
      const nameInput = screen.getByLabelText('Collection Name (Optional)')
      await act(async () => {
        await user.type(nameInput, 'My Collection')
      })
      await act(async () => {
        await user.click(screen.getByText('Create Link'))
      })

      // ASSERT
      expect(LinkService.createLink).toHaveBeenCalledWith(['prop-1', 'prop-2'], 'My Collection')
      
      // Should proceed to step 3
      await waitFor(() => {
        expect(screen.getByText('Link Created Successfully!')).toBeInTheDocument()
      })
    })
  })

  describe('Link Sharing', () => {
    const setupLinkShare = async () => {
      const user = userEvent.setup()
      
      // Use shared infrastructure for mock data
      const mockCreatedLink = createMockLink({
        id: 'link-123',
        code: 'ABC12345', 
        name: 'My Collection',
        property_ids: ['prop-1', 'prop-2']
      })
      
      ;(LinkService.createLink as jest.Mock).mockResolvedValue(mockCreatedLink)
      
      render(<LinkCreator onLinkCreated={mockOnLinkCreated} onCancel={mockOnCancel} />, {
        wrapper: getWrapper()
      })
      
      await waitFor(() => {
        expect(screen.getByText('123 Ocean Drive')).toBeInTheDocument()
      })

      // Navigate through steps
      await act(async () => {
        await user.click(screen.getByTestId('property-card-prop-1'))
      })
      await act(async () => {
        await user.click(screen.getByTestId('property-card-prop-2'))
      })
      await act(async () => {
        await user.click(screen.getByText('Next'))
      })
      await act(async () => {
        await user.click(screen.getByText('Create Link'))
      })

      await waitFor(() => {
        expect(screen.getByText('Link Created Successfully!')).toBeInTheDocument()
      })

      return { user, mockCreatedLink }
    }

    it('should show created link details', async () => {
      // ARRANGE & ACT
      await setupLinkShare()

      // ASSERT  
      expect(screen.getByText('Link Created Successfully!')).toBeInTheDocument()
      expect(screen.getByDisplayValue('http://localhost/link/ABC12345')).toBeInTheDocument()
      expect(screen.getByText('Copy')).toBeInTheDocument()
    })

    it('should copy link when Copy Link button clicked', async () => {
      // ARRANGE
      const { user } = await setupLinkShare()
      
      // Mock the LinkService.copyLinkUrl method
      ;(LinkService.copyLinkUrl as jest.Mock).mockResolvedValue(undefined)

      // ACT
      await act(async () => {
        await user.click(screen.getByText('Copy'))
      })

      // ASSERT
      expect(LinkService.copyLinkUrl).toHaveBeenCalledWith('ABC12345')
      
      // Wait for the "Copied!" text to appear
      await waitFor(() => {
        expect(screen.getByText('Copied!')).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {
    it('should show error when property loading fails', async () => {
      // ARRANGE - Use shared infrastructure for error scenario
      ;(PropertyService.getAllProperties as jest.Mock).mockRejectedValue(
        new Error('Failed to load properties')
      )

      // ACT
      render(<LinkCreator onLinkCreated={mockOnLinkCreated} onCancel={mockOnCancel} />, {
        wrapper: getWrapper()
      })

      // ASSERT
      await waitFor(() => {
        expect(screen.getByText('Error loading properties. Please try again.')).toBeInTheDocument()
      })
    })

    it('should show error when link creation fails', async () => {
      // ARRANGE
      const user = userEvent.setup()
      ;(LinkService.createLink as jest.Mock).mockRejectedValue(
        new Error('Failed to create link')
      )
      
      render(<LinkCreator onLinkCreated={mockOnLinkCreated} onCancel={mockOnCancel} />, {
        wrapper: getWrapper()
      })
      
      await waitFor(() => {
        expect(screen.getByText('123 Ocean Drive')).toBeInTheDocument()
      })

      // Navigate to step 2 and try to create link
      await act(async () => {
        await user.click(screen.getByTestId('property-card-prop-1'))
      })
      await act(async () => {
        await user.click(screen.getByText('Next'))
      })
      await act(async () => {
        await user.click(screen.getByText('Create Link'))
      })

      // ASSERT
      await waitFor(() => {
        expect(screen.getByText('Failed to create link. Please try again.')).toBeInTheDocument()
      })
    })
  })

  describe('Cancel Flow', () => {
    it('should call onCancel when Cancel button clicked', async () => {
      // ARRANGE
      const user = userEvent.setup()
      render(<LinkCreator onLinkCreated={mockOnLinkCreated} onCancel={mockOnCancel} />, {
        wrapper: getWrapper()
      })

      // ACT
      await act(async () => {
        await user.click(screen.getByText('Cancel'))
      })

      // ASSERT
      expect(mockOnCancel).toHaveBeenCalled()
    })
  })
})