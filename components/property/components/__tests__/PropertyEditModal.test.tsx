/**
 * PropertyEditModal Component Tests
 * TDD approach - tests before implementation
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PropertyEditModal } from '../PropertyEditModal'
import { PropertyService } from '../../property.service'
import { Property } from '../../types/property.types'

// Mock PropertyService
jest.mock('../../property.service')

const mockProperty: Property = {
  id: '1',
  address: '123 Main St',
  city: 'San Francisco',
  state: 'CA',
  zipCode: '94105',
  price: 750000,
  bedrooms: 3,
  bathrooms: 2,
  sqft: 1500,
  type: 'house',
  status: 'available',
  description: 'Beautiful home',
  images: [],
  features: [],
  createdAt: new Date(),
  updatedAt: new Date()
}

describe('PropertyEditModal', () => {
  const mockOnClose = jest.fn()
  const mockOnSave = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render edit modal with property data', () => {
    // Act
    render(
      <PropertyEditModal
        property={mockProperty}
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    )

    // Assert
    expect(screen.getByText(/edit property/i)).toBeInTheDocument()
    expect(screen.getByDisplayValue('123 Main St')).toBeInTheDocument()
    expect(screen.getByDisplayValue('San Francisco')).toBeInTheDocument()
    expect(screen.getByDisplayValue('750000')).toBeInTheDocument()
  })

  it('should not render when isOpen is false', () => {
    // Act
    render(
      <PropertyEditModal
        property={mockProperty}
        isOpen={false}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    )

    // Assert
    expect(screen.queryByText(/edit property/i)).not.toBeInTheDocument()
  })

  it('should update form fields when user types', async () => {
    // Arrange
    const user = userEvent.setup()

    // Act
    render(
      <PropertyEditModal
        property={mockProperty}
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    )

    const addressInput = screen.getByLabelText(/address/i)
    await user.clear(addressInput)
    await user.type(addressInput, '456 New St')

    // Assert
    expect(addressInput).toHaveValue('456 New St')
  })

  it('should validate required fields', async () => {
    // Arrange
    const user = userEvent.setup()

    // Act
    render(
      <PropertyEditModal
        property={mockProperty}
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    )

    const addressInput = screen.getByLabelText(/address/i)
    await user.clear(addressInput)
    
    const saveButton = screen.getByRole('button', { name: /save changes/i })
    await user.click(saveButton)

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/address is required/i)).toBeInTheDocument()
    })
    expect(mockOnSave).not.toHaveBeenCalled()
  })

  it('should validate price is a positive number', async () => {
    // Arrange
    const user = userEvent.setup()

    // Act
    render(
      <PropertyEditModal
        property={mockProperty}
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    )

    const priceInput = screen.getByLabelText(/price/i)
    await user.clear(priceInput)
    await user.type(priceInput, '-100')
    
    const saveButton = screen.getByRole('button', { name: /save changes/i })
    await user.click(saveButton)

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/price must be a positive number/i)).toBeInTheDocument()
    })
  })

  it('should call PropertyService.updateProperty with updated data', async () => {
    // Arrange
    const user = userEvent.setup()
    const mockUpdate = jest.fn().mockResolvedValue({
      success: true,
      property: { ...mockProperty, address: '456 New St' }
    })
    ;(PropertyService.updateProperty as jest.Mock) = mockUpdate

    // Act
    render(
      <PropertyEditModal
        property={mockProperty}
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    )

    const addressInput = screen.getByLabelText(/address/i)
    await user.clear(addressInput)
    await user.type(addressInput, '456 New St')
    
    const saveButton = screen.getByRole('button', { name: /save changes/i })
    await user.click(saveButton)

    // Assert
    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith('1', expect.objectContaining({
        address: '456 New St',
        city: 'San Francisco',
        state: 'CA',
        price: 750000
      }))
    })
  })

  it('should call onSave callback with updated property', async () => {
    // Arrange
    const user = userEvent.setup()
    const updatedProperty = { ...mockProperty, address: '456 New St' }
    const mockUpdate = jest.fn().mockResolvedValue({
      success: true,
      property: updatedProperty
    })
    ;(PropertyService.updateProperty as jest.Mock) = mockUpdate

    // Act
    render(
      <PropertyEditModal
        property={mockProperty}
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    )

    const addressInput = screen.getByLabelText(/address/i)
    await user.clear(addressInput)
    await user.type(addressInput, '456 New St')
    
    const saveButton = screen.getByRole('button', { name: /save changes/i })
    await user.click(saveButton)

    // Assert
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(updatedProperty)
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  it('should display error message on update failure', async () => {
    // Arrange
    const user = userEvent.setup()
    const mockUpdate = jest.fn().mockResolvedValue({
      success: false,
      error: 'Failed to update property'
    })
    ;(PropertyService.updateProperty as jest.Mock) = mockUpdate

    // Act
    render(
      <PropertyEditModal
        property={mockProperty}
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    )

    const saveButton = screen.getByRole('button', { name: /save changes/i })
    await user.click(saveButton)

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/failed to update property/i)).toBeInTheDocument()
    })
    expect(mockOnSave).not.toHaveBeenCalled()
  })

  it('should show loading state during save', async () => {
    // Arrange
    const user = userEvent.setup()
    const mockUpdate = jest.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({
        success: true,
        property: mockProperty
      }), 100))
    )
    ;(PropertyService.updateProperty as jest.Mock) = mockUpdate

    // Act
    render(
      <PropertyEditModal
        property={mockProperty}
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    )

    const saveButton = screen.getByRole('button', { name: /save changes/i })
    await user.click(saveButton)

    // Assert
    expect(screen.getByText(/saving/i)).toBeInTheDocument()
    expect(saveButton).toBeDisabled()

    await waitFor(() => {
      expect(screen.queryByText(/saving/i)).not.toBeInTheDocument()
    })
  })

  it('should call onClose when cancel button is clicked', async () => {
    // Arrange
    const user = userEvent.setup()

    // Act
    render(
      <PropertyEditModal
        property={mockProperty}
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    )

    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    await user.click(cancelButton)

    // Assert
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('should call onClose when clicking outside modal', async () => {
    // Arrange
    const user = userEvent.setup()

    // Act
    render(
      <PropertyEditModal
        property={mockProperty}
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    )

    const backdrop = screen.getByTestId('modal-backdrop')
    await user.click(backdrop)

    // Assert
    expect(mockOnClose).toHaveBeenCalled()
  })
})