import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PropertyForm from '../PropertyForm'
import { PropertyService } from '@/components/property'
import { setupTest } from '@/test/utils/testSetup'
import { fixtures } from '@/test/fixtures'

// Mock PropertyService
jest.mock('@/components/property', () => ({
  PropertyService: {
    createProperty: jest.fn()
  }
}))

const mockPropertyService = PropertyService as jest.Mocked<typeof PropertyService>

describe('PropertyForm - Submission', () => {
  setupTest({ suppressConsoleErrors: true })

  const mockOnPropertyCreated = jest.fn()
  const mockOnCancel = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Successful Submission', () => {
    it('should accept valid numeric values and create property', async () => {
      const user = userEvent.setup()
      const mockCreatedProperty = fixtures.properties[0]

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

    it('should handle optional fields correctly', async () => {
      const user = userEvent.setup()
      const mockCreatedProperty = {
        id: 'new-prop-id',
        address: '456 Oak Avenue',
        price: 350000,
        bedrooms: 2,
        bathrooms: 1,
        property_type: 'apartment',
        status: 'active'
      }

      mockPropertyService.createProperty.mockResolvedValue(mockCreatedProperty)

      render(
        <PropertyForm 
          onPropertyCreated={mockOnPropertyCreated}
          onCancel={mockOnCancel}
        />
      )

      // Fill only required fields
      await act(async () => {
        await user.type(screen.getByLabelText(/address/i), '456 Oak Avenue')
        await user.type(screen.getByLabelText(/price/i), '350000')
        await user.type(screen.getByLabelText(/bedrooms/i), '2')
        await user.type(screen.getByLabelText(/bathrooms/i), '1')
        await user.selectOptions(screen.getByLabelText(/property type/i), 'apartment')
      })

      await act(async () => {
        await user.click(screen.getByText('Add Property'))
      })

      await waitFor(() => {
        expect(mockPropertyService.createProperty).toHaveBeenCalledWith({
          address: '456 Oak Avenue',
          price: 350000,
          bedrooms: 2,
          bathrooms: 1,
          area_sqft: null,
          description: null,
          property_type: 'apartment',
          features: null,
          status: 'active'
        })
      })
    })

    it('should handle form with all fields filled', async () => {
      const user = userEvent.setup()
      const fullPropertyData = {
        id: 'full-prop-id',
        address: '789 Pine Street',
        price: 500000,
        bedrooms: 4,
        bathrooms: 3,
        area_sqft: 2000,
        property_type: 'house',
        description: 'Beautiful family home',
        features: 'garage,pool,garden',
        status: 'active'
      }

      mockPropertyService.createProperty.mockResolvedValue(fullPropertyData)

      render(
        <PropertyForm 
          onPropertyCreated={mockOnPropertyCreated}
          onCancel={mockOnCancel}
        />
      )

      await act(async () => {
        await user.type(screen.getByLabelText(/address/i), '789 Pine Street')
        await user.type(screen.getByLabelText(/price/i), '500000')
        await user.type(screen.getByLabelText(/bedrooms/i), '4')
        await user.type(screen.getByLabelText(/bathrooms/i), '3')
        await user.type(screen.getByLabelText(/area/i), '2000')
        await user.type(screen.getByLabelText(/description/i), 'Beautiful family home')
        await user.type(screen.getByLabelText(/features/i), 'garage,pool,garden')
      })

      await act(async () => {
        await user.click(screen.getByText('Add Property'))
      })

      await waitFor(() => {
        expect(mockPropertyService.createProperty).toHaveBeenCalledWith({
          address: '789 Pine Street',
          price: 500000,
          bedrooms: 4,
          bathrooms: 3,
          area_sqft: 2000,
          description: 'Beautiful family home',
          property_type: 'house',
          features: 'garage,pool,garden',
          status: 'active'
        })
      })
    })
  })

  describe('Submission Loading State', () => {
    it('should show loading state during submission', async () => {
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

      // Fill valid form
      await act(async () => {
        await user.type(screen.getByLabelText(/address/i), '123 Test Street')
        await user.type(screen.getByLabelText(/price/i), '250000')
        await user.type(screen.getByLabelText(/bedrooms/i), '3')
        await user.type(screen.getByLabelText(/bathrooms/i), '2')
      })

      // Submit form
      await act(async () => {
        await user.click(screen.getByText('Add Property'))
      })

      // Should show loading state
      expect(screen.getByText(/Creating property.../i)).toBeInTheDocument()
      expect(screen.getByText('Add Property')).toBeDisabled()

      // Resolve the promise
      resolvePromise(fixtures.properties[0])
      
      await waitFor(() => {
        expect(screen.queryByText(/Creating property.../i)).not.toBeInTheDocument()
      })
    })

    it('should disable form fields during submission', async () => {
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

      // Fill and submit form
      await act(async () => {
        await user.type(screen.getByLabelText(/address/i), '123 Test Street')
        await user.type(screen.getByLabelText(/price/i), '250000')
        await user.type(screen.getByLabelText(/bedrooms/i), '3')
        await user.type(screen.getByLabelText(/bathrooms/i), '2')
        await user.click(screen.getByText('Add Property'))
      })

      // Form fields should be disabled
      expect(screen.getByLabelText(/address/i)).toBeDisabled()
      expect(screen.getByLabelText(/price/i)).toBeDisabled()
      expect(screen.getByLabelText(/bedrooms/i)).toBeDisabled()
      expect(screen.getByLabelText(/bathrooms/i)).toBeDisabled()

      // Resolve the promise
      resolvePromise(fixtures.properties[0])
    })
  })

  describe('Form Reset After Submission', () => {
    it('should reset form after successful submission', async () => {
      const user = userEvent.setup()
      mockPropertyService.createProperty.mockResolvedValue(fixtures.properties[0])

      render(
        <PropertyForm 
          onPropertyCreated={mockOnPropertyCreated}
          onCancel={mockOnCancel}
        />
      )

      // Fill and submit form
      await act(async () => {
        await user.type(screen.getByLabelText(/address/i), '123 Test Street')
        await user.type(screen.getByLabelText(/price/i), '250000')
        await user.type(screen.getByLabelText(/bedrooms/i), '3')
        await user.type(screen.getByLabelText(/bathrooms/i), '2')
        await user.click(screen.getByText('Add Property'))
      })

      // Form should be reset after successful submission
      await waitFor(() => {
        expect(screen.getByLabelText(/address/i)).toHaveValue('')
        expect(screen.getByLabelText(/price/i)).toHaveValue('')
        expect(screen.getByLabelText(/bedrooms/i)).toHaveValue('')
        expect(screen.getByLabelText(/bathrooms/i)).toHaveValue('')
      })
    })

    it('should show success message after submission', async () => {
      const user = userEvent.setup()
      mockPropertyService.createProperty.mockResolvedValue(fixtures.properties[0])

      render(
        <PropertyForm 
          onPropertyCreated={mockOnPropertyCreated}
          onCancel={mockOnCancel}
        />
      )

      await act(async () => {
        await user.type(screen.getByLabelText(/address/i), '123 Test Street')
        await user.type(screen.getByLabelText(/price/i), '250000')
        await user.type(screen.getByLabelText(/bedrooms/i), '3')
        await user.type(screen.getByLabelText(/bathrooms/i), '2')
        await user.click(screen.getByText('Add Property'))
      })

      await waitFor(() => {
        expect(screen.getByText(/Property created successfully/i)).toBeInTheDocument()
      })
    })
  })

  describe('Data Type Conversion', () => {
    it('should convert string inputs to correct data types', async () => {
      const user = userEvent.setup()
      mockPropertyService.createProperty.mockResolvedValue(fixtures.properties[0])

      render(
        <PropertyForm 
          onPropertyCreated={mockOnPropertyCreated}
          onCancel={mockOnCancel}
        />
      )

      await act(async () => {
        await user.type(screen.getByLabelText(/address/i), 'Type Conversion Test')
        await user.type(screen.getByLabelText(/price/i), '123456')
        await user.type(screen.getByLabelText(/bedrooms/i), '5')
        await user.type(screen.getByLabelText(/bathrooms/i), '3.5')
        await user.type(screen.getByLabelText(/area/i), '2500')
        await user.click(screen.getByText('Add Property'))
      })

      await waitFor(() => {
        expect(mockPropertyService.createProperty).toHaveBeenCalledWith({
          address: 'Type Conversion Test',
          price: 123456,        // Should be number, not string
          bedrooms: 5,          // Should be number, not string
          bathrooms: 3.5,       // Should be number, not string
          area_sqft: 2500,      // Should be number, not string
          description: null,
          property_type: 'house',
          features: null,
          status: 'active'
        })
      })
    })
  })
})