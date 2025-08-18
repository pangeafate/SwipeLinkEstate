import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LinkCreator from '../LinkCreator'

// Mock the LinkService
jest.mock('../../link.service', () => ({
  LinkService: {
    createLink: jest.fn()
  }
}))

// Mock property service to provide test data
jest.mock('../../../property', () => ({
  PropertyService: {
    getAllProperties: jest.fn()
  }
}))

import { LinkService } from '../../link.service'
import { PropertyService } from '../../../property'

const mockProperties = [
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
  },
  {
    id: 'prop-3',
    address: '789 Palm Street',
    price: 650000,
    bedrooms: 1,
    bathrooms: 1.0,
    area_sqft: 900,
    cover_image: 'image3.jpg',
    status: 'active'
  }
]

describe('LinkCreator', () => {
  const mockOnLinkCreated = jest.fn()
  const mockOnCancel = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(PropertyService.getAllProperties as jest.Mock).mockResolvedValue(mockProperties)
  })

  describe('Step 1: Property Selection', () => {
    it('should render property selection step initially', async () => {
      // ACT
      render(<LinkCreator onLinkCreated={mockOnLinkCreated} onCancel={mockOnCancel} />)

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
      render(<LinkCreator onLinkCreated={mockOnLinkCreated} onCancel={mockOnCancel} />)
      
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
      render(<LinkCreator onLinkCreated={mockOnLinkCreated} onCancel={mockOnCancel} />)
      
      await waitFor(() => {
        expect(screen.getByText('123 Ocean Drive')).toBeInTheDocument()
      })

      // ASSERT - Next button should be disabled initially
      const nextButton = screen.getByText('Next')
      expect(nextButton).toBeDisabled()

      // ACT - Select a property
      const firstPropertyCard = screen.getByTestId('property-card-prop-1')
      await act(async () => {
        await user.click(firstPropertyCard)
      })

      // ASSERT - Next button should be enabled
      expect(nextButton).toBeEnabled()
    })

    it('should proceed to step 2 when Next clicked', async () => {
      // ARRANGE
      const user = userEvent.setup()
      render(<LinkCreator onLinkCreated={mockOnLinkCreated} onCancel={mockOnCancel} />)
      
      await waitFor(() => {
        expect(screen.getByText('123 Ocean Drive')).toBeInTheDocument()
      })

      // ACT - Select property and click Next
      await act(async () => {
        await user.click(screen.getByTestId('property-card-prop-1'))
      })
      await act(async () => {
        await user.click(screen.getByText('Next'))
      })

      // ASSERT
      expect(screen.getByText('Step 2: Link Details')).toBeInTheDocument()
      expect(screen.getByLabelText('Link Name (Optional)')).toBeInTheDocument()
    })
  })

  describe('Step 2: Link Details', () => {
    const setupStep2 = async () => {
      const user = userEvent.setup()
      render(<LinkCreator onLinkCreated={mockOnLinkCreated} onCancel={mockOnCancel} />)
      
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
      await setupStep2()

      // ASSERT
      expect(screen.getByText('2 properties selected')).toBeInTheDocument()
      expect(screen.getByText('123 Ocean Drive')).toBeInTheDocument()
      expect(screen.getByText('456 Beach Ave')).toBeInTheDocument()
    })

    it('should allow entering link name', async () => {
      // ARRANGE
      const user = await setupStep2()
      
      // ACT
      const nameInput = screen.getByLabelText('Link Name (Optional)')
      await act(async () => {
        await user.type(nameInput, 'My Waterfront Collection')
      })

      // ASSERT
      expect(nameInput).toHaveValue('My Waterfront Collection')
    })

    it('should create link when Create Link button clicked', async () => {
      // ARRANGE
      const user = await setupStep2()
      const mockCreatedLink = {
        id: 'link-123',
        code: 'ABC12345',
        name: 'My Collection',
        property_ids: ['prop-1', 'prop-2'],
        created_at: new Date().toISOString(),
        expires_at: null
      }
      
      ;(LinkService.createLink as jest.Mock).mockResolvedValue(mockCreatedLink)

      // ACT
      const nameInput = screen.getByLabelText('Link Name (Optional)')
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
        expect(screen.getByText('Step 3: Link Created!')).toBeInTheDocument()
      })
    })

    it('should go back to step 1 when Back clicked', async () => {
      // ARRANGE
      const user = await setupStep2()

      // ACT
      await act(async () => {
        await user.click(screen.getByText('Back'))
      })

      // ASSERT
      expect(screen.getByText('Step 1: Select Properties')).toBeInTheDocument()
      // Selected properties should be preserved
      expect(screen.getByText('2 properties selected')).toBeInTheDocument()
    })
  })

  describe('Step 3: Success', () => {
    const setupStep3 = async () => {
      const user = userEvent.setup()
      const mockCreatedLink = {
        id: 'link-123',
        code: 'ABC12345', 
        name: 'My Collection',
        property_ids: ['prop-1', 'prop-2'],
        created_at: new Date().toISOString(),
        expires_at: null
      }
      
      ;(LinkService.createLink as jest.Mock).mockResolvedValue(mockCreatedLink)
      
      render(<LinkCreator onLinkCreated={mockOnLinkCreated} onCancel={mockOnCancel} />)
      
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
        expect(screen.getByText('Step 3: Link Created!')).toBeInTheDocument()
      })

      return { user, mockCreatedLink }
    }

    it('should show created link details', async () => {
      // ARRANGE & ACT
      await setupStep3()

      // ASSERT
      expect(screen.getByText('Your link has been created successfully!')).toBeInTheDocument()
      expect(screen.getByDisplayValue('http://localhost/link/ABC12345')).toBeInTheDocument()
      expect(screen.getByText('Copy Link')).toBeInTheDocument()
    })

    it('should copy link when Copy Link button clicked', async () => {
      // ARRANGE
      const { user } = await setupStep3()
      
      // Mock clipboard
      const mockWriteText = jest.fn().mockResolvedValue(undefined)
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: mockWriteText },
        writable: true
      })

      // ACT
      await act(async () => {
        await user.click(screen.getByText('Copy Link'))
      })

      // ASSERT
      expect(mockWriteText).toHaveBeenCalledWith('http://localhost/link/ABC12345')
      
      // Wait for the "Copied!" text to appear
      await waitFor(() => {
        expect(screen.getByText('Copied!')).toBeInTheDocument()
      })
    })

    it('should call onLinkCreated callback with link data', async () => {
      // ARRANGE & ACT
      const { mockCreatedLink } = await setupStep3()

      // ASSERT
      expect(mockOnLinkCreated).toHaveBeenCalledWith(mockCreatedLink)
    })

    it('should create another link when Create Another clicked', async () => {
      // ARRANGE
      const { user } = await setupStep3()

      // ACT
      await act(async () => {
        await user.click(screen.getByText('Create Another'))
      })

      // ASSERT
      expect(screen.getByText('Step 1: Select Properties')).toBeInTheDocument()
      // Should reset selected properties
      expect(screen.getByText('Next')).toBeDisabled()
    })
  })

  describe('Error Handling', () => {
    it('should show error when property loading fails', async () => {
      // ARRANGE
      ;(PropertyService.getAllProperties as jest.Mock).mockRejectedValue(
        new Error('Failed to load properties')
      )

      // ACT
      render(<LinkCreator onLinkCreated={mockOnLinkCreated} onCancel={mockOnCancel} />)

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
      
      render(<LinkCreator onLinkCreated={mockOnLinkCreated} onCancel={mockOnCancel} />)
      
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
      render(<LinkCreator onLinkCreated={mockOnLinkCreated} onCancel={mockOnCancel} />)

      // ACT
      await act(async () => {
        await user.click(screen.getByText('Cancel'))
      })

      // ASSERT
      expect(mockOnCancel).toHaveBeenCalled()
    })
  })
})