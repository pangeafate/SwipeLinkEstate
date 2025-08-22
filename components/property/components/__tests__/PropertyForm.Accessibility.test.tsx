import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PropertyForm from '../PropertyForm'
import { PropertyService } from '@/components/property'
import { setupTest, A11yUtils } from '@/test/utils/testSetup'

// Mock PropertyService
jest.mock('@/components/property', () => ({
  PropertyService: {
    createProperty: jest.fn()
  }
}))

const mockPropertyService = PropertyService as jest.Mocked<typeof PropertyService>

describe('PropertyForm - Accessibility', () => {
  setupTest({ suppressConsoleErrors: true })

  const mockOnPropertyCreated = jest.fn()
  const mockOnCancel = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('ARIA Attributes', () => {
    it('should have proper aria-invalid attributes for invalid fields', async () => {
      const user = userEvent.setup()
      render(
        <PropertyForm 
          onPropertyCreated={mockOnPropertyCreated}
          onCancel={mockOnCancel}
        />
      )

      // Try to submit empty form
      await act(async () => {
        await user.click(screen.getByText('Add Property'))
      })

      // Wait for validation
      await waitFor(() => {
        expect(screen.getByText(/Address is required/i)).toBeInTheDocument()
      })

      // Check aria-invalid is set
      const addressInput = screen.getByLabelText(/address/i)
      expect(addressInput).toHaveAttribute('aria-invalid', 'true')
    })

    it('should have aria-describedby linking error messages', async () => {
      const user = userEvent.setup()
      render(
        <PropertyForm 
          onPropertyCreated={mockOnPropertyCreated}
          onCancel={mockOnCancel}
        />
      )

      // Submit invalid form
      await act(async () => {
        await user.click(screen.getByText('Add Property'))
      })

      await waitFor(() => {
        expect(screen.getByText(/Address is required/i)).toBeInTheDocument()
      })

      // Check aria-describedby
      const addressInput = screen.getByLabelText(/address/i)
      const errorId = addressInput.getAttribute('aria-describedby')
      expect(errorId).toBeTruthy()
      expect(document.getElementById(errorId!)).toBeInTheDocument()
    })

    it('should have role="alert" for error messages', async () => {
      const user = userEvent.setup()
      render(
        <PropertyForm 
          onPropertyCreated={mockOnPropertyCreated}
          onCancel={mockOnCancel}
        />
      )

      // Submit invalid form
      await act(async () => {
        await user.click(screen.getByText('Add Property'))
      })

      await waitFor(() => {
        const errorMessage = screen.getByText(/Address is required/i)
        expect(errorMessage.closest('[role="alert"]')).toBeInTheDocument()
      })
    })

    it('should clear aria-invalid when field becomes valid', async () => {
      const user = userEvent.setup()
      render(
        <PropertyForm 
          onPropertyCreated={mockOnPropertyCreated}
          onCancel={mockOnCancel}
        />
      )

      // Submit empty form to trigger validation
      await act(async () => {
        await user.click(screen.getByText('Add Property'))
      })

      await waitFor(() => {
        expect(screen.getByText(/Address is required/i)).toBeInTheDocument()
      })

      const addressInput = screen.getByLabelText(/address/i)
      expect(addressInput).toHaveAttribute('aria-invalid', 'true')

      // Fill the field to make it valid
      await user.type(addressInput, '123 Valid Address')
      await user.tab() // Trigger validation

      await waitFor(() => {
        expect(addressInput).toHaveAttribute('aria-invalid', 'false')
      })
    })
  })

  describe('Label Association', () => {
    it('should have proper label associations for all form fields', () => {
      render(
        <PropertyForm 
          onPropertyCreated={mockOnPropertyCreated}
          onCancel={mockOnCancel}
        />
      )

      // Check that all inputs have associated labels
      const addressInput = screen.getByLabelText(/address/i)
      const priceInput = screen.getByLabelText(/price/i)
      const bedroomsInput = screen.getByLabelText(/bedrooms/i)
      const bathroomsInput = screen.getByLabelText(/bathrooms/i)
      const areaInput = screen.getByLabelText(/area/i)
      const propertyTypeSelect = screen.getByLabelText(/property type/i)

      expect(addressInput).toBeInTheDocument()
      expect(priceInput).toBeInTheDocument()
      expect(bedroomsInput).toBeInTheDocument()
      expect(bathroomsInput).toBeInTheDocument()
      expect(areaInput).toBeInTheDocument()
      expect(propertyTypeSelect).toBeInTheDocument()
    })

    it('should have proper label text for screen readers', () => {
      render(
        <PropertyForm 
          onPropertyCreated={mockOnPropertyCreated}
          onCancel={mockOnCancel}
        />
      )

      expect(screen.getByLabelText(/property address/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/price.*\$/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/number of bedrooms/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/number of bathrooms/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/area.*square feet/i)).toBeInTheDocument()
    })
  })

  describe('Keyboard Navigation', () => {
    it('should support keyboard navigation through form fields', async () => {
      const user = userEvent.setup()
      render(
        <PropertyForm 
          onPropertyCreated={mockOnPropertyCreated}
          onCancel={mockOnCancel}
        />
      )

      const addressInput = screen.getByLabelText(/address/i)
      const priceInput = screen.getByLabelText(/price/i)
      const bedroomsInput = screen.getByLabelText(/bedrooms/i)
      const bathroomsInput = screen.getByLabelText(/bathrooms/i)

      // Focus first field
      addressInput.focus()
      expect(addressInput).toHaveFocus()

      // Tab to next field
      await user.tab()
      expect(priceInput).toHaveFocus()

      // Tab to next field
      await user.tab()
      expect(bedroomsInput).toHaveFocus()

      // Tab to next field
      await user.tab()
      expect(bathroomsInput).toHaveFocus()
    })

    it('should allow form submission with Enter key', async () => {
      const user = userEvent.setup()
      mockPropertyService.createProperty.mockResolvedValue({ id: 'test-id' })

      render(
        <PropertyForm 
          onPropertyCreated={mockOnPropertyCreated}
          onCancel={mockOnCancel}
        />
      )

      // Fill form
      await user.type(screen.getByLabelText(/address/i), '123 Test Street')
      await user.type(screen.getByLabelText(/price/i), '250000')
      await user.type(screen.getByLabelText(/bedrooms/i), '3')
      await user.type(screen.getByLabelText(/bathrooms/i), '2')

      // Press Enter to submit
      await user.keyboard('{Enter}')

      await waitFor(() => {
        expect(mockPropertyService.createProperty).toHaveBeenCalled()
      })
    })

    it('should allow form cancellation with Escape key', async () => {
      const user = userEvent.setup()
      render(
        <PropertyForm 
          onPropertyCreated={mockOnPropertyCreated}
          onCancel={mockOnCancel}
        />
      )

      // Press Escape
      await user.keyboard('{Escape}')

      expect(mockOnCancel).toHaveBeenCalled()
    })
  })

  describe('Focus Management', () => {
    it('should focus first error field after validation fails', async () => {
      const user = userEvent.setup()
      render(
        <PropertyForm 
          onPropertyCreated={mockOnPropertyCreated}
          onCancel={mockOnCancel}
        />
      )

      // Submit empty form
      await act(async () => {
        await user.click(screen.getByText('Add Property'))
      })

      // First invalid field (address) should receive focus
      await waitFor(() => {
        expect(screen.getByLabelText(/address/i)).toHaveFocus()
      })
    })

    it('should maintain focus on submit button during loading', async () => {
      const user = userEvent.setup()
      let resolvePromise: (value: any) => void
      
      const submissionPromise = new Promise((resolve) => {
        resolvePromise = resolve
      })
      
      mockPropertyService.createProperty.mockReturnValue(submissionPromise)

      render(
        <PropertyForm 
          onPropertyCreated={mockOnPropertyCreated}
          onCancel={mockOnCancel}
        />
      )

      // Fill valid form and click submit
      await user.type(screen.getByLabelText(/address/i), '123 Test Street')
      await user.type(screen.getByLabelText(/price/i), '250000')
      await user.type(screen.getByLabelText(/bedrooms/i), '3')
      await user.type(screen.getByLabelText(/bathrooms/i), '2')

      const submitButton = screen.getByText('Add Property')
      await user.click(submitButton)

      // Button should maintain focus during loading
      expect(submitButton).toHaveFocus()

      // Resolve the promise
      resolvePromise({ id: 'test-id' })
    })

    it('should manage focus after successful submission', async () => {
      const user = userEvent.setup()
      mockPropertyService.createProperty.mockResolvedValue({ id: 'test-id' })

      render(
        <PropertyForm 
          onPropertyCreated={mockOnPropertyCreated}
          onCancel={mockOnCancel}
        />
      )

      await user.type(screen.getByLabelText(/address/i), '123 Test Street')
      await user.type(screen.getByLabelText(/price/i), '250000')
      await user.type(screen.getByLabelText(/bedrooms/i), '3')
      await user.type(screen.getByLabelText(/bathrooms/i), '2')

      await act(async () => {
        await user.click(screen.getByText('Add Property'))
      })

      // After successful submission, focus should return to first field
      await waitFor(() => {
        expect(screen.getByLabelText(/address/i)).toHaveFocus()
      })
    })
  })

  describe('Screen Reader Announcements', () => {
    it('should announce form submission status', async () => {
      const user = userEvent.setup()
      mockPropertyService.createProperty.mockResolvedValue({ id: 'test-id' })

      render(
        <PropertyForm 
          onPropertyCreated={mockOnPropertyCreated}
          onCancel={mockOnCancel}
        />
      )

      await user.type(screen.getByLabelText(/address/i), '123 Test Street')
      await user.type(screen.getByLabelText(/price/i), '250000')
      await user.type(screen.getByLabelText(/bedrooms/i), '3')
      await user.type(screen.getByLabelText(/bathrooms/i), '2')

      await act(async () => {
        await user.click(screen.getByText('Add Property'))
      })

      // Should have live region for status announcements
      await waitFor(() => {
        const statusRegion = screen.getByRole('status')
        expect(statusRegion).toHaveTextContent(/property created successfully/i)
      })
    })

    it('should announce validation errors', async () => {
      const user = userEvent.setup()
      render(
        <PropertyForm 
          onPropertyCreated={mockOnPropertyCreated}
          onCancel={mockOnCancel}
        />
      )

      await act(async () => {
        await user.click(screen.getByText('Add Property'))
      })

      // Error announcements should be in live regions
      await waitFor(() => {
        const errorRegion = screen.getByRole('alert')
        expect(errorRegion).toBeInTheDocument()
      })
    })
  })

  describe('Form Fieldset and Legend', () => {
    it('should group related fields in fieldsets', () => {
      render(
        <PropertyForm 
          onPropertyCreated={mockOnPropertyCreated}
          onCancel={mockOnCancel}
        />
      )

      // Should have fieldsets for grouping
      const basicInfoFieldset = screen.getByRole('group', { name: /basic information/i })
      const detailsFieldset = screen.getByRole('group', { name: /property details/i })

      expect(basicInfoFieldset).toBeInTheDocument()
      expect(detailsFieldset).toBeInTheDocument()
    })

    it('should have descriptive legends for fieldsets', () => {
      render(
        <PropertyForm 
          onPropertyCreated={mockOnPropertyCreated}
          onCancel={mockOnCancel}
        />
      )

      expect(screen.getByText(/basic property information/i)).toBeInTheDocument()
      expect(screen.getByText(/additional details/i)).toBeInTheDocument()
    })
  })
})