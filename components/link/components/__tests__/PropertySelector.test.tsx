import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PropertySelector from '../PropertySelector'

// Import shared infrastructure following TESTING-GUIDELINES.md
import { 
  setupTest, 
  createMockProperty,
  fixtures
} from '@/test'

// Setup shared utilities
const { getWrapper } = setupTest()

describe('PropertySelector Component', () => {
  const mockOnPropertySelect = jest.fn()
  const mockOnNext = jest.fn()
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
  })

  describe('Rendering', () => {
    it('should render component title and step indicator', () => {
      // ACT
      render(
        <PropertySelector
          properties={mockProperties}
          selectedPropertyIds={[]}
          loading={false}
          error={null}
          onPropertySelect={mockOnPropertySelect}
          onNext={mockOnNext}
          onCancel={mockOnCancel}
        />,
        { wrapper: getWrapper() }
      )

      // ASSERT
      expect(screen.getByText('Create Property Link')).toBeInTheDocument()
      expect(screen.getByText('Step 1: Select Properties')).toBeInTheDocument()
    })

    it('should render property grid when not loading', () => {
      // ACT
      render(
        <PropertySelector
          properties={mockProperties}
          selectedPropertyIds={[]}
          loading={false}
          error={null}
          onPropertySelect={mockOnPropertySelect}
          onNext={mockOnNext}
          onCancel={mockOnCancel}
        />,
        { wrapper: getWrapper() }
      )

      // ASSERT
      expect(screen.getByText('123 Ocean Drive')).toBeInTheDocument()
      expect(screen.getByText('456 Beach Ave')).toBeInTheDocument()
      expect(screen.getByText('789 Palm Street')).toBeInTheDocument()
    })

    it('should show selection count correctly', () => {
      // ACT
      render(
        <PropertySelector
          properties={mockProperties}
          selectedPropertyIds={['prop-1', 'prop-2']}
          loading={false}
          error={null}
          onPropertySelect={mockOnPropertySelect}
          onNext={mockOnNext}
          onCancel={mockOnCancel}
        />,
        { wrapper: getWrapper() }
      )

      // ASSERT
      expect(screen.getByText('2 properties selected')).toBeInTheDocument()
      expect(screen.getByText('Ready to create link')).toBeInTheDocument()
    })
  })

  describe('Loading State', () => {
    it('should show loading spinner and message', () => {
      // ACT
      render(
        <PropertySelector
          properties={[]}
          selectedPropertyIds={[]}
          loading={true}
          error={null}
          onPropertySelect={mockOnPropertySelect}
          onNext={mockOnNext}
          onCancel={mockOnCancel}
        />,
        { wrapper: getWrapper() }
      )

      // ASSERT
      expect(screen.getByText('Loading properties...')).toBeInTheDocument()
      // Check for loading spinner by class
      const spinner = document.querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
    })

    it('should not show property grid when loading', () => {
      // ACT
      render(
        <PropertySelector
          properties={mockProperties}
          selectedPropertyIds={[]}
          loading={true}
          error={null}
          onPropertySelect={mockOnPropertySelect}
          onNext={mockOnNext}
          onCancel={mockOnCancel}
        />,
        { wrapper: getWrapper() }
      )

      // ASSERT
      expect(screen.queryByText('123 Ocean Drive')).not.toBeInTheDocument()
    })
  })

  describe('Error State', () => {
    it('should show error message when error exists', () => {
      // ACT
      render(
        <PropertySelector
          properties={[]}
          selectedPropertyIds={[]}
          loading={false}
          error="Failed to load properties"
          onPropertySelect={mockOnPropertySelect}
          onNext={mockOnNext}
          onCancel={mockOnCancel}
        />,
        { wrapper: getWrapper() }
      )

      // ASSERT
      expect(screen.getByText('Failed to load properties')).toBeInTheDocument()
    })

    it('should not show property grid when error exists', () => {
      // ACT
      render(
        <PropertySelector
          properties={mockProperties}
          selectedPropertyIds={[]}
          loading={false}
          error="Failed to load properties"
          onPropertySelect={mockOnPropertySelect}
          onNext={mockOnNext}
          onCancel={mockOnCancel}
        />,
        { wrapper: getWrapper() }
      )

      // ASSERT
      expect(screen.queryByText('123 Ocean Drive')).not.toBeInTheDocument()
    })
  })

  describe('Property Selection', () => {
    it('should call onPropertySelect when property card is clicked', async () => {
      // ARRANGE
      const user = userEvent.setup()
      render(
        <PropertySelector
          properties={mockProperties}
          selectedPropertyIds={[]}
          loading={false}
          error={null}
          onPropertySelect={mockOnPropertySelect}
          onNext={mockOnNext}
          onCancel={mockOnCancel}
        />,
        { wrapper: getWrapper() }
      )

      // ACT
      const propertyCard = screen.getByTestId('property-card-prop-1')
      await user.click(propertyCard)

      // ASSERT
      expect(mockOnPropertySelect).toHaveBeenCalledWith(mockProperties[0])
    })

    it('should show selected state for selected properties', () => {
      // ACT
      render(
        <PropertySelector
          properties={mockProperties}
          selectedPropertyIds={['prop-1', 'prop-3']}
          loading={false}
          error={null}
          onPropertySelect={mockOnPropertySelect}
          onNext={mockOnNext}
          onCancel={mockOnCancel}
        />,
        { wrapper: getWrapper() }
      )

      // ASSERT
      expect(screen.getByTestId('property-card-prop-1')).toHaveClass('border-blue-500')
      expect(screen.getByTestId('property-card-prop-2')).not.toHaveClass('border-blue-500')
      expect(screen.getByTestId('property-card-prop-3')).toHaveClass('border-blue-500')
    })
  })

  describe('Navigation', () => {
    it('should disable Next button when no properties selected', () => {
      // ACT
      render(
        <PropertySelector
          properties={mockProperties}
          selectedPropertyIds={[]}
          loading={false}
          error={null}
          onPropertySelect={mockOnPropertySelect}
          onNext={mockOnNext}
          onCancel={mockOnCancel}
        />,
        { wrapper: getWrapper() }
      )

      // ASSERT
      const nextButton = screen.getByText('Next').closest('button')
      expect(nextButton).toBeDisabled()
    })

    it('should enable Next button when properties are selected', () => {
      // ACT
      render(
        <PropertySelector
          properties={mockProperties}
          selectedPropertyIds={['prop-1']}
          loading={false}
          error={null}
          onPropertySelect={mockOnPropertySelect}
          onNext={mockOnNext}
          onCancel={mockOnCancel}
        />,
        { wrapper: getWrapper() }
      )

      // ASSERT
      const nextButton = screen.getByText('Next').closest('button')
      expect(nextButton).toBeEnabled()
    })

    it('should call onNext when Next button is clicked', async () => {
      // ARRANGE
      const user = userEvent.setup()
      render(
        <PropertySelector
          properties={mockProperties}
          selectedPropertyIds={['prop-1']}
          loading={false}
          error={null}
          onPropertySelect={mockOnPropertySelect}
          onNext={mockOnNext}
          onCancel={mockOnCancel}
        />,
        { wrapper: getWrapper() }
      )

      // ACT
      await user.click(screen.getByText('Next'))

      // ASSERT
      expect(mockOnNext).toHaveBeenCalled()
    })

    it('should call onCancel when Cancel button is clicked', async () => {
      // ARRANGE
      const user = userEvent.setup()
      render(
        <PropertySelector
          properties={mockProperties}
          selectedPropertyIds={[]}
          loading={false}
          error={null}
          onPropertySelect={mockOnPropertySelect}
          onNext={mockOnNext}
          onCancel={mockOnCancel}
        />,
        { wrapper: getWrapper() }
      )

      // ACT
      await user.click(screen.getByText('Cancel'))

      // ASSERT
      expect(mockOnCancel).toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('should have proper button roles and labels', () => {
      // ACT
      render(
        <PropertySelector
          properties={mockProperties}
          selectedPropertyIds={['prop-1']}
          loading={false}
          error={null}
          onPropertySelect={mockOnPropertySelect}
          onNext={mockOnNext}
          onCancel={mockOnCancel}
        />,
        { wrapper: getWrapper() }
      )

      // ASSERT
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty properties array', () => {
      // ACT
      render(
        <PropertySelector
          properties={[]}
          selectedPropertyIds={[]}
          loading={false}
          error={null}
          onPropertySelect={mockOnPropertySelect}
          onNext={mockOnNext}
          onCancel={mockOnCancel}
        />,
        { wrapper: getWrapper() }
      )

      // ASSERT
      expect(screen.getByText('0 properties selected')).toBeInTheDocument()
      expect(screen.queryByTestId(/property-card-/)).not.toBeInTheDocument()
    })

    it('should handle single vs plural property count correctly', () => {
      // Test singular
      render(
        <PropertySelector
          properties={mockProperties}
          selectedPropertyIds={['prop-1']}
          loading={false}
          error={null}
          onPropertySelect={mockOnPropertySelect}
          onNext={mockOnNext}
          onCancel={mockOnCancel}
        />,
        { wrapper: getWrapper() }
      )

      expect(screen.getByText('1 property selected')).toBeInTheDocument()
    })
  })
})