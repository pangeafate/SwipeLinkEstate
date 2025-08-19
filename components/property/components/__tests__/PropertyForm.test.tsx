import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PropertyForm from '../PropertyForm'
import { PropertyService } from '@/components/property'

// Mock PropertyService
jest.mock('@/components/property', () => ({
  PropertyService: {
    createProperty: jest.fn()
  }
}))

const mockPropertyService = PropertyService as jest.Mocked<typeof PropertyService>

describe('PropertyForm Type Safety and Validation', () => {
  const mockOnPropertyCreated = jest.fn()
  const mockOnCancel = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  // Test for type safety issue - numeric validation
  describe('Numeric Field Validation', () => {
    it('should reject invalid price values and show error', async () => {
      const user = userEvent.setup()
      render(
        <PropertyForm 
          onPropertyCreated={mockOnPropertyCreated}
          onCancel={mockOnCancel}
        />
      )

      // ARRANGE - Fill form with invalid price
      await user.type(screen.getByLabelText(/address/i), '123 Test Street')
      await user.type(screen.getByLabelText(/price/i), 'invalid-price')
      await user.type(screen.getByLabelText(/bedrooms/i), '2')
      await user.type(screen.getByLabelText(/bathrooms/i), '1')

      // ACT - Submit form
      await act(async () => {
        await user.click(screen.getByText('Add Property'))
      })

      // ASSERT - Should show error for invalid price
      await waitFor(() => {
        expect(screen.getByText(/invalid price value/i)).toBeInTheDocument()
      })
      expect(mockPropertyService.createProperty).not.toHaveBeenCalled()
    })

    it('should reject negative price values', async () => {
      const user = userEvent.setup()
      render(
        <PropertyForm 
          onPropertyCreated={mockOnPropertyCreated}
          onCancel={mockOnCancel}
        />
      )

      // ARRANGE
      await user.type(screen.getByLabelText(/address/i), '123 Test Street')
      await user.type(screen.getByLabelText(/price/i), '-100000')
      await user.type(screen.getByLabelText(/bedrooms/i), '2')
      await user.type(screen.getByLabelText(/bathrooms/i), '1')

      // ACT
      await act(async () => {
        await user.click(screen.getByText('Add Property'))
      })

      // ASSERT
      await waitFor(() => {
        expect(screen.getByText(/price must be greater than 0/i)).toBeInTheDocument()
      })
    })

    it('should reject non-integer bedroom values', async () => {
      const user = userEvent.setup()
      render(
        <PropertyForm 
          onPropertyCreated={mockOnPropertyCreated}
          onCancel={mockOnCancel}
        />
      )

      // ARRANGE
      await user.type(screen.getByLabelText(/address/i), '123 Test Street')
      await user.type(screen.getByLabelText(/price/i), '100000')
      await user.type(screen.getByLabelText(/bedrooms/i), '2.5') // Invalid - should be integer
      await user.type(screen.getByLabelText(/bathrooms/i), '1')

      // ACT
      await act(async () => {
        await user.click(screen.getByText('Add Property'))
      })

      // ASSERT
      await waitFor(() => {
        expect(screen.getByText(/bedrooms must be a whole number/i)).toBeInTheDocument()
      })
    })

    it('should reject zero bedrooms', async () => {
      const user = userEvent.setup()
      render(
        <PropertyForm 
          onPropertyCreated={mockOnPropertyCreated}
          onCancel={mockOnCancel}
        />
      )

      // ARRANGE
      await user.type(screen.getByLabelText(/address/i), '123 Test Street')
      await user.type(screen.getByLabelText(/price/i), '100000')
      await user.type(screen.getByLabelText(/bedrooms/i), '0')
      await user.type(screen.getByLabelText(/bathrooms/i), '1')

      // ACT
      await act(async () => {
        await user.click(screen.getByText('Add Property'))
      })

      // ASSERT
      await waitFor(() => {
        expect(screen.getByText(/property must have at least 1 bedroom/i)).toBeInTheDocument()
      })
    })

    it('should accept valid numeric values and create property', async () => {
      const user = userEvent.setup()
      const mockCreatedProperty = {
        id: 'new-prop-id',
        address: '123 Test Street',
        price: 250000,
        bedrooms: 3,
        bathrooms: 2.5,
        area_sqft: 1500,
        property_type: 'house',
        status: 'active'
      }

      mockPropertyService.createProperty.mockResolvedValue(mockCreatedProperty)

      render(
        <PropertyForm 
          onPropertyCreated={mockOnPropertyCreated}
          onCancel={mockOnCancel}
        />
      )

      // ARRANGE - Fill form with valid data
      await act(async () => {
        await user.type(screen.getByLabelText(/address/i), '123 Test Street')
        await user.type(screen.getByLabelText(/price/i), '250000')
        await user.type(screen.getByLabelText(/bedrooms/i), '3')
        await user.type(screen.getByLabelText(/bathrooms/i), '2.5')
        await user.type(screen.getByLabelText(/area/i), '1500')
      })

      // ACT
      await act(async () => {
        await user.click(screen.getByText('Add Property'))
      })

      // ASSERT - Should successfully create property
      await waitFor(() => {
        expect(mockPropertyService.createProperty).toHaveBeenCalledWith({
          address: '123 Test Street',
          price: 250000,
          bedrooms: 3,
          bathrooms: 2.5,
          area_sqft: 1500,
          description: null,
          property_type: 'house',
          features: null,
          status: 'active'
        })
      })
      expect(mockOnPropertyCreated).toHaveBeenCalledWith(mockCreatedProperty)
    })
  })

  // Test for error handling improvements
  describe('Error Handling', () => {
    it('should show user-friendly error when API fails', async () => {
      const user = userEvent.setup()
      mockPropertyService.createProperty.mockRejectedValue(new Error('Network error'))

      render(
        <PropertyForm 
          onPropertyCreated={mockOnPropertyCreated}
          onCancel={mockOnCancel}
        />
      )

      // ARRANGE - Fill valid form
      await user.type(screen.getByLabelText(/address/i), '123 Test Street')
      await user.type(screen.getByLabelText(/price/i), '250000')
      await user.type(screen.getByLabelText(/bedrooms/i), '3')
      await user.type(screen.getByLabelText(/bathrooms/i), '2')

      // ACT
      await act(async () => {
        await user.click(screen.getByText('Add Property'))
      })

      // ASSERT - Should show error message
      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument()
      })
      expect(mockOnPropertyCreated).not.toHaveBeenCalled()
    })

    it('should clear previous errors when form is resubmitted', async () => {
      const user = userEvent.setup()
      const mockCreatedProperty = { id: 'new-prop', address: '123 Test Street' }

      // First fail, then succeed
      mockPropertyService.createProperty
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(mockCreatedProperty)

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

      // First submission - should fail
      await act(async () => {
        await user.click(screen.getByText('Add Property'))
      })
      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument()
      })

      // Second submission - should clear error and succeed
      await act(async () => {
        await user.click(screen.getByText('Add Property'))
      })
      await waitFor(() => {
        expect(screen.queryByText(/network error/i)).not.toBeInTheDocument()
      })
    })
  })

  // Test for accessibility improvements
  describe('Accessibility', () => {
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
  })
})