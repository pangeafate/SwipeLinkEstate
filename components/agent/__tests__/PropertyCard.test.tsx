import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, jest } from '@jest/globals'
import '@testing-library/jest-dom'
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
  features: ['Ocean View', 'Balcony', 'Pool', 'Gym'] as any, // Cast to Json type
  cover_image: 'https://example.com/image.jpg',
  images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'] as any, // Cast to Json type
  status: 'active',
  created_at: '2023-01-01T00:00:00.000Z',
  updated_at: '2023-01-01T00:00:00.000Z',
}

describe('PropertyCard', () => {
  it('should render property information correctly', () => {
    // ARRANGE & ACT
    render(<PropertyCard property={mockProperty} />)
    
    // ASSERT
    // @ts-expect-error Jest DOM matchers
    expect(screen.getByText('$850,000')).toBeInTheDocument()
    // @ts-expect-error Jest DOM matchers
    expect(screen.getByText('123 Ocean Drive, Miami Beach')).toBeInTheDocument()
    // @ts-expect-error Jest DOM matchers
    expect(screen.getByText('2 beds, 2 baths')).toBeInTheDocument()
    // @ts-expect-error Jest DOM matchers
    expect(screen.getByText('1,200 sq ft')).toBeInTheDocument()
  })

  it('should display active status indicator', () => {
    // ARRANGE & ACT
    render(<PropertyCard property={mockProperty} />)
    
    // ASSERT
    const statusIndicator = screen.getByTestId('status-indicator')
    // @ts-expect-error Jest DOM matchers
    expect(statusIndicator).toHaveClass('bg-green-500')
  })

  it('should display off-market status indicator', () => {
    // ARRANGE
    const offMarketProperty = { ...mockProperty, status: 'off-market' as const }
    
    // ACT
    render(<PropertyCard property={offMarketProperty} />)
    
    // ASSERT
    const statusIndicator = screen.getByTestId('status-indicator')
    // @ts-expect-error Jest DOM matchers
    expect(statusIndicator).toHaveClass('bg-orange-500')
  })

  it('should handle missing price', () => {
    // ARRANGE
    const propertyWithoutPrice = { ...mockProperty, price: null }
    
    // ACT
    render(<PropertyCard property={propertyWithoutPrice} />)
    
    // ASSERT
    // @ts-expect-error Jest DOM matchers
    expect(screen.getByText('Price on request')).toBeInTheDocument()
  })

  it('should call onClick when card is clicked', async () => {
    // ARRANGE
    const handleClick = jest.fn()
    render(<PropertyCard property={mockProperty} onClick={handleClick} />)
    
    // ACT
    fireEvent.click(screen.getByTestId('property-card-1'))
    
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
    const card = screen.getByTestId('property-card-1')
    // @ts-expect-error Jest DOM matchers
    expect(card).toHaveClass('ring-2', 'ring-primary-500')
  })

  it('should not show edit button when onEdit is not provided', () => {
    // ARRANGE & ACT
    render(<PropertyCard property={mockProperty} />)
    
    // ASSERT
    // @ts-expect-error Jest DOM matchers
    expect(screen.queryByText('Edit')).not.toBeInTheDocument()
  })

  it('should display features as badges', () => {
    // ARRANGE & ACT
    render(<PropertyCard property={mockProperty} />)
    
    // ASSERT
    // @ts-expect-error Jest DOM matchers
    expect(screen.getByText('Ocean View')).toBeInTheDocument()
    // @ts-expect-error Jest DOM matchers
    expect(screen.getByText('Balcony')).toBeInTheDocument()
    // @ts-expect-error Jest DOM matchers
    expect(screen.getByText('Pool')).toBeInTheDocument()
    // @ts-expect-error Jest DOM matchers
    expect(screen.getByText('+1 more')).toBeInTheDocument()
  })

  it('should use placeholder image when cover_image is null', () => {
    // ARRANGE
    const propertyWithoutImage = { ...mockProperty, cover_image: null, images: [] as any }
    
    // ACT
    render(<PropertyCard property={propertyWithoutImage} />)
    
    // ASSERT
    const image = screen.getByRole('img')
    // @ts-expect-error Jest DOM matchers
    expect(image).toHaveAttribute('src', expect.stringContaining('sample-1.jpg'))
  })

  it('should display default status color for unknown status', () => {
    // ARRANGE
    const propertyWithUnknownStatus = { 
      ...mockProperty, 
      status: 'unknown-status' as any 
    }
    
    // ACT
    render(<PropertyCard property={propertyWithUnknownStatus} />)
    
    // ASSERT
    const statusIndicator = screen.getByTestId('status-indicator')
    // @ts-expect-error Jest DOM matchers
    expect(statusIndicator).toHaveClass('bg-gray-400')
  })

  it('should display pending status indicator', () => {
    // ARRANGE
    const pendingProperty = { ...mockProperty, status: 'pending' as const }
    
    // ACT
    render(<PropertyCard property={pendingProperty} />)
    
    // ASSERT
    const statusIndicator = screen.getByTestId('status-indicator')
    // @ts-expect-error Jest DOM matchers
    expect(statusIndicator).toHaveClass('bg-yellow-500')
  })

  it('should display sold status indicator', () => {
    // ARRANGE
    const soldProperty = { ...mockProperty, status: 'sold' as const }
    
    // ACT
    render(<PropertyCard property={soldProperty} />)
    
    // ASSERT
    const statusIndicator = screen.getByTestId('status-indicator')
    // @ts-expect-error Jest DOM matchers
    expect(statusIndicator).toHaveClass('bg-blue-500')
  })

  it('should handle JSON string features correctly', () => {
    // ARRANGE
    const propertyWithJsonFeatures = {
      ...mockProperty,
      features: JSON.stringify(['Parking', 'Garden', 'Fireplace'])
    }
    
    // ACT
    render(<PropertyCard property={propertyWithJsonFeatures} />)
    
    // ASSERT
    // @ts-expect-error Jest DOM matchers
    expect(screen.getByText('Parking')).toBeInTheDocument()
    // @ts-expect-error Jest DOM matchers
    expect(screen.getByText('Garden')).toBeInTheDocument()
    // @ts-expect-error Jest DOM matchers
    expect(screen.getByText('Fireplace')).toBeInTheDocument()
  })

  it('should handle JSON string images correctly', () => {
    // ARRANGE
    const propertyWithJsonImages = {
      ...mockProperty,
      cover_image: null,
      images: JSON.stringify(['https://example.com/img1.jpg', 'https://example.com/img2.jpg'])
    }
    
    // ACT
    render(<PropertyCard property={propertyWithJsonImages} />)
    
    // ASSERT
    const image = screen.getByRole('img')
    // @ts-expect-error Jest DOM matchers
    expect(image).toHaveAttribute('src', expect.stringContaining('img1.jpg'))
  })


  it('should handle null features gracefully', () => {
    // ARRANGE
    const propertyWithNullFeatures = {
      ...mockProperty,
      features: null
    }
    
    // ACT
    render(<PropertyCard property={propertyWithNullFeatures} />)
    
    // ASSERT - Should not display any features
    // @ts-expect-error Jest DOM matchers
    expect(screen.queryByText('Ocean View')).not.toBeInTheDocument()
  })

  it('should handle null images gracefully', () => {
    // ARRANGE
    const propertyWithNullImages = {
      ...mockProperty,
      cover_image: null,
      images: null
    }
    
    // ACT
    render(<PropertyCard property={propertyWithNullImages} />)
    
    // ASSERT - Should use placeholder image
    const image = screen.getByRole('img')
    // @ts-expect-error Jest DOM matchers
    expect(image).toHaveAttribute('src', expect.stringContaining('sample-1.jpg'))
  })

  it('should stop event propagation when edit button is clicked', async () => {
    // ARRANGE
    const handleClick = jest.fn()
    const handleEdit = jest.fn()
    render(<PropertyCard property={mockProperty} onClick={handleClick} onEdit={handleEdit} />)
    
    // ACT
    fireEvent.click(screen.getByText('Edit'))
    
    // ASSERT
    await waitFor(() => {
      expect(handleEdit).toHaveBeenCalledWith(mockProperty)
      expect(handleClick).not.toHaveBeenCalled() // Should not trigger card click
    })
  })

  it('should show opacity for off-market properties', () => {
    // ARRANGE
    const offMarketProperty = { ...mockProperty, status: 'off-market' as const }
    
    // ACT
    render(<PropertyCard property={offMarketProperty} />)
    
    // ASSERT
    const card = screen.getByTestId('property-card-1')
    // @ts-expect-error Jest DOM matchers
    expect(card).toHaveClass('opacity-75')
  })

  it('should handle empty features array', () => {
    // ARRANGE
    const propertyWithEmptyFeatures = {
      ...mockProperty,
      features: []
    }
    
    // ACT
    render(<PropertyCard property={propertyWithEmptyFeatures} />)
    
    // ASSERT - Features section should not be rendered
    // @ts-expect-error Jest DOM matchers
    expect(screen.queryByText('Ocean View')).not.toBeInTheDocument()
    // @ts-expect-error Jest DOM matchers
    expect(screen.queryByText('+1 more')).not.toBeInTheDocument()
  })

  it('should display exactly 3 features when more than 3 exist', () => {
    // ARRANGE
    const propertyWithManyFeatures = {
      ...mockProperty,
      features: ['Feature 1', 'Feature 2', 'Feature 3', 'Feature 4', 'Feature 5'] as any
    }
    
    // ACT
    render(<PropertyCard property={propertyWithManyFeatures} />)
    
    // ASSERT
    // @ts-expect-error Jest DOM matchers
    expect(screen.getByText('Feature 1')).toBeInTheDocument()
    // @ts-expect-error Jest DOM matchers
    expect(screen.getByText('Feature 2')).toBeInTheDocument()
    // @ts-expect-error Jest DOM matchers
    expect(screen.getByText('Feature 3')).toBeInTheDocument()
    // @ts-expect-error Jest DOM matchers
    expect(screen.getByText('+2 more')).toBeInTheDocument()
    // @ts-expect-error Jest DOM matchers
    expect(screen.queryByText('Feature 4')).not.toBeInTheDocument()
  })

  it('should handle missing description', () => {
    // ARRANGE
    const propertyWithoutDescription = {
      ...mockProperty,
      description: null
    }
    
    // ACT
    render(<PropertyCard property={propertyWithoutDescription} />)
    
    // ASSERT - Should still render other elements
    // @ts-expect-error Jest DOM matchers
    expect(screen.getByText('$850,000')).toBeInTheDocument()
    // @ts-expect-error Jest DOM matchers
    expect(screen.getByText('123 Ocean Drive, Miami Beach')).toBeInTheDocument()
  })
})