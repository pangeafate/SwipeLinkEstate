import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PropertyForm from '../PropertyForm'
import { PropertyService } from '@/components/property'
import { setupTest } from '@/test/utils/testSetup'

// Mock PropertyService
jest.mock('@/components/property', () => ({
  PropertyService: {
    createProperty: jest.fn()
  }
}))

const mockPropertyService = PropertyService as jest.Mocked<typeof PropertyService>

describe('PropertyForm - Error Handling', () => {
  setupTest({ suppressConsoleErrors: true })

  const mockOnPropertyCreated = jest.fn()
  const mockOnCancel = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('API Error Handling', () => {
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

    it('should handle validation errors from server', async () => {
      const user = userEvent.setup()
      const validationError = new Error('Validation failed')
      validationError.response = {
        data: {
          errors: {
            address: 'Address already exists',
            price: 'Price is too high'
          }
        }
      }
      
      mockPropertyService.createProperty.mockRejectedValue(validationError)

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

      await waitFor(() => {
        expect(screen.getByText(/Address already exists/i)).toBeInTheDocument()
        expect(screen.getByText(/Price is too high/i)).toBeInTheDocument()
      })
    })

    it('should handle 400 Bad Request errors', async () => {
      const user = userEvent.setup()
      const badRequestError = new Error('Bad Request')
      badRequestError.response = { status: 400 }
      
      mockPropertyService.createProperty.mockRejectedValue(badRequestError)

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

      await waitFor(() => {
        expect(screen.getByText(/Invalid property data/i)).toBeInTheDocument()
      })
    })

    it('should handle 500 server errors', async () => {
      const user = userEvent.setup()
      const serverError = new Error('Internal Server Error')
      serverError.response = { status: 500 }
      
      mockPropertyService.createProperty.mockRejectedValue(serverError)

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

      await waitFor(() => {
        expect(screen.getByText(/Server error occurred/i)).toBeInTheDocument()
      })
    })

    it('should handle network timeout errors', async () => {
      const user = userEvent.setup()
      const timeoutError = new Error('Request timeout')
      timeoutError.code = 'NETWORK_TIMEOUT'
      
      mockPropertyService.createProperty.mockRejectedValue(timeoutError)

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

      await waitFor(() => {
        expect(screen.getByText(/Request timed out/i)).toBeInTheDocument()
      })
    })
  })

  describe('Error Recovery', () => {
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

    it('should allow retrying after error', async () => {
      const user = userEvent.setup()
      mockPropertyService.createProperty.mockRejectedValue(new Error('Network error'))

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

      // First attempt
      await act(async () => {
        await user.click(screen.getByText('Add Property'))
      })

      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument()
      })

      // Button should be enabled for retry
      expect(screen.getByText('Add Property')).not.toBeDisabled()

      // Should be able to try again
      await act(async () => {
        await user.click(screen.getByText('Add Property'))
      })

      expect(mockPropertyService.createProperty).toHaveBeenCalledTimes(2)
    })

    it('should preserve form data after error', async () => {
      const user = userEvent.setup()
      mockPropertyService.createProperty.mockRejectedValue(new Error('Network error'))

      render(
        <PropertyForm 
          onPropertyCreated={mockOnPropertyCreated}
          onCancel={mockOnCancel}
        />
      )

      const addressValue = '123 Test Street'
      const priceValue = '250000'
      const bedroomsValue = '3'
      const bathroomsValue = '2'

      await user.type(screen.getByLabelText(/address/i), addressValue)
      await user.type(screen.getByLabelText(/price/i), priceValue)
      await user.type(screen.getByLabelText(/bedrooms/i), bedroomsValue)
      await user.type(screen.getByLabelText(/bathrooms/i), bathroomsValue)

      await act(async () => {
        await user.click(screen.getByText('Add Property'))
      })

      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument()
      })

      // Form data should still be preserved
      expect(screen.getByLabelText(/address/i)).toHaveValue(addressValue)
      expect(screen.getByLabelText(/price/i)).toHaveValue(priceValue)
      expect(screen.getByLabelText(/bedrooms/i)).toHaveValue(bedroomsValue)
      expect(screen.getByLabelText(/bathrooms/i)).toHaveValue(bathroomsValue)
    })
  })

  describe('Error Display', () => {
    it('should show error with proper styling', async () => {
      const user = userEvent.setup()
      mockPropertyService.createProperty.mockRejectedValue(new Error('Test error'))

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

      await waitFor(() => {
        const errorElement = screen.getByText(/test error/i)
        expect(errorElement).toBeInTheDocument()
        expect(errorElement).toHaveClass('text-red-600') // Error styling
      })
    })

    it('should have dismissible error messages', async () => {
      const user = userEvent.setup()
      mockPropertyService.createProperty.mockRejectedValue(new Error('Dismissible error'))

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

      await waitFor(() => {
        expect(screen.getByText(/dismissible error/i)).toBeInTheDocument()
      })

      // Look for dismiss button
      const dismissButton = screen.getByRole('button', { name: /dismiss|close|×/i })
      await user.click(dismissButton)

      await waitFor(() => {
        expect(screen.queryByText(/dismissible error/i)).not.toBeInTheDocument()
      })
    })
  })
})