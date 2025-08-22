import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PropertyForm from '../PropertyForm'
import { PropertyService } from '@/components/property'
import { setupTest } from '@/test/utils/testSetup'
import { ComponentMockFactory } from '@/test/mocks'

// Mock PropertyService
jest.mock('@/components/property', () => ({
  PropertyService: {
    createProperty: jest.fn()
  }
}))

const mockPropertyService = PropertyService as jest.Mocked<typeof PropertyService>

describe('PropertyForm - Validation', () => {
  setupTest({ suppressConsoleErrors: true })

  const mockOnPropertyCreated = jest.fn()
  const mockOnCancel = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

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

    it('should accept decimal bathroom values', async () => {
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

      // ARRANGE - Fill form with decimal bathrooms
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

      // ASSERT - Should successfully accept decimal bathrooms
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
    })
  })

  describe('Required Field Validation', () => {
    it('should require address field', async () => {
      const user = userEvent.setup()
      render(
        <PropertyForm 
          onPropertyCreated={mockOnPropertyCreated}
          onCancel={mockOnCancel}
        />
      )

      // Submit without address
      await act(async () => {
        await user.click(screen.getByText('Add Property'))
      })

      await waitFor(() => {
        expect(screen.getByText(/Address is required/i)).toBeInTheDocument()
      })
    })

    it('should require price field', async () => {
      const user = userEvent.setup()
      render(
        <PropertyForm 
          onPropertyCreated={mockOnPropertyCreated}
          onCancel={mockOnCancel}
        />
      )

      await user.type(screen.getByLabelText(/address/i), '123 Test Street')

      // Submit without price
      await act(async () => {
        await user.click(screen.getByText('Add Property'))
      })

      await waitFor(() => {
        expect(screen.getByText(/Price is required/i)).toBeInTheDocument()
      })
    })

    it('should require bedrooms field', async () => {
      const user = userEvent.setup()
      render(
        <PropertyForm 
          onPropertyCreated={mockOnPropertyCreated}
          onCancel={mockOnCancel}
        />
      )

      await user.type(screen.getByLabelText(/address/i), '123 Test Street')
      await user.type(screen.getByLabelText(/price/i), '250000')

      // Submit without bedrooms
      await act(async () => {
        await user.click(screen.getByText('Add Property'))
      })

      await waitFor(() => {
        expect(screen.getByText(/Bedrooms is required/i)).toBeInTheDocument()
      })
    })

    it('should require bathrooms field', async () => {
      const user = userEvent.setup()
      render(
        <PropertyForm 
          onPropertyCreated={mockOnPropertyCreated}
          onCancel={mockOnCancel}
        />
      )

      await user.type(screen.getByLabelText(/address/i), '123 Test Street')
      await user.type(screen.getByLabelText(/price/i), '250000')
      await user.type(screen.getByLabelText(/bedrooms/i), '3')

      // Submit without bathrooms
      await act(async () => {
        await user.click(screen.getByText('Add Property'))
      })

      await waitFor(() => {
        expect(screen.getByText(/Bathrooms is required/i)).toBeInTheDocument()
      })
    })
  })

  describe('Field Format Validation', () => {
    it('should validate address format', async () => {
      const user = userEvent.setup()
      render(
        <PropertyForm 
          onPropertyCreated={mockOnPropertyCreated}
          onCancel={mockOnCancel}
        />
      )

      // Try address that's too short
      await user.type(screen.getByLabelText(/address/i), 'x')
      await user.type(screen.getByLabelText(/price/i), '250000')
      await user.type(screen.getByLabelText(/bedrooms/i), '3')
      await user.type(screen.getByLabelText(/bathrooms/i), '2')

      await act(async () => {
        await user.click(screen.getByText('Add Property'))
      })

      await waitFor(() => {
        expect(screen.getByText(/Address must be at least 5 characters/i)).toBeInTheDocument()
      })
    })

    it('should validate area field when provided', async () => {
      const user = userEvent.setup()
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
      await user.type(screen.getByLabelText(/area/i), 'invalid-area')

      await act(async () => {
        await user.click(screen.getByText('Add Property'))
      })

      await waitFor(() => {
        expect(screen.getByText(/Area must be a valid number/i)).toBeInTheDocument()
      })
    })
  })

  describe('Real-time Validation', () => {
    it('should show validation errors as user types', async () => {
      const user = userEvent.setup()
      render(
        <PropertyForm 
          onPropertyCreated={mockOnPropertyCreated}
          onCancel={mockOnCancel}
        />
      )

      // Type invalid price
      await user.type(screen.getByLabelText(/price/i), 'abc')
      
      // Move focus away (blur event)
      await user.tab()

      await waitFor(() => {
        expect(screen.getByText(/Price must be a valid number/i)).toBeInTheDocument()
      })
    })

    it('should clear validation errors when field becomes valid', async () => {
      const user = userEvent.setup()
      render(
        <PropertyForm 
          onPropertyCreated={mockOnPropertyCreated}
          onCancel={mockOnCancel}
        />
      )

      // Type invalid price first
      await user.type(screen.getByLabelText(/price/i), 'abc')
      await user.tab()

      await waitFor(() => {
        expect(screen.getByText(/Price must be a valid number/i)).toBeInTheDocument()
      })

      // Clear and type valid price
      await user.clear(screen.getByLabelText(/price/i))
      await user.type(screen.getByLabelText(/price/i), '250000')
      await user.tab()

      await waitFor(() => {
        expect(screen.queryByText(/Price must be a valid number/i)).not.toBeInTheDocument()
      })
    })
  })
})