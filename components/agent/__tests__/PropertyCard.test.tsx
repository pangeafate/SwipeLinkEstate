import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, jest } from '@jest/globals'
import PropertyCard from '../PropertyCard'
import type { Property } from '@/lib/supabase/types'

const mockProperty: Property = {
  id: '1',
  address: '123 Ocean Drive, Miami Beach, FL 33139',
  price: 850000,
  bedrooms: 2,
  bathrooms: 2.0,
  area_sqft: 1200,
  description: 'Stunning oceanfront condo with panoramic views',
  features: ['Ocean View', 'Balcony', 'Pool', 'Gym'],
  cover_image: 'https://example.com/image.jpg',
  images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
  status: 'active',
  created_at: '2023-01-01T00:00:00.000Z',
  updated_at: '2023-01-01T00:00:00.000Z',
}

describe('PropertyCard', () => {
  it('should render property information correctly', () => {
    // ARRANGE & ACT
    render(<PropertyCard property={mockProperty} />)
    
    // ASSERT
    expect(screen.getByText('$850,000')).toBeInTheDocument()
    expect(screen.getByText('123 Ocean Drive, Miami Beach')).toBeInTheDocument()
    expect(screen.getByText('2 beds, 2 baths')).toBeInTheDocument()
    expect(screen.getByText('1,200 sq ft')).toBeInTheDocument()
  })

  it('should display active status indicator', () => {
    // ARRANGE & ACT
    render(<PropertyCard property={mockProperty} />)
    
    // ASSERT
    const statusIndicator = screen.getByTestId('status-indicator')
    expect(statusIndicator).toHaveClass('bg-green-500')
  })

  it('should display off-market status indicator', () => {
    // ARRANGE
    const offMarketProperty = { ...mockProperty, status: 'off-market' as const }
    
    // ACT
    render(<PropertyCard property={offMarketProperty} />)
    
    // ASSERT
    const statusIndicator = screen.getByTestId('status-indicator')
    expect(statusIndicator).toHaveClass('bg-gray-400')
  })

  it('should handle missing price', () => {
    // ARRANGE
    const propertyWithoutPrice = { ...mockProperty, price: null }
    
    // ACT
    render(<PropertyCard property={propertyWithoutPrice} />)
    
    // ASSERT
    expect(screen.getByText('Price on request')).toBeInTheDocument()
  })

  it('should call onClick when card is clicked', async () => {
    // ARRANGE
    const handleClick = jest.fn()
    render(<PropertyCard property={mockProperty} onClick={handleClick} />)
    
    // ACT
    fireEvent.click(screen.getByTestId('property-card'))
    
    // ASSERT
    await waitFor(() => {
      expect(handleClick).toHaveBeenCalledWith(mockProperty)
    })
  })

  it('should call onEdit when edit button is clicked', async () => {
    // ARRANGE
    const handleEdit = jest.fn()
    render(<PropertyCard property={mockProperty} onEdit={handleEdit} />)
    
    // ACT
    fireEvent.click(screen.getByText('Edit'))
    
    // ASSERT
    await waitFor(() => {
      expect(handleEdit).toHaveBeenCalledWith(mockProperty)
    })
  })

  it('should show selected state when selected prop is true', () => {
    // ARRANGE & ACT
    render(<PropertyCard property={mockProperty} selected={true} />)
    
    // ASSERT
    const card = screen.getByTestId('property-card')
    expect(card).toHaveClass('ring-2', 'ring-primary-500')
  })

  it('should not show edit button when onEdit is not provided', () => {
    // ARRANGE & ACT
    render(<PropertyCard property={mockProperty} />)
    
    // ASSERT
    expect(screen.queryByText('Edit')).not.toBeInTheDocument()
  })

  it('should display features as badges', () => {
    // ARRANGE & ACT
    render(<PropertyCard property={mockProperty} />)
    
    // ASSERT
    expect(screen.getByText('Ocean View')).toBeInTheDocument()
    expect(screen.getByText('Balcony')).toBeInTheDocument()
    expect(screen.getByText('Pool')).toBeInTheDocument()
    expect(screen.getByText('+1 more')).toBeInTheDocument()
  })

  it('should use placeholder image when cover_image is null', () => {
    // ARRANGE
    const propertyWithoutImage = { ...mockProperty, cover_image: null }
    
    // ACT
    render(<PropertyCard property={propertyWithoutImage} />)
    
    // ASSERT
    const image = screen.getByRole('img')
    expect(image).toHaveAttribute('src', expect.stringContaining('placeholder'))
  })
})