import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LinkCustomizer from '../LinkCustomizer'

// Import shared infrastructure following TESTING-GUIDELINES.md
import { 
  setupTest, 
  createMockProperty
} from '@/test'

// Setup shared utilities
const { getWrapper } = setupTest()

describe('LinkCustomizer Component', () => {
  const mockOnLinkNameChange = jest.fn()
  const mockOnBack = jest.fn()
  const mockOnCreateLink = jest.fn()

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
    })
  ]

  const defaultProps = {
    properties: mockProperties,
    selectedPropertyIds: ['prop-1', 'prop-2'],
    linkName: '',
    loading: false,
    error: null,
    onLinkNameChange: mockOnLinkNameChange,
    onBack: mockOnBack,
    onCreateLink: mockOnCreateLink
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render component title and step indicator', () => {
      // ACT
      render(<LinkCustomizer {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByText('Link Details')).toBeInTheDocument()
      expect(screen.getByText('Step 2: Customize your link')).toBeInTheDocument()
    })

    it('should show selected properties summary', () => {
      // ACT
      render(<LinkCustomizer {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByText('Selected Properties')).toBeInTheDocument()
      expect(screen.getByText('2 properties in this collection')).toBeInTheDocument()
      expect(screen.getByText('123 Ocean Drive')).toBeInTheDocument()
      expect(screen.getByText('456 Beach Ave')).toBeInTheDocument()
    })

    it('should render link name input field', () => {
      // ACT
      render(<LinkCustomizer {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      const nameInput = screen.getByLabelText('Collection Name (Optional)')
      expect(nameInput).toBeInTheDocument()
      expect(nameInput).toHaveAttribute('placeholder', 'e.g., Waterfront Collection, Downtown Condos')
    })

    it('should display property details correctly', () => {
      // ACT
      render(<LinkCustomizer {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT - Use partial text matching for formatted price and details
      expect(screen.getByText(/850,000/)).toBeInTheDocument()
      expect(screen.getByText(/2bd, 2ba/)).toBeInTheDocument()  
      expect(screen.getByText(/1,250,000/)).toBeInTheDocument()
      expect(screen.getByText(/3bd, 2.5ba/)).toBeInTheDocument()
    })
  })

  describe('Property Selection Summary', () => {
    it('should show correct count for single property', () => {
      // ACT
      render(
        <LinkCustomizer 
          {...defaultProps} 
          selectedPropertyIds={['prop-1']}
        />, 
        { wrapper: getWrapper() }
      )

      // ASSERT
      expect(screen.getByText('1 property in this collection')).toBeInTheDocument()
    })

    it('should show correct count for multiple properties', () => {
      // ACT
      render(
        <LinkCustomizer 
          {...defaultProps} 
          selectedPropertyIds={['prop-1', 'prop-2']}
        />, 
        { wrapper: getWrapper() }
      )

      // ASSERT
      expect(screen.getByText('2 properties in this collection')).toBeInTheDocument()
    })

    it('should only show selected properties', () => {
      // ARRANGE
      const moreProperties = [
        ...mockProperties,
        createMockProperty({ id: 'prop-3', address: '789 Elm St' })
      ]

      // ACT
      render(
        <LinkCustomizer 
          {...defaultProps}
          properties={moreProperties} 
          selectedPropertyIds={['prop-1', 'prop-3']}
        />, 
        { wrapper: getWrapper() }
      )

      // ASSERT
      expect(screen.getByText('123 Ocean Drive')).toBeInTheDocument()
      expect(screen.getByText('789 Elm St')).toBeInTheDocument()
      expect(screen.queryByText('456 Beach Ave')).not.toBeInTheDocument()
    })
  })

  describe('Link Name Input', () => {
    it('should display current link name value', () => {
      // ACT
      render(
        <LinkCustomizer 
          {...defaultProps} 
          linkName="My Awesome Collection"
        />, 
        { wrapper: getWrapper() }
      )

      // ASSERT
      const nameInput = screen.getByLabelText('Collection Name (Optional)')
      expect(nameInput).toHaveValue('My Awesome Collection')
    })

    it('should call onLinkNameChange when input value changes', async () => {
      // ARRANGE
      const user = userEvent.setup()
      render(<LinkCustomizer {...defaultProps} />, { wrapper: getWrapper() })

      // ACT
      const nameInput = screen.getByLabelText('Collection Name (Optional)')
      await user.type(nameInput, 'New Collection Name')

      // ASSERT
      expect(mockOnLinkNameChange).toHaveBeenCalledWith('N')
      expect(mockOnLinkNameChange).toHaveBeenCalledWith('e')
      // Should be called for each character
    })

    it('should clear input when typing', async () => {
      // ARRANGE
      const user = userEvent.setup()
      render(
        <LinkCustomizer 
          {...defaultProps} 
          linkName="Old Name"
        />, 
        { wrapper: getWrapper() }
      )

      // ACT
      const nameInput = screen.getByLabelText('Collection Name (Optional)')
      await user.clear(nameInput)
      await user.type(nameInput, 'New Name')

      // ASSERT - Should call onChange for clearing and typing
      expect(mockOnLinkNameChange).toHaveBeenCalled()
    })
  })

  describe('Error Handling', () => {
    it('should show error message when error exists', () => {
      // ACT
      render(
        <LinkCustomizer 
          {...defaultProps} 
          error="Failed to create link"
        />, 
        { wrapper: getWrapper() }
      )

      // ASSERT
      expect(screen.getByText('Failed to create link')).toBeInTheDocument()
    })

    it('should not show error message when no error', () => {
      // ACT
      render(<LinkCustomizer {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
  })

  describe('Navigation', () => {
    it('should call onBack when Back button is clicked', async () => {
      // ARRANGE
      const user = userEvent.setup()
      render(<LinkCustomizer {...defaultProps} />, { wrapper: getWrapper() })

      // ACT
      await user.click(screen.getByText('Back'))

      // ASSERT
      expect(mockOnBack).toHaveBeenCalled()
    })

    it('should call onCreateLink when Create Link button is clicked', async () => {
      // ARRANGE
      const user = userEvent.setup()
      render(<LinkCustomizer {...defaultProps} />, { wrapper: getWrapper() })

      // ACT
      await user.click(screen.getByText('Create Link'))

      // ASSERT
      expect(mockOnCreateLink).toHaveBeenCalled()
    })

    it('should disable Create Link button when loading', () => {
      // ACT
      render(
        <LinkCustomizer 
          {...defaultProps} 
          loading={true}
        />, 
        { wrapper: getWrapper() }
      )

      // ASSERT
      const createButton = screen.getByText('Creating...').closest('button')
      expect(createButton).toBeDisabled()
    })

    it('should enable Create Link button when not loading', () => {
      // ACT
      render(<LinkCustomizer {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      const createButton = screen.getByText('Create Link').closest('button')
      expect(createButton).toBeEnabled()
    })

    it('should show loading state in Create Link button', () => {
      // ACT
      render(
        <LinkCustomizer 
          {...defaultProps} 
          loading={true}
        />, 
        { wrapper: getWrapper() }
      )

      // ASSERT
      expect(screen.getByText('Creating...')).toBeInTheDocument()
      expect(screen.queryByText('Create Link')).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper form labels and input associations', () => {
      // ACT
      render(<LinkCustomizer {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      const nameInput = screen.getByLabelText('Collection Name (Optional)')
      expect(nameInput).toBeInTheDocument()
      expect(nameInput).toHaveAttribute('placeholder')
    })

    it('should have proper button roles', () => {
      // ACT
      render(<LinkCustomizer {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /create link/i })).toBeInTheDocument()
    })

    it('should have descriptive help text for input', () => {
      // ACT
      render(<LinkCustomizer {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByText(/give your collection a memorable name/i)).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty selectedPropertyIds gracefully', () => {
      // ACT
      render(
        <LinkCustomizer 
          {...defaultProps} 
          selectedPropertyIds={[]}
        />, 
        { wrapper: getWrapper() }
      )

      // ASSERT
      expect(screen.getByText('0 properties in this collection')).toBeInTheDocument()
    })

    it('should handle properties with missing price data', () => {
      // ARRANGE
      const propertiesWithMissingData = [
        createMockProperty({
          id: 'prop-1',
          address: '123 Ocean Drive',
          price: undefined, // Missing price
          bedrooms: 2,
          bathrooms: 2.0
        })
      ]

      // ACT
      render(
        <LinkCustomizer 
          {...defaultProps}
          properties={propertiesWithMissingData}
          selectedPropertyIds={['prop-1']}
        />, 
        { wrapper: getWrapper() }
      )

      // ASSERT - Should handle gracefully without crashing
      expect(screen.getByText('123 Ocean Drive')).toBeInTheDocument()
    })

    it('should handle very long link names', async () => {
      // ARRANGE
      const user = userEvent.setup()
      const longName = 'A'.repeat(100)
      
      render(<LinkCustomizer {...defaultProps} />, { wrapper: getWrapper() })

      // ACT
      const nameInput = screen.getByLabelText('Collection Name (Optional)')
      await user.type(nameInput, longName)

      // ASSERT - Should handle long input gracefully
      expect(mockOnLinkNameChange).toHaveBeenCalled()
    })
  })
})