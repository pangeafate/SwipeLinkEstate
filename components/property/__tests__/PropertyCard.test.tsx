// PropertyCard Component Tests
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import PropertyCard from '../components/PropertyCard'
import { PropertyStatus, type Property } from '../types'

const mockProperty: Property = {
  id: 'test-property-1',
  address: '123 Ocean Drive, Miami Beach, FL 33139',
  description: 'Beautiful oceanfront property with stunning views',
  price: 1200000,
  bedrooms: 3,
  bathrooms: 2,
  area_sqft: 1800,
  status: 'active' as PropertyStatus,
  cover_image: '/test-image.jpg',
  images: ['/test-image.jpg'] as any, // Cast to Json type
  features: ['Ocean View', 'Balcony', 'Parking'] as any, // Cast to Json type
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z'
}

describe('PropertyCard', () => {
  it('renders property information correctly', () => {
    render(<PropertyCard property={mockProperty} />)

    // Check address (should be shortened)
    expect(screen.getByText('123 Ocean Drive, Miami Beach')).toBeInTheDocument()
    
    // Check price
    expect(screen.getByText('$1,200,000')).toBeInTheDocument()
    
    // Check bedroom/bathroom info
    expect(screen.getByText('3 beds, 2 baths')).toBeInTheDocument()
    
    // Check area
    expect(screen.getByText('1,800 sq ft')).toBeInTheDocument()
    
    // Check features
    expect(screen.getByText('Ocean View')).toBeInTheDocument()
    expect(screen.getByText('Balcony')).toBeInTheDocument()
    expect(screen.getByText('Parking')).toBeInTheDocument()
    
    // Check description
    expect(screen.getByText('Beautiful oceanfront property with stunning views')).toBeInTheDocument()
  })

  it('displays correct status indicator color', () => {
    render(<PropertyCard property={mockProperty} />)
    
    const statusIndicator = screen.getByTestId('status-indicator')
    expect(statusIndicator).toHaveClass('bg-green-500') // Active status
  })

  it('calls onClick when card is clicked', () => {
    const mockOnClick = jest.fn()
    render(<PropertyCard property={mockProperty} onClick={mockOnClick} />)
    
    const card = screen.getByTestId('property-card')
    fireEvent.click(card)
    
    expect(mockOnClick).toHaveBeenCalledWith(mockProperty)
  })

  it('shows "more" indicator when there are more than 3 features', () => {
    const propertyWithManyFeatures = {
      ...mockProperty,
      features: ['Feature 1', 'Feature 2', 'Feature 3', 'Feature 4', 'Feature 5']
    }
    
    render(<PropertyCard property={propertyWithManyFeatures} />)
    
    expect(screen.getByText('+2 more')).toBeInTheDocument()
  })

  it('handles missing optional properties gracefully', () => {
    const minimalProperty: Property = {
      id: 'minimal-1',
      address: '456 Test Street',
      price: null,
      bedrooms: null,
      bathrooms: null,
      area_sqft: null,
      description: null,
      features: null,
      cover_image: null,
      images: null,
      status: 'active' as PropertyStatus,
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z'
    }
    
    render(<PropertyCard property={minimalProperty} />)
    
    // Should still render address
    expect(screen.getByText('456 Test Street')).toBeInTheDocument()
    
    // Should handle missing price gracefully
    expect(screen.getByText('Price on request')).toBeInTheDocument()
  })

  it('displays different status colors correctly', () => {
    const pendingProperty = { ...mockProperty, status: 'pending' as PropertyStatus }
    const { rerender } = render(<PropertyCard property={pendingProperty} />)
    
    let statusIndicator = screen.getByTestId('status-indicator')
    expect(statusIndicator).toHaveClass('bg-yellow-500')
    
    const soldProperty = { ...mockProperty, status: 'sold' as PropertyStatus }
    rerender(<PropertyCard property={soldProperty} />)
    
    statusIndicator = screen.getByTestId('status-indicator')
    expect(statusIndicator).toHaveClass('bg-blue-500')
  })

  it('displays off-market status color correctly', () => {
    const offMarketProperty = { ...mockProperty, status: 'off-market' as PropertyStatus }
    render(<PropertyCard property={offMarketProperty} />)
    
    const statusIndicator = screen.getByTestId('status-indicator')
    expect(statusIndicator).toHaveClass('bg-orange-500')
  })

  it('displays default status color for unknown status', () => {
    const unknownStatusProperty = { 
      ...mockProperty, 
      status: 'unknown-status' as any 
    }
    render(<PropertyCard property={unknownStatusProperty} />)
    
    const statusIndicator = screen.getByTestId('status-indicator')
    expect(statusIndicator).toHaveClass('bg-gray-400')
  })

  it('handles JSON string features correctly', () => {
    const propertyWithJsonFeatures = {
      ...mockProperty,
      features: JSON.stringify(['Parking', 'Garden', 'Pool'])
    }
    
    render(<PropertyCard property={propertyWithJsonFeatures} />)
    
    expect(screen.getByText('Parking')).toBeInTheDocument()
    expect(screen.getByText('Garden')).toBeInTheDocument()
    expect(screen.getByText('Pool')).toBeInTheDocument()
  })

  it('handles JSON string images correctly', () => {
    const propertyWithJsonImages = {
      ...mockProperty,
      cover_image: null,
      images: JSON.stringify(['https://example.com/img1.jpg', 'https://example.com/img2.jpg'])
    }
    
    render(<PropertyCard property={propertyWithJsonImages} />)
    
    const image = screen.getByRole('img')
    expect(image).toHaveAttribute('src', expect.stringContaining('img1.jpg'))
  })


  it('handles null features gracefully', () => {
    const propertyWithNullFeatures = {
      ...mockProperty,
      features: null
    }
    
    render(<PropertyCard property={propertyWithNullFeatures} />)
    
    // Should not display any features
    expect(screen.queryByText('Ocean View')).not.toBeInTheDocument()
  })

  it('handles null images gracefully', () => {
    const propertyWithNullImages = {
      ...mockProperty,
      cover_image: null,
      images: null
    }
    
    render(<PropertyCard property={propertyWithNullImages} />)
    
    // Should use placeholder image
    const image = screen.getByRole('img')
    expect(image).toHaveAttribute('src', expect.stringContaining('sample-1.jpg'))
  })

  it('handles empty features array', () => {
    const propertyWithEmptyFeatures = {
      ...mockProperty,
      features: []
    }
    
    render(<PropertyCard property={propertyWithEmptyFeatures} />)
    
    // Features section should not be rendered
    expect(screen.queryByText('Ocean View')).not.toBeInTheDocument()
  })

  it('handles empty images array', () => {
    const propertyWithEmptyImages = {
      ...mockProperty,
      cover_image: null,
      images: []
    }
    
    render(<PropertyCard property={propertyWithEmptyImages} />)
    
    // Should use placeholder image
    const image = screen.getByRole('img')
    expect(image).toHaveAttribute('src', expect.stringContaining('sample-1.jpg'))
  })

  it('does not call onClick when onClick is not provided', () => {
    render(<PropertyCard property={mockProperty} />)
    
    const card = screen.getByTestId('property-card')
    // Should not throw an error when clicked
    expect(() => {
      fireEvent.click(card)
    }).not.toThrow()
  })

  it('displays exactly 3 features when more than 3 exist', () => {
    const propertyWithManyFeatures = {
      ...mockProperty,
      features: ['Feature 1', 'Feature 2', 'Feature 3', 'Feature 4', 'Feature 5', 'Feature 6'] as any
    }
    
    render(<PropertyCard property={propertyWithManyFeatures} />)
    
    expect(screen.getByText('Feature 1')).toBeInTheDocument()
    expect(screen.getByText('Feature 2')).toBeInTheDocument()
    expect(screen.getByText('Feature 3')).toBeInTheDocument()
    expect(screen.getByText('+3 more')).toBeInTheDocument()
    expect(screen.queryByText('Feature 4')).not.toBeInTheDocument()
  })

  it('handles missing description', () => {
    const propertyWithoutDescription = {
      ...mockProperty,
      description: null
    }
    
    render(<PropertyCard property={propertyWithoutDescription} />)
    
    // Should still render other elements
    expect(screen.getByText('$1,200,000')).toBeInTheDocument()
    expect(screen.getByText('123 Ocean Drive, Miami Beach')).toBeInTheDocument()
  })

  it('uses fallback image when both cover_image and images[0] are unavailable', () => {
    const propertyWithoutImages = {
      ...mockProperty,
      cover_image: null,
      images: []
    }
    
    render(<PropertyCard property={propertyWithoutImages} />)
    
    const image = screen.getByRole('img')
    expect(image).toHaveAttribute('src', expect.stringContaining('/images/properties/sample-1.jpg'))
  })

  it('falls back to placeholder API when image fails to load', () => {
    const brokenImageProperty = {
      ...mockProperty,
      cover_image: 'https://example.com/broken.jpg',
      images: []
    }

    render(<PropertyCard property={brokenImageProperty} />)

    const image = screen.getByRole('img')
    // Simulate image load error
    fireEvent.error(image)

    expect(image).toHaveAttribute('src', expect.stringContaining('/api/placeholder/400/300'))
  })
})